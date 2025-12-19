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
            filtered = filtered.filter(alert => {
                const alertDate = new Date(alert.timestamp).toLocaleDateString('es-MX');
                const start = new Date(startDate.split('/').reverse().join('-'));
                const end = new Date(endDate.split('/').reverse().join('-'));
                const current = new Date(alert.timestamp);
                return current >= start && current <= end;
            });
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

        // Crear nuevo marcador
        const alertIcon = new H.map.Icon('/iconos%20principales/alert.svg', {
            size: { w: 40, h: 40 },
            anchor: { x: 20, y: 20 }
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

        const content = `
            <div style="padding: 15px; min-width: 260px; font-family: Arial, sans-serif; position: relative;">
                
                <div style="position: absolute; top: 5px; right: 10px; cursor: pointer;" onclick="window.closeAlertPopup()">
                    <span style="font-size: 18px; color: #999;">&times;</span>
                </div>

                <div style="${titleStyle}">
                    ${alert.driverName}
                </div>

                <div style="${alertTypeStyle}">
                    ${typeText}
                </div>

                <hr style="border: 0; border-top: 1px solid #eee; margin: 5px 0 10px 0;">

                <div style="${labelStyle}">Fecha y Hora:</div>
                <div style="${dataStyle}">
                    ${new Date(alert.timestamp).toLocaleString('es-MX', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })}
                </div>

                <div style="${labelStyle}">Ubicación:</div>
                <div style="${dataStyle}">
                    ${alert.address || `${alert.lat.toFixed(5)}, ${alert.lng.toFixed(5)}`}
                </div>

            </div>
        `;

        const bubble = new H.ui.InfoBubble(
            { lat: alert.lat, lng: alert.lng },
            { content: content }
        );

        ui.addBubble(bubble);
        
        // Centrar mapa
        map.setCenter({ lat: alert.lat, lng: alert.lng });
        map.setZoom(16);
    };

    // Función global para cerrar popup
    window.closeAlertPopup = () => {
        if (window.currentAlertBubble) {
            window.ui.removeBubble(window.currentAlertBubble);
            window.currentAlertBubble = null;
        }
    };

    const handleAlertCardClick = async (alert) => {
        // Marcar como vista si no está vista
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
                                        const isRecalc = alert.type === "ORIGINAL_ROUTE";
                                        const themeColor = isRecalc ? '#DC3545' : '#007BFF'; 

                                        const isSelected = selectedAlert && selectedAlert.deviationId === alert.deviationId;
                                        const isRead = alert.seenByAdmin;

                                        const borderColor = isSelected ? '#FB8800' : '#ccc';
                                        const borderWidth = isSelected ? '2px' : '1px';

                                        return (
                                            <div
                                                key={alert.deviationId}
                                                onClick={() => handleAlertCardClick(alert)}
                                                style={{
                                                    background: 'white',
                                                    border: `${borderWidth} solid ${borderColor}`,
                                                    borderRadius: '8px',
                                                    marginBottom: '8px',
                                                    cursor: 'pointer',
                                                    overflow: 'hidden',
                                                    position: 'relative',
                                                    boxShadow: isSelected ? '0 0 5px rgba(251, 136, 0, 0.5)' : 'none'
                                                }}
                                            >
                                                <div style={{
                                                    background: '#F2F2F2',
                                                    padding: '8px 10px',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    borderBottom: '1px solid #e0e0e0'
                                                }}>
                                                    <span style={{
                                                        color: themeColor,
                                                        fontWeight: 'bold',
                                                        fontSize: '13px'
                                                    }}>
                                                        {isRecalc ? "Alerta de ruta recalculada" : "Alerta de desviación de ruta"}
                                                    </span>

                                                    {!isRead && (
                                                        <div style={{
                                                            width: '8px',
                                                            height: '8px',
                                                            borderRadius: '50%',
                                                            backgroundColor: 'red',
                                                            marginLeft: '5px'
                                                        }}></div>
                                                    )}
                                                </div>

                                                <div style={{ padding: '8px 10px' }}>
                                                    <div style={{
                                                        color: '#007BFF',
                                                        fontWeight: 'bold',
                                                        fontSize: '12px',
                                                        textTransform: 'uppercase',
                                                        marginBottom: '4px'
                                                    }}>
                                                        {alert.driverName || "CONDUCTOR"}
                                                    </div>

                                                    <div style={{
                                                        color: '#999',
                                                        fontSize: '11px'
                                                    }}>
                                                        {new Date(alert.timestamp).toLocaleString('es-MX', {
                                                            year: 'numeric',
                                                            month: '2-digit',
                                                            day: '2-digit',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            second: '2-digit',
                                                            hour12: false
                                                        }).replace(',', '')}
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