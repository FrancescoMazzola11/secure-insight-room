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

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  avatarUrl: text('avatar_url'),
  createdAt: integer('created_at'),
  updatedAt: integer('updated_at'),
  lastLogin: integer('last_login'),
});

// Data rooms table  
export const dataRooms = sqliteTable('data_rooms', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdBy: text('created_by').notNull().references(() => users.id),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at'),
  updatedAt: integer('updated_at'),
  lastModified: integer('last_modified'),
});

// Tags table
export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  color: text('color'),
  createdAt: integer('created_at'),
});

// Data room tags (many-to-many)
export const dataRoomTags = sqliteTable('data_room_tags', {
  dataRoomId: text('data_room_id').notNull().references(() => dataRooms.id),
  tagId: text('tag_id').notNull().references(() => tags.id),
}, (table) => ({
  pk: primaryKey({ columns: [table.dataRoomId, table.tagId] }),
}));

// User permissions for data rooms
export const userDataRoomPermissions = sqliteTable('user_data_room_permissions', {
  userId: text('user_id').notNull().references(() => users.id),
  dataRoomId: text('data_room_id').notNull().references(() => dataRooms.id),
  role: text('role', { enum: ['Creator', 'Editor', 'Contributor', 'Viewer'] }).notNull(),
  canView: integer('can_view', { mode: 'boolean' }).default(true),
  canUpload: integer('can_upload', { mode: 'boolean' }).default(false),
  canDownload: integer('can_download', { mode: 'boolean' }).default(false),
  canEdit: integer('can_edit', { mode: 'boolean' }).default(false),
  canDelete: integer('can_delete', { mode: 'boolean' }).default(false),
  aiAccess: integer('ai_access', { mode: 'boolean' }).default(false),
  watermarkRequired: integer('watermark_required', { mode: 'boolean' }).default(true),
  expiresAt: integer('expires_at'),
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt: integer('created_at'),
  updatedAt: integer('updated_at'),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.dataRoomId] }),
}));

// Folders table
export const folders = sqliteTable('folders', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  dataRoomId: text('data_room_id').notNull().references(() => dataRooms.id),
  parentFolderId: text('parent_folder_id'),
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt: integer('created_at'),
  updatedAt: integer('updated_at'),
});

// Files table
export const files = sqliteTable('files', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  originalName: text('original_name').notNull(),
  fileType: text('file_type').notNull(),
  fileSize: integer('file_size').notNull(),
  filePath: text('file_path').notNull(),
  mimeType: text('mime_type'),
  dataRoomId: text('data_room_id').notNull().references(() => dataRooms.id),
  folderId: text('folder_id').references(() => folders.id),
  uploadedBy: text('uploaded_by').notNull().references(() => users.id),
  versionNumber: integer('version_number').default(1),
  checksum: text('checksum'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at'),
  updatedAt: integer('updated_at'),
});

// File access logs
export const fileAccessLogs = sqliteTable('file_access_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  fileId: text('file_id').notNull().references(() => files.id),
  dataRoomId: text('data_room_id').notNull().references(() => dataRooms.id),
  action: text('action', { enum: ['view', 'download', 'upload', 'delete'] }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at'),
});

// Shared links
export const sharedLinks = sqliteTable('shared_links', {
  id: text('id').primaryKey(),
  dataRoomId: text('data_room_id').notNull().references(() => dataRooms.id),
  token: text('token').notNull().unique(),
  passwordHash: text('password_hash'),
  maxUses: integer('max_uses'),
  currentUses: integer('current_uses').default(0),
  expiresAt: integer('expires_at'),
  rights: text('rights'), // JSON string of rights array
  createdBy: text('created_by').notNull().references(() => users.id),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at'),
  lastUsedAt: integer('last_used_at'),
});

// AI queries
export const aiQueries = sqliteTable('ai_queries', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  dataRoomId: text('data_room_id').notNull().references(() => dataRooms.id),
  queryText: text('query_text').notNull(),
  responseText: text('response_text'),
  filesReferenced: text('files_referenced'), // JSON string of file IDs array
  processingStatus: text('processing_status', { 
    enum: ['pending', 'processing', 'completed', 'failed'] 
  }).default('pending'),
  processingTimeMs: integer('processing_time_ms'),
  createdAt: integer('created_at'),
});

// Notifications
export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  dataRoomId: text('data_room_id').references(() => dataRooms.id),
  type: text('type').notNull(), // 'file_uploaded', 'access_granted', etc.
  title: text('title').notNull(),
  message: text('message'),
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at'),
});

// Watermarks
export const watermarks = sqliteTable('watermarks', {
  id: text('id').primaryKey(),
  dataRoomId: text('data_room_id').notNull().references(() => dataRooms.id),
  template: text('template').notNull(), // watermark template with placeholders
  position: text('position').default('center'), // 'center', 'top-right', etc.
  opacity: real('opacity').default(0.3),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at'),
});