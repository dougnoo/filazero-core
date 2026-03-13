import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/domain/enums/user-role";

// Citizen pages
import CitizenHome from "./pages/citizen/Home";
import CitizenLogin from "./pages/citizen/Login";
import CitizenTriage from "./pages/citizen/Triage";
import CitizenQueueStatus from "./pages/citizen/QueueStatus";
import ClinicalIntake from "./pages/citizen/Intake";
import CareJourneyPage from "./pages/citizen/CareJourneyPage";

// Professional pages
import ProfessionalLogin from "./pages/professional/Login";
import ProfessionalDashboard from "./pages/professional/Dashboard";
import ClinicalReview from "./pages/professional/ClinicalReview";

// Manager pages
import ManagerLogin from "./pages/manager/Login";
import ManagerDashboard from "./pages/manager/Dashboard";
import ClinicalDashboard from "./pages/manager/ClinicalDashboard";
import FlowAnalytics from "./pages/manager/FlowAnalytics";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";

// Shared
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/app" element={<CitizenHome />} />
            <Route path="/login" element={<CitizenLogin />} />
            <Route path="/profissional/login" element={<ProfessionalLogin />} />
            <Route path="/gestor/login" element={<ManagerLogin />} />
            <Route path="/admin/login" element={<ProfessionalLogin />} />

            {/* Citizen routes (protected) */}
            <Route path="/intake" element={
              <ProtectedRoute allowedRoles={[UserRole.CITIZEN]}>
                <ClinicalIntake />
              </ProtectedRoute>
            } />
            <Route path="/minha-jornada" element={
              <ProtectedRoute allowedRoles={[UserRole.CITIZEN]}>
                <CareJourneyPage />
              </ProtectedRoute>
            } />
            {/* Legacy citizen routes (kept working) */}
            <Route path="/triagem" element={<CitizenTriage />} />
            <Route path="/fila" element={<CitizenQueueStatus />} />

            {/* Professional routes (protected) */}
            <Route path="/profissional" element={
              <ProtectedRoute allowedRoles={[UserRole.PROFESSIONAL]}>
                <ProfessionalDashboard />
              </ProtectedRoute>
            } />
            <Route path="/revisao-clinica" element={
              <ProtectedRoute allowedRoles={[UserRole.PROFESSIONAL]}>
                <ClinicalReview />
              </ProtectedRoute>
            } />

            {/* Manager routes (protected) */}
            <Route path="/gestor" element={
              <ProtectedRoute allowedRoles={[UserRole.MANAGER]}>
                <ManagerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard-clinico" element={
              <ProtectedRoute allowedRoles={[UserRole.MANAGER]}>
                <ClinicalDashboard />
              </ProtectedRoute>
            } />
            <Route path="/fluxo" element={
              <ProtectedRoute allowedRoles={[UserRole.MANAGER]}>
                <FlowAnalytics />
              </ProtectedRoute>
            } />

            {/* Admin routes (protected) */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
