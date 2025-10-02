ymaps.ready(init);

function init() {
    // Создаем карту, центрируем на Воронеж
    var map = new ymaps.Map("map", {
        center: [51.660781, 39.200296], // координаты центра Воронежа
        zoom: 12,
        controls: ['zoomControl', 'trafficControl', 'typeSelector', 'fullscreenControl']
    });

    // Добавляем слой пробок + событий ДТП
    var trafficControl = new ymaps.control.TrafficControl({
        state: {
            // Показывать пробки
            trafficShown: true,
            // Показывать дорожные события (ДТП, ремонт и пр.)
            infoLayerShown: true
        }
    });

    map.controls.add(trafficControl);

    // Включаем слой пробок на карте сразу
    var trafficProvider = new ymaps.traffic.provider.Actual({}, { infoLayerShown: true });
    trafficProvider.setMap(map);
}
