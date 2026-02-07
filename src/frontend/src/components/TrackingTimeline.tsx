import { TrackingEvent } from '../backend';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Clock, Package, CheckCircle2 } from 'lucide-react';

interface TrackingTimelineProps {
  events: TrackingEvent[];
}

export default function TrackingTimeline({ events }: TrackingTimelineProps) {
  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No tracking events available yet</p>
        </CardContent>
      </Card>
    );
  }

  // Sort events by timestamp (newest first)
  const sortedEvents = [...events].sort((a, b) => Number(b.timestamp - a.timestamp));

  return (
    <div className="space-y-4">
      {sortedEvents.map((event, index) => (
        <Card key={index} className={index === 0 ? 'border-accent shadow-sm' : ''}>
          <CardContent className="p-6">
            <div className="flex gap-4">
              {/* Timeline indicator */}
              <div className="flex flex-col items-center">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  index === 0 
                    ? 'bg-accent text-accent-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {index === 0 ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Package className="h-5 w-5" />
                  )}
                </div>
                {index < sortedEvents.length - 1 && (
                  <div className="w-0.5 flex-1 bg-border mt-2 min-h-[40px]" />
                )}
              </div>

              {/* Event details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{event.status}</h3>
                    {index === 0 && (
                      <Badge variant="default" className="mt-1">
                        Latest Update
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{event.date} at {event.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                </div>

                {event.note && (
                  <>
                    <Separator className="my-3" />
                    <p className="text-sm text-foreground/80">{event.note}</p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
