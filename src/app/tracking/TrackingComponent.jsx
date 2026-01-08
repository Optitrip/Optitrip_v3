import React, { useEffect, useState } from "react";
import { getUsersAdminService, getUsersDriverService } from "../../services/UserService.js";
import { bold } from "fontawesome";

const statusColors = {
    'Fuera de línea': '#535353', // Gris
    'Activo': '#007BFF',         // Azul (en ruta)
    'Disponible': '#FB8800'      // Naranja (disponible para asignar)
};

export default function TrackingComponent({ email, mapDrivers, state, addMarkerToMap, zoomLocation, isOpen, toggleOpen, onDriversUpdate }) {
    const [dataUsers, setDataUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [filteredDrivers, setFilteredDrivers] = useState([])
    const [filterName, setFilterName] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [searchInput, setSearchInput] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [selectedSuperiorAccount, setSelectedSuperiorAccount] = useState(null);
    const [userSelectedData, setUserSelectedData] = useState([]);
    const [error, setError] = useState("");
    const [driversOnline, setDriversOnline] = useState(0);
    const [driversOffline, setDriversOffline] = useState(0);
    const [filteredDriversStatus, setFilteredDriversStatus] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all');
    const [updateInterval, setUpdateInterval] = useState(30000);


    // useEffect para establecer selectedSuperiorAccount una vez que userAuthenticatedEmail esté disponible
    useEffect(() => {
        if (email) {
            setSelectedSuperiorAccount(email);
        }
    }, [email]);

    useEffect(() => {
        applyFilters(); // Aplicar filtros cuando cambien filterName o filterType
    }, [filterName, filterType]);

    const applyFilters = () => {
        let filtered = [...dataUsers]; // Usamos dataUsers aquí para aplicar los filtros sobre todos los usuarios

        if (selectedSuperiorAccount) {
            filtered = filtered.filter(
                (user) => user.superior_account === selectedSuperiorAccount
            );
        }

        if (filterName.trim() !== "") {
            filtered = filtered.filter((user) =>
                user.name.toLowerCase().includes(filterName.trim().toLowerCase())
            );
        }

        if (filterType !== "all") {
            filtered = filtered.filter((user) => user.type_user === filterType);
        }

        setFilteredUsers(filtered);
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { users } = await getUsersAdminService();
                setDataUsers(users);

                if (selectedSuperiorAccount) {
                    // Filtrar usuarios según la cuenta seleccionada
                    const filtered = dataUsers.filter(
                        (user) => user.superior_account === selectedSuperiorAccount
                    );

                    setFilteredUsers(filtered);

                    // Filtrar el usuario con la cuenta superior seleccionada
                    const selectedUser = dataUsers.filter(
                        (user) => user.email === selectedSuperiorAccount
                    );

                    // Establecer los datos del usuario seleccionado
                    setUserSelectedData(selectedUser);
                }
            } catch (error) {
                setError(error.message);
            }
        };
        fetchUsers();
    }, [selectedSuperiorAccount]);

    useEffect(() => {
        // Función para obtener los conductores
        const fetchUsersDriver = async () => {
            if (selectedSuperiorAccount) {
                try {
                    const { users } = await getUsersDriverService(selectedSuperiorAccount);
                    setFilteredDrivers(users);
                    if (onDriversUpdate) {
                        onDriversUpdate(users);
                    }
                } catch (error) {
                    setError(error.message);
                }
            }
        };

        // Inicializa la primera llamada
        fetchUsersDriver();

        // Configura el intervalo para actualizar cada `updateInterval` milisegundos
        const intervalId = setInterval(() => {
            fetchUsersDriver();
        }, updateInterval);

        // Limpia el intervalo cuando el componente se desmonte o se actualice el intervalo
        return () => clearInterval(intervalId);
    }, [selectedSuperiorAccount, updateInterval]);

    // Agrupar usuarios por cuenta superior
    const superiorAccounts = dataUsers.reduce((acc, user) => {
        const key = user.superior_account || "optitripmex@gmail.com"; // Agrupa por superior_account o 'Optitrip' si no hay superior_account
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(user.email);
        return acc;
    }, {});

    if (superiorAccounts["optitripmex@gmail.com"]) {
        superiorAccounts["optitripmex@gmail.com"] = superiorAccounts[
            "optitripmex@gmail.com"
        ].filter((email) => email !== "optitripmex@gmail.com");
    }

    function nestAccounts(superiorAccounts, userAuthenticatedEmail) {
        const nestedAccounts = {};

        // Función recursiva para anidar las cuentas
        function nest(account) {
            if (superiorAccounts[account]) {
                const nestedSubAccounts = {};
                superiorAccounts[account].forEach((subAccount) => {
                    if (superiorAccounts[subAccount]) {
                        nestedSubAccounts[subAccount] = nest(subAccount);
                    } else {
                        nestedSubAccounts[subAccount] = [];
                    }
                });
                return nestedSubAccounts;
            } else {
                return [];
            }
        }

        // Iniciar anidación desde el usuario autenticado
        nestedAccounts[userAuthenticatedEmail] = nest(userAuthenticatedEmail);

        // Retornar la estructura anidada del usuario autenticado
        return nestedAccounts;
    }

    // Llamar a la función para obtener la estructura anidada
    const nestedSuperiorAccounts = nestAccounts(
        superiorAccounts,
        email
    );
    // Función para determinar el color del ícono basado en el rol
    const getIconColor = (email) => {
        const user = dataUsers.find((user) => user.email === email);
        if (user) {
            switch (user.type_user) {
                case "Administrador":
                    return "#fb8800"; // Naranja
                case "Distribuidor":
                    return "#fb8800"; // Naranja
                case "Cliente":
                    return "#808080"; // Gris
                case "Conductor":
                    return "#007BFF"; // Azul
                default:
                    return "#000000"; // Negro por defecto
            }
        } else {
            return "#fb8800"; // Negro por defecto si no se encuentra el usuario
        }
    };

    const [expandedAccounts, setExpandedAccounts] = useState([]);

    // Función para manejar la expansión de cuentas
    const toggleExpand = (account) => {
        if (expandedAccounts.includes(account)) {
            setExpandedAccounts(expandedAccounts.filter((acc) => acc !== account));
        } else {
            setExpandedAccounts([...expandedAccounts, account]);
        }
    };

    const handleAccountClick = (account) => {
        setSelectedSuperiorAccount(account);
    };

    const renderNestedAccounts = (accounts, level = 0) => {
        return (
            <div>
                {Object.entries(accounts).map(([account, subAccounts]) => (
                    <div key={account} style={{
                        marginLeft: `${Object.keys(subAccounts).length > 0 ? '0px' : '16px'}`,
                        marginTop: `${Object.keys(subAccounts).length > 0 ? '0px' : '5px'}`,
                        paddingTop: `${Object.keys(subAccounts).length > 0 ? '5px' : '0px'}`,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                {Object.keys(subAccounts).length > 0 && (
                                    <i className={`fas ml-2 mr-1 ${expandedAccounts.includes(account) ? 'fa-caret-up' : 'fa-caret-down'}`} onClick={() => toggleExpand(account)}></i>
                                )}
                                <i className='fas fa-user mr-2' style={{ color: getIconColor(account), fontSize: 11 }}></i>
                                <span
                                    onClick={() => handleAccountClick(account)}
                                    style={{ color: selectedSuperiorAccount === account ? 'blue' : 'inherit' }} // Cambiar color del email seleccionado a azul
                                >
                                    {account}
                                </span>
                            </div>
                        </div>
                        {expandedAccounts.includes(account) && (
                            <div style={{ marginLeft: Object.keys(subAccounts).length > 0 ? '20px' : '0px' }}>
                                {renderNestedAccounts(subAccounts, level + 1)}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const handleFilterName = (event) => {
        const value = event.target.value;
        setSearchInput(value);

        if (value.trim() === "") {
            setSuggestions([]);

        } else {
            const filteredSuggestions = dataUsers.filter((user) =>
                user.name.toLowerCase().includes(value.trim().toLowerCase())
            );
            setSuggestions(filteredSuggestions);
        }
    };

    const handleSuggestionClick = (email) => {
        setSelectedSuperiorAccount(email);
        setSearchInput("");
        setSuggestions([]);
    };

    const getCurrentLocalDateTime = (utcDateString) => {
        // Crear un objeto Date a partir del string en formato UTC
        const date = new Date(utcDateString);

        // Restar 5 segundos
        date.setSeconds(date.getSeconds());

        // Definir las opciones de formato para la fecha y hora local
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        };

        // Convertir la fecha a una cadena en la zona horaria local
        return date.toLocaleString(undefined, options);
    };


    // Actualizar mapa con marcadores
    useEffect(() => {
        if (filterStatus === 'all') {
            setFilteredDriversStatus(filteredDrivers);
        }

        if (mapDrivers) {
            const currentObjects = mapDrivers.getObjects();

            const objectsToRemove = currentObjects.filter(obj => {
                const data = obj.getData();
                const isProtected = data && (data.protected || data.persistentAlert || data.isAlertMarker);
                return !isProtected;
            });

            mapDrivers.removeObjects(objectsToRemove);

            filteredDriversStatus.forEach((driver) => {
                if (!driver.tracking || !driver.tracking.location) {
                    return;
                }

                const { latitude, longitude } = driver.tracking.location;

                if (latitude !== 0 && longitude !== 0) {
                    addMarkerToMap(mapDrivers, driver._id, latitude, longitude, driver.tracking.status, driver.name);
                }
            });
        }

        const offlineCount = filteredDrivers.filter(driver =>
            driver.tracking && driver.tracking.status === "Fuera de línea"
        ).length;

        const availableCount = filteredDrivers.filter(driver =>
            driver.tracking && driver.tracking.status === "Disponible"
        ).length;

        const activeCount = filteredDrivers.filter(driver =>
            driver.tracking && driver.tracking.status === "Activo"
        ).length;

        // Total en línea = Disponibles + Activos
        const onlineCount = availableCount + activeCount;

        setDriversOnline(onlineCount);
        setDriversOffline(offlineCount);

    }, [filteredDrivers, filteredDriversStatus, filterStatus, mapDrivers, addMarkerToMap]);


    const handleFilterStatusChange = (status) => {
    setFilterStatus(status);

    let filtered = [...filteredDrivers];

    if (status === 'available') {
        // Solo conductores disponibles (sin ruta)
        filtered = filtered.filter((user) =>
            user.tracking && user.tracking.status === 'Disponible'
        );
    } else if (status === 'active') {
        // Solo conductores activos (en ruta)
        filtered = filtered.filter((user) =>
            user.tracking && user.tracking.status === 'Activo'
        );
    } else if (status === 'offline') {
        // Solo conductores fuera de línea
        filtered = filtered.filter((user) =>
            user.tracking && user.tracking.status === 'Fuera de línea'
        );
    } else {
        // Todos los conductores
        filtered = [...filteredDrivers];
    }

    setFilteredDriversStatus(filtered);
};

    const handleZoomLocation = (latitude, longitude) => {
        zoomLocation(mapDrivers, latitude, longitude);
    }

    const convertToUpperCase = (str) => {
        if (typeof str === 'string') {
            return str.toUpperCase();
        }
    };

    return (
        <div className="card" style={{
            borderRadius: '10px',
            overflow: 'hidden',
            border: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
            {/* Header Naranja */}
            <div className="card-header" onClick={toggleOpen} style={{
                background: 'linear-gradient(to right, #FB8800, #FB8800)',
                color: 'white',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'relative',
                borderRadius: '10px 10px 0 0'
            }}>
                {/* Título centrado absolutamente */}
                <span style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontWeight: 'bold',
                    fontSize: '14px'
                }}>
                    Diagrama de cuentas
                </span>

                <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', marginRight: '8px', marginTop: '3px' }}>
                    <i className={isOpen ? "icon-circle-up" : "icon-circle-down"}></i>
                </div>
            </div>

            {isOpen && (
                <div className="card-body p-0">
                    <div className="row">
                        <div className="col-12">
                            <div className="input-group p-3" style={{ position: "relative" }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    style={{ height: "23px", paddingRight: "30px" }}
                                    placeholder="Ingresar nombre"
                                    value={searchInput}
                                    onChange={handleFilterName}
                                />
                                <i
                                    className="icon-search-2"
                                    style={{
                                        position: "absolute",
                                        right: "15px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                    }}
                                ></i>
                            </div>

                            {suggestions.length > 0 && (
                                <ul
                                    className="list-group pl-3"
                                    style={{
                                        position: "absolute",
                                        zIndex: 1000,
                                        display: "flex",
                                        flexDirection: "column",
                                        width: "100%",
                                    }}
                                >
                                    <div className="row">
                                        <div className="col-md-5">
                                            {suggestions
                                                .slice(0, Math.ceil(suggestions.length / 2))
                                                .map((suggestion) => (
                                                    <li
                                                        key={suggestion.email}
                                                        className="list-group-item list-group-item-action count-option mb-2 p-2"
                                                        onClick={() => handleSuggestionClick(suggestion.email)}
                                                        style={{ cursor: "pointer", background: "#007BFF" }}
                                                    >
                                                        {suggestion.name}
                                                    </li>
                                                ))}
                                        </div>
                                        <div className="col-md-5">
                                            {suggestions
                                                .slice(Math.ceil(suggestions.length / 2))
                                                .map((suggestion) => (
                                                    <li
                                                        key={suggestion.email}
                                                        className="list-group-item list-group-item-action count-option mb-2 p-2"
                                                        onClick={() => handleSuggestionClick(suggestion.email)}
                                                        style={{ cursor: "pointer", background: "#007BFF" }}
                                                    >
                                                        {suggestion.name}
                                                    </li>
                                                ))}
                                        </div>
                                    </div>
                                </ul>
                            )}
                        </div>
                    </div>
                    <div className="pl-3 pr-3 mb-3">
                        <div className="card mt-2" style={{ borderColor: "#007bff", height: '30vh', overflowY: 'auto', overflowX: 'hidden' }}>
                            {nestedSuperiorAccounts &&
                                Object.keys(nestedSuperiorAccounts).map((account) => (
                                    <div key={account} className="mb-2">
                                        {renderNestedAccounts(nestedSuperiorAccounts)}
                                    </div>
                                ))}
                        </div>
                    </div>
                    <div className="pl-3 pr-3 mb-3">
                        <div className="card mt-2" style={{ borderColor: "#007bff", height: '30vh', overflowY: 'auto', overflowX: 'hidden' }}>
                            {filteredDrivers.length > 0 ? (
                                <>
                                    <div className="row text-center">
                                        <div className="col-3 pt-2 pb-2 pr-0 pl-1">
                                            <button
                                                onClick={() => handleFilterStatusChange('all')}
                                                type="button"
                                                className={`btn btn-light btn-sm ${filterStatus === 'all' ? 'btn-status-active' : ''}`}
                                                style={{ borderColor: "#000000", borderRadius: 15, fontSize: 8 }}
                                            >
                                                TODOS ({filteredDrivers.length})
                                            </button>
                                        </div>
                                        <div className="col-3 pt-2 pb-2 pr-0 pl-0">
                                            <button
                                                onClick={() => handleFilterStatusChange('available')}
                                                type="button"
                                                className={`btn btn-light btn-sm ${filterStatus === 'available' ? 'btn-status-active' : ''}`}
                                                style={{ borderColor: "#000000", borderRadius: 15, fontSize: 8 }}
                                            >
                                                DISPONIBLES ({availableCount})
                                            </button>
                                        </div>
                                        <div className="col-3 pt-2 pb-2 pr-0 pl-0">
                                            <button
                                                onClick={() => handleFilterStatusChange('active')}
                                                type="button"
                                                className={`btn btn-light btn-sm ${filterStatus === 'active' ? 'btn-status-active' : ''}`}
                                                style={{ borderColor: "#000000", borderRadius: 15, fontSize: 8 }}
                                            >
                                                EN RUTA ({activeCount})
                                            </button>
                                        </div>
                                        <div className="col-3 pt-2 pb-2 pl-0 pr-1">
                                            <button
                                                onClick={() => handleFilterStatusChange('offline')}
                                                type="button"
                                                className={`btn btn-light btn-sm ${filterStatus === 'offline' ? 'btn-status-active' : ''}`}
                                                style={{ borderColor: "#000000", borderRadius: 15, fontSize: 8 }}
                                            >
                                                OFFLINE ({offlineCount})
                                            </button>
                                        </div>
                                    </div>
                                    <div className="row text-center mt-2">
                                        <div className="col-12 pt-2 pb-2">
                                            <select
                                                id="updateInterval"
                                                className="form-select form-select-sm"
                                                value={updateInterval}
                                                onChange={(e) => setUpdateInterval(Number(e.target.value))}
                                                style={{ border: "noneS", color: "#000000", borderRadius: 15, fontSize: 10, backgroundColor: "rgb(206, 206, 206)" }}
                                            >
                                                <option value={30000}>Actualizar cada: 30 s</option>
                                                <option value={60000}>Actualizar cada: 1 min</option>
                                                <option value={90000}>Actualizar cada: 1:30 min</option>
                                                <option value={120000}>Actualizar cada: 2 min</option>
                                                <option value={150000}>Actualizar cada: 2:30 min</option>
                                                <option value={180000}>Actualizar cada: 3 min</option>
                                                <option value={210000}>Actualizar cada: 3:30 min</option>
                                                <option value={240000}>Actualizar cada: 4 min</option>
                                                <option value={270000}>Actualizar cada: 4:30 min</option>
                                                <option value={300000}>Actualizar cada: 5 min</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="pt-2 pb-4">
                                        {filteredDriversStatus.map((driver, index) => {
                                            const driverStatus = driver.tracking?.status || 'Fuera de línea';
                                            const backgroundColor = statusColors[driverStatus] || '#535353';

                                            return (
                                                <div key={index} className="col-12 pt-2" style={{ paddingLeft: 8, paddingRight: 8 }}>
                                                    <button id={`btnReportsDriver${index}`} type="button" className={'btn btn-lg btn-light'} onClick={() => {
                                                        if (driver.tracking?.location?.latitude && driver.tracking?.location?.longitude) {
                                                            handleZoomLocation(driver.tracking.location.latitude, driver.tracking.location.longitude);
                                                        }
                                                    }} style={{ width: '100%', height: 40, padding: 0, paddingLeft: 5, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', textAlign: 'left', borderRadius: 10 }}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="-5.0 -10.0 110.0 135.0" className={'icon-active-report'} style={{ width: '30px', height: '30px', paddingTop: 2, background: backgroundColor, borderRadius: 6 }}>
                                                            <path d="m57.711 64.23c-1.0234-1.0234-2.418-1.6055-3.8672-1.6055l-22.645 0.003906-4.0938-20.16h22.109c3.0195 0 5.4727-2.4453 5.4727-5.4727 0-3.0195-2.4492-5.4727-5.4727-5.4727l-28.801 0.003906c-1.6445 0-3.1953 0.73438-4.2344 2.0078-1.0391 1.2695-1.4531 2.9414-1.125 4.5547l6.3125 31.105c0.51953 2.5469 2.7617 4.3828 5.3633 4.3828h24.852l18.414 18.414c1.0664 1.0703 2.4688 1.6055 3.8672 1.6055 1.3984 0 2.8008-0.53125 3.8672-1.6055 2.1367-2.1367 2.1367-5.6016 0-7.7344zm23.77-32.703h-13.332v-6.5781c0-3.0195-2.4492-5.4727-5.4727-5.4727-3.0195 0-5.4727 2.4492-5.4727 5.4727v21.98c0 3.0195 2.4492 5.4727 5.4727 5.4727 3.0234 0 5.4727-2.4492 5.4727-5.4727v-4.4609h13.332c3.0195 0 5.4727-2.4453 5.4727-5.4727-0.003906-3.0195-2.4531-5.4688-5.4727-5.4688zm-57.785-25.117c5.8828 0 10.648 4.7695 10.648 10.648 0 5.8828-4.7695 10.648-10.648 10.648-5.8789 0-10.648-4.7656-10.648-10.648 0-5.8789 4.7695-10.648 10.648-10.648z" />
                                                        </svg>
                                                        <div className="mr-3" style={{ marginLeft: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                            <span className={'text-driver-name'} style={{ fontWeight: 'bold' }}>{driver.name}</span>
                                                            <span className={'text-driver-date'}>
                                                                {driver.tracking?.location?.timestamp
                                                                    ? getCurrentLocalDateTime(driver.tracking.location.timestamp)
                                                                    : '--/--/----, --:--:--'}
                                                            </span>
                                                        </div>
                                                        <span className={'text-driver-date pl-2 pr-2 ml-1'} style={{ border: '2px solid', borderColor: backgroundColor, borderRadius: 10, fontSize: 10, color: backgroundColor, fontWeight: 'bold' }}>
                                                            {convertToUpperCase(driverStatus)}
                                                        </span>
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            ) : (
                                <div className="col-12 mt-2">
                                    <span className={'text-driver-date text-center'} style={{ fontSize: 10 }}>NO HAY CONDUCTORES ASOCIADOS A ESTA CUENTA</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
