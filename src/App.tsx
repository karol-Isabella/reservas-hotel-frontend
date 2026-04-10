import { useState, useMemo, useEffect } from 'react';

// --- CONFIGURACIÓN ---
const BASE_URL = "https://taller-reservas-hotel.onrender.com/api/hotel";

export default function App() {
  const [view, setView] = useState<'search' | 'manage' | 'invoice'>('search');
  const [rooms, setRooms] = useState<any[]>([]);
  const [dates, setDates] = useState({ start: '', end: '' });
  const [booking, setBooking] = useState<any | null>(null);
  const [invoice, setInvoice] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // --- LÓGICA DE FECHAS ---
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const minOutDate = useMemo(() => {
    if (!dates.start) return today;
    const d = new Date(dates.start); d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, [dates.start, today]);

  // --- FUNCIONES API ---
  const handleSearch = async () => {
    if (!dates.start || !dates.end) return alert("Selecciona fechas");
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/disponibilidad?inicio=${dates.start}&fin=${dates.end}`);
      const data = await res.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      alert("El servidor de Render está despertando. Reintenta en 20 segundos.");
    } finally { setLoading(false); }
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
      setBooking(data); setView('manage');
    } catch { alert("Error al reservar"); }
  };

  // --- RENDERIZADO ---
  return (
    <div style={{ padding: '60px 20px', backgroundColor: '#F4F7F6', minHeight: '100vh', fontFamily: 'serif', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Import de Fuente Elegante Directo */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Poppins:wght@400;600&display=swap');
        h1, h2, h3, .elegant { font-family: 'Playfair Display', serif !important; }
        body { font-family: 'Poppins', sans-serif; margin: 0; }
        button { transition: 0.3s; cursor: pointer; }
        button:hover { opacity: 0.8; transform: translateY(-2px); }
      `}</style>
      
      <header style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '3.5rem', color: '#2C3E50', margin: 0 }}>Luxe & Comfort</h1>
        <p style={{ color: '#A9927D', letterSpacing: '4px', textTransform: 'uppercase', fontSize: '0.9rem' }}>Reserva de Experiencias Exclusivas</p>
      </header>

      {view === 'search' && (
        <>
          <div style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 15px 35px rgba(0,0,0,0.05)', width: '100%', maxWidth: '700px', textAlign: 'center', marginBottom: '40px' }}>
            <h3 style={{ fontSize: '1.8rem', color: '#2C3E50' }}>Encuentre su Estancia</h3>
            <div style={{ margin: '20px 0' }}>
              <input type="date" min={today} value={dates.start} onChange={e => setDates({start: e.target.value, end: ''})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', margin: '5px' }} />
              <input type="date" min={minOutDate} disabled={!dates.start} value={dates.end} onChange={e => setDates({...dates, end: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', margin: '5px' }} />
            </div>
            <button onClick={handleSearch} style={{ background: '#2C3E50', color: 'white', padding: '15px 40px', border: 'none', borderRadius: '50px', fontWeight: 600 }}>
              {loading ? 'DESPERTANDO SERVIDOR...' : 'VER DISPONIBILIDAD'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px', width: '100%', maxWidth: '1000px' }}>
            {rooms.map(r => (
              <div key={r.id} style={{ background: 'white', padding: '30px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.02)' }}>
                <h4 style={{ fontSize: '1.4rem', color: '#2C3E50' }}>{r.type.toUpperCase()}</h4>
                <p style={{ fontSize: '2rem', color: '#A9927D', fontWeight: 700 }}>${(new Date(dates.start).getMonth() === 5 || new Date(dates.start).getMonth() === 6 || new Date(dates.start).getMonth() === 11) ? r.basePrice * 1.5 : r.basePrice}</p>
                <button onClick={() => handleBooking(r)} style={{ background: '#A9927D', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px' }}>RESERVAR</button>
              </div>
            ))}
          </div>
        </>
      )}

      {view === 'manage' && booking && (
        <div style={{ background: 'white', padding: '40px', borderRadius: '24px', textAlign: 'center', maxWidth: '600px', width: '100%' }}>
          <h2>Gestión de Invitado</h2>
          <p>Bienvenido, <strong>{booking.guestName}</strong></p>
          <div style={{ margin: '30px 0' }}>
            <button onClick={() => fetch(`${BASE_URL}/checkin/${booking.id}`, {method: 'PUT'})} style={{ background: '#2C3E50', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '8px', margin: '5px' }}>HACER CHECK-IN</button>
          </div>
          <button onClick={async () => {
            const res = await fetch(`${BASE_URL}/checkout/${booking.id}`, {method: 'PUT'});
            const data = await res.json(); setInvoice(data); setView('invoice');
          }} style={{ background: '#E74C3C', color: 'white', padding: '15px 40px', border: 'none', borderRadius: '8px', width: '100%', fontWeight: 700 }}>FINALIZAR ESTANCIA</button>
        </div>
      )}

      {view === 'invoice' && invoice && (
        <div style={{ background: 'white', padding: '40px', borderRadius: '24px', maxWidth: '500px', width: '100%', borderTop: '8px solid #A9927D' }}>
          <h2 style={{ textAlign: 'center' }}>Factura de Servicios</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {invoice.items.map((it: string, i: number) => (
              <li key={i} style={{ padding: '10px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                {it.split(':')[0]} <span>{it.split(':')[1]}</span>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: '30px', padding: '20px', background: '#2C3E50', color: 'white', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>TOTAL</span>
            <span style={{ fontSize: '2rem' }}>${invoice.total}</span>
          </div>
          <button onClick={() => window.location.reload()} style={{ marginTop: '20px', width: '100%', padding: '10px', background: '#A9927D', color: 'white', border: 'none', borderRadius: '8px' }}>NUEVA RESERVA</button>
        </div>
      )}
    </div>
  );
}