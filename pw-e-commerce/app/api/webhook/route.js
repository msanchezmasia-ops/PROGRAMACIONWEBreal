import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js'; // <-- Faltaba esta importación

// 1. Inicializamos el cliente de Mercado Pago con tu Access Token de producción
const client = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN 
});

// 2. Inicializamos el cliente de Supabase como Administrador (Service Role).
// Esto nos permite actualizar la base de datos sin restricciones de RLS (Row Level Security).
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY 
);

export async function POST(request) {
    try {
        // Mercado Pago nos manda un JSON con la información del evento
        const body = await request.json();
        console.log("📩 Webhook recibido de Mercado Pago:", body);

        // Mercado Pago envía notificaciones de varios tipos; solo nos interesan los pagos reales.
        if (body.type === 'payment' && body.data && body.data.id) {
            const paymentId = body.data.id;

            // Por seguridad, consultamos el estado real directo a la API de Mercado Pago.
            // Nunca confíes ciegamente en lo que viene en el cuerpo (body) del webhook, podría ser falso.
            const payment = new Payment(client);
            const pagoInfo = await payment.get({ id: paymentId });

            console.log(`🔍 Estado del pago ${paymentId}: ${pagoInfo.status}`);

            // Si el pago fue aprobado, procedemos a impactar en la base de datos
            if (pagoInfo.status === 'approved') {
                // 'external_reference' es el ID de tu pedido. 
                // Debiste haberlo enviado desde tu frontend/backend al crear la preferencia de pago en MP.
                const pedidoId = pagoInfo.external_reference;

                if (!pedidoId) {
                    console.error("⚠️ El pago se aprobó, pero no incluye un 'external_reference' (ID de pedido).");
                } else {
                    // Actualizamos la tabla 'pedidos' marcando 'pagado' como true
                    const { error } = await supabaseAdmin
                        .from('pedidos')
                        .update({ pagado: true }) // Asegúrate de que la columna se llame exactamente 'pagado'
                        .eq('id', pedidoId);   // Asegúrate de que tu columna identificadora se llame 'id'

                    if (error) {
                        console.error(`❌ Error al actualizar el pedido ${pedidoId} en Supabase:`, error);
                    } else {
                        console.log(`✅ ¡Pedido ${pedidoId} marcado como PAGADO con éxito!`);
                    }
                }
            }
        }

        // SIEMPRE hay que devolver un estado 200 OK rápido a Mercado Pago.
        // Si tardás mucho o devolvés un error (4xx o 5xx), Mercado Pago asumirá que no lo recibiste
        // y te va a mandar el mismo webhook decenas de veces, saturando tu servidor.
        return NextResponse.json({ received: true }, { status: 200 });

    } catch (error) {
        console.error("❌ Error crítico procesando el webhook de Mercado Pago:", error);
        // Retornamos 500 únicamente si falló algo catastrófico en la lectura inicial del request
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}