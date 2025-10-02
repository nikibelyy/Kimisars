ymaps.ready(init);

function init() {
    // Создаем пустую карту
    var myMap = new ymaps.Map("map", {
        controls: [], // без кнопок
    });

    // Создаем провайдер пробок "Сейчас" с включенным слоем инфоточек (дорожные события)
    var actualProvider = new ymaps.traffic.provider.Actual(
        {},
        { infoLayerShown: true } // включаем дорожные события
    );
    actualProvider.setMap(myMap);

    // Получаем границы города Воронеж через геокодер и устанавливаем их на карту
    ymaps.geocode("Воронеж", { results: 1 }).then(function (res) {
        var city = res.geoObjects.get(0);
        var bounds = city.properties.get('boundedBy'); // границы города
        myMap.setBounds(bounds, { checkZoomRange: true, zoomMargin: 20 });
    });
}
