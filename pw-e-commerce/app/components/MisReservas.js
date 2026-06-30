"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { obtenerMisReservas, cancelarReserva } from '../../lib/reservasService';

export default function MisReservas() {
    const [usuario, setUsuario] = useState(null);
    const [misReservas, setMisReservas] = useState([]);
    const [mostrarReservas, setMostrarReservas] = useState(false);
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUsuario(session.user);
            }
        });
    }, []);

    const toggleReservas = async () => {
        if (!mostrarReservas) {
            setCargando(true);
            try {
                const data = await obtenerMisReservas();
                setMisReservas(data);
            } catch (error) {
                console.error("Error al cargar:", error);
            } finally {
                setCargando(false);
            }
        }
        setMostrarReservas(!mostrarReservas);
    };

    const handleCancelar = async (id) => {
        const confirmar = window.confirm("¿Estás seguro de que querés cancelar esta reserva?");
        if (!confirmar) return;

        try {
            await cancelarReserva(id);
            alert("Reserva cancelada con éxito.");
            // Refrescar la lista
            const data = await obtenerMisReservas();
            setMisReservas(data);
        } catch (error) {
            alert("Hubo un error al cancelar la reserva.");
        }
    };

    // Si no está logueado, no mostramos esta sección directamente
    if (!usuario) return null; 

    return (
        <div style={{ marginTop: '3rem', borderTop: '1px solid var(--dorado)', paddingTop: '2rem', gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ color: 'var(--crema)' }}>🗓️ Gestión de Mis Reservas</h3>
                <button onClick={toggleReservas} className="btn-carta">
                    {mostrarReservas ? 'Ocultar' : 'Ver mis reservas'}
                </button>
            </div>

            {mostrarReservas && (
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1.5rem', borderRadius: '8px' }}>
                    {cargando ? (
                        <p style={{ color: 'var(--dorado)' }}>Buscando reservas...</p>
                    ) : misReservas.length === 0 ? (
                        <p style={{ color: 'var(--gris)' }}>No tenés ninguna reserva activa en este momento.</p>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {misReservas.map(res => (
                                <li key={res.id} style={{ 
                                    background: 'var(--marron-oscuro)', 
                                    border: '1px solid var(--dorado)', 
                                    borderRadius: '6px', 
                                    padding: '1rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <strong style={{ color: 'var(--crema)', display: 'block', marginBottom: '0.3rem' }}>
                                            {res.fecha} a las {res.hora} hs.
                                        </strong>
                                        <span style={{ color: 'var(--gris)', fontSize: '0.9rem' }}>
                                            Mesa para {res.personas} personas a nombre de {res.nombre}.
                                        </span>
                                    </div>
                                    <button 
                                        onClick={() => handleCancelar(res.id)}
                                        style={{ background: 'transparent', border: '1px solid #ff4d4d', color: '#ff4d4d', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        Cancelar
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}