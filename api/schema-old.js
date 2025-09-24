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
  pk: primaryKey({ columns: [table.dataRoomId, table.tagId] })
}));

// User permissions for data rooms
export const userDataRoomPermissions = sqliteTable('user_data_room_permissions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  dataRoomId: text('data_room_id').notNull().references(() => dataRooms.id),
  role: text('role').notNull(), // 'Creator', 'Editor', 'Contributor', 'Viewer'
  grantedAt: integer('granted_at'),
  grantedById: text('granted_by_id').references(() => users.id),
});

// Folders table
export const folders = sqliteTable('folders', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  dataRoomId: text('data_room_id').notNull().references(() => dataRooms.id),
  parentFolderId: text('parent_folder_id'),
  createdAt: integer('created_at'),
  createdById: text('created_by_id').references(() => users.id),
});

// Files table
export const files = sqliteTable('files', {
  id: text('id').primaryKey(),
  originalName: text('original_name').notNull(),
  storedName: text('stored_name').notNull(),
  filePath: text('file_path').notNull(),
  fileSize: integer('file_size').notNull(),
  mimeType: text('mime_type').notNull(),
  uploadedAt: integer('uploaded_at'),
  uploadedById: text('uploaded_by_id').notNull().references(() => users.id),
  dataRoomId: text('data_room_id').notNull().references(() => dataRooms.id),
  folderId: text('folder_id').references(() => folders.id),
  isEncrypted: integer('is_encrypted', { mode: 'boolean' }).default(false),
  encryptionKey: text('encryption_key'),
  virusScanStatus: text('virus_scan_status').default('pending'),
  virusScanResult: text('virus_scan_result'),
  version: integer('version').default(1),
  checksum: text('checksum'),
});

// File access logs
export const fileAccessLogs = sqliteTable('file_access_logs', {
  id: text('id').primaryKey(),
  fileId: text('file_id').notNull().references(() => files.id),
  userId: text('user_id').notNull().references(() => users.id),
  action: text('action').notNull(), // 'view', 'download', 'upload', 'delete'
  timestamp: integer('timestamp'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
});