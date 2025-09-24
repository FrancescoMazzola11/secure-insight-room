import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import BrowserDashboard from "./pages/BrowserDashboard";
import ApiDashboard from "./pages/ApiDashboard";
import TestComponent from "./pages/TestComponent";
import TestUsers from "./pages/TestUsers";
import Simple from "./pages/Simple";
import DataRoom from "./pages/DataRoom"; 
import Permissions from "./pages/Permissions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/test-users" element={<TestUsers />} />
          <Route path="/api" element={<ApiDashboard />} />
          <Route path="/browser" element={<BrowserDashboard />} />
          <Route path="/simple" element={<Simple />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/data-room/:id" element={<DataRoom />} />
          <Route path="/data-room/:id/permissions" element={<Permissions />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
