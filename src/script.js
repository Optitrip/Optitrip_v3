import { loginService } from '/src/services/LoginService.js';
import { jwtDecode } from 'jwt-decode';

// Verificar si el usuario está autenticado al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    const token = sessionStorage.getItem('token');
    const userData = sessionStorage.getItem('data_user');
    const user = userData ? JSON.parse(userData) : null;

    if (token && user) {
        // Decodificar el token para obtener la fecha de expiración
        const decodedToken = jwtDecode(token);
        const expirationDate = new Date(decodedToken.exp * 1000);
        const currentDate = new Date();

        if (expirationDate > currentDate) {
            document.getElementById('user-count').textContent = user.name;
            showAuthenticatedView();
        } else {
            // Limpiar sessionStorage si el token ha expirado
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('data_user');
            showLoginForm();
        }
    } else {
        showLoginForm();
    }

    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const navbarCollapse = document.querySelector('.navbar-collapse');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navbarCollapse.classList.contains('show')) {
                new bootstrap.Collapse(navbarCollapse).toggle();
            }
        });
    });
});

async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const { data } = await loginService(email, password); // Obtener data que contiene token y usuario
        if (data) {
            const user = data.user;

            // Check if the user role is either "Administrador", "Cliente" o "Disitribuidor"
            if (user.role === 'Super administrador' || user.role === 'Administrador' || user.role === 'Cliente' || user.role === 'Distribuidor') {
                sessionStorage.setItem('token', data.token); // Guardar token en sessionStorage
                sessionStorage.setItem('data_user', JSON.stringify(data.user)); // Guardar datos del usuario en sessionStorage
                showAuthenticatedView();
                window.location.reload();
            } else {
                showLoginForm();
                Swal.fire({
                    title: '¡Acceso denegado! Solo usuarios con roles de Super Administrador, Administrador, Cliente o Distribuidor pueden ingresar',
                    confirmButtonColor: '#d33',
                    confirmButtonText: 'Aceptar',
                    width: '400px',
                    padding: '2rem',
                    customClass: {
                        title: 'title-handle',
                        popup: 'popup-handle'
                    }
                });
            }
        } else {
            showLoginForm();
            Swal.fire({
                title: '¡Respuesta inesperada del servidor! Favor de contactar a soporte',
                confirmButtonColor: '#d33',
                confirmButtonText: 'Aceptar',
                width: '400px',
                padding: '2rem',
                customClass: {
                    title: 'title-handle',
                    popup: 'popup-handle'
                }
            });
        }
    } catch (error) {
        showLoginForm();
        // Determinar el mensaje según el error
        let errorTitle = '';
        if (error.message.includes('Campos incompletos')) {
            errorTitle = '¡Campos incompletos! Por favor completa todos los campos';
        } else if (error.message.includes('Credenciales inválidas') || error.message.includes('Invalid email or password')) {
            errorTitle = '¡Credenciales incorrectas! Por favor, inténtelo de nuevo';
        } else {
            errorTitle = '¡Error inesperado! Por favor, inténtelo de nuevo';
        }

        Swal.fire({
            title: errorTitle,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Aceptar',
            width: '400px',
            padding: '2rem',
            customClass: {
                title: 'title-handle',
                popup: 'popup-handle'
            }
        });
    }
}

function handleLogout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('data_user');
    window.location.reload();
}

function showAuthenticatedView() {
    document.getElementById('app-container').style.display = 'block';
    document.getElementById('login-form').style.display = 'none';

    // Mostrar información del usuario
    const user = JSON.parse(sessionStorage.getItem('data_user'));

    const menuMap = document.getElementById('menuMap');
    const menuRoutes = document.getElementById('menuRoutes');
    const menuReports = document.getElementById('menuReports');
    const menuUsers = document.getElementById('menuUsers');

    if (user) {
        document.getElementById('user-count').textContent = user.name;
    }

    if (user.role === 'Super administrador' || user.role === 'Administrador' || user.role === 'Cliente' || user.role === 'Distribuidor') {
        menuMap.style.display = 'block';
    }

    if (user.role === 'Super administrador') {
        menuUsers.style.display = 'block';
        menuReports.style.display = 'block';

    } else if (user.role === 'Administrador' || user.role === 'Distribuidor') {
        menuUsers.style.display = 'block';
        menuReports.style.display = 'block';

    } else {
        menuRoutes.style.display = 'none';
        menuUsers.style.display = 'none';
        menuReports.style.display = 'none';
    }
}

function showLoginForm() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('app-container').style.display = 'none';
}

// Agregar evento submit al formulario de inicio de sesión
const loginForm = document.querySelector('#login-form form');
loginForm.addEventListener('submit', handleLogin);

// Agregar evento al botón de cerrar sesión
const logoutBtn = document.querySelector('#logout');
logoutBtn.addEventListener('click', handleLogout);
