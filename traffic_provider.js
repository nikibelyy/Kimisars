ymaps.ready(init);

function init() {
    var map = new ymaps.Map("map", {
        controls: [], // убираем кнопки
        type: "yandex#map" // светлая тема
    });

    // Находим границы Воронежа
    ymaps.geocode("Воронеж", { results: 1 }).then(function (res) {
        var city = res.geoObjects.get(0);
        var bounds = city.properties.get("boundedBy");

        // Устанавливаем карту на границы города
        map.setBounds(bounds, { checkZoomRange: true, zoomMargin: 20 });

        // Оптимальное приближение (подбираем вручную)
        map.events.add("boundschange", function once() {
            var currentZoom = map.getZoom();

            // Если слишком далеко (например, 10–11), приближаем
            if (currentZoom < 12) {
                map.setZoom(12);
            }

            // Если слишком близко, ограничиваем до 13
            if (currentZoom > 13) {
                map.setZoom(13);
            }

            map.events.remove("boundschange", once);
        });

        // Загружаем пробки и ДТП
        loadTraffic();
    });

    // Функция подключения пробок и ДТП
    function loadTraffic() {
        var trafficProvider = new ymaps.traffic.provider.Actual({}, { infoLayerShown: true });
        trafficProvider.setMap(map);
    }

    // Автообновление каждые 15 минут (900 000 мс)
    setInterval(function () {
        loadTraffic();
        console.log("Данные о пробках и ДТП обновлены");
    }, 600000);
}
