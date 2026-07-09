"use client";
import { useState, useEffect } from 'react';
import { obtenerProductosAdmin, guardarProducto, modificarProducto, eliminarProducto } from '../../lib/adminService';

export default function AdminProductos() {
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);

    // Estados del formulario
    const [editandoId, setEditandoId] = useState(null);
    const [formNombre, setFormNombre] = useState('');
    const [formDescripcion, setFormDescripcion] = useState('');
    const [formPrecio, setFormPrecio] = useState('');
    const [formCategoria, setFormCategoria] = useState('pizzas');
    const [formImagen, setFormImagen] = useState('');
    const [formOrden, setFormOrden] = useState(''); // estado para el orden manual

    const cargarProductos = async () => {
        setCargando(true);
        try {
            setProductos(await obtenerProductosAdmin());
        } catch (error) {
            console.error("Error al cargar productos", error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarProductos();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formNombre || !formPrecio) {
            alert("Nombre y Precio son obligatorios.");
            return;
        }

        const payload = {
            nombre: formNombre,
            descripcion: formDescripcion,
            precio: formPrecio.toString(),
            categoria: formCategoria,
            imagen: formImagen || null,
            orden: formOrden !== '' ? parseInt(formOrden) : null // Si está vacío viaja null
        };

        try {
            if (editandoId) {
                await modificarProducto(editandoId, payload);
                alert("¡Producto modificado y posiciones reordenadas!");
            } else {
                await guardarProducto(payload);
                alert("¡Producto añadido a la carta!");
            }
            limpiarFormulario();
            cargarProductos();
        } catch (error) {
            alert("Error: " + error.message);
        }
    };

    const iniciarEdicion = (prod) => {
        setEditandoId(prod.id);
        setFormNombre(prod.nombre);
        setFormDescripcion(prod.descripcion || '');
        setFormPrecio(prod.precio);
        setFormCategoria(prod.categoria);
        setFormImagen(prod.imagen || '');
        setFormOrden(prod.orden !== null ? prod.orden.toString() : ''); // Carga el orden actual
    };

    const handleEliminar = async (id) => {
        if (!window.confirm("¿Eliminar este producto definitivamente?")) return;
        try {
            await eliminarProducto(id);
            cargarProductos();
        } catch (error) {
            alert(error.message);
        }
    };

    const limpiarFormulario = () => {
        setEditandoId(null);
        setFormNombre('');
        setFormDescripcion('');
        setFormPrecio('');
        setFormCategoria('pizzas');
        setFormImagen('');
        setFormOrden(''); // Limpia el input
    };

    if (cargando) return <p className="admin-estado-texto">Cargando catálogo...</p>;

    return (
        <div className="admin-grid-crud">
            <form onSubmit={handleSubmit} className="admin-formulario">
                <h3 className="admin-form-titulo">{editandoId ? '✍️ Editar Producto' : '➕ Nuevo Producto'}</h3>
                
                <div className="campo-grupo">
                    <label className="campo-label">Categoría</label>
                    <select className="campo-input" value={formCategoria} onChange={(e) => setFormCategoria(e.target.value)}>
                        <option value="pizzas">Pizzas</option>
                        <option value="aperitivos">Aperitivos</option>
                        <option value="postres">Postres</option>
                    </select>
                </div>

                <div className="campo-grupo">
                    <label className="campo-label">Nombre</label>
                    <input type="text" className="campo-input" value={formNombre} onChange={(e) => setFormNombre(e.target.value)} placeholder="Ej: Pizza Napolitana" />
                </div>

                <div className="campo-grupo">
                    <label className="campo-label">Descripción</label>
                    <textarea className="campo-input" rows="2" value={formDescripcion} onChange={(e) => setFormDescripcion(e.target.value)} placeholder="Ingredientes..." />
                </div>

                {formCategoria === 'pizzas' ? (
                    <div className="admin-input-grid">
                        <div className="campo-grupo">
                            <label className="campo-label">Precio Grande ($)</label>
                            <input type="number" className="campo-input" value={formPrecio} onChange={(e) => setFormPrecio(e.target.value)} placeholder="9500" />
                        </div>
                        <div className="campo-grupo">
                            <label className="campo-label col-gris">Chica (70% Auto)</label>
                            <input type="text" className="campo-input admin-input-disabled" value={formPrecio ? `$${Math.round(Number(formPrecio) * 0.7).toLocaleString('es-AR')}` : '---'} disabled />
                        </div>
                    </div>
                ) : (
                    <div className="campo-grupo">
                        <label className="campo-label">Precio Unidad ($)</label>
                        <input type="number" className="campo-input" value={formPrecio} onChange={(e) => setFormPrecio(e.target.value)} placeholder="3500" />
                    </div>
                )}

                
                <div className="campo-grupo">
                    <label className="campo-label">Posición en Menú <span className="col-gris">(Opcional / Vacío = Al final)</span></label>
                    <input type="number" min="1" className="campo-input" value={formOrden} onChange={(e) => setFormOrden(e.target.value)} placeholder="Ej: 3" />
                </div>

                <div className="campo-grupo">
                    <label className="campo-label">Ruta Imagen</label>
                    <input type="text" className="campo-input" value={formImagen} onChange={(e) => setFormImagen(e.target.value)} placeholder="/imagenes/pizza.jpg" />
                </div>

                <button type="submit" className="btn-carta admin-btn-full">
                    {editandoId ? 'Guardar Cambios' : 'Insertar'}
                </button>
                {editandoId && (
                    <button type="button" onClick={limpiarFormulario} className="btn-carta admin-btn-cancelar">
                        Cancelar
                    </button>
                )}
            </form>

            <div>
                <h3 className="admin-subtitulo">Productos en Carta ({productos.length})</h3>
                <div>
                    {productos.map(p => (
                        <div key={p.id} className="admin-crud-item">
                            <div>
                                
                                <strong className="producto-nombre">#{p.orden || '-'} {p.nombre}</strong> 
                                {p.categoria === 'pizzas' ? (
                                    <span className="producto-precio-info">
                                        G: ${Number(p.precio).toLocaleString('es-AR')} | Ch: ${Math.round(Number(p.precio) * 0.7).toLocaleString('es-AR')}
                                    </span>
                                ) : (
                                    <span className="producto-precio-info">
                                        ${Number(p.precio).toLocaleString('es-AR')}
                                    </span>
                                )}
                                <div className="producto-categoria-tag">{p.categoria}</div>
                            </div>
                            <div className="admin-flex-botones">
                                <button onClick={() => iniciarEdicion(p)} className="btn-editar-peltro">Editar</button>
                                <button onClick={() => handleEliminar(p.id)} className="btn-eliminar-peltro">Eliminar</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}