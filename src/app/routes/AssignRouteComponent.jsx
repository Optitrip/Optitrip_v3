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

    useEffect(() => {
        fetchUsers();
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

    // Actualiza los usuarios cada vez que se muestre el modal
    const handleModalShow = async () => {
        await fetchUsers();
        setShowModal(true);
    };

    const handleModalClose = () => {
        setSelectedDriver('');
        setSelectedCustomer('');
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
                avoidAreas: state.state.avoid_zones.map(zone => ({
                    name: zone.name,
                    points: zone.points,
                    color: zone.color
                })),
                avoidParameters: state.state.avoid_parameters,
                avoidHighways: state.state.avoid_highways,
                transportation: state.state.transportation,
                mode: state.state.mode,
                traffic: state.state.traffic,
                timeType: state.state.time_type,
                scheduledTime: state.state.time
            };

            // Llamar al servicio para asignar la ruta
            await assignRouteService(routeData);
            console.log('🚀 Datos a enviar:', JSON.stringify(routeData, null, 2));

            // Cerrar el modal después de completar la asignación
            handleModalClose();

        } catch (error) {
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
            <button className="btn p-0 pr-1 pt-1" type="button" style={{ background: '#E4E4E4' }} onClick={handleModalShow}>
                <svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 100 125" x="0px" y="0px" style={{ width: '25px', height: '25px' }}>
                    <path d="M41.46,87.24H70a9.86,9.86,0,0,0,9.86-9.86V22.62A9.86,9.86,0,0,0,70,12.76H41.46a9.86,9.86,0,0,0-9.86,9.86V46.13H20.18v7.49H31.6V77.38A9.86,9.86,0,0,0,41.46,87.24ZM38.94,26.87H72.48V73H38.94V53.62h11.9l-5.71,5.7,5.3,5.3,9.82-9.83,5.3-5.29-5.3-5.3-9.82-9.82-5.3,5.29,6.46,6.46H38.94Z" />
                </svg>
            </button>
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
                                        onChange={(e) => setSelectedDriver(e.target.value)}
                                    >
                                        <option value=""></option>
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
                                        onChange={(e) => setSelectedCustomer(e.target.value)}
                                    >
                                        <option value=""></option>
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
