import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { LanguageWelcomeModal } from "./components/LanguageWelcomeModal";
import { MarketingSite } from "./pages/MarketingSite";
import { BookingPage } from "./pages/BookingPage";
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { OverviewTab } from "./pages/admin/OverviewTab";
import { AppointmentsTab } from "./pages/admin/AppointmentsTab";
import { AvailabilityTab } from "./pages/admin/AvailabilityTab";
import { PaymentsTab } from "./pages/admin/PaymentsTab";
import { SettingsTab } from "./pages/admin/SettingsTab";
import { ProtectedRoute } from "./components/admin/ProtectedRoute";

function App() {
  return (
    <LanguageProvider>
      <LanguageWelcomeModal />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MarketingSite />} />
          <Route path="/book" element={<BookingPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<OverviewTab />} />
            <Route path="appointments" element={<AppointmentsTab />} />
            <Route path="availability" element={<AvailabilityTab />} />
            <Route path="payments" element={<PaymentsTab />} />
            <Route path="settings" element={<SettingsTab />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
