import React, { useState, useRef, useEffect } from 'react';
import '../../../App.css';

export default function ParametersAvoidComponent({ state, setState, map, behavior }) {
    const [isCardBodyOpen, setIsCardBodyOpen] = useState(state.isEditMode || false);
    const [isAreaCardOpen, setIsAreaCardOpen] = useState(false);
    const [isIndicationsVisible, setIsIndicationsVisible] = useState(false);
    const [isMaximizeButtonVisible, setIsMaximizeButtonVisible] = useState(false);
    const [avoidZoneIndex, setAvoidZoneIndex] = useState(-1);
    const [color, setColor] = useState("#fa0000");

    const avoidZoneNameRef = useRef(null);
    const avoidZoneColorPRef = useRef(null);
    const avoidZoneColorInputRef = useRef(null);

    useEffect(() => {
        if (avoidZoneIndex >= 0) {
            map.addEventListener('tap', handleAvoidZoneClick);

            map.addEventListener('dragstart', handleDragStart);
            map.addEventListener('drag', handleDrag);
            map.addEventListener('dragend', handleDragEnd);

            return () => {
                map.removeEventListener('tap', handleAvoidZoneClick);
                map.removeEventListener('dragstart', handleDragStart);
                map.removeEventListener('drag', handleDrag);
                map.removeEventListener('dragend', handleDragEnd);
            };
        }
    }, [avoidZoneIndex, state.avoid_zones]);

    useEffect(() => {
        if (isAreaCardOpen && avoidZoneIndex >= 0) {
            const currentZone = state.avoid_zones[avoidZoneIndex];
            if (currentZone) {
                if (avoidZoneNameRef.current) {
                    avoidZoneNameRef.current.value = currentZone.name;
                }

                const rgbaToHex = (rgba) => {
                    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                    if (!match) return "#FF0000";
                    const r = parseInt(match[1]);
                    const g = parseInt(match[2]);
                    const b = parseInt(match[3]);
                    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
                };

                const hexColor = rgbaToHex(currentZone.color);
                setColor(hexColor);

                if (avoidZoneColorInputRef.current) {
                    avoidZoneColorInputRef.current.value = hexColor;
                }
            }
        }
    }, [isAreaCardOpen, avoidZoneIndex, state.avoid_zones]);

    const toggleIndications = () => {
        setIsIndicationsVisible(!isIndicationsVisible);
    };

    const toggleMaximizeButton = () => {
        setIsMaximizeButtonVisible(!isMaximizeButtonVisible);
    };

    const handleMinimizeClick = () => {
        toggleIndications();
        toggleMaximizeButton();
        setIsAreaCardOpen(false);
    };

    const handleMaximizeClick = () => {
        toggleIndications();
        toggleMaximizeButton();
        setIsAreaCardOpen(true);
    };

    const onClickAvoid = (value, add) => {
        const newAvoidParameters = add ? [...state.avoid_parameters, value] : state.avoid_parameters.filter(param => param !== value);
        setState(prevState => ({ ...prevState, avoid_parameters: newAvoidParameters }));
    };

    const onClickHighway = (value, add) => {
        const newAvoidHighways = add ? [...state.avoid_highways, value] : state.avoid_highways.filter(highway => highway !== value);
        setState(prevState => ({ ...prevState, avoid_highways: newAvoidHighways }));
    };

    const parameters = {
        avoid: {
            labels: ["Carreteras de cuota", "Caminos de Tierra", "Ferry", "Giros complicados", "Túneles", "Giros en U"],
            parameters: ["tollRoad", "dirtRoad", "ferry", "difficultTurns", "tunnel", "uTurns"],
            onClickFunction: onClickAvoid
        },
        highway: {
            labels: ["ET", "A", "B", "C", "D"],
            parameters: ["ET", "A", "B", "C", "D"],
            onClickFunction: onClickHighway
        },
    };

    const makeParameters = (key) => {
        const columns = key === 'highway' ? 3 : 2;
        const parametersPerRow = columns;

        const parametersChunked = parameters[key].parameters.reduce((resultArray, item, index) => {
            const chunkIndex = Math.floor(index / parametersPerRow);
            if (!resultArray[chunkIndex]) {
                resultArray[chunkIndex] = [];
            }
            resultArray[chunkIndex].push(item);
            return resultArray;
        }, []);

        const avoidList = key === 'avoid' ? state.avoid_parameters : state.avoid_highways;

        return (
            <div>
                {parametersChunked.map((chunk, chunkIndex) => (
                    <div key={chunkIndex} className="d-flex flex-wrap">
                        {chunk.map((param, index) => (
                            <div key={`${key}-${index}`} style={{ display: "flex", marginLeft: "5px", marginTop: 5, width: `calc(${100 / columns}% - 10px)`, fontSize: 13 }}>
                                <button style={{ height: 18, borderRadius: "10px 0 0 10px", minWidth: 20, fontSize: 9 }} className={`btn m-0 p-0 ${avoidList.includes(param) ? "btn-secondary" : "btn-danger"}`} onClick={() => parameters[key].onClickFunction(param, false)}>No</button>
                                <button style={{ height: 18, borderRadius: "0px 10px 10px 0px", minWidth: 20, fontSize: 9 }} className={`btn m-0 mr-1 p-0 ${avoidList.includes(param) ? "btn-success" : "btn-secondary"}`} onClick={() => parameters[key].onClickFunction(param, true)}>Si</button>
                                <span className="m-0" style={{ marginLeft: 5, fontSize: 10 }}>
                                    {parameters[key].labels[chunkIndex * parametersPerRow + index]}
                                </span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        );
    };

    const editZone = (index) => {
        if (index === -1) {
            // Crear nueva zona
            const line = new H.geo.LineString();
            const newZone = {
                name: `Zona ${state.avoid_zones.length}`,
                points: [],
                LineString: line,
                polygon: null,
                color: "rgba(250, 0, 0, .4)",
                icons: []
            };
            const zones = [...state.avoid_zones, newZone];
            setState(prevState => ({
                ...prevState,
                avoid_zones: zones,
                edit_avoid_zone: zones.length - 1
            }));
            setAvoidZoneIndex(zones.length - 1);

            // Configurar valores por defecto en el formulario
            if (avoidZoneNameRef.current) {
                avoidZoneNameRef.current.value = newZone.name;
            }
            setColor("#FA0000");
            if (avoidZoneColorInputRef.current) {
                avoidZoneColorInputRef.current.value = "#FA0000";
            }
        } else {
            // Editar zona existente
            const currentZone = state.avoid_zones[index];

            if (!currentZone) return;

            // Configurar el índice de edición
            setAvoidZoneIndex(index);
            setState(prevState => ({ ...prevState, edit_avoid_zone: index }));

            // Rellenar formulario con datos existentes
            if (avoidZoneNameRef.current) {
                avoidZoneNameRef.current.value = currentZone.name;
            }

            // Convertir rgba a hex para el input
            const rgbaToHex = (rgba) => {
                const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                if (!match) return "#FF0000";

                const r = parseInt(match[1]);
                const g = parseInt(match[2]);
                const b = parseInt(match[3]);

                return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
            };

            const hexColor = rgbaToHex(currentZone.color);
            setColor(hexColor);

            if (avoidZoneColorInputRef.current) {
                avoidZoneColorInputRef.current.value = hexColor;
            }
            if (avoidZoneColorPRef.current) {
                avoidZoneColorPRef.current.innerText = currentZone.color;
            }

            // Recrear los marcadores si no existen o se perdieron
            if (!currentZone.icons || currentZone.icons.length === 0) {
                const zones = [...state.avoid_zones];
                const zone = zones[index];
                zone.icons = [];

                // Crear marcadores para cada punto existente
                zone.points.forEach((point, pointIndex) => {
                    const icono = new H.map.Marker(
                        { lat: point[0], lng: point[1] },
                        {
                            volatility: true,
                            icon: new H.map.Icon(`<svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" width="100" height="100" viewBox="0 0 100 100" style="enable-background:new 0 0 100 100;" xml:space="preserve">
                        <g>
                            <g xmlns="http://www.w3.org/2000/svg">
                                <path d="M 10 10 H 90 V 90 H 10 L 10 10" style="fill:rgb(240, 240, 240);stroke-width:3;stroke:grey"/>
                            </g>
                        </g>
                        </svg>`, { size: { w: 15, h: 15 } })
                        }
                    );

                    icono.draggable = true;
                    icono.pointIndex = pointIndex;

                    // Evento para eliminar punto
                    icono.addEventListener('tap', function (evt) {
                        evt.stopPropagation();
                        removePointFromZone(index, pointIndex);
                    });

                    map.addObject(icono);
                    zone.icons.push(icono);
                });

                setState(prevState => ({ ...prevState, avoid_zones: zones }));
            }
        }

        // Abrir el modal de edición
        setIsAreaCardOpen(true);
    };

    const handleAvoidZoneClick = (ev) => {
        const index = avoidZoneIndex;
        if (index >= 0) {
            const pos = map.screenToGeo(ev.currentPointer.viewportX, ev.currentPointer.viewportY);
            const zones = [...state.avoid_zones];
            let zone = zones[index];

            // Si la zona no existe (nueva zona)
            if (!zone) {
                const lineString = new H.geo.LineString();
                zone = {
                    name: `Zona ${zones.length}`,
                    points: [],
                    LineString: lineString,
                    color: "rgba(250, 0, 0, .4)",
                    icons: [],
                    polygon: null
                };
                zones.push(zone);
            } else {
                // Si estamos editando una zona existente, remover el polígono anterior
                try {
                    if (zone.polygon) {
                        map.removeObject(zone.polygon);
                    }
                } catch (e) {
                    console.error("Error al remover polígono:", e);
                }
            }

            // Crear icono para el nuevo punto
            const pointIndex = zone.points.length; // Guardar el índice del punto
            const icono = new H.map.Marker({ lat: pos.lat, lng: pos.lng }, {
                volatility: true,
                icon: new H.map.Icon(`<svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" width="100" height="100" viewBox="0 0 100 100" style="enable-background:new 0 0 100 100;" xml:space="preserve">
            <g>
                <g xmlns="http://www.w3.org/2000/svg">
                    <path d="M 10 10 H 90 V 90 H 10 L 10 10" style="fill:rgb(240, 240, 240);stroke-width:3;stroke:grey"/>
                </g>
            </g>
            </svg>`, { size: { w: 15, h: 15 } })
            });

            icono.addEventListener('tap', function (evt) {
                evt.stopPropagation();
                removePointFromZone(index, pointIndex);
            });

            icono.draggable = true;

            map.addObject(icono);

            // Guardar referencia al índice del punto en el marcador
            icono.pointIndex = pointIndex;
            zone.icons.push(icono);
            zone.points.push([pos.lat, pos.lng]);

            // Agregar punto al LineString
            zone.LineString.pushPoint({ lat: pos.lat, lng: pos.lng });

            // Crear nuevo polígono
            const polygon = new H.map.Polygon(zone.LineString, {
                style: {
                    fillColor: zone.color,
                    strokeColor: zone.color,
                    lineWidth: 4
                }
            });

            zone.polygon = polygon;
            map.addObject(zone.polygon);

            // Actualizar el estado
            zones[index] = zone;
            setState(prevState => ({ ...prevState, avoid_zones: zones, edit_avoid_zone: index }));
        }
    };

    const saveZone = (zone, save) => {
        let zones = state.avoid_zones.slice();

        if (save) {
            const name = avoidZoneNameRef.current ? avoidZoneNameRef.current.value.trim() : "";
            const color = avoidZoneColorInputRef.current ? avoidZoneColorInputRef.current.value : "";

            // Validación de nombre
            if (name.length < 1) {
                Swal.fire({
                    title: '¡Debe ingresar un nombre para la zona a guardar!',
                    confirmButtonColor: '#d33',
                    confirmButtonText: 'Aceptar',
                    width: '400px',
                    padding: '2rem',
                    customClass: {
                        title: 'title-handle',
                        popup: 'popup-handle'
                    }
                });
                return;
            }

            // Validación de puntos mínimos
            if (zone.points.length < 3) {
                Swal.fire({
                    title: '¡Se requieren al menos tres puntos para crear una zona!',
                    confirmButtonColor: '#d33',
                    confirmButtonText: 'Aceptar',
                    width: '400px',
                    padding: '2rem',
                    customClass: {
                        title: 'title-handle',
                        popup: 'popup-handle'
                    }
                });
                return;
            }

            // Convertir color hex a rgba
            const hexToRgba = (hex) => {
                let r = 0, g = 0, b = 0;
                if (hex.length === 4) {
                    r = parseInt(hex[1] + hex[1], 16);
                    g = parseInt(hex[2] + hex[2], 16);
                    b = parseInt(hex[3] + hex[3], 16);
                } else if (hex.length === 7) {
                    r = parseInt(hex[1] + hex[2], 16);
                    g = parseInt(hex[3] + hex[4], 16);
                    b = parseInt(hex[5] + hex[6], 16);
                }
                return `rgba(${r}, ${g}, ${b}, 0.4)`;
            };

            const rgbaColor = hexToRgba(color);

            // Actualizar nombre y color
            zone.name = name;
            zone.color = rgbaColor;

            // Actualizar el polígono con el color final
            if (zone.polygon) {
                map.removeObject(zone.polygon);

                const polygon = new H.map.Polygon(zone.LineString, {
                    style: {
                        fillColor: rgbaColor,
                        strokeColor: rgbaColor,
                        lineWidth: 4
                    }
                });

                zone.polygon = polygon;
                map.addObject(polygon);
            }

            // Mostrar mensaje de éxito
            Swal.fire({
                title: '¡Zona guardada correctamente!',
                icon: 'success',
                confirmButtonColor: '#007BFF',
                confirmButtonText: 'Aceptar',
                width: '400px',
                padding: '2rem',
                customClass: {
                    title: 'title-handle',
                    popup: 'popup-handle'
                }
            });

        } else {
            if (zone && zone.icons && zone.icons.length > 0) {
                map.removeObjects(zone.icons);
            }
            if (zone && zone.polygon) {
                map.removeObject(zone.polygon);
            }
            zones = zones.filter(z => z !== zone);
        }

        // Actualizar estado y cerrar modal
        setState(prevState => ({ ...prevState, avoid_zones: zones }));
        setIsAreaCardOpen(false);
        setAvoidZoneIndex(-1);

        // Remover event listeners
        map.removeEventListener('tap', handleAvoidZoneClick);
        map.removeEventListener('dragstart', handleDragStart);
        map.removeEventListener('drag', handleDrag);
        map.removeEventListener('dragend', handleDragEnd);
    };

    const points = () => {
        const pointsList = [];
        try {
            const zone = state.avoid_zones[state.edit_avoid_zone];
            if (zone && zone.points) {
                for (let index = 0; index < zone.points.length; index++) {
                    const point = zone.points[index];
                    pointsList.push(
                        <li key={index} style={{ fontSize: '10px', marginBottom: '4px' }}>
                            Punto {index + 1}: {point[0].toFixed(6)}, {point[1].toFixed(6)}
                        </li>
                    );
                }
            }
        } catch (error) {
            console.error("Error al mostrar puntos:", error);
        }
        return pointsList;
    };

    // const saveZone = (zone, save) => {
    //     let zones = state.avoid_zones.slice();
    //     if (save) {
    //         const name = avoidZoneNameRef.current ? avoidZoneNameRef.current.value : "";
    //         const color = avoidZoneColorInputRef.current ? avoidZoneColorInputRef.current.value : "";
    //         if (name.length < 1) {
    //             window.alert("Escribe un nombre.");
    //             return;
    //         }
    //         if (zone.points.length < 3) {
    //             window.alert("Se requieren al menos tres puntos.");
    //             return;
    //         }
    //         zone.name = name;
    //         zone.color = color;
    //     } else {
    //         console.log(zone)
    //         map.removeObjects(zone.icons);
    //         map.removeObject(zone.polygon);
    //         zones = zones.filter(z => z !== zone);
    //     }
    //     setState(prevState => ({ ...prevState, avoid_zones: zones }));
    //     setIsAreaCardOpen(false);
    //     map.removeEventListener('tap', handleAvoidZoneClick);
    // };

    const eliminateZone = (index) => {
        // Crear una copia del array de avoid_zones
        const avoid_zones = [...state.avoid_zones];

        try {
            // Eliminar el elemento en el índice proporcionado
            map.removeObject(avoid_zones[index].polygon);
            map.removeObjects(avoid_zones[index].icons);
        } catch (error) { }

        // Eliminar el elemento del array usando el índice directamente
        avoid_zones.splice(index, 1);

        // Actualizar el estado con el nuevo array sin el elemento eliminado
        setState(prevState => ({ ...prevState, avoid_zones }));
    }

    const startEditingZone = (index) => {
        const zones = [...state.avoid_zones];
        const zone = zones[index];

        if (!zone) return;

        setAvoidZoneIndex(index);
        setState(prevState => ({ ...prevState, edit_avoid_zone: index }));

        if (zone.icons && zone.icons.length > 0) {
            map.removeObjects(zone.icons);
            zone.icons = [];
        } else {
            zone.icons = [];
        }

        zone.points.forEach((point, pointIndex) => {
            const icono = new H.map.Marker(
                { lat: point[0], lng: point[1] },
                {
                    volatility: true,
                    icon: new H.map.Icon(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path d="M 2 2 H 18 V 18 H 2 L 2 2" style="fill:white;stroke:black;stroke-width:2"/></svg>`, { size: { w: 15, h: 15 } })
                }
            );

            icono.draggable = true;
            icono.pointIndex = pointIndex;

            icono.addEventListener('tap', function (evt) {
                evt.stopPropagation();
                removePointFromZone(index, pointIndex);
            });

            map.addObject(icono);
            zone.icons.push(icono);
        });

        zones[index] = zone;
        setState(prevState => ({ ...prevState, avoid_zones: zones }));

        setIsAreaCardOpen(true);
    };

    const removePointFromZone = (zoneIndex, pointIndex) => {
        const zones = [...state.avoid_zones];
        const zone = zones[zoneIndex];

        if (!zone) return;

        // Validar que haya al menos 3 puntos antes de eliminar
        if (zone.points.length <= 3) {
            Swal.fire({
                title: '¡No se puede eliminar! Se requieren al menos 3 puntos para formar una zona',
                confirmButtonColor: '#d33',
                confirmButtonText: 'Aceptar',
                width: '400px',
                padding: '2rem',
                customClass: {
                    title: 'title-handle',
                    popup: 'popup-handle'
                }
            });
            return;
        }

        // Remover el icono del mapa
        if (zone.icons[pointIndex]) {
            map.removeObject(zone.icons[pointIndex]);
            zone.icons.splice(pointIndex, 1);
        }

        // Remover el punto del array
        zone.points.splice(pointIndex, 1);

        // Remover el polígono anterior
        if (zone.polygon) {
            map.removeObject(zone.polygon);
        }

        // Reconstruir el LineString con los puntos restantes
        const newLineString = new H.geo.LineString();
        zone.points.forEach(point => {
            newLineString.pushPoint({ lat: point[0], lng: point[1] });
        });
        zone.LineString = newLineString;

        // Crear nuevo polígono
        const polygon = new H.map.Polygon(newLineString, {
            style: {
                fillColor: zone.color,
                strokeColor: zone.color,
                lineWidth: 4
            }
        });

        zone.polygon = polygon;
        map.addObject(polygon);

        // Actualizar índices de los iconos restantes
        zone.icons.forEach((icon, idx) => {
            icon.pointIndex = idx;
        });

        // Actualizar el estado
        zones[zoneIndex] = zone;
        setState(prevState => ({ ...prevState, avoid_zones: zones }));
    };

    const handleDragStart = (ev) => {
        const target = ev.target;
        const pointer = ev.currentPointer;

        if (target instanceof H.map.Marker && target.pointIndex !== undefined) {
            const targetPosition = map.geoToScreen(target.getGeometry());
            target['offset'] = new H.math.Point(
                pointer.viewportX - targetPosition.x,
                pointer.viewportY - targetPosition.y
            );
            if (behavior) {
                behavior.disable(); // Esto desactiva el movimiento del mapa para permitir mover el punto
            } else {
                console.error("Behavior no está definido, no se puede arrastrar");
            }
        }
    };

    const handleDrag = (ev) => {
        const target = ev.target;
        const pointer = ev.currentPointer;

        if (target instanceof H.map.Marker && target['offset']) {
            target.setGeometry(
                map.screenToGeo(
                    pointer.viewportX - target['offset'].x,
                    pointer.viewportY - target['offset'].y
                )
            );
        }
    };

    const handleDragEnd = (ev) => {
        const target = ev.target;

        if (target instanceof H.map.Marker && target.pointIndex !== undefined) {
            behavior.enable();

            const newPosition = target.getGeometry();
            const zoneIndex = avoidZoneIndex;
            const pointIndex = target.pointIndex;

            // Actualizar la posición del punto en el estado
            updatePointPosition(zoneIndex, pointIndex, newPosition.lat, newPosition.lng);
        }
    };

    const updatePointPosition = (zoneIndex, pointIndex, newLat, newLng) => {
        const zones = [...state.avoid_zones];
        const zone = zones[zoneIndex];

        if (!zone) return;

        // Actualizar el punto en el array
        zone.points[pointIndex] = [newLat, newLng];

        // Remover el polígono anterior
        if (zone.polygon) {
            map.removeObject(zone.polygon);
        }

        // Reconstruir el LineString
        const newLineString = new H.geo.LineString();
        zone.points.forEach(point => {
            newLineString.pushPoint({ lat: point[0], lng: point[1] });
        });
        zone.LineString = newLineString;

        // Crear nuevo polígono
        const polygon = new H.map.Polygon(newLineString, {
            style: {
                fillColor: zone.color,
                strokeColor: zone.color,
                lineWidth: 4
            }
        });

        zone.polygon = polygon;
        map.addObject(polygon);

        // Actualizar el estado
        zones[zoneIndex] = zone;
        setState(prevState => ({ ...prevState, avoid_zones: zones }));
    };

    const changeInColor = (event) => {
        const color = event.target.value;

        const hexToRgba = (hex) => {
            let r = 0, g = 0, b = 0;
            if (hex.length === 4) {
                r = parseInt(hex[1] + hex[1], 16);
                g = parseInt(hex[2] + hex[2], 16);
                b = parseInt(hex[3] + hex[3], 16);
            } else if (hex.length === 7) {
                r = parseInt(hex[1] + hex[2], 16);
                g = parseInt(hex[3] + hex[4], 16);
                b = parseInt(hex[5] + hex[6], 16);
            }
            return `rgba(${r}, ${g}, ${b}, 0.4)`;
        };

        const rgbaColor = hexToRgba(color);
        setColor(color);

        const zones = [...state.avoid_zones];
        const zone = zones[state.edit_avoid_zone];

        if (zone && zone.polygon) {
            // Remover el polígono anterior
            map.removeObject(zone.polygon);

            // Crear nuevo polígono con el color actualizado
            const polygon = new H.map.Polygon(zone.LineString, {
                style: {
                    fillColor: rgbaColor,
                    strokeColor: rgbaColor,
                    lineWidth: 4
                }
            });

            zone.polygon = polygon;
            zone.color = rgbaColor;
            map.addObject(polygon);

            zones[state.edit_avoid_zone] = zone;
            setState(prevState => ({ ...prevState, avoid_zones: zones }));
        }
    };

    const avoid_zones = () => {
        return state.avoid_zones.map((zone, index) => {
            const handleClick = () => {
                eliminateZone(index);
            };

            const handleEdit = () => {
                startEditingZone(index);
            };

            return (
                <div key={index} className="mb-2 px-2" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div className="d-flex shadow align-items-center" style={{ 
                        flex: 1,                 
                        overflow: "hidden",      
                        marginRight: "8px",      
                        backgroundColor: "white", 
                        borderRadius: "5px", 
                        padding: "5px" 
                    }}>
                        {/* Indicador de color */}
                        <div style={{ width: 20, height: 20, backgroundColor: zone.color, flexShrink: 0, borderRadius: "2px" }}></div>
                        
                        <p className="avoid-title pl-2" style={{ 
                            margin: 0, 
                            whiteSpace: "nowrap",      
                            overflow: "hidden",       
                            textOverflow: "ellipsis", 
                            textAlign: "left",
                            fontSize: "12px"
                        }} title={zone.name}>
                            {zone.name}
                        </p>
                    </div>

                    <div style={{ display: "flex", flexShrink: 0, gap: "5px" }}>
                        <button onClick={handleEdit} className="btn custom-btn shadow" style={{ 
                            margin: 0, 
                            padding: 0, 
                            width: "30px",       
                            height: "30px",      
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center",
                            borderRadius: "5px",
                            backgroundColor: "white"
                        }}>
                            <img
                                src="/iconos principales/edit zone.svg"
                                alt="Editar"
                                style={{ width: '20px', height: '20px' }} 
                            />
                        </button>

                        <button onClick={handleClick} className="btn custom-btn shadow" style={{ 
                            margin: 0, 
                            padding: 0, 
                            width: "30px", 
                            height: "30px", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center",
                            borderRadius: "5px",
                            backgroundColor: "white"
                        }}>
                            <img 
                                src="/iconos principales/delete zone.svg" 
                                alt="Eliminar" 
                                style={{ width: '20px', height: '20px' }} 
                            />
                        </button>
                    </div>
                </div>
            );
        });
    };

    return (
        <div className="card mt-2">
            <div className="card-header card-module" style={{ padding: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16%' }}>Selecciona los parámetros a evitar</span>
                <button className="btn ml-auto mr-2 custom-btn" style={{ padding: 0 }} onClick={() => setIsCardBodyOpen(!isCardBodyOpen)}>
                    {isCardBodyOpen ? <i className="icon-circle-up"></i> : <i className="icon-circle-down"></i>}
                </button>
            </div>

            {isCardBodyOpen && (
                <div className="card-body" style={{ background: '#E4E4E4', padding: 1 }}>
                    <div>
                        <span className='avoid-title' style={{ paddingLeft: 5 }}>Seleccione los parámetros que desee evitar en la ruta</span>
                        {makeParameters("avoid")}
                    </div>
                    <hr />
                    <div className='mb-2'>
                        <div className="pl-2">
                            <span className='avoid-title'>Seleccione los tipos de carretera que desee evitar en la ruta</span>
                        </div>
                        {makeParameters("highway")}
                    </div>
                    <hr />
                    <div>
                        <span className='avoid-title pl-2'>Área</span>
                        <div style={{ marginBottom: "15px", float: "right" }}>
                            <button className="btn btn-light border rounded mr-1" onClick={() => editZone(-1)}><strong>Dibujar <i className="icon-icono-agregar pl-3"></i></strong></button>
                        </div>
                        <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", alignContent: "space-around", width: "100%" }}>
                            {avoid_zones()}
                        </div>
                    </div>
                </div>
            )}

            {isAreaCardOpen && (
                <div id="avoid-card" style={{ width: '280px', position: 'fixed', top: '60px', left: '340px', display: isAreaCardOpen ? 'block' : 'none', zIndex: 1 }}>
                    <div className="card" style={{ height: 'fit-content', position: 'absolute', maxHeight: 'calc(100vh - 55px - 20px)', overflow: 'hidden', borderRadius: '10px' }}>
                        <div className="card-header" id="card-avoid-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', padding: '0px' }}>
                            <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>Dibujar zona</span>
                            <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
                                <button style={{ border: 'none', background: 'none', marginRight: '5px', marginTop: '8px' }} onClick={handleMinimizeClick}>
                                    <i className="icon-icono-minimizar-ventana" style={{ fontSize: '20px' }}></i>
                                </button>
                                <button style={{ border: 'none', background: 'none', marginTop: '8px' }} onClick={() => saveZone(state.avoid_zones[state.edit_avoid_zone], false)}>
                                    <i className="icon-noun-exit-6418164" style={{ fontSize: '25px' }}></i>
                                </button>
                            </div>
                        </div>
                        <div className="card-body p-0" style={{ overflowX: 'hidden', overflowY: 'auto' }}>
                            <div className="row">
                                <div className="col-lg-12 col-md-12 col-sm-12 col-12 mt-2">
                                    <div className="d-flex align-items-center mt-1 mb-2 px-3">
                                        <label htmlFor="avoid_zone_name" className="mr-2 mb-0 text-modal">Nombre</label>
                                        <input type="text" id="avoid_zone_name" ref={avoidZoneNameRef} className="form-control" style={{ flex: '1', height: 20 }} />
                                    </div>
                                </div>
                                <div className="col-lg-12 col-md-12 col-sm-12 col-12">
                                    <div className="d-flex align-items-center mt-1 mb-4 px-3">
                                        <label htmlFor="avoid_zone_color" className="mr-2 mb-0 text-modal">Color</label>
                                        <input type="color" id="avoid_zone_color" ref={avoidZoneColorInputRef} className="form-control" style={{ flex: '1', height: 20 }} onChange={changeInColor} />
                                    </div>
                                </div>
                                <div className="col-lg-12 col-md-12 col-sm-12 col-12">
                                    <div className="px-3 mb-3">
                                        <div className="border rounded p-2" style={{ backgroundColor: '#F0F0F0' }}>
                                            <p className="text-modal mb-1" style={{ fontSize: '11px', fontWeight: 'bold' }}>
                                                Instrucciones:
                                            </p>
                                            <ul className="text-modal-6 mb-0 pl-3" style={{ fontSize: '10px' }}>
                                                <li>Haz clic en el mapa para agregar puntos</li>
                                                <li>Arrastra los puntos para moverlos</li>
                                                <li>Haz clic en un punto para eliminarlo</li>
                                                <li>Se requieren mínimo 3 puntos</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-12 col-md-12 col-sm-12 col-12">
                                    <div className="d-flex align-items-center mt-1 mb-4 px-3">
                                        <div className='border rounded p-2' style={{ width: 260 }}>
                                            <div>
                                                <p className="mr-2 mb-0 text-modal">Puntos</p><br />
                                                <p className="text-modal-6">Latitud & Longuitud</p>
                                                <ul className='pl-3 text-modal-6'>
                                                    <li>{points()}</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="pl-2 pb-2 text-center">
                                <button className="btn mx-2" style={{ background: '#D9D9D9', color: '#000000' }} onClick={() => saveZone(state.avoid_zones[state.edit_avoid_zone], false)}>Cancelar</button>
                                <button className="btn btn-primary mx-2" onClick={() => saveZone(state.avoid_zones[state.edit_avoid_zone], true)}>Guardar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isMaximizeButtonVisible && (
                <div id="maximize-zones" style={{ position: 'fixed', top: '60px', left: '340px', display: isMaximizeButtonVisible ? 'block' : 'none', zIndex: 1 }}>
                    <button id="btn-maximize-zones" style={{ border: 'none', background: 'none', marginRight: '5px', marginTop: '8px', padding: '6px 6px 0px', background: '#FB8800' }} onClick={handleMaximizeClick}>
                        <i className="icon-icono-minimizar-ventana" style={{ fontSize: '20px', transform: 'rotate(180deg)' }}></i>
                    </button>
                </div>
            )}
        </div>
    );
}
