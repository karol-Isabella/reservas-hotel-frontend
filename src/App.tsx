import { useState, useMemo } from 'react';
import { hotelApi } from './hotelLogic';
import type { Room, Reservation, Invoice } from './hotelLogic';

// Paleta de colores "Soft Boutique Hotel"
const THEME = {
  primaryBlue: '#2C3E50',    // Azul pizarra profundo y elegante
  softBlue: '#5D8AA8',       // Azul aire suave
  accentGold: '#A9927D',     // Dorado/marrón suave para lujo
  bgLight: '#F4F7F6',        // Gris/azul casi blanco
  white: '#FFFFFF',
  text: '#34495E',
  error: '#E74C3C'
};

const styles = {
  // Inyectamos fuentes elegantes directamente
  fontImport: `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Poppins:wght@300;400;600&display=swap');`,
  
  main: { 
    padding: '60px 20px', 
    maxWidth: '100%', 
    margin: '0 auto', 
    fontFamily: '"Poppins", sans-serif', 
    backgroundColor: THEME.bgLight, 
    minHeight: '100vh', 
    color: THEME.text,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    transition: 'all 0.5s ease'
  },
  header: { 
    textAlign: 'center' as const, 
    marginBottom: '60px', 
    width: '100%',
    maxWidth: '900px'
  },
  title: { 
    fontFamily: '"Playfair Display", serif',
    fontSize: '3.5rem', 
    color: THEME.primaryBlue, 
    marginBottom: '10px',
    fontWeight: 700,
    letterSpacing: '1px'
  },
  subtitle: { 
    color: THEME.accentGold, 
    fontSize: '1.2rem', 
    textTransform: 'uppercase' as const,
    letterSpacing: '3px',
    fontWeight: 400
  },
  card: { 
    background: 'rgba(255, 255, 255, 0.9)', 
    backdropFilter: 'blur(10px)',
    padding: '50px', 
    borderRadius: '24px', 
    boxShadow: '0 20px 40px rgba(0,0,0,0.05)', 
    marginBottom: '40px', 
    width: '100%',
    maxWidth: '800px',
    textAlign: 'center' as const,
    border: `1px solid rgba(255,255,255,0.3)`
  },
  sectionTitle: { 
    fontFamily: '"Playfair Display", serif',
    fontSize: '2rem', 
    color: THEME.primaryBlue, 
    marginBottom: '30px'
  },
  inputGroup: { 
    display: 'flex', 
    gap: '30px', 
    justifyContent: 'center' as const,
    marginBottom: '30px',
    width: '100%'
  },
  inputWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start' as const,
  },
  label: { 
    fontWeight: 600, 
    color: THEME.softBlue,
    fontSize: '0.85rem',
    marginBottom: '8px',
    textTransform: 'uppercase' as const
  },
  input: { 
    padding: '12px 20px', 
    borderRadius: '12px', 
    border: `1px solid #DCDDE1`, 
    fontSize: '1rem', 
    color: THEME.primaryBlue,
    backgroundColor: THEME.white,
    outline: 'none',
    transition: 'border 0.3s ease'
  },
  buttonPrimary: { 
    background: THEME.primaryBlue, 
    color: THEME.white, 
    padding: '15px 40px', 
    border: 'none', 
    borderRadius: '50px', 
    cursor: 'pointer', 
    fontSize: '1rem', 
    fontWeight: 600, 
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    transition: 'transform 0.3s, background 0.3s',
    boxShadow: '0 10px 20px rgba(44, 62, 80, 0.2)'
  },
  grid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
    gap: '35px',
    width: '100%',
    maxWidth: '1100px',
    justifyContent: 'center' as const
  },
  roomCard: { 
    background: THEME.white, 
    padding: '35px', 
    borderRadius: '24px', 
    boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
    textAlign: 'center' as const,
    transition: 'transform 0.4s ease, box-shadow 0.4s ease',
    border: '1px solid #F0F0F0',
    cursor: 'pointer'
  },
  price: { 
    fontSize: '2.2rem', 
    color: THEME.accentGold, 
    margin: '15px 0',
    fontFamily: '"Playfair Display", serif',
    fontWeight: 700
  },
  invoiceItem: { 
    padding: '18px 0', 
    borderBottom: `1px solid #F0F0F0`, 
    display: 'flex', 
    justifyContent: 'space-between',
    fontSize: '1.1rem'
  },
  totalBox: { 
    marginTop: '40px', 
    padding: '30px', 
    background: THEME.primaryBlue, 
    borderRadius: '16px', 
    color: THEME.white,
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  }
};

export default function App() {
  const [view, setView] = useState<'search' | 'manage' | 'invoice'>('search');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [dates, setDates] = useState({ start: '', end: '' });
  const [booking, setBooking] = useState<Reservation | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const minCheckOutDate = useMemo(() => {
    if (!dates.start) return today;
    const checkIn = new Date(dates.start);
    checkIn.setDate(checkIn.getDate() + 1);
    return checkIn.toISOString().split('T')[0];
  }, [dates.start, today]);

  const getPriceWithSeason = (base: number) => {
    if (!dates.start) return base;
    const month = new Date(dates.start).getMonth();
    return [5, 6, 11].includes(month) ? base * 1.5 : base;
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await hotelApi.getAvailableRooms(dates.start, dates.end);
      setRooms(data);
    } catch { alert("Error de conexión."); }
    finally { setLoading(false); }
  };

  const handleBooking = async (room: Room) => {
    const name = prompt(`Reserva: ${room.type.toUpperCase()}\nNombre del huésped:`);
    if (!name) return;
    const res = await hotelApi.createBooking({
      guestName: name, startDate: dates.start, endDate: dates.end, roomId: room.id
    });
    setBooking(res); setView('manage');
  };

  return (
    <div style={styles.main}>
      <style>{styles.fontImport}</style>
      
      <header style={styles.header}>
        <h1 style={styles.title}>Luxe & Comfort</h1>
        <p style={styles.subtitle}>Reserva de Experiencias Exclusivas</p>
      </header>

      {view === 'search' && (
        <>
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Encuentre su Estancia</h3>
            <div style={styles.inputGroup}>
              <div style={styles.inputWrapper}>
                <label style={styles.label}>Llegada</label>
                <input type="date" style={styles.input} min={today} value={dates.start}
                  onChange={e => setDates({ start: e.target.value, end: '' })} />
              </div>
              <div style={styles.inputWrapper}>
                <label style={styles.label}>Salida</label>
                <input type="date" style={styles.input} min={minCheckOutDate} disabled={!dates.start} value={dates.end}
                  onChange={e => setDates({...dates, end: e.target.value})} />
              </div>
            </div>
            <button onClick={handleSearch} style={styles.buttonPrimary} disabled={loading || !dates.end}>
              {loading ? 'Buscando...' : 'Ver Disponibilidad'}
            </button>
          </div>

          <div style={styles.grid}>
            {rooms.map(room => (
              <div key={room.id} style={styles.roomCard} 
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <h4 style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.6rem', color: THEME.primaryBlue }}>{room.type.toUpperCase()}</h4>
                <p style={styles.price}>${getPriceWithSeason(room.basePrice).toLocaleString()}</p>
                <p style={{color: THEME.softBlue, fontSize: '0.9rem', marginBottom: '25px'}}>Tarifa por noche seleccionada</p>
                <button onClick={() => handleBooking(room)} style={{...styles.buttonPrimary, padding: '12px 30px', fontSize: '0.8rem', background: THEME.accentGold}}>
                  Reservar Ahora
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {view === 'manage' && booking && (
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Panel de Invitado</h2>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <p style={{ fontSize: '1.4rem', color: THEME.primaryBlue }}>Bienvenido, <strong>{booking.guestName}</strong></p>
            <p style={{ color: THEME.accentGold }}>Ref: {booking.id}</p>
          </div>
          
          <button onClick={() => { hotelApi.confirmCheckIn(booking.id); alert("Check-In Exitoso."); }} 
            style={{...styles.buttonPrimary, marginBottom: '30px'}}>Confirmar Check-In</button>
          
          <div style={{ padding: '25px', background: '#F9F9F9', borderRadius: '20px', marginBottom: '40px' }}>
            <p style={styles.label}>Mejore su estancia con servicios extra</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
              <button onClick={() => hotelApi.addExtraService(booking.id, 'SPA')} style={{...styles.buttonPrimary, padding: '10px 20px', fontSize: '0.7rem', background: THEME.softBlue}}>Spa Experience</button>
              <button onClick={() => hotelApi.addExtraService(booking.id, 'DESAYUNO')} style={{...styles.buttonPrimary, padding: '10px 20px', fontSize: '0.7rem', background: THEME.softBlue}}>Desayuno Gourmet</button>
              <button onClick={() => hotelApi.addExtraService(booking.id, 'TRASLADO')} style={{...styles.buttonPrimary, padding: '10px 20px', fontSize: '0.7rem', background: THEME.softBlue}}>Traslado VIP</button>
            </div>
          </div>
          
          <button onClick={async () => { const data = await hotelApi.confirmCheckOut(booking.id); setInvoice(data); setView('invoice'); }} 
            style={{...styles.buttonPrimary, background: THEME.error}}>Finalizar y Facturar</button>
        </div>
      )}

      {view === 'invoice' && invoice && (
        <div style={{...styles.card, borderTop: `6px solid ${THEME.accentGold}`}}>
          <h2 style={styles.sectionTitle}>Detalle de Estancia</h2>
          <ul style={{ listStyle: 'none', padding: 0, width: '100%' }}>
            {invoice.items.map((item, index) => (
              <li key={index} style={styles.invoiceItem}>
                <span>{item.split(':')[0]}</span>
                <span style={{fontWeight: 700}}>{item.split(':')[1] || ''}</span>
              </li>
            ))}
          </ul>
          
          <div style={styles.totalBox}>
            <span style={{fontSize: '1.2rem', fontWeight: 300, textTransform: 'uppercase'}}>Inversión Total</span>
            <span style={{fontSize: '2.5rem', fontWeight: 700, fontFamily: '"Playfair Display", serif'}}>${invoice.total.toLocaleString()}</span>
          </div>
          
          <button onClick={() => window.location.reload()} style={{...styles.buttonPrimary, marginTop: '40px', background: THEME.accentGold}}>Nueva Reserva</button>
        </div>
      )}
    </div>
  );
}