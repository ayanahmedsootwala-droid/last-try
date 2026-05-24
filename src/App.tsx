import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { CompareProvider } from '@/contexts/CompareContext';
import { SiteSettingsProvider } from '@/contexts/SiteSettingsContext';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { useSiteSettings } from '@/hooks/useSiteSettings';

// Guard component: redirects to homepage when auctions feature is disabled
function AuctionFeatureGuard({ children }: { children: React.ReactNode }) {
  const { getSetting } = useSiteSettings();
  const navigate = useNavigate();
  const auctionsOn = getSetting('auctions_feature_enabled', 'true') !== 'false';
  React.useEffect(() => {
    if (!auctionsOn) navigate('/', { replace: true });
  }, [auctionsOn, navigate]);
  if (!auctionsOn) return null;
  return <>{children}</>;
}

// Public pages
const HomePage = lazy(() => import('@/pages/HomePage'));
const InventoryPage = lazy(() => import('@/pages/InventoryPage'));
const CarDetailPage = lazy(() => import('@/pages/CarDetailPage'));
const ComparePage = lazy(() => import('@/pages/ComparePage'));
const AuctionsListPage = lazy(() => import('@/pages/AuctionsListPage'));
const AuctionDetailPage = lazy(() => import('@/pages/AuctionDetailPage'));
const BlogPage = lazy(() => import('@/pages/BlogPage'));
const SellCarPage = lazy(() => import('@/pages/SellCarPage'));
const UserDashboardPage = lazy(() => import('@/pages/UserDashboardPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const DealerPublicPage = lazy(() => import('@/pages/DealerPublicPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));

// Dealership pages
const DealershipDashboard = lazy(() => import('@/pages/dealership/DealershipDashboard'));
const DealershipInventory = lazy(() => import('@/pages/dealership/DealershipInventory'));
const DealershipLeads = lazy(() => import('@/pages/dealership/DealershipLeads'));
const DealershipSales = lazy(() => import('@/pages/dealership/DealershipSales'));
const DealershipAnalytics = lazy(() => import('@/pages/dealership/DealershipAnalytics'));
const DealershipCommunication = lazy(() => import('@/pages/dealership/DealershipCommunication'));
const DealershipTeam = lazy(() => import('@/pages/dealership/DealershipTeam'));
const DealershipActivity = lazy(() => import('@/pages/dealership/DealershipActivity'));

// Admin pages
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminInventory = lazy(() => import('@/pages/admin/AdminInventory'));
const AdminModeration = lazy(() => import('@/pages/admin/AdminModeration'));
const AdminVehicleDatabase = lazy(() => import('@/pages/admin/AdminVehicleDatabase'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminDealerships = lazy(() => import('@/pages/admin/AdminDealerships'));
const AdminAuctions = lazy(() => import('@/pages/admin/AdminAuctions'));
const AdminAuctionAnalytics = lazy(() => import('@/pages/admin/AdminAuctionAnalytics'));
const AdminAnalytics = lazy(() => import('@/pages/admin/AdminAnalytics'));
const AdminInquiries = lazy(() => import('@/pages/admin/AdminInquiries'));
const AdminBlog = lazy(() => import('@/pages/admin/AdminBlog'));
const AdminTestimonials = lazy(() => import('@/pages/admin/AdminTestimonials'));
const AdminBrands = lazy(() => import('@/pages/admin/AdminBrands'));
const AdminHomepageSections = lazy(() => import('@/pages/admin/AdminHomepageSections'));
const AdminBrandCarousel = lazy(() => import('@/pages/admin/AdminBrandCarousel'));
const AdminHeroBanner = lazy(() => import('@/pages/admin/AdminHeroBanner'));
const AdminTheme = lazy(() => import('@/pages/admin/AdminTheme'));
const AdminBrandSettings = lazy(() => import('@/pages/admin/AdminBrandSettings'));
const AdminSeoSettings = lazy(() => import('@/pages/admin/AdminSeoSettings'));
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'));
const AdminPerformance = lazy(() => import('@/pages/admin/AdminPerformance'));
const AdminReports = lazy(() => import('@/pages/admin/AdminReports'));
const AdminImageCompression = lazy(() => import('@/pages/admin/AdminImageCompression'));
const AdminNumberPlateBlur = lazy(() => import('@/pages/admin/AdminNumberPlateBlur'));
const AdminGithub = lazy(() => import('@/pages/admin/AdminGithub'));
const AdminSourceCode = lazy(() => import('@/pages/admin/AdminSourceCode'));

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
  </div>
);

const App: React.FC = () => {
  return (
    <HelmetProvider>
    <Router>
      <SiteSettingsProvider>
      <AuthProvider>
        <LanguageProvider>
          <CompareProvider>
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/car/:id" element={<CarDetailPage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/auctions" element={<AuctionFeatureGuard><AuctionsListPage /></AuctionFeatureGuard>} />
                <Route path="/auction/:id" element={<AuctionDetailPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogPage />} />
                <Route path="/sell" element={<SellCarPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/dashboard" element={<UserDashboardPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Dealership portal */}
                <Route path="/dealership" element={<DealershipDashboard />} />
                <Route path="/dealership/inventory" element={<DealershipInventory />} />
                <Route path="/dealership/leads" element={<DealershipLeads />} />
                <Route path="/dealership/sales" element={<DealershipSales />} />
                <Route path="/dealership/analytics" element={<DealershipAnalytics />} />
                <Route path="/dealership/communication" element={<DealershipCommunication />} />
                <Route path="/dealership/team" element={<DealershipTeam />} />
                <Route path="/dealership/activity" element={<DealershipActivity />} />

                {/* Admin panel */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/inventory" element={<AdminInventory />} />
                <Route path="/admin/moderation" element={<AdminModeration />} />
                <Route path="/admin/vehicle-database" element={<AdminVehicleDatabase />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/dealerships" element={<AdminDealerships />} />
                <Route path="/admin/auctions" element={<AdminAuctions />} />
                <Route path="/admin/auction-analytics" element={<AdminAuctionAnalytics />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/performance" element={<AdminPerformance />} />
                <Route path="/admin/reports" element={<AdminReports />} />
                <Route path="/admin/inquiries" element={<AdminInquiries />} />
                <Route path="/admin/blog" element={<AdminBlog />} />
                <Route path="/admin/testimonials" element={<AdminTestimonials />} />
                <Route path="/admin/brands" element={<AdminBrands />} />
                <Route path="/admin/homepage-sections" element={<AdminHomepageSections />} />
                <Route path="/admin/brand-carousel" element={<AdminBrandCarousel />} />
                <Route path="/admin/hero-banner" element={<AdminHeroBanner />} />
                <Route path="/admin/theme" element={<AdminTheme />} />
                <Route path="/admin/brand-settings" element={<AdminBrandSettings />} />
                <Route path="/admin/seo-settings" element={<AdminSeoSettings />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                <Route path="/admin/image-compression" element={<AdminImageCompression />} />
                <Route path="/admin/plate-blur" element={<AdminNumberPlateBlur />} />
                <Route path="/admin/github" element={<AdminGithub />} />
                <Route path="/admin/source-code" element={<AdminSourceCode />} />

                <Route path="/dealer/:id" element={<DealerPublicPage />} />

                {/* 404 */}
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
            <Toaster richColors position="top-right" />
          </CompareProvider>
        </LanguageProvider>
      </AuthProvider>
      </SiteSettingsProvider>
    </Router>
    </HelmetProvider>
  );
};

export default App;
