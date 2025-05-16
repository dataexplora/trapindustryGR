import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "@/context/DataContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import HomePage from "./pages/HomePage";
import ArtistsPage from "./pages/ArtistsPage";
import TopArtistsPage from "./pages/TopArtistsPage";
import SongsPage from "./pages/SongsPage";
import ArtistDetailPage from "./pages/ArtistDetailPage";
import TrackDetailPage from "./pages/TrackDetailPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AboutUs from "./pages/AboutUs";
import TermsOfService from "./pages/TermsOfService";
import ContactUs from "./pages/ContactUs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <DataProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/discover" element={<ArtistsPage />} />
              <Route path="/hot-artists" element={<TopArtistsPage />} />
              <Route path="/songs" element={<SongsPage />} />
              <Route path="/artist/:id" element={<ArtistDetailPage />} />
              <Route path="/track/:id" element={<TrackDetailPage />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </DataProvider>
  </QueryClientProvider>
);

export default App;
