// userService.js
import { base_url } from "../config";

async function getUserByIdService(userId) {
    try {
        const response = await fetch(`${base_url}/user/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            return {
                data: data,
            };

        } else if (response.status === 404) {
            throw new Error('User not found');
        } else {
            throw new Error('An error occurred while fetching the user');
        }
    } catch (error) {
        console.error('Error fetching user:', error.message);
        throw error; // Propaga el error para que sea manejado por el código que llame a esta función
    }
}

async function getUsersService() {
    try {
        const sessionUser = JSON.parse(sessionStorage.getItem('data_user'));
        if (!sessionUser || !sessionUser._id) {
            throw new Error('Sesión no válida');
        }

        const response = await fetch(`${base_url}/users?requestingUserId=${sessionUser._id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            return { users: data };
        } else {
            throw new Error('An error occurred while fetching users');
        }
    } catch (error) {
        console.error('Error fetching users:', error.message);
        throw error;
    }
}

async function getUsersAdminService() {
    try {
        const response = await fetch(`${base_url}/users/admin`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            return {
                users: data,
            };

        } else {
            throw new Error('An error occurred while fetching the user');
        }
    } catch (error) {
        console.error('Error fetching user:', error.message);
        throw error; // Propaga el error para que sea manejado por el código que llame a esta función
    }
}

async function getUsersDriverService(email) {
    try {
        const url = new URL(`${base_url}/users/driver`);
        url.searchParams.append('email', email);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            return {
                users: data,
            };

        } else {
            throw new Error('An error occurred while fetching the user');
        }
    } catch (error) {
        console.error('Error fetching user:', error.message);
        throw error; // Propaga el error para que sea manejado por el código que llame a esta función
    }
}

async function getVisibleDriversService() {
    try {
        const sessionUser = JSON.parse(sessionStorage.getItem('data_user'));
        if (!sessionUser || !sessionUser._id) {
            throw new Error('Sesión no válida');
        }

        const response = await fetch(`${base_url}/users/visible-drivers?requestingUserId=${sessionUser._id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            return { users: data };
        } else {
            throw new Error('Error al obtener conductores visibles');
        }
    } catch (error) {
        console.error('Error fetching visible drivers:', error.message);
        throw error;
    }
}

async function createUserService(user) {
    try {
        const sessionUser = JSON.parse(sessionStorage.getItem('data_user'));
        if (!sessionUser || !sessionUser._id) {
            throw new Error('Sesión no válida');
        }

        const payload = {
            ...user,
            created_by_id: sessionUser._id
        };

        const response = await fetch(`${base_url}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.status === 201) {
            Swal.fire({
                title: '¡Cuenta creada con éxito!',
                confirmButtonColor: '#d33',
                confirmButtonText: 'Aceptar',
                width: '400px',
                padding: '2rem',
                customClass: {
                    title: 'title-handle',
                    popup: 'popup-handle'
                }
            });
            window.dispatchEvent(new CustomEvent('userListUpdated'));
            return { success: true };

        } else if (response.status === 403) {
            const errorData = await response.json();
            Swal.fire({
                title: 'Permiso denegado',
                html: `<p>${errorData.message}</p>
                       <p><strong>Roles permitidos:</strong> ${errorData.allowed?.join(', ') || 'Ninguno'}</p>`,
                confirmButtonColor: '#d33',
                confirmButtonText: 'Aceptar',
                width: '400px',
                padding: '2rem',
                customClass: {
                    title: 'title-handle',
                    popup: 'popup-handle'
                }
            });
            throw new Error(errorData.message);

        } else if (response.status === 400) {
            const errorData = await response.json();

            let titleMessage = errorData.message;
            if (titleMessage === "Email already exists") {
                titleMessage = "¡El correo electrónico ya está registrado!";
            }
            Swal.fire({
                title: titleMessage || 'Error en la solicitud',
                confirmButtonColor: '#d33',
                confirmButtonText: 'Aceptar',
                width: '400px',
                padding: '2rem',
                customClass: {
                    title: 'title-handle',
                    popup: 'popup-handle'
                }
            });
            throw new Error(errorData.message);
        } else {
            Swal.fire({
                title: '¡Respuesta inesperada del servidor!',
                confirmButtonColor: '#d33',
                confirmButtonText: 'Aceptar',
                width: '400px',
                padding: '2rem',
                customClass: {
                    title: 'title-handle',
                    popup: 'popup-handle'
                }
            });
            throw new Error('Unexpected server response');
        }
    } catch (error) {
        if (error.message !== 'Email already exists' &&
            error.message !== 'Unexpected server response' &&
            !error.message.includes('no puede crear')) {
            Swal.fire({
                title: '¡Error inesperado! Por favor, inténtelo de nuevo',
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
        throw error;
    }
}

async function updateUserService(userId, user) {
    try {
        const response = await fetch(`${base_url}/user/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        });

        if (response.ok) {
            Swal.fire({
                title: '¡El usuario se ha actualizado correctamente!',
                confirmButtonColor: '#d33',
                confirmButtonText: 'Aceptar',
                width: '400px',
                padding: '2rem',
                customClass: {
                    title: 'title-handle',
                    popup: 'popup-handle'
                }
            });
            window.dispatchEvent(new CustomEvent('userListUpdated'));

        } else if (response.status === 404) {
            Swal.fire({
                title: '¡Usuario no encontrado!',
                confirmButtonColor: '#d33',
                confirmButtonText: 'Aceptar',
                width: '400px',
                padding: '2rem',
                customClass: {
                    title: 'title-handle',
                    popup: 'popup-handle'
                }
            });

        } else {
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
        Swal.fire({
            title: '¡Error inesperado! Por favor, inténtelo de nuevo',
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

async function deleteUserService(userId) {
    try {
        const response = await fetch(`${base_url}/user/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            Swal.fire({
                title: '¡El usuario se ha eliminado correctamente!',
                confirmButtonColor: '#d33',
                confirmButtonText: 'Aceptar',
                width: '400px',
                padding: '2rem',
                customClass: {
                    title: 'title-handle',
                    popup: 'popup-handle'
                }
            });
            window.dispatchEvent(new CustomEvent('userListUpdated'));
        } else if (response.status === 404) {
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

        } else {
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
        Swal.fire({
            title: '¡Error inesperado! Por favor, inténtelo de nuevo',
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

async function resetPasswordService(userId) {
    try {
        const response = await fetch(`${base_url}/reset-password/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            Swal.fire({
                title: '¡La contraseña se ha reestablecido correctamente!',
                confirmButtonColor: '#d33',
                confirmButtonText: 'Aceptar',
                width: '400px',
                padding: '2rem',
                customClass: {
                    title: 'title-handle',
                    popup: 'popup-handle'
                }
            });

        } else if (response.status === 404) {
            Swal.fire({
                title: '¡Usuario no encontrado!',
                confirmButtonColor: '#d33',
                confirmButtonText: 'Aceptar',
                width: '400px',
                padding: '2rem',
                customClass: {
                    title: 'title-handle',
                    popup: 'popup-handle'
                }
            });

        } else {
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
        Swal.fire({
            title: '¡Error inesperado! Por favor, inténtelo de nuevo',
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

async function moveAccountService(ids, superiorAccount) {
    try {
        const response = await fetch(`${base_url}/move-account`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ids, superiorAccount })
        });

        if (response.ok) {
            const title = ids.length === 1 ?
                '¡La cuenta se ha movido correctamente!' :
                '¡Las cuentas se movieron correctamente!';

            Swal.fire({
                title: title,
                confirmButtonColor: '#d33',
                confirmButtonText: 'Aceptar',
                width: '400px',
                padding: '2rem',
                customClass: {
                    title: 'title-handle',
                    popup: 'popup-handle'
                }
            });

        } else if (response.status === 404) {
            Swal.fire({
                title: '¡Usuario no encontrado!',
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
        Swal.fire({
            title: '¡Error inesperado! Por favor, inténtelo de nuevo',
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

// Exportar la función para que esté disponible fuera de este módulo
export { getUserByIdService, getUsersService, getUsersAdminService, getUsersDriverService, getVisibleDriversService, createUserService, updateUserService, deleteUserService, resetPasswordService, moveAccountService };
