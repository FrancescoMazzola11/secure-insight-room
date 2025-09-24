import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";

// Simple fallback Dashboard for debugging
export default function Dashboard() {
  const [message, setMessage] = useState("Dashboard loaded successfully!");
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col items-center justify-center h-64">
          <h1 className="text-2xl font-bold mb-4">Secure Data Room</h1>
          <p className="text-muted-foreground mb-4">{message}</p>
          <Button 
            onClick={() => setMessage("Button clicked - React is working!")}
            className="mb-4"
          >
            Test Button
          </Button>
          <div className="text-sm text-muted-foreground">
            If you can see this, the basic React app is working.
          </div>
        </div>
      </main>
    </div>
  );
}