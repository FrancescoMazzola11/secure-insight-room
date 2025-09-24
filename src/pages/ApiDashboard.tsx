import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, FileText, Folder, Calendar, Tag, Users, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Header } from "@/components/layout/Header";
import { ApiService, DataRoom, DashboardStats, ApiError } from "@/lib/api-client";
import { mockDataRooms } from "@/lib/mock-data";

export default function ApiDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dataRooms, setDataRooms] = useState<DataRoom[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useApiData, setUseApiData] = useState(true);
  const navigate = useNavigate();

  // Current user ID (in a real app, this would come from auth context)
  const currentUserId = "user-1";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to load data from API first
      console.log("Attempting to load data from API...");
      
      const [roomsData, statsData] = await Promise.all([
        ApiService.getAllDataRooms(),
        ApiService.getDashboardStats()
      ]);

      console.log("Successfully loaded data from API:", { roomsData, statsData });
      
      setDataRooms(roomsData);
      setStats(statsData);
      setUseApiData(true);
    } catch (err) {
      console.error("API request failed:", err);
      
      // Fallback to mock data
      console.log("Falling back to mock data...");
      const mockStats: DashboardStats = {
        totalRooms: mockDataRooms.length,
        totalFiles: mockDataRooms.reduce((sum, room) => sum + room.fileCount, 0),
        totalUsers: 5,
        recentActivity: 12
      };

      setDataRooms(mockDataRooms);
      setStats(mockStats);
      setUseApiData(false);
      
      if (err instanceof ApiError) {
        setError(`API Error: ${err.message}${err.status > 0 ? ` (${err.status})` : ''}`);
      } else {
        setError("Unable to connect to API server. Using offline data.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter data rooms based on search term
  const filteredRooms = dataRooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (Array.isArray(room.tags) ? room.tags : JSON.parse(room.tags || '[]'))
      .some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateRoom = async () => {
    try {
      console.log("Creating new room...");
      
      if (useApiData) {
        await ApiService.createDataRoom({
          name: "New Data Room",
          description: "Created from dashboard",
          tags: ["New"],
          creatorId: currentUserId
        });
        
        // Refresh data after creation
        await loadData();
      } else {
        console.log("API not available - would create room when server is running");
      }
    } catch (err) {
      console.error("Failed to create room:", err);
      setError("Failed to create data room");
    }
  };

  const handleRoomClick = (roomId: string) => {
    console.log(`Navigating to room: ${roomId}`);
    navigate(`/data-room/${roomId}`);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diffMs = now - (timestamp * 1000);
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Error Alert */}
        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              {!useApiData && (
                <Button 
                  variant="link" 
                  className="ml-2 p-0 h-auto"
                  onClick={loadData}
                >
                  Try again
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Status Badge */}
        <div className="flex items-center justify-between mb-6">
          <Badge variant={useApiData ? "default" : "secondary"} className="mb-2">
            {useApiData ? "🟢 Connected to API" : "🔴 Offline Mode"}
          </Badge>
        </div>

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Data Rooms</h1>
            <p className="text-gray-600 mt-1">Secure document management for your organization</p>
          </div>
          <Button onClick={handleCreateRoom} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Create Data Room
          </Button>
        </div>

        {/* Search Section */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search data rooms, documents, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 max-w-md"
          />
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
                <Folder className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRooms}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Files</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalFiles}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.recentActivity}</div>
                <p className="text-xs text-muted-foreground">actions today</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Data Rooms Grid */}
        {filteredRooms.length === 0 ? (
          <div className="text-center py-12">
            <Folder className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No data rooms found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? "Try adjusting your search terms." : "Get started by creating your first data room."}
            </p>
            {!searchTerm && (
              <Button onClick={handleCreateRoom}>
                <Plus className="w-4 h-4 mr-2" />
                Create Data Room
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => {
              const tags = Array.isArray(room.tags) ? room.tags : JSON.parse(room.tags || '[]');
              
              return (
                <Card 
                  key={room.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                  onClick={() => handleRoomClick(room.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold line-clamp-1">
                        {room.name}
                      </CardTitle>
                      {room.role && (
                        <Badge variant="outline" className="ml-2">
                          {room.role}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {room.description}
                    </p>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <FileText className="w-4 h-4 mr-1" />
                            {room.fileCount} files
                          </span>
                          <span className="flex items-center">
                            <Folder className="w-4 h-4 mr-1" />
                            {room.folderCount} folders
                          </span>
                        </div>
                      </div>
                      
                      {/* Dates */}
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Created {formatDate(room.createdAt)}</span>
                        <span>Modified {formatTimeAgo(room.lastModified)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}