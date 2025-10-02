// Función para mostrar las indicaciones de la ruta generada
export const createIndications = (color, formattedTime, distance, tolls_total, instructions, origin, destination) => {
    // Oculta la sección de las rutas generadas
    const divRoutes = document.getElementById('show-routes');
    const divIndications = document.getElementById('show-indications');
    divRoutes.style.display = "none";
    divIndications.style.display = 'block';

    // Accedemos a los elementos en dónde se mostrarán las instrucciones a seguir
    const cardDataInd = document.getElementById('indications-route');
    cardDataInd.innerHTML = '';
    const cardInd = document.getElementById('indications-container');
    cardInd.innerHTML = '';

    const contentDataInd = document.createElement('div');
    contentDataInd.className = "card mt-0";
    contentDataInd.innerHTML = `
    <div class="card-header card-module" style="padding: 0; display: flex; justify-content: space-between; align-items: center; position: relative; height: 15px;">
        <span style="position: absolute; left: 50%; transform: translateX(-50%);">Datos</span>
    </div>
    <div class="card-body" style="background: #E4E4E4; padding: 1px;">
        <div class="row mt-2 mb-1 pl-2">
            <div class="col-4 mb-1">
                <label class="text-modal-7 text-center" style="color: ${color}">${formattedTime}</label>
            </div>
            <div class="col-4 mb-1">
                <label class="text-modal-7 text-center">${distance} km</label>
            </div>
            <div class="col-4 mb-1">
                <label class="text-modal-7 text-center">$${tolls_total}</label>
            </div>
            <div class="col-12">
                <label class="text-modal-6">${instructions[0]}</label>
            </div>
        </div>
    </div>`;
    cardDataInd.appendChild(contentDataInd);

    const contentInd = document.createElement('div');
    contentInd.className = "card mt-0";
    contentInd.innerHTML = `
    <div class="card">
        <div class="card-body" style="background: #E4E4E4; padding: 1px;">
            <div class="row mt-2 mb-1 pl-2">
                <div class="col-12 mb-1">
                    <label class="text-modal-2 text-center">${origin}</label>
                </div>
                <div class="col-12 mb-1">
                    ${instructions.map(instruction => `
                        <div class="row">
                            <div class="col-2 pl-4">
                                <label class="text-modal-6">></label>
                            </div>
                            <div class="col-9 p-0">
                                <label class="text-modal-6 text-justify">${instruction}</label>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="col-12">
                    <label class="text-modal-2 text-center">${destination}</label>
                </div>
            </div>
        </div>
    </div>`;
    cardInd.appendChild(contentInd);
}