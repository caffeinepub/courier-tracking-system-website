import { useMutation, useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Shipment, TrackingEvent, UserRole } from '../backend';

export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserRole>({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useGetAllShipments() {
  const { actor, isFetching } = useActor();

  return useQuery<Shipment[]>({
    queryKey: ['shipments'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllShipments();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useCreateShipment() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (params: {
      trackingNumber: string;
      origin: string;
      destination: string;
      recipient: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createShipment(
        params.trackingNumber,
        params.origin,
        params.destination,
        params.recipient
      );
    },
  });
}

export function useAddTrackingEvent() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (params: {
      trackingNumber: string;
      event: TrackingEvent;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addTrackingEvent(params.trackingNumber, params.event);
    },
  });
}

export function useGenerateTrackingNumber() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.generateTrackingNumber();
    },
  });
}
