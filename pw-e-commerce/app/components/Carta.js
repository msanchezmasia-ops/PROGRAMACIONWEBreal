// src/components/Carta.js
import { useState } from 'react';
import '../globals.css';

export default function Carta({ carta }) {
    const [tabActiva, setTabActiva] = useState('pizzas');
    const [carrito, setCarrito] = useState([]);

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
                                // ACÁ LE AVISAMOS SI ES PIZZA O NO
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
                                            {/* Si no es pizza, dirá (Unidad) o (Porción) */}
                                            <span className="carrito-tamaño">({prod.tamaño})</span>
                                        </div>
                                        <div className="carrito-item-precio">
                                            ${prod.precio.toLocaleString('es-AR')}
                                            <button 
                                                className="btn-eliminar" 
                                                onClick={() => eliminarDelCarrito(i)}
                                                title="Eliminar"
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
                            
                            <button className="btn-carta w-full mt-4" style={{ width: '100%' }}>
                                Finalizar Pedido
                            </button>
                        </>
                    )}
                </div>
            </section>
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
            style={{ position: 'relative' }}
        >
            <div className="menu-item-info">
                <h4>{item.nombre}</h4>
                <p>{item.descripcion}</p>
                
                <div className="botones-agregar">
                    {/* CONDICIONAL: Si es pizza muestra 2 botones, si no, muestra 1 */}
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

            {hover && item.imagen && (
                <div className="imagen-flotante">
                    <img src={item.imagen} alt={item.nombre} />
                </div>
            )}
        </div>
    );
}