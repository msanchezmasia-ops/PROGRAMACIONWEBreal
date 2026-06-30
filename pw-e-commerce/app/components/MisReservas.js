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
        <div className="mis-reservas-wrap">
            <div className="mis-reservas-header">
                <h3>🗓️ Gestión de Mis Reservas</h3>
                <button onClick={toggleReservas} className="btn-carta">
                    {mostrarReservas ? 'Ocultar' : 'Ver mis reservas'}
                </button>
            </div>

            {mostrarReservas && (
                <div className="mis-reservas-panel">
                    {cargando ? (
                        <p className="texto-cargando">Buscando reservas...</p>
                    ) : misReservas.length === 0 ? (
                        <p className="texto-vacio">No tenés ninguna reserva activa en este momento.</p>
                    ) : (
                        <ul className="mis-reservas-lista">
                            {misReservas.map(res => (
                                <li key={res.id} className="reserva-item">
                                    <div>
                                        <strong className="reserva-item-fecha">
                                            {res.fecha} a las {res.hora} hs.
                                        </strong>
                                        <span className="reserva-item-detalle">
                                            Mesa para {res.personas} personas a nombre de {res.nombre}.
                                        </span>
                                    </div>
                                    <button 
                                        onClick={() => handleCancelar(res.id)}
                                        className="btn-eliminar-peltro"
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