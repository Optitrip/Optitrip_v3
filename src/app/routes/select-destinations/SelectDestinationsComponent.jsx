import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { apiKeyHERE } from '../../../config';
import '../../../App.css';

export function SelectDestinationsComponent(props) {
    const [search, setSearch] = useState({
        query: "",
        reply_places: [],
    });
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [isCardBodyOpen, setIsCardBodyOpen] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [minutes, setMinutes] = useState(0);
    const [load, setLoad] = useState(0);
    const [unload, setUnload] = useState(0);

    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();
    };

    const handleShowModal = (index) => {
        const selectedPlace = props.state.destinations[index];
        setSelectedPlace(selectedPlace);
        setMinutes(selectedPlace.minutes.toString());
        setLoad(selectedPlace.load.toString());
        setUnload(selectedPlace.unload.toString());
        setShowModal(true);
    };

    const handleSave = () => {
        const durationInSeconds = parseInt(minutes) * 60 || 0;
        const minutesD = parseFloat(minutes) || 0;
        const tonsLoad = parseFloat(load) || 0;
        const tonsUnload = parseFloat(unload) || 0;

        const existingIndex = props.state.destinations.findIndex(dest => dest.name === selectedPlace.name && dest.lat === selectedPlace.lat && dest.lng === selectedPlace.lng);

        if (existingIndex !== -1) {
            const updatedDestinations = [...props.state.destinations];
            updatedDestinations[existingIndex].duration = durationInSeconds;
            updatedDestinations[existingIndex].minutes = minutesD;
            updatedDestinations[existingIndex].load = tonsLoad;
            updatedDestinations[existingIndex].unload = tonsUnload;
            props.setState(prevState => ({
                ...prevState,
                destinations: updatedDestinations
            }));
        }

        setShowModal(false);
        resetForm();
    };

    const updateSelectedPlace = (field, value) => {
        setSelectedPlace(prevState => ({
            ...prevState,
            [field]: value
        }));
    };

    const resetForm = () => {
        setMinutes(0);
        setLoad(0);
        setUnload(0);
    };

    function updateResponse(event) {
        const { value } = event.target;
        const isValidInput = /^[a-zA-Z0-9#., \-]*$/.test(value);
        if (isValidInput) {
            setSearch(prevState => ({ ...prevState, query: value }));
            searchApi(value);
        }
    }

    function selectPlace(label, lat, lng, duration = 0, minutes = 0, load = 0, unload = 0) {
        setSearch(prevState => ({ ...prevState, query: label, reply_places: [] }));
        setSelectedPlace({ label, lat, lng, duration: duration || 0, minutes: minutes || 0, load: load || 0, unload: unload || 0 });
    }

    function addSelectedPlaceToDestinations() {
        if (selectedPlace) {
            props.addToDestinations(props.map, selectedPlace.lat, selectedPlace.lng, selectedPlace.duration, selectedPlace.minutes, selectedPlace.load, selectedPlace.unload);
            setSearch({ query: "", reply_places: [] });
            setSelectedPlace(null);
        }
    }

    function searchApi(query) {
        if (query.trim() === "") {
            setSearch(prevState => ({ ...prevState, reply_places: [] }));
            return;
        }

        const fetch_link = `https://discover.search.hereapi.com/v1/discover?at=${props.state.current_position.lat},${props.state.current_position.lng}&lang=es&q=${query}&apiKey=${apiKeyHERE}`;

        fetch(fetch_link)
            .then(response => response.json())
            .then(data => {
                const places = data.items.map((place, index) => (
                    <button
                        key={`search-place-${index}`}
                        className="btn btn-light border m-1"
                        onClick={() => selectPlace(place.title, place.position.lat, place.position.lng)}
                        style={{ backgroundColor: 'rgba(55, 149, 250, 0.9)', color: 'white', fontSize: 10 }}
                    >
                        {place.title}
                    </button>
                ));
                setSearch(prevState => ({ ...prevState, reply_places: places }));
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    const eliminateDestination = (index) => {
        var destinations = props.state.destinations;
        props.map.removeObject(destinations[index].marker);
        destinations.splice(index, 1);
        props.setState(prevState => ({ ...prevState, destinations: destinations }));
        reorganizaMarkers();
    }

    const reorganizaMarkers = () => {
        var destinations = props.state.destinations;
        for (let index = 0; index < destinations.length; index++) {
            let color = "#9FA6B2";
            if (index === 0) {
                color = "#00BD2A";
            }
            else if (index === destinations.length - 1) {
                color = "#DC3545";
            }
            props.createMarker(props.map, destinations[index].lat, destinations[index].lng, index, destinations, color);
        }
    }

    const handleMouseUp = (ev, index) => {
        var y_heights = []
        var children = [].slice.call(document.querySelector('#destinations-divs').children)
        children.forEach(element => {
            y_heights.push(element.getBoundingClientRect().y);
        });
        let offsetY = ev.clientY;
        let new_position = 0;
        for (let i = 0; i < y_heights.length; i++) {
            if (offsetY > y_heights[i]) {
                new_position = i;
            }
        }
        var destinations = props.state.destinations;
        var temp = destinations[index];
        destinations.splice(index, 1);
        destinations.splice(new_position, 0, temp);
        props.setState(prevState => ({ ...prevState, destinations: destinations }));
        reorganizaMarkers();
    };

    const destinations = () => {
        var destinations = [];
        for (let index = 0; index < props.state.destinations.length; index++) {
            let marker_color = "text-secondary";
            if (index === 0) {
                marker_color = "custom-color-marker";
            } else if (index === props.state.destinations.length - 1) {
                marker_color = "text-danger";
            }
            destinations.push(
                <div key={`destination-${index}`} onDragEnd={() => handleMouseUp(event, index)} draggable style={{ display: "flex", alignItems: "center" }}>
                    <button className='btn' style={{ cursor: "grab", padding: 0 }}>
                        <i className="icon-mover-rutas text-secondary" style={{ fontSize: 30 }}></i>
                    </button>
                    <i className={`icon-location m-1 ${marker_color}`} style={{ fontSize: 20 }}></i>
                    <div className="btn btn-light border-dark m-1 pt-1 d-flex align-items-center" style={{ padding: 2, width: '78%' }}>
                        <p style={{ width: 150, height: 18, overflow: "hidden", paddingLeft: 5, margin: 0, fontSize: 10, whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{props.state.destinations[index].name}</p>
                        <button className="btn custom-btn ml-4 mr-2 p-0" onClick={() => handleShowModal(index)}>
                            <i className='icon-pencil' style={{ fontSize: 12 }}></i>
                        </button>
                        <button className="btn custom-btn ml-2 mr-1 p-0" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => eliminateDestination(index)}>
                            <i className="icon-x" style={{ fontSize: 12 }}></i>
                        </button>
                    </div>
                </div>
            );
        }
        return destinations;
    }

    const handleNumberChange = (e, setFunction) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value)) {
            setFunction(value);
        }
    };

    return (
        <div className="card">
            <div className="card-header card-module" style={{ padding: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>Escoge tus destinos</span>
                <button className="btn ml-auto mr-2 custom-btn" style={{ padding: 0 }} onClick={() => setIsCardBodyOpen(!isCardBodyOpen)}>
                    {isCardBodyOpen ? <i className="icon-circle-up"></i> : <i className="icon-circle-down"></i>}
                </button>
            </div>

            {isCardBodyOpen && (
                <div className="card-body" style={{ background: '#E4E4E4', padding: 1 }}>
                    <div id="destinations-divs" style={{ maxHeight: 450, overflow: "auto" }}>
                        {destinations()}
                    </div>
                    <div className="d-flex mt-2 mb-2">
                        <button
                            type="button"
                            onClick={addSelectedPlaceToDestinations}
                            className="btn btn-white"
                            style={{ marginLeft: 4 }}
                        >
                            <i className="icon-icono-agregar"></i>
                        </button>
                        <input
                            id="query"
                            onChange={updateResponse}
                            type="text"
                            value={search.query}
                            placeholder={props.placeholder}
                            className="form-control mr-1"
                        />
                    </div>
                    <div className="modal-body py-0">
                        <div className="row">
                            <div className="col-6" style={{ paddingLeft: 2, paddingRight: 0 }}>
                                <div className="h-100 d-flex flex-column justify-content-between">
                                    {search.reply_places.slice(0, Math.ceil(search.reply_places.length / 2))}
                                </div>
                            </div>
                            <div className="col-6" style={{ paddingRight: 2, paddingLeft: 0 }}>
                                <div className="h-100 d-flex flex-column justify-content-between">
                                    {search.reply_places.slice(Math.ceil(search.reply_places.length / 2))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header className='custom-header-modal py-1' style={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }} closeButton={false}>
                    <Modal.Title className='p-0' id="title-edition-destination">Edición de punto del viaje</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <span className='place-name text-center'>{selectedPlace ? selectedPlace.name : ''}</span>
                    <span className='text-modal text-center'>Establezca los valores de tiempo de espera y carga/descarga para la parada</span><br />
                    <div className="card text-center" style={{ background: 'rgba(140, 149, 160, 0.2)' }}>
                        <div className="card-body">
                            <div className='text-modal-2 mb-4'>
                                <label htmlFor="txtMinutes">Tiempo en que el vehículo permanecerá en el punto:</label> <br />
                                <div className='input-group' style={{ marginRight: '1%' }}>
                                    <input
                                        type="text"
                                        name="txtMinutes"
                                        id="txtMinutes"
                                        className='text-dark custom-input'
                                        placeholder='0'
                                        value={minutes}
                                        onChange={(e) => {
                                            handleNumberChange(e, setMinutes);
                                            updateSelectedPlace('minutes', e.target.value);
                                        }}
                                    />
                                    <span>Minutos</span>
                                </div>
                            </div>
                            <div className='text-modal-2 mb-4'>
                                <label htmlFor="txtLoad">Introduzca las cantidades de carga en el punto:</label> <br />
                                <div className='input-group' style={{ marginLeft: '1%' }}>
                                    <input
                                        type="text"
                                        name="txtLoad"
                                        id="txtLoad"
                                        className='text-dark custom-input'
                                        placeholder='0'
                                        value={load}
                                        onChange={(e) => {
                                            handleNumberChange(e, setLoad);
                                            updateSelectedPlace('load', e.target.value);
                                        }}
                                    />
                                    <span>Toneladas</span>
                                </div>
                            </div>
                            <div className='text-modal-2'>
                                <label htmlFor="txtUnload">Introduzca las cantidades de descarga en el punto:</label> <br />
                                <div className='input-group' style={{ marginLeft: '1%' }}>
                                    <input
                                        type="text"
                                        name="txtUnload"
                                        id="txtUnload"
                                        className='text-dark custom-input'
                                        placeholder='0'
                                        value={unload}
                                        onChange={(e) => {
                                            handleNumberChange(e, setUnload);
                                            updateSelectedPlace('unload', e.target.value);
                                        }}
                                    />
                                    <span>Toneladas</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='text-center mt-3'>
                        <Button variant="danger" className='mx-5' onClick={handleCloseModal} style={{ fontSize: 15, fontWeight: '600' }}>
                            Cancelar
                        </Button>
                        <Button className='mx-5' onClick={handleSave} style={{ fontSize: 15, fontWeight: '600', backgroundColor: '#007BFF', color: '#FFFFFF' }}>
                            Guardar
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
}
