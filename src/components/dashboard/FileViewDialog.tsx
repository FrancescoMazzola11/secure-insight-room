import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { FileText, X, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FileViewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  file: {
    id: string;
    name: string;
    fileType: string;
    fileSize: number;
    uploadedBy: string;
    createdAt: number;
    content?: string;
  } | null;
  onViewFile: (fileId: string) => Promise<void>;
}

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
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString();
}

export function FileViewDialog({ 
  isOpen, 
  onOpenChange, 
  file,
  onViewFile 
}: FileViewDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");

  const handleViewFile = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      await onViewFile(file.id);
      // In a real implementation, you would get the actual content
      setFileContent(`This is a preview of ${file.name}.\n\nFile Type: ${file.fileType.toUpperCase()}\nSize: ${formatFileSize(file.fileSize)}\nUploaded by: ${file.uploadedBy}\nDate: ${formatDate(file.createdAt)}\n\nIn a real implementation, this would show the actual file content or an embedded viewer for PDFs, documents, etc.`);
    } catch (error) {
      console.error('Failed to view file:', error);
      setError(error instanceof Error ? error.message : 'Failed to load file content.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFileContent("");
    setError(null);
    onOpenChange(false);
  };

  // Load file content when dialog opens and file changes
  useState(() => {
    if (isOpen && file && !fileContent && !loading) {
      handleViewFile();
    }
  });

  if (!file) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>{file.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">File Type:</span> {file.fileType.toUpperCase()}
            </div>
            <div>
              <span className="font-medium">Size:</span> {formatFileSize(file.fileSize)}
            </div>
            <div>
              <span className="font-medium">Uploaded by:</span> {file.uploadedBy}
            </div>
            <div>
              <span className="font-medium">Date:</span> {formatDate(file.createdAt)}
            </div>
          </div>

          {/* Content Area */}
          <div className="space-y-2">
            <span className="text-sm font-medium">Content Preview:</span>
            <ScrollArea className="h-96 w-full rounded-md border">
              <div className="p-4">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Loading file content...</p>
                    </div>
                  </div>
                ) : error ? (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : (
                  <Textarea
                    value={fileContent}
                    readOnly
                    className="min-h-80 resize-none border-none p-0 focus-visible:ring-0"
                    placeholder="No content available"
                  />
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}