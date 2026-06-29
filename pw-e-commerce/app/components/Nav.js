"use client"; 
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase'; // Ajustá los ../ según tu carpeta

export default function Nav() {
    const [usuario, setUsuario] = useState(null);

    useEffect(() => {
        // 1. Preguntamos si ya había alguien logueado al refrescar la página
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUsuario(session?.user ?? null);
        });

        // 2. Encendemos el radar en tiempo real (Login / Logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUsuario(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleCerrarSesion = async () => {
        await supabase.auth.signOut();
    };

    // Lógica para obtener un nombre amigable
    const nombreUsuario = usuario?.user_metadata?.full_name 
        || usuario?.email?.split('@')[0];

    return (
        <nav>
            <div className="logo">
                <Image 
                    src="/img/logocompleto.png" 
                    alt="Logo La Piazza" 
                    width={45} 
                    height={45} 
                    className="nav-img" 
                />
                <span>La Piazza</span>
            </div>
            
            <ul style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <li><Link href="/">Inicio</Link></li>
                <li><Link href="/carta">Carta</Link></li>
                <li><Link href="/contacto">Reserva</Link></li>
                
                {/* BOTÓN DINÁMICO: Cambia según el estado del radar */}
                {usuario ? (
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginLeft: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--dorado)' }}>
                            Hola, <strong>{nombreUsuario}</strong>
                        </span>
                        <button 
                            onClick={handleCerrarSesion}
                            style={{ 
                                background: 'transparent', 
                                border: '1px solid #ff4d4d', 
                                color: '#ff4d4d', 
                                padding: '0.3rem 0.6rem', 
                                borderRadius: '6px', 
                                cursor: 'pointer', 
                                fontSize: '0.75rem',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.background = 'rgba(255, 77, 77, 0.1)'}
                            onMouseOut={(e) => e.target.style.background = 'transparent'}
                        >
                            Salir
                        </button>
                    </li>
                ) : (
                    <li>
                        <Link 
                            href="/login" 
                            style={{ 
                                background: 'var(--dorado)', 
                                color: '#000', 
                                padding: '0.45rem 0.9rem', 
                                borderRadius: '6px', 
                                fontWeight: 'bold',
                                fontSize: '0.85rem',
                                textDecoration: 'none'
                            }}
                        >
                            Ingresar
                        </Link>
                    </li>
                )}
            </ul>
        </nav>
    );
}