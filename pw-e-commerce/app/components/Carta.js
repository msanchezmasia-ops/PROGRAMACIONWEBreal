import { useState } from 'react';

import '../globals.css';

export default function Carta({ carta }) {
    const [tabActiva, setTabActiva] = useState('pizzas');
    const [carrito, setCarrito] = useState([]);

    // --- ESTADOS PARA EL CHECKOUT ---
    const [modalPaso, setModalPaso] = useState(0);
    const [dni, setDni] = useState('');
    const [direccion, setDireccion] = useState('');
    const [email, setEmail] = useState('');
    const [pedidoAntiguo, setPedidoAntiguo] = useState(null);

    const tabs = [
        { key: 'pizzas', label: 'Pizzas' },
        { key: 'aperitivos', label: 'Aperitivos' },
        { key: 'postres', label: 'Postres' },
    ];

    const agregarAlCarrito = (item, tamaño, precio) => {
        setCarrito([...carrito, { ...item, tamaño, precio }]);
    };

    const eliminarDelCarrito = (index) => {
        const nuevoCarrito = [...carrito];
        nuevoCarrito.splice(index, 1);
        setCarrito(nuevoCarrito);
    };

    const totalCarrito = carrito.reduce((total, producto) => total + producto.precio, 0);

    // --- LÓGICA DE CHECKOUT ---
    const iniciarCheckout = () => {
        if (carrito.length === 0) return;
        setDni('');
        setDireccion(''); 
        setEmail(''); 
        setPedidoAntiguo(null);
        setModalPaso(1);
    };

    const verificarDatos = () => {
        // Validaciones estrictas
        if (!dni || dni.length < 6) {
            alert("Por favor, ingresá un DNI válido.");
            return;
        }
        if (!direccion || direccion.trim().length < 4) {
            alert("Por favor, ingresá una dirección de envío válida.");
            return;
        }
        // Validación de email integrada y a prueba de errores
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            alert("Por favor, ingresá un correo electrónico válido.");
            return;
        }

        try {
            // Lectura segura del localStorage
            let dbFalsa = localStorage.getItem('pedidos_lapiazza');
            let baseDeDatos = dbFalsa ? JSON.parse(dbFalsa) : {};

            // Evitamos que datos viejos corruptos rompan el sistema
            if (typeof baseDeDatos !== 'object' || Array.isArray(baseDeDatos)) {
                baseDeDatos = {};
            }

            if (baseDeDatos[dni]) {
                setPedidoAntiguo(baseDeDatos[dni]);
                setModalPaso(2); // Pasa a confirmación
            } else {
                guardarPedido(); // Cliente nuevo, guarda directo
            }
        } catch (error) {
            console.error("Error leyendo datos previos:", error);
            guardarPedido(); // Ante la duda, guarda el pedido igual
        }
    };

    const guardarPedido = () => {
        try {
            let dbFalsa = localStorage.getItem('pedidos_lapiazza');
            let baseDeDatos = dbFalsa ? JSON.parse(dbFalsa) : {};
            
            if (typeof baseDeDatos !== 'object' || Array.isArray(baseDeDatos)) {
                baseDeDatos = {};
            }

            // Guardamos el nuevo pedido
            baseDeDatos[dni] = {
                items: carrito,
                total: totalCarrito,
                direccion: direccion,
                email: email,
                fecha: new Date().toLocaleString()
            };

            localStorage.setItem('pedidos_lapiazza', JSON.stringify(baseDeDatos));

            setCarrito([]);
            setModalPaso(3); // ÉXITO

            setTimeout(() => {
                setModalPaso(0); // Cierra el modal a los 4 segs
            }, 4000);
        } catch (error) {
            console.error("Error al guardar:", error);
            alert("Hubo un error guardando el pedido.");
        }
    };

    if (!carta) return null;

    return (
        <>
            <div className="divisor">
                <span></span><em>· Nuestra Carta ·</em><span></span>
            </div>

            <section id="carta" className="carta-con-carrito">

                {/* --- COLUMNA IZQUIERDA: EL MENÚ --- */}
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

                {/* --- COLUMNA DERECHA: EL CARRITO --- */}
                <div className="carrito-sidebar">
                    <h3>🛒 Tu Pedido</h3>

                    {carrito.length === 0 ? (
                        <p style={{ color: 'var(--gris)' }}>Tu carrito está vacío.</p>
                    ) : (
                        <>
                            <ul className="carrito-lista">
                                {carrito.map((prod, i) => (
                                    <li key={i}>
                                        <div className="carrito-item-info">
                                            <strong>{prod.nombre}</strong>
                                            <span className="carrito-tamaño">({prod.tamaño})</span>
                                        </div>
                                        <div className="carrito-item-precio">
                                            ${prod.precio.toLocaleString('es-AR')}
                                            <button className="btn-eliminar" onClick={() => eliminarDelCarrito(i)}>✕</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <div className="carrito-total">
                                <span>Total:</span>
                                <span>${totalCarrito.toLocaleString('es-AR')}</span>
                            </div>

                            <button
                                className="btn-carta w-full mt-4"
                                style={{ width: '100%' }}
                                onClick={iniciarCheckout}
                            >
                                Finalizar Pedido
                            </button>
                        </>
                    )}
                </div>
            </section>

            {/* =========================================
                MODAL DE CHECKOUT
                ========================================= */}
            {modalPaso > 0 && (
                <div className="modal-overlay">
                    <div className="modal-content">

                        {/* PASO 1: PEDIR DATOS */}
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
                                        placeholder="Email (Ej: email@ejemplo.com)"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        style={{ margin: 0 }}
                                    />
                                </div>

                                <div className="modal-botones">
                                    <button className="btn-cancelar" onClick={() => setModalPaso(0)}>Cancelar</button>
                                    <button className="btn-carta" onClick={verificarDatos}>Siguiente</button>
                                </div>
                            </>
                        )}

                        {/* PASO 2: ADVERTENCIA DE PEDIDO EXISTENTE */}
                        {modalPaso === 2 && pedidoAntiguo && (
                            <>
                                <h3 style={{ color: 'var(--rojo)' }}>¡Ya tenés un pedido!</h3>
                                <p style={{ color: 'var(--crema)', marginBottom: '1rem' }}>
                                    Encontramos un pedido a nombre del DNI <strong>{dni}</strong>.
                                </p>
                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', textAlign: 'left', marginBottom: '1.5rem' }}>
                                    <span style={{ display: 'block', color: 'var(--dorado)', marginBottom: '0.5rem' }}>Pedido anterior:</span>
                                    {pedidoAntiguo.items.map((item, i) => (
                                        <div key={i} style={{ fontSize: '0.9rem', color: 'var(--gris)' }}>
                                            - {item.nombre} ({item.tamaño})
                                        </div>
                                    ))}
                                    <span style={{ display: 'block', color: 'var(--gris)', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                                        📍 Entrega: {pedidoAntiguo.direccion}
                                    </span>
                                    <strong style={{ display: 'block', marginTop: '0.5rem', color: 'white' }}>
                                        Total: ${pedidoAntiguo.total.toLocaleString('es-AR')}
                                    </strong>
                                </div>
                                <p style={{ color: 'var(--gris)', fontSize: '0.9rem' }}>¿Querés reemplazarlo por el pedido actual?</p>

                                <div className="modal-botones">
                                    <button className="btn-cancelar" onClick={() => setModalPaso(0)}>Mantener el viejo</button>
                                    <button className="btn-carta" onClick={guardarPedido}>Sí, reemplazar</button>
                                </div>
                            </>
                        )}

                        {/* PASO 3: ÉXITO */}
                        {modalPaso === 3 && (
                            <>
                                <h3>🍕 ¡Pedido Confirmado!</h3>
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

// ── COMPONENTE MENU ITEM ──
function MenuItem({ item, agregarAlCarrito, esPizza }) {
    const [hover, setHover] = useState(false);

    const precioBase = Number(item.precio.replace(/[^0-9]/g, ''));
    const precioGrande = precioBase;
    const precioChica = Math.round(precioBase * 0.7);

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
                    <img src={item.imagen} alt={item.nombre} />
                </div>
            )}
        </div>
    );
}