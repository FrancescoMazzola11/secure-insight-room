import { sql } from 'drizzle-orm';
import {
  sqliteTable,
  text,
  integer,
  real,
  blob,
  primaryKey,
} from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { randomUUID } from 'crypto';

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  avatarUrl: text('avatar_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  lastLogin: integer('last_login', { mode: 'timestamp' }),
});

// Data rooms table
export const dataRooms = sqliteTable('data_rooms', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  name: text('name').notNull(),
  description: text('description'),
  createdBy: text('created_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  lastModified: integer('last_modified', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// Tags table
export const tags = sqliteTable('tags', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  name: text('name').notNull().unique(),
  color: text('color'), // HEX color code
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// Data room tags (many-to-many)
export const dataRoomTags = sqliteTable('data_room_tags', {
  dataRoomId: text('data_room_id').notNull().references(() => dataRooms.id, { onDelete: 'cascade' }),
  tagId: text('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.dataRoomId, table.tagId] }),
}));

// Folders table
export const folders = sqliteTable('folders', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  name: text('name').notNull(),
  dataRoomId: text('data_room_id').notNull().references(() => dataRooms.id, { onDelete: 'cascade' }),
  parentFolderId: text('parent_folder_id').references(() => folders.id, { onDelete: 'cascade' }),
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// Files table
export const files = sqliteTable('files', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  name: text('name').notNull(),
  originalName: text('original_name').notNull(),
  fileType: text('file_type').notNull(),
  fileSize: integer('file_size').notNull(), // in bytes
  filePath: text('file_path').notNull(),
  mimeType: text('mime_type'),
  dataRoomId: text('data_room_id').notNull().references(() => dataRooms.id, { onDelete: 'cascade' }),
  folderId: text('folder_id').references(() => folders.id, { onDelete: 'set null' }),
  uploadedBy: text('uploaded_by').notNull().references(() => users.id),
  versionNumber: integer('version_number').default(1),
  checksum: text('checksum'), // for file integrity
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// User permissions for data rooms
export const userDataRoomPermissions = sqliteTable('user_data_room_permissions', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  dataRoomId: text('data_room_id').notNull().references(() => dataRooms.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['Creator', 'Editor', 'Contributor', 'Viewer'] }).notNull(),
  canView: integer('can_view', { mode: 'boolean' }).default(true),
  canUpload: integer('can_upload', { mode: 'boolean' }).default(false),
  canDownload: integer('can_download', { mode: 'boolean' }).default(false),
  canEdit: integer('can_edit', { mode: 'boolean' }).default(false),
  canDelete: integer('can_delete', { mode: 'boolean' }).default(false),
  aiAccess: integer('ai_access', { mode: 'boolean' }).default(false),
  watermarkRequired: integer('watermark_required', { mode: 'boolean' }).default(true),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.dataRoomId] }),
}));

// File access logs
export const fileAccessLogs = sqliteTable('file_access_logs', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  userId: text('user_id').notNull().references(() => users.id),
  fileId: text('file_id').notNull().references(() => files.id, { onDelete: 'cascade' }),
  dataRoomId: text('data_room_id').notNull().references(() => dataRooms.id, { onDelete: 'cascade' }),
  action: text('action', { enum: ['view', 'download', 'upload', 'delete'] }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// Shared links
export const sharedLinks = sqliteTable('shared_links', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  dataRoomId: text('data_room_id').notNull().references(() => dataRooms.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  passwordHash: text('password_hash'),
  maxUses: integer('max_uses'),
  currentUses: integer('current_uses').default(0),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  rights: text('rights', { mode: 'json' }).$type<string[]>().default(['view']),
  createdBy: text('created_by').notNull().references(() => users.id),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  lastUsedAt: integer('last_used_at', { mode: 'timestamp' }),
});

// AI queries
export const aiQueries = sqliteTable('ai_queries', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  userId: text('user_id').notNull().references(() => users.id),
  dataRoomId: text('data_room_id').notNull().references(() => dataRooms.id, { onDelete: 'cascade' }),
  queryText: text('query_text').notNull(),
  responseText: text('response_text'),
  filesReferenced: text('files_referenced', { mode: 'json' }).$type<string[]>(), // array of file IDs
  processingStatus: text('processing_status', { 
    enum: ['pending', 'processing', 'completed', 'failed'] 
  }).default('pending'),
  processingTimeMs: integer('processing_time_ms'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// Notifications
export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  dataRoomId: text('data_room_id').references(() => dataRooms.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'file_uploaded', 'access_granted', etc.
  title: text('title').notNull(),
  message: text('message'),
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// Watermarks
export const watermarks = sqliteTable('watermarks', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  dataRoomId: text('data_room_id').notNull().references(() => dataRooms.id, { onDelete: 'cascade' }),
  template: text('template').notNull(), // watermark template with placeholders
  position: text('position').default('center'), // 'center', 'top-right', etc.
  opacity: real('opacity').default(0.3),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  dataRooms: many(dataRooms),
  files: many(files),
  userPermissions: many(userDataRoomPermissions, { relationName: 'userPermissions' }),
  createdPermissions: many(userDataRoomPermissions, { relationName: 'createdPermissions' }),
  sharedLinks: many(sharedLinks),
  accessLogs: many(fileAccessLogs),
  aiQueries: many(aiQueries),
  notifications: many(notifications),
}));

export const dataRoomsRelations = relations(dataRooms, ({ one, many }) => ({
  creator: one(users, {
    fields: [dataRooms.createdBy],
    references: [users.id],
  }),
  tags: many(dataRoomTags),
  folders: many(folders),
  files: many(files),
  userPermissions: many(userDataRoomPermissions),
  sharedLinks: many(sharedLinks),
  aiQueries: many(aiQueries),
  watermarks: many(watermarks),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  dataRooms: many(dataRoomTags),
}));

export const dataRoomTagsRelations = relations(dataRoomTags, ({ one }) => ({
  dataRoom: one(dataRooms, {
    fields: [dataRoomTags.dataRoomId],
    references: [dataRooms.id],
  }),
  tag: one(tags, {
    fields: [dataRoomTags.tagId],
    references: [tags.id],
  }),
}));

export const foldersRelations = relations(folders, ({ one, many }) => ({
  dataRoom: one(dataRooms, {
    fields: [folders.dataRoomId],
    references: [dataRooms.id],
  }),
  parentFolder: one(folders, {
    fields: [folders.parentFolderId],
    references: [folders.id],
    relationName: 'parent',
  }),
  subfolders: many(folders, { relationName: 'parent' }),
  files: many(files),
  creator: one(users, {
    fields: [folders.createdBy],
    references: [users.id],
  }),
}));

export const filesRelations = relations(files, ({ one, many }) => ({
  dataRoom: one(dataRooms, {
    fields: [files.dataRoomId],
    references: [dataRooms.id],
  }),
  folder: one(folders, {
    fields: [files.folderId],
    references: [folders.id],
  }),
  uploader: one(users, {
    fields: [files.uploadedBy],
    references: [users.id],
  }),
  accessLogs: many(fileAccessLogs),
}));

export const userDataRoomPermissionsRelations = relations(userDataRoomPermissions, ({ one }) => ({
  user: one(users, {
    fields: [userDataRoomPermissions.userId],
    references: [users.id],
    relationName: 'userPermissions',
  }),
  dataRoom: one(dataRooms, {
    fields: [userDataRoomPermissions.dataRoomId],
    references: [dataRooms.id],
  }),
  creator: one(users, {
    fields: [userDataRoomPermissions.createdBy],
    references: [users.id],
    relationName: 'createdPermissions',
  }),
}));

export const sharedLinksRelations = relations(sharedLinks, ({ one }) => ({
  dataRoom: one(dataRooms, {
    fields: [sharedLinks.dataRoomId],
    references: [dataRooms.id],
  }),
  creator: one(users, {
    fields: [sharedLinks.createdBy],
    references: [users.id],
  }),
}));

export const fileAccessLogsRelations = relations(fileAccessLogs, ({ one }) => ({
  user: one(users, {
    fields: [fileAccessLogs.userId],
    references: [users.id],
  }),
  file: one(files, {
    fields: [fileAccessLogs.fileId],
    references: [files.id],
  }),
  dataRoom: one(dataRooms, {
    fields: [fileAccessLogs.dataRoomId],
    references: [dataRooms.id],
  }),
}));

export const aiQueriesRelations = relations(aiQueries, ({ one }) => ({
  user: one(users, {
    fields: [aiQueries.userId],
    references: [users.id],
  }),
  dataRoom: one(dataRooms, {
    fields: [aiQueries.dataRoomId],
    references: [dataRooms.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  dataRoom: one(dataRooms, {
    fields: [notifications.dataRoomId],
    references: [dataRooms.id],
  }),
}));

export const watermarksRelations = relations(watermarks, ({ one }) => ({
  dataRoom: one(dataRooms, {
    fields: [watermarks.dataRoomId],
    references: [dataRooms.id],
  }),
}));

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type DataRoom = typeof dataRooms.$inferSelect;
export type NewDataRoom = typeof dataRooms.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type Folder = typeof folders.$inferSelect;
export type NewFolder = typeof folders.$inferInsert;
export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;
export type UserDataRoomPermission = typeof userDataRoomPermissions.$inferSelect;
export type NewUserDataRoomPermission = typeof userDataRoomPermissions.$inferInsert;
export type FileAccessLog = typeof fileAccessLogs.$inferSelect;
export type NewFileAccessLog = typeof fileAccessLogs.$inferInsert;
export type SharedLink = typeof sharedLinks.$inferSelect;
export type NewSharedLink = typeof sharedLinks.$inferInsert;
export type AiQuery = typeof aiQueries.$inferSelect;
export type NewAiQuery = typeof aiQueries.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type Watermark = typeof watermarks.$inferSelect;
export type NewWatermark = typeof watermarks.$inferInsert;