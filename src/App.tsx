import { useState, useMemo } from 'react';

// --- 1. LÓGICA DE CONEXIÓN (Render) ---
const BASE_URL = "https://taller-reservas-hotel.onrender.com/api/hotel";

// --- 2. DISEÑO LUXE & BOUTIQUE (Azul Suave) ---
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
  fontImport: `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Poppins:wght@300;400;600&display=swap');`,
  main: { padding: '60px 20px', maxWidth: '100%', margin: '0 auto', fontFamily: '"Poppins", sans-serif', backgroundColor: THEME.bgLight, minHeight: '100vh', display: 'flex', flexDirection: 'column' as const, alignItems: 'center' as const },
  header: { textAlign: 'center' as const, marginBottom: '60px' },
  title: { fontFamily: '"Playfair Display", serif', fontSize: '3.5rem', color: THEME.primaryBlue, marginBottom: '10px' },
  card: { background: 'rgba(255, 255, 255, 0.9)', padding: '50px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', marginBottom: '40px', width: '100%', maxWidth: '700px', textAlign: 'center' as const },
  input: { padding: '12px 20px', borderRadius: '12px', border: `1px solid #DCDDE1`, margin: '10px', fontSize: '1rem' },
  button: { background: THEME.primaryBlue, color: 'white', padding: '15px 40px', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '1px', transition: '0.3s' },
  roomGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px', width: '100%', maxWidth: '1100px' },
  roomCard: { background: 'white', padding: '30px', borderRadius: '24px', textAlign: 'center' as const, border: '1px solid #F0F0F0', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' },
  price: { fontSize: '2rem', color: THEME.accentGold, fontFamily: '"Playfair Display", serif', fontWeight: 700 }
};

export default function App() {
  const [view, setView] = useState<'search' | 'manage' | 'invoice'>('search');
  const [rooms, setRooms] = useState<any[]>([]);
  const [dates, setDates] = useState({ start: '', end: '' });
  const [booking, setBooking] = useState<any | null>(null);
  const [invoice, setInvoice] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const minOutDate = useMemo(() => {
    if (!dates.start) return today;
    const d = new Date(dates.start); d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, [dates.start, today]);

  // Función de búsqueda corregida
  const handleSearch = async () => {
    if (!dates.start || !dates.end) return alert("Selecciona fechas");
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/disponibilidad?inicio=${dates.start}&fin=${dates.end}`);
      if (!response.ok) throw new Error("Backend dormido");
      const data = await response.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      alert("El servidor de Render está despertando. Por favor, intenta de nuevo en 20 segundos.");
    } finally {
      setLoading(false); // ESTO QUITA LOS PUNTOS SIEMPRE
    }
  };

  const handleBooking = async (room: any) => {
    const name = prompt("Nombre del huésped:");
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
    } catch { alert("Error al reservar"); }
  };

  return (
    <div style={styles.main}>
      <style>{styles.fontImport}</style>
      
      <header style={styles.header}>
        <h1 style={styles.title}>Luxe & Comfort</h1>
        <p style={{color: THEME.accentGold, letterSpacing: '3px', textTransform: 'uppercase'}}>Reserva Exclusiva</p>
      </header>

      {view === 'search' && (
        <>
          <div style={styles.card}>
            <h3 style={{fontFamily: '"Playfair Display", serif', fontSize: '1.8rem', marginBottom: '20px'}}>Encuentre su Estancia</h3>
            <div style={{marginBottom: '20px'}}>
              <input type="date" min={today} value={dates.start} onChange={e => setDates({start: e.target.value, end: ''})} style={styles.input} />
              <input type="date" min={minOutDate} disabled={!dates.start} value={dates.end} onChange={e => setDates({...dates, end: e.target.value})} style={styles.input} />
            </div>
            <button onClick={handleSearch} style={styles.button} disabled={loading}>
              {loading ? 'DESPERTANDO SERVIDOR...' : 'VER DISPONIBILIDAD'}
            </button>
          </div>

          <div style={styles.roomGrid}>
            {rooms.map(r => (
              <div key={r.id} style={styles.roomCard}>
                <h4 style={{fontFamily: '"Playfair Display", serif', fontSize: '1.5rem'}}>{r.type.toUpperCase()}</h4>
                <p style={styles.price}>${(new Date(dates.start).getMonth() === 5 || new Date(dates.start).getMonth() === 6 || new Date(dates.start).getMonth() === 11) ? r.basePrice * 1.5 : r.basePrice}</p>
                <button onClick={() => handleBooking(r)} style={{...styles.button, background: THEME.accentGold, fontSize: '0.8rem'}}>RESERVAR AHORA</button>
              </div>
            ))}
          </div>
        </>
      )}

      {view === 'manage' && booking && (
        <div style={styles.card}>
          <h2 style={{fontFamily: '"Playfair Display", serif'}}>Panel de Invitado</h2>
          <p>Bienvenido, <strong>{booking.guestName}</strong></p>
          <div style={{margin: '30px 0'}}>
            <button onClick={() => fetch(`${BASE_URL}/checkin/${booking.id}`, {method: 'PUT'})} style={styles.button}>CHECK-IN</button>
          </div>
          <div style={{display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px'}}>
            <button onClick={() => fetch(`${BASE_URL}/servicios/${booking.id}`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({tipoServicio: 'SPA'})})} style={{...styles.button, background: THEME.softBlue, fontSize: '0.7rem'}}>SPA</button>
            <button onClick={() => fetch(`${BASE_URL}/servicios/${booking.id}`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({tipoServicio: 'DESAYUNO'})})} style={{...styles.button, background: THEME.softBlue, fontSize: '0.7rem'}}>DESAYUNO</button>
          </div>
          <button onClick={async () => {
            const res = await fetch(`${BASE_URL}/checkout/${booking.id}`, {method: 'PUT'});
            const fact = await res.json();
            setInvoice(fact); setView('invoice');
          }} style={{...styles.button, background: THEME.error}}>FINALIZAR Y FACTURAR</button>
        </div>
      )}

      {view === 'invoice' && invoice && (
        <div style={{...styles.card, borderTop: `6px solid ${THEME.accentGold}`}}>
          <h2 style={{fontFamily: '"Playfair Display", serif'}}>Su Factura</h2>
          <ul style={{listStyle: 'none', padding: 0, textAlign: 'left'}}>
            {invoice.items.map((it: string, i: number) => (
              <li key={i} style={{padding: '10px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between'}}>
                {it.split(':')[0]} <span>{it.split(':')[1]}</span>
              </li>
            ))}
          </ul>
          <div style={{marginTop: '30px', padding: '20px', background: THEME.primaryBlue, color: 'white', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <span>TOTAL</span>
            <span style={{fontSize: '2rem', fontWeight: 700}}>${invoice.total}</span>
          </div>
          <button onClick={() => window.location.reload()} style={{...styles.button, marginTop: '30px', background: THEME.accentGold}}>NUEVA RESERVA</button>
        </div>
      )}
    </div>
  );
}