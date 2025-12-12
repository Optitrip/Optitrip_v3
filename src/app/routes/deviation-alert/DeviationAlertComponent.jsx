import React, { useState, useEffect } from 'react';
import '../../../App.css';

export default function DeviationAlertComponent({ state, setState }) {
    const [isCardBodyOpen, setIsCardBodyOpen] = useState(state.isEditMode || false);
    const [alertEnabled, setAlertEnabled] = useState(state.deviationAlertEnabled || false);

    // Estado local para el valor del input (permite string vacío mientras se escribe)
    const [inputValue, setInputValue] = useState(state.deviationAlertDistance || 50);

    // Sincronizar el estado local si viene un valor nuevo desde las props (ej. al cargar ruta)
    useEffect(() => {
        if (state.deviationAlertDistance) {
            setInputValue(state.deviationAlertDistance);
            setAlertEnabled(state.deviationAlertEnabled);
        }
    }, [state.deviationAlertDistance, state.deviationAlertEnabled]);

    const handleToggleAlert = (enabled) => {
        setAlertEnabled(enabled);
        setState(prevState => ({
            ...prevState,
            deviationAlertEnabled: enabled,
            // Mantenemos el valor actual en el estado global
            deviationAlertDistance: enabled ? (parseInt(inputValue) || 50) : 50
        }));
    };

    // Maneja la escritura: solo permite números
    const handleInputChange = (e) => {
        const val = e.target.value;

        // Si está vacío, permitimos borrar todo temporalmente
        if (val === '') {
            setInputValue('');
            return;
        }

        // Expresión regular: solo permite dígitos (0-9)
        if (/^\d*$/.test(val)) {
            setInputValue(val);
        }
    };

    // Maneja la validación final cuando el usuario sale del input
    const handleBlur = () => {
        let finalValue = parseInt(inputValue);

        if (isNaN(finalValue)) {
            finalValue = 50; // Valor por defecto si estaba vacío
        } else if (finalValue < 10) {
            finalValue = 10; // Mínimo
        } else if (finalValue > 10000) {
            finalValue = 10000; // Máximo
        }

        setInputValue(finalValue);

        setState(prevState => ({
            ...prevState,
            deviationAlertDistance: finalValue
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
                <div className="card-body" style={{ background: '#E4E4E4', padding: '8px 15px' }}>
                    <div className="d-flex align-items-center justify-content-between">
                        {/* Lado Izquierdo: Switch y Texto */}
                        <div className="d-flex align-items-center">
                            <div style={{ display: 'flex', marginRight: '10px' }}>
                                <button
                                    style={{
                                        height: 18,
                                        borderRadius: "10px 0 0 10px",
                                        minWidth: 25,
                                        fontSize: 10,
                                        padding: 0,
                                        border: 'none',
                                        backgroundColor: !alertEnabled ? '#DC3545' : '#767676',
                                        color: 'white',
                                        fontWeight: 'bold'
                                    }}
                                    onClick={() => handleToggleAlert(false)}
                                >
                                    No
                                </button>
                                <button
                                    style={{
                                        height: 18,
                                        borderRadius: "0px 10px 10px 0px",
                                        minWidth: 25,
                                        fontSize: 10,
                                        padding: 0,
                                        border: 'none',
                                        backgroundColor: alertEnabled ? '#28a745' : '#767676',
                                        color: 'white',
                                        fontWeight: 'bold'
                                    }}
                                    onClick={() => handleToggleAlert(true)}
                                >
                                    Si
                                </button>
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: '500', color: '#333' }}>
                                Activar alerta
                            </span>
                        </div>

                        {/* Lado Derecho: Input y Metros (Visible solo si está activado) */}
                        {alertEnabled && (
                            <div className="d-flex align-items-center">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    className="form-control"
                                    style={{
                                        fontSize: '11px',
                                        height: '22px',
                                        width: '60px',
                                        padding: '2px 5px',
                                        textAlign: 'center',
                                        marginRight: '5px',
                                        border: '1px solid #ced4da',
                                        borderRadius: '4px',
                                        backgroundColor: '#fff'
                                    }}
                                />
                                <span style={{ fontSize: '11px', color: '#333' }}>
                                    metros
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}