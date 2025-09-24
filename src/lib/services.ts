import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from './database';
import {
  users,
  dataRooms,
  tags,
  dataRoomTags,
  folders,
  files,
  userDataRoomPermissions,
  fileAccessLogs,
  sharedLinks,
  aiQueries,
  notifications,
  type User,
  type NewUser,
  type DataRoom,
  type NewDataRoom,
  type Tag,
  type NewTag,
  type File,
  type NewFile,
  type UserDataRoomPermission,
  type NewUserDataRoomPermission,
} from './schema';

// User operations
export class UserService {
  static async create(userData: NewUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  static async findByEmail(email: string): Promise<User | undefined> {
    return await db.query.users.findFirst({
      where: eq(users.email, email),
    });
  }

  static async findById(id: string): Promise<User | undefined> {
    return await db.query.users.findFirst({
      where: eq(users.id, id),
    });
  }

  static async update(id: string, userData: Partial<NewUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }
}

// Data Room operations
export class DataRoomService {
  static async create(dataRoomData: NewDataRoom): Promise<DataRoom> {
    const [dataRoom] = await db.insert(dataRooms).values(dataRoomData).returning();
    return dataRoom;
  }

  static async findByUserId(userId: string) {
    return await db.query.dataRooms.findMany({
      where: eq(dataRooms.createdBy, userId),
      with: {
        tags: {
          with: {
            tag: true,
          },
        },
        userPermissions: {
          where: eq(userDataRoomPermissions.userId, userId),
        },
      },
      orderBy: [desc(dataRooms.lastModified)],
    });
  }

  static async findById(id: string) {
    return await db.query.dataRooms.findFirst({
      where: eq(dataRooms.id, id),
      with: {
        creator: true,
        tags: {
          with: {
            tag: true,
          },
        },
        folders: true,
        files: {
          with: {
            uploader: true,
          },
        },
      },
    });
  }  static async update(id: string, dataRoomData: Partial<NewDataRoom>): Promise<DataRoom> {
    const [dataRoom] = await db
      .update(dataRooms)
      .set({ ...dataRoomData, updatedAt: new Date(), lastModified: new Date() })
      .where(eq(dataRooms.id, id))
      .returning();
    return dataRoom;
  }

  static async delete(id: string): Promise<void> {
    await db.delete(dataRooms).where(eq(dataRooms.id, id));
  }

  static async addTags(dataRoomId: string, tagIds: string[]): Promise<void> {
    const tagData = tagIds.map(tagId => ({
      dataRoomId,
      tagId,
    }));
    await db.insert(dataRoomTags).values(tagData).onConflictDoNothing();
  }

  static async getStats(dataRoomId: string): Promise<{
    documentCount: number;
    userCount: number;
    folderCount: number;
  }> {
    const [documentCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(files)
      .where(and(eq(files.dataRoomId, dataRoomId), eq(files.isActive, true)));

    const [userCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(userDataRoomPermissions)
      .where(eq(userDataRoomPermissions.dataRoomId, dataRoomId));

    const [folderCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(folders)
      .where(eq(folders.dataRoomId, dataRoomId));

    return {
      documentCount: documentCount.count,
      userCount: userCount.count,
      folderCount: folderCount.count,
    };
  }
}

// Tag operations
export class TagService {
  static async create(tagData: NewTag): Promise<Tag> {
    const [tag] = await db.insert(tags).values(tagData).returning();
    return tag;
  }

  static async findAll(): Promise<Tag[]> {
    return await db.select().from(tags);
  }

  static async findOrCreate(name: string): Promise<Tag> {
    const existingTag = await db.query.tags.findFirst({
      where: eq(tags.name, name),
    });

    if (existingTag) {
      return existingTag;
    }

    const [newTag] = await db.insert(tags).values({ name }).returning();
    return newTag;
  }
}

// File operations
export class FileService {
  static async create(fileData: NewFile): Promise<File> {
    const [file] = await db.insert(files).values(fileData).returning();
    return file;
  }

  static async findByDataRoom(dataRoomId: string): Promise<File[]> {
    return await db.query.files.findMany({
      where: and(eq(files.dataRoomId, dataRoomId), eq(files.isActive, true)),
      with: {
        uploader: true,
        folder: true,
      },
      orderBy: [desc(files.createdAt)],
    });
  }

  static async findByFolder(folderId: string): Promise<File[]> {
    return await db.query.files.findMany({
      where: and(eq(files.folderId, folderId), eq(files.isActive, true)),
      with: {
        uploader: true,
      },
      orderBy: [desc(files.createdAt)],
    });
  }

  static async findById(id: string): Promise<File | undefined> {
    return await db.query.files.findFirst({
      where: eq(files.id, id),
      with: {
        uploader: true,
        dataRoom: true,
        folder: true,
      },
    });
  }

  static async update(id: string, fileData: Partial<NewFile>): Promise<File> {
    const [file] = await db
      .update(files)
      .set({ ...fileData, updatedAt: new Date() })
      .where(eq(files.id, id))
      .returning();
    return file;
  }

  static async delete(id: string): Promise<void> {
    await db.update(files).set({ isActive: false }).where(eq(files.id, id));
  }

  static async logAccess(userId: string, fileId: string, action: 'view' | 'download' | 'upload' | 'delete', metadata?: { ipAddress?: string; userAgent?: string }): Promise<void> {
    const file = await this.findById(fileId);
    if (!file) return;

    await db.insert(fileAccessLogs).values({
      userId,
      fileId,
      dataRoomId: file.dataRoomId,
      action,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });
  }
}

// Permission operations
export class PermissionService {
  static async grantAccess(permissionData: NewUserDataRoomPermission): Promise<UserDataRoomPermission> {
    const [permission] = await db
      .insert(userDataRoomPermissions)
      .values(permissionData)
      .onConflictDoUpdate({
        target: [userDataRoomPermissions.userId, userDataRoomPermissions.dataRoomId],
        set: permissionData,
      })
      .returning();
    return permission;
  }

  static async checkPermission(userId: string, dataRoomId: string): Promise<UserDataRoomPermission | undefined> {
    return await db.query.userDataRoomPermissions.findFirst({
      where: and(
        eq(userDataRoomPermissions.userId, userId),
        eq(userDataRoomPermissions.dataRoomId, dataRoomId)
      ),
    });
  }

  static async getUserPermissions(userId: string): Promise<UserDataRoomPermission[]> {
    return await db.query.userDataRoomPermissions.findMany({
      where: eq(userDataRoomPermissions.userId, userId),
      with: {
        dataRoom: {
          with: {
            tags: {
              with: {
                tag: true,
              },
            },
          },
        },
      },
    });
  }

  static async getDataRoomUsers(dataRoomId: string): Promise<UserDataRoomPermission[]> {
    return await db.query.userDataRoomPermissions.findMany({
      where: eq(userDataRoomPermissions.dataRoomId, dataRoomId),
      with: {
        user: true,
      },
    });
  }

  static async revokeAccess(userId: string, dataRoomId: string): Promise<void> {
    await db
      .delete(userDataRoomPermissions)
      .where(
        and(
          eq(userDataRoomPermissions.userId, userId),
          eq(userDataRoomPermissions.dataRoomId, dataRoomId)
        )
      );
  }
}

// AI Query operations
export class AiQueryService {
  static async create(queryData: {
    userId: string;
    dataRoomId: string;
    queryText: string;
  }): Promise<string> {
    const [query] = await db.insert(aiQueries).values(queryData).returning();
    return query.id;
  }

  static async updateResponse(id: string, responseText: string, processingTimeMs?: number): Promise<void> {
    await db
      .update(aiQueries)
      .set({
        responseText,
        processingStatus: 'completed',
        processingTimeMs,
      })
      .where(eq(aiQueries.id, id));
  }

  static async findByDataRoom(dataRoomId: string, limit: number = 50): Promise<typeof aiQueries.$inferSelect[]> {
    return await db.query.aiQueries.findMany({
      where: eq(aiQueries.dataRoomId, dataRoomId),
      with: {
        user: true,
      },
      orderBy: [desc(aiQueries.createdAt)],
      limit,
    });
  }

  static async markFailed(id: string, error?: string): Promise<void> {
    await db
      .update(aiQueries)
      .set({
        processingStatus: 'failed',
        responseText: error,
      })
      .where(eq(aiQueries.id, id));
  }
}

// Notification operations
export class NotificationService {
  static async create(notificationData: {
    userId: string;
    dataRoomId?: string;
    type: string;
    title: string;
    message?: string;
  }): Promise<void> {
    await db.insert(notifications).values(notificationData);
  }

  static async getUnread(userId: string): Promise<typeof notifications.$inferSelect[]> {
    return await db.query.notifications.findMany({
      where: and(eq(notifications.userId, userId), eq(notifications.isRead, false)),
      orderBy: [desc(notifications.createdAt)],
    });
  }

  static async markAsRead(notificationIds: string[]): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(sql`${notifications.id} IN ${notificationIds}`);
  }
}