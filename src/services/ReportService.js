import { base_url } from "../config";

async function getReportDetailsByDriver(startDate, endDate, userId) {
    try {
        const response = await fetch(`${base_url}/report/details/driver`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ startDate, endDate, userId })
        });

        if (response.ok) {
            const data = await response.json();
            return { data };

        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al obtener los detalles del informe');
        }

    } catch (error) {
        throw error; // Propaga el error para que sea manejado por el código que llame a esta función
    }
};

async function getReportDetailsByStatus(startDate, endDate, userId, status) {
    try {
        const response = await fetch(`${base_url}/report/details/status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ startDate, endDate, userId, status })
        });

        if (response.ok) {
            const data = await response.json();
            return { data };

        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al obtener los detalles del informe');
        }

    } catch (error) {
        throw error; // Propaga el error para que sea manejado por el código que llame a esta función
    }
};

async function getReportDetailsByCustomer(startDate, endDate, userId) {
    try {
        const response = await fetch(`${base_url}/report/details/customer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ startDate, endDate, userId })
        });

        if (response.ok) {
            const data = await response.json();
            return { data };

        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al obtener los detalles del informe');
        }

    } catch (error) {
        throw error; // Propaga el error para que sea manejado por el código que llame a esta función
    }
};

async function getReportDetailsByCodeRoute(codeRoute) {
    try {
        const response = await fetch(`${base_url}/report/details/codeRoute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ codeRoute })
        });

        if (response.ok) {
            const data = await response.json();
            return { data };

        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al obtener los detalles del informe');
        }

    } catch (error) {
        throw error; // Propaga el error para que sea manejado por el código que llame a esta función
    }
};

export { getReportDetailsByDriver, getReportDetailsByStatus, getReportDetailsByCustomer, getReportDetailsByCodeRoute };