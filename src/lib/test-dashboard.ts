import { DataRoomService } from './services';

async function testDashboardData() {
  try {
    console.log('Testing Dashboard data retrieval...\n');
    
    const userId = 'user-1'; // John Doe
    console.log(`Fetching data rooms for user: ${userId}`);
    
    const userDataRooms = await DataRoomService.findByUserId(userId);
    console.log(`Found ${userDataRooms.length} data rooms`);
    
    for (const room of userDataRooms) {
      console.log(`\n--- ${room.name} ---`);
      console.log(`Description: ${room.description}`);
      console.log(`Created by: ${room.createdBy}`);
      console.log(`Last modified: ${new Date(room.lastModified * 1000).toLocaleString()}`);
      
      // Get stats
      const stats = await DataRoomService.getStats(room.id);
      console.log(`Stats: ${stats.documentCount} files, ${stats.userCount} users, ${stats.folderCount} folders`);
      
      // Get tags
      if (room.tags && room.tags.length > 0) {
        const tagNames = room.tags.map((dt: any) => dt.tag.name).join(', ');
        console.log(`Tags: ${tagNames}`);
      }
      
      // Get user permissions
      if (room.userPermissions && room.userPermissions.length > 0) {
        const userPerm = room.userPermissions.find((p: any) => p.userId === userId);
        if (userPerm) {
          console.log(`User role: ${userPerm.role}`);
        }
      }
    }
    
    console.log('\n✅ Dashboard data test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing dashboard data:', error);
    throw error;
  }
}

// Run test
testDashboardData().then(() => {
  console.log('Test completed!');
  process.exit(0);
}).catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});