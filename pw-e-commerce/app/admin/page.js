"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
    obtenerTodosLosPedidos, 
    obtenerTodasLasReservas, 
    obtenerProductosAdmin,
    guardarProducto,
    modificarProducto,
    eliminarProducto,
    eliminarPedidoAdmin
} from '../../lib/adminService';
import '../../app/globals.css';

export default function AdminPage() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [cargandoAuth, setCargandoAuth] = useState(true);
    const [tabActiva, setTabActiva] = useState('pedidos');

    // Estados de Datos
    const [pedidos, setPedidos] = useState([]);
    const [reservas, setReservas] = useState([]);
    const [productos, setProductos] = useState([]);
    const [loadingDatos, setLoadingDatos] = useState(false);

    // Estados del Formulario de Productos (CRUD)
    const [editandoId, setEditandoId] = useState(null);
    const [formNombre, setFormNombre] = useState('');
    const [formDescripcion, setFormDescripcion] = useState('');
    const [formPrecio, setFormPrecio] = useState('');
    const [formCategoria, setFormCategoria] = useState('pizzas');
    const [formImagen, setFormImagen] = useState('');

    // 🔒 1. Validar sesión de manera segura y sincronizada
    useEffect(() => {
        async function verificarAcceso() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                
                if (session?.user?.email && session.user.email.toLowerCase() === 'msanchezmasia@itba.edu.ar') {
                    setIsAdmin(true);
                    
                    // Ejecutamos la carga inicial de la primera pestaña inmediatamente
                    setLoadingDatos(true);
                    const resPedidos = await obtenerTodosLosPedidos();
                    setPedidos(resPedidos);
                    setLoadingDatos(false);
                }
            } catch (error) {
                console.error("Error en la autenticación del admin:", error);
            } finally {
                setCargandoAuth(false);
            }
        }
        verificarAcceso();
    }, []);

    // 🔄 2. Cargar datos al cambiar de pestañas manualmente
    const cargarDatos = async (tab) => {
        setLoadingDatos(true);
        try {
            if (tab === 'pedidos') {
                const res = await obtenerTodosLosPedidos();
                setPedidos(res);
            } else if (tab === 'reservas') {
                const res = await obtenerTodasLasReservas();
                setReservas(res);
            } else if (tab === 'productos') {
                const res = await obtenerProductosAdmin();
                setProductos(res);
            }
        } catch (error) {
            console.error("Error cargando datos de administración:", error.message);
        } finally {
            setLoadingDatos(false);
        }
    };

    const cambiarTab = (tab) => {
        setTabActiva(tab);
        cargarDatos(tab);
        limpiarFormulario();
    };

    // 🍕 3. Lógica CRUD Productos
    const handleSubmitProducto = async (e) => {
        e.preventDefault();
        if (!formNombre || !formPrecio) {
            alert("Nombre y Precio son campos requeridos.");
            return;
        }

        const payload = {
            nombre: formNombre,
            descripcion: formDescripcion,
            precio: formPrecio.toString(), // El precio ingresado actúa como precio base (Grande)
            categoria: formCategoria,
            imagen: formImagen || null
        };

        try {
            if (editandoId) {
                await modificarProducto(editandoId, payload);
                alert("¡Producto modificado con éxito!");
            } else {
                await guardarProducto(payload);
                alert("¡Nuevo producto agregado a la carta!");
            }
            limpiarFormulario();
            cargarDatos('productos');
        } catch (error) {
            alert("Error al procesar el producto: " + error.message);
        }
    };

    const iniciarEdicion = (prod) => {
        setEditandoId(prod.id);
        setFormNombre(prod.nombre);
        setFormDescripcion(prod.descripcion || '');
        setFormPrecio(prod.precio);
        setFormCategoria(prod.categoria);
        setFormImagen(prod.imagen || '');
    };

    const handleEliminarProducto = async (id) => {
        if (!window.confirm("¿Seguro que querés eliminar este producto de la carta definitivamente?")) return;
        try {
            await eliminarProducto(id);
            cargarDatos('productos');
        } catch (error) {
            alert("No se pudo eliminar el producto: " + error.message);
        }
    };

    // 🗑️ 4. Lógica de eliminación para Pedidos y Reservas
    const handleEliminarPedido = async (id) => {
        if (!window.confirm(`¿Seguro que querés cancelar y eliminar el Pedido #${id} del sistema?`)) return;
        try {
            await eliminarPedidoAdmin(id);
            alert("Pedido eliminado correctamente.");
            cargarDatos('pedidos');
        } catch (error) {
            alert("No se pudo eliminar el pedido: " + error.message);
        }
    };

    const handleEliminarReserva = async (id, cliente) => {
        // Usamos la función eliminarProducto de adminService que apunta a borrar por ID genérico en su respectiva tabla si se adapta,
        // pero para evitar confusiones, lo hacemos directo acá o llamamos a la mesa
        if (!window.confirm(`¿Seguro que querés dar de baja la reserva de ${cliente}?`)) return;
        try {
            const { error } = await supabase.from('reservas').delete().eq('id', id);
            if (error) throw error;
            alert("Reserva cancelada y removida del libro.");
            cargarDatos('reservas');
        } catch (error) {
            alert("No se pudo eliminar la reserva: " + error.message);
        }
    };

    const limpiarFormulario = () => {
        setEditandoId(null);
        setFormNombre('');
        setFormDescripcion('');
        setFormPrecio('');
        setFormCategoria('pizzas');
        setFormImagen('');
    };

    // Vistas de Carga y Bloqueo de seguridad
    if (cargandoAuth) return <p className="estado-carga">Verificando credenciales de administrador...</p>;
    
    if (!isAdmin) {
        return (
            <div style={{ textAlign: 'center', padding: '6rem 2rem', color: '#ff4d4d' }}>
                <h2>🔒 Acceso Denegado</h2>
                <p style={{ color: 'var(--gris)', marginTop: '1rem' }}>No tenés permisos para visualizar este panel.</p>
            </div>
        );
    }

    return (
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', minHeight: '80vh' }}>
            <h1 style={{ color: 'var(--dorado)', borderBottom: '2px solid var(--dorado)', paddingBottom: '1rem', marginBottom: '2rem' }}>
                ⚙️ Panel de Control - La Piazza
            </h1>

            {/* Selector de Pestañas Semántico */}
            <nav style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                {['pedidos', 'reservas', 'productos'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => cambiarTab(tab)}
                        className="btn-carta"
                        style={{
                            background: tabActiva === tab ? 'var(--dorado)' : 'transparent',
                            color: tabActiva === tab ? 'var(--marron-oscuro)' : 'var(--crema)',
                            textTransform: 'capitalize'
                        }}
                        aria-label={`Ver sección de ${tab}`}
                    >
                        {tab}
                    </button>
                ))}
            </nav>

            {loadingDatos ? (
                <p style={{ color: 'var(--dorado)' }}>Actualizando base de datos...</p>
            ) : (
                <section aria-live="polite">
                    {/* VIEW: PEDIDOS */}
                    {tabActiva === 'pedidos' && (
                        <div>
                            <h2 style={{ color: 'var(--crema)', marginBottom: '1.5rem' }}>Pedidos Recibidos ({pedidos.length})</h2>
                            {pedidos.length === 0 ? <p>No hay pedidos registrados.</p> : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {pedidos.map(p => (
                                        <article key={p.id} style={{ background: 'var(--marron-oscuro)', border: '1px solid var(--dorado)', borderRadius: '8px', padding: '1.5rem', position: 'relative' }}>
                                            
                                            {/* Botón Eliminar Pedido */}
                                            <button 
                                                onClick={() => handleEliminarPedido(p.id)}
                                                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: '1px solid #ff4d4d', color: '#ff4d4d', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer' }}
                                                aria-label={`Eliminar pedido número ${p.id}`}
                                            >
                                                🗑️ Eliminar Pedido
                                            </button>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--dorado)', fontWeight: 'bold', marginBottom: '0.5rem', width: '80%' }}>
                                                <span>Pedido #{p.id}</span>
                                                <span>Total: ${Number(p.total).toLocaleString('es-AR')}</span>
                                            </div>
                                            <p style={{ margin: '0.2rem 0' }}><strong>Cliente Email:</strong> {p.email} | <strong>DNI:</strong> {p.dni}</p>
                                            <p style={{ margin: '0.2rem 0' }}><strong>Dirección de Entrega:</strong> {p.direccion}</p>
                                            
                                            <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px' }}>
                                                <strong>Items:</strong>
                                                <ul style={{ paddingLeft: '1.2rem', margin: '0.3rem 0 0 0' }}>
                                                    {p.items?.map((item, idx) => (
                                                        <li key={idx} style={{ color: 'var(--gris)' }}>
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
                    )}

                    {/* VIEW: RESERVAS */}
                    {tabActiva === 'reservas' && (
                        <div>
                            <h2 style={{ color: 'var(--crema)', marginBottom: '1.5rem' }}>Libro de Reservas ({reservas.length})</h2>
                            {reservas.length === 0 ? <p>No hay reservas en el sistema.</p> : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--marron-oscuro)' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid var(--dorado)', color: 'var(--dorado)', textAlign: 'left' }}>
                                            <th style={{ padding: '1rem' }}>Fecha</th>
                                            <th style={{ padding: '1rem' }}>Hora</th>
                                            <th style={{ padding: '1rem' }}>Cliente</th>
                                            <th style={{ padding: '1rem' }}>Email</th>
                                            <th style={{ padding: '1rem', textAlign: 'center' }}>Comensales</th>
                                            <th style={{ padding: '1rem', textAlign: 'center' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reservas.map(r => (
                                            <tr key={r.id} style={{ borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
                                                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{r.fecha}</td>
                                                <td style={{ padding: '1rem' }}>{r.hora} hs</td>
                                                <td style={{ padding: '1rem' }}>{r.nombre}</td>
                                                <td style={{ padding: '1rem', color: 'var(--gris)' }}>{r.email}</td>
                                                <td style={{ padding: '1rem', textAlign: 'center' }}>{r.personas}</td>
                                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                    <button 
                                                        onClick={() => handleEliminarReserva(r.id, r.nombre)}
                                                        style={{ background: 'transparent', border: '1px solid #ff4d4d', color: '#ff4d4d', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}
                                                    >
                                                        🗑️ Cancelar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* VIEW: PRODUCTOS (CRUD) */}
                    {tabActiva === 'productos' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                            {/* Formulario Izquierda */}
                            <form onSubmit={handleSubmitProducto} style={{ background: 'var(--marron-oscuro)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--dorado)', height: 'fit-content' }}>
                                <h3 style={{ color: 'var(--dorado)', marginBottom: '1rem' }}>
                                    {editandoId ? '✍️ Editar Producto' : '➕ Nuevo Producto'}
                                </h3>
                                
                                <div className="campo-grupo">
                                    <label className="campo-label">Categoría</label>
                                    <select className="campo-input" value={formCategoria} onChange={(e) => setFormCategoria(e.target.value)}>
                                        <option value="pizzas">Pizzas</option>
                                        <option value="aperitivos">Aperitivos</option>
                                        <option value="postres">Postres</option>
                                    </select>
                                </div>

                                <div className="campo-grupo">
                                    <label className="campo-label">Nombre</label>
                                    <input type="text" className="campo-input" value={formNombre} onChange={(e) => setFormNombre(e.target.value)} placeholder="Ej: Pizza Fugazzeta" />
                                </div>

                                <div className="campo-grupo">
                                    <label className="campo-label">Descripción</label>
                                    <textarea className="campo-input" rows="3" value={formDescripcion} onChange={(e) => setFormDescripcion(e.target.value)} placeholder="Ingredientes..." style={{ fontFamily: 'inherit', resize: 'none' }} />
                                </div>

                                {/* LÓGICA DE PRECIOS DINÁMICOS SEGÚN TAMAÑO */}
                                {formCategoria === 'pizzas' ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className="campo-grupo">
                                            <label className="campo-label">Precio Grande ($)</label>
                                            <input 
                                                type="number" 
                                                className="campo-input" 
                                                value={formPrecio} 
                                                onChange={(e) => setFormPrecio(e.target.value)} 
                                                placeholder="Ej: 9000" 
                                            />
                                        </div>
                                        <div className="campo-grupo">
                                            <label className="campo-label" style={{ color: 'var(--gris)' }}>Precio Chica (70% - Auto)</label>
                                            <input 
                                                type="text" 
                                                className="campo-input" 
                                                value={formPrecio ? `$${Math.round(Number(formPrecio) * 0.7).toLocaleString('es-AR')}` : '---'} 
                                                disabled 
                                                style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--gris)', cursor: 'not-allowed' }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="campo-grupo">
                                        <label className="campo-label">Precio Porción ($)</label>
                                        <input type="number" className="campo-input" value={formPrecio} onChange={(e) => setFormPrecio(e.target.value)} placeholder="Ej: 3500" />
                                    </div>
                                )}

                                <div className="campo-grupo">
                                    <label className="campo-label">URL de la Imagen (Opcional)</label>
                                    <input type="text" className="campo-input" value={formImagen} onChange={(e) => setFormImagen(e.target.value)} placeholder="/imagenes/pizza.jpg" />
                                </div>

                                <button type="submit" className="btn-carta" style={{ width: '100%', marginTop: '1rem' }}>
                                    {editandoId ? 'Guardar Cambios' : 'Insertar en Carta'}
                                </button>
                                {editandoId && (
                                    <button type="button" onClick={limpiarFormulario} className="btn-carta" style={{ width: '100%', marginTop: '0.5rem', background: 'transparent', border: '1px solid var(--gris)', color: 'var(--gris)' }}>
                                        Cancelar
                                    </button>
                                )}
                            </form>

                            {/* Lista Derecha */}
                            <div>
                                <h3 style={{ color: 'var(--crema)', marginBottom: '1rem' }}>Productos en la Carta ({productos.length})</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {productos.map(p => (
                                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.8rem 1rem', borderRadius: '6px', borderLeft: '3px solid var(--dorado)' }}>
                                            <div>
                                                <strong style={{ color: 'var(--crema)' }}>{p.nombre}</strong> 
                                                {p.categoria === 'pizzas' ? (
                                                    <span style={{ color: 'var(--dorado)', marginLeft: '1rem', fontSize: '0.9rem' }}>
                                                        G: ${Number(p.precio).toLocaleString('es-AR')} | Ch: ${Math.round(Number(p.precio) * 0.7).toLocaleString('es-AR')}
                                                    </span>
                                                ) : (
                                                    <span style={{ color: 'var(--dorado)', marginLeft: '1rem', fontSize: '0.9rem' }}>
                                                        ${Number(p.precio).toLocaleString('es-AR')}
                                                    </span>
                                                )}
                                                <div style={{ fontSize: '0.8rem', color: 'var(--gris)', textTransform: 'uppercase' }}>{p.categoria}</div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => iniciarEdicion(p)} style={{ background: 'transparent', border: '1px solid var(--dorado)', color: 'var(--dorado)', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer' }}>
                                                    Editar
                                                </button>
                                                <button onClick={() => handleEliminarProducto(p.id)} style={{ background: 'transparent', border: '1px solid #ff4d4d', color: '#ff4d4d', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer' }}>
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            )}
        </main>
    );
}