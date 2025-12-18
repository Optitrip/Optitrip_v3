import React from 'react';

export default function AlertsComponent({ isOpen, toggleOpen }) {
    // Datos de ejemplo basados en tu imagen
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
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            width: '100%',
            fontFamily: 'Lato, sans-serif'
        }}>
            {/* HEADER CLONADO EXACTAMENTE DEL HTML DE DIAGRAMA DE CUENTAS */}
            <div 
                onClick={toggleOpen}
                className="card-header"
                style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    position: 'relative', 
                    padding: '3px',
                    backgroundColor: '#FB8800', 
                    color: 'white',
                    cursor: 'pointer',
                    height: '49px' // Altura estándar de bootstrap card-header o similar a tu HTML
                }}
            >
                {/* Texto centrado absoluto */}
                <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                    Alertas
                </span>

                {/* Botones/Iconos a la derecha */}
                <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
                    <button 
                        type="button"
                        style={{ 
                            border: 'none', 
                            background: 'none', 
                            marginRight: '8px', 
                            marginTop: '3px', 
                            color: 'white',
                            outline: 'none'
                        }}
                    >
                        {/* EL MISMO ÍCONO QUE EN TU HTML */}
                        <i className={isOpen ? "icon-circle-up" : "icon-circle-down"}></i>
                    </button>
                </div>
            </div>

            {/* BODY (Contenido) */}
            {isOpen && (
                <div style={{ background: '#F8F9FA', padding: '10px' }}>
                    
                    {/* Filtros */}
                    <div style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                            <label style={{ fontSize: '13px', color: '#333', width: '80px', margin: 0 }}>Fecha:</label>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <input type="text" defaultValue="08/12/2025 - 08/12/2025" readOnly
                                    style={{ width: '100%', fontSize: '12px', padding: '2px 25px 2px 5px', border: '1px solid #767676', borderRadius: '3px', height: '26px', color: '#333', background: 'white', textAlign: 'center' }} />
                                <i className="fas fa-calendar-alt" style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', color: '#333', fontSize: '12px' }}></i>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <label style={{ fontSize: '13px', color: '#333', width: '80px', margin: 0 }}>Conductor:</label>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <select style={{ width: '100%', fontSize: '12px', padding: '2px 5px', border: '1px solid #767676', borderRadius: '3px', height: '26px', color: '#333', background: 'white' }}>
                                    <option>Carlos García</option>
                                    <option>Juan Ortega</option>
                                </select>
                                <i className="fas fa-caret-down" style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', color: '#000', pointerEvents: 'none', fontSize: '12px' }}></i>
                            </div>
                        </div>
                    </div>

                    {/* Lista Tarjetas */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {alerts.map((alert) => {
                            const isDeviation = alert.type === 'deviation';
                            return (
                                <div key={alert.id} style={{ background: 'white', border: isDeviation ? '1px solid #4D96F4' : '1px solid #B0B0B0', borderRadius: '8px', overflow: 'hidden' }}>
                                    <div style={{ padding: '5px 10px', background: isDeviation ? '#E1ECF4' : '#F5F5F5', borderBottom: isDeviation ? '1px solid #A8C6FA' : '1px solid #E0E0E0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h6 style={{ fontSize: '11px', fontWeight: 'bold', color: isDeviation ? '#1A73E8' : '#000000', margin: 0 }}>{alert.title}</h6>
                                        {!alert.isRead && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF0000' }}></div>}
                                    </div>
                                    <div style={{ padding: '8px 10px' }}>
                                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: isDeviation ? '#1A73E8' : '#000000', textTransform: 'uppercase', marginBottom: '2px' }}>{alert.driver}</div>
                                        <div style={{ fontSize: '10px', color: '#9E9E9E' }}>{alert.date}</div>
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