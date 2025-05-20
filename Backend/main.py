from datetime import datetime
from io import BytesIO
from flask import (
    Flask,
    jsonify,
    request,
    send_file,
    send_from_directory,
    make_response,
)
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_login import (
    LoginManager,
    UserMixin,
    login_user,
    logout_user,
    login_required,
    current_user,
)
from sqlalchemy import func, Enum
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os
import uuid
from werkzeug.utils import secure_filename

# Constants
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
IMAGE_FOLDER = os.path.join(UPLOAD_FOLDER, 'images')
AUDIO_FOLDER = os.path.join(UPLOAD_FOLDER, 'audio')
os.makedirs(IMAGE_FOLDER, exist_ok=True)
os.makedirs(AUDIO_FOLDER, exist_ok=True)

# Load environment variables from the .env file
load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)
bcrypt = Bcrypt(app)
app.secret_key = os.getenv("SECRET_KEY")
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URI")
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
db = SQLAlchemy(app)

login_manager = LoginManager()
login_manager.init_app(app)

def save_file_to_disk(file_storage, file_type, button_name):
    ext = os.path.splitext(file_storage.filename)[1]
    safe_button_name = "".join(c if c.isalnum() or c in (' ', '-', '_') else '_' for c in button_name).strip().replace(' ', '_')
    filename = f"{safe_button_name}_{uuid.uuid4().hex}{ext}"
    if file_type == "image":
        folder = IMAGE_FOLDER
    elif file_type == "sound":
        folder = AUDIO_FOLDER
    else:
        folder = UPLOAD_FOLDER
    os.makedirs(folder, exist_ok=True)
    filepath = os.path.join(folder, filename)
    file_storage.save(filepath)
    return filename

def delete_file_from_disk(filename, file_type):
    if file_type == "image":
        folder = IMAGE_FOLDER
    elif file_type == "sound":
        folder = AUDIO_FOLDER
    else:
        folder = UPLOAD_FOLDER
    try:
        os.remove(os.path.join(folder, filename))
    except FileNotFoundError:
        pass

# Models
class User(UserMixin, db.Model):
    __tablename__ = "user"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    btn_size = db.Column(db.Integer, nullable=False)

    def set_password(self, password):
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)

class File(db.Model):
    __tablename__ = "file"
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # "image" or "sound"

class Linked(db.Model):
    __tablename__ = "linked"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    uploaded_id = db.Column(db.Integer, db.ForeignKey("uploaded.id"))
    tri = db.Column(db.Integer, nullable=False)
    uploaded = db.relationship("Uploaded", backref="linked")
    user = db.relationship("User", backref="linked")

class Uploaded(db.Model):
    __tablename__ = "uploaded"
    id = db.Column(db.Integer, primary_key=True)
    image_id = db.Column(db.Integer, db.ForeignKey("file.id"))
    sound_id = db.Column(db.Integer, db.ForeignKey("file.id"))
    uploaded_by = db.Column(db.Integer, db.ForeignKey("user.id"))
    button_name = db.Column(db.String(50), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey("category.id"), nullable=True)
    category = db.relationship("Category", backref="uploaded")

class DeleteHistory(db.Model):
    __tablename__ = "deleted_button"
    id = db.Column(db.Integer, primary_key=True)
    delete_date = db.Column(db.DateTime, nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    button_name = db.Column(db.String(50), nullable=False)
    sound_filename = db.Column(db.String(255))
    image_filename = db.Column(db.String(255))
    status = db.Column(Enum("deleted", "restored", name="delete_status"), nullable=False, default="deleted")

class Category(db.Model):
    __tablename__ = "category"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    color = db.Column(db.String(50), nullable=True)

@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))

@app.route("/api/me", methods=["GET"])
def get_current_user():
    if current_user.is_authenticated:
        return jsonify({
            "success": True,
            "user": {
                "id": current_user.id,
                "username": current_user.username,
            }
        }), 200
    else:
        return jsonify({
            "success": False,
            "message": "User is not authenticated."
        }), 401

@app.route("/api/index", methods=["GET"])
@login_required
def index():
    linked_files = (
        db.session.query(
            Uploaded.image_id,
            Uploaded.sound_id,
            Uploaded.button_name,
            Linked.tri,
            Category.name.label("category_name"),
        )
        .join(Linked, Uploaded.id == Linked.uploaded_id)
        .join(User, Linked.user_id == User.id)
        .filter(User.id == current_user.id)
        .order_by(Linked.tri.asc())
        .distinct()
        .all()
    )

    btn_size = db.session.query(User.btn_size).filter(User.id == current_user.id).scalar()
    buttons = [
        {
            "image_id": linked_file.image_id,
            "sound_id": linked_file.sound_id,
            "button_name": linked_file.button_name,
            "tri": linked_file.tri,
            "category": linked_file.category_name,
        }
        for linked_file in linked_files
    ]
    return jsonify({"success": True, "buttons": buttons, "btn_size": btn_size})

@app.route("/api/delete_image/<int:image_id>", methods=["DELETE"])
@login_required
def delete_image(image_id):
    try:
        Uploaded_entry = db.session.query(Uploaded.id).filter_by(image_id=image_id).distinct().first()
        linked_entry = Linked.query.filter_by(uploaded_id=Uploaded_entry.id, user_id=current_user.id).first()

        if linked_entry:
            db.session.delete(linked_entry)
            db.session.commit()
            return jsonify({"success": True, "message": "Image deleted successfully"}), 200
        else:
            return jsonify({"success": False, "message": "Linked entry not found"}), 404

    except Exception as e:
        app.logger.error(f"Error deleting image: {e}")
        return jsonify({"success": False, "message": "Internal server error"}), 500

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not password:
        return jsonify({"success": False, "message": "Password is missing"}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({"success": False, "message": "Username already exists"}), 400

    new_user = User(username=username, btn_size=150)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"success": True, "message": "User registered successfully"}), 201

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        login_user(user)
        return jsonify({"success": True, "message": "Logged in successfully"}), 200
    else:
        return jsonify({"success": False, "message": "Invalid username or password"}), 401

@app.route("/api/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"success": True, "message": "Logged out successfully"}), 200

@app.route("/api/home", methods=["GET"])
@login_required
def profil():
    File2 = db.aliased(File)  # <-- Define alias first!
    uploaded_file = (
        db.session.query(
            Uploaded.image_id,
            Uploaded.sound_id,
            Uploaded.button_name,
            Uploaded.uploaded_by,
            File.filename.label("image_filename"),
            File2.filename.label("sound_filename"),
            Category.color.label("category_color"),
        )
        .join(File, Uploaded.image_id == File.id)
        .outerjoin(File2, Uploaded.sound_id == File2.id)
        .outerjoin(Category, Uploaded.category_id == Category.id)
        .filter(Uploaded.uploaded_by == current_user.id)
        .order_by(Uploaded.id.asc())
    )

    buttons = [
        {
            "image_id": file.image_id,
            "sound_id": file.sound_id,
            "button_name": file.button_name,
            "image_filename": file.image_filename,
            "sound_filename": file.sound_filename,
            "category_color": file.category_color,
        }
        for file in uploaded_file
    ]

    btn_size = db.session.query(User.btn_size).filter(User.id == current_user.id).scalar()
    return jsonify({"success": True, "buttons": buttons, "btn_size": btn_size})

@app.route("/api/button_size/<int:btn_size>", methods=["POST"])
@login_required
def api_button_size(btn_size):
    try:
        user = db.session.query(User).filter_by(username=current_user.username).first()
        user.btn_size = btn_size
        db.session.commit()
        return jsonify({"success": True}), 200
    except Exception as e:
        app.logger.error(f"Error updating button size: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

@app.route("/api/reset_password", methods=["POST"])
@login_required
def api_reset_password():
    data = request.get_json()
    password = data.get("password")
    confirm_password = data.get("confirmPassword")

    if not password or not confirm_password:
        return jsonify({"success": False, "message": "Passwords are required"}), 400

    if password != confirm_password:
        return jsonify({"success": False, "message": "Passwords do not match"}), 400

    try:
        user = db.session.query(User).filter_by(username=current_user.username).first()
        user.set_password(password)
        db.session.commit()
        return jsonify({"success": True, "message": "Password updated successfully"}), 200
    except Exception as e:
        app.logger.error(f"Error resetting password: {e}")
        return jsonify({"success": False, "message": "Internal server error"}), 500

@app.route("/api/delete_from_bdd/<int:image_id>/<int:sound_id>", methods=["DELETE"])
@login_required
def api_delete_from_bdd(image_id, sound_id):
    try:
        Uploaded_entry = db.session.query(Uploaded).filter_by(image_id=image_id).first()
        Linked_entry = Linked.query.filter_by(uploaded_id=Uploaded_entry.id).first()
        File_sound_entry = db.session.query(File).filter_by(id=sound_id).first()
        File_image_entry = db.session.query(File).filter_by(id=image_id).first()

        delete_date = datetime.now()
        owner_id = current_user.id
        button_name = Uploaded_entry.button_name if Uploaded_entry else None
        sound_filename = File_sound_entry.filename if File_sound_entry else None
        image_filename = File_image_entry.filename if File_image_entry else None

        save_history(delete_date, owner_id, button_name, sound_filename, image_filename)

        if Linked_entry:
            db.session.delete(Linked_entry)
            db.session.delete(Uploaded_entry)
            delete_file_from_disk(File_sound_entry.filename, "sound")
            db.session.delete(File_sound_entry)
            delete_file_from_disk(File_image_entry.filename, "image")
            db.session.delete(File_image_entry)
            db.session.commit()
            return jsonify({"success": True}), 200
        elif Uploaded_entry:
            db.session.delete(Uploaded_entry)
            delete_file_from_disk(File_sound_entry.filename, "sound")
            db.session.delete(File_sound_entry)
            delete_file_from_disk(File_image_entry.filename, "image")
            db.session.delete(File_image_entry)
            db.session.commit()
            return jsonify({"success": True, "message": "Deleted without linked"}), 200
        else:
            return jsonify({"success": False, "message": "Uploaded Entry not found"}), 404

    except Exception as e:
        app.logger.error(f"Error deleting from database: {e}")
        return jsonify({"success": False, "message": "Internal server error"}), 500

def save_history(delete_date, owner_id, button_name, sound_filename, image_filename):
    new_history = DeleteHistory(
        delete_date=delete_date,
        owner_id=owner_id,
        button_name=button_name,
        sound_filename=sound_filename,
        image_filename=image_filename
    )
    db.session.add(new_history)
    db.session.commit()

@app.route("/api/restore_from_history/<int:history_id>", methods=["POST"])
@login_required
def api_restore_from_history(history_id):
    try:
        history_entry = db.session.query(DeleteHistory).filter_by(id=history_id, owner_id=current_user.id).first()
        if not history_entry:
            return jsonify({"success": False, "message": "History entry not found"}), 404
        if history_entry.status == "restored":
            return jsonify({"success": False, "message": "This item has already been restored"}), 400

        button_name = f"_{history_entry.button_name}" if history_entry.button_name else ""
        # Restore the image and sound files (just re-add File entries, files must exist on disk)
        new_image_file = File(
            filename=history_entry.image_filename,
            type="image"
        )
        new_sound_file = File(
            filename=history_entry.sound_filename,
            type="sound"
        )
        db.session.add(new_image_file)
        db.session.add(new_sound_file)
        db.session.commit()

        uploaded_entry = Uploaded(
            image_id=new_image_file.id,
            sound_id=new_sound_file.id,
            uploaded_by=current_user.id,
            button_name=history_entry.button_name
        )
        db.session.add(uploaded_entry)
        db.session.commit()

        max_tri = db.session.query(func.max(Linked.tri)).filter_by(user_id=current_user.id).scalar() or 0
        linked_entry = Linked(
            user_id=current_user.id,
            uploaded_id=uploaded_entry.id,
            tri=max_tri + 1
        )
        db.session.add(linked_entry)
        db.session.commit()

        history_entry.status = "restored"
        db.session.commit()

        return jsonify({"success": True, "message": "Restored successfully"}), 200

    except Exception as e:
        app.logger.error(f"Error restoring history entry with ID {history_id}: {e}")
        return jsonify({"success": False, "message": "Internal server error"}), 500

@app.route("/api/modify_image", methods=["POST"])
@login_required
def api_modify_image():
    if "image" not in request.files or "image_id" not in request.form or "ButtonName" not in request.form:
        return jsonify({"success": False, "message": "Missing image, image ID, or button name"}), 400

    image_file = request.files["image"]
    image_id = request.form["image_id"]
    button_name = request.form["ButtonName"]

    if image_file.filename == "":
        return jsonify({"success": False, "message": "No selected file"}), 400

    try:
        existing_image = db.session.get(File, image_id)
        if not existing_image:
            return jsonify({"success": False, "message": "Image not found"}), 404

        # Delete old file from disk
        delete_file_from_disk(existing_image.filename, "image")
        # Save new file to disk
        new_filename = save_file_to_disk(image_file, "image", button_name)
        existing_image.filename = new_filename
        db.session.commit()
        return jsonify({"success": True, "message": "Image successfully updated"}), 200

    except Exception as e:
        app.logger.error(f"Error modifying image: {e}")
        return jsonify({"success": False, "message": "Internal server error"}), 500

@app.route("/api/modify_sound", methods=["POST"])
@login_required
def api_modify_sound():
    if "sound" not in request.files or "sound_id" not in request.form or "ButtonName" not in request.form:
        return jsonify({"success": False, "message": "Missing sound, sound ID, or button name"}), 400

    sound_file = request.files["sound"]
    sound_id = request.form["sound_id"]
    button_name = request.form["ButtonName"]

    if sound_file.filename == "":
        return jsonify({"success": False, "message": "No selected file"}), 400

    try:
        existing_sound = db.session.get(File, sound_id)
        if not existing_sound:
            return jsonify({"success": False, "message": "Sound not found"}), 404

        delete_file_from_disk(existing_sound.filename, "sound")
        new_filename = save_file_to_disk(sound_file, "sound", button_name)
        existing_sound.filename = new_filename
        db.session.commit()
        return jsonify({"success": True, "message": "Sound successfully updated"}), 200

    except Exception as e:
        app.logger.error(f"Error modifying sound: {e}")
        return jsonify({"success": False, "message": "Internal server error"}), 500

@app.route("/api/modify_button_name", methods=["POST"])
@login_required
def api_modify_button_name():
    data = request.get_json()
    button_name = data.get("ButtonName")
    image_id = data.get("image_id")

    if not button_name or not image_id:
        return jsonify({"success": False, "message": "Button name and image ID are required"}), 400

    try:
        existing_button_name = db.session.query(Uploaded).filter_by(image_id=image_id).first()
        if not existing_button_name:
            return jsonify({"success": False, "message": "Button entry not found"}), 404

        existing_button_name.button_name = button_name
        db.session.commit()
        return jsonify({"success": True, "message": "Button name updated successfully"}), 200

    except Exception as e:
        app.logger.error(f"Error modifying button name: {e}")
        return jsonify({"success": False, "message": "Internal server error"}), 500

@app.route("/api/deleted_history", methods=["GET"])
@login_required
def api_deleted_history():
    try:
        history = (
            db.session.query(DeleteHistory)
            .filter_by(owner_id=current_user.id)
            .order_by(DeleteHistory.delete_date.desc())
            .all()
        )

        history_data = [
            {
                "delete_date": entry.delete_date,
                "button_name": entry.button_name,
                "status": entry.status,
                "sound_filename": entry.sound_filename,
                "image_filename": entry.image_filename,
            }
            for entry in history
        ]
        return jsonify({"success": True, "history": history_data}), 200

    except Exception as e:
        app.logger.error(f"Error fetching deleted history: {e}")
        return jsonify({"success": False, "message": "Internal server error"}), 500

@app.route("/api/search", methods=["GET"])
@login_required
def search_buttons():
    category_name = request.args.get("category")
    if not category_name:
        return jsonify({"success": False, "message": "Category name is required"}), 400

    image_alias = db.aliased(File)
    sound_alias = db.aliased(File)

    results = (
        db.session.query(
            image_alias,
            sound_alias,
            Uploaded,
            Linked.tri,
            Category.name.label("category_name")
        )
        .join(Uploaded, image_alias.id == Uploaded.image_id)
        .outerjoin(sound_alias, sound_alias.id == Uploaded.sound_id)
        .join(Linked, Linked.uploaded_id == Uploaded.id)
        .outerjoin(Category, Uploaded.category_id == Category.id)
        .filter(Linked.user_id == current_user.id)
        .filter(Category.name.ilike(f"%{category_name}%"))
        .order_by(Linked.tri.asc())
        .all()
    )

    if not results:
        return jsonify({"success": False, "message": "No matching buttons found"}), 404

    buttons = []
    for image_file, sound_file, uploaded, tri, category_name in results:
        buttons.append(
            {
                "image_id": image_file.id,
                "image_filename": image_file.filename,
                "sound_id": sound_file.id if sound_file else None,
                "sound_filename": sound_file.filename if sound_file else None,
                "button_name": uploaded.button_name,
                "tri": tri,
                "category": category_name,
            }
        )

    return jsonify({"success": True, "buttons": buttons}), 200

@app.route("/api/files/<file_type>/<filename>")
@login_required
def get_file(file_type, filename):
    if file_type == "image":
        folder = IMAGE_FOLDER
    elif file_type == "sound":
        folder = AUDIO_FOLDER
    else:
        return "Invalid file type", 404
    response = make_response(send_from_directory(folder, filename))
    response.headers["Cache-Control"] = "public, max-age=86400"
    return response

@app.route("/api/buttons", methods=["GET", "POST", "PUT", "DELETE"])
@login_required
def manage_buttons_api():
    if request.method == "GET":
        return fetch_buttons()
    elif request.method == "POST":
        return add_button_with_category()
    elif request.method == "PUT":
        return update_button_positions_or_category()
    elif request.method == "DELETE":
        return delete_button()
    else:
        return jsonify({"success": False, "message": "Invalid HTTP method"}), 405

def fetch_buttons():
    subquery = (
        db.session.query(func.max(Uploaded.id).label("max_id"))
        .group_by(Uploaded.sound_id, Uploaded.image_id)
        .subquery()
    )

    image_alias = db.aliased(File)
    sound_alias = db.aliased(File)

    buttons_query = (
        db.session.query(
            image_alias,
            Uploaded,
            Linked.tri,
            Category,
            sound_alias
        )
        .join(Uploaded, image_alias.id == Uploaded.image_id)
        .join(Linked, Linked.uploaded_id == Uploaded.id)
        .join(subquery, subquery.c.max_id == Uploaded.id)
        .outerjoin(Category, Uploaded.category_id == Category.id)
        .outerjoin(sound_alias, sound_alias.id == Uploaded.sound_id)
        .filter(Linked.user_id == current_user.id)
        .filter(image_alias.type == "image")
        .order_by(Linked.tri.asc())
    )
    results = buttons_query.all()

    btn_size = db.session.query(User.btn_size).filter(User.id == current_user.id).scalar()

    buttons = []
    for image_file, uploaded, tri, category, sound_file in results:
        buttons.append(
            {
                "image_id": image_file.id,
                "image_filename": image_file.filename,
                "sound_id": sound_file.id if sound_file else None,
                "sound_filename": sound_file.filename if sound_file else None,
                "button_name": uploaded.button_name,
                "tri": tri,
                "category": category.name if category else None,
                "category_color": category.color if category else None,
            }
        )

    return jsonify({"success": True, "buttons": buttons, "btn_size": btn_size}), 200

def add_button_with_category():
    if "image" not in request.files or "sound" not in request.files or "ButtonName" not in request.form:
        return jsonify({"success": False, "message": "Required data missing"}), 400

    image_file = request.files["image"]
    sound_file = request.files["sound"]
    button_name = request.form["ButtonName"]
    category_name = request.form.get("CategoryName")

    if not image_file.filename or not sound_file.filename or not button_name:
        return jsonify({"success": False, "message": "Incomplete data"}), 400

    image_filename = save_file_to_disk(image_file, "image", button_name)
    sound_filename = save_file_to_disk(sound_file, "sound", button_name)

    new_image_file = File(filename=image_filename, type="image")
    new_sound_file = File(filename=sound_filename, type="sound")
    db.session.add(new_image_file)
    db.session.add(new_sound_file)
    db.session.commit()

    category_id = None
    if category_name:
        category = Category.query.filter_by(name=category_name).first()
        if not category:
            category = Category(name=category_name)
            db.session.add(category)
            db.session.commit()
        category_id = category.id

    max_tri = db.session.query(func.max(Linked.tri)).filter(Linked.user_id == current_user.id).scalar() or 0

    new_uploaded = Uploaded(
        image_id=new_image_file.id,
        sound_id=new_sound_file.id,
        uploaded_by=current_user.id,
        button_name=button_name,
        category_id=category_id
    )
    db.session.add(new_uploaded)
    db.session.commit()

    new_linked = Linked(user_id=current_user.id, uploaded_id=new_uploaded.id, tri=max_tri + 1)
    db.session.add(new_linked)
    db.session.commit()

    return jsonify({"success": True, "message": "Button added successfully"}), 201

def update_button_positions_or_category():
    data = request.get_json()

    if "positions" in data:
        return update_button_positions(data["positions"])
    elif "button_id" in data and "category_name" in data:
        button_id = data["button_id"]
        category_name = data["category_name"]

        button = Uploaded.query.get(button_id)
        if not button:
            return jsonify({"success": False, "message": "Button not found"}), 404

        category = Category.query.filter_by(name=category_name).first()
        if not category:
            category = Category(name=category_name)
            db.session.add(category)
            db.session.commit()

        button.category_id = category.id
        db.session.commit()

        return jsonify({"success": True, "message": "Button updated successfully"}), 200

    else:
        return jsonify({"success": False, "message": "Invalid request data"}), 400

def update_button_positions(positions):
    try:
        for item in positions:
            uploaded_id = item.get("id")
            new_position = item.get("new_position")

            if not uploaded_id or new_position is None:
                return (
                    jsonify(
                        {"success": False, "message": "ID and position are required for all items"}
                    ),
                    400,
                )

            linked_entry = (
                db.session.query(Linked)
                .join(Uploaded, Linked.uploaded_id == Uploaded.id)
                .filter(Linked.user_id == current_user.id, Linked.uploaded_id == uploaded_id)
                .first()
            )

            if linked_entry:
                linked_entry.tri = new_position
            else:
                return jsonify(
                    {"success": False, "message": f"Linked entry not found for item ID {uploaded_id}"}
                ), 404

        db.session.commit()
        return jsonify({"success": True, "message": "Positions updated successfully"}), 200

    except Exception as e:
        app.logger.error(f"Error updating positions: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

def delete_button():
    button_id = request.args.get("button_id", type=int)
    if not button_id:
        return jsonify({"success": False, "message": "Button ID is required"}), 400

    button = Uploaded.query.get(button_id)
    if not button:
        return jsonify({"success": False, "message": "Button not found"}), 404

    try:
        linked_entry = Linked.query.filter_by(uploaded_id=button.id, user_id=current_user.id).first()
        if linked_entry:
            db.session.delete(linked_entry)

        db.session.delete(button)
        db.session.commit()

        return jsonify({"success": True, "message": "Button deleted successfully"}), 200

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# Dashboard and management endpoints remain unchanged

if __name__ == "__main__":
    with app.app_context():
        app.run(host="0.0.0.0", port=5000, debug=True)
