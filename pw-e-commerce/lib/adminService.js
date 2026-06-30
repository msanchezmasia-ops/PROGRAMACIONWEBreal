import { supabase } from './supabase';

// 📦 PEDIDOS
export const obtenerTodosLosPedidos = async () => {
    const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('id', { ascending: false }); // Últimos pedidos primero
    if (error) throw error;
    return data || [];
};

// 🗓️ RESERVAS
export const obtenerTodasLasReservas = async () => {
    const { data, error } = await supabase
        .from('reservas')
        .select('*')
        .order('fecha', { ascending: true });
    if (error) throw error;
    return data || [];
};

// 🍕 PRODUCTOS (CRUD)
export const obtenerProductosAdmin = async () => {
    const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('categoria', { ascending: true });
    if (error) throw error;
    return data || [];
};

export const guardarProducto = async (producto) => {
    const { data, error } = await supabase
        .from('productos')
        .insert([producto]);
    if (error) throw error;
    return data;
};

export const modificarProducto = async (id, cambios) => {
    const { data, error } = await supabase
        .from('productos')
        .update(cambios)
        .eq('id', id);
    if (error) throw error;
    return data;
};

export const eliminarProducto = async (id) => {
    const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', id);
    if (error) throw error;
    return true;
};


export const eliminarPedidoAdmin = async (id) => {
    const { error } = await supabase
        .from('pedidos')
        .delete()
        .eq('id', id);
    if (error) throw error;
    return true;
};