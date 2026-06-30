"use client";
import { useState, useEffect } from 'react';
import Hero from './components/Hero';
import { supabase } from '../lib/supabase'; // Conexión oficial a tu base de datos

export default function HomePage() {
    const [pizzas, setPizzas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const cargarPizzasDesdeSupabase = async () => {
            try {
                // Hacemos la consulta a Supabase: seleccionamos todo (*) de la tabla 'productos'
                // pero filtramos para que traiga solo las que tengan 'destacada' igual a true
                const { data, error: supabaseError } = await supabase
                    .from('productos')
                    .select('*')
                    .eq('destacada', true);

                // Si Supabase nos devuelve un error, lo lanzamos para que lo maneje el catch
                if (supabaseError) throw supabaseError;
                
                // Si todo salió bien, guardamos las pizzas en el estado
                setPizzas(data || []);
            } catch (err) {
                console.error("Error cargando pizzas de Supabase:", err);
                setError(true); // Activamos la pantalla visual de error
            } finally {
                setCargando(false); // Apagamos el estado de carga
            }
        };

        cargarPizzasDesdeSupabase();
    }, []);

    // Si falló la conexión con la base de datos, mostramos este cartel
    if (error) {
        return (
        <div className="estado-error">
            <span aria-hidden="true">🍕</span>
            <h2>¡Uy! Ocurrió un problema</h2>
            <p>No pudimos cargar la información en este momento. Intentá nuevamente más tarde.</p>
        </div>
        );
    }

    // Mientras los datos están viajando desde la nube de Supabase
    if (cargando) {
        return <div style={{ textAlign: 'center', padding: '10rem', color: 'var(--dorado)' }}>Calentando el horno...</div>;
    }

    // Si todo salió bien, le mandamos las pizzas de Supabase al componente Hero
    return <Hero pizzasDestacadas={pizzas} />;
}