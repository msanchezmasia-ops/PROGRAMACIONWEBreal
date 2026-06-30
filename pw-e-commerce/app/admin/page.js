"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import '../../app/globals.css';

// Importamos los componentes modularizados
import AdminPedidos from '../components/AdminPedidos';
import AdminReservas from '../components/AdminReservas';
import AdminProductos from '../components/AdminProductos';

export default function AdminPage() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [cargandoAuth, setCargandoAuth] = useState(true);
    const [tabActiva, setTabActiva] = useState('pedidos');

    // 🔒 Control de accesos seguro
    useEffect(() => {
        async function verificarAcceso() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    const { data: esAdmin } = await supabase.rpc('soy_admin');
                    if (esAdmin) setIsAdmin(true);
                }

            } catch (error) {
                console.error("Error en la autenticación del admin:", error);
            } finally {
                setCargandoAuth(false);
            }
        }
        verificarAcceso();
    }, []);

    if (cargandoAuth) return <p className="estado-carga">Verificando credenciales...</p>;
    
    if (!isAdmin) {
        return (
            <div style={{ textAlign: 'center', padding: '6rem 2rem', color: '#ff4d4d' }}>
                <h2>🔒 Acceso Denegado</h2>
                <p style={{ color: 'var(--gris)', marginTop: '1rem' }}>No tenés permisos para visualizar este panel.</p>
            </div>
        );
    }

    return (
        <main className="admin-container">
            <h1 className="admin-titulo">⚙️ Panel de Control - La Piazza</h1>

            {/* Selector de Pestañas */}
            <nav className="admin-nav" aria-label="Menú de administración">
                {['pedidos', 'reservas', 'productos'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setTabActiva(tab)}
                        className={`admin-tab-btn ${tabActiva === tab ? 'admin-tab-btn--activa' : ''}`}
                    >
                        {tab}
                    </button>
                ))}
            </nav>

            <section aria-live="polite">
                {tabActiva === 'pedidos' && <AdminPedidos />}
                {tabActiva === 'reservas' && <AdminReservas />}
                {tabActiva === 'productos' && <AdminProductos />}
            </section>
        </main>
    );
}