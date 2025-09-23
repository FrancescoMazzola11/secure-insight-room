import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Upload, 
  Settings, 
  MessageSquare, 
  BarChart3,
  Search,
  Bot,
  Folder,
  Download,
  Eye,
  Edit3,
  Trash2
} from "lucide-react";

// Mock data for demonstration
const mockDataRoom = {
  id: "1",
  name: "Q4 2024 Financial Review",
  description: "Quarterly financial statements and analysis for board review",
  tags: ["Finance", "Internal", "Quarterly"],
  role: "Creator"
};

const mockDocuments = [
  {
    id: "1",
    name: "Financial_Statement_Q4_2024.pdf",
    type: "PDF",
    size: "2.4 MB",
    uploadedBy: "Sarah Johnson",
    uploadedAt: "2 hours ago",
    folder: "Financial Reports"
  },
  {
    id: "2", 
    name: "Revenue_Analysis.xlsx",
    type: "Excel",
    size: "1.8 MB",
    uploadedBy: "Mike Chen",
    uploadedAt: "5 hours ago",
    folder: "Analysis"
  },
  {
    id: "3",
    name: "Board_Presentation.pptx",
    type: "PowerPoint",
    size: "5.2 MB",
    uploadedBy: "Sarah Johnson",
    uploadedAt: "Yesterday",
    folder: "Presentations"
  }
];

export default function DataRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [aiQuery, setAiQuery] = useState("");

  const breadcrumbs = [
    { label: "Data Room", href: "/" },
    { label: "Settings" },
    { label: mockDataRoom.name }
  ];

  const filteredDocuments = mockDocuments.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAiQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    // Here you would implement AI query logic
    console.log("AI Query:", aiQuery);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header breadcrumbs={breadcrumbs} />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-8">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-foreground">{mockDataRoom.name}</h1>
              <Badge className="bg-primary/10 text-primary border-primary/20">
                {mockDataRoom.role}
              </Badge>
            </div>
            <p className="text-muted-foreground">{mockDataRoom.description}</p>
            <div className="flex space-x-2">
              {mockDataRoom.tags.map((tag) => (
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
              
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Upload Documents
              </Button>
            </div>

            {/* Documents List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Folder className="w-5 h-5" />
                  <span>Documents ({filteredDocuments.length})</span>
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
                          <p className="font-medium text-foreground">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.size} • Uploaded by {doc.uploadedBy} • {doc.uploadedAt}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        {mockDataRoom.role !== "Viewer" && (
                          <>
                            <Button variant="ghost" size="sm">
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
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
    </div>
  );
}