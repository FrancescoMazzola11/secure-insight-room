import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Edit3, 
  Trash2, 
  Plus, 
  ArrowLeft 
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  rights: string[];
  aiAccess: boolean;
  expiry?: string;
}

// Mock data matching the image design
const mockUsers: User[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john@company.com",
    role: "Editor",
    rights: ["View"],
    aiAccess: false,
    expiry: "31/12/2025"
  },
  {
    id: "2",
    name: "Jane Doe", 
    email: "jane@company.com",
    role: "Contributor",
    rights: ["Upload"],
    aiAccess: false,
    expiry: "AI Download"
  },
  {
    id: "3",
    name: "Jake Johnson",
    email: "jake@company.com", 
    role: "Viewer",
    rights: ["View"],
    aiAccess: false,
    expiry: "31/12/2025"
  },
  {
    id: "4",
    name: "Mary Johnson",
    email: "mary@company.com",
    role: "Creator",
    rights: ["View"],
    aiAccess: false,
    expiry: "31/12/2025"
  }
];

export default function Permissions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [defaultRole, setDefaultRole] = useState("Viewer");
  const [allowDownloads, setAllowDownloads] = useState(false);
  const [applyWatermark, setApplyWatermark] = useState(true);
  const [enableAiAccess, setEnableAiAccess] = useState(false);
  const [linkEnabled, setLinkEnabled] = useState(true);
  const [linkExpiry, setLinkExpiry] = useState("7");
  const [passwordRequired, setPasswordRequired] = useState(true);
  const [rightsGranted, setRightsGranted] = useState("view-only");
  const [customRights, setCustomRights] = useState<string[]>([]);

  const breadcrumbs = [
    { label: "Data Room", href: "/" },
    { label: "Settings" },
    { label: "Permissions" }
  ];

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header breadcrumbs={breadcrumbs} />
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate(`/data-room/${id}`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Data Room
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Manage Permissions</h1>
            </div>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Invite User
          </Button>
        </div>

        <div className="space-y-8">
          {/* User Permissions Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr className="text-left">
                      <th className="p-4 font-medium text-foreground">User</th>
                      <th className="p-4 font-medium text-foreground">Role</th>
                      <th className="p-4 font-medium text-foreground">Rights</th>
                      <th className="p-4 font-medium text-foreground">AI Access</th>
                      <th className="p-4 font-medium text-foreground">Expiry</th>
                      <th className="p-4 font-medium text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr key={user.id} className={index !== users.length - 1 ? "border-b border-border" : ""}>
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-foreground">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-foreground">{user.role}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Switch checked={user.rights.includes("View")} />
                            <span className="text-sm text-foreground">
                              {user.rights.join(", ")}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Switch checked={user.aiAccess} />
                            <span className="text-sm text-foreground">
                              {user.expiry === "AI Download" ? "AI Download" : ""}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-foreground">
                            {user.expiry !== "AI Download" ? user.expiry : ""}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Default Role Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Default Role Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="default-role">Default Role</Label>
                <Select value={defaultRole} onValueChange={setDefaultRole}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                    <SelectItem value="Contributor">Contributor</SelectItem>
                    <SelectItem value="Editor">Editor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    id="allow-downloads"
                    checked={allowDownloads}
                    onCheckedChange={(checked) => setAllowDownloads(checked === true)}
                  />
                  <Label htmlFor="allow-downloads">Allow downloads by default</Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox 
                    id="apply-watermark"
                    checked={applyWatermark}
                    onCheckedChange={(checked) => setApplyWatermark(checked === true)}
                  />
                  <Label htmlFor="apply-watermark">Apply watermark to all documents</Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox 
                    id="enable-ai"
                    checked={enableAiAccess}
                    onCheckedChange={(checked) => setEnableAiAccess(checked === true)}
                  />
                  <Label htmlFor="enable-ai">Enable AI access by default</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* External User Access */}
          <Card>
            <CardHeader>
              <CardTitle>External User Access via Secure Link</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="enable-link">Enable</Label>
                <Switch 
                  id="enable-link"
                  checked={linkEnabled}
                  onCheckedChange={setLinkEnabled}
                />
              </div>

              {linkEnabled && (
                <div className="space-y-6 pt-4 border-t border-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="link-expiry">Link expiry (days)</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="link-expiry"
                          value={linkExpiry}
                          onChange={(e) => setLinkExpiry(e.target.value)}
                          className="w-20"
                        />
                        <span className="text-sm text-muted-foreground">One</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="password-required">Password required?</Label>
                      <Switch 
                        id="password-required"
                        checked={passwordRequired}
                        onCheckedChange={setPasswordRequired}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Rights granted</Label>
                    <RadioGroup value={rightsGranted} onValueChange={setRightsGranted}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="view-only" id="view-only" />
                        <Label htmlFor="view-only">View only</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="view-ai" id="view-ai" />
                        <Label htmlFor="view-ai">View + AI access</Label>
                      </div>
                    </RadioGroup>

                    {rightsGranted === "custom" && (
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="custom-custom"
                            checked={customRights.includes("Custom")}
                          />
                          <Label htmlFor="custom-custom">Custom</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="custom-view"
                            checked={customRights.includes("View")}
                          />
                          <Label htmlFor="custom-view">View</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="custom-upload"
                            checked={customRights.includes("Upload")}
                          />
                          <Label htmlFor="custom-upload">Upload</Label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}