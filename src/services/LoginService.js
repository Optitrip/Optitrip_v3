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

        const data = await response.json();

        if (response.ok) {
            return {
                data: data,
            };
        } else {
            throw new Error(data.message || 'Error desconocido');
        }

    } catch (error) {
        if (error instanceof TypeError || error.message.includes('JSON')) {
            throw new Error('Error de conexión. Por favor, verifica tu conexión a internet');
        }
        throw error;
    }
}

export { loginService };
