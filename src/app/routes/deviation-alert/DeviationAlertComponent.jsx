import React, { useState, useEffect } from 'react';

export default function DeviationAlertComponent({ state, setState }) {
    const [isCardBodyOpen, setIsCardBodyOpen] = useState(state.isEditMode || false);
    const [alertEnabled, setAlertEnabled] = useState(state.deviationAlertEnabled || false);
    const [inputValue, setInputValue] = useState(state.deviationAlertDistance || 50);

    // Sincronizar el estado local si viene un valor nuevo desde las props
    useEffect(() => {
        if (state.deviationAlertDistance !== undefined) {
            setInputValue(state.deviationAlertDistance);
        }
        if (state.deviationAlertEnabled !== undefined) {
            setAlertEnabled(state.deviationAlertEnabled);
        }
    }, [state.deviationAlertDistance, state.deviationAlertEnabled]);

    const handleToggleAlert = (enabled) => {
        setAlertEnabled(enabled);

        if (enabled) {
            // Al activar, usa el valor actual del input (parseado)
            const currentValue = parseInt(inputValue) || 50;
            setState(prevState => ({
                ...prevState,
                deviationAlertEnabled: true,
                deviationAlertDistance: currentValue
            }));
        } else {
            // Al desactivar, solo cambia el flag
            setState(prevState => ({
                ...prevState,
                deviationAlertEnabled: false
            }));
        }
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
            finalValue = 50;
        } else if (finalValue < 10) {
            finalValue = 10;
        } else if (finalValue > 10000) {
            finalValue = 10000;
        }

        setInputValue(finalValue);

        // Actualizar el estado global (siempre, para mantener sincronización)
        setState(prevState => ({
            ...prevState,
            deviationAlertDistance: finalValue
        }));
    };

    return (
        <div style={{ marginTop: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}>
            <div style={{
                padding: '8px 15px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(#c6c6c6, #767676)',
                borderRadius: '4px 4px 0 0'
            }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
                    Alertas de desviación
                </span>
                <button
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '18px'
                    }}
                    onClick={() => setIsCardBodyOpen(!isCardBodyOpen)}
                >
                    {isCardBodyOpen ? '▲' : '▼'}
                </button>
            </div>

            {isCardBodyOpen && (
                <div style={{ background: '#E4E4E4', padding: '8px 15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {/* Lado Izquierdo: Switch y Texto */}
                        <div style={{ display: 'flex', alignItems: 'center' }}>
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
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
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
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => handleToggleAlert(true)}
                                >
                                    Sí
                                </button>
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: '500', color: '#333' }}>
                                Activar alerta
                            </span>
                        </div>

                        {/* Lado Derecho: Input y Metros */}
                        {alertEnabled && (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
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