import { db } from './database';
import { users, dataRooms, tags, dataRoomTags, folders, files, userDataRoomPermissions } from './schema';
import { eq } from 'drizzle-orm';

export async function seedDatabase() {
  try {
    console.log('Seeding database...');


    // Create a test user only if not exist
    async function findOrCreateUser(id: string, email: string, name: string, passwordHash: string) {
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existing.length > 0) return existing[0];
      const [created] = await db.insert(users).values({ id, email, name, passwordHash }).returning();
      return created;
    }

    const testUser = await findOrCreateUser('temp-user-id', 'test@example.com', 'Test User', 'hashed_password_here');


    // Create tags only if not exist
    async function findOrCreateTag(name: string, color: string) {
  const existing = await db.select().from(tags).where(eq(tags.name, name)).limit(1);
      if (existing.length > 0) return existing[0];
      const [created] = await db.insert(tags).values({ name, color }).returning();
      return created;
    }

    const financialTag = await findOrCreateTag('Financial', '#10B981');
    const legalTag = await findOrCreateTag('Legal', '#3B82F6');
    const taxTag = await findOrCreateTag('Tax', '#F59E0B');
    const businessTag = await findOrCreateTag('Business', '#8B5CF6');

    // Create data rooms
    const [financialRoom] = await db.insert(dataRooms).values({
      id: 'financial',
      name: 'Financial',
      description: 'Documenti finanziari, bilanci e analisi economiche',
      createdBy: testUser.id,
    }).returning();

    const [legalRoom] = await db.insert(dataRooms).values({
      id: 'legal', 
      name: 'Legal',
      description: 'Documenti legali, contratti e adempimenti normativi',
      createdBy: testUser.id,
    }).returning();

    const [taxRoom] = await db.insert(dataRooms).values({
      id: 'tax',
      name: 'Tax', 
      description: 'Documentazione fiscale e adempimenti tributari',
      createdBy: testUser.id,
    }).returning();

    const [businessRoom] = await db.insert(dataRooms).values({
      id: 'business',
      name: 'Business',
      description: 'Informazioni business, clienti, fornitori e operations',
      createdBy: testUser.id,
    }).returning();

    // Link tags to data rooms
    await db.insert(dataRoomTags).values([
      { dataRoomId: financialRoom.id, tagId: financialTag.id },
      { dataRoomId: legalRoom.id, tagId: legalTag.id },
      { dataRoomId: taxRoom.id, tagId: taxTag.id },
      { dataRoomId: businessRoom.id, tagId: businessTag.id },
    ]);

    // Create user permissions
    await db.insert(userDataRoomPermissions).values([
      {
        userId: testUser.id,
        dataRoomId: financialRoom.id,
        role: 'Creator',
        canView: true,
        canUpload: true,
        canDownload: true,
        canEdit: true,
        canDelete: true,
        createdBy: testUser.id,
      },
      {
        userId: testUser.id,
        dataRoomId: legalRoom.id,
        role: 'Editor',
        canView: true,
        canUpload: true,
        canDownload: true,
        canEdit: true,
        canDelete: false,
        createdBy: testUser.id,
      },
      {
        userId: testUser.id,
        dataRoomId: taxRoom.id,
        role: 'Contributor',
        canView: true,
        canUpload: true,
        canDownload: false,
        canEdit: false,
        canDelete: false,
        createdBy: testUser.id,
      },
      {
        userId: testUser.id,
        dataRoomId: businessRoom.id,
        role: 'Creator',
        canView: true,
        canUpload: true,
        canDownload: true,
        canEdit: true,
        canDelete: true,
        createdBy: testUser.id,
      },
    ]);

    // Create folders for Financial room
    const [folder11] = await db.insert(folders).values({
      name: '1.1 General Information',
      dataRoomId: financialRoom.id,
      createdBy: testUser.id,
    }).returning();

    const [folder12] = await db.insert(folders).values({
      name: '1.2 Income Statement', 
      dataRoomId: financialRoom.id,
      createdBy: testUser.id,
    }).returning();

    const [folder13] = await db.insert(folders).values({
      name: '1.3 Balance Sheet',
      dataRoomId: financialRoom.id,
      createdBy: testUser.id,
    }).returning();

    // Create folders for Legal room
    const [folder21] = await db.insert(folders).values({
      name: '2.1 Company Data',
      dataRoomId: legalRoom.id,
      createdBy: testUser.id,
    }).returning();

    const [folder22] = await db.insert(folders).values({
      name: '2.2 Shareholdings',
      dataRoomId: legalRoom.id,
      createdBy: testUser.id,
    }).returning();

    // Create some sample files
    await db.insert(files).values([
      {
        name: 'financial-statement-q4-2024.pdf',
        originalName: 'Financial Statement Q4 2024.pdf',
        fileType: 'PDF',
        fileSize: 2400000, // 2.4MB in bytes
        filePath: '/uploads/financial-statement-q4-2024.pdf',
        mimeType: 'application/pdf',
        dataRoomId: financialRoom.id,
        folderId: folder11.id,
        uploadedBy: testUser.id,
      },
      {
        name: 'income-analysis.xlsx',
        originalName: 'Income Analysis.xlsx',
        fileType: 'Excel',
        fileSize: 1800000, // 1.8MB in bytes
        filePath: '/uploads/income-analysis.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dataRoomId: financialRoom.id,
        folderId: folder12.id,
        uploadedBy: testUser.id,
      },
      {
        name: 'balance-sheet-2024.pdf',
        originalName: 'Balance Sheet 2024.pdf',
        fileType: 'PDF',
        fileSize: 3200000, // 3.2MB in bytes
        filePath: '/uploads/balance-sheet-2024.pdf',
        mimeType: 'application/pdf',
        dataRoomId: financialRoom.id,
        folderId: folder13.id,
        uploadedBy: testUser.id,
      },
    ]);

    console.log('Database seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
seedDatabase().then(() => {
  console.log('Seeding completed!');
  process.exit(0);
}).catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});