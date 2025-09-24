import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { DataRoomCard, type DataRoom } from "@/components/dashboard/DataRoomCard";
import { CreateDataRoomDialog } from "@/components/dashboard/CreateDataRoomDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Filter, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock data fallback
const mockDataRooms: DataRoom[] = [
  {
    id: "financial",
    name: "Financial Documents",
    description: "Financial statements, budgets, and economic analyses",
    tags: ["Financial", "Due Diligence"],
    lastModified: "2 hours ago",
    documentCount: 3,
    userCount: 5,
    role: "Creator"
  },
  {
    id: "legal",
    name: "Legal Documents",
    description: "Legal contracts, compliance documents, and regulatory filings",
    tags: ["Legal", "Compliance"],
    lastModified: "Yesterday",
    documentCount: 2,
    userCount: 3,
    role: "Editor"
  },
  {
    id: "business",
    name: "Business Operations",
    description: "Business plans, client information, and operational documents",
    tags: ["Business", "HR"],
    lastModified: "4 days ago",
    documentCount: 2,
    userCount: 2,
    role: "Creator"
  }
];

const mockTags = ["Financial", "Legal", "Business", "Due Diligence", "Compliance", "HR"];

// Helper function to format dates
function formatLastModified(date: Date): string {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return "Just now";
  if (diffInHours === 1) return "1 hour ago";
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks === 1) return "1 week ago";
  if (diffInWeeks < 4) return `${diffInWeeks} weeks ago`;
  
  return date.toLocaleDateString();
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [dataRooms, setDataRooms] = useState<DataRoom[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // For now, we'll use a hardcoded user ID. In a real app, this would come from authentication
  const currentUserId = "user-1"; // John Doe

  // Load data on component mount
  useEffect(() => {
    async function loadData() {
      // Use mock data only (database operations moved to API)
      console.log('Loading mock data...');
      setDataRooms(mockDataRooms);
      setAllTags(mockTags);
      setLoading(false);
    }
    
    loadData();
  }, [currentUserId]);

  const filteredDataRooms = dataRooms.filter((room) => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === "all" || room.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleCreateDataRoom = async (data: { name: string; description: string; tags: string[] }) => {
    try {
      // Add to mock data
      const newRoom: DataRoom = {
        id: Date.now().toString(),
        name: data.name,
        description: data.description,
        tags: data.tags,
        lastModified: "Just now",
        documentCount: 0,
        userCount: 1,
        role: "Creator"
      };
      setDataRooms([newRoom, ...dataRooms]);
      
    } catch (err) {
      console.error('Error creating data room:', err);
      // Don't show error to user, just log it
      console.log('Continuing with mock data behavior');
    }
  };

  const handleOpenDataRoom = (id: string) => {
    navigate(`/data-room/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading data rooms...</span>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-600 mb-2">{error}</div>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Data Rooms</h1>
            <p className="text-muted-foreground mt-1">
              Secure document sharing and collaboration spaces
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="shadow-md">
            <Plus className="w-4 h-4 mr-2" />
            Create Data Room
          </Button>
        </div>

        {/* Filters Section */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search data rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {allTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters */}
        {(searchQuery || selectedTag !== "all") && (
          <div className="flex items-center space-x-2 mb-6">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {searchQuery && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchQuery("")}>
                Search: "{searchQuery}" ×
              </Badge>
            )}
            {selectedTag !== "all" && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedTag("all")}>
                Tag: {selectedTag} ×
              </Badge>
            )}
          </div>
        )}

        {/* Data Rooms Grid */}
        {filteredDataRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDataRooms.map((dataRoom) => (
              <DataRoomCard 
                key={dataRoom.id} 
                dataRoom={dataRoom} 
                onOpen={handleOpenDataRoom}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No data rooms found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedTag !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "Create your first data room to get started"
              }
            </p>
            {!searchQuery && selectedTag === "all" && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Data Room
              </Button>
            )}
          </div>
        )}
      </main>

      <CreateDataRoomDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateDataRoom}
      />
    </div>
  );
}