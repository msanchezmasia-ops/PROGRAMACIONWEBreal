"use client";
import { useState, useEffect } from 'react';
import { obtenerTodosLosPedidos, eliminarPedidoAdmin } from '../../lib/adminService';

export default function AdminPedidos() {
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);

    const cargarPedidos = async () => {
        setCargando(true);
        try {
            // Nota: Si en el futuro solo querés ver los pagados, deberías modificar 
            // 'obtenerTodosLosPedidos' en adminService para que filtre .eq('pagado', true)
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

    const handleEliminar = async (id) => {
        if (!window.confirm(`¿Seguro que querés eliminar el Pedido #${id}?`)) return;
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
                            <button onClick={() => handleEliminar(p.id)} className="btn-eliminar-peltro btn-eliminar-posicion">
                                🗑️ Eliminar
                            </button>
                            <div className="pedido-header">
                                <span>Pedido #{p.id}</span>
                                
                                {/* 👇 ACÁ AGREGAMOS EL INDICADOR VISUAL DE PAGO 👇 */}
                                <span style={{
                                    backgroundColor: p.pagado ? '#4caf50' : '#f44336',
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.85rem',
                                    fontWeight: 'bold',
                                    marginLeft: '10px'
                                }}>
                                    {p.pagado ? "✅ PAGADO" : "⏳ NO PAGADO"}
                                </span>

                                <span style={{ marginLeft: 'auto' }}>
                                    Total: ${Number(p.total).toLocaleString('es-AR')}
                                </span>
                            </div>
                            <p className="pedido-info-linea"><strong>Cliente:</strong> {p.email} | <strong>DNI:</strong> {p.dni || 'N/A'}</p>
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