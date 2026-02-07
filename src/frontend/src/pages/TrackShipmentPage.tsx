import { useState } from 'react';
import { useGetShipment } from '../hooks/useShipmentTracking';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import TrackingTimeline from '../components/TrackingTimeline';
import { Search, Package, MapPin, User, Calendar, AlertCircle, Loader2 } from 'lucide-react';

export default function TrackShipmentPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: shipment, isLoading, error, refetch } = useGetShipment(searchQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      setSearchQuery(trackingNumber.trim());
    }
  };

  const showResults = searchQuery && !isLoading;
  const hasError = showResults && error;
  const hasShipment = showResults && shipment && !error;

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background via-background to-accent/5 border-b">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src="/assets/generated/courier-hero.dim_1600x600.png" 
            alt="Courier Hero" 
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        <div className="container mx-auto px-4 py-16 relative">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
              Track Your Shipment
            </h1>
            <p className="text-lg text-muted-foreground text-balance">
              Enter your tracking number below to get real-time updates on your package
            </p>
          </div>

          {/* Search Form */}
          <Card className="max-w-2xl mx-auto shadow-lg">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tracking-number">Tracking Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tracking-number"
                      type="text"
                      placeholder="Enter tracking number (e.g., test-0)"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="flex-1"
                      disabled={isLoading}
                    />
                    <Button 
                      type="submit" 
                      disabled={isLoading || !trackingNumber.trim()}
                      className="gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4" />
                          Track
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Results Section */}
      {showResults && (
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Error State */}
            {hasError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error?.message?.includes('not found') 
                    ? `Tracking number "${searchQuery}" not found. Please check the number and try again.`
                    : 'An error occurred while fetching shipment details. Please try again.'}
                </AlertDescription>
              </Alert>
            )}

            {/* Shipment Details */}
            {hasShipment && (
              <div className="space-y-6">
                {/* Shipment Summary */}
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl">Shipment Details</CardTitle>
                        <CardDescription className="mt-1">
                          Tracking Number: <span className="font-mono font-semibold text-foreground">{shipment.trackingNumber}</span>
                        </CardDescription>
                      </div>
                      {shipment.events.length > 0 && (
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Current Status</div>
                          <div className="text-lg font-semibold text-accent">
                            {shipment.events[shipment.events.length - 1].status}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="flex gap-3">
                        <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-5 w-5 text-accent" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm text-muted-foreground">Origin</div>
                          <div className="font-medium truncate">{shipment.origin}</div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <Package className="h-5 w-5 text-accent" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm text-muted-foreground">Destination</div>
                          <div className="font-medium truncate">{shipment.destination}</div>
                        </div>
                      </div>

                      {shipment.recipient && (
                        <div className="flex gap-3">
                          <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 text-accent" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm text-muted-foreground">Recipient</div>
                            <div className="font-medium truncate">{shipment.recipient}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Separator />

                {/* Tracking Timeline */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Calendar className="h-6 w-6 text-accent" />
                    Tracking History
                  </h2>
                  <TrackingTimeline events={shipment.events} />
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
