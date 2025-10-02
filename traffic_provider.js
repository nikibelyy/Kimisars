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
    actualProvider.setMap(myMap);

    // Добавим метку "Воронеж" в центр карты
    var myPlacemark = new ymaps.Placemark(
        [51.6608, 39.2003],
        {
            balloonContent: "Воронеж", // текст в balloon (по клику)
            hintContent: "Воронеж"     // текст при наведении
        },
        {
            preset: "islands#redIcon"  // стиль метки
        }
    );

    myMap.geoObjects.add(myPlacemark);
}
