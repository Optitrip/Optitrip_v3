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
            tileSize: 512,
            getURL: function (col, row, level) {
                return [
                    'https://maps.hereapi.com/v3/base/mc/',
                    level, '/', col, '/', row, '/png',
                    '?features=vehicle_restrictions:active_and_inactive',
                    '&style=explore.day',
                    '&size=512',
                    '&ppi=100',
                    '&apikey=', apiKeyHERE
                ].join('');
            }
        });

        const truckLayer = new window.H.map.layer.TileLayer(truckProvider);

        if (!map.originalBaseLayer) {
            map.originalBaseLayer = map.getBaseLayer();
        }

        map.setBaseLayer(truckLayer);
        map.truckLayerInstance = truckLayer;

    } else {
        if (map.originalBaseLayer) {
            map.setBaseLayer(map.originalBaseLayer);
        }
        map.truckLayerInstance = null;
    }
}