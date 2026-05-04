// src/app/contacto/page.js

"use client";
import { useState, useEffect } from 'react';
import Contacto from '../components/Contacto';

export default function ContactoPage() {
    const [contacto, setContacto] = useState(null);

    useEffect(() => {
        fetch('/data.json')
            .then(res => res.json())
            .then(data => setContacto(data.contacto));
    }, []);

    if (!contacto) return <p className="estado-carga">Cargando datos de contacto...</p>;

    return <Contacto contacto={contacto} />;
}