
"use client";
import { useState, useEffect } from 'react';
import Hero from './components/Hero';

export default function HomePage() {
    const [pizzas, setPizzas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const cargarPizzas = async () => {
            try {
                const res = await fetch('/data.json');
                if (!res.ok) throw new Error("No se pudo cargar el archivo json");
                
                const data = await res.json();
                setPizzas(data.pizzasDestacadas);
            } catch (err) {
                console.error("Error cargando pizzas:", err);
                setError(true); // Activamos la pantalla de error
            } finally {
                setCargando(false); // Apagamos el loading
            }
        };
        cargarPizzas();
    }, []);

    // Si falló el servidor, mostramos este cartel
    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '10rem 1rem', color: 'var(--crema)' }}>
                <h2>¡Uy! Ocurrió un problema 🍕</h2>
                <p style={{ marginTop: '1rem', color: 'var(--gris)' }}>
                    No pudimos cargar la información de la página en este momento.<br/>
                    Pedimos disculpas, por favor intentá de nuevo más tarde.
                </p>
            </div>
        );
    }

    // Mientras carga
    if (cargando) {
        return <div style={{ textAlign: 'center', padding: '10rem', color: 'var(--dorado)' }}>Calentando el horno...</div>;
    }

    // Si todo salió bien
    return <Hero pizzasDestacadas={pizzas} />;
}