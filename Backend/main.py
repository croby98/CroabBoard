from datetime import datetime
from io import BytesIO
from flask import (
    Flask,
    jsonify,
    request,
    send_file,
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
from sqlalchemy import func,Enum
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os
import base64

# Load environment variables from the .env file
load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"],supports_credentials=True)
bcrypt = Bcrypt(app)
# Set a secret key and database URI from environment variables
app.secret_key = os.getenv("SECRET_KEY")
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URI")

# Initialize database
db = SQLAlchemy(app)

# Set up a login manager
login_manager = LoginManager()
login_manager.init_app(app)


# Define User model
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


# Define File model
class File(db.Model):
    __tablename__ = "file"

    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    data = db.Column(db.LargeBinary)
    type = db.Column(db.String(50), nullable=False)


# Define additional models
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
    category_id = db.Column(db.Integer, db.ForeignKey("category.id"), nullable=True)  # New column
    category = db.relationship("Category", backref="uploaded")  # Relationship with Category


class DeleteHistory(db.Model):
    __tablename__ = "deleted_button"

    id = db.Column(db.Integer, primary_key=True)
    delete_date = db.Column(db.DateTime, nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    button_name = db.Column(db.String(50), nullable=False)
    sound_file = db.Column(db.LargeBinary)
    image_file = db.Column(db.LargeBinary)
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
    """
    API endpoint to check if the user is authenticated and return user information
    """
    if current_user.is_authenticated:  # Check if the current user is logged in
        # Return user data (basic details)
        return jsonify({
            "success": True,
            "user": {
                "id": current_user.id,
                "username": current_user.username,
            }
        }), 200
    else:
        # If the user is not authenticated, return a response indicating this
        return jsonify({
            "success": False,
            "message": "User is not authenticated."
        }), 401


# API Endpoints
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


@app.route("/api/profil", methods=["GET"])
@login_required
def profil():
    uploaded_file = (
        db.session.query(
            Uploaded.image_id,
            Uploaded.sound_id,
            Uploaded.button_name,
            Uploaded.uploaded_by,
        )
        .join(User, Uploaded.uploaded_by == User.id)
        .filter(User.id == current_user.id)
        .order_by(Uploaded.id.asc())
    )

    buttons = [
        {
            "image_id": file.image_id,
            "sound_id": file.sound_id,
            "button_name": file.button_name,
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
        sound_file = File_sound_entry.data if File_sound_entry else None
        image_file = File_image_entry.data if File_image_entry else None

        save_history(delete_date, owner_id, button_name, sound_file, image_file)

        if Linked_entry:
            db.session.delete(Linked_entry)
            db.session.delete(Uploaded_entry)
            db.session.delete(File_sound_entry)
            db.session.delete(File_image_entry)
            db.session.commit()
            return jsonify({"success": True}), 200
        elif Uploaded_entry:
            db.session.delete(Uploaded_entry)
            db.session.delete(File_sound_entry)
            db.session.delete(File_image_entry)
            db.session.commit()
            return jsonify({"success": True, "message": "Deleted without linked"}), 200
        else:
            return jsonify({"success": False, "message": "Uploaded Entry not found"}), 404

    except Exception as e:
        app.logger.error(f"Error deleting from database: {e}")
        return jsonify({"success": False, "message": "Internal server error"}), 500

def save_history(delete_date,owner_id,button_name,sound_file,image_file):
    new_history = DeleteHistory(delete_date=delete_date,owner_id=owner_id,button_name=button_name,sound_file=sound_file,image_file=image_file)

    db.session.add(new_history)
    db.session.commit()

@app.route("/api/restore_from_history/<int:history_id>", methods=["POST"])
@login_required
def api_restore_from_history(history_id):
    try:
        # Fetch the entry from the DeleteHistory table
        history_entry = db.session.query(DeleteHistory).filter_by(id=history_id, owner_id=current_user.id).first()

        if not history_entry:
            return jsonify({"success": False, "message": "History entry not found"}), 404

        # Prevent restoration if the status is already 'restored'
        if history_entry.status == "restored":
            return jsonify({"success": False, "message": "This item has already been restored"}), 400

        button_name = f"_{history_entry.button_name}" if history_entry.button_name else ""

        # Restore the image and sound files
        new_image_file = File(
            filename=f"{button_name}_{history_entry.id}",
            data=history_entry.image_file,
            type="image"
        )
        new_sound_file = File(
            filename=f"{button_name}_{history_entry.id}",
            data=history_entry.sound_file,
            type="sound"
        )
        db.session.add(new_image_file)
        db.session.add(new_sound_file)
        db.session.commit()

        # Link the restored files in the Uploaded table
        uploaded_entry = Uploaded(
            image_id=new_image_file.id,
            sound_id=new_sound_file.id,
            uploaded_by=current_user.id,
            button_name=history_entry.button_name
        )
        db.session.add(uploaded_entry)
        db.session.commit()

        # Ensure proper placement in the Linked table
        max_tri = db.session.query(func.max(Linked.tri)).filter_by(user_id=current_user.id).scalar() or 0
        linked_entry = Linked(
            user_id=current_user.id,
            uploaded_id=uploaded_entry.id,
            tri=max_tri + 1  # Place at the end of the order
        )
        db.session.add(linked_entry)
        db.session.commit()

        # Update the status of the history entry to 'restored'
        history_entry.status = "restored"
        db.session.commit()

        return jsonify({"success": True, "message": "Restored successfully"}), 200

    except Exception as e:
        app.logger.error(f"Error restoring history entry with ID {history_id}: {e}")
        return jsonify({"success": False, "message": "Internal server error"}), 500

@app.route("/api/modify_image", methods=["POST"])
@login_required
def api_modify_image():
    if "image" not in request.files or "image_id" not in request.form:
        return jsonify({"success": False, "message": "Missing image or image ID"}), 400

    image_file = request.files["image"]
    image_id = request.form["image_id"]

    if image_file.filename == "":
        return jsonify({"success": False, "message": "No selected file"}), 400

    try:
        existing_image = db.session.get(File, image_id)
        if not existing_image:
            return jsonify({"success": False, "message": "Image not found"}), 404

        existing_image.data = image_file.read()
        existing_image.filename = image_file.filename
        db.session.commit()
        return jsonify({"success": True, "message": "Image successfully updated"}), 200

    except Exception as e:
        app.logger.error(f"Error modifying image: {e}")
        return jsonify({"success": False, "message": "Internal server error"}), 500


@app.route("/api/modify_sound", methods=["POST"])
@login_required
def api_modify_sound():
    if "sound" not in request.files or "sound_id" not in request.form:
        return jsonify({"success": False, "message": "Missing sound or sound ID"}), 400

    sound_file = request.files["sound"]
    sound_id = request.form["sound_id"]

    if sound_file.filename == "":
        return jsonify({"success": False, "message": "No selected file"}), 400

    try:
        existing_sound = db.session.get(File, sound_id)
        if not existing_sound:
            return jsonify({"success": False, "message": "Sound not found"}), 404

        existing_sound.data = sound_file.read()
        existing_sound.filename = sound_file.filename
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
                "sound_file": entry.sound_file.hex() if entry.sound_file else None,
                "image_file": entry.image_file.hex() if entry.image_file else None,
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
    """
    Search for buttons by category name with partial matching.
    """
    # Get the `category` parameter (or return an error if missing)
    category_name = request.args.get("category")
    if not category_name:
        return jsonify({"success": False, "message": "Category name is required"}), 400

    # Create aliases for both image and sound files to avoid ambiguity
    image_alias = db.aliased(File)
    sound_alias = db.aliased(File)

    # Define the query for partial matching
    results = (
        db.session.query(
            image_alias,            # Represents the image file
            sound_alias,            # Represents the sound file
            Uploaded,               # Uploaded entry
            Linked.tri,             # Linked tri (position/order)
            Category.name.label("category_name")  # Optional category name
        )
        .join(Uploaded, image_alias.id == Uploaded.image_id)  # Join for the image file
        .outerjoin(sound_alias, sound_alias.id == Uploaded.sound_id)  # Join for the sound file
        .join(Linked, Linked.uploaded_id == Uploaded.id)  # Join with Linked table
        .outerjoin(Category, Uploaded.category_id == Category.id)  # Optional join with Category
        .filter(Linked.user_id == current_user.id)  # Filter by current user
        .filter(Category.name.ilike(f"%{category_name}%"))  # Case-insensitive partial matching
        .order_by(Linked.tri.asc())  # Sort by Linked.tri
        .all()
    )

    # If no results are found, return a response indicating this
    if not results:
        return jsonify({"success": False, "message": "No matching buttons found"}), 404

    # Build the response data
    buttons = []
    for image_file, sound_file, uploaded, tri, category_name in results:
        buttons.append(
            {
                "image_id": image_file.id,
                "image_filename": image_file.filename,
                "sound_id": sound_file.id if sound_file else None,
                "sound_filename": sound_file.filename if sound_file else None,  # Fixing the reference
                "button_name": uploaded.button_name,
                "tri": tri,
                "category": category_name,
            }
        )

    return jsonify({"success": True, "buttons": buttons}), 200

@app.route("/api/files/<int:file_id>")
@login_required
def get_file(file_id):
    file = File.query.get_or_404(file_id)
    if file.type.startswith("sound"):
        return send_file(
            BytesIO(file.data), mimetype=f'sound/{file.type.split("/")[-1]}'
        )
    elif file.type.startswith("image"):
        return send_file(
            BytesIO(file.data), mimetype=f'image/{file.type.split("/")[-1]}'
        )
    else:
        # Handle other file types if needed
        return "Unsupported file type", 404


@app.route("/api/buttons", methods=["GET", "POST", "PUT", "DELETE"])
@login_required
def manage_buttons_api():
    """
    Manage buttons API with categories:
    - GET: List buttons (optionally filtered by category).
    - POST: Add new buttons (assign category with uploaded image, sound, and button name).
    - PUT: Update button order (tri positions) or change button details (e.g., category).
    - DELETE: Remove buttons.
    """
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
    """
    Fetch buttons with optional category filtering, including related sound files.
    """
    # Optional category filter
    category_name = request.args.get("category")

    # Subquery to get the most recent uploaded file based on sound_id and image_id
    subquery = (
        db.session.query(func.max(Uploaded.id).label("max_id"))
        .group_by(Uploaded.sound_id, Uploaded.image_id)
        .subquery()
    )

    # Create aliases for both image and sound to avoid ambiguity
    image_alias = db.aliased(File)
    sound_alias = db.aliased(File)

    # Build the query for buttons
    buttons_query = (
        db.session.query(
            image_alias,
            Uploaded,
            Linked.tri,
            Category.name.label("category_name"),
            sound_alias
        )
        .join(Uploaded, image_alias.id == Uploaded.image_id)  # Join for image file
        .join(Linked, Linked.uploaded_id == Uploaded.id)  # Join with Linked table
        .join(subquery, subquery.c.max_id == Uploaded.id)  # Apply subquery for recent uploads
        .outerjoin(Category, Uploaded.category_id == Category.id)  # Optionally join with Category
        .outerjoin(sound_alias, sound_alias.id == Uploaded.sound_id)  # Outer join for sound file
        .filter(Linked.user_id == current_user.id)  # Filter by current user
        .filter(image_alias.type == "image")  # Filter to include only images as buttons
        .order_by(Linked.tri.asc())  # Order by `tri`
    )

    # Apply category filter if provided
    if category_name:
        buttons_query = buttons_query.filter(Category.name == category_name)

    results = buttons_query.all()

    # Get user's button size
    btn_size = db.session.query(User.btn_size).filter(User.id == current_user.id).scalar()

    # Build the response data
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
                "category": category,
            }
        )

    return jsonify({"success": True, "buttons": buttons, "btn_size": btn_size}), 200

def add_button_with_category():
    """
    Add a new button with an optional category, image, sound, and button name.
    """
    if "image" not in request.files or "sound" not in request.files or "ButtonName" not in request.form:
        return jsonify({"success": False, "message": "Required data missing"}), 400

    image_file = request.files["image"]
    sound_file = request.files["sound"]
    button_name = request.form["ButtonName"]
    category_name = request.form.get("CategoryName")

    if not image_file.filename or not sound_file.filename or not button_name:
        return jsonify({"success": False, "message": "Incomplete data"}), 400

    # Save image and sound files in the database
    new_image_file = File(filename=image_file.filename, data=image_file.read(), type="image")
    new_sound_file = File(filename=sound_file.filename, data=sound_file.read(), type="sound")
    db.session.add(new_image_file)
    db.session.add(new_sound_file)
    db.session.commit()

    # Get the category ID (create a category if it doesn't exist)
    category_id = None
    if category_name:
        category = Category.query.filter_by(name=category_name).first()
        if not category:
            category = Category(name=category_name)
            db.session.add(category)
            db.session.commit()
        category_id = category.id

    # Get the max `tri` value and increment for ordering
    max_tri = db.session.query(func.max(Linked.tri)).filter(Linked.user_id == current_user.id).scalar() or 0

    # Add button to Uploaded table
    new_uploaded = Uploaded(
        image_id=new_image_file.id,
        sound_id=new_sound_file.id,
        uploaded_by=current_user.id,
        button_name=button_name,
        category_id=category_id  # Assign category
    )
    db.session.add(new_uploaded)
    db.session.commit()

    # Add entry to the Linked table
    new_linked = Linked(user_id=current_user.id, uploaded_id=new_uploaded.id, tri=max_tri + 1)
    db.session.add(new_linked)
    db.session.commit()

    return jsonify({"success": True, "message": "Button added successfully"}), 201

def update_button_positions_or_category():
    """
    Update button `tri` positions or change the assigned category.
    """
    data = request.get_json()

    if "positions" in data:
        # Update tri positions
        return update_button_positions(data["positions"])

    elif "button_id" in data and "category_name" in data:
        # Change the category assignment for a button
        button_id = data["button_id"]
        category_name = data["category_name"]

        button = Uploaded.query.get(button_id)
        if not button:
            return jsonify({"success": False, "message": "Button not found"}), 404

        # Find or create the new category
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
    """
    Update the button `tri` (position/order) for a specific user.
    This function assumes `positions` contains a list of objects with the following structure:
    [
        {"id": <Uploaded ID>, "new_position": <new `tri` value>}
    ]
    """
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

            # Find the linked entry corresponding to the `Uploaded` ID and current user
            linked_entry = (
                db.session.query(Linked)
                .join(Uploaded, Linked.uploaded_id == Uploaded.id)
                .filter(Linked.user_id == current_user.id, Linked.uploaded_id == uploaded_id)
                .first()
            )

            if linked_entry:
                # Update the `tri` (position)
                linked_entry.tri = new_position
            else:
                return jsonify(
                    {"success": False, "message": f"Linked entry not found for item ID {uploaded_id}"}
                ), 404

        # Commit the changes after all items are processed
        db.session.commit()
        return jsonify({"success": True, "message": "Positions updated successfully"}), 200

    except Exception as e:
        app.logger.error(f"Error updating positions: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

def delete_button():
    """
    Delete a button by its image ID.
    """
    button_id = request.args.get("button_id", type=int)
    if not button_id:
        return jsonify({"success": False, "message": "Button ID is required"}), 400

    button = Uploaded.query.get(button_id)
    if not button:
        return jsonify({"success": False, "message": "Button not found"}), 404

    try:
        # Remove Linked entry (ordering)
        linked_entry = Linked.query.filter_by(uploaded_id=button.id, user_id=current_user.id).first()
        if linked_entry:
            db.session.delete(linked_entry)

        # Remove Uploaded entry (button record)
        db.session.delete(button)
        db.session.commit()

        return jsonify({"success": True, "message": "Button deleted successfully"}), 200

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# Dashboard

@app.route("/api/dashboard", methods=["GET", "POST", "PUT", "DELETE"])
@login_required
def dashboard():
    """
    Multipurpose dashboard route to manage Users, Categories, and Buttons.
    Supports CRUD operations.
    """
    # Determine the operation target from query params or JSON body
    resource = request.args.get("resource") or request.json.get("resource")  # Example: 'user', 'category', 'button'

    if resource == "user":
        return manage_users()
    elif resource == "category":
        return manage_categories()
    elif resource == "button":
        return manage_buttons()
    else:
        return jsonify({"success": False, "message": "Invalid resource type"}), 400

def manage_users():
    """CRUD operations for users."""
    if request.method == "GET":
        # List all users (Admin operation)
        users = User.query.all()
        users_data = [
            {
                "id": user.id,
                "username": user.username,
                "btn_size": user.btn_size,
            }
            for user in users
        ]
        return jsonify({"success": True, "users": users_data}), 200

    elif request.method == "POST":
        # Create a new user
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return jsonify({"success": False, "message": "Username and password are required"}), 400

        if User.query.filter_by(username=username).first():
            return jsonify({"success": False, "message": "User already exists"}), 400

        new_user = User(username=username, btn_size=150)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"success": True, "message": "User created successfully"}), 201

    elif request.method == "PUT":
        # Update a user
        data = request.get_json()
        user_id = data.get("id")
        new_username = data.get("username")
        new_password = data.get("password")

        # Find the user
        user = User.query.get(user_id)
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404

        if new_username:
            user.username = new_username
        if new_password:
            user.set_password(new_password)

        db.session.commit()
        return jsonify({"success": True, "message": "User updated successfully"}), 200

    elif request.method == "DELETE":
        # Delete a user
        user_id = request.args.get("id")
        user = User.query.get(user_id)

        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404

        db.session.delete(user)
        db.session.commit()
        return jsonify({"success": True, "message": "User deleted successfully"}), 200

    else:
        return jsonify({"success": False, "message": "Invalid HTTP method"}), 405

def manage_categories():
    """CRUD operations for categories."""
    if request.method == "GET":
        # List all categories
        categories = Category.query.all()
        categories_data = [{"id": cat.id, "name": cat.name} for cat in categories]
        return jsonify({"success": True, "categories": categories_data}), 200

    elif request.method == "POST":
        # Create a new category
        data = request.get_json()
        category_name = data.get("name")

        if not category_name:
            return jsonify({"success": False, "message": "Category name is required"}), 400

        if Category.query.filter_by(name=category_name).first():
            return jsonify({"success": False, "message": "Category already exists"}), 400

        new_category = Category(name=category_name)
        db.session.add(new_category)
        db.session.commit()
        return jsonify({"success": True, "message": "Category created successfully"}), 201

    elif request.method == "PUT":
        # Update a category
        data = request.get_json()
        category_id = data.get("id")
        new_name = data.get("name")

        category = Category.query.get(category_id)
        if not category:
            return jsonify({"success": False, "message": "Category not found"}), 404

        category.name = new_name
        db.session.commit()
        return jsonify({"success": True, "message": "Category updated successfully"}), 200

    elif request.method == "DELETE":
        # Delete a category
        category_id = request.args.get("id")
        category = Category.query.get(category_id)

        if not category:
            return jsonify({"success": False, "message": "Category not found"}), 404

        # Ensure no buttons are linked to the category
        if Uploaded.query.filter_by(category_id=category.id).first():
            return jsonify({"success": False, "message": "Category linked to buttons"}), 400

        db.session.delete(category)
        db.session.commit()
        return jsonify({"success": True, "message": "Category deleted successfully"}), 200

    else:
        return jsonify({"success": False, "message": "Invalid HTTP method"}), 405

def manage_buttons():
    """CRUD operations for buttons (Uploaded table)."""
    if request.method == "GET":
        # List all buttons
        buttons = Uploaded.query.all()
        buttons_data = [
            {
                "id": button.id,
                "button_name": button.button_name,
                "category_id": button.category_id,
                "uploaded_by": button.uploaded_by,
            }
            for button in buttons
        ]
        return jsonify({"success": True, "buttons": buttons_data}), 200

    elif request.method == "POST":
        # Create a new button
        data = request.get_json()
        button_name = data.get("button_name")
        category_id = data.get("category_id")
        image_id = data.get("image_id")
        sound_id = data.get("sound_id")

        if not button_name or not image_id or not sound_id:
            return jsonify({"success": False, "message": "Incomplete data for button creation"}), 400

        # Check if a category exists
        if category_id and not Category.query.get(category_id):
            return jsonify({"success": False, "message": "Category not found"}), 404

        new_button = Uploaded(
            button_name=button_name,
            category_id=category_id,
            uploaded_by=current_user.id,
            image_id=image_id,
            sound_id=sound_id,
        )
        db.session.add(new_button)
        db.session.commit()
        return jsonify({"success": True, "message": "Button created successfully"}), 201

    elif request.method == "PUT":
        # Update a button
        data = request.get_json()
        button_id = data.get("id")
        new_name = data.get("button_name")
        new_category_id = data.get("category_id")

        button = Uploaded.query.get(button_id)
        if not button:
            return jsonify({"success": False, "message": "Button not found"}), 404

        if new_name:
            button.button_name = new_name

        if new_category_id:
            if not Category.query.get(new_category_id):
                return jsonify({"success": False, "message": "Category not found"}), 404
            button.category_id = new_category_id

        db.session.commit()
        return jsonify({"success": True, "message": "Button updated successfully"}), 200

    elif request.method == "DELETE":
        # Delete a button
        button_id = request.args.get("id")
        button = Uploaded.query.get(button_id)

        if not button:
            return jsonify({"success": False, "message": "Button not found"}), 404

        db.session.delete(button)
        db.session.commit()
        return jsonify({"success": True, "message": "Button deleted successfully"}), 200

    else:
        return jsonify({"success": False, "message": "Invalid HTTP method"}), 405

if __name__ == "__main__":
    with app.app_context():
        app.run(host="0.0.0.0", port=5000, debug=True)