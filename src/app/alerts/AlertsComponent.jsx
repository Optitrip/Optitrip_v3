// AlertsComponent.jsx
import React, { useState } from 'react';

export default function AlertsComponent({ isOpen, toggleOpen }) {
    // Simulamos los datos exactos de la imagen
    const alerts = [
        {
            id: 1,
            type: 'deviation',
            title: "Alerta de desviacion de ruta",
            driver: "JUAN ORTEGA",
            date: "08-12-2025 10:35:28",
            isRead: true,
        },
        {
            id: 2,
            type: 'recalc',
            title: "Alerta de ruta recalculada",
            driver: "JUAN ORTEGA",
            date: "08-12-2025 10:30:28",
            isRead: false,
        }
    ];

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
                {/* Título centrado absolutamente */}
                <span style={{ 
                    position: 'absolute', 
                    left: '50%', 
                    transform: 'translateX(-50%)', 
                    fontWeight: 'bold', 
                    fontSize: '14px' 
                }}>
                    Alertas
                </span>
                
                {/* Icono a la derecha */}
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
                                    defaultValue="08/12/2025  -  08/12/2025"
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
                                <select style={{
                                    width: '100%',
                                    fontSize: '12px',
                                    padding: '4px 8px',
                                    border: '1px solid #6c757d',
                                    borderRadius: '4px',
                                    height: '28px',
                                    color: '#333',
                                    appearance: 'none',
                                    background: 'white'
                                }}>
                                    <option>Carlos García</option>
                                    <option>Juan Ortega</option>
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {alerts.map((alert) => {
                            const isDeviation = alert.type === 'deviation';

                            const cardBorder = isDeviation ? '1px solid #3B82F6' : '1px solid #999';
                            const titleColor = isDeviation ? '#3B82F6' : '#000';
                            const headerBg = isDeviation ? '#EBF5FF' : '#F3F3F3';
                            const nameColor = isDeviation ? '#3B82F6' : '#000';

                            return (
                                <div key={alert.id} style={{
                                    background: 'white',
                                    border: cardBorder,
                                    borderRadius: '8px',
                                    overflow: 'hidden'
                                }}>
                                    {/* Card Header */}
                                    <div style={{
                                        padding: '8px 10px',
                                        background: headerBg,
                                        borderBottom: '1px solid #e0e0e0',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span style={{
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            color: titleColor
                                        }}>
                                            {alert.title}
                                        </span>

                                        {/* Punto Rojo si no leída */}
                                        {!alert.isRead && (
                                            <div style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                background: '#FF0000',
                                                boxShadow: '0 0 2px rgba(255,0,0,0.5)'
                                            }}></div>
                                        )}
                                    </div>

                                    {/* Card Body */}
                                    <div style={{ padding: '8px 10px' }}>
                                        <div style={{
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            color: nameColor,
                                            textTransform: 'uppercase',
                                            marginBottom: '2px'
                                        }}>
                                            {alert.driver}
                                        </div>
                                        <div style={{
                                            fontSize: '11px',
                                            color: '#999'
                                        }}>
                                            {alert.date}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>
            )}
        </div>
    );
}