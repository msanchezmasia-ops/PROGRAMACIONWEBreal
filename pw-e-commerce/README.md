# 🍕 La Piazza - Plataforma E-commerce Full-Stack para Pizzería

Este proyecto es una aplicación web full-stack desarrollada para la materia **PW 2026 Q1**. Se web para una pizzería ("La Piazza") que incluye un catálogo dinámico y accesible, sistema de autenticación de clientes, pasarela de pagos real integrada en entorno de pruebas, gestión de reservas y un panel de administración securizado para el control de pedidos en tiempo real.

---

### ⚡ Frontend & Framework principal
- **Next.js (v14+) / React (v18+):** Se utiliza el **App Router** para el manejo de rutas nativas del framework, optimización de componentes y serverless API routes internas.

### 🗄️ Backend, Base de Datos y Autenticación
- **Supabase (PostgreSQL):** Utilizado como Base de Datos Relacional para persistir productos, pedidos y reservas.
- **Supabase Auth:** Módulo nativo para el registro, inicio de sesión y gestión de sesiones de usuarios de manera segura (JWT).

### 📦 Dependencias y Librerías clave a Instalar
Para que el proyecto funcione correctamente, se deben inicializar y mantener instaladas las siguientes dependencias oficiales en el entorno de Node.js:

1. **`@supabase/supabase-js`** *Comando de instalación:* `npm install @supabase/supabase-js`  
   *Explicación:* Es el cliente oficial de Supabase. Permite realizar consultas CRUD desde el cliente, capturar la sesión activa del usuario y conectarse como administrador en las rutas del servidor para omitir el RLS cuando la lógica de negocio lo requiera (por ejemplo, en los webhooks).
   
2. **`mercadopago`** *Comando de instalación:* `npm install mercadopago`  
   *Explicación:* SDK oficial de Mercado Pago para Node.js. Se utiliza en el backend para instanciar las configuraciones de credenciales, crear las preferencias de pago que usa el carrito de compras y validar los tokens de transacciones entrantes dentro del webhook.

3. **`lucide-react`** (Opcional - si usás iconos vectoriales)  
   *Comando de instalación:* `npm install lucide-react`  
   *Explicación:* Pack de iconos limpios y optimizados para SVG, ideal para interfaces accesibles que necesitan mantener coherencia visual.

---

## 🏗️ Arquitectura y Estructura del Proyecto

El código sigue las buenas prácticas de modularidad de Next.js para separar la interfaz de usuario de las consultas y la lógica de negocio:

```text
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── webhook/
│   │   │   │   └── route.js       # Endpoint que recibe notificaciones de Mercado Pago
│   │   │   └── checkout/
│   │   │       └── route.js       # Endpoint que recibe y envía los id de pedidos a supabase
│   │   ├── admin/
│   │   │       └── page.js        # Panel del administrador para control de despachos
│   │   ├── login/                 
│   │   │       └── page.js        # Página para logueo y registro de usuarios
│   │   ├── contacto/              
│   │   │       └── page.js        # Página para realizar reservas con acceso restringido
│   │   ├── carta/                 
│   │   │       └── page.js        # Página para realizar pedidos con acceso restringido y con vista de pedidos en proceso
│   │   ├── components/            # Componentes reutilizables UI
│   │   │      ├── Nav.js                       # Barra de navegación superior accesible
│   │   │      ├── Hero.js                      # Sección destacada de la landing page
│   │   │      ├── FormularioLogin.js           # Formulario para logueo y registro
│   │   │      └── FormularioReserva.js         # Formulario para realizar reservas
│   │   │   layout.js              # Estructura semántica raíz (html lang="es", main, footer)
│   │   │   page.js                # Landing page
│   │   └── globals.css            # Estilos unificados 
│   └── lib/
│       ├── supabase.js            # Instancia anon del cliente Supabase para el cliente
│       ├── adminService.js        # Capa de abstracción para servicios de administrador
│       └── reservasService.js     # Funciones puras para el manejo de reservas


## 👥 Credenciales y Simulación de Pagos (Sandbox)

Para facilitar la evaluación y el recorrido por todas las funcionalidades del sistema (incluyendo el panel de administración y el flujo de compra), se proveen las siguientes credenciales.

### 🧑‍💻 Acceso al Panel de Administrador (`/admin`)
- **Email:** `msanchezmasia@itba.edu.ar`
- **Contraseña:** `Chester4556!`



### 💳 Simulación de Compras con Mercado Pago
El sistema de pagos está configurado en el entorno de pruebas (Sandbox). Para simular una transacción, **no utilice su cuenta personal**. Cuando el sistema lo redirija al checkout, ingrese con la siguiente cuenta de comprador de prueba:

- **Usuario:** `TESTUSER1277339947250989545`
- **Contraseña:** `TUZO5fdwEV`
- **Código de verificación (si lo solicita):** `380798`

#### Datos de la Tarjeta de Prueba
Una vez dentro del flujo de pago, seleccione "Nueva tarjeta de crédito" e ingrese los siguientes datos base:
- **Red:** Mastercard
- **Número de Tarjeta:** `5031 7557 3453 0604`
- **Vencimiento:** `11/30`
- **Código de Seguridad (CVV):** `123`
- **Documento (DNI):** `12345678`

