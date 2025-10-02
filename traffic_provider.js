ymaps.ready(init);

function init() {
    var myMap = new ymaps.Map("map", {
        center: [51.6608, 39.2003], // Воронеж
        zoom: 10,
        controls: [],
    });

    // Создадим провайдер пробок "Сейчас" с включенным слоем инфоточек.
    var actualProvider = new ymaps.traffic.provider.Actual(
        {},
        { infoLayerShown: true }
    );
    // И затем добавим его на карту.
    actualProvider.setMap(myMap);

    // Удаление провайдера с карты также производится через метод setMap.
    // actualProvider.setMap(null);
}
