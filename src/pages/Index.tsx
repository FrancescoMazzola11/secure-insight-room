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
import { Plus, Search, Filter, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ApiService, type DataRoom as ApiDataRoom } from "@/lib/api-client";

// Mock data fallback in case backend API connection is unavailable
const mockDataRooms: DataRoom[] = [
  {
    id: "financial",
    name: "Financial Documents",
    description: "Financial statements, budgets, and economic analyses",
    tags: ["Financial", "Due Diligence, Quadrivio"],
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

// Convert API DataRoom to component DataRoom format
function convertApiDataRoom(apiRoom: ApiDataRoom): DataRoom {
  return {
    id: apiRoom.id,
    name: apiRoom.name,
    description: apiRoom.description,
    tags: apiRoom.tags,
    lastModified: formatLastModified(new Date(apiRoom.lastModified)),
    documentCount: apiRoom.fileCount,
    userCount: 1, // Default to 1, we'd need another API call for accurate user count
    role: (apiRoom.role as "Creator" | "Editor" | "Contributor" | "Viewer") || "Viewer"
  };
}

export default function Index() {
  const navigate = useNavigate();
  const [dataRooms, setDataRooms] = useState<DataRoom[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  
  // For now, we'll use a hardcoded user ID. In a real app, this would come from authentication
  const currentUserId = "user-1"; // John Doe

  // Load data on component mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Loading data rooms from API...');
        const [apiDataRooms, allTagsFromApi] = await Promise.all([
          ApiService.getUserDataRooms(currentUserId),
          ApiService.getAllTags()
        ]);
        const convertedRooms = apiDataRooms.map(convertApiDataRoom);
        
        setDataRooms(convertedRooms);
        setAllTags(allTagsFromApi);
        
        console.log(`Loaded ${convertedRooms.length} data rooms and ${allTagsFromApi.length} tags from API`);
      } catch (error) {
        console.error('Failed to load data from API, using fallback data:', error);
        setError('Failed to connect to API, using sample data');
        setUsingFallback(true);
        setDataRooms(mockDataRooms);
        setAllTags(mockTags);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [currentUserId]);

  const filteredDataRooms = dataRooms.filter((room) => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === "all" || room.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleCreateRoom = async (name: string, description: string, tags: string[]) => {
    try {
      console.log('Creating new data room:', { name, description, tags });
      setError(null); // Clear any previous errors
      
      const response = await ApiService.createDataRoom({
        name,
        description,
        tags,
        creatorId: currentUserId
      });
      
      console.log('Data room created successfully:', response);
      
      // Close the dialog
      setShowCreateDialog(false);
      
      // Reload data to show the new room
      const [apiDataRooms, allTagsFromApi] = await Promise.all([
        ApiService.getUserDataRooms(currentUserId),
        ApiService.getAllTags()
      ]);
      const convertedRooms = apiDataRooms.map(convertApiDataRoom);
      setDataRooms(convertedRooms);
      setAllTags(allTagsFromApi);
      
    } catch (error) {
      console.error('Failed to create data room:', error);
      setError(`Failed to create data room "${name}". Please try again.`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header breadcrumbs={[{ label: "Dashboard" }]} />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Data Rooms Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your secure document repositories
            </p>
          </div>
          
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Data Room
          </Button>
        </div>

        {/* Error/Warning Messages */}
        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="text-yellow-800">{error}</span>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="flex items-center justify-between mb-6 space-x-4">
          <div className="flex items-center space-x-4 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search data rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tags</SelectItem>
                  {allTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading data rooms...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredDataRooms.length} of {dataRooms.length} data rooms
                </p>
                {usingFallback && (
                  <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                    Sample Data
                  </Badge>
                )}
              </div>
              
              {selectedTag !== "all" && (
                <Button
                  variant="ghost"
                  onClick={() => setSelectedTag("all")}
                  className="text-sm"
                >
                  Clear filter
                </Button>
              )}
            </div>

            {/* Data Rooms Grid */}
            {filteredDataRooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDataRooms.map((room) => (
                  <DataRoomCard
                    key={room.id}
                    dataRoom={room}
                    onOpen={() => navigate(`/data-room/${room.id}`)}
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
                    : "Create your first data room to get started"}
                </p>
                {(!searchQuery && selectedTag === "all") && (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Data Room
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Create Data Room Dialog */}
      <CreateDataRoomDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={({ name, description, tags }) => handleCreateRoom(name, description, tags)}
      />
    </div>
  );
}
