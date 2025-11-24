// Login.jsx
import React, { useState } from 'react';
import { loginService } from '../../services/LoginService';

function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    React.useEffect(() => {
        const savedEmail = localStorage.getItem('savedEmail');

        if (savedEmail) {
            setUsername(savedEmail);
            setRememberMe(true);
        }
    }, [])

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Validar campos vacíos en el frontend
        if (!username.trim() || !password.trim()) {
            alert('Campos incompletos. Por favor completa todos los campos');
            return;
        }

        try {
            const result = await loginService(username, password);

            // Guardar o eliminar el email según el checkbox (versión segura)
            if (rememberMe) {
                localStorage.setItem('savedEmail', username);
            } else {
                localStorage.removeItem('savedEmail');
            }

            onLogin(result.data);
        } catch (error) {
            alert(error.message);
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
                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        Recordar usuario
                    </label>
                </div>
                <button type="submit">Iniciar Sesión</button>
            </form>
        </div>
    );
}

export default Login;
