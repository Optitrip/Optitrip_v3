// UserComponent.jsx
import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { getUsersService, createUserService, updateUserService, deleteUserService, resetPasswordService, moveAccountService } from '../../services/UserService.js';

export default function UserComponent(stateUser) {
    const userAuthenticatedEmail = stateUser.stateUser.email;
    const [dataUsers, setDataUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [filterName, setFilterName] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [searchInput, setSearchInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [error, setError] = useState(null);
    const [showModalCreate, setShowModalCreate] = useState(false);
    const [selectedSuperiorAccount, setSelectedSuperiorAccount] = useState(null);
    const [userSelectedData, setUserSelectedData] = useState([]);
    const [checkboxUsers, setCheckboxUsers] = useState([]);
    const [isCardBodyOpen, setIsCardBodyOpen] = useState(true);
    const [showModalUpdate, setShowModalUpdate] = useState(false);
    const [currentEditUser, setCurrentEditUser] = useState(null);
    const [showMoveAccountModal, setShowMoveAccountModal] = useState(false);
    const [selectedAccountToMove, setSelectedAccountToMove] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [allowedRoles, setAllowedRoles] = useState([]);
    const [newUser, setNewUser] = useState({
        superior_account: '',
        type_user: '',
        name: '',
        email: '',
        password: '111111', // Contraseña inicial
        phone: '',
        rol_id: ''
    });

    // useEffect para establecer selectedSuperiorAccount una vez que userAuthenticatedEmail esté disponible
    useEffect(() => {
        if (userAuthenticatedEmail) {
            setSelectedSuperiorAccount(userAuthenticatedEmail);
        }
    }, [userAuthenticatedEmail]);

    // useEffect para actualizar newUser.superior_account cuando cambia selectedSuperiorAccount
    useEffect(() => {
        if (selectedSuperiorAccount) {
            setNewUser(prevState => ({
                ...prevState,
                superior_account: selectedSuperiorAccount
            }));
        }
    }, [selectedSuperiorAccount]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { users } = await getUsersService();
                setDataUsers(users);

                if (selectedSuperiorAccount) {

                    const selectedUser = users.filter(user => user.email === selectedSuperiorAccount);
                    setUserSelectedData(selectedUser);
                }
            } catch (error) {
                setError(error.message);
            }
        };
        fetchUsers();
    }, [selectedSuperiorAccount]);

    useEffect(() => {
        applyFilters();
    }, [filterName, filterType, selectedSuperiorAccount, dataUsers]);

    useEffect(() => {
        const fetchAllowedRoles = async () => {
            const storedUserData = sessionStorage.getItem('data_user');
            if (storedUserData) {
                const currentUser = JSON.parse(storedUserData);
                const userRole = currentUser.role; // "Super Administrador", "Distribuidor", etc.

                // Mapeo de roles permitidos según jerarquía
                const rolePermissions = {
                    'Super Administrador': ['Distribuidor', 'Administrador', 'Cliente', 'Conductor'],
                    'Distribuidor': ['Administrador', 'Cliente', 'Conductor'],
                    'Administrador': ['Cliente', 'Conductor']
                };

                setAllowedRoles(rolePermissions[userRole] || []);
            }
        };

        fetchAllowedRoles();
    }, []);

    const applyFilters = () => {
        let filtered = [...dataUsers]; // Usamos dataUsers aquí para aplicar los filtros sobre todos los usuarios

        if (selectedSuperiorAccount) {
            filtered = filtered.filter(user => user.superior_account === selectedSuperiorAccount);
        }

        if (filterName.trim() !== '') {
            filtered = filtered.filter(user => user.name.toLowerCase().includes(filterName.trim().toLowerCase()));
        }

        if (filterType !== 'all') {
            filtered = filtered.filter(user => user.type_user === filterType);
        }

        setFilteredUsers(filtered);
    };

    const handleFilterNameChange = (event) => {
        setFilterName(event.target.value);
    };

    const handleFilterTypeChange = (event) => {
        setFilterType(event.target.value);
    };

    const handleShowModalCreate = () => {
        setNewUser(prevState => ({
            ...prevState,
            superior_account: selectedSuperiorAccount
        }));
        setShowModalCreate(true);
    };

    const handleCloseModalCreate = () => {
        setShowModalCreate(false);
        setFieldErrors({}); // Limpiar errores
        // Limpiar el formulario al cerrar el modal
        setNewUser({
            superior_account: '',
            type_user: '',
            name: '',
            email: '',
            password: '111111',
            phone: '',
            rol_id: ''
        });
    };
    const handleInputChange = (event) => {
        const { name, value } = event.target;

        // Limpiar el error del campo cuando el usuario empiece a escribir
        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }

        // Validar y actualizar el campo de teléfono
        if (name === 'phone') {
            // Permitir solo números y limitar a 10 caracteres
            const phoneNumber = value.replace(/\D/g, '').slice(0, 10);
            setNewUser({ ...newUser, [name]: phoneNumber });
        } else {
            setNewUser({ ...newUser, [name]: value });
        }
    };

    const handleShowModalUpdate = (user) => {
        setCurrentEditUser(user);
        setShowModalUpdate(true);
    };

    const handleCloseModalUpdate = () => {
        setShowModalUpdate(false);
        setCurrentEditUser(null);
    };

    const handleShowMoveAccountModal = () => {
        if (checkboxUsers.length === 0) {
            Swal.fire({
                title: '¡Debe de seleccionar al menos un usuario antes de intentar mover la cuenta!',
                confirmButtonColor: '#d33',
                confirmButtonText: 'Aceptar',
                width: '400px',
                padding: '2rem',
                customClass: {
                    title: 'title-handle',
                    popup: 'popup-handle'
                }
            });
        } else {
            setShowMoveAccountModal(true);
        }
    };

    const handleCloseMoveAccountModal = () => {
        setShowMoveAccountModal(false);
        setSelectedAccountToMove('');
        setCheckboxUsers([]);
    };

    const handleShowMoveAccountModalButton = (userId, event) => {
        event.stopPropagation(); // Detener la propagación del evento para que no se active el onClick de la fila

        // Seleccionar solo el usuario por su ID
        setCheckboxUsers([userId]);

        // Mostrar el modal
        setShowMoveAccountModal(true);
    };

    // Agrupar usuarios por cuenta superior
    const superiorAccounts = dataUsers.reduce((acc, user) => {
        const key = user.superior_account || 'optitripmex@gmail.com'; // Agrupa por superior_account o 'Optitrip' si no hay superior_account
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(user.email);
        return acc;
    }, {});

    if (superiorAccounts['optitripmex@gmail.com']) {
        superiorAccounts['optitripmex@gmail.com'] = superiorAccounts['optitripmex@gmail.com'].filter(email => email !== "optitripmex@gmail.com");
    }

    function nestAccounts(superiorAccounts, userAuthenticatedEmail) {
        const nestedAccounts = {};

        // Función recursiva para anidar las cuentas
        function nest(account) {
            if (superiorAccounts[account]) {
                const nestedSubAccounts = {};
                superiorAccounts[account].forEach(subAccount => {
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
    const nestedSuperiorAccounts = nestAccounts(superiorAccounts, userAuthenticatedEmail);

    // Función para determinar el color del ícono basado en el rol
    const getIconColor = (email) => {
        const user = dataUsers.find(user => user.email === email);
        if (user) {
            switch (user.type_user) {
                case 'Administrador':
                    return '#fb8800'; // Naranja
                case 'Distribuidor':
                    return '#fb8800'; // Naranja
                case 'Cliente':
                    return '#808080'; // Gris
                case 'Conductor':
                    return '#007BFF'; // Azul
                default:
                    return '#000000'; // Negro por defecto
            }
        } else {
            return '#000000'; // Negro por defecto si no se encuentra el usuario
        }
    };

    const [expandedAccounts, setExpandedAccounts] = useState([]);

    // Función para manejar la expansión de cuentas
    const toggleExpand = (account) => {
        if (expandedAccounts.includes(account)) {
            setExpandedAccounts(expandedAccounts.filter(acc => acc !== account));
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

    const handleCreateUser = async () => {
        // Validar campos
        const errors = {};
        if (!newUser.type_user || newUser.type_user === 'Seleccionar opción') errors.type_user = true;
        if (!newUser.name.trim()) errors.name = true;
        if (!newUser.email.trim()) errors.email = true;
        if (!newUser.phone.trim()) errors.phone = true;

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            Swal.fire({
                title: '¡Campos incompletos! Favor de completar los campos faltantes',
                confirmButtonColor: '#d33',
                confirmButtonText: 'Aceptar',
                width: '400px',
                padding: '2rem',
                customClass: {
                    title: 'title-handle',
                    popup: 'popup-handle'
                }
            });
            return; // Detener la ejecución
        }

        // Limpiar errores si todo está correcto
        setFieldErrors({});

        try {
            let rol_id;
            switch (newUser.type_user) {
                case 'Administrador':
                    rol_id = '665a3fa1b9397c6a4a0756cd';
                    break;
                case 'Cliente':
                    rol_id = '666744007348f2ae62817a74';
                    break;
                case 'Conductor':
                    rol_id = '6677d0702c684374a602531d';
                    break;
                default:
                    break;
            }

            const userWithRoleId = { ...newUser, rol_id };
            await createUserService(userWithRoleId);
            setShowModalCreate(false);
            const { users } = await getUsersService();
            setDataUsers(users);

            // Actualizar filteredUsers después de obtener los nuevos datos de los usuarios
            const filtered = users.filter(user => user.superior_account === selectedSuperiorAccount);
            setFilteredUsers(filtered);

            setNewUser({
                superior_account: '',
                type_user: '',
                name: '',
                email: '',
                password: '111111',
                phone: '',
                rol_id: ''
            });
        } catch (error) {
            // El modal permanece abierto para que el usuario corrija
        }
    };

    const handleUpdateUser = async () => {
        if (currentEditUser) {
            try {
                let rol_id;
                switch (currentEditUser.type_user) {
                    case 'Administrador':
                        rol_id = '665a3fa1b9397c6a4a0756cd';
                        break;
                    case 'Cliente':
                        rol_id = '666744007348f2ae62817a74';
                        break;
                    case 'Conductor':
                        rol_id = '6677d0702c684374a602531d';
                        break;
                    default:
                        break;
                }

                const updatedData = {
                    superior_account: currentEditUser.superior_account,
                    type_user: currentEditUser.type_user,
                    name: currentEditUser.name,
                    email: currentEditUser.email,
                    phone: currentEditUser.phone,
                    rol_id: rol_id // Asignar el rol_id determinado
                };

                await updateUserService(currentEditUser._id, updatedData);
                setShowModalUpdate(false);

                // Actualizar la lista de usuarios
                const { users } = await getUsersService();
                setDataUsers(users);

                // Actualizar filteredUsers después de obtener los nuevos datos de los usuarios
                const filtered = users.filter(user => user.superior_account === selectedSuperiorAccount);
                setFilteredUsers(filtered);

                setCurrentEditUser(null);
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
        } else {
            Swal.fire({
                title: '¡Campos incompletos! Favor de completar los campos faltantes',
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

    const handleDeleteUser = async (userId) => {
        Swal.fire({
            title: '¿Está seguro de que desea eliminar este usuario?',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            customClass: {
                title: 'title-handle',
                popup: 'popup-handle'
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteUserService(userId); // Pasar el _id del usuario para eliminar
                    const { users } = await getUsersService();
                    setDataUsers(users);

                    const filtered = users.filter(user => user.superior_account === selectedSuperiorAccount);
                    setFilteredUsers(filtered);

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
            }
        });
    };

    const handleMoveAccount = async () => {
        if (selectedAccountToMove === "") {
            Swal.fire({
                title: '¡Debes seleccionar una opción válida!',
                confirmButtonColor: '#d33',
                confirmButtonText: 'Aceptar',
                width: '400px',
                padding: '2rem',
                customClass: {
                    title: 'title-handle',
                    popup: 'popup-handle'
                }
            });
            return; // Salir de la función si no se ha seleccionado una opción válida
        }

        // Verificar si todas las cuentas seleccionadas ya están en la cuenta de destino
        const usersToMove = checkboxUsers.map(id => filteredUsers.find(user => user._id === id));
        const allInTargetAccount = usersToMove.every(user => user.superior_account === selectedAccountToMove);

        if (allInTargetAccount) {
            const accountNames = usersToMove.map(user => user.name).join(', ');

            // Definir el título basado en la cantidad de cuentas seleccionadas
            const title = usersToMove.length === 1 ?
                '¡La cuenta seleccionada ya está en la cuenta de destino!' :
                '¡Las cuentas seleccionadas ya están en la cuenta de destino!';

            Swal.fire({
                title: title,
                confirmButtonColor: '#d33',
                confirmButtonText: 'Aceptar',
                width: '400px',
                padding: '2rem',
                customClass: {
                    title: 'title-handle',
                    popup: 'popup-handle'
                }
            });
            return; // Salir de la función si todas las cuentas ya están en la cuenta de destino
        }

        try {
            const ids = checkboxUsers; // Usamos los IDs de los usuarios seleccionados

            // Llama a moveAccountService
            await moveAccountService(ids, selectedAccountToMove);

            // Obtén los usuarios actualizados
            const { users } = await getUsersService();
            setDataUsers(users);

            // Filtra los usuarios por cuenta superior seleccionada
            const filtered = users.filter(user => user.superior_account === selectedSuperiorAccount);
            setFilteredUsers(filtered);

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

        handleCloseMoveAccountModal();
    };

    const handleResetPassword = async (userId) => {
        Swal.fire({
            title: '¿Confirmar para reestablecer la contraseña de usuario?',
            html:
                '<div class="title-handle popup-handle">La nueva contraseña se convertirá en: "111111"</div>',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Confirmar',
            cancelButtonText: 'Cancelar',
            customClass: {
                title: 'title-handle',
                popup: 'popup-handle'
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await resetPasswordService(userId); // Pasar el _id del usuario para eliminar
                    const { users } = await getUsersService();
                    setDataUsers(users);

                    const filtered = users.filter(user => user.superior_account === selectedSuperiorAccount);
                    setFilteredUsers(filtered);

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
            }
        });
    };

    const handleCheckboxChange = (e, userId) => {
        e.stopPropagation();
        setCheckboxUsers(prevState => {
            if (prevState.includes(userId)) {
                return prevState.filter(id => id !== userId);
            } else {
                return [...prevState, userId];
            }
        });
    };

    const handleRowClick = (userId) => {
        setCheckboxUsers(prevState => {
            if (prevState.includes(userId)) {
                return prevState.filter(id => id !== userId);
            } else {
                return [...prevState, userId];
            }
        });
    };

    const getValidSuperiorAccounts = () => {
        const validAccounts = [];
        const selectedUserIds = checkboxUsers.map(userId => String(userId));

        // Función recursiva para obtener cuentas válidas
        const collectValidAccounts = (accounts) => {
            Object.entries(accounts).forEach(([account, subAccounts]) => {
                const user = dataUsers.find(user => user.email === account);
                if (user && (user.type_user === 'Administrador' || user.type_user === 'Super Administrador' || user.type_user === 'Distribuidor') && !selectedUserIds.includes(String(user._id))) {
                    validAccounts.push(user.email);
                }
                if (Object.keys(subAccounts).length > 0) {
                    collectValidAccounts(subAccounts); // Recurse into sub-accounts
                }
            });
        };

        // Empezar desde la cuenta de usuario autenticado
        collectValidAccounts(nestedSuperiorAccounts[userAuthenticatedEmail]);

        return validAccounts;
    };


    // Verificación si el tipo de usuario es 'Conductor' o 'Cliente'
    const isTypeCount = userSelectedData.length > 0 &&
        (userSelectedData[0].type_user === 'Conductor' || userSelectedData[0].type_user === 'Cliente');

    const handleFilterName = (event) => {
        const value = event.target.value;
        setSearchInput(value);
        if (value.trim() === '') {
            setSuggestions([]);
        } else {
            const filteredSuggestions = filteredUsers.filter(user =>
                user.name.toLowerCase().includes(value.trim().toLowerCase())
            );
            setSuggestions(filteredSuggestions);
        }
    };

    const handleSuggestionClick = (email) => {
        setSelectedSuperiorAccount(email);
        setSearchInput('');
        setSuggestions([]);
    };

    return (
        <div>
            <div className="row">
                <div className='col-lg-3 col-md-4 col-sm-12 mt-3 pl-3'>
                    <div className="card" style={{ height: 'fit-content', maxHeight: 'calc(100vh - 55px - 20px)', overflowY: 'auto', overflowX: 'hidden', borderRadius: '10px', height: isCardBodyOpen ? 'calc(100vh - 20px)' : 'fit-content', zIndex: 1 }}>
                        <div className="card-header" id="card-diagrama-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', padding: '0px' }}>
                            <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>Diagrama de cuentas</span>
                            <button className="btn ml-auto mr-2 custom-btn" style={{ padding: 0 }} onClick={() => setIsCardBodyOpen(!isCardBodyOpen)}>
                                {isCardBodyOpen ? <i className="icon-circle-up"></i> : <i className="icon-circle-down"></i>}
                            </button>
                        </div>
                        {isCardBodyOpen && (
                            <div className="card-body p-0">
                                <div className="row">
                                    <div className="col-12">
                                        <div className="input-group p-3" style={{ position: 'relative' }}>
                                            <input
                                                type="text"
                                                className="form-control"
                                                style={{ height: '23px', paddingRight: '30px' }}
                                                placeholder="Ingresar nombre"
                                                value={searchInput}
                                                onChange={handleFilterName}
                                            />
                                            <i
                                                className="icon-search-2"
                                                style={{
                                                    position: 'absolute',
                                                    right: '15px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                }}
                                            ></i>
                                        </div>

                                        {suggestions.length > 0 && (
                                            <ul className="list-group pl-3" style={{ position: 'absolute', zIndex: 1000, display: 'flex', flexDirection: 'column', width: '100%' }}>
                                                <div className="row">
                                                    <div className="col-md-5">
                                                        {suggestions.slice(0, Math.ceil(suggestions.length / 2)).map((suggestion) => (
                                                            <li
                                                                key={suggestion.email}
                                                                className="list-group-item list-group-item-action count-option mb-2 p-2"
                                                                onClick={() => handleSuggestionClick(suggestion.email)}
                                                                style={{ cursor: 'pointer', background: '#007BFF' }}
                                                            >
                                                                {suggestion.name}
                                                            </li>
                                                        ))}
                                                    </div>
                                                    <div className="col-md-5">
                                                        {suggestions.slice(Math.ceil(suggestions.length / 2)).map((suggestion) => (
                                                            <li
                                                                key={suggestion.email}
                                                                className="list-group-item list-group-item-action count-option mb-2 p-2"
                                                                onClick={() => handleSuggestionClick(suggestion.email)}
                                                                style={{ cursor: 'pointer', background: '#007BFF' }}
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
                                    <div className="card mt-2">
                                        {nestedSuperiorAccounts && Object.keys(nestedSuperiorAccounts).map(account => (
                                            <div key={account} className="mb-2">
                                                {renderNestedAccounts(nestedSuperiorAccounts)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className='col-lg-9 col-md-8 col-sm-12 mt-3'>
                    <div className="card" style={{ zIndex: 1, height: 'calc(-20px + 100vh)', maxHeight: 'calc(-75px + 100vh)' }}>
                        <div className="card-body p-3" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
                            <div className="row">
                                <div className="col-lg-3 col-md-6 col-sm-6 col-12 p-0 pl-4 mb-2">
                                    <i className="fas fa-user" style={{ color: getIconColor(userSelectedData.length > 0 ? userSelectedData[0].email : null), fontSize: 11 }} />
                                    <label className='text-count-2 ml-2'>Cuenta:</label>
                                    <span className='ml-2 text-count-2'>
                                        {userSelectedData.length > 0 ? userSelectedData[0].name : 'Cargando...'}
                                    </span>
                                </div>
                                <div className="col-lg-3 col-md-6 col-sm-6 col-12 p-0 pl-4 mb-2">
                                    <label className='text-count-2'>Tipo de cuenta:</label>
                                    <span className='ml-2 text-count-3'>{userSelectedData.length > 0 ? userSelectedData[0].type_user : 'Cargando...'}</span>
                                </div>
                                <div className="col-lg-2 col-md-6 col-sm-6 col-6 p-0 pl-4 mb-2">
                                    <label className='text-count-2'>Teléfono:</label>
                                    <span className='ml-2 text-count-3'>{userSelectedData.length > 0 ? userSelectedData[0].phone : 'Cargando...'}</span>
                                </div>
                                <div className="col-lg-4 col-md-6 col-sm-6 col-12 p-0 pl-4 mb-2">
                                    <label className='text-count-2'>Correo:</label>
                                    <span className='ml-2 text-count-3'>{userSelectedData.length > 0 ? userSelectedData[0].email : 'Cargando...'}</span>
                                </div>
                                <div className="col-lg-4 col-md-12 col-sm-12 col-12 p-0 pl-4 pr-4">
                                    <div className="d-flex align-items-center mt-1 mb-4">
                                        <label htmlFor="txtCustomerName" className="mr-2 mb-0 text-modal">Nombre del cliente:</label>
                                        <input type="text" id="txtCustomerName" className="form-control" style={{ flex: '1', height: 20 }} placeholder='Ingresar nombre' onChange={handleFilterNameChange} />
                                    </div>
                                </div>
                                <div className="col-lg-3 col-md-6 col-sm-9 col-9 p-0 pl-4 pr-4 mb-3">
                                    <div className="d-flex align-items-center">
                                        <label htmlFor="selectCount" className="mr-2 mb-0 text-modal">Tipo de cuenta:</label>
                                        <div className="flex-grow-1">
                                            <select className="form-control p-0" style={{ height: 20 }} onChange={handleFilterTypeChange}>
                                                <option value="all">Todas</option>
                                                <option value="Administrador">Administrador</option>
                                                <option value="Cliente">Cliente</option>
                                                <option value="Conductor">Conductor</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-5 col-md-6 col-sm-3 col-3 p-0 pl-4 pr-4 mb-3"></div>
                                <div className="col-lg-2 col-md-6 col-sm-6 col-6 p-0 pl-4">
                                    <button className='btn btn-primary pt-0' type="button" style={{ height: 20 }} onClick={handleShowModalCreate} disabled={isTypeCount}>
                                        <i className='fas fa-user mr-2'></i>
                                        <span className='text-count-3' style={{ color: '#FFFFFF' }}>Nueva cuenta</span>
                                    </button>
                                </div>
                                <div className="col-lg-2 col-md-6 col-sm-6 col-6 p-0 pl-4">
                                    <button className='btn btn-primary pt-0' type="button" style={{ height: 20 }} disabled={isTypeCount} onClick={handleShowMoveAccountModal}>
                                        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="-5.0 -10.0 110.0 135.0" style={{ width: '18px', height: '18px', marginRight: '5px' }}>
                                            <g fill="white">
                                                <path d="m58.332 25c0 11.508-9.3242 20.832-20.832 20.832s-20.832-9.3242-20.832-20.832 9.3242-20.832 20.832-20.832 20.832 9.3242 20.832 20.832" />
                                                <path d="m91.043 58.707-12.293-10.582c-0.61328-0.56641-1.4922-0.74219-2.2773-0.46484-0.78516 0.28125-1.3516 0.97266-1.4727 1.7969v3.7109c-0.046875 0.87891-0.78516 1.5625-1.668 1.5391h-11.664c-1.7812-0.046875-3.2656 1.3477-3.3359 3.125v3.125c0.070313 1.7812 1.5547 3.1719 3.3359 3.125h11.668-0.003907c0.88281-0.023437 1.6211 0.66016 1.668 1.543v5.207c0.12109 0.82812 0.6875 1.5195 1.4727 1.7969 0.78516 0.28125 1.6641 0.10156 2.2773-0.46094l12.293-10.582v-0.003907c0.48828-0.3125 0.78516-0.85547 0.78516-1.4375s-0.29688-1.1211-0.78516-1.4375z" />
                                                <path d="m49.5 87.832c-1.3281-1.1133-2.0977-2.7617-2.0977-4.5 0-1.7344 0.76953-3.3828 2.0977-4.5l12.25-10.582c-1.9727 0.042969-3.8867-0.69922-5.3086-2.0703-1.4219-1.3672-2.2422-3.2461-2.2734-5.2227v-3.125c0.023437-2.4219 1.2578-4.6758 3.2891-6-2.3086-1.1836-4.8633-1.8086-7.457-1.832h-25c-4.4219 0-8.6602 1.7578-11.785 4.8828s-4.8828 7.3633-4.8828 11.785v20.832c0 1.1055 0.44141 2.1641 1.2227 2.9453s1.8398 1.2227 2.9453 1.2227h41.457z" />
                                                <path d="m52.25 82 12.293-10.582c0.61328-0.56641 1.4883-0.74609 2.2773-0.46484 0.78516 0.27734 1.3516 0.97266 1.4727 1.7969v3.707c0.042969 0.88281 0.78516 1.5664 1.6641 1.543h11.668c1.7812-0.046875 3.2656 1.3477 3.332 3.125v3.125c-0.066406 1.7773-1.5508 3.1719-3.332 3.125h-11.668c-0.87891-0.023438-1.6211 0.66016-1.6641 1.543v5c-0.12109 0.82422-0.6875 1.5156-1.4727 1.7969-0.78906 0.27734-1.6641 0.10156-2.2773-0.46484l-12.293-10.582c-0.40625-0.32422-0.64062-0.81641-0.64062-1.3359 0-0.51562 0.23438-1.0078 0.64062-1.332z" />
                                            </g>
                                        </svg>
                                        <span className='text-count-3' style={{ color: '#FFFFFF' }}>Mover cuenta</span>
                                    </button>
                                </div>
                                <div className="col-lg-12 mt-4">
                                    <div className="table-responsive">
                                        <table className="table table-hover text-center">
                                            <thead>
                                                <tr>
                                                    <th><input type="checkbox" /></th>
                                                    <th>No.</th>
                                                    <th>Tipo de cuenta</th>
                                                    <th>Nombre del usuario</th>
                                                    <th>Correo electrónico</th>
                                                    <th>Teléfono</th>
                                                    <th>Acción</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredUsers.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="7" style={{ textAlign: 'center' }} className='text-count-3'>No hay datos</td>
                                                    </tr>
                                                ) : (
                                                    filteredUsers.map((user, index) => (
                                                        <tr key={user._id} style={{ backgroundColor: checkboxUsers.includes(user._id) ? '#F7DAB8' : 'transparent' }} onClick={() => handleRowClick(user._id)}>
                                                            <td onClick={(e) => e.stopPropagation()}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={checkboxUsers.includes(user._id)}
                                                                    onChange={(e) => handleCheckboxChange(e, user._id)}
                                                                />
                                                            </td>
                                                            <td className='text-count-3'>{index + 1}</td>
                                                            <td className='text-count-3'>{user.type_user}</td>
                                                            <td className='text-count-3'>{user.name}</td>
                                                            <td className='text-count-3'>{user.email}</td>
                                                            <td className='text-count-3'>{user.phone}</td>
                                                            <td className="button-cell">
                                                                <button className='btn' type="button" onClick={() => handleShowModalUpdate(user)}>
                                                                    <i className='icon-pencil'></i>
                                                                </button>
                                                                <button className='btn' type="button" onClick={() => handleDeleteUser(user._id)}>
                                                                    <i className='icon-bin'></i>
                                                                </button>
                                                                <button className="btn" type="button" onClick={() => handleResetPassword(user._id)}>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="-5.0 -10.0 110.0 135.0" style={{ width: '18px', height: '18px' }}>
                                                                        <g>
                                                                            <path d="M50,23.034c-8.333,0-15.111,6.779-15.111,15.111v5.877h-1.89c-2.318,0-4.197,1.879-4.197,4.197v22.248 c0,2.317,1.879,4.197,4.197,4.197H67c2.318,0,4.197-1.88,4.197-4.197V48.22c0-2.318-1.879-4.197-4.197-4.197h-1.889v-5.877 C65.111,29.813,58.332,23.034,50,23.034z M43.283,38.146c0-3.703,3.014-6.716,6.717-6.716s6.716,3.013,6.716,6.716v5.877H43.283 V38.146z M62.803,66.27H37.197V52.418h25.605V66.27z" />
                                                                            <path d="M95.802,45.803c-2.318,0-4.197,1.879-4.197,4.197c0,22.941-18.664,41.605-41.604,41.605 C27.059,91.605,8.395,72.941,8.395,50C8.395,27.059,27.059,8.396,50,8.396c8.774,0,17.211,2.759,24.206,7.766h-5.541 c-2.318,0-4.198,1.879-4.198,4.198c0,2.318,1.88,4.197,4.198,4.197h16.161c2.318,0,4.197-1.879,4.197-4.197V4.198 C89.023,1.879,87.145,0,84.826,0s-4.198,1.879-4.198,4.198v6.285C71.936,3.741,61.198,0,50,0C36.645,0,24.088,5.201,14.645,14.645 C5.2,24.089,0,36.645,0,50s5.2,25.912,14.645,35.355C24.088,94.8,36.645,100,50,100c13.354,0,25.911-5.2,35.354-14.645 C94.799,75.912,100,63.355,100,50C100,47.682,98.12,45.803,95.802,45.803z" />
                                                                        </g>
                                                                    </svg>
                                                                </button>
                                                                <button className="btn" type="button" onClick={(e) => handleShowMoveAccountModalButton(user._id, e)}>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="-5.0 -10.0 110.0 135.0" style={{ width: '18px', height: '18px' }}>
                                                                        <g>
                                                                            <path d="m58.332 25c0 11.508-9.3242 20.832-20.832 20.832s-20.832-9.3242-20.832-20.832 9.3242-20.832 20.832-20.832 20.832 9.3242 20.832 20.832" />
                                                                            <path d="m91.043 58.707-12.293-10.582c-0.61328-0.56641-1.4922-0.74219-2.2773-0.46484-0.78516 0.28125-1.3516 0.97266-1.4727 1.7969v3.7109c-0.046875 0.87891-0.78516 1.5625-1.668 1.5391h-11.664c-1.7812-0.046875-3.2656 1.3477-3.3359 3.125v3.125c0.070313 1.7812 1.5547 3.1719 3.3359 3.125h11.668-0.003907c0.88281-0.023437 1.6211 0.66016 1.668 1.543v5.207c0.12109 0.82812 0.6875 1.5195 1.4727 1.7969 0.78516 0.28125 1.6641 0.10156 2.2773-0.46094l12.293-10.582v-0.003907c0.48828-0.3125 0.78516-0.85547 0.78516-1.4375s-0.29688-1.1211-0.78516-1.4375z" />
                                                                            <path d="m49.5 87.832c-1.3281-1.1133-2.0977-2.7617-2.0977-4.5 0-1.7344 0.76953-3.3828 2.0977-4.5l12.25-10.582c-1.9727 0.042969-3.8867-0.69922-5.3086-2.0703-1.4219-1.3672-2.2422-3.2461-2.2734-5.2227v-3.125c0.023437-2.4219 1.2578-4.6758 3.2891-6-2.3086-1.1836-4.8633-1.8086-7.457-1.832h-25c-4.4219 0-8.6602 1.7578-11.785 4.8828s-4.8828 7.3633-4.8828 11.785v20.832c0 1.1055 0.44141 2.1641 1.2227 2.9453s1.8398 1.2227 2.9453 1.2227h41.457z" />
                                                                            <path d="m52.25 82 12.293-10.582c0.61328-0.56641 1.4883-0.74609 2.2773-0.46484 0.78516 0.27734 1.3516 0.97266 1.4727 1.7969v3.707c0.042969 0.88281 0.78516 1.5664 1.6641 1.543h11.668c1.7812-0.046875 3.2656 1.3477 3.332 3.125v3.125c-0.066406 1.7773-1.5508 3.1719-3.332 3.125h-11.668c-0.87891-0.023438-1.6211 0.66016-1.6641 1.543v5c-0.12109 0.82422-0.6875 1.5156-1.4727 1.7969-0.78906 0.27734-1.6641 0.10156-2.2773-0.46484l-12.293-10.582c-0.40625-0.32422-0.64062-0.81641-0.64062-1.3359 0-0.51562 0.23438-1.0078 0.64062-1.332z" />
                                                                        </g>
                                                                    </svg>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Modal show={showModalCreate} onHide={handleCloseModalCreate}>
                <Modal.Header className='custom-header-modal py-1' style={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }} closeButton={false}>
                    <Modal.Title className='p-0' id="title-edition-destination">Nueva cuenta</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="card text-center" style={{ background: 'rgba(140, 149, 160, 0.2)' }}>
                        <div className="card-body p-3">
                            <div className="row">
                                <div className="col-12 mt-2">
                                    <span className='custom-text'>Cuenta superior</span>
                                    <input
                                        type="text"
                                        className='form-control text-modal'
                                        name="superior_account"
                                        value={newUser.superior_account}
                                        onChange={handleInputChange}
                                        readOnly
                                    />
                                </div>
                                <div className="col-12 mt-2">
                                    <span className='custom-text'>Tipo de cuenta</span>
                                    <select
                                        className="form-control pl-1 p-0"
                                        name="type_user"
                                        value={newUser.type_user}
                                        onChange={handleInputChange}
                                        style={{
                                            borderColor: fieldErrors.type_user ? 'red' : '',
                                            borderWidth: fieldErrors.type_user ? '2px' : ''
                                        }}
                                    >
                                        <option value="">Seleccionar opción</option>
                                        {allowedRoles.map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>

                                    {allowedRoles.length === 0 && (
                                        <small className="text-danger">No tienes permisos para crear usuarios</small>
                                    )}
                                </div>
                                <div className="col-12 mt-2">
                                    <span className='custom-text'>Nombre del usuario</span>
                                    <input
                                        type="text"
                                        className='form-control text-modal'
                                        name="name"
                                        value={newUser.name}
                                        onChange={handleInputChange}
                                        placeholder='Ingrese el nombre del usuario'
                                        style={{ borderColor: fieldErrors.name ? 'red' : '', borderWidth: fieldErrors.name ? '2px' : '' }}
                                    />
                                </div>
                                <div className="col-12 mt-2">
                                    <span className='custom-text'>Correo electrónico</span>
                                    <input
                                        type="text"
                                        className='form-control text-modal'
                                        name="email"
                                        value={newUser.email}
                                        onChange={handleInputChange}
                                        placeholder='Ingrese el correo electrónico'
                                        style={{ borderColor: fieldErrors.email ? 'red' : '', borderWidth: fieldErrors.email ? '2px' : '' }}
                                    />
                                </div>
                                <div className="col-12 mt-2">
                                    <span className='custom-text'>Contraseña</span>
                                    <input
                                        type="password"
                                        className='form-control text-modal'
                                        name="password"
                                        value={newUser.password}
                                        onChange={handleInputChange}
                                    />
                                    <span className='custom-text-2'>Contraseña inicial: 111111</span>
                                </div>
                                <div className="col-12 mt-2">
                                    <span className='custom-text'>Teléfono</span>
                                    <input
                                        type="text"
                                        className='form-control text-modal'
                                        name="phone"
                                        value={newUser.phone}
                                        onChange={handleInputChange}
                                        placeholder='Ingrese el teléfono'
                                        style={{ borderColor: fieldErrors.phone ? 'red' : '', borderWidth: fieldErrors.phone ? '2px' : '' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='text-center mt-3'>
                        <Button variant="danger" className='mx-5' onClick={handleCloseModalCreate} style={{ fontSize: 15, fontWeight: '600' }}>
                            Cancelar
                        </Button>
                        <Button className='mx-5' onClick={handleCreateUser} style={{ fontSize: 15, fontWeight: '600', backgroundColor: '#007BFF', color: '#FFFFFF' }}>
                            Guardar
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
            <Modal show={showModalUpdate} onHide={handleCloseModalUpdate}>
                <Modal.Header className='custom-header-modal py-1' style={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }} closeButton={false}>
                    <Modal.Title className='p-0' id="title-edition-destination">Editar cuenta</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="card text-center" style={{ background: 'rgba(140, 149, 160, 0.2)' }}>
                        <div className="card-body p-3">
                            <div className="row">
                                <div className="col-12 mt-2">
                                    <span className='custom-text'>Cuenta superior</span>
                                    <input
                                        type="text"
                                        className='form-control text-modal'
                                        name="superior_account"
                                        value={currentEditUser ? currentEditUser.superior_account : ''}
                                        onChange={(e) => setCurrentEditUser({ ...currentEditUser, superior_account: e.target.value })}
                                        readOnly
                                    />
                                </div>
                                <div className="col-12 mt-2">
                                    <span className='custom-text'>Tipo de cuenta</span>
                                    <select
                                        className="form-control pl-1 p-0"
                                        name="type_user"
                                        value={currentEditUser ? currentEditUser.type_user : ''}
                                        onChange={(e) => setCurrentEditUser({ ...currentEditUser, type_user: e.target.value })}
                                    >
                                        <option>Seleccionar opción</option>
                                        <option value="Administrador">Administrador</option>
                                        <option value="Cliente">Cliente</option>
                                        <option value="Conductor">Conductor</option>
                                        {currentEditUser && currentEditUser.type_user === 'Distribuidor' && (
                                            <option value="Distribuidor">Distribuidor</option>
                                        )}
                                    </select>
                                </div>
                                <div className="col-12 mt-2">
                                    <span className='custom-text'>Nombre del usuario</span>
                                    <input
                                        type="text"
                                        className='form-control text-modal'
                                        name="name"
                                        value={currentEditUser ? currentEditUser.name : ''}
                                        onChange={(e) => setCurrentEditUser({ ...currentEditUser, name: e.target.value })}
                                        placeholder='Ingrese el nombre del usuario'
                                    />
                                </div>
                                <div className="col-12 mt-2">
                                    <span className='custom-text'>Correo electrónico</span>
                                    <input
                                        type="text"
                                        className='form-control text-modal'
                                        name="email"
                                        value={currentEditUser ? currentEditUser.email : ''}
                                        onChange={(e) => setCurrentEditUser({ ...currentEditUser, email: e.target.value })}
                                        disabled="true"
                                        placeholder='Ingrese el correo electrónico'
                                    />
                                </div>
                                <div className="col-12 mt-2">
                                    <span className='custom-text'>Contraseña</span>
                                    <input
                                        type="password"
                                        className='form-control text-modal'
                                        name="password"
                                        value={currentEditUser ? currentEditUser.password : ''}
                                        onChange={(e) => setCurrentEditUser({ ...currentEditUser, password: e.target.value })}
                                    />
                                    <span className='custom-text-2'>Contraseña inicial: 111111</span>
                                </div>
                                <div className="col-12 mt-2">
                                    <span className='custom-text'>Teléfono</span>
                                    <input
                                        type="text"
                                        className='form-control text-modal'
                                        name="phone"
                                        value={currentEditUser ? currentEditUser.phone : ''}
                                        onChange={(e) => setCurrentEditUser({ ...currentEditUser, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                        placeholder='Ingrese el teléfono'
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='text-center mt-3'>
                        <Button variant="danger" className='mx-5' onClick={handleCloseModalUpdate} style={{ fontSize: 15, fontWeight: '600' }}>
                            Cancelar
                        </Button>
                        <Button className='mx-5' onClick={handleUpdateUser} style={{ fontSize: 15, fontWeight: '600', backgroundColor: '#007BFF', color: '#FFFFFF' }}>
                            Actualizar
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
            <Modal show={showMoveAccountModal} onHide={handleCloseMoveAccountModal}>
                <Modal.Header className='custom-header-modal py-1' style={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }} closeButton={false}>
                    <Modal.Title className='p-0' id="title-edition-destination">Mover cuenta</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="card text-center" style={{ background: 'rgba(140, 149, 160, 0.2)' }}>
                        <div className="card-body p-3">
                            <div className="row">
                                <div className="col-12 mt-2">
                                    <span className='custom-text'>Cuenta destino</span>
                                    <select
                                        className="form-control pl-1 p-0"
                                        name="type_user"
                                        value={selectedAccountToMove}
                                        onChange={(e) => setSelectedAccountToMove(e.target.value)}
                                    >
                                        <option value="">Seleccione una cuenta</option>
                                        {stateUser.stateUser.email && (
                                            <option key={stateUser.stateUser.email} value={stateUser.stateUser.email}>
                                                {stateUser.stateUser.email}
                                            </option>
                                        )}
                                        {getValidSuperiorAccounts().map((email) => (
                                            <option key={email} value={email}>
                                                {email}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <div className='text-center mt-3 mb-3'>
                    <Button variant="danger" className='mx-5' onClick={handleCloseMoveAccountModal} style={{ fontSize: 15, fontWeight: '600' }}>
                        Cancelar
                    </Button>
                    <Button className='mx-5' onClick={handleMoveAccount} style={{ fontSize: 15, fontWeight: '600', backgroundColor: '#007BFF', color: '#FFFFFF' }}>
                        Confirmar
                    </Button>
                </div>
            </Modal>
        </div>
    );
}