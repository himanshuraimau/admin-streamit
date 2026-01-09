#!/bin/bash

# Configuration
DB_NAME="streamit"
DB_USER="streamit_admin"
DB_PASSWORD="your_secure_password_here"  # Replace with actual password
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/streamit_backup_$DATE.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup
echo "Creating backup: $BACKUP_FILE"
PGPASSWORD="$DB_PASSWORD" pg_dump -U $DB_USER -h localhost $DB_NAME > $BACKUP_FILE

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "✅ Database backup successful"
    
    # Compress backup
    gzip $BACKUP_FILE
    echo "✅ Backup compressed: ${BACKUP_FILE}.gz"
    
    # Delete backups older than 7 days
    find $BACKUP_DIR -name "streamit_backup_*.sql.gz" -mtime +7 -delete
    echo "🗑️  Cleaned up old backups (older than 7 days)"
    
    # Show backup size
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
    echo "📦 Backup size: $BACKUP_SIZE"
else
    echo "❌ Database backup failed!"
    exit 1
fi
