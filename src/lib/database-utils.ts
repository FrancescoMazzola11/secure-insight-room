import {
  UserService,
  DataRoomService,
  TagService,
  FileService,
  PermissionService,
} from '../lib/services';

// Example usage of the database services

// 1. Create a new user
export async function createUser(email: string, name: string, password: string) {
  const passwordHash = await hashPassword(password); // You'll need to implement this
  
  const user = await UserService.create({
    email,
    name,
    passwordHash,
  });
  
  return user;
}

// 2. Create a data room
export async function createDataRoom(userId: string, name: string, description: string, tagNames: string[]) {
  // Create data room
  const dataRoom = await DataRoomService.create({
    name,
    description,
    createdBy: userId,
  });

  // Create or find tags and associate them
  const tags = await Promise.all(
    tagNames.map(tagName => TagService.findOrCreate(tagName))
  );
  
  await DataRoomService.addTags(
    dataRoom.id,
    tags.map(tag => tag.id)
  );

  // Grant creator permissions
  await PermissionService.grantAccess({
    userId,
    dataRoomId: dataRoom.id,
    role: 'Creator',
    canView: true,
    canUpload: true,
    canDownload: true,
    canEdit: true,
    canDelete: true,
    aiAccess: true,
    createdBy: userId,
  });

  return dataRoom;
}

// 3. Upload a file
export async function uploadFile(
  userId: string,
  dataRoomId: string,
  fileData: {
    name: string;
    originalName: string;
    fileType: string;
    fileSize: number;
    filePath: string;
    mimeType?: string;
    folderId?: string;
    checksum?: string;
  }
) {
  // Check if user has upload permission
  const permission = await PermissionService.checkPermission(userId, dataRoomId);
  if (!permission?.canUpload) {
    throw new Error('User does not have upload permission');
  }

  const file = await FileService.create({
    ...fileData,
    dataRoomId,
    uploadedBy: userId,
  });

  // Log the upload action
  await FileService.logAccess(userId, file.id, 'upload');

  return file;
}

// 4. Get user's data rooms with stats
export async function getUserDataRoomsWithStats(userId: string) {
  const dataRooms = await DataRoomService.findByUserId(userId);
  
  const dataRoomsWithStats = await Promise.all(
    dataRooms.map(async (dataRoom) => {
      const stats = await DataRoomService.getStats(dataRoom.id);
      return {
        ...dataRoom,
        stats,
      };
    })
  );

  return dataRoomsWithStats;
}

// 5. Share data room with another user
export async function shareDataRoom(
  creatorId: string,
  dataRoomId: string,
  userEmail: string,
  role: 'Editor' | 'Contributor' | 'Viewer',
  permissions?: {
    canUpload?: boolean;
    canDownload?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    aiAccess?: boolean;
    expiresAt?: Date;
  }
) {
  // Find the user to share with
  const user = await UserService.findByEmail(userEmail);
  if (!user) {
    throw new Error('User not found');
  }

  // Check if creator has permission to share
  const creatorPermission = await PermissionService.checkPermission(creatorId, dataRoomId);
  if (creatorPermission?.role !== 'Creator' && creatorPermission?.role !== 'Editor') {
    throw new Error('Only creators and editors can share data rooms');
  }

  // Set default permissions based on role
  const defaultPermissions = {
    Creator: { canView: true, canUpload: true, canDownload: true, canEdit: true, canDelete: true, aiAccess: true },
    Editor: { canView: true, canUpload: true, canDownload: true, canEdit: true, canDelete: false, aiAccess: true },
    Contributor: { canView: true, canUpload: true, canDownload: false, canEdit: false, canDelete: false, aiAccess: false },
    Viewer: { canView: true, canUpload: false, canDownload: false, canEdit: false, canDelete: false, aiAccess: false },
  };

  await PermissionService.grantAccess({
    userId: user.id,
    dataRoomId,
    role,
    ...defaultPermissions[role],
    ...permissions,
    createdBy: creatorId,
  });

  return user;
}

// 6. Download file with access logging
export async function downloadFile(userId: string, fileId: string, ipAddress?: string, userAgent?: string) {
  const file = await FileService.findById(fileId);
  if (!file) {
    throw new Error('File not found');
  }

  // Check download permission
  const permission = await PermissionService.checkPermission(userId, file.dataRoomId);
  if (!permission?.canDownload) {
    throw new Error('User does not have download permission');
  }

  // Log the download
  await FileService.logAccess(userId, fileId, 'download', { ipAddress, userAgent });

  return file;
}

// Helper function placeholder - you'll need to implement password hashing
async function hashPassword(password: string): Promise<string> {
  // Use bcrypt or similar library
  // Example: return bcrypt.hash(password, 10);
  return password; // PLACEHOLDER - IMPLEMENT PROPER HASHING
}

// Convert the existing mock data to use the database
export async function seedDatabase() {
  try {
    // Create some initial tags
    const financialTag = await TagService.findOrCreate('Financial');
    const legalTag = await TagService.findOrCreate('Legal');
    const taxTag = await TagService.findOrCreate('Tax');
    const businessTag = await TagService.findOrCreate('Business');

    // Create a demo user
    const demoUser = await createUser(
      'demo@company.com',
      'Demo User',
      'password123'
    );

    // Create demo data rooms
    const financialRoom = await createDataRoom(
      demoUser.id,
      'Financial',
      'Documenti finanziari, bilanci e analisi economiche',
      ['Financial']
    );

    const legalRoom = await createDataRoom(
      demoUser.id,
      'Legal',
      'Documenti legali, contratti e adempimenti normativi',
      ['Legal']
    );

    console.log('✅ Database seeded successfully!');
    console.log(`Created user: ${demoUser.email}`);
    console.log(`Created data rooms: ${financialRoom.name}, ${legalRoom.name}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}