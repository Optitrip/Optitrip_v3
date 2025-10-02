import React, { useState } from 'react';
import { apiKeyHERE } from '../../../config';

export function SearchComponent(props) {
    const [search, setSearch] = useState({
        query: "",
        reply_places: [],
    });

    function updateResponse(event) {
        const { value } = event.target;
        // Validar que el valor solo contenga números, letras, "#", ".", y espacios en blanco
        const isValidInput = /^[a-zA-Z0-9#. ]*$/.test(value);
        if (isValidInput) {
            setSearch(prevState => ({ ...prevState, query: value }));
            searchApi(value);
        }
    }

    const [marker, setMarker] = useState(null);

    function showPlace(lat, lng, label) {
        // Mover el mapa al lugar seleccionado
        props.moveMapToPlace(props.map, lat, lng);

        // Crear el marcador si aún no existe
        if (!marker) {
            const newMarker = new H.map.Marker(
                { lat: lat, lng: lng },
                {
                    volatility: true,
                    icon: new H.map.Icon(
                        `<svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" width="32" height="32" viewBox="0 0 263.335 263.335" style="enable-background:new 0 0 263.335 263.335;" xml:space="preserve">
                        <g>
                            <g xmlns="http://www.w3.org/2000/svg">
                                <path d="M40.479,159.021c21.032,39.992,49.879,74.22,85.732,101.756c0.656,0.747,1.473,1.382,2.394,1.839   c0.838-0.396,1.57-0.962,2.178-1.647c80.218-61.433,95.861-125.824,96.44-128.34c2.366-9.017,3.57-18.055,3.57-26.864    C237.389,47.429,189.957,0,131.665,0C73.369,0,25.946,47.424,25.946,105.723c0,8.636,1.148,17.469,3.412,26.28" fill="#00FF00"/>
                                <text x="80" y="130" font-family="sans-serif" font-size="5em" fill="white"></text>
                            </g>
                        </g>
                    </svg>`,
                        { size: { w: 32, h: 32 } }
                    )
                }
            );

            // Agregar el marcador al mapa
            props.map.addObject(newMarker);

            // Establecer el marcador en el estado
            setMarker(newMarker);
        } else {
            // Si el marcador ya existe, simplemente moverlo a la nueva ubicación
            marker.setGeometry({ lat: lat, lng: lng });
        }

        // Actualizar el estado para borrar la consulta y las opciones de búsqueda
        setSearch(prevState => ({ ...prevState, query: label, reply_places: [] }));
    }

    function searchApi(query) {
        if (query.trim() === "") {
            setSearch(prevState => ({ ...prevState, reply_places: [] }));
            return;
        }

        const fetch_link = `https://discover.search.hereapi.com/v1/discover?at=${props.userPosition.lat},${props.userPosition.lng}&lang=es&q=${query}&apiKey=${apiKeyHERE}`;

        fetch(fetch_link)
            .then(response => response.json())
            .then(data => {
                const places = data.items.map((place, index) => (
                    <button
                        key={`search-place-${index}`}
                        className="btn btn-light border m-1"
                        onClick={() => showPlace(place.position.lat, place.position.lng, place.title)}
                        style={{ backgroundColor: 'rgba(55, 149, 250, 0.9)', color: 'white' }} // Estilos de fondo y color de letra
                    >
                        {place.title}
                    </button>
                ));
                setSearch(prevState => ({ ...prevState, reply_places: places }));
            })
            .catch(error => console.error('Error fetching data:', error));
    }


    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <input id="query" onChange={updateResponse} type="text" value={search.query} placeholder={props.placeholder} style={{ maxWidth: "50vw" }} className="form-control mr-sm-2" />
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
    );
}
