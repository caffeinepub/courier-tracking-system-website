import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface TrackingEvent {
    status: string;
    date: string;
    note?: string;
    time: string;
    timestamp: Time;
    location: string;
}
export interface Shipment {
    trackingNumber: string;
    destination: string;
    createdAt: Time;
    origin: string;
    recipient?: string;
    events: Array<TrackingEvent>;
}
export interface UserProfile {
    name: string;
    email?: string;
    phone?: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addTestShipments(): Promise<void>;
    addTrackingEvent(trackingNumber: string, event: TrackingEvent): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createShipment(trackingNumber: string, origin: string, destination: string, recipient: string | null): Promise<void>;
    generateTrackingNumber(): Promise<string>;
    getAllShipments(): Promise<Array<Shipment>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLatestTrackingEvent(trackingNumber: string): Promise<TrackingEvent>;
    getShipment(trackingNumber: string): Promise<Shipment>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setInitialAdmin(adminToken: string, userProvidedToken: string): Promise<void>;
}
