import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AgentProvider } from "@/context/AgentContext";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { NotificationProvider } from "@/hooks/useNotifications";
import { ThemeProvider } from "@/hooks/useTheme";
import AppLayout from "@/components/layout/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";
import { ensureDataVersion } from "@/lib/userStore";
import Landing from "@/pages/Landing";
import FeaturesPage from "@/pages/Features";
import SolutionPage from "@/pages/Solution";
import PricingPage from "@/pages/Pricing";
import ContactPage from "@/pages/Contact";
import About from "@/pages/About";
import Careers from "@/pages/Careers";
import Blog from "@/pages/Blog";
import Legal from "@/pages/Legal";
import Auth from "@/pages/Auth";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import Agents from "@/pages/Agents";
import CreateAgent from "@/pages/CreateAgent";
import Analytics from "@/pages/Analytics";
import Embed from "@/pages/Embed";
import ApiKeys from "@/pages/ApiKeys";
import Docs from "@/pages/Docs";
import SettingsPage from "@/pages/Settings";
import AdminConsole from "@/pages/admin/AdminConsole";
import ConsoleDashboard from "@/pages/admin/ConsoleDashboard";
import ConsoleAnalytics from "@/pages/admin/ConsoleAnalytics";
import ConsoleUsers from "@/pages/admin/ConsoleUsers";
import ConsoleAgents from "@/pages/admin/ConsoleAgents";
import ConsolePlans from "@/pages/admin/ConsolePlans";
import ConsoleBilling from "@/pages/admin/ConsoleBilling";
import ConsoleUsage from "@/pages/admin/ConsoleUsage";
import ConsoleSupport from "@/pages/admin/ConsoleSupport";
import ConsoleTeam from "@/pages/admin/ConsoleTeam";
import ConsoleSettings from "@/pages/admin/ConsoleSettings";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AuthRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Auth />;
}

const App = () => {
  useEffect(() => {
    ensureDataVersion();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <NotificationProvider>
          <AgentProvider>
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/features" element={<FeaturesPage />} />
                {/* How-it-works merged into Features; keep old URL alive */}
                <Route path="/how-it-works" element={<Navigate to="/features" replace />} />
                <Route path="/solutions/:slug" element={<SolutionPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/about" element={<About />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/privacy" element={<Legal slug="privacy" />} />
                <Route path="/terms" element={<Legal slug="terms" />} />
                <Route path="/dpdp" element={<Legal slug="dpdp" />} />
                <Route path="/security" element={<Legal slug="security" />} />
                <Route path="/docs" element={<Docs />} />
                <Route path="/auth" element={<AuthRoute />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/agents" element={<Agents />} />
                  <Route path="/agents/create" element={<CreateAgent />} />
                  <Route path="/agents/edit/:id" element={<CreateAgent />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/embed" element={<Embed />} />
                  <Route path="/api-keys" element={<ApiKeys />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
                {/* Standalone admin console — its own login gate, outside the app shell */}
                <Route path="/adminosciva" element={<AdminConsole />}>
                  <Route index element={<Navigate to="/adminosciva/dashboard" replace />} />
                  <Route path="dashboard" element={<ConsoleDashboard />} />
                  <Route path="analytics" element={<ConsoleAnalytics />} />
                  <Route path="users" element={<ConsoleUsers />} />
                  <Route path="agents" element={<ConsoleAgents />} />
                  <Route path="plans" element={<ConsolePlans />} />
                  <Route path="billing" element={<ConsoleBilling />} />
                  <Route path="usage" element={<ConsoleUsage />} />
                  <Route path="support" element={<ConsoleSupport />} />
                  <Route path="team" element={<ConsoleTeam />} />
                  <Route path="settings" element={<ConsoleSettings />} />
                </Route>
                <Route path="/admin" element={<Navigate to="/adminosciva" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AgentProvider>
          </NotificationProvider>
        </AuthProvider>
      </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
