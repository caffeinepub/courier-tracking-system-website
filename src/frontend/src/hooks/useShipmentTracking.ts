import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Shipment, TrackingEvent } from '../backend';

export function useGetShipment(trackingNumber: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Shipment>({
    queryKey: ['shipment', trackingNumber],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getShipment(trackingNumber);
    },
    enabled: !!actor && !isFetching && !!trackingNumber,
    retry: false,
  });
}

export function useGetLatestTrackingEvent(trackingNumber: string) {
  const { actor, isFetching } = useActor();

  return useQuery<TrackingEvent>({
    queryKey: ['latestEvent', trackingNumber],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getLatestTrackingEvent(trackingNumber);
    },
    enabled: !!actor && !isFetching && !!trackingNumber,
    retry: false,
  });
}
