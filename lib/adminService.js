import { supabase } from './supabase';

// PEDIDOS
export const obtenerTodosLosPedidos = async () => {
    const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('id', { ascending: false })
        
    if (error) throw error;
    return data || [];
};

export const actualizarEstadoPedido = async (id, nuevoEstado) => {
    const { error } = await supabase
        .from('pedidos')
        .update({ estado: nuevoEstado })
        .eq('id', id);
        
    if (error) throw error;
    return true;
};

// RESERVAS
export const obtenerTodasLasReservas = async () => {
    const { data, error } = await supabase
        .from('reservas')
        .select('*')
        .order('fecha', { ascending: true });
    if (error) throw error;
    return data || [];
};

export const eliminarReservaAdmin = async (id) => {
    const { error } = await supabase
        .from('reservas')
        .delete()
        .eq('id', id);
    if (error) throw error;
    return true;
};

// PRODUCTOS (CRUD)
export const obtenerProductosAdmin = async () => {
    const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('categoria', { ascending: true })
        .order('orden', { ascending: true }); // ✨ Cambiamos para que ordene según el campo numérico
        
    if (error) throw error;
    return data || [];
};

export const guardarProducto = async (producto) => {
    // 1. Insertamos el producto con los datos básicos (dejando 'orden' temporalmente en null)
    const { data, error } = await supabase
        .from('productos')
        .insert([producto])
        .select();
        
    if (error) throw error;
    
    // 2. Ejecutamos la función de cascada usando el ID que se acaba de generar
    if (data && data[0]) {
        const nuevoProd = data[0];
        const ordenParam = producto.orden ? parseInt(producto.orden) : null;
        
        const { error: rpcError } = await supabase.rpc('gestionar_orden_producto', {
            p_id: nuevoProd.id,
            p_categoria: nuevoProd.categoria,
            p_nuevo_orden: ordenParam
        });
        if (rpcError) throw rpcError;
    }
    return data;
};

export const modificarProducto = async (id, cambios) => {
    // 1. Actualizamos los datos del producto
    const { data, error } = await supabase
        .from('productos')
        .update({
            nombre: cambios.nombre,
            descripcion: cambios.descripcion,
            precio: cambios.precio,
            categoria: cambios.categoria,
            imagen: cambios.imagen
        })
        .eq('id', id);
        
    if (error) throw error;

    // 2. Ejecutamos la función de cascada para reacomodar las posiciones
    const ordenParam = cambios.orden ? parseInt(cambios.orden) : null;
    const { error: rpcError } = await supabase.rpc('gestionar_orden_producto', {
        p_id: id,
        p_categoria: cambios.categoria,
        p_nuevo_orden: ordenParam
    });
    
    if (rpcError) throw rpcError;
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