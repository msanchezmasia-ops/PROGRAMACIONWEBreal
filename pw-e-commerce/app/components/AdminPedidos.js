"use client";
import { useState, useEffect } from 'react';
import { obtenerTodosLosPedidos, eliminarPedidoAdmin } from '../../lib/adminService';

export default function AdminPedidos() {
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);

    const cargarPedidos = async () => {
        setCargando(true);
        try {
            setPedidos(await obtenerTodosLosPedidos());
        } catch (error) {
            console.error("Error al cargar pedidos:", error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarPedidos();
    }, []);

    const handleCompletar = async (id) => {
        if (!window.confirm(`¿Seguro que querés marcar el Pedido #${id} como ENTREGADO / COMPLETADO? (Esto lo borrará de la lista)`)) return;
        try {
            await eliminarPedidoAdmin(id);
            cargarPedidos();
        } catch (error) {
            alert(error.message);
        }
    };

    if (cargando) return <p className="admin-estado-texto">Buscando pedidos...</p>;

    return (
        <div>
            <h2 className="admin-subtitulo">Pedidos Recibidos ({pedidos.length})</h2>
            {pedidos.length === 0 ? <p className="admin-texto-vacio">No hay pedidos registrados.</p> : (
                <div>
                    {pedidos.map(p => (
                        <article key={p.id} className="pedido-card">
                            
                            {/* 👇 Botón cambiado a Completar y usando clases CSS puras 👇 */}
                            <button 
                                onClick={() => handleCompletar(p.id)} 
                                className="btn-completar-pedido btn-eliminar-posicion"
                            >
                                ✅ Completar
                            </button>

                            <div className="pedido-header">
                                <span>Pedido #{p.id}</span>
                                
                                {/* 👇 Etiquetas sin estilos en línea, usando clases CSS 👇 */}
                                <span className={`badge-estado ${p.pagado ? 'badge-pagado' : 'badge-no-pagado'}`}>
                                    {p.pagado ? "✅ PAGADO" : "⏳ NO PAGADO"}
                                </span>

                                <span className="total-pedido">
                                    Total: ${Number(p.total).toLocaleString('es-AR')}
                                </span>
                            </div>
                            
                            
                            <p className="pedido-info-linea">
                                <strong>Cliente:</strong> {p.email} | <strong>Teléfono:</strong> {p.telefono || 'No registrado'}
                            </p>
                            
                            <p className="pedido-info-linea"><strong>Destino:</strong> {p.direccion}</p>
                            
                            <div className="pedido-items-box">
                                <strong>Items comprados:</strong>
                                <ul className="pedido-lista-items">
                                    {p.items?.map((item, idx) => (
                                        <li key={idx} className="pedido-item-li">
                                            {item.cantidad}x {item.nombre} ({item.tamaño}) - ${Number(item.precio).toLocaleString('es-AR')} c/u
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}