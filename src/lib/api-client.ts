// API client for communicating with the backend server

const API_BASE_URL = 'http://localhost:3001/api';

class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new ApiError(errorData.error || `HTTP ${response.status}`, response.status);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network or other errors
    throw new ApiError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`, 0);
  }
}

export interface DataRoom {
  id: string;
  name: string;
  description: string;
  tags: string[];
  createdAt: number;
  lastModified: number;
  creatorId: string;
  fileCount: number;
  folderCount: number;
  role?: string; // User's role in this room
}

export interface File {
  id: string;
  originalName: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  createdAt: number;
  dataRoomId: string;
  folderId?: string;
  isEncrypted: boolean;
  encryptionKey?: string;
  isVirusScanned: boolean;
  virusScanStatus: string;
}

export interface Folder {
  id: string;
  name: string;
  parentFolderId?: string;
  dataRoomId: string;
  createdAt: number;
  createdBy: string;
}

export interface DataRoomDetails extends DataRoom {
  files: File[];
  folders: Folder[];
}

export interface DashboardStats {
  totalRooms: number;
  totalFiles: number;
  totalUsers: number;
  recentActivity: number;
}

export interface CreateDataRoomRequest {
  name: string;
  description: string;
  tags: string[];
  creatorId: string;
}

export interface UploadFileRequest {
  originalName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileType: string;
  uploadedBy: string;
  folderId?: string;
}

export interface CreateFolderRequest {
  name: string;
  parentFolderId?: string;
  createdBy: string;
}

export interface FileViewResponse {
  id: string;
  name: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  createdAt: number;
  content: string;
}

// API Service class
export class ApiService {
  // Get all data rooms for a specific user
  static async getUserDataRooms(userId: string): Promise<DataRoom[]> {
    return apiRequest<DataRoom[]>(`/data-rooms/${userId}`);
  }

  // Get all data rooms (for admin or stats)
  static async getAllDataRooms(): Promise<DataRoom[]> {
    return apiRequest<DataRoom[]>('/data-rooms');
  }

  // Get dashboard statistics
  static async getDashboardStats(): Promise<DashboardStats> {
    return apiRequest<DashboardStats>('/stats');
  }

  // Get specific data room details
  static async getDataRoom(id: string, userId: string = 'user-1'): Promise<DataRoomDetails> {
    return apiRequest<DataRoomDetails>(`/data-room/${id}?userId=${userId}`);
  }

  // Create new data room
  static async createDataRoom(data: CreateDataRoomRequest): Promise<{ id: string; message: string }> {
    return apiRequest('/data-rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Upload file to data room
  static async uploadFile(dataRoomId: string, fileData: UploadFileRequest): Promise<{ id: string; message: string; file: File }> {
    return apiRequest(`/data-rooms/${dataRoomId}/files`, {
      method: 'POST',
      body: JSON.stringify(fileData),
    });
  }

  // View file content
  static async viewFile(fileId: string, userId: string = 'user-1'): Promise<FileViewResponse> {
    return apiRequest<FileViewResponse>(`/files/${fileId}/view?userId=${userId}`);
  }

  // Rename file
  static async renameFile(fileId: string, newName: string, userId: string = 'user-1'): Promise<{ message: string }> {
    return apiRequest(`/files/${fileId}`, {
      method: 'PUT',
      body: JSON.stringify({ newName, userId }),
    });
  }

  // Delete file
  static async deleteFile(fileId: string, userId: string = 'user-1'): Promise<{ message: string }> {
    return apiRequest(`/files/${fileId}?userId=${userId}`, {
      method: 'DELETE',
    });
  }

  // Create folder
  static async createFolder(dataRoomId: string, folderData: CreateFolderRequest): Promise<{ id: string; message: string; folder: Folder }> {
    return apiRequest(`/data-rooms/${dataRoomId}/folders`, {
      method: 'POST',
      body: JSON.stringify(folderData),
    });
  }

  // Rename folder
  static async renameFolder(folderId: string, newName: string, userId: string = 'user-1'): Promise<{ message: string }> {
    return apiRequest(`/folders/${folderId}`, {
      method: 'PUT',
      body: JSON.stringify({ newName, userId }),
    });
  }

  // Delete folder
  static async deleteFolder(folderId: string, userId: string = 'user-1'): Promise<{ message: string }> {
    return apiRequest(`/folders/${folderId}?userId=${userId}`, {
      method: 'DELETE',
    });
  }

  // Get all available tags
  static async getAllTags(): Promise<string[]> {
    return apiRequest<string[]>('/tags');
  }

  // Health check
  static async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return apiRequest('/health');
  }
}

export { ApiError };