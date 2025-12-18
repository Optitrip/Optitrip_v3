// AlertsComponent.jsx
import React, { useState } from 'react';

export default function AlertsComponent({ isOpen, toggleOpen }) {
    // Datos falsos para simular el diseño
    const [alerts, setAlerts] = useState([
        {
            id: 1,
            title: "Alerta de desviacion de ruta",
            driver: "JUAN ORTEGA",
            date: "08-12-2025 10:35:28",
            isRead: false,
            color: "#007BFF" // Azul
        },
        {
            id: 2,
            title: "Alerta de ruta recalculada",
            driver: "JUAN ORTEGA",
            date: "08-12-2025 10:30:28",
            isRead: false,
            type: "critical", 
            color: "#DC3545" 
        }
    ]);

    // Función para marcar como leída al hacer click
    const handleAlertClick = (id) => {
        const updatedAlerts = alerts.map(alert => 
            alert.id === id ? { ...alert, isRead: true } : alert
        );
        setAlerts(updatedAlerts);
    };

    return (
        <div className="card" style={{ 
            borderRadius: '10px', 
            overflow: 'hidden', 
            marginBottom: '10px',
            border: 'none',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
            {/* Cabecera Naranja */}
            <div className="card-header" 
                style={{ 
                    background: '#FB8800', 
                    color: 'white', 
                    padding: '8px 15px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                }}
                onClick={toggleOpen} 
            >
                <span style={{ fontWeight: 'bold' }}>Alertas</span>
                <button 
                    style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        color: 'white',
                        outline: 'none'
                    }}
                >
                    <i className={isOpen ? "icon-circle-up" : "icon-circle-down"}></i>
                </button>
            </div>

            {/* Cuerpo del componente (solo visible si isOpen es true) */}
            {isOpen && (
                <div className="card-body p-0" style={{ background: '#f8f9fa' }}>
                    
                    {/* Sección de Filtros */}
                    <div style={{ padding: '10px', borderBottom: '1px solid #dee2e6' }}>
                        
                        {/* Filtro Fecha */}
                        <div className="form-group mb-2" style={{position: 'relative'}}>
                            <label style={{fontSize: '10px', marginBottom: '0'}}>Fecha:</label>
                            <div style={{display: 'flex', gap: '5px'}}>
                                <input type="date" className="form-control form-control-sm" style={{fontSize: '11px'}} />
                                <span style={{alignSelf:'center'}}>-</span>
                                <input type="date" className="form-control form-control-sm" style={{fontSize: '11px'}} />
                            </div>
                        </div>

                        {/* Filtro Conductor */}
                        <div className="form-group mb-0">
                             <label style={{fontSize: '10px', marginBottom: '0'}}>Conductor:</label>
                            <select className="form-control form-control-sm" style={{fontSize: '11px'}}>
                                <option>Carlos Garcia</option>
                                <option>Juan Ortega</option>
                                <option>Todos</option>
                            </select>
                        </div>
                    </div>

                    {/* Lista de Alertas */}
                    <div style={{ 
                        maxHeight: 'calc(100vh - 350px)', 
                        overflowY: 'auto',
                        padding: '10px'
                    }}>
                        {alerts.map((alert) => (
                            <div 
                                key={alert.id}
                                onClick={() => handleAlertClick(alert.id)}
                                style={{
                                    background: alert.isRead ? '#ffffff' : '#e3f2fd', // Color suave si no leida, blanco si leida
                                    border: '1px solid #dee2e6',
                                    borderRadius: '5px',
                                    padding: '10px',
                                    marginBottom: '8px',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    borderLeft: `4px solid ${alert.id === 2 ? '#DC3545' : '#007BFF'}` // Borde de color según tipo
                                }}
                            >
                                {/* Título y Punto Rojo */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '5px' }}>
                                    <strong style={{ fontSize: '12px', color: alert.id === 2 ? '#DC3545' : '#007BFF' }}>
                                        {alert.title}
                                    </strong>
                                    {!alert.isRead && (
                                        <span style={{
                                            height: '8px',
                                            width: '8px',
                                            backgroundColor: 'red',
                                            borderRadius: '50%',
                                            display: 'inline-block'
                                        }}></span>
                                    )}
                                </div>

                                {/* Detalles */}
                                <div style={{ fontSize: '11px', color: '#333', fontWeight: 'bold' }}>
                                    {alert.driver}
                                </div>
                                <div style={{ fontSize: '10px', color: '#6c757d' }}>
                                    {alert.date}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}