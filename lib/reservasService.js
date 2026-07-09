import { supabase } from './supabase';

export const crearReserva = async (datosReserva) => {
    const { data: reservasExistentes, error: errorBusqueda } = await supabase
        .from('reservas')
        .select('id')
        .eq('fecha', datosReserva.fecha)
        .eq('hora', datosReserva.hora);

    if (errorBusqueda) throw errorBusqueda;
    if (reservasExistentes && reservasExistentes.length > 0) {
        throw new Error("Ese horario ya se encuentra reservado. Por favor, elegí otra hora o día.");
    }

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