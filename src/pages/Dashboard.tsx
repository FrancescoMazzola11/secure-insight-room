import { useState } from "react";
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
import { Plus, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock data
const initialDataRooms: DataRoom[] = [
  // 1. Financial
  {
    id: "1.1",
    name: "1.1 General Information",
    description: "Informazioni generali finanziarie e panoramica aziendale",
    tags: ["Financial", "General"],
    lastModified: "2 hours ago",
    documentCount: 15,
    userCount: 8,
    role: "Creator"
  },
  {
    id: "1.2",
    name: "1.2 Income Statement",
    description: "Conto economico e analisi dei ricavi e costi",
    tags: ["Financial", "Income"],
    lastModified: "3 hours ago",
    documentCount: 22,
    userCount: 6,
    role: "Creator"
  },
  {
    id: "1.3",
    name: "1.3 Balance Sheet",
    description: "Stato patrimoniale e situazione finanziaria",
    tags: ["Financial", "Balance"],
    lastModified: "5 hours ago",
    documentCount: 18,
    userCount: 7,
    role: "Creator"
  },
  // 2. Legal
  {
    id: "2.1",
    name: "2.1 Company Data",
    description: "Dati societari, statuto e governance aziendale",
    tags: ["Legal", "Company"],
    lastModified: "Yesterday",
    documentCount: 32,
    userCount: 12,
    role: "Editor"
  },
  {
    id: "2.2",
    name: "2.2 Shareholdings",
    description: "Partecipazioni societarie e struttura azionaria",
    tags: ["Legal", "Shareholdings"],
    lastModified: "Yesterday",
    documentCount: 28,
    userCount: 9,
    role: "Editor"
  },
  {
    id: "2.3",
    name: "2.3 Real Estate Properties",
    description: "Proprietà immobiliari e diritti reali",
    tags: ["Legal", "Real Estate"],
    lastModified: "2 days ago",
    documentCount: 45,
    userCount: 8,
    role: "Contributor"
  },
  {
    id: "2.4",
    name: "2.4 Permits, Authorizations, Licenses and Concessions",
    description: "Permessi, autorizzazioni, licenze e concessioni",
    tags: ["Legal", "Permits"],
    lastModified: "2 days ago",
    documentCount: 67,
    userCount: 11,
    role: "Contributor"
  },
  {
    id: "2.5",
    name: "2.5 Insurance",
    description: "Polizze assicurative e coperture",
    tags: ["Legal", "Insurance"],
    lastModified: "3 days ago",
    documentCount: 24,
    userCount: 5,
    role: "Viewer"
  },
  {
    id: "2.6",
    name: "2.6 Financial Contracts",
    description: "Contratti finanziari e accordi economici",
    tags: ["Legal", "Contracts"],
    lastModified: "3 days ago",
    documentCount: 38,
    userCount: 14,
    role: "Editor"
  },
  // 3. Tax
  {
    id: "3.1",
    name: "3.1 IRES e IRAP",
    description: "Documentazione fiscale IRES e IRAP",
    tags: ["Tax", "IRES", "IRAP"],
    lastModified: "1 week ago",
    documentCount: 42,
    userCount: 6,
    role: "Viewer"
  },
  {
    id: "3.2",
    name: "3.2 IVA",
    description: "Documentazione IVA e liquidazioni periodiche",
    tags: ["Tax", "IVA"],
    lastModified: "1 week ago",
    documentCount: 35,
    userCount: 4,
    role: "Contributor"
  },
  {
    id: "3.3",
    name: "3.3 Obblighi dei sostituti di imposta",
    description: "Documentazione sostituti d'imposta e adempimenti",
    tags: ["Tax", "Sostituti"],
    lastModified: "1 week ago",
    documentCount: 29,
    userCount: 5,
    role: "Viewer"
  },
  // 4. Business
  {
    id: "4.1",
    name: "4.1 Informazioni generali",
    description: "Informazioni generali sul business e operations",
    tags: ["Business", "General"],
    lastModified: "4 days ago",
    documentCount: 33,
    userCount: 10,
    role: "Creator"
  },
  {
    id: "4.2",
    name: "4.2 Financials, Clienti e Fornitori",
    description: "Analisi finanziarie, portafoglio clienti e fornitori",
    tags: ["Business", "Financials", "Clienti"],
    lastModified: "5 days ago",
    documentCount: 51,
    userCount: 13,
    role: "Editor"
  }
];

const allTags = ["Financial", "General", "Income", "Balance", "Legal", "Company", "Shareholdings", "Real Estate", "Permits", "Insurance", "Contracts", "Tax", "IRES", "IRAP", "IVA", "Sostituti", "Business", "Financials", "Clienti"];

export default function Dashboard() {
  const navigate = useNavigate();
  const [dataRooms, setDataRooms] = useState<DataRoom[]>(initialDataRooms);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const filteredDataRooms = dataRooms.filter((room) => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === "all" || room.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleCreateDataRoom = (data: { name: string; description: string; tags: string[] }) => {
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
  };

  const handleOpenDataRoom = (id: string) => {
    navigate(`/data-room/${id}`);
  };

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