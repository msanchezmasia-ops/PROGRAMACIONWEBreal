import { useState } from 'react';
import '../style.css';


export default function Carta({ carta }) {
    // tabActiva controla qué pestaña se muestra
    const [tabActiva, setTabActiva] = useState('pizzas');

    const tabs = [
        { key: 'pizzas', label: 'Pizzas' },
        { key: 'aperitivos', label: 'Aperitivos' },
        { key: 'postres', label: 'Postres' },
    ];

    return (
        <>
            <div className="divisor">
                <span></span><em>· Nuestra Carta ·</em><span></span>
            </div>

            <section id="carta">
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

                {/* Grilla de ítems de la tab activa */}
                <div className="menu-grid">
                    {carta[tabActiva].map(item => (
                        <MenuItem key={item.id} item={item} />
                    ))}
                </div>
            </section>
        </>
    );
}


function MenuItem({ item }) {
    return (
        <div className="menu-item">
            <div className="menu-item-info">
                <h4>{item.nombre}</h4>
                <p>{item.descripcion}</p>
            </div>
            <span className="menu-item-precio">{item.precio}</span>
        </div>
    );
}