import { base_url } from "../config";

async function assignRouteService(route) {
    try {
        const response = await fetch(`${base_url}/routes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(route)
        });

        if (response.status === 201) {
            // Ruta aignada exitosamente
            const data = await response.json();

            Swal.fire({
                title: '¡La ruta ha sido asignada correctamente al conductor!',
                confirmButtonColor: '#d33',
                confirmButtonText: 'Aceptar',
                width: '400px',
                padding: '2rem',
                customClass: {
                    title: 'title-handle',
                    popup: 'popup-handle'
                }
            });

        } else if (response.status === 500) {
            // Error interno del servidor
            Swal.fire({
                title: '¡Error interno del servidor! Favor de contactar a soporte',
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
            // Respuesta inesperada del servidor
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
        // Error de red u otro error
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

export { assignRouteService };
