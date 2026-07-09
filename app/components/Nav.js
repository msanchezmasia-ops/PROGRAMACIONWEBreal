"use client"; 
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function Nav() {
    const [usuario, setUsuario] = useState(null);
    const [esAdmin, setEsAdmin] = useState(false); // Estado para verificar si es administrador real

    useEffect(() => {
        // Función interna para comprobar el rol de admin de forma segura
        async function verificarRolAdmin(user) {
            if (!user) {
                setEsAdmin(false);
                return;
            }
            try {
                // Ejecutamos tu función RPC de Supabase que valida los permisos en el backend
                const { data: isAdmin, error } = await supabase.rpc('soy_admin');
                if (!error && isAdmin) {
                    setEsAdmin(true);
                } else {
                    setEsAdmin(false);
                }
            } catch (err) {
                console.error("Error al verificar rol de admin en Nav:", err);
                setEsAdmin(false);
            }
        }

        // 1. Verificación inicial de la sesión al montar el componente
        supabase.auth.getSession().then(({ data: { session } }) => {
            const user = session?.user ?? null;
            setUsuario(user);
            verificarRolAdmin(user);
        });

        // 2. Escucha activa de cambios de estado (Login, Logout, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const user = session?.user ?? null;
            setUsuario(user);
            verificarRolAdmin(user);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleCerrarSesion = async () => {
        await supabase.auth.signOut();
    };

    const nombreUsuario = usuario?.user_metadata?.full_name 
        || usuario?.email?.split('@')[0];

    return (
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
            
            <ul className="nav-lista">
                <li><Link href="/">Inicio</Link></li>
                <li><Link href="/carta">Carta</Link></li>
                <li><Link href="/contacto">Reserva</Link></li>
                
                
                {esAdmin && (
                    <li>
                        <Link href="/admin" className="btn-admin-nav" aria-label="Ir al Panel de Administración">
                            Panel Admin
                        </Link>
                    </li>
                )}
                
                {usuario ? (
                    <li className="nav-item-usuario">
                        <span className="nav-saludo">
                            Hola, <strong>{nombreUsuario}</strong>
                        </span>
                        
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