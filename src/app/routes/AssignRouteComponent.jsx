//asignRouteComponent.jsx
import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { getUsersService } from '../../services/UserService';
import { assignRouteService } from '../../services/RouteService';

export default function AssignRouteComponent(state) {
    const [showModal, setShowModal] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [users, setUsers] = useState([]);
    const [filteredDrivers, setFilteredDrivers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [error, setError] = useState(null);
    const [originalDriverId, setOriginalDriverId] = useState(null);
    const [originalCustomerId, setOriginalCustomerId] = useState(null);

    useEffect(() => {
        fetchUsers(); // Carga inicial
        const handleUserUpdate = () => {
            fetchUsers();
        };

        window.addEventListener('userListUpdated', handleUserUpdate);

        return () => {
            window.removeEventListener('userListUpdated', handleUserUpdate);
        };
    }, []);

    const fetchUsers = async () => {
        try {
            const { users } = await getUsersService();
            setUsers(users);
        } catch (error) {
            setError(error.message);
        }
    };

    useEffect(() => {
        // Filtrar usuarios por type_user igual a 'Conductor' y 'Cliente'
        const drivers = users.filter(user => user.type_user === 'Conductor');
        const customers = users.filter(user => user.type_user === 'Cliente');
        setFilteredDrivers(drivers);
        setFilteredCustomers(customers);
    }, [users]);

    useEffect(() => {
        const handleOpenEvent = () => {
            // Cargar los IDs del estado global si existen
            if (state.state.preloadedDriverId) {
                setSelectedDriver(state.state.preloadedDriverId);
                setOriginalDriverId(state.state.preloadedDriverId);
            }
            if (state.state.preloadedCustomerId) {
                setSelectedCustomer(state.state.preloadedCustomerId);
                setOriginalCustomerId(state.state.preloadedCustomerId);
            }

            handleModalShow();
        };

        window.addEventListener('openAssignModal', handleOpenEvent);

        return () => {
            window.removeEventListener('openAssignModal', handleOpenEvent);
        };
    }, [state.state.preloadedDriverId, state.state.preloadedCustomerId]);

    // Actualiza los usuarios cada vez que se muestre el modal
    const handleModalShow = async () => {
        await fetchUsers();
        setShowModal(true);
    };

    const handleModalClose = () => {
        setSelectedDriver('');
        setSelectedCustomer('');
        setOriginalDriverId(null);
        setOriginalCustomerId(null);
        setShowModal(false);
    };

    const handleAssignRoute = async () => {
        try {
            // Verificar que se hayan seleccionado un conductor y un cliente
            if (!selectedDriver || !selectedCustomer) {
                Swal.fire({
                    title: '¡Debes seleccionar un conductor y un cliente válidos!',
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

            // Obtener los datos necesarios para crear la ruta
            const url = state.state.url;
            const selectedOption = state.state.selectedCardIndex;
            const origin = extractRoutePoint(state.state.destinations[0]);
            const destination = extractRoutePoint(state.state.destinations[state.state.destinations.length - 1]);
            const waypoints = state.state.destinations.slice(1, state.state.destinations.length - 1).map(point => extractRoutePoint(point));
            const tolls_total = state.state.tolls_total;
            const driverId = selectedDriver;
            const customerId = selectedCustomer;
            const departureTime = state.state.departureTime;
            const arrivalTime = state.state.arrivalTime;
            const distance = state.state.distance;
            const durationTrip = state.state.durationTrip;

            // Calcular el estado de la ruta basado en la fecha de departureTime
            let status = "Ruta no iniciada";
            const currentDateTime = new Date();
            const departureDate = new Date(departureTime);

            // Truncar horas para comparar solo fechas
            const currentDateOnly = new Date(currentDateTime.getFullYear(), currentDateTime.getMonth(), currentDateTime.getDate());
            const departureDateOnly = new Date(departureDate.getFullYear(), departureDate.getMonth(), departureDate.getDate());

            if (departureDateOnly > currentDateOnly) {
                status = "Ruta futura";
            }

            // Obtener el nombre y el correo electrónico de la persona que asigna la ruta desde sessionStorage
            const storedUserData = sessionStorage.getItem('data_user');
            if (!storedUserData) {
                Swal.fire({
                    title: '¡Error inesperado! No se pudo encontrar la información del usuario que asigna la ruta',
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

            const assignedBy = JSON.parse(storedUserData);
            const assignedByData = {
                name: assignedBy.name,
                email: assignedBy.email
            };

            const routeSections = state.state.response?.routes?.[selectedOption]?.sections || [];

            // FILTRAR SECTIONS FANTASMAS
            const sectionsToSave = routeSections
                .filter(section => {
                    const hasPolyline = section.polyline && section.polyline.length > 0;
                    const hasActions = section.actions && section.actions.length > 0;
                    const hasDistance = section.summary && section.summary.length > 0;

                    const isValid = hasPolyline && (hasActions || hasDistance);

                    if (!isValid) {
                        console.warn('Sección filtrada:', {
                            polylineLength: section.polyline?.length,
                            hasActions,
                            distance: section.summary?.length
                        });
                    }

                    return isValid;
                })
                .map(section => {
                    return {
                        polyline: section.polyline,
                        departureTime: section.departure?.time,
                        arrivalTime: section.arrival?.time,
                        distance: section.summary?.length || 0
                    };
                });

            // Construir la solicitud de la ruta
            const routeData = {
                url,
                selectedOption,
                origin,
                waypoints,
                destination,
                tolls_total,
                driverId,
                customerId,
                assignedBy: assignedByData,
                departureTime,
                arrivalTime,
                distance,
                durationTrip,
                status,
                avoidAreas: state.state.avoid_zones.map(zone => {
                    let convertedPoints = [];

                    if (Array.isArray(zone.points)) {
                        convertedPoints = zone.points.map(point => {
                            if (Array.isArray(point) && point.length === 2) {
                                return [point[0], point[1]];
                            }
                            return [point[0] || point.lat, point[1] || point.lng];
                        });
                    } else if (zone.LineString && zone.LineString.Ya) {
                        convertedPoints = zone.LineString.Ya.map(coord => [coord.lat, coord.lng]);
                    }

                    return {
                        name: zone.name,
                        points: convertedPoints,
                        color: zone.color
                    };
                }),
                avoidParameters: state.state.avoid_parameters,
                avoidHighways: state.state.avoid_highways,
                transportation: state.state.transportation,
                mode: state.state.mode,
                traffic: (() => {
                    const trafficValue = state.state.traffic;
                    if (trafficValue === 'enabled' || trafficValue === true) return true;
                    if (trafficValue === 'disabled' || trafficValue === false) return false;
                    return false;
                })(),
                timeType: state.state.time_type,
                scheduledTime: state.state.time,
                routeSections: sectionsToSave,
                deviationAlertEnabled: state.state.deviationAlertEnabled || false,  
                deviationAlertDistance: state.state.deviationAlertDistance || 50
            };

            let result;
            if (state.state.isEditMode && state.state.editingRouteId) {
                const { updateRouteService } = await import('../../services/RouteService.js');
                result = await updateRouteService(state.state.editingRouteId, routeData);
            } else {
                result = await assignRouteService(routeData);
            }

            // Solo cerrar modal y disparar evento si fue exitoso
            if (result && result.success) {
                handleModalClose();
                // Disparar evento de limpieza después del éxito
                window.dispatchEvent(new CustomEvent('routeAssignedSuccessfully'));
                window.dispatchEvent(new CustomEvent('clearPreloadedIds'));
            }

        } catch (error) {
            console.error('Error en handleAssignRoute:', error);
            Swal.fire({
                title: '¡Error inesperado! Por favor, inténtelo de nuevo',
                confirmButtonColor: '#d33',
                confirmButtonText: 'Aceptar',
                width: '400px',
                padding: '2rem',
                customClass: {
                    title: 'title-handle',
                    popup: 'popup-handle'
                }
            });
        }
    };

    const extractRoutePoint = (point) => {
        return {
            name: point.name,
            lat: point.lat,
            lng: point.lng,
            load: point.load,
            unload: point.unload,
            duration: point.duration,
            minutes: point.minutes,
            status: "Sin completar"
        };
    };

    return (
        <>
            <Modal show={showModal} onHide={handleModalClose}>
                <Modal.Header className='custom-header-modal py-1' style={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }} closeButton={false}>
                    <Modal.Title className='p-0' id="title-edition-destination">Asignar ruta</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="card text-center" style={{ background: 'rgba(140, 149, 160, 0.2)' }}>
                        <div className="card-body p-3">
                            <div className="row">
                                <div className="col-12 mt-2">
                                    <span className='custom-text'>Seleccionar conductor</span>
                                    <select
                                        className="form-control pl-1 p-0"
                                        name="driver"
                                        value={selectedDriver}
                                        onChange={(e) => setSelectedDriver(e.target.value)}
                                    >
                                        <option value="">Sin seleccionar</option>
                                        {filteredDrivers.map(user => (
                                            <option key={user._id} value={user._id}>{user.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-12 mt-2">
                                    <span className='custom-text'>Seleccionar cliente</span>
                                    <select
                                        className="form-control pl-1 p-0"
                                        name="customer"
                                        value={selectedCustomer}
                                        onChange={(e) => setSelectedCustomer(e.target.value)}
                                    >
                                        <option value="">Sin seleccionar</option>
                                        {filteredCustomers.map(user => (
                                            <option key={user._id} value={user._id}>{user.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <div className='text-center mt-3 mb-3'>
                    <Button variant="danger" className='mx-5' onClick={handleModalClose} style={{ fontSize: 15, fontWeight: '600' }}>
                        Cancelar
                    </Button>
                    <Button className='mx-5' onClick={handleAssignRoute} style={{ fontSize: 15, fontWeight: '600', backgroundColor: '#007BFF', color: '#FFFFFF' }}>
                        Confirmar
                    </Button>
                </div>
            </Modal>
        </>
    )
}
