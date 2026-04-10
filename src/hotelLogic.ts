export interface Room {
  id: number;
  type: 'sencilla' | 'doble' | 'suite';
  basePrice: number;
}

export interface Reservation {
  id: string;
  guestName: string;
  startDate: string;
  endDate: string;
  roomId: number;
}

export interface Invoice {
  reservationId: string;
  items: string[];
  total: number;
}

const BASE_URL = "https://taller-reservas-hotel.onrender.com/api/hotel";

export const hotelApi = {
  getAvailableRooms: async (start: string, end: string): Promise<Room[]> => {
    const response = await fetch(`${BASE_URL}/disponibilidad?inicio=${start}&fin=${end}`);
    if (!response.ok) throw new Error();
    return response.json();
  },

  createBooking: async (data: any): Promise<Reservation> => {
    const response = await fetch(`${BASE_URL}/reservar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  addExtraService: async (id: string, type: string) => {
    return fetch(`${BASE_URL}/servicios/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipoServicio: type })
    });
  },

  confirmCheckIn: async (id: string) => {
    return fetch(`${BASE_URL}/checkin/${id}`, { method: 'PUT' });
  },

  confirmCheckOut: async (id: string): Promise<Invoice> => {
    const response = await fetch(`${BASE_URL}/checkout/${id}`, { method: 'PUT' });
    return response.json();
  }
};