import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Users, Calendar, FileText } from "lucide-react";

export interface DataRoom {
  id: string;
  name: string;
  description?: string;
  tags: string[];
  lastModified: string;
  documentCount: number;
  userCount: number;
  role: "Creator" | "Editor" | "Contributor" | "Viewer";
}

interface DataRoomCardProps {
  dataRoom: DataRoom;
  onOpen: (id: string) => void;
}

const roleColors = {
  Creator: "bg-primary/10 text-primary border-primary/20",
  Editor: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Contributor: "bg-amber-50 text-amber-700 border-amber-200",
  Viewer: "bg-slate-50 text-slate-600 border-slate-200"
};

export function DataRoomCard({ dataRoom, onOpen }: DataRoomCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
              {dataRoom.name}
            </h3>
            {dataRoom.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {dataRoom.description}
              </p>
            )}
          </div>
          <Badge className={`ml-2 ${roleColors[dataRoom.role]}`}>
            {dataRoom.role}
          </Badge>
        </div>
        
        {dataRoom.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {dataRoom.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="py-3">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <FileText className="w-4 h-4" />
            <span>{dataRoom.documentCount} docs</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{dataRoom.userCount} users</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span className="truncate">{dataRoom.lastModified}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        <Button 
          onClick={() => onOpen(dataRoom.id)}
          className="w-full"
          variant="outline"
        >
          <FolderOpen className="w-4 h-4 mr-2" />
          Open Data Room
        </Button>
      </CardFooter>
    </Card>
  );
}