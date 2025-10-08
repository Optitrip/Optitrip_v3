import React, { useState, useEffect } from 'react';
import '../../../App.css';
import { Modal, Button } from 'react-bootstrap';

export default function SelectVehiclesComponent({ state, setState }) {
    const [isCardBodyOpen, setIsCardBodyOpen] = useState(false);
    const [activeButton, setActiveButton] = useState(state.activeVehicleButton || null);
    const [showModal, setShowModal] = useState(false);
    const [selectedAxles, setSelectedAxles] = useState(state.number_of_axles || '2');
    const [typeOfTruck, setTypeOfTruck] = useState(state.type_of_truck || 'tractor');
    const [numberOfTrailers, setNumberOfTrailers] = useState(state.number_of_trailers || '1');

    useEffect(() => {
        setActiveButton(state.activeVehicleButton);
    }, [state.activeVehicleButton]);

    useEffect(() => {
        // Inicializar tooltips
        const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltips.forEach(tooltip => new bootstrap.Tooltip(tooltip));
    }, []);

    const handleButtonClick = (buttonType, transportationValue) => {
        setActiveButton(buttonType);
        setState(prevState => ({ ...prevState, activeVehicleButton: buttonType, transportation: transportationValue }));
        if (buttonType === 'camion') {
            setShowModal(true);
        }
    };

    const handleModalClose = () => setShowModal(false);

    const handleSave = () => {
        const axlesString = selectedAxles ? selectedAxles.toString() : '';
        const typeOfTruckString = typeOfTruck ? typeOfTruck.toString() : '';
        const numberOfTrailersString = numberOfTrailers ? numberOfTrailers.toString() : '';

        setState(prevState => ({
            ...prevState,
            number_of_axles: axlesString,
            type_of_truck: typeOfTruckString,
            number_of_trailers: numberOfTrailersString
        }));
        handleModalClose();
    };

    const handleAxleSelection = (axles) => {
        setSelectedAxles(axles);
    };

    const handleTypeOfTruckChange = (event) => {
        setTypeOfTruck(event.target.value);
    };

    const handleNumberOfTrailersChange = (event) => {
        setNumberOfTrailers(event.target.value);
    };

    const getButtonStyle = (buttonType) => ({
        backgroundColor: activeButton === buttonType ? '#007bff' : 'transparent',
        color: activeButton === buttonType ? 'white' : 'inherit'
    });

    const getColStyle = (axles) => ({
        backgroundColor: selectedAxles === axles ? '#007bff' : 'transparent',
        color: selectedAxles === axles ? 'white' : 'inherit',
        cursor: 'pointer',
        padding: '10px',
    });

    const getSpanStyle = (axles) => ({
        color: selectedAxles === axles ? 'white' : 'black'
    });

    return (
        <>
            <div className="card mt-2">
                <div className="card-header card-module" style={{ padding: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '28%' }}>Selecciona tu vehículo</span>
                    <button className="btn ml-auto mr-2 custom-btn" style={{ padding: 0 }} onClick={() => setIsCardBodyOpen(!isCardBodyOpen)}>
                        {isCardBodyOpen ? <i className="icon-circle-up"></i> : <i className="icon-circle-down"></i>}
                    </button>
                </div>
                {isCardBodyOpen && (
                    <div className="card-body" style={{ background: '#E4E4E4', padding: 1 }}>
                        <div className="text-center mt-2 mb-2">
                            <button
                                className="btn mx-1 p-2 custom-btn-vehicles"
                                onClick={() => handleButtonClick('auto', 'car')}
                                style={getButtonStyle('auto')}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <i className="icon-icono-auto" style={{ fontSize: 23, color: activeButton === 'auto' ? 'white' : 'inherit' }}></i>
                                    <span className='btn-title' style={{ color: activeButton === 'auto' ? 'white' : 'inherit' }}>Auto</span>
                                </div>
                            </button>
                            <span className="d-inline-block" data-bs-toggle="tooltip" title="Opción no disponible">
                                <button
                                    className="btn mx-1 p-2 custom-btn-vehicles"
                                    type="button"
                                    disabled
                                    style={{ cursor: 'not-allowed' }}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <i className="icon-icono-motocicleta" style={{ fontSize: 23, color: 'inherit' }}></i>
                                        <span className='btn-title' style={{ color: 'inherit' }}>Moto</span>
                                    </div>
                                </button>
                            </span>
                            <button
                                className="btn mx-1 p-2 custom-btn-vehicles"
                                onClick={() => handleButtonClick('camion', 'truck')}
                                style={getButtonStyle('camion')}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <i className="icon-Icono-camion" style={{ fontSize: 23, color: activeButton === 'camion' ? 'white' : 'inherit' }}></i>
                                    <span className='btn-title' style={{ color: activeButton === 'camion' ? 'white' : 'inherit' }}>Camión</span>
                                </div>
                            </button>
                            <span className="d-inline-block" data-bs-toggle="tooltip" title="Opción no disponible">
                                <button
                                    className="btn mx-1 p-2 custom-btn-vehicles"
                                    type="button"
                                    disabled
                                    style={{ cursor: 'not-allowed' }}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <i className="icon-icono-autobus" style={{ fontSize: 23, color: 'inherit' }}></i>
                                        <span className='btn-title' style={{ color: 'inherit' }}>Autobús</span>
                                    </div>
                                </button>
                            </span>
                            <span className="d-inline-block" data-bs-toggle="tooltip" title="Opción no disponible">
                                <button
                                    className="btn mx-1 p-2 custom-btn-vehicles"
                                    type="button"
                                    disabled
                                    style={{ cursor: 'not-allowed' }}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <i className="icon-icono-peaton" style={{ fontSize: 23, color: 'inherit' }}></i>
                                        <span className='btn-title' style={{ color: 'inherit' }}>Peatón</span>
                                    </div>
                                </button>
                            </span>
                        </div>
                    </div>
                )}
                <Modal show={showModal} onHide={handleModalClose}>
                    <Modal.Header className='custom-header-modal py-1' style={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }} closeButton={false}>
                        <Modal.Title className='p-0' id="title-edition-destination">Selecciona tipo de camión</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="card text-center" style={{ background: 'rgba(140, 149, 160, 0.2)' }}>
                            <div className="card-body p-3">
                                <div className="row">
                                    <div className="col-lg-12 col-md-12 col-sm-12 col-12">
                                        <span className='custom-text'>Seleccione el tipo de vehículo</span>
                                        <div className="card" style={{ background: '#D9D9D9' }}>
                                            <div className="col-12 p-0 mt-2 mb-2">
                                                <div className="row align-items-center">
                                                    <div className="col-5"></div>
                                                    <div className="col-3">
                                                        <span className="text-modal">Ejes</span>
                                                    </div>
                                                    <div className="col-4">
                                                        <span className="text-modal">Llantas</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-12" style={getColStyle(2)} onClick={() => handleAxleSelection(2)}>
                                                <div className="row align-items-center">
                                                    <div className="col-5 px-0">
                                                        <i className="icon-eje1" style={{ fontSize: 13 }}></i>
                                                    </div>
                                                    <div className="col-3">
                                                        <span className="text-modal" style={getSpanStyle(2)}>2</span>
                                                    </div>
                                                    <div className="col-4">
                                                        <span className="text-modal" style={getSpanStyle(2)}>6</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-12" style={getColStyle(3)} onClick={() => handleAxleSelection(3)}>
                                                <div className="row align-items-center">
                                                    <div className="col-5 px-0">
                                                        <i className="icon-eje2" style={{ fontSize: 14 }}></i>
                                                    </div>
                                                    <div className="col-3">
                                                        <span className="text-modal" style={getSpanStyle(3)}>3</span>
                                                    </div>
                                                    <div className="col-4">
                                                        <span className="text-modal" style={getSpanStyle(3)}>10</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-12" style={getColStyle(4)} onClick={() => handleAxleSelection(4)}>
                                                <div className="row align-items-center">
                                                    <div className="col-5 px-0">
                                                        <i className="icon-eje3" style={{ fontSize: 13 }}></i>
                                                    </div>
                                                    <div className="col-3">
                                                        <span className="text-modal" style={getSpanStyle(4)}>4</span>
                                                    </div>
                                                    <div className="col-4">
                                                        <span className="text-modal" style={getSpanStyle(4)}>14</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-12" style={getColStyle(5)} onClick={() => handleAxleSelection(5)}>
                                                <div className="row align-items-center">
                                                    <div className="col-5">
                                                        <i className="icon-eje4" style={{ fontSize: 15 }}></i>
                                                    </div>
                                                    <div className="col-3">
                                                        <span className="text-modal" style={getSpanStyle(5)}>5</span>
                                                    </div>
                                                    <div className="col-4">
                                                        <span className="text-modal" style={getSpanStyle(5)}>18</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-12" style={getColStyle(6)} onClick={() => handleAxleSelection(6)}>
                                                <div className="row align-items-center">
                                                    <div className="col-5">
                                                        <i className="icon-eje5" style={{ fontSize: 14 }}></i>
                                                    </div>
                                                    <div className="col-3">
                                                        <span className="text-modal" style={getSpanStyle(6)}>6</span>
                                                    </div>
                                                    <div className="col-4">
                                                        <span className="text-modal" style={getSpanStyle(6)}>22</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-12" style={getColStyle(7)} onClick={() => handleAxleSelection(7)}>
                                                <div className="row align-items-center">
                                                    <div className="col-5">
                                                        <i className="icon-eje6" style={{ fontSize: 25 }}></i>
                                                    </div>
                                                    <div className="col-3 mb-2">
                                                        <span className="text-modal" style={getSpanStyle(7)}>7</span>
                                                    </div>
                                                    <div className="col-4 mb-2">
                                                        <span className="text-modal" style={getSpanStyle(7)}>26</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-12" style={getColStyle(8)} onClick={() => handleAxleSelection(8)}>
                                                <div className="row align-items-center">
                                                    <div className="col-5">
                                                        <i className="icon-eje7" style={{ fontSize: 24 }}></i>
                                                    </div>
                                                    <div className="col-3 mb-1">
                                                        <span className="text-modal" style={getSpanStyle(8)}>8</span>
                                                    </div>
                                                    <div className="col-4 mb-1">
                                                        <span className="text-modal" style={getSpanStyle(8)}>30</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-12" style={getColStyle(9)} onClick={() => handleAxleSelection(9)}>
                                                <div className="row align-items-center">
                                                    <div className="col-5">
                                                        <i className="icon-eje8" style={{ fontSize: 24 }}></i>
                                                    </div>
                                                    <div className="col-3 mb-1">
                                                        <span className="text-modal" style={getSpanStyle(9)}>9</span>
                                                    </div>
                                                    <div className="col-4 mb-1">
                                                        <span className="text-modal" style={getSpanStyle(9)}>34</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12 mt-3">
                                        <span className='custom-text'>Tipo de camión</span>
                                        <select
                                            className="form-control pl-1 p-0"
                                            value={typeOfTruck}
                                            onChange={handleTypeOfTruckChange}
                                        >
                                            <option value="tractor">Tractor</option>
                                            <option value="straightTruck">Rígido</option>
                                        </select>
                                    </div>
                                    <div className="col-12 mt-3">
                                        <span className='custom-text'>Número de remolques</span>
                                        <select
                                            className="form-control pl-1 p-0"
                                            value={numberOfTrailers}
                                            onChange={handleNumberOfTrailersChange}
                                        >
                                            <option value="1">Simple</option>
                                            <option value="2">Doble</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='text-center mt-3'>
                            <Button variant="danger" className='mx-5' onClick={handleModalClose} style={{ fontSize: 15, fontWeight: '600' }}>
                                Cancelar
                            </Button>
                            <Button className='mx-5' onClick={handleSave} style={{ fontSize: 15, fontWeight: '600', backgroundColor: '#007BFF', color: '#FFFFFF' }}>
                                Guardar
                            </Button>
                        </div>
                    </Modal.Body>
                </Modal>

                {/* <Modal show={showModal} onHide={handleModalClose} dialogClassName='modal-xl'>
                <Modal.Header className='custom-header-modal py-1' style={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }} closeButton={false}>
                    <Modal.Title className='p-0' id="title-edition-destination">Agregar un nuevo vehículo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="card text-center" style={{ background: 'rgba(140, 149, 160, 0.2)' }}>
                        <div className="card-body pb-1">
                            <div className="row">
                                <div className="col-lg-3 col-md-12 col-sm-12 col-12">
                                    <div className="d-flex align-items-center mt-1 mb-4">
                                        <label htmlFor="txtNameVehicle" className="mr-2 mb-0 text-modal">Nombre</label>
                                        <input type="text" id="txtNameVehicle" className="form-control" style={{ flex: '1', height: 20 }} />
                                    </div>
                                    <span className='custom-text'>Seleccione el tipo de vehículo</span>
                                    <div className="card" style={{ background: '#D9D9D9' }}>
                                        <div className="col-12 p-0 mt-2">
                                            <div className="row align-items-center">
                                                <div className="col-5"></div>
                                                <div className="col-3">
                                                    <span className="text-modal">Ejes</span>
                                                </div>
                                                <div className="col-4">
                                                    <span className="text-modal">Llantas</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 p-0">
                                            <div className="row align-items-center">
                                                <div className="col-5">
                                                    <button className="btn pl-3 p-0 custom-btn">
                                                        <i className="icon-icono-car" style={{ fontSize: 35, marginRight: 5 }}></i>
                                                        <i className="icon-icono-camioneta" style={{ fontSize: 35 }}></i>
                                                    </button>
                                                </div>
                                                <div className="col-3">
                                                    <span className="text-modal">2</span>
                                                </div>
                                                <div className="col-4">
                                                    <span className="text-modal">4</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 p-0">
                                            <div className="row align-items-center">
                                                <div className="col-5 px-0">
                                                    <button className="btn custom-btn" style={{ paddingRight: 36 }}>
                                                        <i className="icon-eje1" style={{ fontSize: 15.5 }}></i>
                                                    </button>
                                                </div>
                                                <div className="col-3" style={{ marginBottom: 7 }}>
                                                    <span className="text-modal">2</span>
                                                </div>
                                                <div className="col-4" style={{ marginBottom: 7 }}>
                                                    <span className="text-modal">6</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 p-0">
                                            <div className="row align-items-center">
                                                <div className="col-5 px-0">
                                                    <button className="btn mx-1 custom-btn" style={{ paddingRight: 36 }}>
                                                        <i className="icon-eje2" style={{ fontSize: 15.5 }}></i>
                                                    </button>
                                                </div>
                                                <div className="col-3" style={{ marginBottom: 7 }}>
                                                    <span className="text-modal">3</span>
                                                </div>
                                                <div className="col-4" style={{ marginBottom: 7 }}>
                                                    <span className="text-modal">10</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 p-0 mt-1 mb-1">
                                            <div className="row align-items-center">
                                                <div className="col-5" style={{ paddingRight: 27 }}>
                                                    <button className="btn custom-btn">
                                                        <i className="icon-eje3" style={{ fontSize: 16.5 }}></i>
                                                    </button>
                                                </div>
                                                <div className="col-3" style={{ marginBottom: 7 }}>
                                                    <span className="text-modal">4</span>
                                                </div>
                                                <div className="col-4" style={{ marginBottom: 7 }}>
                                                    <span className="text-modal">16</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 p-0 mt-1 mb-1">
                                            <div className="row align-items-center">
                                                <div className="col-5" style={{ paddingRight: 28 }}>
                                                    <button className="btn mx-1 custom-btn">
                                                        <i className="icon-eje4" style={{ fontSize: 17 }}></i>
                                                    </button>
                                                </div>
                                                <div className="col-3" style={{ marginBottom: 7 }}>
                                                    <span className="text-modal">5</span>
                                                </div>
                                                <div className="col-4" style={{ marginBottom: 7 }}>
                                                    <span className="text-modal">18</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 p-0 mt-1 mb-1">
                                            <div className="row align-items-center">
                                                <div className="col-5" style={{ paddingRight: 34 }}>
                                                    <button className="btn pl-3 p-0 custom-btn">
                                                        <i className="icon-eje5" style={{ fontSize: 19 }}></i>
                                                    </button>
                                                </div>
                                                <div className="col-3" style={{ marginBottom: 7 }}>
                                                    <span className="text-modal">6</span>
                                                </div>
                                                <div className="col-4" style={{ marginBottom: 7 }}>
                                                    <span className="text-modal">22</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 p-0">
                                            <div className="row align-items-center">
                                                <div className="col-5">
                                                    <button className="btn pl-3 p-0 custom-btn">
                                                        <i className="icon-eje6" style={{ fontSize: 30 }}></i>
                                                    </button>
                                                </div>
                                                <div className="col-3 mb-2">
                                                    <span className="text-modal">7</span>
                                                </div>
                                                <div className="col-4 mb-2">
                                                    <span className="text-modal">26</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 p-0">
                                            <div className="row align-items-center">
                                                <div className="col-5">
                                                    <button className="btn pl-3 p-0 custom-btn">
                                                        <i className="icon-eje7" style={{ fontSize: 30 }}></i>
                                                    </button>
                                                </div>
                                                <div className="col-3 mb-1">
                                                    <span className="text-modal">8</span>
                                                </div>
                                                <div className="col-4 mb-1">
                                                    <span className="text-modal">30</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 p-0">
                                            <div className="row align-items-center">
                                                <div className="col-5">
                                                    <button className="btn pl-3 p-0 custom-btn">
                                                        <i className="icon-eje8" style={{ fontSize: 30 }}></i>
                                                    </button>
                                                </div>
                                                <div className="col-3 mb-1">
                                                    <span className="text-modal">9</span>
                                                </div>
                                                <div className="col-4 mb-1">
                                                    <span className="text-modal">34</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-3 col-md-12 col-sm-12 col-12" style={{ paddingLeft: '15px' }}>
                                    <span className='custom-text'>Dimensiones</span>
                                    <div className="card" style={{ background: '#D9D9D9', marginBottom: 9 }}>
                                        <div className="row pt-1">
                                            <div className="col-4 p-0">
                                                <label htmlFor="txtHeight" className="text-modal-3">Alto</label>
                                            </div>
                                            <div className="col-5 p-0">
                                                <input type="text" id="txtHeight" className="form-control" style={{ flex: '1', height: 15, fontSize: 10 }} />
                                            </div>
                                            <div className="col-2 p-0">
                                                <label htmlFor="txtHeight" className='text-modal-3'>mts</label>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-4 p-0">
                                                <label htmlFor="txtWidth" className="text-modal-3">Ancho</label>
                                            </div>
                                            <div className="col-5 p-0">
                                                <input type="text" id="txtWidth" className="form-control" style={{ flex: '1', height: 15, fontSize: 10 }} />
                                            </div>
                                            <div className="col-2 p-0">
                                                <label htmlFor="txtWidth" className='text-modal-3'>mts</label>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-4 p-0">
                                                <label htmlFor="txtLength" className="text-modal-3">Largo</label>
                                            </div>
                                            <div className="col-5 p-0">
                                                <input type="text" id="txtLength" className="form-control" style={{ flex: '1', height: 15, fontSize: 10 }} />
                                            </div>
                                            <div className="col-2 p-0">
                                                <label htmlFor="txtLength" className='text-modal-3'>mts</label>
                                            </div>
                                        </div>
                                        <div className="row pb-0">
                                            <div className="col-4 p-0">
                                                <label htmlFor="txtWeight" className="text-modal-3">Peso</label>
                                            </div>
                                            <div className="col-5 p-0">
                                                <input type="text" id="txtWeight" className="form-control" style={{ flex: '1', height: 15, fontSize: 10 }} />
                                            </div>
                                            <div className="col-2 p-0">
                                                <label htmlFor="txtWeight" className='text-modal-3'>tons</label>
                                            </div>
                                        </div>
                                    </div>
                                    <span className='custom-text' style={{ marginBottom: 1 }}>Combustible</span>
                                    <div className="card mb-3" style={{ background: '#D9D9D9' }}>
                                        <div className="row">
                                            <div className="col-6 p-0 mt-1">
                                                <label htmlFor="txtHeight" className="text-modal-3">Km/L cargado</label>
                                            </div>
                                            <div className="col-3 p-0 mt-1">
                                                <input type="text" id="txtHeight" className="form-control" style={{ flex: '1', height: 15, fontSize: 10 }} />
                                            </div>
                                            <div className="col-2 p-0 mt-1">
                                                <label htmlFor="txtHeight" className='text-modal-3'>mts</label>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-6 p-0">
                                                <label htmlFor="txtWidth" className="text-modal-3">Km/L vacío</label>
                                            </div>
                                            <div className="col-3 p-0">
                                                <input type="text" id="txtWidth" className="form-control" style={{ flex: '1', height: 15, fontSize: 10 }} />
                                            </div>
                                            <div className="col-2 p-0">
                                                <label htmlFor="txtWidth" className='text-modal-3'>km/l</label>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-6 p-0">
                                                <label htmlFor="txtLength" className="text-modal-3">Costo por litro</label>
                                            </div>
                                            <div className="col-3 p-0">
                                                <input type="text" id="txtLength" className="form-control" style={{ flex: '1', height: 15, fontSize: 10 }} />
                                            </div>
                                            <div className="col-2 p-0">
                                                <label htmlFor="txtLength" className='text-modal-3'>$</label>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-6 p-0">
                                                <label htmlFor="txtWeight" className="text-modal-3">Capacidad tanque</label>
                                            </div>
                                            <div className="col-3 p-0">
                                                <input type="text" id="txtWeight" className="form-control" style={{ flex: '1', height: 15, fontSize: 10 }} />
                                            </div>
                                            <div className="col-2 p-0">
                                                <label htmlFor="txtWeight" className='text-modal-3'>litros</label>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-6 p-0">
                                                <label htmlFor="txtWeight" className="text-modal-3">Tiempo recarga</label>
                                            </div>
                                            <div className="col-3 p-0">
                                                <input type="text" id="txtWeight" className="form-control" style={{ flex: '1', height: 15, fontSize: 10 }} />
                                            </div>
                                            <div className="col-2 p-0">
                                                <label htmlFor="txtWeight" className='text-modal-3'>mins</label>
                                            </div>
                                        </div>
                                    </div>
                                    <span className='custom-text' style={{ marginBottom: 1 }}>Velocidad máxima permitida</span>
                                    <div className="card mb-3" style={{ background: '#D9D9D9' }}>
                                        <div className="row" style={{ marginTop: 4 }}>
                                            <div className="col-4 p-0">
                                                <label htmlFor="txtHeight" className="text-modal-3">Velocidad</label>
                                            </div>
                                            <div className="col-5 p-0">
                                                <input type="text" id="txtHeight" className="form-control" style={{ flex: '1', height: 15, fontSize: 10 }} />
                                            </div>
                                            <div className="col-2 p-0">
                                                <label htmlFor="txtHeight" className='text-modal-3'>km/h</label>
                                            </div>
                                        </div>
                                    </div>
                                    <span className='custom-text' style={{ marginBottom: 1 }}>Descansos</span>
                                    <div className="card mb-3" style={{ background: '#D9D9D9' }}>
                                        <div className="col-12 p-0 mt-1" style={{ display: 'flex', justifyContent: 'center' }}>
                                            <label htmlFor="txtHeight1" className="text-modal-3" style={{ marginLeft: '5px', marginRight: '5px', flex: 'none' }}>Cada</label>
                                            <input type="text" id="txtHeight1" className="form-control" style={{ flex: '1', height: 15, fontSize: 10, marginRight: '5px' }} />
                                            <label htmlFor="txtHeight2" className="text-modal-3" style={{ marginRight: '5px', flex: 'none' }}>hrs,</label>
                                            <label htmlFor="txtHeight3" className="text-modal-3" style={{ marginRight: '5px', flex: 'none' }}>descansar</label>
                                            <input type="text" id="txtHeight2" className="form-control" style={{ flex: '1', height: 15, fontSize: 10, marginRight: '5px' }} />
                                            <label htmlFor="txtHeight4" className="text-modal-3" style={{ marginRight: '5px', flex: 'none' }}>hrs</label>
                                        </div>
                                        <div className="col-12 p-0" style={{ display: 'flex', justifyContent: 'center' }}>
                                            <label htmlFor="txtHeight1" className="text-modal-3" style={{ marginLeft: '5px', marginRight: '5px', flex: 'none' }}>Costo de cada descanso</label>
                                            <input type="text" id="txtHeight1" className="form-control" style={{ flex: '1', height: 15, fontSize: 10, marginRight: '5px' }} />
                                            <label htmlFor="txtHeight2" className="text-modal-3" style={{ marginRight: '5px', flex: 'none' }}>$</label>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-3 col-md-12 col-sm-12 col-12" style={{ paddingLeft: '15px' }}>
                                    <span className='custom-text' style={{ marginBottom: 1 }}>Llantas</span>
                                    <div className="card mb-3" style={{ background: '#D9D9D9' }}>
                                        <div className="row mt-2 mb-1">
                                            <div className="col-4 p-0"></div>
                                            <div className="col-2 p-0">
                                                <label htmlFor="txtWidth" className='text-modal-4'>Arrastre</label>
                                            </div>
                                            <div className="col-2 p-0">
                                                <label htmlFor="txtWidth" className='text-modal-4'>Tracción</label>
                                            </div>
                                            <div className="col-2 p-0">
                                                <label htmlFor="txtWidth" className='text-modal-4'>Dirección</label>
                                            </div>
                                        </div>
                                        <div className="row mb-2 align-items-center">
                                            <div className="col-4 pt-1">
                                                <label htmlFor="txtHeight" className="text-modal-4"># de llantas</label>
                                            </div>
                                            <div className="col-2 p-0">
                                                <input type="text" id="txtHeight" className="form-control" style={{ flex: '1', height: 27, fontSize: 12 }} />
                                            </div>
                                            <div className="col-2 p-0">
                                                <input type="text" id="txtHeight" className="form-control" style={{ flex: '1', height: 27, fontSize: 12 }} />
                                            </div>
                                            <div className="col-2 p-0">
                                                <input type="text" id="txtHeight" className="form-control" style={{ flex: '1', height: 27, fontSize: 12 }} />
                                            </div>
                                            <div className="col-1 pt-1">
                                                <label htmlFor="txtWidth" className='text-modal-4'>kms</label>
                                            </div>
                                        </div>
                                        <div className="row mb-2 align-items-center">
                                            <div className="col-4 pt-1">
                                                <label htmlFor="txtHeight" className="text-modal-3">Vida útil</label>
                                            </div>
                                            <div className="col-2 p-0">
                                                <input type="text" id="txtHeight" className="form-control" style={{ flex: '1', height: 27, fontSize: 12 }} />
                                            </div>
                                            <div className="col-2 p-0">
                                                <input type="text" id="txtHeight" className="form-control" style={{ flex: '1', height: 27, fontSize: 12 }} />
                                            </div>
                                            <div className="col-2 p-0">
                                                <input type="text" id="txtHeight" className="form-control" style={{ flex: '1', height: 27, fontSize: 12 }} />
                                            </div>
                                            <div className="col-1 pt-1">
                                                <label htmlFor="txtWidth" className='text-modal-3'>kms</label>
                                            </div>
                                        </div>
                                        <div className="row mb-2 align-items-center">
                                            <div className="col-4 pt-1">
                                                <label htmlFor="txtHeight" className="text-modal-3">$ por llanta</label>
                                            </div>
                                            <div className="col-2 p-0">
                                                <input type="text" id="txtHeight" className="form-control" style={{ flex: '1', height: 27, fontSize: 12 }} />
                                            </div>
                                            <div className="col-2 p-0">
                                                <input type="text" id="txtHeight" className="form-control" style={{ flex: '1', height: 27, fontSize: 12 }} />
                                            </div>
                                            <div className="col-2 p-0">
                                                <input type="text" id="txtHeight" className="form-control" style={{ flex: '1', height: 27, fontSize: 12 }} />
                                            </div>
                                            <div className="col-1 pt-1">
                                                <label htmlFor="txtWidth" className='text-modal-3'>$</label>
                                            </div>
                                        </div>
                                    </div>
                                    <span className='custom-text' style={{ marginBottom: 3 }}>Tipo de camión</span>
                                    <div className="card mb-3" style={{ background: '#D9D9D9' }}>
                                        <div className="row mt-2 mb-2">
                                            <div className="col-12 px-4">
                                                <select className="form-control pl-1 p-0" style={{ height: 15, fontSize: 10 }}>
                                                    <option disabled selected className='text-modal-3'>Selecciona una opción</option>
                                                    <option value="option1">Tractor</option>
                                                    <option value="option2">Rígido</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <span className='custom-text' style={{ marginBottom: 3 }}>Costos fijos mensuales</span>
                                    <div className="card" style={{ background: '#D9D9D9' }}>
                                        <div className="row mt-2 mb-1">
                                            <div className="col-5 p-0 ">
                                                <label htmlFor="txtHeight" className="text-modal-3">Seguro</label>
                                            </div>
                                            <div className="col-5 p-0">
                                                <input type="text" id="txtHeight" className="form-control" style={{ flex: '1', height: 18, fontSize: 10 }} />
                                            </div>
                                            <div className="col-1 p-0">
                                                <label htmlFor="txtHeight" className='text-modal-3'>$</label>
                                            </div>
                                        </div>
                                        <div className="row mb-1">
                                            <div className="col-5 p-0">
                                                <label htmlFor="txtWidth" className="text-modal-3">Impuestos</label>
                                            </div>
                                            <div className="col-5 p-0">
                                                <input type="text" id="txtWidth" className="form-control" style={{ flex: '1', height: 18, fontSize: 10 }} />
                                            </div>
                                            <div className="col-1 p-0">
                                                <label htmlFor="txtWidth" className='text-modal-3'>$</label>
                                            </div>
                                        </div>
                                        <div className="row mb-1">
                                            <div className="col-5 p-0">
                                                <label htmlFor="txtLength" className="text-modal-3">Reparaciones</label>
                                            </div>
                                            <div className="col-5 p-0">
                                                <input type="text" id="txtLength" className="form-control" style={{ flex: '1', height: 18, fontSize: 10 }} />
                                            </div>
                                            <div className="col-1 p-0">
                                                <label htmlFor="txtLength" className='text-modal-3'>$</label>
                                            </div>
                                        </div>
                                        <div className="row mb-1">
                                            <div className="col-5 p-0">
                                                <label htmlFor="txtWeight" className="text-modal-3">Administración</label>
                                            </div>
                                            <div className="col-5 p-0">
                                                <input type="text" id="txtWeight" className="form-control" style={{ flex: '1', height: 18, fontSize: 10 }} />
                                            </div>
                                            <div className="col-1 p-0">
                                                <label htmlFor="txtWeight" className='text-modal-3'>$</label>
                                            </div>
                                        </div>
                                        <div className="row mb-2">
                                            <div className="col-5 p-0">
                                                <label htmlFor="txtWeight" className="text-modal-3">Otros</label>
                                            </div>
                                            <div className="col-5 p-0">
                                                <input type="text" id="txtWeight" className="form-control" style={{ flex: '1', height: 18, fontSize: 10 }} />
                                            </div>
                                            <div className="col-1 p-0">
                                                <label htmlFor="txtWeight" className='text-modal-3'>$</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-3 col-md-12 col-sm-12 col-12" style={{ paddingLeft: '15px' }}>
                                    <span className='custom-text' style={{ marginBottom: 1 }}>Pago de chofer</span>
                                    <div className="card mb-3" style={{ background: '#D9D9D9' }}>
                                        <div className="row">
                                            <div className="col-6 p-0 mt-1">
                                                <label htmlFor="txtHeight" className="text-modal-3">Por hora</label>
                                            </div>
                                            <div className="col-4 p-0 mt-1">
                                                <input type="text" id="txtHeight" className="form-control" style={{ flex: '1', height: 17, fontSize: 10 }} />
                                            </div>
                                            <div className="col-1 p-0 mt-1">
                                                <label htmlFor="txtHeight" className='text-modal-3'>$</label>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-6 p-0">
                                                <label htmlFor="txtWidth" className="text-modal-3">Por km vacío</label>
                                            </div>
                                            <div className="col-4 p-0">
                                                <input type="text" id="txtWidth" className="form-control" style={{ flex: '1', height: 17, fontSize: 10 }} />
                                            </div>
                                            <div className="col-1 p-0">
                                                <label htmlFor="txtWidth" className='text-modal-3'>$</label>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-6 p-0">
                                                <label htmlFor="txtLength" className="text-modal-3">Por km cargado</label>
                                            </div>
                                            <div className="col-4 p-0">
                                                <input type="text" id="txtLength" className="form-control" style={{ flex: '1', height: 17, fontSize: 10 }} />
                                            </div>
                                            <div className="col-1 p-0">
                                                <label htmlFor="txtLength" className='text-modal-3'>$</label>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-6 p-0">
                                                <label htmlFor="txtWeight" className="text-modal-3">Pago fijo por mes</label>
                                            </div>
                                            <div className="col-4 p-0">
                                                <input type="text" id="txtWeight" className="form-control" style={{ flex: '1', height: 17, fontSize: 10 }} />
                                            </div>
                                            <div className="col-1 p-0">
                                                <label htmlFor="txtWeight" className='text-modal-3'>$</label>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-6 p-0">
                                                <label htmlFor="txtWeight" className="text-modal-3">% por ruta</label>
                                            </div>
                                            <div className="col-4 p-0">
                                                <input type="text" id="txtWeight" className="form-control" style={{ flex: '1', height: 17, fontSize: 10 }} />
                                            </div>
                                            <div className="col-1 p-0">
                                                <label htmlFor="txtWeight" className='text-modal-3'>%</label>
                                            </div>
                                        </div>
                                    </div>
                                    <span className='custom-text' style={{ marginBottom: 2 }}>Mantenimiento</span>
                                    <div className="card mb-3" style={{ background: '#D9D9D9' }}>
                                        <div className="row mt-2">
                                            <div className="col-7 p-0">
                                                <label htmlFor="txtWeight" className="text-modal-3">Mantenimiento cada</label>
                                            </div>
                                            <div className="col-3 p-0">
                                                <input type="text" id="txtWeight" className="form-control" style={{ flex: '1', height: 17, fontSize: 10 }} />
                                            </div>
                                            <div className="col-1 p-0">
                                                <label htmlFor="txtWeight" className='text-modal-3'>km</label>
                                            </div>
                                        </div>
                                        <div className="row mt-1 mb-1">
                                            <div className="col-7 p-0">
                                                <label htmlFor="txtWeight" className="text-modal-3">Costo por mantenimiento</label>
                                            </div>
                                            <div className="col-3 p-0">
                                                <input type="text" id="txtWeight" className="form-control" style={{ flex: '1', height: 17, fontSize: 10 }} />
                                            </div>
                                            <div className="col-1 p-0">
                                                <label htmlFor="txtWeight" className='text-modal-3'>$</label>
                                            </div>
                                        </div>
                                    </div>
                                    <span className='custom-text' style={{ marginBottom: 2 }}>Costos variables</span>
                                    <div className="card" style={{ background: '#D9D9D9' }}>
                                        <div className="row mt-1">
                                            <div className="col-6 p-0 mt-1">
                                                <label htmlFor="txtHeight" className="text-modal-3">Otros costos por km</label>
                                            </div>
                                            <div className="col-4 p-0 mt-1">
                                                <input type="text" id="txtHeight" className="form-control" style={{ flex: '1', height: 17, fontSize: 10 }} />
                                            </div>
                                            <div className="col-1 p-0 mt-1">
                                                <label htmlFor="txtHeight" className='text-modal-3'>$</label>
                                            </div>
                                        </div>
                                        <div className="row mt-1">
                                            <div className="col-6 p-0">
                                                <label htmlFor="txtHeight" className="text-modal-3">Otros costos por hora</label>
                                            </div>
                                            <div className="col-4 p-0">
                                                <input type="text" id="txtHeight" className="form-control" style={{ flex: '1', height: 17, fontSize: 10 }} />
                                            </div>
                                            <div className="col-1 p-0">
                                                <label htmlFor="txtHeight" className='text-modal-3'>$</label>
                                            </div>
                                        </div>
                                        <div className="row mt-1">
                                            <div className="col-6 p-0">
                                                <label htmlFor="txtHeight" className="text-modal-3">Otros costos por día</label>
                                            </div>
                                            <div className="col-4 p-0">
                                                <input type="text" id="txtHeight" className="form-control" style={{ flex: '1', height: 17, fontSize: 10 }} />
                                            </div>
                                            <div className="col-1 p-0">
                                                <label htmlFor="txtHeight" className='text-modal-3'>$</label>
                                            </div>
                                        </div>
                                        <div className="row mt-1">
                                            <div className="col-6 p-0">
                                                <label htmlFor="txtHeight" className="text-modal-3">Otros costos por mes</label>
                                            </div>
                                            <div className="col-4 p-0">
                                                <input type="text" id="txtHeight" className="form-control" style={{ flex: '1', height: 17, fontSize: 10 }} />
                                            </div>
                                            <div className="col-1 p-0">
                                                <label htmlFor="txtHeight" className='text-modal-3'>$</label>
                                            </div>
                                        </div>
                                        <div className="row mt-1 mb-2">
                                            <div className="col-6 p-0">
                                                <label htmlFor="txtHeight" className="text-modal-3">Otros costos por ruta</label>
                                            </div>
                                            <div className="col-4 p-0">
                                                <input type="text" id="txtHeight" className="form-control" style={{ flex: '1', height: 17, fontSize: 10 }} />
                                            </div>
                                            <div className="col-1 p-0">
                                                <label htmlFor="txtHeight" className='text-modal-3'>$</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='text-center mt-3'>
                        <Button variant="danger" className='mx-5' onClick={handleModalClose} style={{ fontSize: 15, fontWeight: '600' }}>
                            Cancelar
                        </Button>
                        <Button className='mx-5' onClick={handleSave} style={{ fontSize: 15, fontWeight: '600', backgroundColor: '#007BFF', color: '#FFFFFF' }}>
                            Guardar
                        </Button>
                    </div>
                </Modal.Body>
            </Modal> */}
            </div>
        </>
    );
}
