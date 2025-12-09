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
        const response = await fetch(`${base_url}/users`, {
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

async function createUserService(user) {
    try {
        const response = await fetch(`${base_url}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
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
            return { success: true }; // Indicar éxito

        } else if (response.status === 400) {
            Swal.fire({
                title: '¡No se pudo crear la cuenta porque ya hay un registro con el correo ingresado!',
                confirmButtonColor: '#d33',
                confirmButtonText: 'Aceptar',
                width: '400px',
                padding: '2rem',
                customClass: {
                    title: 'title-handle',
                    popup: 'popup-handle'
                }
            });
            throw new Error('Email already exists'); // Lanzar error

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
            throw new Error('Unexpected server response'); // Lanzar error
        }
    } catch (error) {
        // Si es un error de red u otro error no manejado
        if (error.message !== 'Email already exists' && error.message !== 'Unexpected server response') {
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
        throw error; // Re-lanzar el error para que sea capturado en el componente
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
export { getUserByIdService, getUsersService, getUsersAdminService, getUsersDriverService, createUserService, updateUserService, deleteUserService, resetPasswordService, moveAccountService };
