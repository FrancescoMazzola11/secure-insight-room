import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileText, AlertCircle, Loader2, Folder } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UploadFileDialogProps {
  onUpload: (file: File, customName: string, selectedFolderId?: string) => Promise<void>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  folders: Array<{ id: string; name: string }>;
}

export function UploadFileDialog({ onUpload, isOpen, onOpenChange, folders }: UploadFileDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customName, setCustomName] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | undefined>(undefined);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    // Check file size
    if (file.size > maxFileSize) {
      setError('File size must be less than 10MB');
      return;
    }

    // Check file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      setError(`File type not allowed. Allowed types: ${allowedExtensions.join(', ')}`);
      return;
    }

    setSelectedFile(file);
    // Set default custom name to the original filename
    setCustomName(file.name);
  };

  const handleUpload = async () => {
    if (!selectedFile || !customName.trim()) return;

    setUploading(true);
    setError(null);

    try {
      await onUpload(selectedFile, customName.trim(), selectedFolder);
      // Reset form on success
      setSelectedFile(null);
      setCustomName("");
      setSelectedFolder(undefined);
      onOpenChange(false);
    } catch (error) {
      console.error('Upload failed:', error);
      setError(error instanceof Error ? error.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setSelectedFile(null);
      setCustomName("");
      setSelectedFolder(undefined);
      setError(null);
      onOpenChange(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Upload Document</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Selection */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Select File</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              {!selectedFile ? (
                <div>
                  <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Choose a file to upload
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Supported: {allowedExtensions.join(', ')} (max 10MB)
                  </p>
                  <Input
                    id="file-upload"
                    type="file"
                    accept={allowedExtensions.map(ext => `.${ext}`).join(',')}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Label htmlFor="file-upload">
                    <Button variant="outline" className="cursor-pointer" asChild>
                      <span>Choose File</span>
                    </Button>
                  </Label>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="font-medium">{selectedFile.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      setCustomName("");
                      setSelectedFolder(undefined);
                      setError(null);
                    }}
                    disabled={uploading}
                  >
                    Choose Different File
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Custom Name Input */}
          {selectedFile && (
            <div className="space-y-2">
              <Label htmlFor="custom-name">File Name</Label>
              <Input
                id="custom-name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Enter custom file name"
                disabled={uploading}
              />
              <p className="text-xs text-muted-foreground">
                This name will be displayed in the data room
              </p>
            </div>
          )}

          {/* Folder Selection */}
          {selectedFile && folders.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="folder-select">Upload Location</Label>
              <Select value={selectedFolder || ""} onValueChange={(value) => setSelectedFolder(value || undefined)}>
                <SelectTrigger disabled={uploading}>
                  <SelectValue placeholder="Select folder (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">
                    <div className="flex items-center space-x-2">
                      <Folder className="w-4 h-4" />
                      <span>Main folder (root)</span>
                    </div>
                  </SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      <div className="flex items-center space-x-2">
                        <Folder className="w-4 h-4" />
                        <span>{folder.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose where to store the file
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !customName.trim() || uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}