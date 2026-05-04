
"use client";
import { useState, useEffect } from 'react';
import Carta from '../components/Carta';

export default function CartaPage() {
    const [carta, setCarta] = useState(null);

    useEffect(() => {
        fetch('/data.json')
            .then(res => res.json())
            .then(data => setCarta(data.carta));
    }, []);

    if (!carta) return <p className="estado-carga">Cargando menú...</p>;

    return <Carta carta={carta} />;
}
