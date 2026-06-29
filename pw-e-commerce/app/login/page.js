// src/app/login/page.js
import FormularioLogin from '../components/FormularioLogin'; // Ajustá los '../' según tu estructura real

export default function LoginPage() {
    return (
        <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FormularioLogin />
        </main>
    );
}