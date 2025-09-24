import express from 'express';
import cors from 'cors';
import { eq, desc, sql, and } from 'drizzle-orm';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { randomUUID } from 'crypto';
import { 
  dataRooms, 
  users, 
  userDataRoomPermissions, 
  files, 
  folders,
  fileAccessLogs,
  tags,
  dataRoomTags
} from './schema.js';

// Initialize database connection
const sqlite = new Database('./secure-data-room.db');
const db = drizzle(sqlite);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes

// Get all data rooms for a user (with permissions)
app.get('/api/data-rooms/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get data rooms where user has permissions
    const userRooms = await db
      .select({
        id: dataRooms.id,
        name: dataRooms.name,
        description: dataRooms.description,
        createdAt: dataRooms.createdAt,
        lastModified: dataRooms.lastModified,
        createdBy: dataRooms.createdBy,
        role: userDataRoomPermissions.role
      })
      .from(dataRooms)
      .innerJoin(userDataRoomPermissions, eq(dataRooms.id, userDataRoomPermissions.dataRoomId))
      .where(eq(userDataRoomPermissions.userId, userId))
      .orderBy(desc(dataRooms.lastModified));

    // Get file and folder counts, and tags for each room
    for (const room of userRooms) {
      const fileCount = await db
        .select({ count: files.id })
        .from(files)
        .where(eq(files.dataRoomId, room.id));
      
      const folderCount = await db
        .select({ count: folders.id })
        .from(folders)
        .where(eq(folders.dataRoomId, room.id));

      // Get tags for this room
      const roomTags = await db
        .select({ name: tags.name })
        .from(tags)
        .innerJoin(dataRoomTags, eq(tags.id, dataRoomTags.tagId))
        .where(eq(dataRoomTags.dataRoomId, room.id));

      room.fileCount = fileCount.length;
      room.folderCount = folderCount.length;
      room.tags = roomTags.map(tag => tag.name);
      room.creatorId = room.createdBy; // Alias for compatibility
    }

    res.json(userRooms);
  } catch (error) {
    console.error('Error fetching data rooms:', error);
    res.status(500).json({ error: 'Failed to fetch data rooms' });
  }
});

// Get all data rooms (for dashboard stats)
app.get('/api/data-rooms', async (req, res) => {
  try {
    const rooms = await db
      .select({
        id: dataRooms.id,
        name: dataRooms.name,
        description: dataRooms.description,
        createdAt: dataRooms.createdAt,
        lastModified: dataRooms.lastModified,
        createdBy: dataRooms.createdBy
      })
      .from(dataRooms)
      .orderBy(desc(dataRooms.lastModified));

    // Add file and folder counts, and tags for each room
    for (const room of rooms) {
      const fileCount = await db
        .select({ count: files.id })
        .from(files)
        .where(eq(files.dataRoomId, room.id));
      
      const folderCount = await db
        .select({ count: folders.id })
        .from(folders)
        .where(eq(folders.dataRoomId, room.id));

      // Get tags for this room
      const roomTags = await db
        .select({ name: tags.name })
        .from(tags)
        .innerJoin(dataRoomTags, eq(tags.id, dataRoomTags.tagId))
        .where(eq(dataRoomTags.dataRoomId, room.id));

      room.fileCount = fileCount.length;
      room.folderCount = folderCount.length;
      room.tags = roomTags.map(tag => tag.name);
      room.creatorId = room.createdBy; // Alias for compatibility
    }

    res.json(rooms);
  } catch (error) {
    console.error('Error fetching all data rooms:', error);
    res.status(500).json({ error: 'Failed to fetch data rooms' });
  }
});

// Get dashboard stats
app.get('/api/stats', async (req, res) => {
  try {
    const totalRooms = await db.select({ count: dataRooms.id }).from(dataRooms);
    const totalFiles = await db.select({ count: files.id }).from(files);
    const totalUsers = await db.select({ count: users.id }).from(users);
    
    // Recent activity (last 24 hours)
    const oneDayAgo = Math.floor(Date.now() / 1000) - (24 * 60 * 60);
    const recentActivity = await db
      .select({ count: fileAccessLogs.id })
      .from(fileAccessLogs)
      .where(`${fileAccessLogs.timestamp} > ${oneDayAgo}`);

    res.json({
      totalRooms: totalRooms.length,
      totalFiles: totalFiles.length,
      totalUsers: totalUsers.length,
      recentActivity: recentActivity.length
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get specific data room details
app.get('/api/data-room/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId = 'user-1' } = req.query; // Default to user-1 for now
    
    const room = await db
      .select()
      .from(dataRooms)
      .where(eq(dataRooms.id, id))
      .limit(1);

    if (room.length === 0) {
      return res.status(404).json({ error: 'Data room not found' });
    }

    // Get user role for this room
    const userPermission = await db
      .select({ role: userDataRoomPermissions.role })
      .from(userDataRoomPermissions)
      .where(
        and(
          eq(userDataRoomPermissions.dataRoomId, id),
          eq(userDataRoomPermissions.userId, userId)
        )
      )
      .limit(1);

    // Get tags for this room
    const roomTags = await db
      .select({ name: tags.name })
      .from(tags)
      .innerJoin(dataRoomTags, eq(tags.id, dataRoomTags.tagId))
      .where(eq(dataRoomTags.dataRoomId, id));

    // Get files and folders
    const roomFiles = await db
      .select()
      .from(files)
      .where(eq(files.dataRoomId, id));

    const roomFolders = await db
      .select()
      .from(folders)
      .where(eq(folders.dataRoomId, id));

    res.json({
      ...room[0],
      role: userPermission.length > 0 ? userPermission[0].role : 'Viewer',
      tags: roomTags.map(tag => tag.name),
      files: roomFiles,
      folders: roomFolders
    });
  } catch (error) {
    console.error('Error fetching data room:', error);
    res.status(500).json({ error: 'Failed to fetch data room' });
  }
});

// Create new data room
app.post('/api/data-rooms', async (req, res) => {
  try {
    const { name, description, tags, creatorId } = req.body;
    
    const roomId = randomUUID();
    const now = Math.floor(Date.now() / 1000);
    
    // Insert data room
    await db.insert(dataRooms).values({
      id: roomId,
      name,
      description,
      createdBy: creatorId,
      createdAt: now,
      updatedAt: now,
      lastModified: now
    });

    // Give creator permissions
    await db.insert(userDataRoomPermissions).values({
      userId: creatorId,
      dataRoomId: roomId,
      role: 'Creator',
      canView: true,
      canUpload: true,
      canDownload: true,
      canEdit: true,
      canDelete: true,
      aiAccess: true,
      watermarkRequired: true,
      createdBy: creatorId,
      createdAt: now,
      updatedAt: now
    });

    // Add tags if provided
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // Create or get tag
        let tagId;
        const existingTag = await db
          .select({ id: tags.id })
          .from(tags)
          .where(eq(tags.name, tagName))
          .limit(1);

        if (existingTag.length > 0) {
          tagId = existingTag[0].id;
        } else {
          // Generate a proper UUID for the tag
          tagId = randomUUID();
          await db.insert(tags).values({
            id: tagId,
            name: tagName,
            createdAt: now
          });
        }

        // Link tag to room
        await db.insert(dataRoomTags).values({
          dataRoomId: roomId,
          tagId
        });
      }
    }

    res.status(201).json({ id: roomId, message: 'Data room created successfully' });
  } catch (error) {
    console.error('Error creating data room:', error);
    res.status(500).json({ error: 'Failed to create data room' });
  }
});

// Get all tags
app.get('/api/tags', async (req, res) => {
  try {
    const allTags = await db.select({ name: tags.name }).from(tags);
    res.json(allTags.map(tag => tag.name));
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// Upload file to data room
app.post('/api/data-rooms/:dataRoomId/files', async (req, res) => {
  try {
    const { dataRoomId } = req.params;
    const { 
      originalName, 
      fileName, 
      fileSize, 
      mimeType, 
      fileType, 
      uploadedBy, 
      folderId = null 
    } = req.body;

    // Validate required fields
    if (!originalName || !fileName || !fileSize || !mimeType || !fileType || !uploadedBy) {
      return res.status(400).json({ 
        error: 'Missing required fields: originalName, fileName, fileSize, mimeType, fileType, uploadedBy' 
      });
    }

    // Validate file type
    const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx'];
    if (!allowedExtensions.includes(fileType.toLowerCase())) {
      return res.status(400).json({ 
        error: `File type ${fileType} not allowed. Allowed types: ${allowedExtensions.join(', ')}` 
      });
    }

    // Check if data room exists
    const dataRoom = await db
      .select()
      .from(dataRooms)
      .where(eq(dataRooms.id, dataRoomId))
      .limit(1);

    if (dataRoom.length === 0) {
      return res.status(404).json({ error: 'Data room not found' });
    }

    // Check if user has upload permission
    const userPermission = await db
      .select()
      .from(userDataRoomPermissions)
      .where(
        and(
          eq(userDataRoomPermissions.dataRoomId, dataRoomId),
          eq(userDataRoomPermissions.userId, uploadedBy)
        )
      )
      .limit(1);

    if (userPermission.length === 0 || !['Creator', 'Editor', 'Contributor'].includes(userPermission[0].role)) {
      return res.status(403).json({ error: 'Insufficient permissions to upload files' });
    }

    const fileId = randomUUID();
    const now = Math.floor(Date.now() / 1000);
    const filePath = `/uploads/${dataRoomId}/${fileId}_${fileName}`;

    // Insert file record
    await db.insert(files).values({
      id: fileId,
      name: fileName,
      originalName,
      fileType: fileType.toLowerCase(),
      fileSize: parseInt(fileSize),
      filePath,
      mimeType,
      dataRoomId,
      folderId,
      uploadedBy,
      versionNumber: 1,
      isActive: true,
      createdAt: now,
      updatedAt: now
    });

    // Log the file upload
    await db.insert(fileAccessLogs).values({
      id: randomUUID(),
      userId: uploadedBy,
      fileId,
      dataRoomId,
      action: 'upload',
      createdAt: now
    });

    // Update data room last modified time
    await db
      .update(dataRooms)
      .set({ 
        lastModified: now,
        updatedAt: now 
      })
      .where(eq(dataRooms.id, dataRoomId));

    res.json({ 
      id: fileId, 
      message: 'File uploaded successfully',
      file: {
        id: fileId,
        name: fileName,
        originalName,
        fileType,
        fileSize: parseInt(fileSize),
        filePath,
        mimeType,
        dataRoomId,
        folderId,
        uploadedBy,
        createdAt: now
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Rename file
app.put('/api/files/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const { newName, userId } = req.body;

    if (!newName || !userId) {
      return res.status(400).json({ error: 'Missing required fields: newName, userId' });
    }

    // Check if file exists and user has edit permission
    const fileWithPermission = await db
      .select({
        fileId: files.id,
        dataRoomId: files.dataRoomId,
        role: userDataRoomPermissions.role
      })
      .from(files)
      .innerJoin(userDataRoomPermissions, eq(files.dataRoomId, userDataRoomPermissions.dataRoomId))
      .where(and(
        eq(files.id, fileId),
        eq(userDataRoomPermissions.userId, userId)
      ))
      .limit(1);

    if (fileWithPermission.length === 0 || !['Creator', 'Editor'].includes(fileWithPermission[0].role)) {
      return res.status(403).json({ error: 'Insufficient permissions to rename file' });
    }

    const now = Math.floor(Date.now() / 1000);
    
    // Update file name
    await db
      .update(files)
      .set({ 
        originalName: newName,
        name: newName,
        updatedAt: now 
      })
      .where(eq(files.id, fileId));

    res.json({ message: 'File renamed successfully' });
  } catch (error) {
    console.error('Error renaming file:', error);
    res.status(500).json({ error: 'Failed to rename file' });
  }
});

// Delete file
app.delete('/api/files/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'Missing required parameter: userId' });
    }

    // Check if file exists and user has delete permission
    const fileWithPermission = await db
      .select({
        fileId: files.id,
        dataRoomId: files.dataRoomId,
        role: userDataRoomPermissions.role
      })
      .from(files)
      .innerJoin(userDataRoomPermissions, eq(files.dataRoomId, userDataRoomPermissions.dataRoomId))
      .where(and(
        eq(files.id, fileId),
        eq(userDataRoomPermissions.userId, userId)
      ))
      .limit(1);

    if (fileWithPermission.length === 0 || !['Creator', 'Editor'].includes(fileWithPermission[0].role)) {
      return res.status(403).json({ error: 'Insufficient permissions to delete file' });
    }

    const dataRoomId = fileWithPermission[0].dataRoomId;
    const now = Math.floor(Date.now() / 1000);

    // Log the deletion
    await db.insert(fileAccessLogs).values({
      id: randomUUID(),
      userId,
      fileId,
      dataRoomId,
      action: 'delete',
      createdAt: now
    });

    // Delete file
    await db.delete(files).where(eq(files.id, fileId));

    // Update data room last modified time
    await db
      .update(dataRooms)
      .set({ 
        lastModified: now,
        updatedAt: now 
      })
      .where(eq(dataRooms.id, dataRoomId));

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Create folder
app.post('/api/data-rooms/:dataRoomId/folders', async (req, res) => {
  try {
    const { dataRoomId } = req.params;
    const { name, parentFolderId, createdBy } = req.body;

    if (!name || !createdBy) {
      return res.status(400).json({ error: 'Missing required fields: name, createdBy' });
    }

    // Check if user has edit permission
    const userPermission = await db
      .select()
      .from(userDataRoomPermissions)
      .where(
        and(
          eq(userDataRoomPermissions.dataRoomId, dataRoomId),
          eq(userDataRoomPermissions.userId, createdBy)
        )
      )
      .limit(1);

    if (userPermission.length === 0 || !['Creator', 'Editor'].includes(userPermission[0].role)) {
      return res.status(403).json({ error: 'Insufficient permissions to create folder' });
    }

    const folderId = randomUUID();
    const now = Math.floor(Date.now() / 1000);

    // Insert folder
    await db.insert(folders).values({
      id: folderId,
      name,
      dataRoomId,
      parentFolderId: parentFolderId || null,
      createdBy,
      createdAt: now,
      updatedAt: now
    });

    // Update data room last modified time
    await db
      .update(dataRooms)
      .set({ 
        lastModified: now,
        updatedAt: now 
      })
      .where(eq(dataRooms.id, dataRoomId));

    res.json({ 
      id: folderId, 
      message: 'Folder created successfully',
      folder: {
        id: folderId,
        name,
        dataRoomId,
        parentFolderId: parentFolderId || null,
        createdBy,
        createdAt: now
      }
    });
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// Rename folder
app.put('/api/folders/:folderId', async (req, res) => {
  try {
    const { folderId } = req.params;
    const { newName, userId } = req.body;

    if (!newName || !userId) {
      return res.status(400).json({ error: 'Missing required fields: newName, userId' });
    }

    // Check if folder exists and user has edit permission
    const folderWithPermission = await db
      .select({
        folderId: folders.id,
        dataRoomId: folders.dataRoomId,
        role: userDataRoomPermissions.role
      })
      .from(folders)
      .innerJoin(userDataRoomPermissions, eq(folders.dataRoomId, userDataRoomPermissions.dataRoomId))
      .where(and(
        eq(folders.id, folderId),
        eq(userDataRoomPermissions.userId, userId)
      ))
      .limit(1);

    if (folderWithPermission.length === 0 || !['Creator', 'Editor'].includes(folderWithPermission[0].role)) {
      return res.status(403).json({ error: 'Insufficient permissions to rename folder' });
    }

    const now = Math.floor(Date.now() / 1000);
    
    // Update folder name
    await db
      .update(folders)
      .set({ 
        name: newName,
        updatedAt: now 
      })
      .where(eq(folders.id, folderId));

    // Update data room last modified time
    await db
      .update(dataRooms)
      .set({ 
        lastModified: now,
        updatedAt: now 
      })
      .where(eq(dataRooms.id, folderWithPermission[0].dataRoomId));

    res.json({ message: 'Folder renamed successfully' });
  } catch (error) {
    console.error('Error renaming folder:', error);
    res.status(500).json({ error: 'Failed to rename folder' });
  }
});

// Delete folder (cascade delete files)
app.delete('/api/folders/:folderId', async (req, res) => {
  try {
    const { folderId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'Missing required parameter: userId' });
    }

    // Check if folder exists and user has delete permission
    const folderWithPermission = await db
      .select({
        folderId: folders.id,
        dataRoomId: folders.dataRoomId,
        role: userDataRoomPermissions.role
      })
      .from(folders)
      .innerJoin(userDataRoomPermissions, eq(folders.dataRoomId, userDataRoomPermissions.dataRoomId))
      .where(and(
        eq(folders.id, folderId),
        eq(userDataRoomPermissions.userId, userId)
      ))
      .limit(1);

    if (folderWithPermission.length === 0 || !['Creator', 'Editor'].includes(folderWithPermission[0].role)) {
      return res.status(403).json({ error: 'Insufficient permissions to delete folder' });
    }

    const dataRoomId = folderWithPermission[0].dataRoomId;
    const now = Math.floor(Date.now() / 1000);

    // Get all files in this folder to log deletions
    const filesInFolder = await db
      .select({ id: files.id })
      .from(files)
      .where(eq(files.folderId, folderId));

    // Log file deletions
    for (const file of filesInFolder) {
      await db.insert(fileAccessLogs).values({
        id: randomUUID(),
        userId,
        fileId: file.id,
        dataRoomId,
        action: 'delete',
        createdAt: now
      });
    }

    // Delete folder (files will be cascade deleted due to foreign key constraints)
    await db.delete(folders).where(eq(folders.id, folderId));

    // Update data room last modified time
    await db
      .update(dataRooms)
      .set({ 
        lastModified: now,
        updatedAt: now 
      })
      .where(eq(dataRooms.id, dataRoomId));

    res.json({ message: 'Folder and all contents deleted successfully' });
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
});

// Get file content for viewing
app.get('/api/files/:fileId/view', async (req, res) => {
  try {
    const { fileId } = req.params;
    const { userId = 'user-1' } = req.query;

    // Check if file exists and user has view permission
    const fileWithPermission = await db
      .select({
        file: files,
        dataRoomId: files.dataRoomId,
        role: userDataRoomPermissions.role
      })
      .from(files)
      .innerJoin(userDataRoomPermissions, eq(files.dataRoomId, userDataRoomPermissions.dataRoomId))
      .where(and(
        eq(files.id, fileId),
        eq(userDataRoomPermissions.userId, userId)
      ))
      .limit(1);

    if (fileWithPermission.length === 0) {
      return res.status(403).json({ error: 'File not found or insufficient permissions' });
    }

    const file = fileWithPermission[0].file;
    const now = Math.floor(Date.now() / 1000);

    // Log the view action
    await db.insert(fileAccessLogs).values({
      id: randomUUID(),
      userId,
      fileId,
      dataRoomId: file.dataRoomId,
      action: 'view',
      createdAt: now
    });

    // Return file metadata (in a real app, you'd return actual file content or a preview)
    res.json({
      id: file.id,
      name: file.originalName,
      fileType: file.fileType,
      fileSize: file.fileSize,
      mimeType: file.mimeType,
      uploadedBy: file.uploadedBy,
      createdAt: file.createdAt,
      content: `This is a preview of ${file.originalName}. In a real implementation, this would show the actual file content.`
    });
  } catch (error) {
    console.error('Error viewing file:', error);
    res.status(500).json({ error: 'Failed to view file' });
  }
});

// Get all users (for testing)
app.get('/api/users', async (req, res) => {
  try {
    const allUsers = await db.select().from(users);
    res.json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📁 Data rooms API: http://localhost:${PORT}/api/data-rooms`);
});

export default app;