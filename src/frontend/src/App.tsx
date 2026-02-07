import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import TrackShipmentPage from './pages/TrackShipmentPage';
import AdminPage from './pages/AdminPage';
import SiteHeader from './components/SiteHeader';
import { Toaster } from '@/components/ui/sonner';

// Layout component with header
function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t bg-card py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026. Built with <span className="text-accent">♥</span> using{' '}
          <a 
            href="https://caffeine.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-accent hover:underline font-medium"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}

// Define routes
const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: TrackShipmentPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPage,
});

// Create router
const routeTree = rootRoute.addChildren([indexRoute, adminRoute]);
const router = createRouter({ routeTree });

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
