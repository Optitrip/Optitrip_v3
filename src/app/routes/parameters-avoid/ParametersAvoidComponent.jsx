import React, { useState, useRef, useEffect } from 'react';
import '../../../App.css';

export default function ParametersAvoidComponent({ state, setState, map }) {
    const [isCardBodyOpen, setIsCardBodyOpen] = useState(false);
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
            return () => {
                map.removeEventListener('tap', handleAvoidZoneClick);
            };
        }
    }, [avoidZoneIndex]);

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
            const line = new H.geo.LineString();
            const newZone = { name: `Zona ${state.avoid_zones.length}`, points: [], LineString: line, polygon: null, color: "rgba(250, 0, 0, .4)", icons: [] };
            const zones = [...state.avoid_zones, newZone];
            setState(prevState => ({ ...prevState, avoid_zones: zones, edit_avoid_zone: zones.length - 1 }));
            setAvoidZoneIndex(zones.length - 1);
        } else {
            setAvoidZoneIndex(index);
            setState(prevState => ({ ...prevState, edit_avoid_zone: index }));
        }
        setIsAreaCardOpen(true);

        const currentZone = state.avoid_zones[index];
        if (avoidZoneNameRef.current) avoidZoneNameRef.current.value = currentZone.name;
        if (avoidZoneColorPRef.current) avoidZoneColorPRef.current.innerText = currentZone.color;
        if (avoidZoneColorInputRef.current) avoidZoneColorInputRef.current.value = currentZone.color;
    };

    const handleAvoidZoneClick = (ev) => {
        const index = avoidZoneIndex;
        if (index >= 0) {
            const pos = map.screenToGeo(ev.currentPointer.viewportX, ev.currentPointer.viewportY);
            const zones = [...state.avoid_zones];
            let zone = zones[index];

            if (index === -1) {
                const lineString = new H.geo.LineString();
                zone = { name: `Zona ${zones.length}`, points: [], LineString: lineString, color: "rgba(250, 0, 0, .4)", icons: [] };
                zones.push(zone);
            } else {
                try {
                    map.removeObject(zone.polygon);
                } catch { }
            }

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
            map.addObject(icono);
            zone.icons.push(icono);
            zone.points.push([pos.lat, pos.lng]);

            zone.LineString.pushPoint({ lat: pos.lat, lng: pos.lng });
            const polygon = new H.map.Polygon(zone.LineString, {
                style: {
                    fillColor: zone.color,
                    strokeColor: zone.color,
                    lineWidth: 4
                }
            });
            zone.polygon = polygon;
            map.addObject(zone.polygon);
            setState(prevState => ({ ...prevState, avoid_zones: zones, edit_avoid_zone: index }));
        }
    };

    const saveZone = (zone, save) => {
        let zones = state.avoid_zones.slice();
        if (save) {
            const name = avoidZoneNameRef.current ? avoidZoneNameRef.current.value : "";
            const color = avoidZoneColorInputRef.current ? avoidZoneColorInputRef.current.value : "";
            if (name.length < 1) {
                Swal.fire({
                    title: '¡Debe de ingresar un nombre para la zona a guardar!',
                    confirmButtonColor: '#d33',
                    confirmButtonText: 'Aceptar',
                    width: '400px',
                    height: '150px',
                    padding: '2rem',
                    customClass: {
                        title: 'title-handle',
                        popup: 'popup-handle'
                    }
                });
                return;
            }
            if (zone.points.length < 3) {
                Swal.fire({
                    title: '¡Se requieren al menos tres puntos!',
                    confirmButtonColor: '#d33',
                    confirmButtonText: 'Aceptar',
                    width: '400px',
                    height: '150px',
                    padding: '2rem',
                    customClass: {
                        title: 'title-handle',
                        popup: 'popup-handle'
                    }
                });
                return;
            }
            zone.name = name;
            zone.color = color;
        } else {
            // Verificar si hay íconos antes de intentar eliminarlos
            if (zone.icons && zone.icons.length > 0) {
                map.removeObjects(zone.icons);
            }
            if (zone.polygon) {
                map.removeObject(zone.polygon);
            }
            zones = zones.filter(z => z !== zone);
        }
        setState(prevState => ({ ...prevState, avoid_zones: zones }));
        setIsAreaCardOpen(false);
        setAvoidZoneIndex(-1);  // Reset index
        map.removeEventListener('tap', handleAvoidZoneClick);
    };

    const points = () => {
        var points = [];
        try {
            for (let index = 0; index < state.avoid_zones[state.edit_avoid_zone].points.length; index++) {
                points.push(
                    <li>{state.avoid_zones[state.edit_avoid_zone].points[index]}</li>
                )
            }
        } catch { }
        return points;
    }

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

    const changeInColor = (event) => {
        const color = event.target.value;
        const hexToRgb = (hex) => {
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
        const rgbaColor = hexToRgb(color);

        setColor(color);

        const zones = state.avoid_zones.slice();
        const zone = zones[state.edit_avoid_zone];

        if (zone && zone.polygon) {
            map.removeObject(zone.polygon);

            const polygon = new H.map.Polygon(zone.LineString, {
                style: {
                    fillColor: rgbaColor,
                    strokeColor: rgbaColor,
                    lineWidth: 4,
                    strokeOpacity: 0.4,
                    fillOpacity: 0.4,
                }
            });

            zone.polygon = polygon;
            map.addObject(polygon);

            zone.color = rgbaColor;
            setState(prevState => ({ ...prevState, avoid_zones: zones }));
        }
    };

    const avoid_zones = () => {
        return state.avoid_zones.map((zone, index) => {
            const handleClick = () => {
                eliminateZone(index);
            };

            return (
                <div key={index} className="btn-group mb-2 px-2" role="group" aria-label="Button group with nested dropdown" style={{ width: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", alignContent: "space-around", width: "90%" }} className="d-flex shadow">
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <div style={{ width: 20, height: 20, backgroundColor: zone.color }}></div>
                            <p className="avoid-title pl-3" style={{ minHeight: "100%", height: 20, overflow: "hidden", margin: 0, textAlign: "center" }}>{zone.name}</p>
                        </div>
                    </div>
                    <button onClick={handleClick} className="btn m-0 p-0 custom-btn"><i className="icon-x"></i></button>
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
