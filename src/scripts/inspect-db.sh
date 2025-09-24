#!/bin/bash

# SQLite Database Inspection Script
DB_FILE="secure-data-room.db"

echo "🔍 SQLite Database Inspection"
echo "=============================="
echo

if [ ! -f "$DB_FILE" ]; then
    echo "❌ Database file '$DB_FILE' not found!"
    echo "💡 Run the migration first to create the database."
    exit 1
fi

echo "📊 Database file: $DB_FILE"
echo "📁 File size: $(du -h $DB_FILE | cut -f1)"
echo

echo "📋 Available Tables:"
sqlite3 $DB_FILE ".tables"
echo

echo "📈 Table Row Counts:"
for table in $(sqlite3 $DB_FILE ".tables"); do
    count=$(sqlite3 $DB_FILE "SELECT COUNT(*) FROM $table;")
    echo "  $table: $count rows"
done
echo

echo "🔧 Useful SQLite Commands:"
echo "  sqlite3 $DB_FILE"
echo "  .tables                    # List all tables"
echo "  .schema table_name         # Show table structure"
echo "  SELECT * FROM table_name;  # View all data in table"
echo "  .mode column               # Pretty column display"
echo "  .headers on                # Show column headers"
echo "  .quit                      # Exit SQLite"