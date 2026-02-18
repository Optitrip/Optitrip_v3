import { apiKeyHERE } from '../../config.js';

export const LAYER_COLORS = {
    heightRestrictions: '#FF0000',
    weightRestrictions: '#FF8800',
    widthRestrictions: '#9900FF',
    tunnels: '#0066FF',
    prohibitedStreets: '#CC0000',
    steepGrades: '#FFCC00'
};

export function toggleTruckLayer(map, enable) {
    if (!window.H || !map) return;

    if (enable) {
        const truckProvider = new window.H.map.provider.ImageTileProvider({
            label: 'truck-icons',
            getURL: function (col, row, level) {
                return [
                    'https://maps.hereapi.com/v3/base/mc/',
                    level, '/', col, '/', row, '/png8',
                    '?features=vehicle_restrictions:active_and_inactive',
                    '&style=explore.day',
                    '&apikey=', apiKeyHERE
                ].join('');
            }
        });

        const truckLayer = new window.H.map.layer.TileLayer(truckProvider);
        map.truckLayerInstance = truckLayer;
        map.addLayer(truckLayer);

    } else {
        if (map.truckLayerInstance) {
            map.removeLayer(map.truckLayerInstance);
            map.truckLayerInstance = null;
        }
    }
}