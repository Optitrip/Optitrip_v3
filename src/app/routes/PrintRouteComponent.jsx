import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function PrintRouteComponent({ state }) {
    const [showModal, setShowModal] = useState(false);
    const [mapImage, setMapImage] = useState(null);
    const [imageCaptured, setImageCaptured] = useState(false);

    const imagePath = '/logo_optitrip.png';

    const instructions = state.instructions && state.instructions.length > 0 ? state.instructions : [];
    const combinedInstructions = [];
    const departureName = (state.destinations && state.destinations.length > 0) ? state.destinations[0].name : 'Desconocido';
    const arrivalName = (state.destinations && state.destinations.length > 0) ? state.destinations[state.destinations.length - 1].name : 'Desconocido';

    if (instructions[0]) {
        combinedInstructions.push(...instructions[0]);
    }

    if (instructions[2]) {
        combinedInstructions.push(...instructions[2]);
    }

    const generatePDF = () => {
        const doc = new jsPDF();
        const currentDate = new Date();
        const formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()} ${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}`;
        const nameDocument = `${String(currentDate.getDate())}_${String(currentDate.getMonth() + 1)}_${String(currentDate.getFullYear())}_${String(currentDate.getHours())}_${String(currentDate.getMinutes())}`;

        // Agregar logo si existe
        const img = new Image();
        img.src = imagePath; // Este es el logo fijo, no el cargado
        img.onload = () => {
            doc.addImage(img, 'PNG', 13, 13, 28, 18);

            // Agregar imagen cargada si está disponible
            if (mapImage) {
                const loadedImage = new Image();
                loadedImage.src = mapImage;
                loadedImage.onload = () => {
                    // Obtener dimensiones de la página y de la imagen
                    const pageWidthImage = doc.internal.pageSize.getWidth();
                    const imageWidth = 100;
                    const imageHeight = 80;

                    // Calcular posición centrada horizontalmente
                    const xPosition = (pageWidthImage - imageWidth) / 2;
                    const yPosition = 50; // Ajusta según la posición vertical deseada

                    doc.addImage(loadedImage, 'PNG', xPosition, yPosition, imageWidth, imageHeight);

                    doc.setFontSize(10);
                    doc.setFont("helvetica", "bold");
                    doc.text(`Generado el día: ${formattedDate} hrs`, 135, 15);

                    doc.setFontSize(18);
                    doc.text('Itinerario de ruta', doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });

                    const formatDate = (dateStr) => {
                        const date = new Date(dateStr);
                        const day = date.getDate().toString().padStart(2, '0');
                        const month = (date.getMonth() + 1).toString().padStart(2, '0');
                        const year = date.getFullYear();
                        const hours = date.getHours().toString().padStart(2, '0');
                        const minutes = date.getMinutes().toString().padStart(2, '0');
                        return `${day}/${month}/${year} ${hours}:${minutes}`;
                    };

                    doc.setFontSize(13);
                    doc.text('Datos generales', 14, 150);

                    const tableData = [
                        {
                            description: 'Punto de origen',
                            name: departureName,
                            date: formatDate(state.departureTime),
                        },
                        {
                            description: 'Punto de destino',
                            name: arrivalName,
                            date: formatDate(state.arrivalTime)
                        }
                    ];

                    const marginLeft = 14;
                    const marginRight = 14;
                    const pageWidth = doc.internal.pageSize.getWidth();
                    const tableWidth = pageWidth - marginLeft - marginRight;

                    const descriptionWidth = tableWidth * 0.2;
                    const nameWidth = tableWidth * 0.6;
                    const dateWidth = tableWidth * 0.2;

                    doc.autoTable({
                        startY: 152,
                        head: [['', 'Lugar', 'Fecha y hora']],
                        body: tableData.map(row => [row.description, row.name, row.date]),
                        theme: 'striped',
                        headStyles: {
                            fillColor: [200, 200, 200],
                            textColor: [0, 0, 0],
                            halign: 'center',
                            valign: 'middle'
                        },
                        bodyStyles: {
                            halign: 'center',
                            valign: 'middle'
                        },
                        margin: { left: marginLeft, right: marginRight },
                        columnStyles: {
                            0: { cellWidth: descriptionWidth },
                            1: { cellWidth: nameWidth },
                            2: { cellWidth: dateWidth }
                        },
                        width: tableWidth
                    });

                    const routeDetailsData = [
                        {
                            title: 'Distancia a recorrer',
                            value: state.distance
                        },
                        {
                            title: 'Duración del viaje',
                            value: state.durationTrip
                        },
                        {
                            title: 'Costo de ruta',
                            value: state.tolls_total
                        }
                    ];

                    doc.autoTable({
                        startY: doc.autoTable.previous.finalY + 10,
                        head: [['Distancia a recorrer', 'Duración del viaje', 'Costo de ruta']],
                        body: [
                            [
                                `${state.distance} km`,
                                state.durationTrip,
                                `$${state.tolls_total}`,
                            ]
                        ],
                        theme: 'striped',
                        headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], halign: 'center', valign: 'middle' },
                        bodyStyles: { halign: 'center', valign: 'middle' }
                    });

                    doc.setFontSize(13);
                    doc.text('Instrucciones', 14, doc.autoTable.previous.finalY + 13);

                    const instructionsTableData = combinedInstructions.map((item, index) => [
                        index + 1,
                        item.instruction
                    ]);

                    doc.autoTable({
                        startY: doc.autoTable.previous.finalY + 15,
                        head: [['No.', 'Instrucción']],
                        body: instructionsTableData,
                        theme: 'striped',
                        headStyles: {
                            fillColor: [200, 200, 200],
                            textColor: [0, 0, 0],
                            halign: 'center',
                            valign: 'middle'
                        },
                        bodyStyles: {
                            halign: 'left',
                            valign: 'middle'
                        },
                        margin: { left: marginLeft, right: marginRight },
                        columnStyles: {
                            0: { cellWidth: 20 },
                            1: { cellWidth: tableWidth - 20 }
                        },
                        width: tableWidth
                    });

                    doc.save(`itinerario_ruta_${nameDocument}.pdf`);
                };
            }
        };

        setMapImage(null);
        setImageCaptured(false);
        setShowModal(false);
    };

    const handleModalShow = () => {
        setShowModal(true);
    };

    const handleModalClose = () => {
        setMapImage(null);
        setImageCaptured(false);
        setShowModal(false);
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setMapImage(reader.result);
                setImageCaptured(true);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <>
            <button className="btn p-1 pl-2 pr-2 ml-4 mr-5" type="button" style={{ background: '#E4E4E4' }} onClick={handleModalShow}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 80" fill="none" x="0px" y="0px" style={{ width: '21px', height: '21px' }}>
                    <path fillRule="evenodd" clipRule="evenodd" d="M39.9783 4H20C16.6863 4 14 6.68629 14 10V21H10C5.58172 21 2 24.5817 2 29V43C2 47.4183 5.58172 51 10 51H11V40C11 38.6739 11.5268 37.4022 12.4645 36.4645C13.4022 35.5268 14.6739 35 16 35H48C50.7614 35 53 37.2386 53 40V51H54C58.4183 51 62 47.4183 62 43V29C62 24.5817 58.4183 21 54 21H50V16C50 15.9706 49.9994 15.9412 49.9981 15.912M38 14C38 16.2091 39.7909 18 42 18H46V21H18V10C18 8.89543 18.8954 8 20 8H38V14ZM15 30C15 31.1046 14.1046 32 13 32H11C9.89543 32 9 31.1046 9 30C9 28.8954 9.89543 28 11 28H13C14.1046 28 15 28.8954 15 30Z" fill="black" />
                    <path d="M50 40C50 38.8954 49.1046 38 48 38H16C15.4696 38 14.9609 38.2107 14.5858 38.5858C14.2107 38.9609 14 39.4696 14 40V54C14 57.3137 16.6863 60 20 60H44C47.3137 60 50 57.3137 50 54V40Z" fill="black" />
                </svg>
            </button>
            <Modal show={showModal} onHide={handleModalClose}>
                <Modal.Header className='custom-header-modal py-1' style={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }} closeButton={false}>
                    <Modal.Title className='p-0' id="title-edition-destination">Agregar captura de mapa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <label htmlFor="imageUpload" className='text-modal' style={{ display: 'block', marginBottom: '10px', fontSize: 13 }}>
                        Subir captura del mapa:
                    </label>
                    <input
                        id="imageUpload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'block', marginBottom: '10px' }}
                    />
                    {mapImage && (
                        <img
                            src={mapImage}
                            alt="Uploaded"
                            style={{ width: '100%', marginTop: '10px' }}
                        />
                    )}
                    <div className='text-center mt-3 mb-3'>
                        <Button variant="secondary" className='mx-5' onClick={handleModalClose} style={{ fontSize: 15, fontWeight: '600' }}>
                            Cerrar
                        </Button>
                        <Button className='mx-5' disabled={!mapImage} onClick={generatePDF} style={{ fontSize: 15, fontWeight: '600', backgroundColor: '#007BFF', color: '#FFFFFF' }}>
                            Confirmar
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
}
