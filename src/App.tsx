import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Citizen pages
import CitizenHome from "./pages/citizen/Home";
import CitizenLogin from "./pages/citizen/Login";
import CitizenTriage from "./pages/citizen/Triage";
import CitizenQueueStatus from "./pages/citizen/QueueStatus";

// Professional pages
import ProfessionalLogin from "./pages/professional/Login";
import ProfessionalDashboard from "./pages/professional/Dashboard";

// Manager pages
import ManagerLogin from "./pages/manager/Login";
import ManagerDashboard from "./pages/manager/Dashboard";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";

// Shared
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Citizen routes */}
          <Route path="/" element={<CitizenHome />} />
          <Route path="/login" element={<CitizenLogin />} />
          <Route path="/triagem" element={<CitizenTriage />} />
          <Route path="/fila" element={<CitizenQueueStatus />} />

          {/* Professional routes */}
          <Route path="/profissional/login" element={<ProfessionalLogin />} />
          <Route path="/profissional" element={<ProfessionalDashboard />} />

          {/* Manager routes */}
          <Route path="/gestor/login" element={<ManagerLogin />} />
          <Route path="/gestor" element={<ManagerDashboard />} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
