import React, { useState, useEffect } from 'react';
import { base_url } from '../../config.js';

export default function AlertsComponent({ isOpen, toggleOpen, selectedAlert, onAlertSelect, map, ui }) {
    const [alerts, setAlerts] = useState([]);
    const [filteredAlerts, setFilteredAlerts] = useState([]);
    const [dateFilter, setDateFilter] = useState('');
    const [driverFilter, setDriverFilter] = useState('');
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(false);

    // Cargar alertas al montar el componente o cuando cambie isOpen
    useEffect(() => {
        if (isOpen) {
            fetchAlerts();
        }
    }, [isOpen]);

    // Aplicar filtros cuando cambian
    useEffect(() => {
        applyFilters();
    }, [alerts, dateFilter, driverFilter]);

    // Centrar mapa cuando hay una alerta seleccionada
    useEffect(() => {
        if (selectedAlert && map) {
            centerMapOnAlert(selectedAlert);
        }
    }, [selectedAlert, map]);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            // Usamos el endpoint que trae TODO el historial
            const response = await fetch(`${base_url}/reports/deviations/pending`);
            if (response.ok) {
                const data = await response.json();
                setAlerts(data);

                // Extraer conductores únicos
                const uniqueDrivers = [...new Set(data.map(alert => alert.driverName))];
                setDrivers(uniqueDrivers);
            }
        } catch (error) {
            console.error("Error fetching alerts", error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...alerts];

        // Filtro por fecha
        if (dateFilter) {
            const [startDate, endDate] = dateFilter.split(' - ');
            if (startDate && endDate) {
                filtered = filtered.filter(alert => {
                    // Ajuste simple de fecha para evitar problemas de zona horaria si es string
                    const alertDate = new Date(alert.timestamp);
                    const start = new Date(startDate.split('/').reverse().join('-'));
                    const end = new Date(endDate.split('/').reverse().join('-'));
                    // Ajustar end al final del día
                    end.setHours(23, 59, 59);
                    return alertDate >= start && alertDate <= end;
                });
            }
        }

        // Filtro por conductor
        if (driverFilter && driverFilter !== 'all') {
            filtered = filtered.filter(alert => alert.driverName === driverFilter);
        }

        // Ordenar por fecha (más recientes primero)
        filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        setFilteredAlerts(filtered);
    };

    const centerMapOnAlert = (alert) => {
        if (!map) return;

        const lat = alert.lat;
        const lng = alert.lng;

        // Centrar el mapa
        map.setCenter({ lat, lng });
        map.setZoom(16);

        // Crear o actualizar marcador
        addAlertMarkerToMap(alert);

        // Crear popup con información
        showAlertPopup(alert);
    };

    const addAlertMarkerToMap = (alert) => {
        // Remover marcadores de alerta anteriores
        const existingMarkers = map.getObjects().filter(obj =>
            obj instanceof H.map.Marker && obj.getData() && obj.getData().isAlertMarker
        );
        existingMarkers.forEach(marker => map.removeObject(marker));

        // Crear nuevo marcador (Codificamos el espacio en la URL)
        const alertIcon = new H.map.Icon('/iconos%20principales/alert.svg', {
            size: { w: 40, h: 40 },
            anchor: { x: 20, y: 40 }
        });

        const marker = new H.map.Marker(
            { lat: alert.lat, lng: alert.lng },
            {
                icon: alertIcon,
                data: { isAlertMarker: true, alert: alert }
            }
        );

        map.addObject(marker);

        // Agregar evento de clic
        marker.addEventListener('tap', () => {
            showAlertPopup(alert);
        });
    };

    const showAlertPopup = (alert) => {
        // Limpiar bubble anterior
        if (ui.getBubbles().length > 0) {
            ui.getBubbles().forEach(b => ui.removeBubble(b));
        }

        const typeText = alert.type === "ORIGINAL_ROUTE"
            ? "Ruta recalculada"
            : "Desviación de ruta";

        // Formato de fecha
        const d = new Date(alert.timestamp);
        const dateStr = d.getFullYear() + "-" +
            ("0" + (d.getMonth() + 1)).slice(-2) + "-" +
            ("0" + d.getDate()).slice(-2) + " " +
            ("0" + d.getHours()).slice(-2) + ":" +
            ("0" + d.getMinutes()).slice(-2) + ":" +
            ("0" + d.getSeconds()).slice(-2);

        const content = `
            <div style="
                width: 300px;
                background-color: #F2F4F7; 
                padding: 12px 15px; 
                font-family: Arial, sans-serif; 
                position: relative; 
                border-radius: 4px; 
                box-sizing: border-box;
                text-align: left;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2); 
                margin-bottom: 10px; 
            ">
                <div 
                    onclick="window.closeAlertPopup()"
                    style="
                        position: absolute; 
                        top: 8px; 
                        right: 8px; 
                        cursor: pointer; 
                        z-index: 10;
                        width: 18px;
                        height: 18px;
                        border: 1.5px solid #000;
                        border-radius: 50%;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        background: transparent;
                    "
                >
                    <span style="
                        font-size: 12px; 
                        color: #000; 
                        font-weight: bold; 
                        line-height: 0;
                        margin-top: -1px;
                    ">&times;</span>
                </div>

                <div style="
                    font-size: 14px; 
                    font-weight: 800; 
                    color: #000000; 
                    margin-bottom: 4px;
                    padding-right: 20px;
                    text-transform: uppercase;
                ">
                    ${alert.driverName || 'CONDUCTOR'}
                </div>

                <div style="
                    font-size: 13px; 
                    font-weight: 600; 
                    color: #4A4A4A; 
                    margin-bottom: 6px;
                ">
                    ${typeText}
                </div>

                <div style="
                    font-size: 11px; 
                    color: #888888; 
                    margin-bottom: 2px;
                ">
                    ${dateStr}
                </div>

                <div style="
                    font-size: 11px; 
                    color: #888888; 
                    line-height: 1.3;
                    white-space: nowrap;     
                    overflow: hidden;         
                    text-overflow: ellipsis;  
                ">
                    ${alert.address || `${alert.lat.toFixed(5)}, ${alert.lng.toFixed(5)}`}
                </div>

                <div style="
                    position: absolute;
                    bottom: -8px; 
                    left: 50%;
                    transform: translateX(-50%);
                    width: 0; 
                    height: 0; 
                    border-left: 8px solid transparent;
                    border-right: 8px solid transparent;
                    border-top: 8px solid #F2F4F7;
                "></div>
            </div>
        `;

        const bubble = new H.ui.InfoBubble(
            { lat: alert.lat, lng: alert.lng },
            { content: content }
        );

        ui.addBubble(bubble);
    };

    // Función global para cerrar popup desde el HTML string
    window.closeAlertPopup = () => {
        if (ui && ui.getBubbles().length > 0) {
            ui.getBubbles().forEach(b => ui.removeBubble(b));
        }
    };

    const handleAlertCardClick = async (alert) => {
        if (!alert.seenByAdmin) {
            await markAlertAsSeen(alert);
        }

        // Notificar al componente padre
        if (onAlertSelect) {
            onAlertSelect(alert);
        }

        // Centrar mapa
        centerMapOnAlert(alert);
    };

    const markAlertAsSeen = async (alert) => {
        try {
            await fetch(`${base_url}/report/deviation/seen`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    routeId: alert.routeId,
                    deviationId: alert.deviationId
                })
            });

            // Actualizar estado local
            setAlerts(prevAlerts =>
                prevAlerts.map(a =>
                    a.deviationId === alert.deviationId
                        ? { ...a, seenByAdmin: true }
                        : a
                )
            );
        } catch (error) {
            console.error("Error marking as seen", error);
        }
    };

    const handleDateChange = (e) => {
        setDateFilter(e.target.value);
    };

    const handleDriverChange = (e) => {
        setDriverFilter(e.target.value);
    };

    return (
        <div className="card" style={{
            borderRadius: '10px',
            overflow: 'hidden',
            border: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            width: '100%',
            fontFamily: 'Arial, sans-serif'
        }}>
            <div className="card-header" onClick={toggleOpen} style={{
                background: 'linear-gradient(to right, #FB8800, #FB8800)',
                color: 'white',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'relative',
                borderRadius: '10px 10px 0 0'
            }}>
                <span style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontWeight: 'bold',
                    fontSize: '14px'
                }}>
                    Alertas
                </span>

                <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', marginRight: '8px', marginTop: '3px' }}>
                    <i className={isOpen ? "icon-circle-up" : "icon-circle-down"}></i>
                </div>
            </div>

            {isOpen && (
                <div style={{ background: '#F8F9FA', padding: '10px' }}>
                    {/* FILTROS */}
                    <div style={{ marginBottom: '15px' }}>
                        {/* Fila Fecha */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ fontSize: '13px', color: '#333', width: '70px', margin: 0 }}>Fecha:</label>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <input
                                    type="text"
                                    value={dateFilter}
                                    onChange={handleDateChange}
                                    placeholder="dd/mm/yyyy - dd/mm/yyyy"
                                    style={{
                                        width: '100%',
                                        fontSize: '12px',
                                        padding: '4px 25px 4px 8px',
                                        border: '1px solid #6c757d',
                                        borderRadius: '4px',
                                        height: '28px',
                                        color: '#333'
                                    }}
                                />
                                <i className="fas fa-calendar-alt" style={{
                                    position: 'absolute',
                                    right: '8px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#6c757d',
                                    fontSize: '12px'
                                }}></i>
                            </div>
                        </div>

                        {/* Fila Conductor */}
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <label style={{ fontSize: '13px', color: '#333', width: '70px', margin: 0 }}>Conductor:</label>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <select
                                    value={driverFilter}
                                    onChange={handleDriverChange}
                                    style={{
                                        width: '100%',
                                        fontSize: '12px',
                                        padding: '4px 8px',
                                        border: '1px solid #6c757d',
                                        borderRadius: '4px',
                                        height: '28px',
                                        color: '#333',
                                        appearance: 'none',
                                        background: 'white'
                                    }}
                                >
                                    <option value="all">Todos los conductores</option>
                                    {drivers.map((driver, index) => (
                                        <option key={index} value={driver}>{driver}</option>
                                    ))}
                                </select>
                                <i className="fas fa-caret-down" style={{
                                    position: 'absolute',
                                    right: '8px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#000',
                                    pointerEvents: 'none'
                                }}></i>
                            </div>
                        </div>
                    </div>

                    {/* LISTA DE ALERTAS */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                            Cargando alertas...
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                            {filteredAlerts.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                                    No hay alertas para mostrar
                                </div>
                            ) : (
                                filteredAlerts.map((alert) => {
                                    const isSelected = selectedAlert && selectedAlert.deviationId === alert.deviationId;

                                    const primaryColor = isSelected ? '#007BFF' : '#000000';
                                    const borderColor = isSelected ? '#007BFF' : '#d1d1d1';
                                    const cardBackground = isSelected ? '#E9ECEF' : '#F8F9FA';
                                    const typeText = alert.type === "ORIGINAL_ROUTE" ? "Ruta recalculada" : "Desviación de ruta";

                                    return (
                                        <div
                                            key={alert.deviationId}
                                            onClick={() => handleAlertCardClick(alert)}
                                            style={{
                                                background: cardBackground,
                                                border: `1px solid ${borderColor}`,
                                                borderRadius: '8px',
                                                marginBottom: '4px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                minHeight: 'fit-content',
                                                position: 'relative',
                                                boxShadow: isSelected ? '0 2px 5px rgba(0, 123, 255, 0.2)' : 'none'
                                            }}
                                        >
                                            {/* Cabecera de la tarjeta */}
                                            <div style={{
                                                padding: '5px 8px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                borderBottom: '1px solid #e0e0e0'
                                            }}>
                                                <span style={{
                                                    color: primaryColor,
                                                    fontWeight: 'bold',
                                                    fontSize: '12px',
                                                }}>
                                                    {typeText}
                                                </span>

                                                {/* Indicador de No Leído (Punto rojo) */}
                                                {!alert.seenByAdmin && (
                                                    <div style={{
                                                        width: '6px',
                                                        height: '6px',
                                                        borderRadius: '50%',
                                                        backgroundColor: '#dc3545',
                                                        marginLeft: '5px',
                                                        boxShadow: '0 0 2px rgba(220, 53, 69, 0.5)'
                                                    }}></div>
                                                )}
                                            </div>

                                            {/* Cuerpo de la tarjeta */}
                                            <div style={{ padding: '5px 8px' }}>
                                                {/* CONDUCTOR */}
                                                <div style={{
                                                    color: primaryColor, 
                                                    fontWeight: '600',
                                                    fontSize: '11px',
                                                    marginBottom: '2px', 
                                                }}>
                                                    {alert.driverName || "Conductor"}
                                                </div>

                                                {/* FECHA Y HORA */}
                                                <div style={{
                                                    color: '#6c757d',
                                                    fontSize: '10px',
                                                    marginTop: '2px'
                                                }}>
                                                    {new Date(alert.timestamp).toLocaleString('es-MX', {
                                                        year: 'numeric',
                                                        month: '2-digit',
                                                        day: '2-digit',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: false
                                                    }).replace(',', '') + ' hrs'}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}