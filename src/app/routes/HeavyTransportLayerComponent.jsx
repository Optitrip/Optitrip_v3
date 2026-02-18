import { useState, useEffect } from 'react';
import {
    toggleTruckLayer,
    LAYER_COLORS
} from './HeavyTransportUtils';

export default function HeavyTransportLayerComponent({ map }) {

    const [isTruckLayerActive, setIsTruckLayerActive] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = () => {
        const newState = !isTruckLayerActive;
        setIsTruckLayerActive(newState);
        toggleTruckLayer(map, newState);
    };

    useEffect(() => {
        return () => {
            if (map) {
                toggleTruckLayer(map, false);
            }
        };
    }, [map]);

    return (
        <div style={{ position: 'relative', width: '30px', height: '30px' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                id="btnHeavyTransport"
                style={{ opacity: isOpen ? 0.8 : 1 }}
            >
                <img
                    src="/iconos principales/grid icon.svg"
                    alt="Grid"
                    style={{
                        width: '14px',
                        height: '14px',
                        filter: 'brightness(0) invert(1)'
                    }}
                />
            </button>

            {isOpen && (
                <div className="card" style={{
                    position: 'absolute',
                    top: 0,
                    right: '40px',
                    width: '280px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    borderRadius: '8px',
                    border: 'none',
                    zIndex: 1000,
                    backgroundColor: '#fff'
                }}>
                    <div className="card-header" style={{
                        background: '#F7941D',
                        borderRadius: '8px 8px 0 0',
                        padding: '8px 12px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative'
                    }}>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>
                            Mapa de Carga Pesada
                        </span>
                        <div
                            onClick={() => setIsOpen(false)}
                            style={{
                                position: 'absolute',
                                right: '12px',
                                cursor: 'pointer',
                                zIndex: 10,
                                width: '18px',
                                height: '18px',
                                border: '2px solid #fff',
                                borderRadius: '50%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                background: 'transparent'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                            <i className="fas fa-times" style={{
                                fontSize: '11px',
                                color: '#fff',
                                lineHeight: 1
                            }}></i>
                        </div>
                    </div>

                    <div className="card-body" style={{ padding: '15px', fontSize: '12px', backgroundColor: '#f9f9f9' }}>
                        <p style={{ marginBottom: '15px', textAlign: 'center', color: '#555' }}>
                            Active la capa para visualizar restricciones de altura, peso, materiales peligrosos y vías prohibidas.
                        </p>

                        <div
                            onClick={handleToggle}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px',
                                backgroundColor: isTruckLayerActive ? '#e8f5e9' : '#fff',
                                border: `1px solid ${isTruckLayerActive ? '#28a745' : '#ccc'}`,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <span style={{ fontWeight: 'bold' }}>Mostrar Restricciones</span>
                            <div style={{
                                width: '40px',
                                height: '20px',
                                backgroundColor: isTruckLayerActive ? '#28a745' : '#ccc',
                                borderRadius: '10px',
                                position: 'relative',
                                transition: 'background-color 0.2s'
                            }}>
                                <div style={{
                                    width: '16px',
                                    height: '16px',
                                    backgroundColor: '#fff',
                                    borderRadius: '50%',
                                    position: 'absolute',
                                    top: '2px',
                                    left: isTruckLayerActive ? '22px' : '2px',
                                    transition: 'left 0.2s'
                                }}></div>
                            </div>
                        </div>

                        {isTruckLayerActive && (
                            <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #ddd' }}>
                                <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Simbología (Nativa HERE):</p>
                                <ul style={{ paddingLeft: '20px', margin: 0, color: '#666' }}>
                                    <li>Círculo Rojo: Prohibido</li>
                                    <li>Triángulo Amarillo: Advertencia (Altura/Peso)</li>
                                    <li>Icono Naranja: Materiales Peligrosos</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}