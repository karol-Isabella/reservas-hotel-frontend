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
  status?: string;
}

export interface Invoice {
  reservationId: string;
  items: string[];
  total: number;
}

const API_URL = "https://tu-backend-railway.app/api/hotel";

export const hotelService = {
  getRooms: async (start: string, end: string): Promise<Room[]> => {
    const response = await fetch(`${API_URL}/disponibilidad?inicio=${start}&fin=${end}`);
    return response.json();
  },

  postReservation: async (data: Reservation): Promise<Reservation> => {
    const response = await fetch(`${API_URL}/reservar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  postService: async (id: string, serviceType: 'SPA' | 'DESAYUNO' | 'TRASLADO') => {
    return fetch(`${API_URL}/servicios/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipoServicio: serviceType })
    });
  },

  putCheckIn: async (id: string) => {
    return fetch(`${API_URL}/checkin/${id}`, { method: 'PUT' });
  },

  putCheckOut: async (id: string): Promise<Invoice> => {
    const response = await fetch(`${API_URL}/checkout/${id}`, { method: 'PUT' });
    return response.json();
  }
};