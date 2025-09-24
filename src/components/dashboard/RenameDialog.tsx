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
import { Edit3, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RenameDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRename: (newName: string) => Promise<void>;
  currentName: string;
  title: string; // "Rename File" or "Rename Folder"
}

export function RenameDialog({ 
  isOpen, 
  onOpenChange, 
  onRename, 
  currentName, 
  title 
}: RenameDialogProps) {
  const [newName, setNewName] = useState(currentName);
  const [renaming, setRenaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRename = async () => {
    if (!newName.trim() || newName.trim() === currentName) return;

    setRenaming(true);
    setError(null);

    try {
      await onRename(newName.trim());
      onOpenChange(false);
    } catch (error) {
      console.error('Rename failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to rename. Please try again.');
    } finally {
      setRenaming(false);
    }
  };

  const handleClose = () => {
    if (!renaming) {
      setNewName(currentName);
      setError(null);
      onOpenChange(false);
    }
  };

  // Reset name when dialog opens with new currentName
  useState(() => {
    setNewName(currentName);
  });

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Edit3 className="w-5 h-5" />
            <span>{title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-name">New Name</Label>
            <Input
              id="new-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter new name"
              disabled={renaming}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newName.trim() && newName.trim() !== currentName) {
                  handleRename();
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
            disabled={renaming}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRename}
            disabled={!newName.trim() || newName.trim() === currentName || renaming}
          >
            {renaming ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Renaming...
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4 mr-2" />
                Rename
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}