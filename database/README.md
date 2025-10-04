# 🗄️ CroabBoard Database Initialization

This directory contains the database schema and initialization scripts for CroabBoard.

## 📁 Directory Structure

```
database/
├── init/                           # Docker initialization scripts
│   ├── 00-init-database.sql      # Pre-initialization setup
│   ├── 01-crobboard-schema-and-data.sql  # Complete database dump
│   └── 99-post-init.sql          # Post-initialization optimizations
├── migrations/                    # Database migration scripts (if any)
└── README.md                     # This file
```

## 🚀 How It Works

### Docker Initialization

When you start the MySQL container for the first time, Docker automatically executes all `.sql` files in the `/docker-entrypoint-initdb.d` directory in alphabetical order:

1. **`00-init-database.sql`** - Sets up basic database configuration
2. **`01-crobboard-schema-and-data.sql`** - Your complete database dump with all tables and data
3. **`99-post-init.sql`** - Performance optimizations and final setup

### Execution Order

The files are executed in alphabetical order, which is why they are prefixed with numbers:
- `00-` runs first (preparation)
- `01-` runs second (main data)
- `99-` runs last (finalization)

## 📊 Database Schema Overview

### Core Tables

| Table | Purpose | Records |
|-------|---------|---------|
| `user` | User accounts and preferences | ~10 users |
| `category` | Sound button categories | ~5 categories |
| `file` | File metadata (images/audio) | ~300 files |
| `uploaded` | Sound button definitions | ~200 buttons |
| `linked` | User's personal button collections | Variable |
| `deleted_button` | Soft delete history | Variable |
| `audit_log` | Admin action tracking | Variable |
| `favorites` | User's favorite sounds | Variable |
| `button_stats` | Usage statistics | Variable |

### Key Features

- **Full UTF-8 Support** - utf8mb4 charset for emojis and international characters
- **Foreign Key Constraints** - Data integrity enforcement
- **Indexed Tables** - Performance optimized queries
- **Audit Trail** - Complete action logging
- **Soft Deletes** - Recovery capability for deleted items

## 🔧 Manual Database Setup

If you're not using Docker, you can manually set up the database:

### 1. Create Database
```sql
CREATE DATABASE croabboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE croabboard;
```

### 2. Import Schema and Data
```bash
mysql -u root -p croabboard < database/init/01-crobboard-schema-and-data.sql
```

### 3. Run Post-Init Optimizations
```bash
mysql -u root -p croabboard < database/init/99-post-init.sql
```

## 🐳 Docker Usage

### First Time Setup
```bash
# Start with fresh database
docker-compose up -d croabboard-db

# Check initialization logs
docker-compose logs croabboard-db
```

### Reset Database
```bash
# Stop and remove database container and volume
docker-compose down
docker volume rm croabboard_database_data

# Start fresh (will re-run initialization)
docker-compose up -d croabboard-db
```

## 🔐 Default Credentials

### Database Access
- **Root Password**: Set in `.env` file (`MYSQL_ROOT_PASSWORD`)
- **App User**: Set in `.env` file (`MYSQL_USER`/`MYSQL_PASSWORD`)

### Application Admin
- **Username**: `admin` (if no users exist)
- **Password**: `admin123` (CHANGE THIS!)
- **Note**: Only created for fresh installations

## 📈 Performance Optimizations

The initialization scripts include several performance optimizations:

### Indexes
- User-specific button ordering
- Category-based filtering
- Audit log date queries
- Statistics and favorites

### MySQL Configuration
- Optimized buffer pool size
- Increased connection limits
- Query cache enabled
- UTF-8 support

## 🔍 Troubleshooting

### Common Issues

#### **Initialization Failed**
```bash
# Check MySQL logs
docker-compose logs croabboard-db

# Common causes:
# - Invalid SQL syntax in dump file
# - Permission issues
# - Insufficient disk space
```

#### **Character Encoding Issues**
```bash
# Verify charset
docker-compose exec croabboard-db mysql -u root -p -e "SHOW VARIABLES LIKE 'character_set%'"

# Should show utf8mb4 for all variables
```

#### **Performance Issues**
```bash
# Check database size
docker-compose exec croabboard-db mysql -u root -p croabboard -e "
SELECT
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'croabboard'
ORDER BY (data_length + index_length) DESC;"
```

### Data Verification

After initialization, verify your data:

```sql
-- Check table counts
SELECT
    'users' as table_name, COUNT(*) as records FROM user
UNION ALL SELECT
    'categories', COUNT(*) FROM category
UNION ALL SELECT
    'files', COUNT(*) FROM file
UNION ALL SELECT
    'buttons', COUNT(*) FROM uploaded
UNION ALL SELECT
    'links', COUNT(*) FROM linked;
```

## 🔄 Backup and Restore

### Create Backup
```bash
# Using Docker
docker-compose exec -T croabboard-db mysqldump -u root -p$MYSQL_ROOT_PASSWORD croabboard > backup_$(date +%Y%m%d).sql

# Or using deploy script
./deploy.sh backup
```

### Restore from Backup
```bash
# Stop backend
docker-compose stop croabboard-backend

# Restore database
docker-compose exec -T croabboard-db mysql -u root -p$MYSQL_ROOT_PASSWORD croabboard < backup_20240115.sql

# Restart backend
docker-compose start croabboard-backend
```

## 📝 Migration Notes

When updating your database schema:

1. **Create migration scripts** in `migrations/` directory
2. **Test on development** environment first
3. **Backup production** before applying changes
4. **Update the main dump file** after successful migration

### Example Migration Structure
```
migrations/
├── 2024-01-15_add_user_preferences.sql
├── 2024-01-20_optimize_indexes.sql
└── 2024-02-01_add_notification_system.sql
```

---

## 🤝 Contributing

When modifying database structure:

1. **Update the main dump** file (`01-crobboard-schema-and-data.sql`)
2. **Create migration script** for existing installations
3. **Update this README** with any schema changes
4. **Test with fresh Docker initialization**

---

<div align="center">

**Database initialized successfully! 🎵📊**

[Back to Main README](../README.md) • [Docker Guide](../DOCKER.md)

</div>