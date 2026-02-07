import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import AdminGuard from '../components/AdminGuard';
import LoginButton from '../components/LoginButton';
import { useCreateShipment, useAddTrackingEvent, useGetAllShipments, useGenerateTrackingNumber } from '../hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Plus, Clock, Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminContent />
    </AdminGuard>
  );
}

function AdminContent() {
  const queryClient = useQueryClient();
  const { data: shipments, isLoading: shipmentsLoading } = useGetAllShipments();
  const createShipmentMutation = useCreateShipment();
  const addEventMutation = useAddTrackingEvent();
  const generateTrackingNumberMutation = useGenerateTrackingNumber();

  // Create Shipment Form State
  const [newShipment, setNewShipment] = useState({
    trackingNumber: '',
    origin: '',
    destination: '',
    recipient: '',
  });

  // Add Event Form State
  const [newEvent, setNewEvent] = useState({
    trackingNumber: '',
    status: '',
    location: '',
    date: '',
    time: '',
    note: '',
  });

  const handleGenerateTrackingNumber = async () => {
    try {
      const trackingNumber = await generateTrackingNumberMutation.mutateAsync();
      setNewShipment({ ...newShipment, trackingNumber });
      toast.success('Tracking number generated!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate tracking number');
    }
  };

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let trackingNumber = newShipment.trackingNumber.trim();
      
      // If tracking number is empty, generate one first
      if (!trackingNumber) {
        try {
          trackingNumber = await generateTrackingNumberMutation.mutateAsync();
        } catch (error: any) {
          toast.error(error.message || 'Failed to generate tracking number');
          return;
        }
      }

      await createShipmentMutation.mutateAsync({
        trackingNumber,
        origin: newShipment.origin,
        destination: newShipment.destination,
        recipient: newShipment.recipient || null,
      });
      
      toast.success('Shipment created successfully!');
      setNewShipment({ trackingNumber: '', origin: '', destination: '', recipient: '' });
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create shipment');
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const timestamp = BigInt(Date.now() * 1_000_000);
      
      await addEventMutation.mutateAsync({
        trackingNumber: newEvent.trackingNumber,
        event: {
          timestamp,
          date: newEvent.date,
          time: newEvent.time,
          location: newEvent.location,
          status: newEvent.status,
          note: newEvent.note || undefined,
        },
      });
      
      toast.success('Tracking event added successfully!');
      setNewEvent({ trackingNumber: '', status: '', location: '', date: '', time: '', note: '' });
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to add tracking event');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground mt-1">Manage shipments and tracking events</p>
          </div>
          <LoginButton />
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Create Shipment</TabsTrigger>
            <TabsTrigger value="event">Add Event</TabsTrigger>
            <TabsTrigger value="list">All Shipments</TabsTrigger>
          </TabsList>

          {/* Create Shipment Tab */}
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Shipment
                </CardTitle>
                <CardDescription>
                  Add a new shipment to the tracking system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateShipment} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tracking-number">Tracking Number</Label>
                      <div className="flex gap-2">
                        <Input
                          id="tracking-number"
                          value={newShipment.trackingNumber}
                          onChange={(e) => setNewShipment({ ...newShipment, trackingNumber: e.target.value })}
                          placeholder="e.g., TRK-12345 (or leave empty to auto-generate)"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleGenerateTrackingNumber}
                          disabled={generateTrackingNumberMutation.isPending}
                          className="shrink-0"
                        >
                          {generateTrackingNumberMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Leave empty to auto-generate on submit
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="recipient">Recipient Name</Label>
                      <Input
                        id="recipient"
                        value={newShipment.recipient}
                        onChange={(e) => setNewShipment({ ...newShipment, recipient: e.target.value })}
                        placeholder="Optional"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="origin">Origin *</Label>
                      <Input
                        id="origin"
                        value={newShipment.origin}
                        onChange={(e) => setNewShipment({ ...newShipment, origin: e.target.value })}
                        placeholder="e.g., New York, NY"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="destination">Destination *</Label>
                      <Input
                        id="destination"
                        value={newShipment.destination}
                        onChange={(e) => setNewShipment({ ...newShipment, destination: e.target.value })}
                        placeholder="e.g., Los Angeles, CA"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={createShipmentMutation.isPending || generateTrackingNumberMutation.isPending}
                    className="w-full gap-2"
                  >
                    {createShipmentMutation.isPending || generateTrackingNumberMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Create Shipment
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add Event Tab */}
          <TabsContent value="event">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Add Tracking Event
                </CardTitle>
                <CardDescription>
                  Update the status of an existing shipment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddEvent} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-tracking-number">Tracking Number *</Label>
                    <Input
                      id="event-tracking-number"
                      value={newEvent.trackingNumber}
                      onChange={(e) => setNewEvent({ ...newEvent, trackingNumber: e.target.value })}
                      placeholder="e.g., TRK-12345"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status *</Label>
                      <Input
                        id="status"
                        value={newEvent.status}
                        onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })}
                        placeholder="e.g., In Transit"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                        placeholder="e.g., Chicago Hub"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time">Time *</Label>
                      <Input
                        id="time"
                        type="time"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="note">Note</Label>
                    <Textarea
                      id="note"
                      value={newEvent.note}
                      onChange={(e) => setNewEvent({ ...newEvent, note: e.target.value })}
                      placeholder="Optional additional information"
                      rows={3}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={addEventMutation.isPending}
                    className="w-full gap-2"
                  >
                    {addEventMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Add Event
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Shipments Tab */}
          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  All Shipments
                </CardTitle>
                <CardDescription>
                  View and manage all shipments in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {shipmentsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-accent" />
                  </div>
                ) : !shipments || shipments.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No shipments found. Create your first shipment to get started.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {shipments.map((shipment) => (
                      <Card key={shipment.trackingNumber} className="border-l-4 border-l-accent">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="font-mono font-semibold text-lg">
                                {shipment.trackingNumber}
                              </div>
                              {shipment.recipient && (
                                <div className="text-sm text-muted-foreground">
                                  Recipient: {shipment.recipient}
                                </div>
                              )}
                            </div>
                            <Badge variant={shipment.events.length > 0 ? 'default' : 'secondary'}>
                              {shipment.events.length} {shipment.events.length === 1 ? 'Event' : 'Events'}
                            </Badge>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Origin:</span>{' '}
                              <span className="font-medium">{shipment.origin}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Destination:</span>{' '}
                              <span className="font-medium">{shipment.destination}</span>
                            </div>
                          </div>

                          {shipment.events.length > 0 && (
                            <>
                              <Separator className="my-4" />
                              <div className="text-sm">
                                <span className="text-muted-foreground">Latest Status:</span>{' '}
                                <span className="font-medium text-accent">
                                  {shipment.events[shipment.events.length - 1].status}
                                </span>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
