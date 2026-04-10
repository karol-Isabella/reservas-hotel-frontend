import { useState, useMemo } from 'react';

// --- 1. LÓGICA INTEGRADA (Para que Vercel no busque otros archivos) ---
interface Room {
  id: number;
  type: 'sencilla' | 'doble' | 'suite';
  basePrice: number;
}

interface Reservation {
  id: string;
  guestName: string;
  startDate: string;
  endDate: string;
  roomId: number;
}

interface Invoice {
  reservationId: string;
  items: string[];
  total: number;
}

const BASE_URL = "https://taller-reservas-hotel.onrender.com/api/hotel";

const hotelApi = {
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

// --- 2. ESTILOS BOUTIQUE ---
const THEME = {
  primaryBlue: '#2C3E50',
  softBlue: '#5D8AA8',
  accentGold: '#A9927D',
  bgLight: '#F4F7F6',
  white: '#FFFFFF',
  text: '#34495E',
  error: '#E74C3C'
};

const styles = {
  main: { padding: '60px 20px', maxWidth: '100%', margin: '0 auto', fontFamily: 'sans-serif', backgroundColor: THEME.bgLight, minHeight: '100vh', display: 'flex', flexDirection: 'column' as const, alignItems: 'center' as const },
  header: { textAlign: 'center' as const, marginBottom: '60px', width: '100%', maxWidth: '900px' },
  title: { fontSize: '3rem', color: THEME.primaryBlue, marginBottom: '10px', fontWeight: 700 },
  card: { background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom: '40px', width: '100%', maxWidth: '700px', textAlign: 'center' as const },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', margin: '5px' },
  button: { background: THEME.primaryBlue, color: 'white', padding: '12px 30px', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 600, margin: '5px' }
};

// --- 3. COMPONENTE PRINCIPAL ---
export default function App() {
  const [view, setView] = useState<'search' | 'manage' | 'invoice'>('search');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [dates, setDates] = useState({ start: '', end: '' });
  const [booking, setBooking] = useState<Reservation | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const minOutDate = useMemo(() => {
    if (!dates.start) return today;
    const d = new Date(dates.start);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, [dates.start, today]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await hotelApi.getAvailableRooms(dates.start, dates.end);
      setRooms(data);
    } catch { alert("Error al cargar"); }
    finally { setLoading(false); }
  };

  const handleBooking = async (room: Room) => {
    const name = prompt("Nombre del huésped:");
    if (!name) return;
    const res = await hotelApi.createBooking({ guestName: name, startDate: dates.start, endDate: dates.end, roomId: room.id });
    setBooking(res); setView('manage');
  };

  return (
    <div style={styles.main}>
      <header style={styles.header}>
        <h1 style={styles.title}>Luxe & Comfort</h1>
        <p style={{color: THEME.accentGold, letterSpacing: '2px'}}>RESERVA EXCLUSIVA</p>
      </header>

      {view === 'search' && (
        <>
          <div style={styles.card}>
            <h3>Buscar Disponibilidad</h3>
            <input type="date" min={today} onChange={e => setDates({start: e.target.value, end: ''})} style={styles.input} />
            <input type="date" min={minOutDate} disabled={!dates.start} onChange={e => setDates({...dates, end: e.target.value})} style={styles.input} />
            <button onClick={handleSearch} style={styles.button}>{loading ? '...' : 'Consultar'}</button>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', width: '100%', maxWidth: '1000px'}}>
            {rooms.map(r => (
              <div key={r.id} style={{background: 'white', padding: '20px', borderRadius: '15px', textAlign: 'center'}}>
                <h4>{r.type.toUpperCase()}</h4>
                <p style={{fontSize: '1.5rem', color: THEME.accentGold}}>${r.basePrice}</p>
                <button onClick={() => handleBooking(r)} style={{...styles.button, background: THEME.softBlue}}>Reservar</button>
              </div>
            ))}
          </div>
        </>
      )}

      {view === 'manage' && booking && (
        <div style={styles.card}>
          <h2>Gestión de Reserva</h2>
          <p>Huésped: <strong>{booking.guestName}</strong></p>
          <button onClick={() => hotelApi.confirmCheckIn(booking.id)} style={styles.button}>Check-In</button>
          <div style={{margin: '20px 0'}}>
            <button onClick={() => hotelApi.addExtraService(booking.id, 'SPA')} style={{...styles.button, background: THEME.accentGold}}>Spa</button>
            <button onClick={() => hotelApi.addExtraService(booking.id, 'DESAYUNO')} style={{...styles.button, background: THEME.accentGold}}>Desayuno</button>
          </div>
          <button onClick={async () => { const fact = await hotelApi.confirmCheckOut(booking.id); setInvoice(fact); setView('invoice'); }} style={{...styles.button, background: THEME.error}}>Check-Out y Facturar</button>
        </div>
      )}

      {view === 'invoice' && invoice && (
        <div style={styles.card}>
          <h2>Factura Final</h2>
          <ul style={{textAlign: 'left', listStyle: 'none'}}>
            {invoice.items.map((it, i) => <li key={i} style={{borderBottom: '1px solid #eee', padding: '10px 0'}}>{it}</li>)}
          </ul>
          <h3 style={{color: THEME.primaryBlue, fontSize: '2rem'}}>Total: ${invoice.total}</h3>
          <button onClick={() => window.location.reload()} style={styles.button}>Finalizar</button>
        </div>
      )}
    </div>
  );
}