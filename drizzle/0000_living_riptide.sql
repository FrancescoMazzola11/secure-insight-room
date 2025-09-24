CREATE TABLE `ai_queries` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`data_room_id` text NOT NULL,
	`query_text` text NOT NULL,
	`response_text` text,
	`files_referenced` text,
	`processing_status` text DEFAULT 'pending',
	`processing_time_ms` integer,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`data_room_id`) REFERENCES `data_rooms`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `data_room_tags` (
	`id` text PRIMARY KEY NOT NULL,
	`data_room_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`data_room_id`, `tag_id`),
	FOREIGN KEY (`data_room_id`) REFERENCES `data_rooms`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `data_rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_by` text NOT NULL,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	`last_modified` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `file_access_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`file_id` text NOT NULL,
	`data_room_id` text NOT NULL,
	`action` text NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`file_id`) REFERENCES `files`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`data_room_id`) REFERENCES `data_rooms`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `files` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`original_name` text NOT NULL,
	`file_type` text NOT NULL,
	`file_size` integer NOT NULL,
	`file_path` text NOT NULL,
	`mime_type` text,
	`data_room_id` text NOT NULL,
	`folder_id` text,
	`uploaded_by` text NOT NULL,
	`version_number` integer DEFAULT 1,
	`checksum` text,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`data_room_id`) REFERENCES `data_rooms`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`folder_id`) REFERENCES `folders`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `folders` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`data_room_id` text NOT NULL,
	`parent_folder_id` text,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`data_room_id`) REFERENCES `data_rooms`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parent_folder_id`) REFERENCES `folders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`data_room_id` text,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`message` text,
	`is_read` integer DEFAULT false,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`data_room_id`) REFERENCES `data_rooms`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `shared_links` (
	`id` text PRIMARY KEY NOT NULL,
	`data_room_id` text NOT NULL,
	`token` text NOT NULL,
	`password_hash` text,
	`max_uses` integer,
	`current_uses` integer DEFAULT 0,
	`expires_at` integer,
	`rights` text DEFAULT '["view"]',
	`created_by` text NOT NULL,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT (unixepoch()),
	`last_used_at` integer,
	FOREIGN KEY (`data_room_id`) REFERENCES `data_rooms`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `shared_links_token_unique` ON `shared_links` (`token`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`color` text,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);--> statement-breakpoint
CREATE TABLE `user_data_room_permissions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`data_room_id` text NOT NULL,
	`role` text NOT NULL,
	`can_view` integer DEFAULT true,
	`can_upload` integer DEFAULT false,
	`can_download` integer DEFAULT false,
	`can_edit` integer DEFAULT false,
	`can_delete` integer DEFAULT false,
	`ai_access` integer DEFAULT false,
	`watermark_required` integer DEFAULT true,
	`expires_at` integer,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	PRIMARY KEY(`user_id`, `data_room_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`data_room_id`) REFERENCES `data_rooms`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`password_hash` text NOT NULL,
	`is_active` integer DEFAULT true,
	`avatar_url` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	`last_login` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `watermarks` (
	`id` text PRIMARY KEY NOT NULL,
	`data_room_id` text NOT NULL,
	`template` text NOT NULL,
	`position` text DEFAULT 'center',
	`opacity` real DEFAULT 0.3,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`data_room_id`) REFERENCES `data_rooms`(`id`) ON UPDATE no action ON DELETE cascade
);
