
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Páginas
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RoutesPage from "./pages/Routes";
import Schedule from "./pages/Schedule";
import Profile from "./pages/Profile";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Notifications from "./pages/Notifications";
import DriverDashboard from "./pages/driver/DriverDashboard";
import Invitations from "./pages/manager/Invitations";
import ManagerDashboard from "./pages/manager/Dashboard";
import RegisterStudents from "./pages/manager/RegisterStudents";
import RegisterParents from "./pages/manager/RegisterParents";
import RegisterDrivers from "./pages/manager/RegisterDrivers";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <RouterRoutes>
              {/* Public routes */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/routes" element={
                <ProtectedRoute>
                  <RoutesPage />
                </ProtectedRoute>
              } />
              <Route path="/schedule" element={
                <ProtectedRoute>
                  <Schedule />
                </ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/driver" element={
                <ProtectedRoute>
                  <DriverDashboard />
                </ProtectedRoute>
              } />
              
              {/* Manager routes */}
              <Route path="/manager/invitations" element={
                <ProtectedRoute>
                  <Invitations />
                </ProtectedRoute>
              } />
              <Route path="/manager/dashboard" element={
                <ProtectedRoute>
                  <ManagerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/manager/register-students" element={
                <ProtectedRoute>
                  <RegisterStudents />
                </ProtectedRoute>
              } />
              <Route path="/manager/register-parents" element={
                <ProtectedRoute>
                  <RegisterParents />
                </ProtectedRoute>
              } />
              <Route path="/manager/register-drivers" element={
                <ProtectedRoute>
                  <RegisterDrivers />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </RouterRoutes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
