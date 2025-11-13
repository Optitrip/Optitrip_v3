import { useState } from "react";
import { decode } from "../../decode";
import { createIndications } from "../../here";
import ReactDOM from 'react-dom/client';
import '../../App.css';
import { apiKeyHERE } from "../../config";

export const here_api_routes = (state, setState, map, colors, index) => {
    let respuesta = [];

    const addPolylineToMap = (map, poly, color, lines) => {
        var lineString = new H.geo.LineString();
        poly["polyline"].forEach(coordinates => {
            lineString.pushPoint({ lat: coordinates[0], lng: coordinates[1] });
        });
        let polyline = new H.map.Polyline(
            lineString, { style: { lineWidth: 5, strokeColor: color } }
        );
        map.addObject(polyline);
        lines.push({ polyline, originalColor: color, originalWidth: 5, isVisible: true });
        return lines;
    };

    const clearPolylinesFromMap = (map, lines) => {
        lines.forEach(line => {
            if (line.polyline instanceof H.map.Polyline && map.getObjects().indexOf(line.polyline) !== -1) {
                map.removeObject(line.polyline);
            }
        });
        return [];
    };

    let selectedCardIndex = null;

    const handleCardClick = (index, lines, map, tolls_total, setState, forceSelect = false) => {
        // Obtener la tarjeta seleccionada previamente
        const prevSelectedCard = document.querySelector('.selected-card');
        const selectedCard = document.querySelector(`#route-card-${index}`);

        // Si la tarjeta seleccionada es la misma que la previamente seleccionada
        if (prevSelectedCard && selectedCard && prevSelectedCard === selectedCard && !forceSelect) {
            // Deseleccionar la tarjeta
            selectedCard.classList.remove('selected-card');
            const selectedLabel = selectedCard.querySelector('.text-route');
            if (selectedLabel) {
                selectedLabel.classList.remove('selected-text');
            }

            const selectedIcons = selectedCard.querySelectorAll('.icon-route');
            selectedIcons.forEach(icon => {
                icon.classList.remove('selected-icon');
            });

            // Mostrar todas las polilíneas
            lines.forEach(line => {
                if (!line.isVisible) {
                    map.addObject(line.polyline);
                    line.isVisible = true;
                }
            });

            // Restablecer el estado a su valor inicial
            setState(prevState => ({
                ...prevState,
                departureTime: null,
                arrivalTime: null,
                distance: null,
                durationTrip: null,
                tolls_total: null,
            }));

            return; // Salir del método para evitar la selección de la misma tarjeta
        }

        // Si se selecciona una nueva tarjeta, eliminar la clase de la tarjeta previamente seleccionada
        if (prevSelectedCard) {
            prevSelectedCard.classList.remove('selected-card');
            const allLabels = prevSelectedCard.querySelectorAll('.text-route');
            allLabels.forEach(label => {
                label.classList.remove('selected-text');
            });

            const allIcons = prevSelectedCard.querySelectorAll('.icon-route');
            allIcons.forEach(icon => {
                icon.classList.remove('selected-icon');
            });
        }

        // Agregar la clase a la nueva tarjeta seleccionada
        if (selectedCard) {
            selectedCard.classList.add('selected-card');
            const selectedLabel = selectedCard.querySelector('.text-route');
            if (selectedLabel) {
                selectedLabel.classList.add('selected-text');
            }

            const selectedIcons = selectedCard.querySelectorAll('.icon-route');
            selectedIcons.forEach(icon => {
                icon.classList.add('selected-icon');
            });
        }

        // Determinar el color basado en el índice seleccionado
        let selectedColor = '';
        switch (index) {
            case 0:
                selectedColor = '#00BD2A';
                break;
            case 1:
                selectedColor = '#FB8800';
                break;
            case 2:
                selectedColor = '#FF0000';
                break;
            case 3:
                selectedColor = '#d44a8a';
                break;
            default:
                selectedColor = '';
        }

        // Actualizar la visibilidad de las polilíneas
        lines.forEach(line => {
            if (line.originalColor === selectedColor) {
                if (!line.isVisible) {
                    map.addObject(line.polyline);
                    line.isVisible = true;
                }
            } else {
                if (line.isVisible) {
                    map.removeObject(line.polyline);
                    line.isVisible = false;
                }
            }
        });

        // Obtener información de la ruta seleccionada
        const selectedRouteInfo = respuesta[0].routes[index];
        const sections = selectedRouteInfo.sections;

        let totalDistance = 0;
        let totalDuration = 0;
        let instruccionsRoute = [];

        sections.forEach(section => {
            totalDistance += section.summary.length;
            totalDuration += section.summary.duration;
            instruccionsRoute.push(section["actions"])
        });

        const firstSection = sections[0];
        const lastSection = sections[sections.length - 1];
        const departureTime = new Date(firstSection.departure.time);
        const arrivalTime = new Date(lastSection.arrival.time);
        const distance = (totalDistance / 1000).toFixed(2);
        const durationTrip = formatTime(totalDuration);

        // Actualizar el estado con los nuevos valores
        setState(prevState => ({
            ...prevState,
            departureTime: departureTime,
            arrivalTime: arrivalTime,
            distance: distance,
            durationTrip: durationTrip,
            tolls_total: tolls_total,
            selectedCardIndex: index,
            instructions: instruccionsRoute,
        }));
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            const remainingHours = hours % 24;
            return `${days} días ${remainingHours} hrs`;
        } else if (hours > 0) {
            const remainingMinutes = minutes % 60;
            return `${hours} hrs ${remainingMinutes} min`;
        } else {
            return `${minutes} min`;
        }
    }

    const car = { name: "Auto", icon: "icon-icono-auto", here_value: "car" };
    const truck = { name: "Camion", icon: "icon-Icono-camion", here_value: "truck" };
    const bus = { name: "Autobús", icon: "icon-icono-autobus", here_value: "bus" };
    const train = { name: "Tren", icon: "icon-icono-tren", here_value: "train" };
    const emergency = { name: "Emergencias", icon: "icon-icono-emergencia", here_value: "emergency" };
    const motorcycle = { name: "Motocicleta", icon: "icon-icono-motocicleta", here_value: "scooter" };
    const pedestrian = { name: "Peaton", icon: "icon-icono-peaton", here_value: "pedestrian" };
    const transportation = { "car": car, "truck": truck, "bus": bus, "train": train, "emergency": emergency, "scooter": motorcycle, "pedestrian": pedestrian };

    const cardDataRoutes = document.getElementById('data-routes');
    const cardRoutes = document.getElementById('routes-container');
    cardRoutes.innerHTML = '';
    setState(prevState => ({
        ...prevState,
        response: null,
        selectedCardIndex: null
    }));

    if (state.destinations.length >= 2 || state.transportation != "" || state.mode != "") {

        let indicaciones = [];
        // Manejo de tiempo de salida/llegada
        let departure_time_content = "";
        if (state.time_type == "Llegar a las:") {
            const arrivalDate = new Date(state.time);
            departure_time_content = `&arrivalTime=${arrivalDate.toISOString()}`;
        }
        else if (state.time_type == "Salir a las:") {
            const departureDate = new Date(state.time);
            departure_time_content = `&departureTime=${departureDate.toISOString()}`;
        }

        // Construcción de waypoints (vias)
        let vias = ``;
        for (let index = 1; index < state.destinations.length - 1; index++) {
            vias += `&via=${state.destinations[index].lat},${state.destinations[index].lng}!stopDuration=${state.destinations[index].duration}`;
        }

        // Parámetros de evitación
        let avoid_content = "";
        if (state.avoid_parameters.length > 0) {
            avoid_content = "&avoid[features]=" + state.avoid_parameters.join(',');
        }

        // Áreas a evitar (polígonos)
        let avoid_area = "";
        if (state.avoid_zones.length > 0) {
            const polygons = state.avoid_zones.map(zone => {
                const points = zone.points.map(p => `${p[0]},${p[1]}`).join(';');
                return `polygon:${points}`;
            }).join('|');
            avoid_area = `&avoid[areas]=${polygons}`;
        }

        // Parámetros del vehículo (camión)
        let number_of_axles = "";
        let type_of_truck = "";
        let number_of_trailers = "";
        if (state.transportation == "truck") {
            number_of_axles = `&vehicle[axleCount]=${state.number_of_axles}`;
            type_of_truck = `&vehicle[type]=${state.type_of_truck}`;
            number_of_trailers = `&vehicle[trailerCount]=${state.number_of_trailers}`;
        }

        // Tráfico correcto
        const trafficMode = state.traffic === "default" || state.traffic === true ? "default" : "disabled";

        // Construcción de URL limpia
        let fetch_link = `https://router.hereapi.com/v8/routes?apikey=${apiKeyHERE}&lang=es&origin=${state.destinations[0].lat},${state.destinations[0].lng}&destination=${state.destinations[state.destinations.length - 1].lat},${state.destinations[state.destinations.length - 1].lng}${vias}&routingMode=${state.mode}&traffic[mode]=${trafficMode}&return=polyline,summary,actions,instructions${state.transportation != pedestrian.here_value ? ",tolls" : ""}&transportMode=${state.transportation}${departure_time_content}${avoid_content}${avoid_area}${number_of_axles}${number_of_trailers}${type_of_truck}&alternatives=3`;
        setState(prevState => ({ ...prevState, url: fetch_link }));
        fetch(fetch_link)
            .then(response => {
                if (response.status == 400) {
                    alert("No se puede hacer lo solicitado por los datos")
                    return
                }
                response.json()
                    .then(info => {
                        respuesta.push(info);

                        // DEBUG: Ver estructura de sections de HERE API
                        console.log('Sections de HERE API:', info.routes[0].sections.map((s, i) => ({
                            index: i,
                            polylineLength: s.polyline?.length,
                            hasActions: s.actions?.length > 0,
                            distance: s.summary?.length
                        })));
                        const contentData = (
                            <div className="card mt-0">
                                <div className="card-header card-module" style={{ padding: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', height: 15 }}>
                                    <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>Datos</span>
                                </div>
                                <div className="card-body" style={{ background: '#E4E4E4', padding: 1 }}>
                                    <div className="row mt-2 mb-1">
                                        <div className="col-3 mb-1">
                                            <label className='text-modal-5'>Origen</label>
                                        </div>
                                        <div className="col-9 mb-1">
                                            <label className='text-modal-6'>{state.destinations[0].name}</label>
                                        </div>
                                        <div className="col-3 mb-1">
                                            <label className='text-modal-5'>Destino</label>
                                        </div>
                                        <div className="col-9 mb-1">
                                            <label className='text-modal-6'>{state.destinations[state.destinations.length - 1].name}</label>
                                        </div>
                                        <div className="col-3 mb-1">
                                            <label className='text-modal-5'>Paradas</label>
                                        </div>
                                        <div className="col-9 mb-1">
                                            <label className='text-modal-6'>{state.destinations.length - 2}</label>
                                        </div>
                                        <div className="col-3">
                                            <label className='text-modal-5'>Vehículo</label>
                                        </div>
                                        <div className="col-9">
                                            <label className='text-modal-6'>{transportation[state.transportation].name}</label>
                                        </div>
                                        {/* <div className="col-3">
                                            <label className='text-modal-5'>Ordenar por</label>
                                        </div>
                                        <div className="col-9">
                                            <select className="form-control text-modal-6" style={{ fontSize: 10, height: 22 }}>
                                                <option value="1">Más rápida</option>
                                                <option value="2">Más corta</option>
                                                <option value="3">Más económica</option>
                                            </select>
                                        </div> */}
                                    </div>
                                </div>
                            </div>
                        );
                        const root = ReactDOM.createRoot(cardDataRoutes);
                        root.render(contentData);
                        setState(prevState => ({ ...prevState, response: info, show_results: true }));

                        // Limpiar polilíneas anteriores
                        let clearedLines = clearPolylinesFromMap(map, state.lines);
                        let lines = []; // Inicializa el arreglo de líneas

                        for (let index = 0; index <= info["routes"].length - 1; index++) {
                            let totalSeconds = 0;
                            let distance = 0;
                            var tolls = [];
                            let tolls_total = 0;
                            let instructions = [];
                            let departure_time = info["routes"][index]["sections"][0]["departure"]["time"];
                            let arrival_time = info["routes"][index]["sections"][info["routes"][index]["sections"].length - 1]["arrival"]["time"];
                            departure_time = new Date(departure_time);
                            arrival_time = new Date(arrival_time);
                            departure_time = `Salida: ${departure_time.getDate().toString().padStart(2, '0')}/${(departure_time.getMonth() + 1).toString().padStart(2, '0')}/${departure_time.getFullYear()} ${departure_time.getHours().toString().padStart(2, '0')}:${departure_time.getMinutes().toString().padStart(2, '0')}`;
                            arrival_time = `Llegada: ${arrival_time.getDate().toString().padStart(2, '0')}/${(arrival_time.getMonth() + 1).toString().padStart(2, '0')}/${arrival_time.getFullYear()} ${arrival_time.getHours().toString().padStart(2, '0')}:${arrival_time.getMinutes().toString().padStart(2, '0')}`;
                            info["routes"][index]["sections"].forEach(section => {
                                totalSeconds += section["summary"]["duration"];
                                distance += section["summary"]["length"];
                                var polyline = section.polyline;
                                let y = decode(polyline);
                                lines = addPolylineToMap(map, y, colors[index], lines);
                                section["actions"].forEach(element => {
                                    instructions.push(element["instruction"]);
                                });
                                try {
                                    section["tolls"].forEach(toll => {
                                        let y = ["", 0];
                                        toll["tollCollectionLocations"].forEach(tollname => {
                                            y[0] += tollname["name"];
                                        });
                                        toll["fares"].forEach(toll_fare => {
                                            y[1] += parseFloat(toll_fare["price"]["value"]);
                                        });
                                        tolls.push(y);
                                        tolls_total += y[1];
                                    });
                                } catch {
                                    tolls.push(["", 0]);
                                }
                            });
                            tolls_total = tolls_total.toFixed(2);
                            const formattedTime = formatTime(totalSeconds);
                            distance = (distance / 1000).toFixed(2);
                            indicaciones.push({ formattedTime, distance, instructions, tolls, tolls_total, from: state.destinations[0], to: state.destinations[state.destinations.length - 1], vias: state.destinations.slice(1, state.destinations.length - 1) });
                            const contentRoutes = (
                                <div className={`card mb-2 route-card-option`} key={index} id={`route-card-${index}`}>
                                    <div className="card-body" style={{ paddingTop: 1, paddingBottom: 1, paddingLeft: 5, paddingRight: 5 }}>
                                        <div className="row mt-2 mb-1">
                                            <div className="col-8 pl-4 mb-1">
                                                <button className={`btn text-route ${selectedCardIndex === index ? 'selected-text btn-select-active' : 'btn-select-inactive'}`} onClick={() => handleCardClick(index, lines, map, tolls_total, setState)}>Seleccionar opción #{index + 1}</button>
                                                <label className='text-modal-5' style={{ paddingLeft: 0 }}>{departure_time}</label>
                                                <label className='text-modal-5' style={{ paddingLeft: 0 }}>{arrival_time}</label>
                                                <label className='text-modal-6'>{instructions[parseInt(instructions.length / 2)]}</label>
                                                <p style={{ color: '#007BFF', cursor: 'pointer', textDecoration: 'underline', margin: '0px' }} onClick={() => {
                                                    handleCardClick(index, lines, map, tolls_total, setState, true);
                                                    createIndications(colors[index], formattedTime, distance, tolls_total, instructions, state.destinations[0].name, state.destinations[state.destinations.length - 1].name);
                                                }}>Indicaciones</p>
                                            </div>
                                            <div className="col-4 text-center mb-1">
                                                <i className={`${transportation[state.transportation].icon} icon-route ${selectedCardIndex === index ? 'selected-icon' : ''}`}></i>
                                                <label className='text-modal-6 pl-3' style={{ color: colors[index] }}>{formattedTime}</label><br />
                                                <label className='text-modal-6 pl-3'>{distance} km</label><br />
                                                <label className='text-modal-6 pl-3'>${tolls_total}</label><br />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );

                            const routeContainer = document.createElement('div');
                            cardRoutes.appendChild(routeContainer);
                            const root = ReactDOM.createRoot(routeContainer);
                            root.render(contentRoutes);
                        }

                        // Actualizar el estado con las nuevas líneas
                        setState(prevState => ({ ...prevState, lines: lines, response: info, show_results: true }));
                    })
            })
    }
}
