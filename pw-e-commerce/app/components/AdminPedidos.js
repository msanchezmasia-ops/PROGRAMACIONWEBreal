"use client";
import { useState, useEffect } from 'react';
import { obtenerTodosLosPedidos, actualizarEstadoPedido } from '../../lib/adminService';

export default function AdminPedidos() {
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);
    // Estado para controlar el filtro seleccionado: 'todos', 'pagados', 'no_pagados'
    const [filtroPago, setFiltroPago] = useState('pagados'); // Por defecto lo dejamos en 'pagados' como pediste

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

    const handleCambiarEstado = async (id, estadoActual) => {
        const nuevoEstado = estadoActual === 'pendiente' ? 'entregado' : 'pendiente';
        
        if (!window.confirm(`¿Seguro que querés marcar el Pedido #${id} como ${nuevoEstado.toUpperCase()}?`)) return;
    
        try {
            await actualizarEstadoPedido(id, nuevoEstado);
            cargarPedidos();
        } catch (error) {
            console.error("❌ Error al actualizar:", error);
            alert("Hubo un error al actualizar el pedido.");
        }
    };

    // Lógica de filtrado en el frontend basada en el estado 'filtroPago'
    const pedidosFiltrados = pedidos.filter(p => {
        if (filtroPago === 'pagados') return p.pagado === true;
        if (filtroPago === 'no_pagados') return p.pagado === false;
        return true; // 'todos'
    });

    if (cargando) return <p className="admin-estado-texto">Cargando la lista de pedidos...</p>;

    return (
        <div>
            <div className="admin-pedidos-header-flex">
                <h2 className="admin-subtitulo">Gestión de Pedidos ({pedidosFiltrados.length})</h2>
                
                {/* Contenedor del Filtro */}
                <div className="admin-filtro-container">
                    <label htmlFor="filtro-pago" className="admin-filtro-label">Filtrar por pago:</label>
                    <select 
                        id="filtro-pago"
                        className="admin-filtro-select"
                        value={filtroPago}
                        onChange={(e) => setFiltroPago(e.target.value)}
                    >
                        <option value="pagados">✅ Solo Pagados</option>
                        <option value="no_pagados">⏳ Solo No Pagados</option>
                        <option value="todos">📋 Mostrar Todos</option>
                    </select>
                </div>
            </div>
            
            {pedidosFiltrados.length === 0 ? (
                <p className="admin-texto-vacio">No hay pedidos que coincidan con el filtro seleccionado.</p>
            ) : (
                <div className="admin-grid-pedidos">
                    {pedidosFiltrados.map(p => (
                        <article key={p.id} className={`admin-tarjeta-pedido ${p.estado === 'entregado' ? 'pedido-completado' : ''}`}>
                            <div className="pedido-header">
                                <h3>Pedido #{p.id}</h3>
                                <span className={`pedido-badge ${p.pagado ? "badge-verde" : "badge-rojo"}`}>
                                    {p.pagado ? "✅ PAGADO" : "⏳ NO PAGADO"}
                                </span>
                                <span className={`pedido-badge ${p.estado === 'entregado' ? "badge-gris" : "badge-naranja"}`}>
                                    {p.estado === 'entregado' ? "📦 ENTREGADO" : "🕒 PENDIENTE"}
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

                            <button 
                                onClick={() => handleCambiarEstado(p.id, p.estado)} 
                                className="btn-completar-pedido"
                            >
                                {p.estado === 'pendiente' ? "✅ Marcar como Entregado" : "↩️ Deshacer (Volver a Pendiente)"}
                            </button>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}