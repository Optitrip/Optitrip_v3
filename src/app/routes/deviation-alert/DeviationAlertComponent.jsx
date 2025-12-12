import React, { useState } from 'react';
import '../../../App.css';

export default function DeviationAlertComponent({ state, setState }) {
    const [isCardBodyOpen, setIsCardBodyOpen] = useState(state.isEditMode || false);
    const [alertEnabled, setAlertEnabled] = useState(state.deviationAlertEnabled || false);
    const [alertDistance, setAlertDistance] = useState(state.deviationAlertDistance || 50);

    const handleToggleAlert = (enabled) => {
        setAlertEnabled(enabled);
        setState(prevState => ({
            ...prevState,
            deviationAlertEnabled: enabled,
            // Si se desactiva, resetear a valor por defecto
            deviationAlertDistance: enabled ? prevState.deviationAlertDistance : 50
        }));
    };

    const handleDistanceChange = (e) => {
        const value = parseInt(e.target.value) || 50;
        // Validar rango
        const validValue = Math.max(10, Math.min(1000, value));

        setAlertDistance(validValue);
        setState(prevState => ({
            ...prevState,
            deviationAlertDistance: validValue
        }));
    };

    return (
        <div className="card mt-2">
            <div className="card-header card-module" style={{
                padding: 0,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'relative'
            }}>
                <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                    Alertas de desviación
                </span>
                <button
                    className="btn ml-auto mr-2 custom-btn"
                    style={{ padding: 0 }}
                    onClick={() => setIsCardBodyOpen(!isCardBodyOpen)}
                >
                    {isCardBodyOpen ? <i className="icon-circle-up"></i> : <i className="icon-circle-down"></i>}
                </button>
            </div>

            {isCardBodyOpen && (
                <div className="card-body" style={{ background: '#E4E4E4', padding: '10px' }}>
                    {/* Toggle Sí/No */}
                    <div className="row align-items-center mb-3">
                        <div className="col-6">
                            <span style={{ fontSize: '12px', fontWeight: '500' }}>
                                Activar alerta
                            </span>
                        </div>
                        <div className="col-6 text-right">
                            <button
                                style={{
                                    height: 18,
                                    borderRadius: "10px 0 0 10px",
                                    minWidth: 20,
                                    fontSize: 9
                                }}
                                className={`btn m-0 p-0 ${!alertEnabled ? "btn-danger" : "btn-secondary"}`}
                                onClick={() => handleToggleAlert(false)}
                            >
                                No
                            </button>
                            <button
                                style={{
                                    height: 18,
                                    borderRadius: "0px 10px 10px 0px",
                                    minWidth: 20,
                                    fontSize: 9
                                }}
                                className={`btn m-0 p-0 ${alertEnabled ? "btn-success" : "btn-secondary"}`}
                                onClick={() => handleToggleAlert(true)}
                            >
                                Sí
                            </button>
                        </div>
                    </div>

                    {/* Campo de distancia (solo visible cuando está activado) */}
                    {alertEnabled && (
                        <div className="row align-items-center">
                            <div className="col-7">
                                <label
                                    htmlFor="deviationDistance"
                                    style={{ fontSize: '11px', margin: 0 }}
                                >
                                    Distancia de alerta
                                </label>
                            </div>
                            <div className="col-5">
                                <div className="d-flex align-items-center">
                                    <input
                                        type="number"
                                        id="deviationDistance"
                                        className="form-control"
                                        value={alertDistance}
                                        onChange={handleDistanceChange}
                                        min="10"
                                        max="1000"
                                        style={{
                                            fontSize: '10px',
                                            height: '22px',
                                            padding: '2px 5px',
                                            marginRight: '5px'
                                        }}
                                    />
                                    <span style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>
                                        metros
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mensaje informativo */}
                    {alertEnabled && (
                        <div className="row mt-2">
                            <div className="col-12">
                                <div
                                    style={{
                                        background: '#FFF3CD',
                                        border: '1px solid #FFE69C',
                                        borderRadius: '4px',
                                        padding: '8px',
                                        fontSize: '10px',
                                        color: '#856404'
                                    }}
                                >
                                    <i className="icon-info-circle" style={{ marginRight: '5px' }}></i>
                                    El conductor recibirá una alerta cuando se desvíe más de {alertDistance} metros de la ruta.
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}