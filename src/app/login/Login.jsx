// Login.jsx
import React, { useState } from 'react';
import { loginService } from '../../services/LoginService'; 

function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (event) => {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
        alert('Campos incompletos. Por favor completa todos los campos');
        return;
    }

    try {
        const result = await loginService(username, password);
        onLogin(result.data);
    } catch (error) {
        console.log('Error capturado:', error);
        console.log('Mensaje del error:', error.message);
        alert(error.message || '¡Error inesperado! Por favor, inténtelo de nuevo');
    }
};

    return (
        <div>
            <h1>Iniciar Sesión</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username">Usuario:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Contraseña:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Iniciar Sesión</button>
            </form>
        </div>
    );
}

export default Login;
