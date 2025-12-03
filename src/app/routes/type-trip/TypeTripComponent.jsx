import React, { useState, useEffect, useRef } from 'react';
import '../../../App.css';

export default function TypeTripComponent({ state, setState }) {
    const [isCardBodyOpen, setIsCardBodyOpen] = useState(state.isEditMode || false);
    const [activeMode, setActiveMode] = useState(state.mode || null);
    const [traffic, setTraffic] = useState(state.traffic || 'default');  // Cambiado a 'default' como valor inicial
    const setStateRef = useRef(setState);

    useEffect(() => {
        setStateRef.current(prevState => ({ ...prevState, traffic: traffic }));
    }, [traffic]);

    useEffect(() => {
        setActiveMode(state.mode);
    }, [state.mode]);

    const handleButtonClick = (mode) => {
        setActiveMode(mode);
        setStateRef.current(prevState => ({ ...prevState, mode: mode }));
    };

    const getButtonStyle = (mode) => ({
        backgroundColor: activeMode === mode ? '#007bff' : 'transparent',
        color: activeMode === mode ? 'white' : 'inherit'
    });

    const handleCustomButtonClick = (trafficStatus) => {
        setTraffic(trafficStatus);
        setStateRef.current(prevState => ({
            ...prevState,
            traffic: trafficStatus,
        }));
    };

    return (
        <div className="card mt-2">
            <div className="card-header card-module" style={{ padding: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                <span style={{ position: 'absolute', left: '24.5%' }}>Selecciona el tipo de viaje</span>
                <button className="btn ml-auto mr-2 custom-btn" style={{ padding: 0 }} onClick={() => setIsCardBodyOpen(!isCardBodyOpen)}>
                    {isCardBodyOpen ? <i className="icon-circle-up"></i> : <i className="icon-circle-down"></i>}
                </button>
            </div>

            {isCardBodyOpen && (
                <div className="card-body" style={{ background: '#E4E4E4', padding: 1 }}>
                    <div className="text-center pt-2 pb-2">
                        <button
                            className="btn mx-5 p-0 custom-btn-trip"
                            onClick={() => handleButtonClick('fast')}
                            style={getButtonStyle('fast')}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <i className="icon-icono-rapido" style={{ fontSize: 35, color: activeMode === 'fast' ? 'white' : 'inherit' }}></i>
                                <span className='btn-title' style={{ color: activeMode === 'fast' ? 'white' : 'inherit' }}>Rápido</span>
                            </div>
                        </button>
                        <button
                            className="btn mx-5 p-0 custom-btn-trip"
                            onClick={() => handleButtonClick('short')}
                            style={getButtonStyle('short')}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <i className="icon-icono-corto" style={{ fontSize: 35, color: activeMode === 'short' ? 'white' : 'inherit' }}></i>
                                <span className='btn-title' style={{ color: activeMode === 'short' ? 'white' : 'inherit' }}>Corto</span>
                            </div>
                        </button>
                    </div>
                    <div className='text-right mt-2 mb-2 mr-2'>
                        <span className="m-0 pr-2" style={{ marginLeft: 5, fontSize: 11 }}>
                            Optimizar ruta para el tráfico
                        </span>
                        <button
                            style={{ height: 18, borderRadius: "10px 0 0 10px", minWidth: 20, fontSize: 9 }}
                            className={`btn m-0 p-0 ${state.traffic === "disabled" ? "btn-danger" : "btn-secondary"}`}
                            onClick={() => handleCustomButtonClick('disabled')}>
                            No
                        </button>
                        <button
                            style={{ height: 18, borderRadius: "0px 10px 10px 0px", minWidth: 20, fontSize: 9 }}
                            className={`btn m-0 p-0 ${state.traffic === "default" ? "btn-success" : "btn-secondary"}`}
                            onClick={() => handleCustomButtonClick('default')}>
                            Si
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
