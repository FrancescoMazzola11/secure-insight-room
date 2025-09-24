const Database = require('better-sqlite3');
const db = new Database('secure-data-room.db');

console.log('=== USERS ===');
const users = db.prepare('SELECT * FROM users').all();
console.log(users);

console.log('\n=== DATA ROOMS ===');
const dataRooms = db.prepare('SELECT * FROM data_rooms').all();
console.log(dataRooms);

console.log('\n=== TAGS ===');
const tags = db.prepare('SELECT * FROM tags').all();
console.log(tags);

db.close();