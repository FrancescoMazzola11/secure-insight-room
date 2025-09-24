import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Bot,
  Upload,
  Search,
  Settings,
  Folder,
  FolderPlus,
  MessageSquare,
  File,
  Download,
  Eye,
  Edit3,
  Trash2,
  Loader2,
  AlertCircle,
  BarChart3
} from "lucide-react";
import { ApiService, type DataRoomDetails, type File as ApiFile, type Folder as ApiFolder } from "@/lib/api-client";
import { UploadFileDialog } from "@/components/dashboard/UploadFileDialog";
import { CreateFolderDialog } from "@/components/dashboard/CreateFolderDialog";
import { RenameDialog } from "@/components/dashboard/RenameDialog";
import { FileViewDialog } from "@/components/dashboard/FileViewDialog";

// Helper functions
function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
  return date.toLocaleDateString();
}

// Mock files for folders
const mockFilesInFolders = {
  "folder-1": [
    {
      id: "file-1",
      name: "Q4_Financial_Report.pdf",
      originalName: "Q4_Financial_Report.pdf",
      fileType: "pdf",
      fileSize: 2500000,
      mimeType: "application/pdf",
      uploadedBy: "John Smith",
      createdAt: Date.now() - 86400000,
    },
    {
      id: "file-2", 
      name: "Revenue_Analysis.xlsx",
      originalName: "Revenue_Analysis.xlsx",
      fileType: "xlsx",
      fileSize: 1200000,
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      uploadedBy: "Sarah Johnson",
      createdAt: Date.now() - 172800000,
    }
  ],
  "folder-2": [
    {
      id: "file-3",
      name: "Purchase_Agreement.docx",
      originalName: "Purchase_Agreement.docx", 
      fileType: "docx",
      fileSize: 800000,
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      uploadedBy: "Legal Team",
      createdAt: Date.now() - 259200000,
    }
  ],
  "folder-3": [
    {
      id: "file-4",
      name: "Employee_List.csv",
      originalName: "Employee_List.csv",
      fileType: "csv", 
      fileSize: 150000,
      mimeType: "text/csv",
      uploadedBy: "HR Department",
      createdAt: Date.now() - 345600000,
    }
  ],
  "folder-4": [
    {
      id: "file-5",
      name: "S1_Registration.pdf",
      originalName: "S1_Registration.pdf",
      fileType: "pdf",
      fileSize: 5000000,
      mimeType: "application/pdf", 
      uploadedBy: "SEC Filing Team",
      createdAt: Date.now() - 432000000,
    }
  ],
  "folder-5": [
    {
      id: "file-6",
      name: "Audited_Financials_2023.pdf",
      originalName: "Audited_Financials_2023.pdf",
      fileType: "pdf",
      fileSize: 3200000,
      mimeType: "application/pdf",
      uploadedBy: "Accounting",
      createdAt: Date.now() - 518400000,
    }
  ]
};

export default function DataRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [currentDataRoom, setCurrentDataRoom] = useState<DataRoomDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false);
  const [renameDialog, setRenameDialog] = useState<{ 
    isOpen: boolean; 
    type: 'file' | 'folder' | null; 
    id: string | null; 
    currentName: string; 
  }>({ isOpen: false, type: null, id: null, currentName: '' });
  const [viewFileDialog, setViewFileDialog] = useState<{ 
    isOpen: boolean; 
    file: {
      id: string;
      name: string;
      fileType: string;
      fileSize: number;
      uploadedBy: string;
      createdAt: number;
      content?: string;
    } | null; 
  }>({ isOpen: false, file: null });
  
  // For now, we'll use a hardcoded user ID. In a real app, this would come from authentication
  const currentUserId = "user-1"; // John Doe

  // Load data room data on component mount or ID change
  useEffect(() => {
    const loadDataRoom = async () => {
      if (typeof id !== "string" || !id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Loading data room ${id} from API...`);
        const dataRoom = await ApiService.getDataRoom(id, currentUserId);
        setCurrentDataRoom(dataRoom);
        console.log('Data room loaded:', dataRoom);
      } catch (error) {
        console.error('Error loading data room:', error);
        setError('Data room not found or you do not have permission to access it.');
      } finally {
        setLoading(false);
      }
    };

    loadDataRoom();
  }, [id, currentUserId]);

  // Get files for selected folder or all files if no folder selected
  const getDisplayFiles = (): ApiFile[] => {
    if (!currentDataRoom) return [];
    
    if (selectedFolder) {
      return currentDataRoom.files.filter(file => file.folderId === selectedFolder);
    }
    return currentDataRoom.files.filter(file => !file.folderId); // Root level files
  };

  // Get folders that are at root level (no parent folder)
  const getRootFolders = (): ApiFolder[] => {
    if (!currentDataRoom) return [];
    return currentDataRoom.folders.filter(folder => !folder.parentFolderId);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header breadcrumbs={[{ label: "Data Room", href: "/" }, { label: "Loading..." }]} />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading data room...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  if (error || !currentDataRoom) {
    return (
      <div className="min-h-screen bg-background">
        <Header breadcrumbs={[{ label: "Data Room", href: "/" }, { label: "Not Found" }]} />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-4">Data Room not found</h1>
            <p className="text-muted-foreground mb-6">
              {error || "The requested data room could not be found."}
            </p>
            <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
          </div>
        </main>
      </div>
    );
  }

  const breadcrumbs = [
    { label: "Data Room", href: "/" },
    { label: currentDataRoom.name }
  ];

  const displayFiles = getDisplayFiles();
  const filteredDocuments = displayFiles.filter(file =>
    file.originalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAiQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    // Here you would implement AI query logic
    console.log("AI Query:", aiQuery);
  };

  const handleFileUpload = async (file: File, customName: string) => {
    if (!currentDataRoom || !id) {
      throw new Error('Data room not available');
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    
    const uploadData = {
      originalName: customName,
      fileName: customName,
      fileSize: file.size,
      mimeType: file.type,
      fileType: fileExtension,
      uploadedBy: currentUserId,
      folderId: selectedFolder || undefined
    };

    try {
      console.log('Uploading file:', uploadData);
      await ApiService.uploadFile(id, uploadData);
      
      // Reload the data room to show the new file
      const updatedDataRoom = await ApiService.getDataRoom(id, currentUserId);
      setCurrentDataRoom(updatedDataRoom);
      
      console.log('File uploaded successfully');
    } catch (error) {
      console.error('Failed to upload file:', error);
      throw error;
    }
  };

  const handleCreateFolder = async (name: string) => {
    if (!currentDataRoom || !id) return;
    try {
      await ApiService.createFolder(currentDataRoom.id, {
        name,
        parentFolderId: selectedFolder || undefined,
        createdBy: currentUserId
      });
      // Refresh data room
      const updatedDataRoom = await ApiService.getDataRoom(id, currentUserId);
      setCurrentDataRoom(updatedDataRoom);
      setIsCreateFolderDialogOpen(false);
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  };

  const handleRename = async (newName: string) => {
    if (!id) return;
    try {
      if (renameDialog.type === 'file' && renameDialog.id) {
        await ApiService.renameFile(renameDialog.id, newName);
      } else if (renameDialog.type === 'folder' && renameDialog.id) {
        await ApiService.renameFolder(renameDialog.id, newName);
      }
      // Refresh data room
      const updatedDataRoom = await ApiService.getDataRoom(id, currentUserId);
      setCurrentDataRoom(updatedDataRoom);
      setRenameDialog({ isOpen: false, type: null, id: null, currentName: '' });
    } catch (error) {
      console.error('Error renaming:', error);
      throw error;
    }
  };

  const handleDelete = async (type: 'file' | 'folder', itemId: string) => {
    if (!id) return;
    try {
      if (type === 'file') {
        await ApiService.deleteFile(itemId);
      } else {
        await ApiService.deleteFolder(itemId);
      }
      // Refresh data room
      const updatedDataRoom = await ApiService.getDataRoom(id, currentUserId);
      setCurrentDataRoom(updatedDataRoom);
    } catch (error) {
      console.error('Error deleting:', error);
      throw error;
    }
  };

  const openRenameDialog = (type: 'file' | 'folder', id: string, currentName: string) => {
    setRenameDialog({ isOpen: true, type, id, currentName });
  };

  const openViewFileDialog = (file: ApiFile) => {
    // Map ApiFile to FileViewDialog expected format
    const mappedFile = {
      id: file.id,
      name: file.originalName,
      fileType: file.mimeType.split('/')[1] || 'unknown', // Extract file type from mime type
      fileSize: file.fileSize,
      uploadedBy: file.uploadedBy,
      createdAt: file.createdAt,
      content: undefined // Will be loaded by the dialog
    };
    setViewFileDialog({ isOpen: true, file: mappedFile });
  };

  const handleViewFile = async (fileId: string) => {
    try {
      await ApiService.viewFile(fileId);
    } catch (error) {
      console.error('Error viewing file:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header breadcrumbs={breadcrumbs} />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-8">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-foreground">{currentDataRoom.name}</h1>
              <Badge className="bg-primary/10 text-primary border-primary/20">
                {currentDataRoom.role}
              </Badge>
            </div>
            <p className="text-muted-foreground">{currentDataRoom.description}</p>
            <div className="flex space-x-2">
              {currentDataRoom.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => navigate(`/data-room/${id}/permissions`)}>
              <Settings className="w-4 h-4 mr-2" />
              Manage Permissions
            </Button>
            <Button variant="outline" onClick={() => setIsCreateFolderDialogOpen(true)}>
              <FolderPlus className="w-4 h-4 mr-2" />
              Create Folder
            </Button>
            <Button onClick={() => setShowUploadDialog(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Documents
            </Button>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="documents" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="documents" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Documents</span>
            </TabsTrigger>
            <TabsTrigger value="ai-agent" className="flex items-center space-x-2">
              <Bot className="w-4 h-4" />
              <span>AI Agent</span>
            </TabsTrigger>
          </TabsList>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Button onClick={() => setShowUploadDialog(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Documents
              </Button>
            </div>

            {/* Folders */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {getRootFolders().map((folder) => (
                <Card 
                  key={folder.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedFolder === folder.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedFolder(selectedFolder === folder.id ? null : folder.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Folder className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{folder.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {currentDataRoom.files.filter(f => f.folderId === folder.id).length} documents
                        </p>
                      </div>
                      {currentDataRoom.role !== "Viewer" && (
                        <div className="flex items-center space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openRenameDialog('folder', folder.id, folder.name);
                            }}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete('folder', folder.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Documents List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Folder className="w-5 h-5" />
                    <span>
                      {selectedFolder 
                        ? `Documents in ${currentDataRoom.folders.find(f => f.id === selectedFolder)?.name}`
                        : `All Documents (${filteredDocuments.length})`
                      }
                    </span>
                  </div>
                  {selectedFolder && (
                    <Button variant="ghost" onClick={() => setSelectedFolder(null)}>
                      Show All
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {filteredDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{doc.originalName}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(doc.fileSize)} • Uploaded by {doc.uploadedBy} • {formatDate(doc.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openViewFileDialog(doc)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {currentDataRoom.role !== "Viewer" && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openRenameDialog('file', doc.id, doc.originalName)}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDelete('file', doc.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Agent Tab */}
          <TabsContent value="ai-agent" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Query Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5" />
                    <span>Ask AI Agent</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAiQuery} className="space-y-4">
                    <Input
                      placeholder="Ask about the documents... (e.g., 'What was the revenue growth in Q4?')"
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                    />
                    <Button type="submit" className="w-full" disabled={!aiQuery.trim()}>
                      <Bot className="w-4 h-4 mr-2" />
                      Ask AI Agent
                    </Button>
                  </form>

                  <div className="mt-6">
                    <h4 className="font-medium text-foreground mb-3">Saved Prompts</h4>
                    <div className="space-y-2">
                      {[
                        "Show revenue vs. EBITDA margin trend",
                        "Summarize key financial highlights",
                        "Compare Q4 vs Q3 performance"
                      ].map((prompt, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          className="w-full justify-start text-left"
                          onClick={() => setAiQuery(prompt)}
                        >
                          {prompt}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dashboard Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>AI-Generated Dashboard</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted/30 rounded-md flex items-center justify-center">
                    <div className="text-center">
                      <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">
                        Ask a question to generate insights and visualizations
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Upload File Dialog */}
      <UploadFileDialog
        isOpen={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onUpload={handleFileUpload}
        folders={currentDataRoom?.folders || []}
      />

      {/* Create Folder Dialog */}
      <CreateFolderDialog
        isOpen={isCreateFolderDialogOpen}
        onOpenChange={setIsCreateFolderDialogOpen}
        onCreateFolder={handleCreateFolder}
      />

      {/* Rename Dialog */}
      <RenameDialog
        isOpen={renameDialog.isOpen}
        onOpenChange={(open) => !open && setRenameDialog({ isOpen: false, type: null, id: null, currentName: '' })}
        title={renameDialog.type === 'file' ? 'Rename File' : 'Rename Folder'}
        currentName={renameDialog.currentName}
        onRename={handleRename}
      />

      {/* File View Dialog */}
      <FileViewDialog
        isOpen={viewFileDialog.isOpen}
        onOpenChange={(open) => !open && setViewFileDialog({ isOpen: false, file: null })}
        file={viewFileDialog.file}
        onViewFile={handleViewFile}
      />
    </div>
  );
}