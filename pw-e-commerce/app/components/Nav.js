"use client"; 
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function Nav() {
    const [usuario, setUsuario] = useState(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUsuario(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUsuario(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleCerrarSesion = async () => {
        await supabase.auth.signOut();
    };

    const nombreUsuario = usuario?.user_metadata?.full_name 
        || usuario?.email?.split('@')[0];

    return (
        /* SEMÁNTICA: aria-label le dice al lector de pantalla qué es este nav */
        <nav aria-label="Navegación principal">
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
            
            {/* Clases limpias sin style inline */}
            <ul className="nav-lista">
                <li><Link href="/">Inicio</Link></li>
                <li><Link href="/carta">Carta</Link></li>
                <li><Link href="/contacto">Reserva</Link></li>
                
                {usuario ? (
                    <li className="nav-item-usuario">
                        <span className="nav-saludo">
                            Hola, <strong>{nombreUsuario}</strong>
                        </span>
                        {/* SEMÁNTICA: aria-label en botones de acción */}
                        <button 
                            onClick={handleCerrarSesion}
                            className="btn-salir"
                            aria-label="Cerrar sesión"
                        >
                            Salir
                        </button>
                    </li>
                ) : (
                    <li>
                        <Link href="/login" className="btn-ingresar" aria-label="Ingresar a tu cuenta">
                            Ingresar
                        </Link>
                    </li>
                )}
            </ul>
        </nav>
    );
}