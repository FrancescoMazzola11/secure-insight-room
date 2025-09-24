// Mock data for browser environment since SQLite can't run in browser
export const mockDataRooms = [
  {
    id: "room-1",
    name: "Financial Documents",
    description: "Q4 2024 financial reports and analysis",
    createdAt: Date.now() - 86400000 * 7, // 7 days ago
    lastModified: Date.now() - 86400000 * 2, // 2 days ago
    tags: ["Financial", "Due Diligence"],
    creatorId: "user-1",
    fileCount: 3,
    folderCount: 3,
    userRole: "Creator"
  },
  {
    id: "room-2", 
    name: "Legal Documents",
    description: "Contracts, agreements, and compliance documents",
    createdAt: Date.now() - 86400000 * 14, // 14 days ago
    lastModified: Date.now() - 86400000 * 1, // 1 day ago
    tags: ["Legal", "Compliance"],
    creatorId: "user-2",
    fileCount: 2,
    folderCount: 3,
    userRole: "Editor"
  },
  {
    id: "room-3",
    name: "Tax Documents", 
    description: "Corporate tax returns and VAT records",
    createdAt: Date.now() - 86400000 * 30, // 30 days ago
    lastModified: Date.now() - 86400000 * 5, // 5 days ago
    tags: ["Tax", "Compliance"],
    creatorId: "user-3",
    fileCount: 1,
    folderCount: 2,
    userRole: "Viewer"
  }
];

export const mockUsers = [
  {
    id: "user-1",
    name: "John Doe",
    email: "john.doe@company.com"
  },
  {
    id: "user-2", 
    name: "Jane Smith",
    email: "jane.smith@company.com"
  },
  {
    id: "user-3",
    name: "Mike Wilson", 
    email: "mike.wilson@company.com"
  }
];