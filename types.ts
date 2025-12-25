
export enum UserRole {
  STORE = 'STORE',
  RIDER = 'RIDER'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  PICKED_UP = 'PICKED_UP',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface Location {
  address: string;
  lat: number;
  lng: number;
}

export interface Order {
  id: string;
  storeId: string;
  storeName: string;
  pickupLocation: Location;
  dropoffLocation: Location;
  distance: number; // in km
  price: number;
  estimatedTime: number; // in minutes
  status: OrderStatus;
  riderId?: string;
  createdAt: number;
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  rating: number;
}
