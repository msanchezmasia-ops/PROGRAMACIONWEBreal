"use client";
import { useState, useEffect } from 'react';
import Carta from '../components/Carta'; // Ajustá los ../ según tu estructura
import { supabase } from '../../lib/supabase'; // O '../../lib/supabase'

export default function CartaPage() {
    const [carta, setCarta] = useState(null);
    const [error, setError] = useState(false);
    
    // Truco anti-hidratación (igual que en el Inicio)
    const [montado, setMontado] = useState(false);

    useEffect(() => {
        setMontado(true);

        const cargarCartaDesdeSupabase = async () => {
            try {
                // Traemos TODOS los productos de la base de datos sin filtrar
                const { data, error: supabaseError } = await supabase
                    .from('productos')
                    .select('*')
                    .order('categoria', { ascending: true })
                    .order('orden', { ascending: true });

                if (supabaseError) throw supabaseError;

                // Reconstruimos el formato exacto que espera tu componente Carta
                const cartaAgrupada = {
                    pizzas: data.filter(item => item.categoria === 'pizzas'),
                    aperitivos: data.filter(item => item.categoria === 'aperitivos'),
                    postres: data.filter(item => item.categoria === 'postres')
                };

                setCarta(cartaAgrupada);
            } catch (err) {
                console.error("Error cargando la carta:", err);
                setError(true);
            }
        };

        cargarCartaDesdeSupabase();
    }, []);

    if (!montado) return null;

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '10rem 1rem', color: 'var(--crema)' }}>
                <h2>¡Uy! No pudimos cargar el menú 🍕</h2>
                <p style={{ marginTop: '1rem', color: 'var(--gris)' }}>Hubo un problema de conexión con la base de datos.</p>
            </div>
        );
    }

    if (!carta) {
        return <p className="estado-carga" style={{ textAlign: 'center', padding: '10rem' }}>Cargando menú...</p>;
    }

    return <Carta carta={carta} />;
}