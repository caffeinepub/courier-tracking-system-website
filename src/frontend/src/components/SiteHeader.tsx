import { Link, useNavigate } from '@tanstack/react-router';
import { Package, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoginButton from './LoginButton';

export default function SiteHeader() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img 
            src="/assets/generated/courier-logo.dim_512x512.png" 
            alt="Courier Tracking Logo" 
            className="h-10 w-10 object-contain"
          />
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-none">SwiftTrack</span>
            <span className="text-xs text-muted-foreground">Courier Tracking</span>
          </div>
        </Link>

        <nav className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/' })}
            className="gap-2"
          >
            <Package className="h-4 w-4" />
            Track Shipment
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/admin' })}
            className="gap-2"
          >
            <Shield className="h-4 w-4" />
            Admin
          </Button>

          <LoginButton />
        </nav>
      </div>
    </header>
  );
}
