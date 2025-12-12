// ReportComponent.jsx
import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getUsersService } from '../../services/UserService';
import { getReportDetailsByDriver, getReportDetailsByStatus, getReportDetailsByCustomer, getReportDetailsByCodeRoute } from '../../services/ReportService';

export default function ReportComponent() {
    const [isCardBodyOpen, setIsCardBodyOpen] = useState(true);
    const [reportsDrivers, setReportsDriver] = useState(true);
    const [reportsRoutes, setReportsRoutes] = useState(false);
    const [reportsCustomers, setReportsCustomers] = useState(false);
    const [users, setUsers] = useState([]);
    const [filteredDrivers, setFilteredDrivers] = useState([]);
    const [selectedDriver, setSelectedDriver] = useState('');
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [status, setStatus] = useState('');
    const [reportByDriver, setReportByDriver] = useState(null);
    const [reportByStatus, setReportByStatus] = useState(null);
    const [reportByCustomer, setReportByCustomer] = useState(null);
    const [error, setError] = useState(null);
    const [dateError, setDateError] = useState('');

    const imagePath = '/logo_optitrip.png';

    // Función para validar el rango de fechas
    const validateDateRange = (start, end) => {
        if (!start || !end) return true;
        const startDateTime = new Date(start);
        const endDateTime = new Date(end);
        return startDateTime <= endDateTime;
    };

    useEffect(() => {
        fetchUsers(); 

        const handleUserUpdate = () => {
            fetchUsers();
        };

        window.addEventListener('userListUpdated', handleUserUpdate);

        return () => {
            window.removeEventListener('userListUpdated', handleUserUpdate);
        };
    }, []);

    useEffect(() => {
        fetchReportDetailsDriver();
    }, [startDate, endDate, selectedDriver]);

    useEffect(() => {
        fetchReportDetailsRoute();
    }, [startDate, endDate, selectedDriver, status]);

    useEffect(() => {
        fetchReportDetailsCustomer();
    }, [startDate, endDate, selectedCustomer]);

    const fetchUsers = async () => {
        try {
            const { users } = await getUsersService();
            setUsers(users);
        } catch (error) {
            setError(error.message);
        }
    };

    useEffect(() => {
        const drivers = users.filter(user => user.type_user === 'Conductor');
        const customers = users.filter(user => user.type_user === 'Cliente');
        setFilteredDrivers(drivers);
        setFilteredCustomers(customers);
    }, [users]);

    const fetchReportDetailsDriver = async () => {
        if (!validateDateRange(startDate, endDate)) {
            setDateError('La fecha de inicio no puede ser posterior a la fecha de fin');
            setReportByDriver(null);
            return;
        }
        try {
            const { data } = await getReportDetailsByDriver(startDate, endDate, selectedDriver);
            setReportByDriver(data);
            setError(null);
            setDateError('');
        } catch (error) {
            setError(error.message);
            setReportByDriver(null);
        }
    };

    const fetchReportDetailsRoute = async () => {
        if (!validateDateRange(startDate, endDate)) {
            setDateError('La fecha de inicio no puede ser posterior a la fecha de fin');
            setReportByStatus(null);
            return;
        }
        try {
            const { data } = await getReportDetailsByStatus(startDate, endDate, selectedDriver, status);
            setReportByStatus(data);
            setError(null);
            setDateError('');
        } catch (error) {
            setError(error.message);
            setReportByStatus(null);
        }
    };

    const fetchReportDetailsCustomer = async () => {
        if (!validateDateRange(startDate, endDate)) {
            setDateError('La fecha de inicio no puede ser posterior a la fecha de fin');
            setReportByCustomer(null);
            return;
        }
        try {
            const { data } = await getReportDetailsByCustomer(startDate, endDate, selectedCustomer);
            setReportByCustomer(data);
            setError(null);
            setDateError('');
        } catch (error) {
            setError(error.message);
            setReportByCustomer(null);
        }
    };

    const handleReportsByDriver = () => {
        setStartDate('');
        setEndDate('');
        setSelectedDriver('');
        setStatus('');
        setSelectedCustomer('');
        setDateError('');
        setReportsRoutes(false);
        setReportsCustomers(false);
        setReportsDriver(true);
    };

    const handleReportsByRoute = () => {
        setStartDate('');
        setEndDate('');
        setSelectedDriver('');
        setStatus('');
        setSelectedCustomer('');
        setDateError('');
        setReportsDriver(false);
        setReportsCustomers(false);
        setReportsRoutes(true);
    };

    const handleReportsByCustomer = () => {
        setStartDate('');
        setEndDate('');
        setSelectedDriver('');
        setStatus('');
        setSelectedCustomer('');
        setDateError('');
        setReportsDriver(false);
        setReportsRoutes(false);
        setReportsCustomers(true);
    };

    const convertUTCToLocal = (utcDateStr) => {
        // Convertir la fecha UTC a un objeto Date
        const date = new Date(utcDateStr);

        // Opciones de formato para la fecha y hora locales
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        };

        // Obtener la fecha y hora en la zona horaria local
        const localDateTime = date.toLocaleDateString(undefined, options);

        return localDateTime;
    }

    const generateDriverPDF = () => {
        const doc = new jsPDF();
        const currentDate = new Date();
        const formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()} ${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}`;
        const nameDocument = `${String(currentDate.getDate())}_${String(currentDate.getMonth() + 1)}_${currentDate.getFullYear()}_${String(currentDate.getHours())}_${String(currentDate.getMinutes())}`;

        // Imagen
        const img = new Image();
        img.src = imagePath;
        img.onload = function () {
            doc.addImage(img, 'PNG', 13, 13, 28, 18);

            // Fecha de generación del PDF
            doc.setFontSize(10);
            doc.text(`Generado el día: ${formattedDate} hrs`, 135, 15);

            // Título centrado
            doc.setFontSize(18);
            doc.text('Reporte por conductor', doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });

            // Subtítulo
            const formatDate = (dateStr) => {
                const date = new Date(dateStr);
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const year = date.getFullYear();
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                return `${day}/${month}/${year} ${hours}:${minutes}`;
            };

            // Convertir las fechas al formato deseado
            const formattedStartDate = formatDate(startDate);
            const formattedEndDate = formatDate(endDate);

            // Agregar el texto con las fechas
            doc.setFontSize(10);
            doc.text(`Desde: ${formattedStartDate} hrs`, 14, 42);
            doc.text(`Hasta: ${formattedEndDate} hrs`, 14, 48);
            doc.text(`Conductor: ${reportByDriver ? reportByDriver.driverName : 'N/A'}`, 14, 54);

            // Resumen
            doc.setFontSize(14);
            doc.text('Resumen', 14, 68);

            if (reportByDriver && !reportByDriver.error && reportByDriver.results.length > 0) {
                autoTable(doc, {
                    startY: 70,
                    head: [['Conductor', 'Duración', 'Kilometraje total (km)', 'Velocidad media (km/h)', 'Toneladas descargadas', 'Total de viajes']],
                    body: [
                        [
                            reportByDriver.driverName,
                            reportByDriver.totalDuration,
                            reportByDriver.totalDistance,
                            reportByDriver.averageSpeedOverall,
                            reportByDriver.totalDownloadedTonnes,
                            reportByDriver.totalTrips
                        ]
                    ],
                    theme: 'striped',
                    headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], halign: 'center', valign: 'middle' },
                    bodyStyles: { halign: 'center', valign: 'middle' }
                });

                // Detalles de los viajes
                doc.setFontSize(14);
                doc.text('Detalles de los viajes', 14, doc.lastAutoTable.finalY + 14);

                reportByDriver.results.forEach((trip, index) => {
                    const tripDetailsPart1 = [
                        [
                            index + 1,
                            convertUTCToLocal(trip.departureTime) + " hrs",
                            trip.originName,
                            convertUTCToLocal(trip.arrivalTime) + " hrs",
                            trip.destinationName
                        ]
                    ];

                    const tripDetailsPart2 = [
                        [
                            trip.waypoints,
                            trip.distance,
                            trip.tripDuration,
                            trip.averageSpeed,
                            trip.totalUnload
                        ]
                    ];

                    // Primera parte de la tabla
                    autoTable(doc, {
                        startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 16 : 70,
                        head: [['No.', 'Fecha de inicio', 'Origen', 'Fecha de finalización', 'Destino']],
                        body: tripDetailsPart1,
                        theme: 'striped',
                        headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], halign: 'center', valign: 'middle' },
                        bodyStyles: { halign: 'center', valign: 'middle' }
                    });

                    // Ajustar startY para la segunda parte
                    const startYPart2 = doc.lastAutoTable.finalY + 6;

                    // Segunda parte de la tabla
                    autoTable(doc, {
                        startY: startYPart2,
                        head: [['Total de paradas', 'Kilometraje total', 'Duración', 'Velocidad media', 'Toneladas']],
                        body: tripDetailsPart2,
                        theme: 'striped',
                        headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], halign: 'center', valign: 'middle' },
                        bodyStyles: { halign: 'center', valign: 'middle' }
                    });
                });

            } else {
                doc.setFontSize(10);
                doc.text('No se encontraron datos para la búsqueda establecida', 14, 74);
            }

            // Guardar el PDF
            doc.save(`reporte_conductores_${nameDocument}.pdf`);
        };
    };

    const generateRoutePDF = () => {
        const doc = new jsPDF();
        const currentDate = new Date();
        const formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()} ${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}`;
        const nameDocument = `${String(currentDate.getDate())}_${String(currentDate.getMonth() + 1)}_${currentDate.getFullYear()}_${String(currentDate.getHours())}_${String(currentDate.getMinutes())}`;

        // Imagen
        const img = new Image();
        img.src = imagePath;
        img.onload = function () {
            doc.addImage(img, 'PNG', 13, 13, 28, 18);

            // Fecha de generación del PDF
            doc.setFontSize(10);
            doc.text(`Generado el día: ${formattedDate} hrs`, 135, 15);

            // Título centrado
            doc.setFontSize(18);
            doc.text('Reporte por ruta', doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });

            // Subtítulo
            const formatDate = (dateStr) => {
                const date = new Date(dateStr);
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const year = date.getFullYear();
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                return `${day}/${month}/${year} ${hours}:${minutes}`;
            };

            // Convertir las fechas al formato deseado
            const formattedStartDate = formatDate(startDate);
            const formattedEndDate = formatDate(endDate);
            const currentStatus = status === "" ? "Todos" : status;

            // Agregar el texto con las fechas
            doc.setFontSize(10);
            doc.text(`Desde: ${formattedStartDate} hrs`, 14, 42);
            doc.text(`Hasta: ${formattedEndDate} hrs`, 14, 48);
            doc.text(`Estatus: ${currentStatus}`, 14, 54);

            // Resumen
            doc.setFontSize(14);
            doc.text('Resumen', 14, 68);

            if (reportByStatus && !reportByStatus.error && reportByStatus.results.length > 0) {
                // Inicializar la posición Y para la primera tabla
                let startY = 70;
                if (doc.lastAutoTable) {
                    startY = doc.lastAutoTable.finalY + 16;
                }

                // Recorrer cada resultado y crear las tablas para cada uno
                reportByStatus.results.forEach((trip, index) => {
                    const tripDetailsPart1 = [
                        [
                            index + 1,
                            trip.driverName,
                            convertUTCToLocal(trip.departureTime) + " hrs",
                            trip.originName,
                            convertUTCToLocal(trip.arrivalTime) + " hrs",
                            trip.destinationName
                        ]
                    ];

                    const tripDetailsPart2 = [
                        [
                            trip.waypoints,
                            trip.distance,
                            trip.tripDuration,
                            trip.status
                        ]
                    ];

                    // Primera parte de la tabla
                    autoTable(doc, {
                        startY: startY,
                        head: [['No.', 'Conductor', 'Fecha de inicio', 'Origen', 'Fecha de finalización', 'Destino']],
                        body: tripDetailsPart1,
                        theme: 'striped',
                        headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], halign: 'center', valign: 'middle' },
                        bodyStyles: { halign: 'center', valign: 'middle' }
                    });

                    // Ajustar startY para la segunda parte
                    startY = doc.lastAutoTable.finalY + 6;

                    // Segunda parte de la tabla
                    autoTable(doc, {
                        startY: startY,
                        head: [['Total de paradas', 'Kilometraje total', 'Duración', 'Estatus']],
                        body: tripDetailsPart2,
                        theme: 'striped',
                        headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], halign: 'center', valign: 'middle' },
                        bodyStyles: { halign: 'center', valign: 'middle' }
                    });

                    // Ajustar startY para la próxima ruta
                    startY = doc.lastAutoTable.finalY + 16;
                });
            } else {
                doc.setFontSize(12);
                doc.text('No se encontraron datos para la búsqueda establecida', 14, 70);
            }

            // Guardar el PDF
            doc.save(`reporte_rutas_${nameDocument}.pdf`);
        };
    };

    const generateCustomerPDF = () => {
        const doc = new jsPDF();
        const currentDate = new Date();
        const formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()} ${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}`;
        const nameDocument = `${String(currentDate.getDate())}_${String(currentDate.getMonth() + 1)}_${currentDate.getFullYear()}_${String(currentDate.getHours())}_${String(currentDate.getMinutes())}`;

        // Imagen
        const img = new Image();
        img.src = imagePath;
        img.onload = function () {
            doc.addImage(img, 'PNG', 13, 13, 28, 18);

            // Fecha de generación del PDF
            doc.setFontSize(10);
            doc.text(`Generado el día: ${formattedDate} hrs`, 135, 15);

            // Título centrado
            doc.setFontSize(18);
            doc.text('Reporte por cliente', doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });

            // Subtítulo
            const formatDate = (dateStr) => {
                const date = new Date(dateStr);
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const year = date.getFullYear();
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                return `${day}/${month}/${year} ${hours}:${minutes}`;
            };

            // Convertir las fechas al formato deseado
            const formattedStartDate = formatDate(startDate);
            const formattedEndDate = formatDate(endDate);

            // Agregar el texto con las fechas
            doc.setFontSize(10);
            doc.text(`Desde: ${formattedStartDate} hrs`, 14, 42);
            doc.text(`Hasta: ${formattedEndDate} hrs`, 14, 48);
            doc.text(`Cliente: ${reportByCustomer ? reportByCustomer.customerName : 'N/A'}`, 14, 54);

            // Resumen
            doc.setFontSize(14);
            doc.text('Resumen', 14, 68);

            if (reportByCustomer && !reportByCustomer.error && reportByCustomer.results.length > 0) {
                autoTable(doc, {
                    startY: 70,
                    head: [['Cliente', 'Duración', 'Kilometraje total (km)', 'Velocidad media (km/h)', 'Toneladas descargadas', 'Total de viajes']],
                    body: [
                        [
                            reportByCustomer.customerName,
                            reportByCustomer.totalDuration,
                            reportByCustomer.totalDistance,
                            reportByCustomer.averageSpeedOverall,
                            reportByCustomer.totalDownloadedTonnes,
                            reportByCustomer.totalTrips
                        ]
                    ],
                    theme: 'striped',
                    headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], halign: 'center', valign: 'middle' },
                    bodyStyles: { halign: 'center', valign: 'middle' }
                });

                // Detalles de los viajes
                doc.setFontSize(14);
                doc.text('Detalles de los viajes', 14, doc.lastAutoTable.finalY + 14);

                reportByCustomer.results.forEach((trip, index) => {
                    const tripDetailsPart1 = [
                        [
                            index + 1,
                            convertUTCToLocal(trip.departureTime) + " hrs",
                            trip.originName,
                            convertUTCToLocal(trip.arrivalTime) + " hrs",
                            trip.destinationName
                        ]
                    ];

                    const tripDetailsPart2 = [
                        [
                            trip.waypoints,
                            trip.distance,
                            trip.tripDuration,
                            trip.averageSpeed,
                            trip.totalUnload
                        ]
                    ];

                    // Primera parte de la tabla
                    autoTable(doc, {
                        startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 16 : 70,
                        head: [['No.', 'Fecha de inicio', 'Origen', 'Fecha de finalización', 'Destino']],
                        body: tripDetailsPart1,
                        theme: 'striped',
                        headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], halign: 'center', valign: 'middle' },
                        bodyStyles: { halign: 'center', valign: 'middle' }
                    });

                    // Ajustar startY para la segunda parte
                    const startYPart2 = doc.lastAutoTable.finalY + 6;

                    // Segunda parte de la tabla
                    autoTable(doc, {
                        startY: startYPart2,
                        head: [['Total de paradas', 'Kilometraje total', 'Duración', 'Velocidad media', 'Toneladas']],
                        body: tripDetailsPart2,
                        theme: 'striped',
                        headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], halign: 'center', valign: 'middle' },
                        bodyStyles: { halign: 'center', valign: 'middle' }
                    });
                });

            } else {
                doc.setFontSize(10);
                doc.text('No se encontraron datos para la búsqueda establecida', 14, 74);
            }

            // Guardar el PDF
            doc.save(`reporte_clientes_${nameDocument}.pdf`);
        };
    };

    const generateRouteWithPODPDF = async (codeRoute) => {
        try {
            const reportByPoint = await getReportDetailsByCodeRoute(codeRoute);

            const doc = new jsPDF();
            const currentDate = new Date();
            const formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()} ${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}`;
            const nameDocument = `${String(currentDate.getDate())}_${String(currentDate.getMonth() + 1)}_${currentDate.getFullYear()}_${String(currentDate.getHours())}_${String(currentDate.getMinutes())}`;

            // Imagen Logo
            const img = new Image();
            img.src = imagePath;
            img.onload = function () {
                doc.addImage(img, 'PNG', 13, 13, 28, 18);

                // Fecha de generación del PDF
                doc.setFontSize(10);
                doc.text(`Generado el día: ${formattedDate} hrs`, 135, 15);

                // Título centrado
                doc.setFontSize(18);
                doc.text('Reporte de ruta completada', doc.internal.pageSize.getWidth() / 2, 45, { align: 'center' });

                // Definir fuente en negrita
                doc.setFont("helvetica", "bold");
                doc.setFontSize(10);

                // Ancho de la página
                const pageWidth = doc.internal.pageSize.getWidth();

                // Ancho disponible para la columna derecha
                const rightColumnWidth = 70;
                const rightColumnX = pageWidth - rightColumnWidth - 15;

                doc.text(`Código de ruta:`, 14, 60);
                doc.setFont("helvetica", "normal");
                doc.text(`${codeRoute}`, 14 + doc.getTextWidth("Código de ruta:    "), 60);

                doc.setFont("helvetica", "bold");
                doc.text(`Distancia recorrida:`, 14, 68);
                doc.setFont("helvetica", "normal");
                doc.text(`${reportByPoint.data.distance} km`, 14 + doc.getTextWidth("Distancia recorrida:    "), 68);

                doc.setFont("helvetica", "bold");
                doc.text(`Salida:`, 14, 76);
                doc.setFont("helvetica", "normal");
                doc.text(`${convertUTCToLocal(reportByPoint.data.departureTime)} hrs`, 14 + doc.getTextWidth("Salida:  "), 76);
                doc.text(`${reportByPoint.data.originName}`, 14 + doc.getTextWidth("             "), 81);

                doc.setFont("helvetica", "bold");
                doc.text(`Llegada:`, 14, 89);
                doc.setFont("helvetica", "normal");
                doc.text(`${convertUTCToLocal(reportByPoint.data.arrivalTime)} hrs`, 14 + doc.getTextWidth("Llegada:  "), 89);
                doc.text(`${reportByPoint.data.destinationName}`, 14 + doc.getTextWidth("               "), 94);

                doc.setFont("helvetica", "bold");
                doc.text(`Asignación realizada por:`, 14, 102);
                doc.setFont("helvetica", "normal");
                doc.text(`${reportByPoint.data.assignedByName}`, 14 + doc.getTextWidth("Asignación realizada por:      "), 102);

                // Columna derecha
                doc.setFont("helvetica", "bold");
                doc.text(`Fecha de asignación:`, rightColumnX, 60);
                doc.setFont("helvetica", "normal");
                doc.text(`${convertUTCToLocal(reportByPoint.data.createdAt)} hrs`, rightColumnX + doc.getTextWidth(`Fecha de asignación:    `), 60);

                doc.setFont("helvetica", "bold");
                doc.text(`Duración del viaje:`, rightColumnX, 68);
                doc.setFont("helvetica", "normal");
                doc.text(`${reportByPoint.data.tripDuration}`, rightColumnX + doc.getTextWidth(`Duración del viaje:    `), 68);

                // Título Sección Detallada
                doc.setFontSize(14);
                doc.text('Información detallada', 14, 128);

                if (reportByPoint && !reportByPoint.error && reportByPoint.data.results && reportByPoint.data.results.length > 0) {
                    let startY = 135; 

                    reportByPoint.data.results.forEach((point) => {
                        const pointData = point.point[0];
                        const commentsText = point.comments && point.comments.trim() !== "" ? point.comments : "Sin comentarios";
                        const imgSignature = `data:image/png;base64,${point.signature}`;
                        const images = point.images;
                        const pageWidth = doc.internal.pageSize.getWidth();
                        const centerX = (pageWidth - 50) / 2;

                        if (startY > 250) {
                            doc.addPage();
                            startY = 20; 
                        }

                        if (pointData) {
                            const lineHeight = 7; 

                            // 1. TIPO
                            doc.setFont("helvetica", "bold");
                            doc.setFontSize(10);
                            doc.text(`Tipo:`, 14, startY);
                            doc.setFont("helvetica", "normal");
                            doc.text(`${pointData.type}`, 14 + doc.getTextWidth("Tipo:  "), startY);

                            // 2. UBICACIÓN
                            // Usamos splitTextToSize para que si la dirección es muy larga, baje de renglón
                            doc.setFont("helvetica", "bold");
                            doc.text(`Ubicación:`, 14, startY + lineHeight);
                            doc.setFont("helvetica", "normal");
                            const addressLines = doc.splitTextToSize(`${pointData.name}`, pageWidth - 45); 
                            doc.text(addressLines, 14 + doc.getTextWidth("Ubicación:   "), startY + lineHeight);
                            
                            const addressExtraHeight = (addressLines.length - 1) * 5; 

                            // 3. ESTATUS 
                            doc.setFont("helvetica", "bold");
                            doc.text(`Estatus:`, 14, startY + (lineHeight * 2) + addressExtraHeight);
                            doc.setFont("helvetica", "normal");
                            const statusText = point.deliveryStatus || "No registrado";
                            doc.text(`${statusText}`, 14 + doc.getTextWidth("Estatus:   "), startY + (lineHeight * 2) + addressExtraHeight);

                            // 4. HORA DE CAPTURA
                            doc.setFont("helvetica", "bold");
                            doc.text(`Hora de captura:`, 14, startY + (lineHeight * 3) + addressExtraHeight);
                            doc.setFont("helvetica", "normal");
                            const timeText = point.createdAt ? `${convertUTCToLocal(point.createdAt)} hrs` : "N/A";
                            doc.text(`${timeText}`, 14 + doc.getTextWidth("Hora de captura:   "), startY + (lineHeight * 3) + addressExtraHeight);

                            // 5. COMENTARIOS
                            doc.setFont("helvetica", "bold");
                            doc.text(`Comentarios:`, 14, startY + (lineHeight * 4) + addressExtraHeight);
                            doc.setFont("helvetica", "normal");
                            doc.text(`${commentsText}`, 14 + doc.getTextWidth("Comentarios:   "), startY + (lineHeight * 4) + addressExtraHeight);

                            // 6. FOTOS
                            doc.setFont("helvetica", "bold");
                            const photosY = startY + (lineHeight * 5) + 5 + addressExtraHeight; 
                            doc.text(`Fotos:`, 14, photosY);

                            let imgEndY = photosY; 
                            
                            if (images && images.length > 0) {
                                const imageWidth = 50; 
                                const imageHeight = 70; 
                                const margin = 10;
                                let imgStartY = photosY + 5;
                                let imgStartX = 14;

                                images.forEach((image, idx) => {
                                    const imgUrl = `data:image/png;base64,${image.imageUrl}`;

                                    if (imgStartX + imageWidth > pageWidth - 14) {
                                        imgStartX = 14;
                                        imgStartY += imageHeight + margin;
                                    }

                                    doc.addImage(imgUrl, 'PNG', imgStartX, imgStartY, imageWidth, imageHeight);
                                    imgStartX += imageWidth + margin;
                                    
                                    imgEndY = imgStartY + imageHeight; 
                                });
                            } else {
                                imgEndY = photosY + 10; 
                            }

                            doc.setFont("helvetica", "bold");
                            const signatureLabelY = imgEndY + 15;
                            doc.text(`Firma:`, centerX + 15, signatureLabelY);
                            doc.addImage(imgSignature, 'PNG', centerX, signatureLabelY + 5, 50, 30);

                            // Calculamos el final de la firma + margen
                            startY = signatureLabelY + 40 + 15; 
                        }
                    });

                } else {
                    doc.setFontSize(10);
                    doc.text('No se encontraron datos para la búsqueda establecida', 14, 135);
                }

                doc.save(`reporte_pods_${nameDocument}.pdf`);
            };

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error al generar el PDF. Por favor, inténtelo de nuevo.');
        }
    };

    const handleEditRoute = (routeId) => {
        // Cambiar a la vista de rutas
        const menuRoutesBtn = document.getElementById('menuRoutes');
        const menuReportsBtn = document.getElementById('menuReports');

        if (menuReportsBtn) {
            menuReportsBtn.classList.remove('btn-primary');
            menuReportsBtn.classList.add('btn-outline-primary');
        }

        if (menuRoutesBtn) {
            menuRoutesBtn.classList.remove('btn-outline-primary');
            menuRoutesBtn.classList.add('btn-primary');
        }

        // Mostrar la tarjeta de creación de rutas
        const createRouteCard = document.getElementById('create-route');
        if (createRouteCard) {
            createRouteCard.style.display = 'block';
        }

        // Disparar evento personalizado con el routeId
        window.dispatchEvent(new CustomEvent('loadRouteForEdit', {
            detail: { routeId }
        }));
    };

    return (
        <div>
            <div className="row">
                <div className='col-md-4 col-sm-12 mt-3 pl-3' style={{ flex: '0 0 21%', maxWidth: '21%' }}>
                    <div className="card" style={{ height: 'fit-content', maxHeight: 'calc(100vh - 55px - 20px)', overflowY: 'auto', overflowX: 'hidden', borderRadius: '10px', height: isCardBodyOpen ? 'calc(100vh - 20px)' : 'fit-content', zIndex: 1 }}>
                        <div className="card-header" id="card-report-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', padding: '0px' }}>
                            <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>Tipos de reporte</span>
                            <button className="btn ml-auto mr-2 custom-btn" style={{ padding: 0 }} onClick={() => setIsCardBodyOpen(!isCardBodyOpen)}>
                                {isCardBodyOpen ? <i className="icon-circle-up"></i> : <i className="icon-circle-down"></i>}
                            </button>
                        </div>
                        {isCardBodyOpen && (
                            <div className="card-body p-0" >
                                <div className="row">
                                    <div className="col-12 pt-2" style={{ paddingLeft: 20, paddingRight: 20 }}>
                                        <button id='btnReportsDriver' type="button" className={reportsDrivers ? 'btn btn-lg btn-active-report' : 'btn btn-lg btn-outline-primary custom-button'} onClick={handleReportsByDriver} style={{ width: '100%', height: 25, padding: 0, paddingLeft: 5, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', textAlign: 'left', borderRadius: 10 }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="-5.0 -10.0 110.0 135.0" className={reportsDrivers ? 'icon-active-report' : 'icon-inactive-report custom-icon-report'} style={{ width: '21px', height: '21px', marginTop: 4 }}>
                                                <path d="m57.711 64.23c-1.0234-1.0234-2.418-1.6055-3.8672-1.6055l-22.645 0.003906-4.0938-20.16h22.109c3.0195 0 5.4727-2.4453 5.4727-5.4727 0-3.0195-2.4492-5.4727-5.4727-5.4727l-28.801 0.003906c-1.6445 0-3.1953 0.73438-4.2344 2.0078-1.0391 1.2695-1.4531 2.9414-1.125 4.5547l6.3125 31.105c0.51953 2.5469 2.7617 4.3828 5.3633 4.3828h24.852l18.414 18.414c1.0664 1.0703 2.4688 1.6055 3.8672 1.6055 1.3984 0 2.8008-0.53125 3.8672-1.6055 2.1367-2.1367 2.1367-5.6016 0-7.7344zm23.77-32.703h-13.332v-6.5781c0-3.0195-2.4492-5.4727-5.4727-5.4727-3.0195 0-5.4727 2.4492-5.4727 5.4727v21.98c0 3.0195 2.4492 5.4727 5.4727 5.4727 3.0234 0 5.4727-2.4492 5.4727-5.4727v-4.4609h13.332c3.0195 0 5.4727-2.4453 5.4727-5.4727-0.003906-3.0195-2.4531-5.4688-5.4727-5.4688zm-57.785-25.117c5.8828 0 10.648 4.7695 10.648 10.648 0 5.8828-4.7695 10.648-10.648 10.648-5.8789 0-10.648-4.7656-10.648-10.648 0-5.8789 4.7695-10.648 10.648-10.648z" />
                                            </svg>
                                            <span className={reportsDrivers ? 'text-modal-2 text-active-report' : 'text-modal-2 text-inactive-report'}>Conductor</span>
                                        </button>
                                    </div>
                                    <div className="col-12 pt-2" style={{ paddingLeft: 20, paddingRight: 20 }}>
                                        <button id='btnReportsRoutes' type="button" className={reportsRoutes ? 'btn btn-lg btn-active-report' : 'btn btn-lg btn-outline-primary custom-button'} onClick={handleReportsByRoute} style={{ width: '100%', height: 25, padding: 0, paddingLeft: 5, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', textAlign: 'left', borderRadius: 10 }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 125" className={reportsRoutes ? 'icon-active-report' : 'icon-inactive-report custom-icon-report'} style={{ width: '20px', height: '20px', marginTop: 4 }}>
                                                <g>
                                                    <g>
                                                        <path d="M23.4,56.3c5-6.9,15.9-23.2,15.9-34.7c0-10.2-8.3-18.4-18.4-18.4S2.5,11.4,2.5,21.6c0,11.5,10.9,27.8,15.9,34.7 C19.7,58,22.2,58,23.4,56.3z M12.1,21.5c0-4.9,4-8.9,8.9-8.9c4.9,0,8.9,4,8.9,8.9c0,4.9-4,8.9-8.9,8.9 C16.1,30.5,12.1,26.5,12.1,21.5z" />
                                                        <path d="M81.6,80c5-6.9,15.9-23.2,15.9-34.7c0-10.2-8.3-18.4-18.4-18.4c-10.2,0-18.4,8.3-18.4,18.4c0,11.5,10.9,27.8,15.9,34.7 C77.8,81.7,80.3,81.7,81.6,80z M70.2,45.2c0-4.9,4-8.9,8.9-8.9c4.9,0,8.9,4,8.9,8.9c0,4.9-4,8.9-8.9,8.9 C74.2,54.1,70.2,50.2,70.2,45.2z" />
                                                        <path d="M79.1,85.9c-2.2,0-4.1,1.3-5,3.3H39.9c-1.5,0-2-1.2-2.1-1.6c-0.1-0.4-0.3-1.6,1-2.4l12.7-7.4c2.6-1.5,3.8-4.5,3-7.4 c-0.8-2.9-3.3-4.9-6.4-4.9H25.9c-0.9-1.9-2.8-3.3-5-3.3c-3,0-5.5,2.5-5.5,5.5c0,3,2.5,5.5,5.5,5.5c2.2,0,4.1-1.3,5-3.3h22.2 c1.5,0,2,1.2,2.1,1.6c0.1,0.4,0.3,1.6-1,2.4l-12.7,7.4c-2.6,1.5-3.8,4.5-3,7.4c0.8,2.9,3.3,4.9,6.4,4.9h34.1 c0.9,1.9,2.8,3.3,5,3.3c3,0,5.5-2.5,5.5-5.5C84.5,88.3,82.1,85.9,79.1,85.9z" />
                                                    </g>
                                                </g>
                                            </svg>
                                            <span className={reportsRoutes ? 'text-modal-2 text-active-report' : 'text-modal-2 text-inactive-report'} style={{ fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif', fontSize: 12, fontWeight: 'bold', paddingLeft: 2 }}>Rutas</span>
                                        </button>
                                    </div>
                                    <div className="col-12 pt-2" style={{ paddingLeft: 20, paddingRight: 20 }}>
                                        <button type="button" className={reportsCustomers ? 'btn btn-lg btn-active-report' : 'btn btn-lg btn-outline-primary custom-button'} onClick={handleReportsByCustomer} style={{ width: '100%', height: 25, padding: 0, paddingLeft: 5, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', textAlign: 'left', borderRadius: 10 }}>
                                            <i className={reportsCustomers ? 'fas fa-user text-active-report' : 'fas fa-user text-inactive-report'} style={{ fontSize: 12, paddingLeft: 5 }}></i>
                                            <span className={reportsCustomers ? 'text-active-report ml-2' : 'text-inactive-report ml-2'} style={{ fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif', fontSize: 12, fontWeight: 'bold' }}>Cliente</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className='col-md-8 col-sm-12 mt-3' style={{ flex: '0 0 79%', maxWidth: '79%' }}>
                    <div className="card" style={{ zIndex: 1, height: 'calc(-20px + 100vh)', overflowY: 'auto', overflowX: 'hidden', maxHeight: 'calc(-75px + 100vh)' }}>
                        {reportsDrivers && (
                            <div className="card-body p-3">
                                <div className="row">
                                    <div className="col-lg-4 col-md-6 col-sm-6 col-12 d-flex align-items-center p-0 pl-4 mb-2 pr-4">
                                        <label className='text-modal mr-2' htmlFor="start-time" style={{ marginTop: '4px' }}>Desde:</label>
                                        <input
                                            id="start-time"
                                            className="form-control"
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => {
                                                const newStartDate = e.target.value;
                                                setStartDate(newStartDate);
                                                if (endDate && newStartDate) {
                                                    if (!validateDateRange(newStartDate, endDate)) {
                                                        setDateError('La fecha de inicio no puede ser posterior a la fecha de fin');
                                                    } else {
                                                        setDateError('');
                                                    }
                                                }
                                            }}
                                            required
                                        />
                                    </div>
                                    <div className="col-lg-4 col-md-6 col-sm-6 col-12 d-flex align-items-center p-0 pl-4 mb-2 pr-4">
                                        <label className='text-modal mr-2' htmlFor="end-time" style={{ marginTop: '4px' }}>Hasta:</label>
                                        <input
                                            id="end-time"
                                            className="form-control"
                                            type="date"
                                            value={endDate}
                                            min={startDate}
                                            onChange={(e) => {
                                                const newEndDate = e.target.value;
                                                setEndDate(newEndDate);
                                                if (startDate && newEndDate) {
                                                    if (!validateDateRange(startDate, newEndDate)) {
                                                        setDateError('La fecha de fin no puede ser anterior a la fecha de inicio');
                                                    } else {
                                                        setDateError('');
                                                    }
                                                }
                                            }}
                                            required
                                        />
                                    </div>
                                    <div className="col-lg-4 col-md-12 col-sm-12 col-12 p-0 pl-4 pr-4 mb-2">
                                        <div className="d-flex align-items-center">
                                            <label htmlFor="selectCount" className="mr-2 mb-0 text-modal">Conductor:</label>
                                            <div className="flex-grow-1">
                                                <select
                                                    className="form-control pl-1 p-0"
                                                    name="driver"
                                                    value={selectedDriver}
                                                    onChange={(e) => setSelectedDriver(e.target.value)}
                                                >
                                                    <option value="">Sin seleccionar</option>
                                                    {filteredDrivers.map(user => (
                                                        <option key={user._id} value={user._id}>{user.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    {dateError && (
                                        <div className="col-12 p-0 pl-4 pr-4 mb-2">
                                            <div className="alert alert-danger" role="alert" style={{ padding: '8px', marginBottom: '0', fontSize: '14px' }}>
                                                <i className="fas fa-exclamation-triangle mr-2"></i>
                                                {dateError}
                                            </div>
                                        </div>
                                    )}

                                    <div className="col-lg-12 mt-2 mb-2">
                                        <button className="btn btn-primary float-right" onClick={generateDriverPDF} style={{ display: 'flex', alignItems: 'center' }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 125" x="0px" y="0px" width="20" height="20" style={{ marginRight: '4px', marginTop: '4px' }}>
                                                <g data-name="Layer 2" fill="#FFFFFF">
                                                    <path d="M81,33.35,54.08,6.45A2,2,0,0,0,52.86,6H21.38A4,4,0,0,0,20,6.24l-1.2,1.2a4,4,0,0,0-.29,1.36V91.23a4,4,0,0,0,.29,1.36l1.2,1.2a4,4,0,0,0,1.37.29H78.62A4,4,0,0,0,80,93.79l1.2-1.2a4.24,4.24,0,0,0,.29-1.36V34.57A2,2,0,0,0,81,33.35ZM79.66,91.64l-.62.63a2,2,0,0,1-.42.07H21.38a2,2,0,0,1-.42-.07l-.63-.63a2.69,2.69,0,0,1-.06-.41V8.8a2.69,2.69,0,0,1,.06-.41L21,7.76a2,2,0,0,1,.42-.07H52.11v27.6H79.73V91.23A1.94,1.94,0,0,1,79.66,91.64Z" />
                                                    <path d="M78.62,95H21.38a4.93,4.93,0,0,1-1.74-.37,1.07,1.07,0,0,1-.28-.19l-1.19-1.2A.83.83,0,0,1,18,93a4.76,4.76,0,0,1-.37-1.74V8.8A4.71,4.71,0,0,1,18,7.07a.77.77,0,0,1,.19-.28l1.19-1.2a.87.87,0,0,1,.28-.19A5,5,0,0,1,21.38,5H52.86a2.93,2.93,0,0,1,1.86.77l26.9,26.9a2.9,2.9,0,0,1,.77,1.87V91.23A5.14,5.14,0,0,1,82,93a1,1,0,0,1-.2.28l-1.2,1.2a1,1,0,0,1-.27.19A5,5,0,0,1,78.62,95ZM21.19,91.2l.22.22H78.59l.22-.22v-55H52.11a.91.91,0,0,1-.64-.27.88.88,0,0,1-.28-.65V8.61H21.41l-.23.23ZM53,34.37h26.7a.93.93,0,0,1,.83.52v-.32a1.15,1.15,0,0,0-.24-.58L53.43,7.1a1.19,1.19,0,0,0-.57-.23h-.34a.81.81,0,0,1,.24.17.91.91,0,0,1,.27.65Z" />
                                                    <path d="M49.37,62.27H47.72v9.51H49.4a4.54,4.54,0,0,0,3.45-1.32,5,5,0,0,0,1.24-3.59,4.55,4.55,0,0,0-1.24-3.38A4.74,4.74,0,0,0,49.37,62.27Z" />
                                                    <path d="M36.45,62.11H35.12v4.68h1.33q2.7,0,2.7-2.37T36.45,62.11Z" />
                                                    <path d="M79.35,53.51H20.65A1.63,1.63,0,0,0,19,55.15V78.88a1.63,1.63,0,0,0,1.64,1.64h58.7A1.63,1.63,0,0,0,81,78.88V55.15A1.63,1.63,0,0,0,79.35,53.51ZM41.08,68a6.44,6.44,0,0,1-4.35,1.4H35.12v5.17H31.74v-15H37c3.78,0,5.66,1.59,5.66,4.78A4.59,4.59,0,0,1,41.08,68Zm14.39,4.48a8.07,8.07,0,0,1-5.81,2.09H44.34v-15h5.32q8,0,8,7.31A7.42,7.42,0,0,1,55.47,72.43ZM68.25,62.27H63V66h4.86v2.74H63v5.83H59.58v-15h8.67Z" />
                                                </g>
                                            </svg>
                                            <span className='text-modal-2' style={{ color: '#FFFFFF' }}>Exportar</span>
                                        </button>
                                    </div>
                                    <div className="col-lg-12 mt-5">
                                        <div className="table-responsive">
                                            <table className="table table-hover text-center">
                                                <thead style={{ border: '2px' }}>
                                                    <tr style={{ height: '20px', backgroundColor: '#C8C8C8' }}>
                                                        <th className='pl-4' colSpan="6" style={{ textAlign: 'left', padding: 0, border: '1px solid black' }}>Resumen</th>
                                                    </tr>
                                                    <tr style={{ height: '20px', backgroundColor: '#C8C8C8' }}>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8' }} scope="col">Conductor</th>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8' }} scope="col">Duración</th>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8' }} scope="col">Kilometraje total (km)</th>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8' }} scope="col">Velocidad media (km/h)</th>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8' }} scope="col">Toneladas descargadas</th>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8' }} scope="col">Total de viajes</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        reportByDriver && !reportByDriver.error && reportByDriver.results.length > 0 ? (
                                                            <tr style={{ backgroundColor: '#FFFFFF' }}>
                                                                <td>{reportByDriver.driverName}</td>
                                                                <td>{reportByDriver.totalDuration}</td>
                                                                <td>{reportByDriver.totalDistance}</td>
                                                                <td>{reportByDriver.averageSpeedOverall}</td>
                                                                <td>{reportByDriver.totalDownloadedTonnes}</td>
                                                                <td>{reportByDriver.totalTrips}</td>
                                                            </tr>
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="6">No se encontraron datos para la búsqueda establecida</td>
                                                            </tr>
                                                        )
                                                    }
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div className="col-lg-12 mt-5">
                                        <div className="table-responsive">
                                            <table className="table table-hover text-center">
                                                <thead style={{ border: '2px' }}>
                                                    <tr style={{ height: '20px', backgroundColor: '#C8C8C8' }}>
                                                        <th className='pl-4' colSpan="10" style={{ textAlign: 'left', padding: 0, border: '1px solid black' }}>Detalles de los viajes</th>
                                                    </tr>
                                                    <tr style={{ height: '20px', backgroundColor: '#C8C8C8' }}>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8', verticalAlign: 'middle' }} scope="col">No.</th>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8', verticalAlign: 'middle' }} scope="col">Fecha de inicio</th>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8', verticalAlign: 'middle' }} scope="col">Origen</th>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8', verticalAlign: 'middle' }} scope="col">Fecha de finalización</th>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8', verticalAlign: 'middle' }} scope="col">Destino</th>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8', verticalAlign: 'middle' }} scope="col">Total de paradas</th>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8', verticalAlign: 'middle' }} scope="col">Kilometraje total</th>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8', verticalAlign: 'middle' }} scope="col">Duración</th>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8', verticalAlign: 'middle' }} scope="col">Velocidad media</th>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8', verticalAlign: 'middle' }} scope="col">Toneladas</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {reportByDriver && !reportByDriver.error && reportByDriver.results.length > 0 ? (
                                                        <>
                                                            {reportByDriver.results.map((trip, index) => (
                                                                <tr key={index}>
                                                                    <td>{index + 1}</td>
                                                                    <td>{convertUTCToLocal(trip.departureTime) + " hrs"}</td>
                                                                    <td>{trip.originName}</td>
                                                                    <td>{convertUTCToLocal(trip.arrivalTime) + " hrs"}</td>
                                                                    <td>{trip.destinationName}</td>
                                                                    <td>{trip.waypoints}</td>
                                                                    <td>{trip.distance}</td>
                                                                    <td>{trip.tripDuration}</td>
                                                                    <td>{trip.averageSpeed}</td>
                                                                    <td>{trip.totalUnload}</td>
                                                                </tr>
                                                            ))}
                                                        </>
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="10">No se encontraron datos para la búsqueda establecida</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {reportsRoutes && (
                            <div className="card-body p-3">
                                <div className="row">
                                    <div className="col-lg-3 col-md-6 col-sm-6 col-12 d-flex align-items-center p-0 pl-4 mb-2 pr-4">
                                        <label className='text-modal mr-2' htmlFor="start-time" style={{ marginTop: '4px' }}>Desde:</label>
                                        <input
                                            id="start-time"
                                            className="form-control"
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => {
                                                const newStartDate = e.target.value;
                                                setStartDate(newStartDate);
                                                if (endDate && newStartDate) {
                                                    if (!validateDateRange(newStartDate, endDate)) {
                                                        setDateError('La fecha de inicio no puede ser posterior a la fecha de fin');
                                                    } else {
                                                        setDateError('');
                                                    }
                                                }
                                            }}
                                            required
                                        />
                                    </div>
                                    <div className="col-lg-3 col-md-6 col-sm-6 col-12 d-flex align-items-center p-0 pl-4 mb-2 pr-4">
                                        <label className='text-modal mr-2' htmlFor="end-time" style={{ marginTop: '4px' }}>Hasta:</label>
                                        <input
                                            id="end-time"
                                            className="form-control"
                                            type="date"
                                            value={endDate}
                                            min={startDate}
                                            onChange={(e) => {
                                                const newEndDate = e.target.value;
                                                setEndDate(newEndDate);
                                                if (startDate && newEndDate) {
                                                    if (!validateDateRange(startDate, newEndDate)) {
                                                        setDateError('La fecha de fin no puede ser anterior a la fecha de inicio');
                                                    } else {
                                                        setDateError('');
                                                    }
                                                }
                                            }}
                                            required
                                        />
                                    </div>
                                    <div className="col-lg-3 col-md-6 col-sm-6 col-12 p-0 pl-4 pr-4 mb-2">
                                        <div className="d-flex align-items-center">
                                            <label htmlFor="selectCount" className="mr-2 mb-0 text-modal">Conductor:</label>
                                            <div className="flex-grow-1">
                                                <select
                                                    className="form-control pl-1 p-0"
                                                    name="driver"
                                                    value={selectedDriver}
                                                    onChange={(e) => setSelectedDriver(e.target.value)}
                                                >
                                                    <option value="">Sin seleccionar</option>
                                                    {filteredDrivers.map(user => (
                                                        <option key={user._id} value={user._id}>{user.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    {dateError && (
                                        <div className="col-12 p-0 pl-4 pr-4 mb-2">
                                            <div className="alert alert-danger" role="alert" style={{ padding: '8px', marginBottom: '0', fontSize: '14px' }}>
                                                <i className="fas fa-exclamation-triangle mr-2"></i>
                                                {dateError}
                                            </div>
                                        </div>
                                    )}

                                    <div className="col-lg-3 col-md-6 col-sm-6 col-12 p-0 pl-4 pr-4 mb-2">
                                        <div className="d-flex align-items-center">
                                            <label htmlFor="selectCount" className="mr-2 mb-0 text-modal">Estatus:</label>
                                            <div className="flex-grow-1">
                                                <select
                                                    className="form-control pl-1 p-0"
                                                    name="status"
                                                    value={status}
                                                    onChange={(e) => setStatus(e.target.value)}>
                                                    <option value="">Todos</option>
                                                    <option value="Completado">Completado</option>
                                                    <option value="Ruta no iniciada">Ruta no iniciada</option>
                                                    <option value="Ruta en curso">Ruta en curso</option>
                                                    <option value="Ruta futura">Ruta futura</option>
                                                    <option value="Ruta vencida">Ruta vencida</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-12 mt-2 mb-2">
                                        <button className="btn btn-primary float-right" onClick={generateRoutePDF} style={{ display: 'flex', alignItems: 'center' }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 125" x="0px" y="0px" width="20" height="20" style={{ marginRight: '4px', marginTop: '4px' }}>
                                                <g data-name="Layer 2" fill="#FFFFFF">
                                                    <path d="M81,33.35,54.08,6.45A2,2,0,0,0,52.86,6H21.38A4,4,0,0,0,20,6.24l-1.2,1.2a4,4,0,0,0-.29,1.36V91.23a4,4,0,0,0,.29,1.36l1.2,1.2a4,4,0,0,0,1.37.29H78.62A4,4,0,0,0,80,93.79l1.2-1.2a4.24,4.24,0,0,0,.29-1.36V34.57A2,2,0,0,0,81,33.35ZM79.66,91.64l-.62.63a2,2,0,0,1-.42.07H21.38a2,2,0,0,1-.42-.07l-.63-.63a2.69,2.69,0,0,1-.06-.41V8.8a2.69,2.69,0,0,1,.06-.41L21,7.76a2,2,0,0,1,.42-.07H52.11v27.6H79.73V91.23A1.94,1.94,0,0,1,79.66,91.64Z" />
                                                    <path d="M78.62,95H21.38a4.93,4.93,0,0,1-1.74-.37,1.07,1.07,0,0,1-.28-.19l-1.19-1.2A.83.83,0,0,1,18,93a4.76,4.76,0,0,1-.37-1.74V8.8A4.71,4.71,0,0,1,18,7.07a.77.77,0,0,1,.19-.28l1.19-1.2a.87.87,0,0,1,.28-.19A5,5,0,0,1,21.38,5H52.86a2.93,2.93,0,0,1,1.86.77l26.9,26.9a2.9,2.9,0,0,1,.77,1.87V91.23A5.14,5.14,0,0,1,82,93a1,1,0,0,1-.2.28l-1.2,1.2a1,1,0,0,1-.27.19A5,5,0,0,1,78.62,95ZM21.19,91.2l.22.22H78.59l.22-.22v-55H52.11a.91.91,0,0,1-.64-.27.88.88,0,0,1-.28-.65V8.61H21.41l-.23.23ZM53,34.37h26.7a.93.93,0,0,1,.83.52v-.32a1.15,1.15,0,0,0-.24-.58L53.43,7.1a1.19,1.19,0,0,0-.57-.23h-.34a.81.81,0,0,1,.24.17.91.91,0,0,1,.27.65Z" />
                                                    <path d="M49.37,62.27H47.72v9.51H49.4a4.54,4.54,0,0,0,3.45-1.32,5,5,0,0,0,1.24-3.59,4.55,4.55,0,0,0-1.24-3.38A4.74,4.74,0,0,0,49.37,62.27Z" />
                                                    <path d="M36.45,62.11H35.12v4.68h1.33q2.7,0,2.7-2.37T36.45,62.11Z" />
                                                    <path d="M79.35,53.51H20.65A1.63,1.63,0,0,0,19,55.15V78.88a1.63,1.63,0,0,0,1.64,1.64h58.7A1.63,1.63,0,0,0,81,78.88V55.15A1.63,1.63,0,0,0,79.35,53.51ZM41.08,68a6.44,6.44,0,0,1-4.35,1.4H35.12v5.17H31.74v-15H37c3.78,0,5.66,1.59,5.66,4.78A4.59,4.59,0,0,1,41.08,68Zm14.39,4.48a8.07,8.07,0,0,1-5.81,2.09H44.34v-15h5.32q8,0,8,7.31A7.42,7.42,0,0,1,55.47,72.43ZM68.25,62.27H63V66h4.86v2.74H63v5.83H59.58v-15h8.67Z" />
                                                </g>
                                            </svg>
                                            <span className='text-modal-2' style={{ color: '#FFFFFF' }}>Exportar</span>
                                        </button>
                                    </div>
                                    <div className="col-lg-12 mt-5">
                                        <div className="table-responsive">
                                            <table className="table table-hover text-center">
                                                <thead style={{ border: '2px' }}>
                                                    <tr style={{ height: '20px', backgroundColor: '#C8C8C8' }}>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8', verticalAlign: 'middle' }} scope="col">No.</th>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8', verticalAlign: 'middle', minWidth: '130px' }} scope="col">Conductor</th>                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8', verticalAlign: 'middle' }} scope="col">Fecha de inicio</th>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8', verticalAlign: 'middle' }} scope="col">Origen</th>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8', verticalAlign: 'middle' }} scope="col">Fecha de finalización</th>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8', verticalAlign: 'middle' }} scope="col">Destino</th>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8', verticalAlign: 'middle' }} scope="col">Total de paradas</th>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8', verticalAlign: 'middle', minWidth: '140px' }} scope="col">Kilometraje total</th>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8', verticalAlign: 'middle' }} scope="col">Duración</th>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8', verticalAlign: 'middle' }} scope="col">Estatus</th>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8', verticalAlign: 'middle', width: '80px' }} scope="col">Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {reportByStatus && !reportByStatus.error && reportByStatus.results.length > 0 ? (
                                                        <>
                                                            {reportByStatus.results.map((trip, index) => (
                                                                <tr key={index}>
                                                                    <td>{index + 1}</td>
                                                                    <td>{trip.driverName}</td>
                                                                    <td>{convertUTCToLocal(trip.departureTime) + " hrs"}</td>
                                                                    <td>{trip.originName}</td>
                                                                    <td>{convertUTCToLocal(trip.arrivalTime) + " hrs"}</td>
                                                                    <td>{trip.destinationName}</td>
                                                                    <td>{trip.waypoints}</td>
                                                                    <td>{trip.distance}</td>
                                                                    <td>{trip.tripDuration}</td>
                                                                    <td>{trip.status}</td>
                                                                    <td>
                                                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center' }}>
                                                                            {trip.status === 'Completado' && (
                                                                                <button
                                                                                    className="btn btn-link"
                                                                                    style={{ padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
                                                                                    onClick={() => generateRouteWithPODPDF(trip.codeRoute)}
                                                                                    title="Descargar reporte PDF"
                                                                                >
                                                                                    <img
                                                                                        src="/iconos principales/descargar.svg"
                                                                                        alt="Descargar"
                                                                                        width="20"
                                                                                        height="20"
                                                                                    />
                                                                                </button>
                                                                            )}

                                                                            {/*Botón de editar */}
                                                                            {(trip.status === 'Ruta no iniciada' || trip.status === 'Ruta futura') && (
                                                                                <button
                                                                                    className="btn btn-link"
                                                                                    style={{ padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
                                                                                    onClick={() => handleEditRoute(trip.routeId)}
                                                                                    title="Editar ruta"
                                                                                >
                                                                                    <img
                                                                                        src="/iconos principales/editar.svg"
                                                                                        alt="Editar"
                                                                                        width="20"
                                                                                        height="20"
                                                                                    />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </>
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="11">No se encontraron datos para la búsqueda establecida</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {reportsCustomers && (
                            <div className="card-body p-3">
                                <div className="row">
                                    <div className="col-lg-4 col-md-6 col-sm-6 col-12 d-flex align-items-center p-0 pl-4 mb-2 pr-4">
                                        <label className='text-modal mr-2' htmlFor="start-time" style={{ marginTop: '4px' }}>Desde:</label>
                                        <input
                                            id="start-time"
                                            className="form-control"
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => {
                                                const newStartDate = e.target.value;
                                                setStartDate(newStartDate);
                                                if (endDate && newStartDate) {
                                                    if (!validateDateRange(newStartDate, endDate)) {
                                                        setDateError('La fecha de inicio no puede ser posterior a la fecha de fin');
                                                    } else {
                                                        setDateError('');
                                                    }
                                                }
                                            }}
                                            required
                                        />
                                    </div>
                                    <div className="col-lg-4 col-md-6 col-sm-6 col-12 d-flex align-items-center p-0 pl-4 mb-2 pr-4">
                                        <label className='text-modal mr-2' htmlFor="end-time" style={{ marginTop: '4px' }}>Hasta:</label>
                                        <input
                                            id="end-time"
                                            className="form-control"
                                            type="date"
                                            value={endDate}
                                            min={startDate}
                                            onChange={(e) => {
                                                const newEndDate = e.target.value;
                                                setEndDate(newEndDate);
                                                if (startDate && newEndDate) {
                                                    if (!validateDateRange(startDate, newEndDate)) {
                                                        setDateError('La fecha de fin no puede ser anterior a la fecha de inicio');
                                                    } else {
                                                        setDateError('');
                                                    }
                                                }
                                            }}
                                            required
                                        />
                                    </div>
                                    <div className="col-lg-4 col-md-12 col-sm-12 col-12 p-0 pl-4 pr-4 mb-2">
                                        <div className="d-flex align-items-center">
                                            <label htmlFor="selectCount" className="mr-2 mb-0 text-modal">Cliente:</label>
                                            <div className="flex-grow-1">
                                                <select
                                                    className="form-control pl-1 p-0"
                                                    name="customer"
                                                    value={selectedCustomer}
                                                    onChange={(e) => setSelectedCustomer(e.target.value)}
                                                >
                                                    <option value="">Sin seleccionar</option>
                                                    {filteredCustomers.map(user => (
                                                        <option key={user._id} value={user._id}>{user.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    {dateError && (
                                        <div className="col-12 p-0 pl-4 pr-4 mb-2">
                                            <div className="alert alert-danger" role="alert" style={{ padding: '8px', marginBottom: '0', fontSize: '14px' }}>
                                                <i className="fas fa-exclamation-triangle mr-2"></i>
                                                {dateError}
                                            </div>
                                        </div>
                                    )}
                                    <div className="col-lg-12 mt-2 mb-2">
                                        <button className="btn btn-primary float-right" onClick={generateCustomerPDF} style={{ display: 'flex', alignItems: 'center' }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 125" x="0px" y="0px" width="20" height="20" style={{ marginRight: '4px', marginTop: '4px' }}>
                                                <g data-name="Layer 2" fill="#FFFFFF">
                                                    <path d="M81,33.35,54.08,6.45A2,2,0,0,0,52.86,6H21.38A4,4,0,0,0,20,6.24l-1.2,1.2a4,4,0,0,0-.29,1.36V91.23a4,4,0,0,0,.29,1.36l1.2,1.2a4,4,0,0,0,1.37.29H78.62A4,4,0,0,0,80,93.79l1.2-1.2a4.24,4.24,0,0,0,.29-1.36V34.57A2,2,0,0,0,81,33.35ZM79.66,91.64l-.62.63a2,2,0,0,1-.42.07H21.38a2,2,0,0,1-.42-.07l-.63-.63a2.69,2.69,0,0,1-.06-.41V8.8a2.69,2.69,0,0,1,.06-.41L21,7.76a2,2,0,0,1,.42-.07H52.11v27.6H79.73V91.23A1.94,1.94,0,0,1,79.66,91.64Z" />
                                                    <path d="M78.62,95H21.38a4.93,4.93,0,0,1-1.74-.37,1.07,1.07,0,0,1-.28-.19l-1.19-1.2A.83.83,0,0,1,18,93a4.76,4.76,0,0,1-.37-1.74V8.8A4.71,4.71,0,0,1,18,7.07a.77.77,0,0,1,.19-.28l1.19-1.2a.87.87,0,0,1,.28-.19A5,5,0,0,1,21.38,5H52.86a2.93,2.93,0,0,1,1.86.77l26.9,26.9a2.9,2.9,0,0,1,.77,1.87V91.23A5.14,5.14,0,0,1,82,93a1,1,0,0,1-.2.28l-1.2,1.2a1,1,0,0,1-.27.19A5,5,0,0,1,78.62,95ZM21.19,91.2l.22.22H78.59l.22-.22v-55H52.11a.91.91,0,0,1-.64-.27.88.88,0,0,1-.28-.65V8.61H21.41l-.23.23ZM53,34.37h26.7a.93.93,0,0,1,.83.52v-.32a1.15,1.15,0,0,0-.24-.58L53.43,7.1a1.19,1.19,0,0,0-.57-.23h-.34a.81.81,0,0,1,.24.17.91.91,0,0,1,.27.65Z" />
                                                    <path d="M49.37,62.27H47.72v9.51H49.4a4.54,4.54,0,0,0,3.45-1.32,5,5,0,0,0,1.24-3.59,4.55,4.55,0,0,0-1.24-3.38A4.74,4.74,0,0,0,49.37,62.27Z" />
                                                    <path d="M36.45,62.11H35.12v4.68h1.33q2.7,0,2.7-2.37T36.45,62.11Z" />
                                                    <path d="M79.35,53.51H20.65A1.63,1.63,0,0,0,19,55.15V78.88a1.63,1.63,0,0,0,1.64,1.64h58.7A1.63,1.63,0,0,0,81,78.88V55.15A1.63,1.63,0,0,0,79.35,53.51ZM41.08,68a6.44,6.44,0,0,1-4.35,1.4H35.12v5.17H31.74v-15H37c3.78,0,5.66,1.59,5.66,4.78A4.59,4.59,0,0,1,41.08,68Zm14.39,4.48a8.07,8.07,0,0,1-5.81,2.09H44.34v-15h5.32q8,0,8,7.31A7.42,7.42,0,0,1,55.47,72.43ZM68.25,62.27H63V66h4.86v2.74H63v5.83H59.58v-15h8.67Z" />
                                                </g>
                                            </svg>
                                            <span className='text-modal-2' style={{ color: '#FFFFFF' }}>Exportar</span>
                                        </button>
                                    </div>
                                    <div className="col-lg-12 mt-5">
                                        <div className="table-responsive">
                                            <table className="table table-hover text-center">
                                                <thead style={{ border: '2px' }}>
                                                    <tr style={{ height: '20px', backgroundColor: '#C8C8C8' }}>
                                                        <th className='pl-4' colSpan="6" style={{ textAlign: 'left', padding: 0, border: '1px solid black' }}>Resumen</th>
                                                    </tr>
                                                    <tr style={{ height: '20px', backgroundColor: '#C8C8C8' }}>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8' }} scope="col">Cliente</th>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8' }} scope="col">Duración</th>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8' }} scope="col">Kilometraje total (km)</th>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8' }} scope="col">Velocidad media (km/h)</th>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8' }} scope="col">Toneladas descargadas</th>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8' }} scope="col">Total de viajes</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        reportByCustomer && !reportByCustomer.error && reportByCustomer.results.length > 0 ? (
                                                            <tr style={{ backgroundColor: '#FFFFFF' }}>
                                                                <td>{reportByCustomer.customerName}</td>
                                                                <td>{reportByCustomer.totalDuration}</td>
                                                                <td>{reportByCustomer.totalDistance}</td>
                                                                <td>{reportByCustomer.averageSpeedOverall}</td>
                                                                <td>{reportByCustomer.totalDownloadedTonnes}</td>
                                                                <td>{reportByCustomer.totalTrips}</td>
                                                            </tr>
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="6">No se encontraron datos para la búsqueda establecida</td>
                                                            </tr>
                                                        )
                                                    }
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div className="col-lg-12 mt-5">
                                        <div className="table-responsive">
                                            <table className="table table-hover text-center">
                                                <thead style={{ border: '2px' }}>
                                                    <tr style={{ height: '20px', backgroundColor: '#C8C8C8' }}>
                                                        <th className='pl-4' colSpan="10" style={{ textAlign: 'left', padding: 0, border: '1px solid black' }}>Detalles de los viajes</th>
                                                    </tr>
                                                    <tr style={{ height: '20px', backgroundColor: '#C8C8C8' }}>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8', verticalAlign: 'middle' }} scope="col">No.</th>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8', verticalAlign: 'middle' }} scope="col">Fecha de inicio</th>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8', verticalAlign: 'middle' }} scope="col">Origen</th>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8', verticalAlign: 'middle' }} scope="col">Fecha de finalización</th>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8', verticalAlign: 'middle' }} scope="col">Destino</th>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8', verticalAlign: 'middle' }} scope="col">Total de paradas</th>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8', verticalAlign: 'middle' }} scope="col">Kilometraje total</th>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8', verticalAlign: 'middle' }} scope="col">Duración</th>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8', verticalAlign: 'middle' }} scope="col">Velocidad media</th>
                                                        <th style={{ padding: 0, border: '1px solid #C8C8C8', verticalAlign: 'middle' }} scope="col">Toneladas</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {reportByCustomer && !reportByCustomer.error && reportByCustomer.results.length > 0 ? (
                                                        <>
                                                            {reportByCustomer.results.map((trip, index) => (
                                                                <tr key={index}>
                                                                    <td>{index + 1}</td>
                                                                    <td>{convertUTCToLocal(trip.departureTime) + " hrs"}</td>
                                                                    <td>{trip.originName}</td>
                                                                    <td>{convertUTCToLocal(trip.arrivalTime) + " hrs"}</td>
                                                                    <td>{trip.destinationName}</td>
                                                                    <td>{trip.waypoints}</td>
                                                                    <td>{trip.distance}</td>
                                                                    <td>{trip.tripDuration}</td>
                                                                    <td>{trip.averageSpeed}</td>
                                                                    <td>{trip.totalUnload}</td>
                                                                </tr>
                                                            ))}
                                                        </>
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="10">No se encontraron datos para la búsqueda establecida</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
