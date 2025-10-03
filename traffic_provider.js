ymaps.ready(init);

function init() {
    // Создаем карту, центрируем на Воронеж
    var myMap = new ymaps.Map("map", {
        center: [51.6833, 39.1802], // координаты центра Воронежа
        zoom: 13,                    // подходящий масштаб для города
        controls: []
    });

    // Создаем провайдер Actual, но НЕ добавляем его на карту
    var actualProvider = new ymaps.traffic.provider.Actual();

    // Слой инфоточек для дорожных событий
    var infoLayer = new ymaps.traffic.InfoLayer(myMap, {
        provider: actualProvider
    });

    // Отображаем только дорожные события
    infoLayer.setMap(myMap);
}
