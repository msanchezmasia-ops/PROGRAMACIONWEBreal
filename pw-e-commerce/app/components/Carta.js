import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import '../globals.css';

export default function Carta({ carta }) {
    const [tabActiva, setTabActiva] = useState('pizzas');
    const [carrito, setCarrito] = useState([]);
    
    // Bandera para saber si ya cargamos el carrito guardado (evita que se borre al inicio)
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

    // 2. RECUPERAR EL CARRITO GUARDADO (Solo corre la primera vez que abre la página)
    useEffect(() => {
        const carritoGuardado = sessionStorage.getItem('carritoLaPiazza');
        if (carritoGuardado) {
            setCarrito(JSON.parse(carritoGuardado));
        }
        setCarritoCargado(true); // Le avisamos a React que ya leímos la memoria
    }, []);

    // 3. GUARDAR EL CARRITO (Corre cada vez que agregás o sacás algo del carrito)
    useEffect(() => {
        // Solo guardamos si ya terminamos de cargar el paso anterior
        if (carritoCargado) {
            sessionStorage.setItem('carritoLaPiazza', JSON.stringify(carrito));
        }
    }, [carrito, carritoCargado]);


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

    // Calculamos el total para MOSTRAR en pantalla, pero NO se lo mandamos a la base de datos
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

    // 🔒 FUNCIÓN ACTUALIZADA: ENVÍO SEGURO VÍA RPC (Base de datos)
    const guardarPedido = async () => {
        setProcesando(true);
        try {
            // 1. Armamos el paquete SOLO con los IDs, nombres, tamaños y cantidades.
            // Cero precios, tal como propusimos.
            const payloadItems = carrito.map(prod => ({
                id: prod.id,
                nombre: prod.nombre,
                tamaño: prod.tamaño,
                cantidad: prod.cantidad
            }));

            // 2. Llamamos a nuestra función de base de datos segura (crear_pedido_seguro)
            const { data, error } = await supabase.rpc('crear_pedido_seguro', {
                p_dni: dni,
                p_direccion: direccion,
                p_email: email,
                p_items: payloadItems
            });

            if (error) {
                throw new Error(error.message);
            }

            // 3. Si todo salió bien, vaciamos el carrito y borramos la memoria temporal
            setCarrito([]);
            sessionStorage.removeItem('carritoLaPiazza'); 
            
            setModalPaso(3); 

            setTimeout(() => {
                setModalPaso(0); 
                setDni('');
                setDireccion(''); 
            }, 4000);

        } catch (error) {
            console.error("Error al procesar el pedido:", error);
            alert("Hubo un error al enviar el pedido a la cocina: " + error.message);
        } finally {
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
                        <p>Tu carrito está vacío.</p>
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
                                            <button className="btn-eliminar" onClick={() => eliminarDelCarrito(prod.id, prod.tamaño)}>✕</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <div className="carrito-total">
                                <span>Total:</span>
                                <span>${totalCarrito.toLocaleString('es-AR')}</span>
                            </div>

                            {verificandoAuth ? (
                                <p>Verificando cuenta...</p>
                            ) : usuario ? (
                                <button
                                    className="btn-carta w-full mt-4"
                                    onClick={iniciarCheckout}
                                >
                                    Finalizar Pedido
                                </button>
                            ) : (
                                <div style={{ marginTop: '1.5rem', textAlign: 'center', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px dashed var(--dorado)' }}>
                                    <p style={{ color: 'var(--gris)', fontSize: '0.9rem', marginBottom: '0.8rem' }}>🔒 Debés iniciar sesión para pedir</p>
                                    <Link href="/login" className="btn-carta" style={{ display: 'block', fontSize: '0.9rem', padding: '0.5rem' }}>
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
                                <p style={{ color: 'var(--gris)', marginBottom: '1.5rem' }}>
                                    Ingresá tus datos para el envío.
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <input
                                        type="number"
                                        placeholder="DNI (Ej: 35123456)"
                                        value={dni}
                                        onChange={(e) => setDni(e.target.value)}
                                        style={{ margin: 0 }}
                                        autoFocus
                                    />
                                    <input
                                        type="text"
                                        placeholder="Dirección (Calle, Nº, Localidad)"
                                        value={direccion}
                                        onChange={(e) => setDireccion(e.target.value)}
                                        style={{ margin: 0 }}
                                    />
                                    <input
                                        type="email"
                                        disabled
                                        value={email}
                                        style={{ margin: 0, opacity: 0.7, cursor: 'not-allowed' }}
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
                                <h3 style={{ color: 'var(--dorado)' }}>🍕 ¡Pedido Confirmado!</h3>
                                <p style={{ color: 'var(--gris)', marginTop: '1rem' }}>
                                    Tu pedido está marchando hacia <strong>{direccion}</strong>.<br />
                                    ¡Prepará la mesa que en un rato llega!
                                </p>
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
                            <button onClick={() => agregarAlCarrito(item, 'Chica', precioChica)}>
                                + Chica (${precioChica.toLocaleString('es-AR')})
                            </button>
                            <button onClick={() => agregarAlCarrito(item, 'Grande', precioGrande)}>
                                + Grande (${precioGrande.toLocaleString('es-AR')})
                            </button>
                        </>
                    ) : (
                        <button onClick={() => agregarAlCarrito(item, 'Porción', precioBase)}>
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