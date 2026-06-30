"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import '../globals.css';

export default function Carta({ carta }) {
    const [hover, setHover] = useState(false);
    const [tabActiva, setTabActiva] = useState('pizzas');
    const [carrito, setCarrito] = useState([]);
    
    // Bandera para saber si ya cargamos el carrito guardado
    const [carritoCargado, setCarritoCargado] = useState(false);

    // --- ESTADO DE AUTENTICACIÓN ---
    const [usuario, setUsuario] = useState(null);
    const [verificandoAuth, setVerificandoAuth] = useState(true);

    // --- ESTADOS PARA EL CHECKOUT ---
    const [modalPaso, setModalPaso] = useState(0);
    const [dni, setDni] = useState('');
    const [direccion, setDireccion] = useState('');
    const [email, setEmail] = useState('');
    const [procesando, setProcesando] = useState(false);

    const tabs = [
        { key: 'pizzas', label: 'Pizzas' },
        { key: 'aperitivos', label: 'Aperitivos' },
        { key: 'postres', label: 'Postres' },
    ];

    // 1. Chequear sesión del usuario
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUsuario(session.user);
                setEmail(session.user.email);
            }
            setVerificandoAuth(false);
        });
    }, []);

    // 2. RECUPERAR EL CARRITO GUARDADO
    useEffect(() => {
        const carritoGuardado = sessionStorage.getItem('carritoLaPiazza');
        if (carritoGuardado) {
            setCarrito(JSON.parse(carritoGuardado));
        }
        setCarritoCargado(true);
    }, []);

    // 3. GUARDAR EL CARRITO
    useEffect(() => {
        if (carritoCargado) {
            sessionStorage.setItem('carritoLaPiazza', JSON.stringify(carrito));
        }
    }, [carrito, carritoCargado]);

    // 🚀 4. ESCUCHAR RETORNO DE MERCADO PAGO
    useEffect(() => {
        // Buscamos si existen los parámetros ?pago=exito o ?pago=fallo en la URL
        const params = new URLSearchParams(window.location.search);
        const estadoPago = params.get('pago');

        if (estadoPago === 'exito') {
            setModalPaso(3); // Abrimos el modal de Pedido Confirmado
            
            // Limpiamos el carrito por las dudas si quedaba algo en sessionStorage
            setCarrito([]);
            sessionStorage.removeItem('carritoLaPiazza');

            // Limpiamos los parámetros de la URL para que si el usuario refresca la página no salte el modal de nuevo
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (estadoPago === 'fallo') {
            alert("❌ El pago fue rechazado o cancelado. Por favor, intentalo de nuevo.");
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);


    // --- LÓGICA DE CARRITO AGRUPADO ---
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

    const totalCarrito = carrito.reduce((total, producto) => total + (producto.precio * producto.cantidad), 0);

    // --- LÓGICA DE CHECKOUT ---
    const iniciarCheckout = () => {
        if (carrito.length === 0) return;
        setModalPaso(1);
    };

    const verificarDatos = async () => {
        if (!dni || dni.length < 6) {
            alert("Por favor, ingresá un DNI válido.");
            return;
        }
        if (!direccion || direccion.trim().length < 4) {
            alert("Por favor, ingresá una dirección de envío válida.");
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

            const { error } = await supabase.rpc('crear_pedido_seguro', {
                p_dni: dni,
                p_direccion: direccion,
                p_email: email,
                p_items: payloadItems
            });

            if (error) throw new Error(error.message);

            const mpResponse = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items: carrito })
            });

            const mpData = await mpResponse.json();

            if (mpData.init_point) {
                // Redirigimos a Mercado Pago
                window.location.href = mpData.init_point;
            } else {
                throw new Error(mpData.error || "Error al procesar el pago con Mercado Pago.");
            }

        } catch (error) {
            console.error("Error al procesar el pedido:", error);
            alert("Detalle del error: " + error.message);
            setProcesando(false);
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
                    <h3>🛒 Tu Pedido</h3>

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
                                <button
                                    className="btn-carta w-full mt-4"
                                    onClick={iniciarCheckout}
                                >
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
                </div>
            </section>

            {modalPaso > 0 && (
                <div className="modal-overlay">
                    <div className="modal-content">

                        {modalPaso === 1 && (
                            <>
                                <h3>Confirmá tu pedido</h3>
                                <p>Ingresá tus datos para el envío.</p>

                                <div className="modal-form-grupo">
                                    <input
                                        type="number"
                                        placeholder="DNI (Ej: 35123456)"
                                        value={dni}
                                        onChange={(e) => setDni(e.target.value)}
                                        autoFocus
                                    />
                                    <input
                                        type="text"
                                        placeholder="Dirección (Calle, Nº, Localidad)"
                                        value={direccion}
                                        onChange={(e) => setDireccion(e.target.value)}
                                    />
                                    <input
                                        type="email"
                                        disabled
                                        value={email}
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
                                <div className="modal-botones">
                                    <button className="btn-carta" onClick={() => setModalPaso(0)}>Entendido</button>
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