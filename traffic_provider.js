ymaps.ready(init);

function init() {
    var myMap = new ymaps.Map("map", {
        center: [51.6608, 39.2003], // Воронеж
        zoom: 13, // Увеличение на сам город
        controls: [],
    });

    // Создадим провайдер пробок "Сейчас" с включенным слоем инфоточек.
    var actualProvider = new ymaps.traffic.provider.Actual(
        {},
        { infoLayerShown: true }
    );
    actualProvider.setMap(myMap);

    // Добавим метку "Воронеж"
    var myPlacemark = new ymaps.Placemark(
        [51.6608, 39.2003],
        {
            balloonContent: "Воронеж",
            hintContent: "Воронеж"
        },
        {
            preset: "islands#redIcon"
        }
    );

    myMap.geoObjects.add(myPlacemark);
}
