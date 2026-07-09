"use client";
import { useState, useEffect } from 'react';
import { obtenerTodasLasReservas, eliminarReservaAdmin } from '../../lib/adminService';

export default function AdminReservas() {
    const [reservas, setReservas] = useState([]);
    const [cargando, setCargando] = useState(true);

    const cargarReservas = async () => {
        setCargando(true);
        try {
            setReservas(await obtenerTodasLasReservas());
        } catch (error) {
            console.error("Error al cargar reservas:", error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarReservas();
    }, []);

    const handleEliminar = async (id, cliente) => {
        if (!window.confirm(`¿Cancelar la reserva de ${cliente}?`)) return;
        try {
            await eliminarReservaAdmin(id);
            cargarReservas();
        } catch (error) {
            alert(error.message);
        }
    };

    if (cargando) return <p className="admin-estado-texto">Buscando reservas...</p>;

    return (
        <div>
            <h2 className="admin-subtitulo">Libro de Reservas ({reservas.length})</h2>
            {reservas.length === 0 ? <p className="admin-texto-vacio">No hay reservas en el sistema.</p> : (
                <table className="admin-tabla">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Hora</th>
                            <th>Cliente</th>
                            <th>Email</th>
                            <th className="col-centro">Comensales</th>
                            <th className="col-centro">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservas.map(r => (
                            <tr key={r.id}>
                                <td className="col-fuerte">{r.fecha}</td>
                                <td>{r.hora} hs</td>
                                <td>{r.nombre}</td>
                                <td className="col-gris">{r.email}</td>
                                <td className="col-centro">{r.personas}</td>
                                <td className="col-centro">
                                    <button onClick={() => handleEliminar(r.id, r.nombre)} className="btn-eliminar-peltro">
                                        🗑️ Cancelar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}