export interface Room {
  id: number;
  type: 'sencilla' | 'doble' | 'suite';
  basePrice: number;
  isAvailable: boolean;
}

export interface Reservation {
  id?: string;
  guestName: string;
  startDate: string;
  endDate: string;
  roomId: number;
  extraServices?: string[];
  status?: string;
}

export interface Invoice {
  reservationId: string;
  items: string[];
  total: number;
}