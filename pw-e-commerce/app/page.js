
// src/app/page.js
"use client";
import { useState, useEffect } from 'react';
import Hero from './components/Hero';

export default function HomePage() {
    const [pizzas, setPizzas] = useState([]);

    useEffect(() => {
        const cargarPizzas = async () => {
            try {
                const res = await fetch('/data.json');
                const data = await res.json();
                setPizzas(data.pizzasDestacadas);
            } catch (err) {
                console.error("Error cargando pizzas:", err);
            }
        };
        cargarPizzas();
    }, []);

    return <Hero pizzasDestacadas={pizzas} />;
}