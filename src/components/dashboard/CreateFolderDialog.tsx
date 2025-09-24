import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Folder, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CreateFolderDialogProps {
  onCreateFolder: (name: string) => Promise<void>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  parentFolderName?: string;
}

export function CreateFolderDialog({ 
  onCreateFolder, 
  isOpen, 
  onOpenChange,
  parentFolderName 
}: CreateFolderDialogProps) {
  const [folderName, setFolderName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!folderName.trim()) return;

    setCreating(true);
    setError(null);

    try {
      await onCreateFolder(folderName.trim());
      // Reset form on success
      setFolderName("");
      onOpenChange(false);
    } catch (error) {
      console.error('Folder creation failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to create folder. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    if (!creating) {
      setFolderName("");
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Folder className="w-5 h-5" />
            <span>Create New Folder</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {parentFolderName && (
            <div className="text-sm text-muted-foreground">
              Creating folder in: <span className="font-medium">{parentFolderName}</span>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
              disabled={creating}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && folderName.trim()) {
                  handleCreate();
                }
              }}
            />
          </div>

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
            disabled={creating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!folderName.trim() || creating}
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Folder className="w-4 h-4 mr-2" />
                Create Folder
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}