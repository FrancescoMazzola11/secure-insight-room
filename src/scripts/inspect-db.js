#!/usr/bin/env node

// Simple script to inspect the database
import { db } from '../lib/database.js';
import { users, dataRooms, files, tags } from '../lib/schema.js';

async function inspectDatabase() {
  console.log('🔍 Database Content Inspection');
  console.log('================================\n');

  try {
    // Check if database file exists and tables are created
    console.log('📊 Database Tables:');
    
    // Count users
    const userCount = await db.select().from(users);
    console.log(`👥 Users: ${userCount.length} records`);
    if (userCount.length > 0) {
      console.log('   Sample:', userCount[0]);
    }

    // Count data rooms
    const dataRoomCount = await db.select().from(dataRooms);
    console.log(`🏠 Data Rooms: ${dataRoomCount.length} records`);
    if (dataRoomCount.length > 0) {
      console.log('   Sample:', dataRoomCount[0]);
    }

    // Count tags
    const tagCount = await db.select().from(tags);
    console.log(`🏷️  Tags: ${tagCount.length} records`);
    if (tagCount.length > 0) {
      console.log('   Sample:', tagCount[0]);
    }

    // Count files
    const fileCount = await db.select().from(files);
    console.log(`📁 Files: ${fileCount.length} records`);
    if (fileCount.length > 0) {
      console.log('   Sample:', fileCount[0]);
    }

  } catch (error) {
    console.error('❌ Error inspecting database:', error);
    console.log('\n💡 This might mean the database tables haven\'t been created yet.');
    console.log('   Run: npm run db:generate && npm run db:migrate');
  }
}

inspectDatabase();