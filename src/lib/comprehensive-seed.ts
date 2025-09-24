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
  watermarks
} from './schema';
import { randomUUID } from 'crypto';

async function clearAllTables() {
  console.log('Clearing all tables...');
  
  // Delete in reverse dependency order
  await db.delete(fileAccessLogs);
  await db.delete(notifications);
  await db.delete(aiQueries);
  await db.delete(sharedLinks);
  await db.delete(watermarks);
  await db.delete(files);
  await db.delete(folders);
  await db.delete(userDataRoomPermissions);
  await db.delete(dataRoomTags);
  await db.delete(dataRooms);
  await db.delete(tags);
  await db.delete(users);
  
  console.log('All tables cleared!');
}

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Clear existing data first
    await clearAllTables();

    // 1. Create Users (5 sample users)
    console.log('Creating users...');
    const userData = [
      {
        id: 'user-1',
        email: 'john.doe@company.com',
        name: 'John Doe',
        passwordHash: '$2b$10$hashedPasswordExample1',
        avatarUrl: 'https://avatar.com/john'
      },
      {
        id: 'user-2', 
        email: 'jane.smith@company.com',
        name: 'Jane Smith',
        passwordHash: '$2b$10$hashedPasswordExample2',
        avatarUrl: 'https://avatar.com/jane'
      },
      {
        id: 'user-3',
        email: 'mike.wilson@company.com', 
        name: 'Mike Wilson',
        passwordHash: '$2b$10$hashedPasswordExample3',
        avatarUrl: 'https://avatar.com/mike'
      },
      {
        id: 'user-4',
        email: 'sarah.brown@company.com',
        name: 'Sarah Brown', 
        passwordHash: '$2b$10$hashedPasswordExample4',
        avatarUrl: 'https://avatar.com/sarah'
      },
      {
        id: 'user-5',
        email: 'admin@company.com',
        name: 'Admin User',
        passwordHash: '$2b$10$hashedPasswordExample5',
        avatarUrl: 'https://avatar.com/admin'
      }
    ];

    const createdUsers = await db.insert(users).values(userData).returning();
    console.log(`Created ${createdUsers.length} users`);

    // 2. Create Tags
    console.log('Creating tags...');
    const tagData = [
      { id: 'tag-1', name: 'Financial', color: '#10B981' },
      { id: 'tag-2', name: 'Legal', color: '#3B82F6' },
      { id: 'tag-3', name: 'Tax', color: '#F59E0B' },
      { id: 'tag-4', name: 'Business', color: '#8B5CF6' },
      { id: 'tag-5', name: 'HR', color: '#EF4444' },
      { id: 'tag-6', name: 'Compliance', color: '#06B6D4' },
      { id: 'tag-7', name: 'Due Diligence', color: '#84CC16' }
    ];

    const createdTags = await db.insert(tags).values(tagData).returning();
    console.log(`Created ${createdTags.length} tags`);

    // 3. Create Data Rooms (4 main data rooms)
    console.log('Creating data rooms...');
    const dataRoomData = [
      {
        id: 'dataroom-1',
        name: 'Financial Documents',
        description: 'Financial statements, budgets, and economic analyses',
        createdBy: 'user-1' // John Doe
      },
      {
        id: 'dataroom-2', 
        name: 'Legal Documents',
        description: 'Legal contracts, compliance documents, and regulatory filings',
        createdBy: 'user-2' // Jane Smith
      },
      {
        id: 'dataroom-3',
        name: 'Tax Documents', 
        description: 'Tax returns, assessments, and fiscal documentation',
        createdBy: 'user-3' // Mike Wilson
      },
      {
        id: 'dataroom-4',
        name: 'Business Operations',
        description: 'Business plans, client information, and operational documents',
        createdBy: 'user-1' // John Doe
      }
    ];

    const createdDataRooms = await db.insert(dataRooms).values(dataRoomData).returning();
    console.log(`Created ${createdDataRooms.length} data rooms`);

    // 4. Create Data Room Tags (many-to-many relationships)
    console.log('Creating data room tag associations...');
    const dataRoomTagData = [
      { dataRoomId: 'dataroom-1', tagId: 'tag-1' }, // Financial -> Financial tag
      { dataRoomId: 'dataroom-1', tagId: 'tag-7' }, // Financial -> Due Diligence
      { dataRoomId: 'dataroom-2', tagId: 'tag-2' }, // Legal -> Legal tag
      { dataRoomId: 'dataroom-2', tagId: 'tag-6' }, // Legal -> Compliance
      { dataRoomId: 'dataroom-3', tagId: 'tag-3' }, // Tax -> Tax tag
      { dataRoomId: 'dataroom-3', tagId: 'tag-6' }, // Tax -> Compliance
      { dataRoomId: 'dataroom-4', tagId: 'tag-4' }, // Business -> Business tag
      { dataRoomId: 'dataroom-4', tagId: 'tag-5' }  // Business -> HR
    ];

    await db.insert(dataRoomTags).values(dataRoomTagData);
    console.log(`Created ${dataRoomTagData.length} data room tag associations`);

    // 5. Create User Data Room Permissions
    console.log('Creating user permissions...');
    const permissionData = [
      // John Doe - Creator of Financial and Business rooms
      { userId: 'user-1', dataRoomId: 'dataroom-1', role: 'Creator' as const, canView: true, canUpload: true, canDownload: true, canEdit: true, canDelete: true, aiAccess: true, createdBy: 'user-5' },
      { userId: 'user-1', dataRoomId: 'dataroom-4', role: 'Creator' as const, canView: true, canUpload: true, canDownload: true, canEdit: true, canDelete: true, aiAccess: true, createdBy: 'user-5' },
      
      // Jane Smith - Creator of Legal room, Editor in others
      { userId: 'user-2', dataRoomId: 'dataroom-2', role: 'Creator' as const, canView: true, canUpload: true, canDownload: true, canEdit: true, canDelete: true, aiAccess: true, createdBy: 'user-5' },
      { userId: 'user-2', dataRoomId: 'dataroom-1', role: 'Editor' as const, canView: true, canUpload: true, canDownload: true, canEdit: true, canDelete: false, aiAccess: true, createdBy: 'user-1' },
      
      // Mike Wilson - Creator of Tax room, Contributor in others
      { userId: 'user-3', dataRoomId: 'dataroom-3', role: 'Creator' as const, canView: true, canUpload: true, canDownload: true, canEdit: true, canDelete: true, aiAccess: true, createdBy: 'user-5' },
      { userId: 'user-3', dataRoomId: 'dataroom-1', role: 'Contributor' as const, canView: true, canUpload: true, canDownload: false, canEdit: false, canDelete: false, aiAccess: false, createdBy: 'user-1' },
      
      // Sarah Brown - Viewer across multiple rooms
      { userId: 'user-4', dataRoomId: 'dataroom-1', role: 'Viewer' as const, canView: true, canUpload: false, canDownload: false, canEdit: false, canDelete: false, aiAccess: false, createdBy: 'user-1' },
      { userId: 'user-4', dataRoomId: 'dataroom-2', role: 'Viewer' as const, canView: true, canUpload: false, canDownload: false, canEdit: false, canDelete: false, aiAccess: false, createdBy: 'user-2' },
      
      // Admin - Creator access to all rooms
      { userId: 'user-5', dataRoomId: 'dataroom-1', role: 'Creator' as const, canView: true, canUpload: true, canDownload: true, canEdit: true, canDelete: true, aiAccess: true, createdBy: 'user-5' },
      { userId: 'user-5', dataRoomId: 'dataroom-2', role: 'Creator' as const, canView: true, canUpload: true, canDownload: true, canEdit: true, canDelete: true, aiAccess: true, createdBy: 'user-5' },
      { userId: 'user-5', dataRoomId: 'dataroom-3', role: 'Creator' as const, canView: true, canUpload: true, canDownload: true, canEdit: true, canDelete: true, aiAccess: true, createdBy: 'user-5' },
      { userId: 'user-5', dataRoomId: 'dataroom-4', role: 'Creator' as const, canView: true, canUpload: true, canDownload: true, canEdit: true, canDelete: true, aiAccess: true, createdBy: 'user-5' }
    ];

    await db.insert(userDataRoomPermissions).values(permissionData);
    console.log(`Created ${permissionData.length} user permissions`);

    // 6. Create Folders
    console.log('Creating folders...');
    const folderData = [
      // Financial room folders
      { id: 'folder-1', name: 'Q4 2024 Reports', dataRoomId: 'dataroom-1', createdBy: 'user-1' },
      { id: 'folder-2', name: 'Budget Analysis', dataRoomId: 'dataroom-1', createdBy: 'user-1' },
      { id: 'folder-3', name: 'Audits', dataRoomId: 'dataroom-1', createdBy: 'user-2' },
      
      // Legal room folders  
      { id: 'folder-4', name: 'Contracts', dataRoomId: 'dataroom-2', createdBy: 'user-2' },
      { id: 'folder-5', name: 'Regulatory', dataRoomId: 'dataroom-2', createdBy: 'user-2' },
      { id: 'folder-6', name: 'IP Documents', dataRoomId: 'dataroom-2', createdBy: 'user-2' },
      
      // Tax room folders
      { id: 'folder-7', name: '2024 Tax Returns', dataRoomId: 'dataroom-3', createdBy: 'user-3' },
      { id: 'folder-8', name: 'VAT Records', dataRoomId: 'dataroom-3', createdBy: 'user-3' },
      
      // Business room folders
      { id: 'folder-9', name: 'Strategic Plans', dataRoomId: 'dataroom-4', createdBy: 'user-1' },
      { id: 'folder-10', name: 'Client Data', dataRoomId: 'dataroom-4', createdBy: 'user-1' },
      
      // Subfolder example
      { id: 'folder-11', name: 'Client Contracts', dataRoomId: 'dataroom-4', parentFolderId: 'folder-10', createdBy: 'user-1' }
    ];

    const createdFolders = await db.insert(folders).values(folderData).returning();
    console.log(`Created ${createdFolders.length} folders`);

    // 7. Create Files
    console.log('Creating files...');
    const fileData = [
      // Financial files
      {
        id: 'file-1',
        name: 'q4-financial-statement.pdf',
        originalName: 'Q4 2024 Financial Statement.pdf',
        fileType: 'PDF',
        fileSize: 2500000,
        filePath: '/uploads/financial/q4-financial-statement.pdf',
        mimeType: 'application/pdf',
        dataRoomId: 'dataroom-1',
        folderId: 'folder-1',
        uploadedBy: 'user-1',
        checksum: 'abc123def456'
      },
      {
        id: 'file-2', 
        name: 'budget-analysis-2025.xlsx',
        originalName: 'Budget Analysis 2025.xlsx',
        fileType: 'Excel',
        fileSize: 1800000,
        filePath: '/uploads/financial/budget-analysis-2025.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dataRoomId: 'dataroom-1',
        folderId: 'folder-2',
        uploadedBy: 'user-2',
        checksum: 'def456ghi789'
      },
      {
        id: 'file-3',
        name: 'audit-report-2024.pdf',
        originalName: 'Annual Audit Report 2024.pdf', 
        fileType: 'PDF',
        fileSize: 3200000,
        filePath: '/uploads/financial/audit-report-2024.pdf',
        mimeType: 'application/pdf',
        dataRoomId: 'dataroom-1',
        folderId: 'folder-3',
        uploadedBy: 'user-2',
        checksum: 'ghi789jkl012'
      },
      
      // Legal files
      {
        id: 'file-4',
        name: 'service-agreement-template.docx',
        originalName: 'Service Agreement Template.docx',
        fileType: 'Word',
        fileSize: 450000,
        filePath: '/uploads/legal/service-agreement-template.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        dataRoomId: 'dataroom-2',
        folderId: 'folder-4',
        uploadedBy: 'user-2',
        checksum: 'jkl012mno345'
      },
      {
        id: 'file-5',
        name: 'compliance-checklist.pdf',
        originalName: 'Regulatory Compliance Checklist.pdf',
        fileType: 'PDF', 
        fileSize: 850000,
        filePath: '/uploads/legal/compliance-checklist.pdf',
        mimeType: 'application/pdf',
        dataRoomId: 'dataroom-2',
        folderId: 'folder-5',
        uploadedBy: 'user-2',
        checksum: 'mno345pqr678'
      },
      
      // Tax files
      {
        id: 'file-6',
        name: 'corporate-tax-return-2024.pdf',
        originalName: 'Corporate Tax Return 2024.pdf',
        fileType: 'PDF',
        fileSize: 1200000,
        filePath: '/uploads/tax/corporate-tax-return-2024.pdf',
        mimeType: 'application/pdf',
        dataRoomId: 'dataroom-3',
        folderId: 'folder-7',
        uploadedBy: 'user-3',
        checksum: 'pqr678stu901'
      },
      
      // Business files
      {
        id: 'file-7',
        name: 'strategic-plan-2025.pptx',
        originalName: 'Strategic Plan 2025.pptx',
        fileType: 'PowerPoint',
        fileSize: 5400000,
        filePath: '/uploads/business/strategic-plan-2025.pptx',
        mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        dataRoomId: 'dataroom-4',
        folderId: 'folder-9',
        uploadedBy: 'user-1',
        checksum: 'stu901vwx234'
      },
      {
        id: 'file-8',
        name: 'client-contract-acme.pdf',
        originalName: 'Client Contract - ACME Corp.pdf',
        fileType: 'PDF',
        fileSize: 980000,
        filePath: '/uploads/business/client-contract-acme.pdf',
        mimeType: 'application/pdf',
        dataRoomId: 'dataroom-4',
        folderId: 'folder-11',
        uploadedBy: 'user-1',
        checksum: 'vwx234yza567'
      }
    ];

    const createdFiles = await db.insert(files).values(fileData).returning();
    console.log(`Created ${createdFiles.length} files`);

    // 8. Create File Access Logs
    console.log('Creating file access logs...');
    const accessLogData = [
      {
        userId: 'user-1',
        fileId: 'file-1',
        dataRoomId: 'dataroom-1',
        action: 'upload' as const,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        userId: 'user-2',
        fileId: 'file-1',
        dataRoomId: 'dataroom-1', 
        action: 'view' as const,
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      {
        userId: 'user-4',
        fileId: 'file-1',
        dataRoomId: 'dataroom-1',
        action: 'view' as const,
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
      },
      {
        userId: 'user-2',
        fileId: 'file-4',
        dataRoomId: 'dataroom-2',
        action: 'upload' as const,
        ipAddress: '192.168.1.101', 
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      {
        userId: 'user-3',
        fileId: 'file-6',
        dataRoomId: 'dataroom-3',
        action: 'upload' as const,
        ipAddress: '192.168.1.103',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    ];

    await db.insert(fileAccessLogs).values(accessLogData);
    console.log(`Created ${accessLogData.length} file access logs`);

    // 9. Create Shared Links
    console.log('Creating shared links...');
    const sharedLinkData = [
      {
        id: 'link-1',
        dataRoomId: 'dataroom-1',
        token: 'secure-token-financial-123',
        passwordHash: '$2b$10$hashedLinkPassword1',
        maxUses: 10,
        currentUses: 3,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        rights: ['view', 'download'],
        createdBy: 'user-1'
      },
      {
        id: 'link-2',
        dataRoomId: 'dataroom-2',
        token: 'secure-token-legal-456',
        maxUses: 5,
        currentUses: 1,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        rights: ['view'],
        createdBy: 'user-2'
      }
    ];

    await db.insert(sharedLinks).values(sharedLinkData);
    console.log(`Created ${sharedLinkData.length} shared links`);

    // 10. Create AI Queries
    console.log('Creating AI queries...');
    const aiQueryData = [
      {
        id: 'query-1',
        userId: 'user-1',
        dataRoomId: 'dataroom-1',
        queryText: 'What are the key financial metrics from Q4 2024?',
        responseText: 'Based on the Q4 2024 financial statement, key metrics include: Revenue of $2.5M, Net Profit of $450K, and Operating Expenses of $1.8M.',
        filesReferenced: ['file-1'],
        processingStatus: 'completed' as const,
        processingTimeMs: 2500
      },
      {
        id: 'query-2',
        userId: 'user-2',
        dataRoomId: 'dataroom-2',
        queryText: 'Are there any compliance issues in our contracts?',
        responseText: 'Review of contract templates shows good compliance with current regulations. Recommend updating data protection clauses for GDPR compliance.',
        filesReferenced: ['file-4', 'file-5'],
        processingStatus: 'completed' as const,
        processingTimeMs: 3200
      },
      {
        id: 'query-3',
        userId: 'user-3',
        dataRoomId: 'dataroom-3',
        queryText: 'What tax deductions are available for this year?',
        processingStatus: 'pending' as const
      }
    ];

    await db.insert(aiQueries).values(aiQueryData);
    console.log(`Created ${aiQueryData.length} AI queries`);

    // 11. Create Notifications
    console.log('Creating notifications...');
    const notificationData = [
      {
        userId: 'user-4',
        dataRoomId: 'dataroom-1',
        type: 'file_uploaded',
        title: 'New Financial Document',
        message: 'Q4 2024 Financial Statement has been uploaded to the Financial Documents room.',
        isRead: false
      },
      {
        userId: 'user-2',
        dataRoomId: 'dataroom-1',
        type: 'access_granted',
        title: 'Access Granted',
        message: 'You have been granted Editor access to Financial Documents room.',
        isRead: true
      },
      {
        userId: 'user-1',
        dataRoomId: 'dataroom-1',
        type: 'ai_query_completed',
        title: 'AI Analysis Complete',
        message: 'Your financial metrics analysis has been completed.',
        isRead: false
      },
      {
        userId: 'user-3',
        type: 'system_update',
        title: 'System Maintenance',
        message: 'Scheduled maintenance will occur this weekend.',
        isRead: false
      }
    ];

    await db.insert(notifications).values(notificationData);
    console.log(`Created ${notificationData.length} notifications`);

    // 12. Create Watermarks
    console.log('Creating watermarks...');
    const watermarkData = [
      {
        dataRoomId: 'dataroom-1',
        template: 'CONFIDENTIAL - {{user.name}} - {{timestamp}}',
        position: 'center',
        opacity: 0.3
      },
      {
        dataRoomId: 'dataroom-2',
        template: 'LEGAL DOCUMENT - {{user.email}} - {{date}}',
        position: 'top-right',
        opacity: 0.4
      },
      {
        dataRoomId: 'dataroom-3',
        template: 'TAX DOCUMENT - DO NOT DISTRIBUTE',
        position: 'bottom-center',
        opacity: 0.5
      }
    ];

    await db.insert(watermarks).values(watermarkData);
    console.log(`Created ${watermarkData.length} watermarks`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\nSummary:');
    console.log(`- ${createdUsers.length} users`);
    console.log(`- ${createdTags.length} tags`);
    console.log(`- ${createdDataRooms.length} data rooms`);
    console.log(`- ${dataRoomTagData.length} data room tag associations`);
    console.log(`- ${permissionData.length} user permissions`);
    console.log(`- ${createdFolders.length} folders`);
    console.log(`- ${createdFiles.length} files`);
    console.log(`- ${accessLogData.length} access logs`);
    console.log(`- ${sharedLinkData.length} shared links`);
    console.log(`- ${aiQueryData.length} AI queries`);
    console.log(`- ${notificationData.length} notifications`);
    console.log(`- ${watermarkData.length} watermarks`);

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Run seeding
seedDatabase().then(() => {
  console.log('Seeding completed!');
  process.exit(0);
}).catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});