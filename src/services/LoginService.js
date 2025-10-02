import { base_url } from "../config";

async function loginService(email, password) {
    try {
        const response = await fetch(`${base_url}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            return {
                data: data,
            };

        } else {
            throw new Error('Credenciales incorrectas');
        }

    } catch (error) {
        throw error; // Propaga el error para que sea manejado por el código que llame a esta función
    }
}

// Exportar la función de login para que esté disponible fuera de este módulo
export { loginService };
