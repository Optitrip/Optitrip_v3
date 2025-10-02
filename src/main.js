document.addEventListener('DOMContentLoaded', function () {
    function deselectAllMenus() {
        var btnRoutes = document.getElementById('menuRoutes');
        var btnUsers = document.getElementById('menuUsers');
        var btnReports = document.getElementById('menuReports');
        var btnMap = document.getElementById('menuMap');

        btnRoutes.classList.remove('btn-primary');
        btnRoutes.classList.add('btn-outline-primary');
        btnUsers.classList.remove('btn-primary');
        btnUsers.classList.add('btn-outline-primary');
        btnReports.classList.remove('btn-primary');
        btnReports.classList.add('btn-outline-primary');
        btnMap.querySelector('a').classList.remove('btn-primary');
        btnMap.querySelector('a').classList.add('btn-outline-primary');
    }

    document.getElementById('menuRoutes').addEventListener('click', function () {
        deselectAllMenus();
        var btnRoutes = document.getElementById('menuRoutes');
        var divMap = document.getElementById('map');
        var divMapDrivers = document.getElementById('map-drivers');
        var cardTracing = document.getElementById('tracing-driver');
        var divUsers = document.getElementById('users');
        var divReports = document.getElementById('reports');
        var cardCreate = document.getElementById('create-route');

        divMapDrivers.style.display = 'none';
        divMap.style.display = 'block';
        cardTracing.style.display = 'none'
        divUsers.style.display = 'none';
        divReports.style.display = 'none';
        cardCreate.style.display = 'block';
        btnRoutes.classList.add('btn-primary');
    });

    document.getElementById('menuUsers').addEventListener('click', function () {
        deselectAllMenus();
        var btnUsers = document.getElementById('menuUsers');
        var divMap = document.getElementById('map');
        var divMapDrivers = document.getElementById('map-drivers');
        var cardTracing = document.getElementById('tracing-driver');
        var divUsers = document.getElementById('users');
        var divReports = document.getElementById('reports');
        var cardCreate = document.getElementById('create-route');
        var cardRoutes = document.getElementById('show-routes');
        var cardInd = document.getElementById('show-indications');

        divMap.style.display = 'none';
        divMapDrivers.style.display = 'none';
        cardTracing.style.display = 'none'
        divReports.style.display = 'none';
        cardCreate.style.display = 'none';
        cardRoutes.style.display = 'none';
        cardInd.style.display = 'none';
        divUsers.style.display = 'block';
        btnUsers.classList.add('btn-primary');
    });

    document.getElementById('menuReports').addEventListener('click', function () {
        deselectAllMenus();
        var btnReports = document.getElementById('menuReports');
        var divMap = document.getElementById('map');
        var divMapDrivers = document.getElementById('map-drivers');
        var cardTracing = document.getElementById('tracing-driver');
        var divUsers = document.getElementById('users');
        var divReports = document.getElementById('reports');
        var cardCreate = document.getElementById('create-route');
        var cardRoutes = document.getElementById('show-routes');
        var cardInd = document.getElementById('show-indications');

        divMap.style.display = 'none';
        divMapDrivers.style.display = 'none';
        cardTracing.style.display = 'none'
        divUsers.style.display = 'none';
        cardCreate.style.display = 'none';
        cardRoutes.style.display = 'none';
        cardInd.style.display = 'none';
        divReports.style.display = 'block';
        btnReports.classList.add('btn-primary');
    });

    document.getElementById('menuMap').addEventListener('click', function () {
        deselectAllMenus();
        var btnMap = document.getElementById('menuMap');
        var cardTracing = document.getElementById('tracing-driver');
        var divMap = document.getElementById('map');
        var divMapDrivers = document.getElementById('map-drivers');
        var divUsers = document.getElementById('users');
        var divReports = document.getElementById('reports');
        var cardCreate = document.getElementById('create-route');
        var cardRoutes = document.getElementById('show-routes');
        var cardInd = document.getElementById('show-indications');

        divMap.style.display = 'bloc';
        divMapDrivers.style.display = 'block';
        cardTracing.style.display = 'block';
        divUsers.style.display = 'none';
        divReports.style.display = 'none';
        cardCreate.style.display = 'none';
        cardRoutes.style.display = 'none';
        cardInd.style.display = 'none';
        btnMap.querySelector('a').classList.add('btn-primary');
    });

    const minimizeTracingBtn = document.querySelector('#btn-minimize-tracing');
    const maximizeTracingBtn = document.querySelector('#btn-maximize-tracing');
    const tracingContainer = document.getElementById('tracing-container');

    minimizeTracingBtn.addEventListener('click', function () {
        tracingContainer.style.display = 'none';
        minimizeTracingBtn.style.display = 'none';
        maximizeTracingBtn.style.display = 'block';
    });

    maximizeTracingBtn.addEventListener('click', function () {
        tracingContainer.style.display = 'block';
        minimizeTracingBtn.style.display = 'block';
        maximizeTracingBtn.style.display = 'none';
    });

    const minimizeBtn = document.querySelector('#btn-minimize');
    const maximize = document.querySelector('#btn-maximize');
    const contentCreateRoutes = document.getElementById('react-container');
    const containerBtn = document.getElementById('container-btn');

    minimizeBtn.addEventListener('click', function () {
        contentCreateRoutes.style.display = 'none';
        minimizeBtn.style.display = 'none';
        containerBtn.style.display = 'none';
        maximize.style.display = 'block';
    });

    maximize.addEventListener('click', function () {
        contentCreateRoutes.style.display = 'block';
        maximize.style.display = 'none';
        containerBtn.style.display = 'block';
        minimizeBtn.style.display = 'block';
    });

    const minimizeRoutesBtn = document.querySelector('#btn-minimize-routes');
    const maximizeRoutes = document.querySelector('#btn-maximize-routes');
    const cardRoutes = document.getElementById('cardRoutesShow');
    const containerBtnRoutes = document.getElementById('container-btn-routes');

    minimizeRoutesBtn.addEventListener('click', function () {
        cardRoutes.style.display = 'none';
        minimizeRoutesBtn.style.display = 'none';
        containerBtnRoutes.style.display = 'none';
        maximizeRoutes.style.display = 'block';
    });

    maximizeRoutes.addEventListener('click', function () {
        cardRoutes.style.display = 'block';
        maximizeRoutes.style.display = 'none';
        containerBtnRoutes.style.display = 'block';
        minimizeRoutesBtn.style.display = 'block';
    });

    const minimizeIndBtn = document.querySelector('#btn-minimize-indications');
    const maximizeInd = document.querySelector('#btn-maximize-indications');
    const cardIndShow = document.getElementById('cardIndShow');
    const containerBtnInd = document.getElementById('container-btn-indications');

    minimizeIndBtn.addEventListener('click', function () {
        cardIndShow.style.display = 'none';
        minimizeIndBtn.style.display = 'none';
        containerBtnInd.style.display = 'none';
        maximizeInd.style.display = 'block';
    });

    maximizeInd.addEventListener('click', function () {
        cardIndShow.style.display = 'block';
        maximizeInd.style.display = 'none';
        containerBtnInd.style.display = 'block';
        minimizeIndBtn.style.display = 'block';
    });
});
