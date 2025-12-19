// app.jsx
import { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom';
import { apiKeyHERE, base_url } from './config.js';
import { getUserByIdService, getUsersService } from './services/UserService.js';
import { here_api_routes, resetRoutesModule } from './app/routes/GenerateRoute.jsx';
import { getCookie } from './cookies.js';
import './App.css'
import './style.css'
import { decode } from './decode.js';
import { SearchComponent } from './app/routes/search/SearchComponent.jsx';
import { SelectDestinationsComponent } from './app/routes/select-destinations/SelectDestinationsComponent.jsx';
import SelectVehiclesComponent from './app/routes/select-vehicles/SelectVehiclesComponent.jsx';
import TypeTripComponent from './app/routes/type-trip/TypeTripComponent.jsx';
import ScheduleTripComponent from './app/routes/schedule-trip/ScheduleTripComponent.jsx';
import ParametersAvoidComponent from './app/routes/parameters-avoid/ParametersAvoidComponent.jsx';
import DeviationAlertComponent from './app/routes/deviation-alert/DeviationAlertComponent.jsx';
import UserComponent from './app/users/UserComponent.jsx';
import AssignRouteComponent from './app/routes/AssignRouteComponent.jsx';
import ReportComponent from './app/reports/ReportComponent.jsx';
import TrackingComponent from './app/tracking/TrackingComponent.jsx';
import AlertsComponent from './app/alerts/AlertsComponent.jsx';
import PrintRouteComponent from './app/routes/PrintRouteComponent.jsx';

// Comenzamos con la creación de las variables globales para el uso de los mapas de HERE:
var platformHERE = null;
var layersMapHERE = null;
var map = null;
var behavior = null; // Variable para controlar eventos en el mapa 
var ui = null; // Variable para controlar la interfaz de usuario de HERE

var platformDrivers = null;
var layersDrivers = null;
var mapDrivers = null;
var behaviorDrivers = null;
var uiDrivers = null;

var driversMarker = {};
var destinationsMarker = [];

var plus_position = 400;
var colors = ["#00BD2A", "#FB8800", "#FF0000", "#d44a8a", "#32a852", "#3285a8", "#8f4ad4", "#d44a8a"];
// train emergency 

var default_state = {
    created: false,
    current_position: {
        lat: 0,
        lng: 0
    },
    destinations: [],
    transportation: "",
    type_of_truck: "tractor",
    number_of_axles: "2",
    type_of_trailer: "Remolque",
    number_of_trailers: "1",
    time: "",
    time_type: "Salir ahora",
    mode: "",
    traffic: "default",
    avoid_parameters: [],
    avoid_highways: [],
    avoid_zones: [],
    edit_avoid_zone: 0,
    modal_parameter_opened: "destinations_parameter",
    ephemiral_marker: [],
    show_results: false,
    show_indications: false,
    lines: [],
    tolls_total: 0,
    url: "",
    selectedCardIndex: null,
    departureTime: "",
    arrivalTime: "",
    distance: 0,
    durationTrip: "",
    instructions: [],
    isEditMode: false,
    editingRouteId: null,
    preloadedDriverId: null,
    preloadedCustomerId: null,
    deviationAlertEnabled: false,
    deviationAlertDistance: 50,
    selectedAlert: null,
    isAlertsMaximized: false
};

var currentBubble = null;

// Inicialización de la plataforma HERE
platformHERE = new H.service.Platform({ 'apikey': apiKeyHERE });
layersMapHERE = platformHERE.createDefaultLayers();

// Inicialización del mapa principal
map = new H.Map(
    document.getElementById('map'),
    layersMapHERE.vector.normal.map,
    {
        center: { lat: 21.12908, lng: -101.685086 },
        zoom: 13,
        pixelRatio: window.devicePixelRatio || 1
    }
);

// Inicialización del comportamiento y UI del mapa principal
behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
ui = H.ui.UI.createDefault(map, layersMapHERE);

window.ui = ui;

// Ajuste del tamaño del mapa cuando se redimensiona la ventana
window.addEventListener('resize', () => {
    map.getViewPort().resize();
});

// Inicialización del mapa de conductores
platformDrivers = new H.service.Platform({ 'apikey': apiKeyHERE });
layersDrivers = platformDrivers.createDefaultLayers();
mapDrivers = new H.Map(
    document.getElementById('map-drivers'),
    layersDrivers.vector.normal.map,
    {
        center: { lat: 21.12908, lng: -101.685086 },
        zoom: 13,
        pixelRatio: window.devicePixelRatio || 1
    }
);

// Inicialización del comportamiento y UI del mapa de conductores
behaviorDrivers = new H.mapevents.Behavior(new H.mapevents.MapEvents(mapDrivers));
uiDrivers = H.ui.UI.createDefault(mapDrivers, layersDrivers);

// Ajuste del tamaño del mapa de conductores cuando se redimensiona la ventana
window.addEventListener('resize', () => {
    mapDrivers.getViewPort().resize();
});

function moveMapToPlace(map, lat, lon) {
    map.setCenter({ lat: lat, lng: lon });
}

export default function App(props) {
    const [state, setState] = useState(default_state);
    const [showSearch, setShowSearch] = useState(false);
    const [showBtnSearch, setShowBtnSearch] = useState(false);
    const cardTracingRef = useRef(null);
    const cardDestRef = useRef(null);
    const cardUserInfoRef = useRef(null);
    const cardReportsInfoRef = useRef(null);
    const divPrintRouteRef = useRef(null);
    const divAssignRouteRef = useRef(null);
    const [stateUser, setUser] = useState([]);
    const [error, setError] = useState('');
    const [initialized, setInitialized] = useState(false);
    const [isMenuRoutesPrimary, setIsMenuRoutesPrimary] = useState(false);
    const [formKey, setFormKey] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
    const [isAlertsOpen, setIsAlertsOpen] = useState(false);
    const [isTrackingOpen, setIsTrackingOpen] = useState(true);
    const [refsReady, setRefsReady] = useState(false);
    const [selectedAlert, setSelectedAlert] = useState(null);


    const appContainerRef = useRef(null);
    const menuRoutesRef = useRef(null);
    const userSectionRef = useRef(null);
    const reportSectionRef = useRef(null);
    const mapRef = useRef(null);
    const sessionStorageUser = JSON.parse(sessionStorage.getItem('data_user')) || "";
    const email = sessionStorageUser.email;

    const handleTrackingToggle = () => {
        if (!isTrackingOpen) {
            setIsAlertsOpen(false);
        }
        setIsTrackingOpen(!isTrackingOpen);
    };

    const handleAlertsToggle = () => {
        if (!isAlertsOpen) {
            setIsTrackingOpen(false);
        }
        setIsAlertsOpen(!isAlertsOpen);
    };

    const handleFullReset = () => {
        map.getObjects().forEach(obj => {
            // Borrar Zonas a evitar (Polígonos)
            if (obj instanceof H.map.Polygon) {
                map.removeObject(obj);
            }
            // Borrar Líneas de ruta
            if (obj instanceof H.map.Polyline) {
                map.removeObject(obj);
            }
            // Borrar Marcadores (excepto mi ubicación actual)
            if (obj instanceof H.map.Marker) {
                const isCurrentPosition = state.ephemiral_marker && state.ephemiral_marker.includes(obj);
                if (!isCurrentPosition) {
                    map.removeObject(obj);
                }
            }
            if (obj instanceof H.map.Group) {
                map.removeObject(obj);
            }
        });

        const assignButton = document.getElementById('btn-assign-route');
        if (assignButton) {
            assignButton.remove();
        }

        const timeInput = document.querySelector('input[type="datetime-local"]');
        if (timeInput) {
            timeInput.value = "";
        }

        const cleanState = {
            created: true,
            current_position: state.current_position,
            destinations: [],
            transportation: "",
            type_of_truck: "tractor",
            number_of_axles: "2",
            type_of_trailer: "Remolque",
            number_of_trailers: "1",
            time: "",
            time_type: "Salir ahora",
            mode: "",
            traffic: "default",
            avoid_parameters: [],
            avoid_highways: [],
            avoid_zones: [],
            edit_avoid_zone: 0,
            modal_parameter_opened: "destinations_parameter",
            ephemiral_marker: state.ephemiral_marker,
            show_results: false,
            show_indications: false,
            lines: [],
            tolls_total: 0,
            url: "",
            selectedCardIndex: null,
            departureTime: "",
            arrivalTime: "",
            distance: 0,
            durationTrip: "",
            instructions: [],
            response: null,
            isEditMode: false,
            editingRouteId: null,
            activeVehicleButton: null,
            preloadedDriverId: null,
            preloadedCustomerId: null,
            deviationAlertEnabled: false,
            deviationAlertDistance: 50
        };

        setState(cleanState);

        resetRoutesModule(state, setState, map);

        setFormKey(prevKey => prevKey + 1);
    };

    useEffect(() => {
        appContainerRef.current = document.getElementById('app-container');
        userSectionRef.current = document.getElementById('users');
        reportSectionRef.current = document.getElementById('reports');
        menuRoutesRef.current = document.getElementById('menuRoutes');

        const observerCallback = () => {
            if (!appContainerRef.current || !userSectionRef.current || !reportSectionRef.current || !menuRoutesRef.current) {
                return;
            }

            const appContainerDisplay = window.getComputedStyle(appContainerRef.current).display;
            const userSectionDisplay = window.getComputedStyle(userSectionRef.current).display;
            const reportSectionDisplay = window.getComputedStyle(reportSectionRef.current).display;

            const isRoutesActive = menuRoutesRef.current.classList.contains('btn-primary');

            if (appContainerDisplay === 'block') {
                if (userSectionDisplay === 'none' && reportSectionDisplay === 'none' && isRoutesActive) {
                    setInitialized(true);
                    setShowBtnSearch(true); // Solo muestra el buscador si está en Rutas
                } else {
                    setInitialized(false);
                    setShowBtnSearch(false);
                }
            } else {
                setInitialized(false);
                setShowBtnSearch(false);
            }
        };

        const observer = new MutationObserver(observerCallback);
        observer.observe(appContainerRef.current, { attributes: true, attributeFilter: ['style'] });
        observer.observe(userSectionRef.current, { attributes: true, attributeFilter: ['style'] });
        observer.observe(reportSectionRef.current, { attributes: true, attributeFilter: ['style'] });
        observer.observe(menuRoutesRef.current, { attributes: true, attributeFilter: ['class'] }); // Observa cambios en la clase

        observerCallback(); // Initial check

        return () => {
            observer.disconnect();
        };
    }, []);

    useEffect(() => {
        // Function to toggle visibility based on menuRoutes class
        const toggleMapVisibility = () => {
            const menuRoutes = document.getElementById('menuRoutes');
            const menuUsers = document.getElementById('menuUsers');
            const menuReports = document.getElementById('menuReports');

            if (menuRoutes && menuRoutes.classList.contains('btn-primary')) {
                document.getElementById('map').style.display = 'block';
                document.getElementById('map-drivers').style.display = 'none';
                document.getElementById('users').style.display = 'none';
                document.getElementById('reports').style.display = 'none';

            } else {
                document.getElementById('map').style.display = 'none';
                document.getElementById('map-drivers').style.display = 'block';
                document.getElementById('users').style.display = 'none';
                document.getElementById('reports').style.display = 'none';
            }

            if (menuUsers && menuUsers.classList.contains('btn-primary')) {
                document.getElementById('map').style.display = 'none';
                document.getElementById('map-drivers').style.display = 'none';
                document.getElementById('users').style.display = 'block';
                document.getElementById('reports').style.display = 'none';
            }

            if (menuReports && menuReports.classList.contains('btn-primary')) {
                document.getElementById('map').style.display = 'none';
                document.getElementById('map-drivers').style.display = 'none';
                document.getElementById('users').style.display = 'none';
                document.getElementById('reports').style.display = 'block';
            }
        };

        // Llamada inicial para configurar la visibilidad de los mapas
        toggleMapVisibility();

        // Configuración del observador para detectar cambios en el atributo 'class' de menuRoutes y menuUsers
        const menuRoutesElement = document.getElementById('menuRoutes');
        const menuUsersElement = document.getElementById('menuUsers');
        const menuReportsElement = document.getElementById('menuReports');

        const observerRoutes = new MutationObserver(() => {
            toggleMapVisibility();
        });

        const observerUsers = new MutationObserver(() => {
            toggleMapVisibility();
        });

        const observerReports = new MutationObserver(() => {
            toggleMapVisibility();
        });

        if (menuRoutesElement) {
            observerRoutes.observe(menuRoutesElement, { attributes: true, attributeFilter: ['class'] });
        }

        if (menuUsersElement) {
            observerUsers.observe(menuUsersElement, { attributes: true, attributeFilter: ['class'] });
        }

        if (menuReportsElement) {
            observerReports.observe(menuReportsElement, { attributes: true, attributeFilter: ['class'] });
        }

        // Limpieza al desmontar el componente
        return () => {
            if (menuRoutesElement) {
                observerRoutes.disconnect();
            }
            if (menuUsersElement) {
                observerUsers.disconnect();
            }
            if (menuReportsElement) {
                observerReports.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        const tracingDiv = document.getElementById('tracing-driver');
        const menuMap = document.getElementById('menuMap');

        const checkVisibility = () => {
            if (tracingDiv && menuMap) {

                const isPrimary = menuMap.classList.contains('btn-primary') ||
                    (menuMap.querySelector('a') && menuMap.querySelector('a').classList.contains('btn-primary'));

                if (isPrimary) {
                    tracingDiv.style.display = 'block';
                } else {
                    tracingDiv.style.display = 'none';
                }
            }
        };

        checkVisibility();

        if (menuMap) {
            const observer = new MutationObserver(checkVisibility);
            observer.observe(menuMap, { attributes: true, attributeFilter: ['class'], subtree: true });

            return () => observer.disconnect();
        }
    }, []);

    useEffect(() => {
        // Necesitamos renovarlo cada vez que el estado cambie (state) para que no use datos viejos.
        map.addEventListener('contextmenu', handleContextMenu);

        return () => {
            map.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [map, state]);

    useEffect(() => {
        const storedUserData = sessionStorage.getItem('data_user'); // Obtener los datos del usuario desde sessionStorage
        if (storedUserData) {
            const storedUser = JSON.parse(storedUserData);
            if (storedUser._id) {
                const fetchUser = async () => {
                    try {
                        const { data } = await getUserByIdService(storedUser._id); // Llamar a la función de servicio para obtener los datos del usuario
                        setUser(data); // Establecer los datos del usuario en el estado

                    } catch (error) {
                        setError(error.message);
                    }
                };

                fetchUser();
            } else {
                setError('ID de usuario no encontrado en los datos almacenados');
            }
        } else {
            setError('No se encontraron datos de usuario en sessionStorage');
        }
    }, [sessionStorage.getItem('data_user')]); // Ejecutar el efecto cada vez que el valor de sessionStorage.user cambie

    // useEffect(() => {
    //     const cleanButton = document.querySelector('.btn-clean[type="button"]');
    // const finishBtn = document.querySelector('.btn-finish[type="button"]');

    //     const handleCleanButtonClick = () => {
    //         state.destinations.forEach(destination => {
    //             map.removeObject(destination.marker);
    //         });

    //         state.destinations = [];

    //         setState(prevState => ({
    //             ...prevState,
    //             mode: '',
    //             destinations: [],
    //             transportation: '',
    //             type_of_truck: "tractor",
    //             number_of_axles: "2",
    //             number_of_trailers: "1",
    //             avoid_highways: [],
    //             avoid_parameters: [],
    //             activeVehicleButton: null
    //         }));
    //         cleanButton.style.backgroundColor = '#767676';
    //         cleanButton.classList.add('disabled');
    //     };

    //finishBtn.addEventListener("click", () => {
    //    window.location.reload();
    //});

    //     cleanButton.addEventListener('click', handleCleanButtonClick);

    //     if (state.mode || state.destinations.length > 0 || state.transportation || state.avoid_highways.length > 0 || state.avoid_parameters.length > 0) {
    //         cleanButton.style.backgroundColor = '#FF0000';
    //         cleanButton.classList.remove('disabled');
    //     } else {
    //         cleanButton.style.backgroundColor = '#767676';
    //         cleanButton.classList.add('disabled');
    //     }

    //     return () => {
    //         cleanButton.removeEventListener('click', handleCleanButtonClick);
    //     };
    // }, [state, setState]);

    useEffect(() => {
        const cleanButton = document.querySelector('.btn-clean');

        // Usamos la misma función
        const onCleanClick = () => {
            handleFullReset();
        };

        if (cleanButton) {
            cleanButton.addEventListener('click', onCleanClick);

            // Lógica visual del botón (rojo o gris)
            const hasData = state.destinations.length > 0 ||
                state.transportation !== "" ||
                state.mode !== "" ||
                state.avoid_parameters.length > 0 ||
                state.avoid_zones.length > 0; // Agregado avoid_zones a la validación

            if (hasData) {
                cleanButton.style.backgroundColor = '#DC3545';
                cleanButton.classList.remove('disabled');
            } else {
                cleanButton.style.backgroundColor = '#767676';
                cleanButton.classList.add('disabled');
            }
        }

        return () => {
            if (cleanButton) {
                cleanButton.removeEventListener('click', onCleanClick);
            }
        };
    }, [state]);

    useEffect(() => {
        const calculateBtn = document.querySelector('.btn-calculate[type="button"]');
        const createRouteCard = document.getElementById('create-route');
        const menuRoutesBtn = document.getElementById('menuRoutes');
        const divRoutes = document.getElementById('show-routes');

        // Función para limpiar el mapa y vaciar el estado de las líneas
        // const clearMapAndState = () => {
        //     state.lines.forEach(line => {
        //         if (line.polyline instanceof H.map.Polyline && map.getObjects().indexOf(line.polyline) !== -1) {
        //             map.removeObject(line.polyline);
        //         }
        //     });
        // };

        // Verificar condiciones para habilitar el botón de cálculo
        if (state.mode && state.destinations.length >= 2 && state.transportation) {
            calculateBtn.style.backgroundColor = '#007BFF';
            calculateBtn.classList.remove('disabled');
        } else {
            calculateBtn.style.backgroundColor = '#767676';
            calculateBtn.classList.add('disabled');
        }

        // Manejar el clic en el botón de cálculo
        const handleCalculateClick = () => {
            //clearMapAndState();
            let index = 0;
            here_api_routes(state, setState, map, colors, index);

            // Ocultar tarjeta de creación de ruta
            if (createRouteCard) {
                createRouteCard.style.display = 'none';
            }

            // Actualizar estilos y mostrar elementos relacionados con rutas
            if (menuRoutesBtn) {
                menuRoutesBtn.classList.add('btn-primary');
            }

            if (divRoutes) {
                divRoutes.style.display = 'block';
            }
        };

        // Agregar evento al botón de cálculo
        if (calculateBtn) {
            calculateBtn.addEventListener('click', handleCalculateClick);

            return () => {
                calculateBtn.removeEventListener('click', handleCalculateClick);
            };
        }
    }, [state, setState]);

    useEffect(() => {
        const handleLoadRouteEvent = (event) => {
            const { routeId } = event.detail;
            loadRouteForEditing(routeId);
        };

        window.addEventListener('loadRouteForEdit', handleLoadRouteEvent);

        return () => {
            window.removeEventListener('loadRouteForEdit', handleLoadRouteEvent);
        };
    }, [map, state]);

    // Listener para reiniciar el módulo después de asignar/actualizar una ruta
    useEffect(() => {
        const handleRouteAssigned = () => {
            console.log('Evento routeAssignedSuccessfully recibido');

            handleFullReset();

            // Ocultar el contenedor de rutas y mostrar el de creación
            const divRoutes = document.getElementById('show-routes');
            const createRouteCard = document.getElementById('create-route');

            if (divRoutes) {
                divRoutes.style.display = 'none';
            }

            if (createRouteCard) {
                createRouteCard.style.display = 'block';
            }

            const calculateBtn = document.querySelector('.btn-calculate[type="button"]');
            if (calculateBtn) {
                calculateBtn.style.backgroundColor = '#767676';
                calculateBtn.classList.add('disabled');
            }
        };

        window.addEventListener('routeAssignedSuccessfully', handleRouteAssigned);

        return () => {
            window.removeEventListener('routeAssignedSuccessfully', handleRouteAssigned);
        };
    }, [state, map]);

    useEffect(() => {
        const handleClearPreloaded = () => {
            setState(prevState => ({
                ...prevState,
                preloadedDriverId: null,
                preloadedCustomerId: null
            }));
        };

        window.addEventListener('clearPreloadedIds', handleClearPreloaded);

        return () => {
            window.removeEventListener('clearPreloadedIds', handleClearPreloaded);
        };
    }, []);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await fetch(`${base_url}/reports/deviations/unseen`);
                if (response.ok) {
                    const data = await response.json();
                    setNotifications(data);

                    const notifBtn = document.getElementById('notificationsButton');
                    if (notifBtn) {
                        const img = notifBtn.querySelector('img');
                        if (img) {
                            if (data.length > 0) {
                                img.classList.add('blinking-icon');
                            } else {
                                img.classList.remove('blinking-icon');
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching notifications", error);
            }
        };

        fetchNotifications();
        const intervalId = setInterval(fetchNotifications, 30000);

        return () => clearInterval(intervalId);
    }, []);


    useEffect(() => {
        const btn = document.getElementById('notificationsButton');
        if (btn) {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                setShowNotificationsMenu(prev => !prev);

                const img = newBtn.querySelector('img');
                if (img) {
                    img.classList.remove('blinking-icon')
                }

                newBtn.style.border = "none";
            });
        }

        const closeMenu = () => setShowNotificationsMenu(false);
        window.addEventListener('click', closeMenu);

        return () => window.removeEventListener('click', closeMenu);
    }, []);

    useEffect(() => {
        cardTracingRef.current = document.getElementById('tracing-container');
        cardDestRef.current = document.getElementById('react-container');
        cardUserInfoRef.current = document.getElementById('card-users-info');
        cardReportsInfoRef.current = document.getElementById('card-reports-info');
        divPrintRouteRef.current = document.getElementById('print-route');
        divAssignRouteRef.current = document.getElementById('assign-route');

        // Forzar re-render cuando las referencias estén listas
        setRefsReady(true);
    }, []);

    const handleContextMenu = (ev) => {
        const menuRoutes = document.getElementById('menuRoutes');
        // Verifica si el elemento tiene la clase btn-primary
        if (menuRoutes && menuRoutes.classList.contains('btn-primary')) {
            Swal.fire({
                title: '¿Agregar punto a la ruta?',
                showCancelButton: true,
                confirmButtonColor: '#007BFF',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Guardar',
                cancelButtonText: 'Cancelar',
                width: '400px',
                height: '150px',
                padding: '2rem',
                customClass: {
                    title: 'title-handle',
                    popup: 'popup-handle'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    const createRouteCard = document.getElementById('create-route');

                    if (!menuRoutes.classList.contains('btn-outline-primary')) {
                        menuRoutes.classList.remove('btn-outline-primary');
                        menuRoutes.classList.add('btn-primary');
                        createRouteCard.style.display = 'block';
                    }

                    var pos = map.screenToGeo(ev.viewportX, ev.viewportY);
                    addToDestinations(map, pos.lat, pos.lng, 0, 0, 0, 0);

                    Swal.fire({
                        title: 'La parada se ha agregado correctamente',
                        confirmButtonColor: '#d33',
                        confirmButtonText: 'Salir',
                        width: '400px',
                        height: '150px',
                        padding: '2rem',
                        customClass: {
                            title: 'title-handle',
                            popup: 'popup-handle'
                        }
                    });
                }
            });
        }
    };


    const deleteState = () => {
        location.reload();
    }

    const createState = () => {
        setState({ ...state, created: true });
        openModal(true, "destinations_parameter");
    }

    const changeDestination = (index, lat, lng) => {
        var destinations = state.destinations;
        destinations[index].string = `${lat},${lng}`;
        destinations[index].marker.setGeometry({ lat: lat, lng: lng });
        setState(prevState => ({ ...prevState, destinations: destinations }));
    }

    function reverseGeocoding(lat, lng, index) {
        fetch(`https://revgeocode.search.hereapi.com/v1/revgeocode?at=${lat},${lng}&lang=es-MX&apiKey=${apiKeyHERE}`)
            .then(response => response.json())
            .then(data => {
                var destinations = state.destinations;
                destinations[index].name = data["items"][0]["address"]["label"];
                setState(prevState => ({
                    ...prevState,
                    destinations: destinations
                }));
            });
    }

    function createMarker(map, lat, lng, index, destinations, color) {
        if (!destinations[index]) {
            destinations[index] = {
                duration: 0,
                minutes: 0,
                load: 0,
                unload: 0
            };
        }
        else {
            map.removeObject(destinations[index].marker);
            destinations[index] = {};
        }
        var marker = new H.map.Marker({ lat: lat, lng: lng }, {
            volatility: true,
            icon: new H.map.Icon(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -100 1024 1224" width="32" height="32" style="transform: rotate(180deg);">
            <path d="M512 960c-176.732 0-320-143.268-320-320 0-320 320-704 320-704s320 384 320 704c0 176.732-143.27 320-320 320zM512 448c-106.04 0-192 85.96-192 192s85.96 192 192 192 192-85.96 192-192-85.96-192-192-192z" fill="${color}"/>
            </svg>`, { size: { w: 35, h: 35 } })
        });

        marker.draggable = true;
        map.addObject(marker);

        var destination = {
            string: `${lat},${lng}`,
            marker: marker,
            lat: lat,
            lng: lng,
            duration: destinations[index].duration || 0,
            minutes: destinations[index].minutes || 0,
            load: destinations[index].load || 0,
            unload: destinations[index].unload || 0
        };

        destinations[index] = destination;
        reverseGeocoding(lat, lng, index);

        setState(prevState => ({
            ...prevState,
            destinations: destinations
        }));

        map.addEventListener('dragstart', function (ev) {
            var target = ev.target;
            var pointer = ev.currentPointer;
            if (target instanceof H.map.Marker) {
                var targetPosition = map.geoToScreen(target.getGeometry());
                target['offset'] = new H.math.Point(pointer.viewportX - targetPosition.x, pointer.viewportY - targetPosition.y);
                behavior.disable();
            }
        }, false);

        map.addEventListener('dragend', function (ev) {
            var target = ev.target;
            if (target instanceof H.map.Marker) {
                behavior.enable();
                var newPosition = target.getGeometry();
                if (target == marker) {
                    var latitude = newPosition.lat;
                    var longitude = newPosition.lng;
                    destination.string = `${latitude},${longitude}`;
                    destination.lat = latitude; // Actualiza la latitud en el objeto destination
                    destination.lng = longitude; // Actualiza la longitud en el objeto destination
                    destinations[index] = destination; // Actualiza el destino en el arreglo destinations
                    setState(prevState => ({ ...prevState, destinations: destinations }));
                    reverseGeocoding(latitude, longitude, index)
                }
            }
        }, false);

        map.addEventListener('drag', function (ev) {
            var target = ev.target,
                pointer = ev.currentPointer;
            if (target instanceof H.map.Marker) {
                target.setGeometry(map.screenToGeo(pointer.viewportX - target['offset'].x, pointer.viewportY - target['offset'].y));
            }

        }, false);

        destinationsMarker.push(marker);
        return marker;
    }

    function addToDestinations(map, lat, lng, duration, minutes, load, unload) {
        var destinations = state.destinations;
        var index = destinations.length;

        var currentPosition = localStorage.getItem("current_position");
        if (currentPosition) {
            currentPosition = JSON.parse(currentPosition);
            if (currentPosition.lat === lat && currentPosition.lng === lng) {
                return null;
            }
        }

        if (index == 0) {
            var marker = createMarker(map, lat, lng, index, destinations, "#00BD2A");
        }
        else if (index == 1) {
            var marker = createMarker(map, lat, lng, index, destinations, "#DC3545");
        }
        else {
            var marker = createMarker(map, lat, lng, index, destinations, "#DC3545");
            createMarker(map, destinations[index - 1].lat, destinations[index - 1].lng, index - 1, destinations, "#9FA6B2");
        }

        var newDestination = {
            ...destinations[index],
            duration: duration,
            minutes: minutes,
            load: load,
            unload: unload,
            status: "Sin completar"
        };

        destinations[index] = newDestination;
        setState(prevState => ({
            ...prevState,
            destinations: destinations
        }));

        moveMapToPlace(map, lat, lng);
        return marker;
    }

    const handleMarkAsSeen = async (notif) => {
        try {
            const response = await fetch(`${base_url}/report/deviation/seen`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ routeId: notif.routeId, deviationId: notif.deviationId })
            });

            if (response.ok) {
                const updatedNotifications = notifications.filter(n => n.deviationId !== notif.deviationId);
                setNotifications(updatedNotifications);

                if (updatedNotifications.length === 0) {
                    const notifBtn = document.getElementById('notificationsButton');
                    const img = notifBtn?.querySelector('img');
                    if (img) img.classList.remove('blinking-icon');
                }
            }
        } catch (error) {
            console.error("Error marking as seen", error);
        }
    };

    const loadRouteForEditing = async (routeId) => {
        try {
            const { getRouteByIdService } = await import('./services/RouteService.js');
            const routeData = await getRouteByIdService(routeId);

            // Eliminamos todo excepto el marcador de posición actual (GPS)
            map.getObjects().forEach(obj => {
                const isMarker = obj instanceof H.map.Marker;
                const isPolygon = obj instanceof H.map.Polygon;
                const isPolyline = obj instanceof H.map.Polyline;

                if ((isMarker || isPolygon || isPolyline) && !state.ephemiral_marker.includes(obj)) {
                    map.removeObject(obj);
                }
            });

            const allPoints = [
                routeData.origin,
                ...routeData.waypoints,
                routeData.destination
            ];

            const loadedDestinations = [];
            allPoints.forEach((point, index) => {
                const color = index === 0 ? "#00BD2A" : (index === allPoints.length - 1 ? "#DC3545" : "#9FA6B2");

                const marker = createMarker(
                    map,
                    point.lat,
                    point.lng,
                    index,
                    loadedDestinations,
                    color
                );

                loadedDestinations[index] = {
                    ...point,
                    marker: marker,
                    string: `${point.lat},${point.lng}`
                };
            });

            const loadedAvoidZones = [];
            if (routeData.avoidAreas && routeData.avoidAreas.length > 0) {
                const vertexIcon = new H.map.Icon(
                    '<svg width="12" height="12" xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10" x="1" y="1" style="fill:white;stroke:gray;stroke-width:1" /></svg>',
                    { anchor: { x: 6, y: 6 } }
                );

                routeData.avoidAreas.forEach((area) => {
                    const points = area.points.map(p => Array.isArray(p) ? { lat: p[0], lng: p[1] } : p);

                    const lineString = new H.geo.LineString();
                    const polygonGroup = new H.map.Group(); // Agrupamos polígono y puntos

                    points.forEach(point => {
                        lineString.pushPoint({ lat: point.lat, lng: point.lng });

                        const vertexMarker = new H.map.Marker({ lat: point.lat, lng: point.lng }, { icon: vertexIcon });
                        vertexMarker.draggable = true;
                        polygonGroup.addObject(vertexMarker);
                    });

                    // Cerrar el polígono
                    if (points.length > 0) {
                        lineString.pushPoint({ lat: points[0].lat, lng: points[0].lng });
                    }

                    const polygon = new H.map.Polygon(lineString, {
                        style: {
                            fillColor: 'rgba(255, 0, 0, 0.4)', // Rojo transparente
                            strokeColor: '#FF0000',            // Borde rojo sólido
                            lineWidth: 2
                        }
                    });

                    polygonGroup.addObject(polygon);
                    map.addObject(polygonGroup);

                    loadedAvoidZones.push({
                        name: area.name,
                        points: area.points,
                        color: area.color,
                        polygon: polygon,
                        LineString: lineString,
                        group: polygonGroup // Guardamos referencia al grupo
                    });
                });
            }

            const loadedLines = [];
            if (routeData.routeSections && routeData.routeSections.length > 0) {
                routeData.routeSections.forEach(section => {
                    if (section.polyline) {
                        // Decodificar
                        const decodedData = decode(section.polyline);
                        const lineString = new H.geo.LineString();

                        decodedData.polyline.forEach(coords => {
                            lineString.pushPoint({ lat: coords[0], lng: coords[1] });
                        });

                        const routeLine = new H.map.Polyline(lineString, {
                            style: {
                                lineWidth: 5,
                                strokeColor: '#00BD2A'
                            }
                        });

                        map.addObject(routeLine);

                        loadedLines.push({
                            polyline: routeLine,
                            isVisible: true,
                            originalColor: '#00BD2A'
                        });
                    }
                });
            }

            let activeBtn = null;
            const transport = routeData.transportation || "";

            if (transport === "car") activeBtn = "auto";
            else if (transport === "truck") activeBtn = "camion";
            else if (transport === "scooter") activeBtn = "moto";
            else if (transport === "bus") activeBtn = "bus";
            else if (transport === "pedestrian") activeBtn = "peaton";

            let formattedTime = "";
            if (routeData.scheduledTime) {
                formattedTime = routeData.scheduledTime.substring(0, 16);
            }

            setState({
                ...state,
                isEditMode: true,
                editingRouteId: routeId,
                destinations: loadedDestinations,

                preloadedDriverId: routeData.driverId?._id || routeData.driverId,
                preloadedCustomerId: routeData.customerId?._id || routeData.customerId,

                // Datos de Vehículo
                transportation: transport,
                activeVehicleButton: activeBtn, // Esto activa el botón azul en el componente
                type_of_truck: routeData.type_of_truck || "tractor",
                number_of_axles: routeData.number_of_axles || "2",
                number_of_trailers: routeData.number_of_trailers || "1",

                // Datos de Tiempo y Modo
                time: formattedTime,
                time_type: routeData.timeType || "Salir a las:",
                mode: routeData.mode || "fast",
                traffic: routeData.traffic ? "default" : "disabled",

                // Evitación y Líneas
                avoid_parameters: routeData.avoidParameters || [],
                avoid_highways: routeData.avoidHighways || [],
                avoid_zones: loadedAvoidZones,
                lines: loadedLines,
                deviationAlertEnabled: routeData.deviationAlertEnabled || false,
                deviationAlertDistance: routeData.deviationAlertDistance || 50,
                created: true
            });

            setFormKey(prev => prev + 1);

            if (loadedDestinations.length > 0) {
                moveMapToPlace(map, loadedDestinations[0].lat, loadedDestinations[0].lng);
            }

        } catch (error) {
            console.error('Error al cargar la ruta:', error);
        }
    };

    const successCallback = (position) => {
        localStorage.setItem("current_position", JSON.stringify({ "lat": position.coords.latitude, "lng": position.coords.longitude }));
        if (state.destinations.length === 0) {
            addToDestinations(map, position.coords.latitude, position.coords.longitude);
        }
        var color = "#305fb8";
        var marker = new H.map.Marker(
            { lat: position.coords.latitude, lng: position.coords.longitude },
            {
                volatility: true,
                icon: new H.map.Icon(
                    `<svg width="32px" height="32px" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="14" cy="14" r="12" fill="${color}" fill-opacity="0.5"/>
                        <circle cx="14" cy="14" r="10" fill="${color}" stroke="white" stroke-width="2"/>
                    </svg>`
                )
            }
        );
        setTimeout(() => {
            map.addObject(marker);
            setState({
                ...state,
                current_position: { lat: position.coords.latitude, lng: position.coords.longitude },
                ephemiral_marker: [marker]
            });
        }, 1000);
    };

    const errorCallback = (error) => {
        setState(prevState => ({ ...prevState, current_position: { lat: -1, lng: -1 } }));
    };
    if (state.current_position.lat === 0 && state.current_position.lng === 0) {
        if (localStorage.getItem("current_position")) {
            var current_position = JSON.parse(localStorage.getItem("current_position"));
            moveMapToPlace(map, current_position.lat, current_position.lng);
            if (state.destinations.length == 0) {
                addToDestinations(map, current_position.lat, current_position.lng);
            }
            map.setZoom(18);
            setState(prevState => ({ ...prevState, current_position: { lat: current_position.lat, lng: current_position.lng } }));
        }
        navigator.geolocation.getCurrentPosition(successCallback, errorCallback, { maximumAge: 0, timeout: 5000, enableHighAccuracy: true });
    }
    if (!state.show_results) {
        plus_position = 0;
    }
    else {
        plus_position = 400;
    }

    const toggleSearch = () => {
        setShowSearch(!showSearch);
    };

    const addMarkerToMap = (mapDrivers, userId, lat, lng, status, name) => {
        // Asegurar que las coordenadas sean válidas antes de agregar el marcador
        if (lat !== 0 && lng !== 0) {
            let color;

            if (status === "Fuera de línea") {
                color = "#535353";

            } else if (status === "Activo") {
                color = "#007BFF";

            } else {
                color = "#FB8800";
            }

            var marker = new H.map.Marker({ lat: lat, lng: lng }, {
                volatility: true,
                icon: new H.map.Icon(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 80" width="35" height="35">
                    <path d="M17.5657349,46.446167c-0.0015259-0.0015259-0.0032349-0.0028687-0.0047607-0.0043945 c-0.5465698-0.5463867-1.0620728-1.1231079-1.5537109-1.7219238c-0.0233154-0.0283813-0.0504761-0.0531616-0.0736694-0.081665 l-0.0015869,0.0027466l-0.2249756,0.3961792c-0.0015869,0.0028076-0.0041504,0.0047607-0.0057373,0.0075684l-4.3414307,7.5969238 l6.7692261-3.8662109c0.0004883-0.0002441,0.0007935-0.0007324,0.0012817-0.0009766l0.7735596-0.4415894l0.4613037-0.2634888 c-0.0297852-0.024231-0.055603-0.0525513-0.0852661-0.0769043C18.6836548,47.5028076,18.1096802,46.989624,17.5657349,46.446167z" fill="${color}"/>
                    <path d="M49.5819092,47.3095703c-0.4559937,0.4100952-0.9260254,0.8043213-1.4137573,1.177124 c-0.0674438,0.0515747-0.1368408,0.1003418-0.204895,0.1511841c-0.5112305,0.381958-1.0353394,0.7475586-1.578125,1.086792 c-0.0280151,0.0175171-0.0571899,0.0332031-0.0852051,0.0505371c-0.5438843,0.3366089-1.1036377,0.6496582-1.6763916,0.9412231 c-0.0496826,0.0253296-0.0978394,0.0529175-0.1477661,0.0778809c-0.5656128,0.2828369-1.1468506,0.5385132-1.737854,0.7753906 c-0.0891724,0.0357666-0.1771851,0.0731812-0.2668457,0.1078491c-0.5776367,0.2232056-1.1672363,0.4217529-1.7662964,0.5993652 c-0.1055908,0.031311-0.2110596,0.0621948-0.3172607,0.092041c-0.6011353,0.1689453-1.2114868,0.3153687-1.8314209,0.4366455 c-0.1015625,0.0198364-0.2036743,0.0370483-0.3057251,0.055603c-0.6364136,0.1157227-1.2802734,0.210083-1.9337158,0.2736206 c-0.0742188,0.0072021-0.149292,0.0107422-0.2236938,0.0172729C35.4028931,53.2126465,34.7060547,53.25,34,53.25 c-0.5695801,0-1.1364746-0.0222168-1.7001953-0.0628662c-0.18927-0.0136719-0.3758545-0.0411987-0.5643311-0.0593872 c-0.37323-0.0360718-0.746582-0.0709229-1.116333-0.1246338c-0.222229-0.0323486-0.4411621-0.0784912-0.6619873-0.1171265 c-0.3319092-0.0581055-0.6641846-0.1140137-0.9926147-0.1864014c-0.2337036-0.0514526-0.4636841-0.1156006-0.6954956-0.1742554 c-0.31073-0.0786133-0.6216431-0.1558228-0.9285889-0.2472534c-0.2368164-0.0704956-0.4696655-0.1520996-0.7041016-0.2302246 c-0.2960205-0.0986328-0.5917358-0.1969604-0.883606-0.3075562c-0.2355957-0.0892334-0.4673462-0.1878662-0.7000122-0.2849121 c-0.2843018-0.1185303-0.5678101-0.2382202-0.8475952-0.3681641c-0.2312012-0.1074219-0.4587402-0.2225952-0.6866455-0.3377686 c-0.2738037-0.1384277-0.5460815-0.2793579-0.8148193-0.428894c-0.2244873-0.124939-0.4457397-0.2557983-0.6665649-0.3884888 c-0.1461792-0.0878296-0.296936-0.1660767-0.4414063-0.2572632l-0.1869507,0.1066284l-0.5266724,0.3007813 C24.5769653,53.1036377,29.1744385,54.75,34,54.75c6.9472656,0,13.1079102-3.4321289,16.8759766-8.6889648 c-0.3417969,0.359375-0.6989746,0.703125-1.0630493,1.0395508C49.7365723,47.1710815,49.6591797,47.2400513,49.5819092,47.3095703 z" fill="${color}"/>
                    <path d="M35.0696411,29.3916016C35.1741333,29.5742798,35.25,29.7744751,35.25,30v2c0,0.6904297-0.5595703,1.25-1.25,1.25 s-1.25-0.5595703-1.25-1.25v-2c0-0.2255249,0.0758667-0.4257202,0.1803589-0.6083984 C31.2240601,29.7974243,29.25,31.0061035,29.25,32v4.75h9.5V32C38.75,31.0061035,36.7759399,29.7974243,35.0696411,29.3916016z" fill="${color}"/>
                    <circle cx="34" cy="25" r="1.75" fill="${color}"/>
                    <path d="M34,9.25c-11.4414063,0-20.75,9.3085938-20.75,20.75c0,0.6381836,0.027832,1.2553711,0.0849609,1.8876953 c0.2332764,2.6195068,0.9702759,5.1741943,2.1558228,7.5108032c0.3949585,0.7784424,0.8397217,1.5326538,1.3322144,2.2570801 c1.0167847,1.4827881,2.2167358,2.8057251,3.559021,3.9781494c0.6254883,0.5462646,1.2722168,1.0700684,1.9632568,1.5439453 c2.5490723,1.7301636,5.4202881,2.8525391,8.4359741,3.3208008c0.548584,0.0852051,1.1009521,0.1525879,1.6580811,0.1938477 C32.956604,50.7307129,33.4771118,50.75,34,50.75c10.8120117,0,19.6962891-8.1088867,20.6650391-18.8623047 C54.722168,31.2602539,54.75,30.6430664,54.75,30C54.75,18.5585938,45.4414063,9.25,34,9.25z M41.25,38 c0,0.6904297-0.5595703,1.25-1.25,1.25H28c-0.6904297,0-1.25-0.5595703-1.25-1.25v-6 c0-2.0458984,1.8525391-3.5921631,3.8635864-4.4598999C30.0788574,26.8292847,29.75,25.9558105,29.75,25 c0-2.3432617,1.9067383-4.25,4.25-4.25s4.25,1.9067383,4.25,4.25c0,0.9558105-0.3288574,1.8292847-0.8635864,2.5401001 C39.3974609,28.4078369,41.25,29.9541016,41.25,32V38z" fill="${color}"/>
                </svg>`, { size: { w: 55, h: 55 } })
            });

            // Configura el evento de clic en el marcador
            marker.addEventListener('tap', () => {
                // Cierra la burbuja actual si está abierta
                if (currentBubble) {
                    ui.removeBubble(currentBubble);
                    currentBubble = null; // Resetea la burbuja actual
                }

                // Crear y agregar una nueva burbuja
                const label = new H.ui.InfoBubble({ lat: lat, lng: lng }, {
                    content: `<div style="color: ${color}; font-size: 12px; font-weight: bold; width: 120px; height: 20px; overflow: hidden; text-align: center; white-space: nowrap; display: flex; align-items: center; justify-content: center; padding: 0px;">
                            ${name}
                          </div>`,
                    backgroundColor: 'white',
                    borderColor: color,
                    fontSize: '12px',
                    padding: '0px',
                    offset: { x: 0, y: -30 } // Ajusta este valor según sea necesario
                });

                // Agrega la nueva burbuja y la asigna a `currentBubble`
                ui.addBubble(label);
                currentBubble = label;
            });

            // Agregar el marcador al mapa
            mapDrivers.addObject(marker);

            driversMarker[userId] = marker;
        }
    };

    const zoomLocation = (mapDrivers, lat, lng) => {
        mapDrivers.setCenter({ lat: lat, lng: lng });
        mapDrivers.setZoom(18);
    };

    const handleAlertClick = async (notif) => {
        await handleMarkAsSeen(notif);
        setSelectedAlert(notif);
        setShowNotificationsMenu(false);
        
        if (userSectionRef.current) userSectionRef.current.style.display = 'none';
        if (reportSectionRef.current) reportSectionRef.current.style.display = 'none';
        
        const divRoutes = document.getElementById('show-routes');
        const createRoute = document.getElementById('create-route');
        const showIndications = document.getElementById('show-indications');
        
        if (divRoutes) divRoutes.style.display = 'none';
        if (createRoute) createRoute.style.display = 'none';
        if (showIndications) showIndications.style.display = 'none';

        const menuRoutesBtn = document.getElementById('menuRoutes');
        const menuUsersBtn = document.getElementById('menuUsers');
        const menuReportsBtn = document.getElementById('menuReports');
        const menuMapBtn = document.getElementById('menuMap');

        if (menuRoutesBtn) menuRoutesBtn.classList.remove('btn-primary');
        if (menuUsersBtn) menuUsersBtn.classList.remove('btn-primary');
        if (menuReportsBtn) menuReportsBtn.classList.remove('btn-primary');
        
        if (menuMapBtn) {
            menuMapBtn.classList.add('btn-primary');
            menuMapBtn.classList.remove('btn-outline-primary');
        }

        const mapContainer = document.getElementById('map');
        const mapDriversContainer = document.getElementById('map-drivers');
        
        if (mapContainer) mapContainer.style.display = 'none';
        if (mapDriversContainer) mapDriversContainer.style.display = 'block';

        setIsTrackingOpen(false);
        setIsAlertsOpen(true);  
        
        setTimeout(() => {
            if (mapDrivers) mapDrivers.getViewPort().resize();
        }, 100);
    };

    const handleSeeMoreClick = () => {
        setShowNotificationsMenu(false);

        // Cambiar a módulo de mapas
        const menuRoutes = document.getElementById('menuRoutes');
        if (menuRoutes) {
            menuRoutes.classList.add('btn-primary');
        }

        setSelectedAlert(null);
        setIsAlertsOpen(true);
        setIsTrackingOpen(false);
    };

    return (
        <div>
            {showNotificationsMenu && (
                <div className="notification-dropdown" onClick={(e) => e.stopPropagation()}>
                    <div className="notif-list">
                        {notifications.length === 0 ? (
                            <div style={{
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                color: '#ccc',
                                fontSize: '12px'
                            }}>
                                <i className="icon-icono-notificacion" style={{ fontSize: '24px', marginBottom: '8px', opacity: 0.5 }}></i>
                                <span>No hay alertas nuevas</span>
                            </div>
                        ) : (
                            notifications
                                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                                .slice(0, 5)
                                .map((notif, index) => (
                                    <div
                                        key={index}
                                        className="notif-card"
                                        onClick={() => handleAlertClick(notif)}
                                    >
                                        <div className="notif-title">
                                            {notif.type === "ORIGINAL_ROUTE" ? "Alerta de ruta recalculada" : "Alerta de desviación"}
                                        </div>
                                        <div className="notif-subtitle">
                                            {notif.driverName || "CONDUCTOR"}
                                        </div>
                                        <div className="notif-time">
                                            {notif.timestamp ? new Date(notif.timestamp).toLocaleString('es-MX', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit',
                                                hour12: false
                                            }) : ""}
                                        </div>
                                        <div className="unread-dot"></div>
                                    </div>
                                ))
                        )}
                    </div>

                    <div className="notif-footer">
                        <button className="btn-see-more" onClick={handleSeeMoreClick}>
                            Ver más
                        </button>
                    </div>
                </div>
            )}
            <div className="container clearfix" style={{ zIndex: 1, position: "absolute", top: 50, right: 30, margin: "10px", width: "350px" }}>
                <div style={{ position: 'relative' }}>
                    {showSearch && (
                        <div style={{ marginBottom: '20px' }}>
                            <SearchComponent state={state} setState={setState} userPosition={state.current_position} moveMapToPlace={moveMapToPlace} placeholder="Busca lugares" map={map} addPoint={false} />
                        </div>
                    )}
                    {showBtnSearch && (
                        <button onClick={toggleSearch} id='btnSearch' style={{ position: 'absolute', top: 0, right: -30, borderRadius: '20%' }}>
                            <i className="icon-search"></i>
                        </button>
                    )}
                </div>
            </div>
            {
                refsReady && cardTracingRef.current && ReactDOM.createPortal(
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <TrackingComponent
                            email={email}
                            mapDrivers={mapDrivers}
                            state={state}
                            addMarkerToMap={addMarkerToMap}
                            zoomLocation={zoomLocation}
                            isOpen={isTrackingOpen}
                            toggleOpen={handleTrackingToggle}
                        />
                        <AlertsComponent
                            isOpen={isAlertsOpen}
                            toggleOpen={handleAlertsToggle}
                            selectedAlert={selectedAlert}
                            onAlertSelect={setSelectedAlert}
                           map={mapDrivers}
                           ui={uiDrivers}
                        />
                    </div>,
                    cardTracingRef.current
                )
            }
            {
                refsReady && cardDestRef.current && ReactDOM.createPortal(
                    <div key={formKey}>
                        <SelectDestinationsComponent state={state} setState={setState} changeDestination={changeDestination} addToDestinations={addToDestinations} createMarker={createMarker} map={map} moveMapToPlace={moveMapToPlace} />
                        <SelectVehiclesComponent state={state} setState={setState} />
                        <TypeTripComponent state={state} setState={setState} />
                        <ScheduleTripComponent state={state} setState={setState} />
                        <ParametersAvoidComponent state={state} setState={setState} map={map} behavior={behavior} />
                        <DeviationAlertComponent state={state} setState={setState} />
                    </div>,
                    cardDestRef.current
                )
            }
            {
                refsReady && divPrintRouteRef.current && ReactDOM.createPortal(
                    <div>
                        <PrintRouteComponent state={state} />
                    </div>,
                    divPrintRouteRef.current
                )
            }
            {
                refsReady && divAssignRouteRef.current && ReactDOM.createPortal(
                    <div>
                        <AssignRouteComponent state={state} />
                    </div>,
                    divAssignRouteRef.current
                )
            }
            {
                refsReady && cardUserInfoRef.current && ReactDOM.createPortal(
                    <div>
                        <UserComponent stateUser={stateUser} />
                    </div>,
                    cardUserInfoRef.current
                )
            }
            {
                refsReady && cardReportsInfoRef.current && ReactDOM.createPortal(
                    <div>
                        <ReportComponent />
                    </div>,
                    cardReportsInfoRef.current
                )
            }
        </div>
    )
}