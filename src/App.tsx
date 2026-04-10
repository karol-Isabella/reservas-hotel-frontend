import { useState, useMemo } from 'react';

// --- CONFIGURACIÓN Y TIPOS ---
const BASE_URL = "https://taller-reservas-hotel.onrender.com/api/hotel";

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

// --- ESTILOS BOUTIQUE ---
const THEME = {
  primaryBlue: '#2C3E50',
  softBlue: '#5D8AA8',
  accentGold: '#A9927D',
  bgLight: '#F4F7F6',
  white: '#FFFFFF',
  error: '#E74C3C'
};

const styles = {
  main: { padding: '60px 20px', maxWidth: '100%', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' as const, alignItems: 'center' as const },
  header: { textAlign: 'center' as const, marginBottom: '60px' },
  title: { fontSize: '3.5rem', color: THEME.primaryBlue, marginBottom: '10px', fontWeight: 700 },
  card: { background: 'white', padding: '45px', borderRadius: '24px', boxShadow: '0 15px 35px rgba(0,0,0,0.05)', marginBottom: '40px', width: '100%', maxWidth: '750px', textAlign: 'center' as const },
  input: { padding: '12px 20px', borderRadius: '12px', border: '1px solid #DCDDE1', margin: '10px', fontSize: '1rem', outline: 'none', color: THEME.primaryBlue },
  buttonPrimary: { background: THEME.primaryBlue, color: 'white', padding: '15px 40px', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '1px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px', width: '100%', maxWidth: '1100px' },
  roomCard: { background: 'white', padding: '35px', borderRadius: '24px', textAlign: 'center' as const, border: '1px solid #F0F0F0', boxShadow: '0 8px 20px rgba(0,0,0,0.02)' },
  price: { fontSize: '2.2rem', color: THEME.accentGold, fontWeight: 700, margin: '15px 0' }
};

export default function App() {
  const [view, setView] = useState<'search' | 'manage' | 'invoice'>('search');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [dates, setDates] = useState({ start: '', end: '' });
  const [booking, setBooking] = useState<Reservation | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);

  // Validación de fechas
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const minOutDate = useMemo(() => {
    if (!dates.start) return today;
    const d = new Date(dates.start);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, [dates.start, today]);

  const getDynamicPrice = (base: number) => {
    if (!dates.start) return base;
    const month = new Date(dates.start).getMonth();
    return [5, 6, 11].includes(month) ? base * 1.5 : base;
  };

  const handleSearch = async () => {
    if (!dates.start || !dates.end) return alert("Selecciona fechas válidas");
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/disponibilidad?inicio=${dates.start}&fin=${dates.end}`);
      const data = await res.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch {
      alert("El servidor está despertando. Intenta de nuevo en unos segundos.");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (room: Room) => {
    const name = prompt(`Reserva: ${room.type.toUpperCase()}\nNombre del huésped:`);
    if (!name) return;
    try {
      const res = await fetch(`${BASE_URL}/reservar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestName: name, startDate: dates.start, endDate: dates.end, roomId: room.id })
      });
      const data = await res.json();
      setBooking(data);
      setView('manage');
    } catch { alert("Error al crear reserva"); }
  };

  const addService = async (type: string) => {
    if (!booking) return;
    await fetch(`${BASE_URL}/servicios/${booking.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipoServicio: type })
    });
    alert(`Servicio de ${type} agregado.`);
  };

  return (
    <div style={styles.main}>
      <header style={styles.header}>
        <h1 style={styles.title} className="font-elegant">Luxe & Comfort</h1>
        <p style={{ color: THEME.accentGold, letterSpacing: '4px', textTransform: 'uppercase' }}>Reserva de Experiencias</p>
      </header>

      {view === 'search' && (
        <>
          <div style={styles.card}>
            <h3 className="font-elegant" style={{ fontSize: '2rem', marginBottom: '25px', color: THEME.primaryBlue }}>Encuentre su Estancia</h3>
            <div style={{ marginBottom: '25px' }}>
              <input type="date" min={today} value={dates.start} onChange={e => setDates({ start: e.target.value, end: '' })} style={styles.input} />
              <input type="date" min={minOutDate} disabled={!dates.start} value={dates.end} onChange={e => setDates({ ...dates, end: e.target.value })} style={styles.input} />
            </div>
            <button onClick={handleSearch} style={styles.buttonPrimary} disabled={loading}>
              {loading ? 'DESPERTANDO SERVIDOR...' : 'VER DISPONIBILIDAD'}
            </button>
          </div>

          <div style={styles.grid}>
            {rooms.map(r => (
              <div key={r.id} style={styles.roomCard}>
                <h4 className="font-elegant" style={{ fontSize: '1.6rem', color: THEME.primaryBlue }}>{r.type.toUpperCase()}</h4>
                <p className="font-elegant" style={styles.price}>${getDynamicPrice(r.basePrice).toLocaleString()}</p>
                <p style={{ color: THEME.softBlue, fontSize: '0.9rem', marginBottom: '20px' }}>Tarifa neta por noche</p>
                <button onClick={() => handleBooking(r)} style={{ ...styles.buttonPrimary, background: THEME.accentGold, fontSize: '0.8rem' }}>RESERVAR AHORA</button>
              </div>
            ))}
          </div>
        </>
      )}

      {view === 'manage' && booking && (
        <div style={styles.card}>
          <h2 className="font-elegant" style={{ color: THEME.primaryBlue }}>Panel de Invitado</h2>
          <p style={{ fontSize: '1.2rem' }}>Bienvenido, <strong>{booking.guestName}</strong></p>
          <p style={{ color: THEME.accentGold, marginBottom: '30px' }}>Ref: {booking.id}</p>
          
          <button onClick={() => { fetch(`${BASE_URL}/checkin/${booking.id}`, { method: 'PUT' }); alert("Check-In exitoso"); }} style={styles.buttonPrimary}>Confirmar Check-In</button>
          
          <div style={{ margin: '40px 0', padding: '20px', background: '#F9F9F9', borderRadius: '15px' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: THEME.softBlue, textTransform: 'uppercase' }}>Servicios Extra</p>
            <button onClick={() => addService('SPA')} style={{ ...styles.buttonPrimary, background: THEME.softBlue, fontSize: '0.7rem', padding: '10px 20px' }}>Spa</button>
            <button onClick={() => addService('DESAYUNO')} style={{ ...styles.buttonPrimary, background: THEME.softBlue, fontSize: '0.7rem', padding: '10px 20px' }}>Desayuno</button>
          </div>
          
          <button onClick={async () => {
            const res = await fetch(`${BASE_URL}/checkout/${booking.id}`, { method: 'PUT' });
            const data = await res.json();
            setInvoice(data); setView('invoice');
          }} style={{ ...styles.buttonPrimary, background: THEME.error }}>Finalizar Estancia</button>
        </div>
      )}

      {view === 'invoice' && invoice && (
        <div style={{ ...styles.card, borderTop: `6px solid ${THEME.accentGold}` }}>
          <h2 className="font-elegant" style={{ color: THEME.primaryBlue }}>Su Factura</h2>
          <ul style={{ listStyle: 'none', padding: 0, width: '100%', textAlign: 'left' }}>
            {invoice.items.map((item, i) => (
              <li key={i} style={{ padding: '15px 0', borderBottom: '1px solid #EEE', display: 'flex', justifyContent: 'space-between' }}>
                <span>{item.split(':')[0]}</span>
                <span style={{ fontWeight: 700 }}>{item.split(':')[1]}</span>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: '30px', padding: '25px', background: THEME.primaryBlue, color: 'white', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ textTransform: 'uppercase', fontSize: '0.9rem' }}>Inversión Total</span>
            <span className="font-elegant" style={{ fontSize: '2.5rem' }}>${invoice.total.toLocaleString()}</span>
          </div>
          <button onClick={() => window.location.reload()} style={{ ...styles.buttonPrimary, marginTop: '30px', background: THEME.accentGold }}>Nueva Reserva</button>
        </div>
      )}
    </div>
  );
}