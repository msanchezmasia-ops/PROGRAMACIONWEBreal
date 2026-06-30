import { supabase } from './supabase';

// Crear una reserva nueva
export const crearReserva = async (datosReserva) => {
    const { error } = await supabase
        .from('reservas')
        .insert([datosReserva]);
    
    if (error) throw error;
    return true;
};

// Obtener reservas del usuario logueado
export const obtenerMisReservas = async () => {
    // RLS se encarga automáticamente de filtrar por email
    const { data, error } = await supabase
        .from('reservas')
        .select('*')
        .order('fecha', { ascending: true });
        
    if (error) throw error;
    return data || [];
};

// Cancelar una reserva existente
export const cancelarReserva = async (id) => {
    const { error } = await supabase
        .from('reservas')
        .delete()
        .eq('id', id);
        
    if (error) throw error;
    return true;
};