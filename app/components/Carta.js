"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import '../globals.css';
import { useRouter } from 'next/navigation';

export default function Carta({ carta }) {
    const router = useRouter();
    const [hover, setHover] = useState(false);
    const [tabActiva, setTabActiva] = useState('pizzas');
    const [carrito, setCarrito] = useState([]);
    
    // Bandera para saber si ya cargamos el carrito guardado
    const [carritoCargado, setCarritoCargado] = useState(false);

    // --- ESTADO DE AUTENTICACIÓN ---
    const [usuario, setUsuario] = useState(null);
    const [verificandoAuth, setVerificandoAuth] = useState(true);

    // --- ESTADOS PARA EL CHECKOUT Y DATOS ---
    const [modalPaso, setModalPaso] = useState(0); 
    const [telefono, setTelefono] = useState(''); 
    const [direccion, setDireccion] = useState('');
    const [email, setEmail] = useState('');
    const [procesando, setProcesando] = useState(false);

    // --- ESTADO PARA MENSAJES DE ERROR INTERNOS ---
    const [errorModal, setErrorModal] = useState(null);

    // --- ESTADOS PARA LOS PEDIDOS PENDIENTES ---
    const [historialPedidos, setHistorialPedidos] = useState([]);
    const [cargandoHistorial, setCargandoHistorial] = useState(false);

    const tabs = [
        { key: 'pizzas', label: 'Pizzas' },
        { key: 'aperitivos', label: 'Aperitivos' },
        { key: 'postres', label: 'Postres' },
    ];

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUsuario(session.user);
                setEmail(session.user.email);
            }
            setVerificandoAuth(false);
        });
    }, []);

    useEffect(() => {
        const carritoGuardado = sessionStorage.getItem('carritoLaPiazza');
        if (carritoGuardado) {
            setCarrito(JSON.parse(carritoGuardado));
        }
        setCarritoCargado(true);
    }, []);

    useEffect(() => {
        if (carritoCargado) {
            sessionStorage.setItem('carritoLaPiazza', JSON.stringify(carrito));
        }
    }, [carrito, carritoCargado]);

    
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            const estadoPago = url.searchParams.get('pago');

            if (estadoPago === 'exito') {
                setModalPaso(3); 
                setCarrito([]);
                sessionStorage.removeItem('carritoLaPiazza');
                url.searchParams.delete('pago');
                window.history.replaceState(null, '', url.toString());
            } else if (estadoPago === 'fallo') {
                setErrorModal("El pago fue rechazado o cancelado. Por favor, intentalo de nuevo.");
                setModalPaso(5);
                url.searchParams.delete('pago');
                window.history.replaceState(null, '', url.toString());
            }
        }
    }, []); 

    const agregarAlCarrito = (item, tamaño, precio) => {
        setCarrito(prev => {
            const index = prev.findIndex(p => p.id === item.id && p.tamaño === tamaño);
            if (index !== -1) {
                const nuevoCarrito = [...prev];
                nuevoCarrito[index] = { 
                    ...nuevoCarrito[index], 
                    cantidad: nuevoCarrito[index].cantidad + 1 
                };
                return nuevoCarrito;
            }
            return [...prev, { ...item, tamaño, precio, cantidad: 1 }];
        });
    };

    const eliminarDelCarrito = (id, tamaño) => {
        setCarrito(prev => {
            const index = prev.findIndex(p => p.id === id && p.tamaño === tamaño);
            if (index !== -1) {
                const nuevoCarrito = [...prev];
                if (nuevoCarrito[index].cantidad > 1) {
                    nuevoCarrito[index] = {
                        ...nuevoCarrito[index],
                        cantidad: nuevoCarrito[index].cantidad - 1
                    };
                    return nuevoCarrito;
                } else {
                    nuevoCarrito.splice(index, 1);
                    return nuevoCarrito;
                }
            }
            return prev;
        });
    };

    const vaciarCarrito = () => {
        setCarrito([]);
        sessionStorage.removeItem('carritoLaPiazza');
    };

    const totalCarrito = carrito.reduce((total, producto) => total + (producto.precio * producto.cantidad), 0);

    const iniciarCheckout = () => {
        if (carrito.length === 0) return;
        setErrorModal(null);
        setModalPaso(1);
    };

    const verificarDatos = async () => {
        setErrorModal(null);
        const telefonoRegex = /^[0-9]{8,15}$/;
        
        if (!telefono || !telefonoRegex.test(telefono)) {
            setErrorModal("Por favor, ingresá un número de teléfono válido (solo números, entre 8 y 15 dígitos).");
            return;
        }
        if (!direccion || direccion.trim().length < 4) {
            setErrorModal("Por favor, ingresá una dirección de envío válida.");
            return;
        }
        await guardarPedido();
    };

    const guardarPedido = async () => {
        setProcesando(true);
        try {
            const payloadItems = carrito.map(prod => ({
                id: prod.id,
                nombre: prod.nombre,
                tamaño: prod.tamaño,
                cantidad: prod.cantidad
            }));

            const { data: pedidoId, error } = await supabase.rpc('crear_pedido_seguro', {
                p_telefono: telefono, 
                p_direccion: direccion,
                p_email: email,
                p_items: payloadItems
            });

            if (error) throw new Error(error.message);

            const mpResponse = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: carrito, pedidoId }) 
            });

            const mpData = await mpResponse.json();

            if (mpData.init_point) {
                window.location.href = mpData.init_point;
            } else {
                throw new Error(mpData.error || "Error al procesar el pago con Mercado Pago.");
            }
        } catch (error) {
            console.error("Error al procesar el pedido:", error);
            setErrorModal("No se pudo procesar el pedido: " + error.message);
            setProcesando(false);
        }
    };

    const verHistorial = async () => {
        setErrorModal(null);
        setModalPaso(4);
        setCargandoHistorial(true);
        try {
            const { data, error } = await supabase
                .from('pedidos')
                .select('*')
                .eq('email', email)
                .eq('pagado', true)
                .eq('entregado', false)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setHistorialPedidos(data || []);
        } catch (err) {
            console.error("Error al obtener historial:", err);
            setErrorModal("Hubo un problema al cargar tus pedidos anteriores.");
        } finally {
            setCargandoHistorial(false);
        }
    };

    if (!carta) return null;

    return (
        <>
            <div className="divisor">
                <span></span><em>· Nuestra Carta ·</em><span></span>
            </div>

            <section id="carta" className="carta-con-carrito">
                <div className="carta-principal">
                    <h2 className="seccion-titulo">Lo que sale del horno</h2>
                    <p className="seccion-sub">Pizzas · Aperitivos · Postres</p>

                    <div className="tabs" role="tablist">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                role="tab"
                                aria-selected={tabActiva === tab.key}
                                className={`tab-btn${tabActiva === tab.key ? ' activo' : ''}`}
                                onClick={() => setTabActiva(tab.key)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="menu-grid">
                        {carta[tabActiva].map(item => (
                            <MenuItem
                                key={item.id}
                                item={item}
                                agregarAlCarrito={agregarAlCarrito}
                                esPizza={tabActiva === 'pizzas'}
                            />
                        ))}
                    </div>
                </div>

                <div className="carrito-sidebar">
                    <div className="carrito-header">
                        <h3>🛒 Tu Pedido</h3>
                        {carrito.length > 0 && (
                            <button onClick={vaciarCarrito} className="btn-texto btn-vaciar">
                                Vaciar todo
                            </button>
                        )}
                    </div>

                    {carrito.length === 0 ? (
                        <p className="carrito-vacio">Tu carrito está vacío.</p>
                    ) : (
                        <>
                            <ul className="carrito-lista">
                                {carrito.map((prod, i) => (
                                    <li key={i}>
                                        <div className="carrito-item-info">
                                            <strong>{prod.cantidad}x {prod.nombre}</strong>
                                            <span className="carrito-tamaño">({prod.tamaño})</span>
                                        </div>
                                        <div className="carrito-item-precio">
                                            ${(prod.precio * prod.cantidad).toLocaleString('es-AR')}
                                            <button 
                                                className="btn-eliminar" 
                                                onClick={() => eliminarDelCarrito(prod.id, prod.tamaño)}
                                                aria-label={`Eliminar un ${prod.nombre} del carrito`}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <div className="carrito-total">
                                <span>Total:</span>
                                <span>${totalCarrito.toLocaleString('es-AR')}</span>
                            </div>

                            {verificandoAuth ? (
                                <p className="carrito-estado-auth">Verificando cuenta...</p>
                            ) : usuario ? (
                                <button className="btn-carta w-full mt-4" onClick={iniciarCheckout}>
                                    Finalizar Pedido
                                </button>
                            ) : (
                                <div className="login-requerido-carrito">
                                    <p>🔒 Debés iniciar sesión para pedir</p>
                                    <Link href="/login" className="btn-carta">
                                        Iniciar Sesión
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                    
                    {usuario && !verificandoAuth && (
                        <button onClick={verHistorial} className="btn-historial-pedidos">
                            ⏳ MIS PEDIDOS PENDIENTES
                        </button>
                    )}
                </div>
            </section>

            {modalPaso > 0 && (
                <div className="modal-overlay">
                    <div className="modal-content fade-in">

                        {modalPaso === 1 && (
                            <>
                                <h3>Confirmá tu pedido</h3>
                                <p className="modal-subtitulo-texto">Ingresá tus datos para el envío a domicilio.</p>

                                {errorModal && <div className="modal-alerta-error fade-in">{errorModal}</div>}

                                <div className="modal-form-grupo">
                                    <input
                                        type="tel"
                                        placeholder="Teléfono (Ej: 1123456789)"
                                        value={telefono}
                                        onChange={(e) => setTelefono(e.target.value)}
                                        autoFocus
                                        className="campo-input-modal"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Dirección (Calle, Nº, Localidad)"
                                        value={direccion}
                                        onChange={(e) => setDireccion(e.target.value)}
                                        className="campo-input-modal"
                                    />
                                    <input
                                        type="email"
                                        disabled
                                        value={email}
                                        className="campo-input-modal campo-disabled"
                                    />
                                </div>

                                <div className="modal-botones">
                                    <button className="btn-cancelar" disabled={procesando} onClick={() => setModalPaso(0)}>Cancelar</button>
                                    <button className="btn-carta" disabled={procesando} onClick={verificarDatos}>
                                        {procesando ? 'Enviando...' : 'Confirmar Pedido'}
                                    </button>
                                </div>
                            </>
                        )}

                        {modalPaso === 3 && (
                            <>
                                <h3>🍕 ¡Pedido Confirmado y Pagado!</h3>
                                <p className="modal-exito-texto">
                                    Recibimos tu pago con éxito. Tu pedido ya se está preparando en la cocina de <strong>La Piazza</strong>.<br /><br />
                                    ¡Prepará la mesa que en un rato llega!
                                </p>
                                <div className="modal-botones text-center">
                                    <button className="btn-carta" onClick={() => setModalPaso(0)}>Entendido</button>
                                </div>
                            </>
                        )}

                        {modalPaso === 4 && (
                            <>
                                <h3>⏳ Tus Pedidos Pendientes</h3>
                                {errorModal && <div className="modal-alerta-error fade-in">{errorModal}</div>}
                                
                                <div className="historial-contenedor">
                                    {cargandoHistorial ? (
                                        <p className="texto-cargando">Buscando en el horno...</p>
                                    ) : historialPedidos.length === 0 ? (
                                        <p className="texto-vacio-historial">No tenés ningún pedido pendiente de entrega.</p>
                                    ) : (
                                        <ul className="historial-lista">
                                            {historialPedidos.map((ped) => (
                                                <li key={ped.id} className="historial-item">
                                                    <div className="historial-item-meta">
                                                        <strong>Fecha:</strong> {new Date(ped.created_at).toLocaleDateString('es-AR')}
                                                    </div>
                                                    <div><strong>Envío a:</strong> {ped.direccion}</div>
                                                    <span className="historial-detalle">
                                                        {Array.isArray(ped.items) ? ped.items.map(i => `${i.cantidad}x ${i.nombre}`).join(', ') : 'Detalle no disponible'}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div className="modal-botones">
                                    <button className="btn-carta w-full" onClick={() => setModalPaso(0)}>Cerrar Ventana</button>
                                </div>
                            </>
                        )}

                        {modalPaso === 5 && (
                            <>
                                <h3>⚠️ Algo no salió bien</h3>
                                <p className="modal-error-cuerpo">{errorModal}</p>
                                <div className="modal-botones">
                                    <button className="btn-carta w-full" onClick={() => setModalPaso(0)}>Volver a intentar</button>
                                </div>
                            </>
                        )}

                    </div>
                </div>
            )}
        </>
    );
}

function MenuItem({ item, agregarAlCarrito, esPizza }) {
    const [hover, setHover] = useState(false);
    const precioBase = typeof item.precio === 'number' ? item.precio : Number(item.precio.replace(/[^0-9]/g, ''));
    const precioGrande = precioBase;
    const precioChica = Math.round(precioBase * 0.7);
    const textoAlt = `${item.nombre}`;
    
    return (
        <div
            className="menu-item"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <div className="menu-item-info">
                <h4>{item.nombre}</h4>
                <p>{item.descripcion}</p>

                <div className="botones-agregar">
                    {esPizza ? (
                        <>
                            <button 
                                onClick={() => agregarAlCarrito(item, 'Chica', precioChica)}
                                aria-label={`Agregar ${item.nombre} tamaño Chica al carrito`}
                            >
                                + Chica (${precioChica.toLocaleString('es-AR')})
                            </button>
                            <button 
                                onClick={() => agregarAlCarrito(item, 'Grande', precioGrande)}
                                aria-label={`Agregar ${item.nombre} tamaño Grande al carrito`}
                            >
                                + Grande (${precioGrande.toLocaleString('es-AR')})
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={() => agregarAlCarrito(item, 'Porción', precioBase)}
                            aria-label={`Agregar ${item.nombre} al carrito`}
                        >
                            + Agregar al carrito (${precioBase.toLocaleString('es-AR')})
                        </button>
                    )}
                </div>
            </div>

            {item.imagen && (
                <div className="imagen-flotante">
                    <img src={item.imagen} alt={textoAlt} />
                </div>
            )}
        </div>
    );
}