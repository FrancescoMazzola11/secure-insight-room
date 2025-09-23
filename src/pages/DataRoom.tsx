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

// Mock data structure for each data room
const dataRoomStructure = {
  financial: {
    id: "financial",
    name: "Financial", 
    description: "Documenti finanziari, bilanci e analisi economiche",
    tags: ["Financial"],
    role: "Creator",
    subfolders: [
      { id: "1.1", name: "1.1 General Information", documentCount: 15 },
      { id: "1.2", name: "1.2 Income Statement", documentCount: 22 },
      { id: "1.3", name: "1.3 Balance Sheet", documentCount: 18 }
    ]
  },
  legal: {
    id: "legal",
    name: "Legal",
    description: "Documenti legali, contratti e adempimenti normativi", 
    tags: ["Legal"],
    role: "Editor",
    subfolders: [
      { id: "2.1", name: "2.1 Company Data", documentCount: 32 },
      { id: "2.2", name: "2.2 Shareholdings", documentCount: 28 },
      { id: "2.3", name: "2.3 Real Estate Properties", documentCount: 45 },
      { id: "2.4", name: "2.4 Permits, Authorizations, Licenses and Concessions", documentCount: 67 },
      { id: "2.5", name: "2.5 Insurance", documentCount: 24 },
      { id: "2.6", name: "2.6 Financial Contracts", documentCount: 38 }
    ]
  },
  tax: {
    id: "tax", 
    name: "Tax",
    description: "Documentazione fiscale e adempimenti tributari",
    tags: ["Tax"],
    role: "Contributor",
    subfolders: [
      { id: "3.1", name: "3.1 IRES e IRAP", documentCount: 42 },
      { id: "3.2", name: "3.2 IVA", documentCount: 35 },
      { id: "3.3", name: "3.3 Obblighi dei sostituti di imposta", documentCount: 29 }
    ]
  },
  business: {
    id: "business",
    name: "Business", 
    description: "Informazioni business, clienti, fornitori e operations",
    tags: ["Business"],
    role: "Creator",
    subfolders: [
      { id: "4.1", name: "4.1 Informazioni generali", documentCount: 33 },
      { id: "4.2", name: "4.2 Financials, Clienti e Fornitori", documentCount: 51 }
    ]
  }
};

const mockDocuments = [
  {
    id: "1",
    name: "Financial_Statement_Q4_2024.pdf",
    type: "PDF",
    size: "2.4 MB",
    uploadedBy: "Sarah Johnson",
    uploadedAt: "2 hours ago",
    folder: "1.1"
  },
  {
    id: "2", 
    name: "Income_Analysis.xlsx",
    type: "Excel",
    size: "1.8 MB",
    uploadedBy: "Mike Chen",
    uploadedAt: "5 hours ago",
    folder: "1.2"
  },
  {
    id: "3",
    name: "Balance_Sheet_2024.pdf",
    type: "PDF",
    size: "3.2 MB",
    uploadedBy: "Sarah Johnson",
    uploadedAt: "Yesterday",
    folder: "1.3"
  }
];

export default function DataRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  // Get current data room based on ID
  const currentDataRoom = id ? dataRoomStructure[id as keyof typeof dataRoomStructure] : null;
  
  if (!currentDataRoom) {
    return <div>Data Room not found</div>;
  }

  const breadcrumbs = [
    { label: "Data Room", href: "/" },
    { label: "Settings" },
    { label: currentDataRoom.name }
  ];

  const filteredDocuments = mockDocuments.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (!selectedFolder || doc.folder === selectedFolder)
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

            {/* Subfolders */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {currentDataRoom.subfolders.map((subfolder) => (
                <Card 
                  key={subfolder.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedFolder === subfolder.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedFolder(selectedFolder === subfolder.id ? null : subfolder.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Folder className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{subfolder.name}</h3>
                        <p className="text-sm text-muted-foreground">{subfolder.documentCount} documents</p>
                      </div>
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
                        ? `Documents in ${currentDataRoom.subfolders.find(f => f.id === selectedFolder)?.name}`
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
                        {currentDataRoom.role !== "Viewer" && (
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