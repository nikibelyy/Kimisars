ymaps.ready(init);

function init() {
    // Создаем карту без начального центра и зума
    var map = new ymaps.Map("map", {
        controls: [],          // убираем все кнопки
        type: "yandex#map"     // светлая карта
    });

    // Геокодируем Воронеж, чтобы получить точные границы
    ymaps.geocode("Воронеж", { results: 1 }).then(function(res) {
        var city = res.geoObjects.get(0);
        var bounds = city.properties.get("boundedBy"); // границы города

        // Устанавливаем границы карты с небольшим margin, чтобы приблизить
        map.setBounds(bounds, { checkZoomRange: true, zoomMargin: 5 });

        // Подключаем слой пробок и ДТП
        var trafficProvider = new ymaps.traffic.provider.Actual({}, { infoLayerShown: true });
        trafficProvider.setMap(map);

        // Автообновление каждые 15 минут (900 000 мс)
        setInterval(function() {
            trafficProvider.reload();
            console.log("Данные о пробках и ДТП обновлены");
        }, 900000);
    }).catch(function(error){
        console.error("Ошибка геокодирования Воронежа:", error);
        // Резервный центр на случай ошибки
        map.setCenter([51.6608, 39.3], 12);

        var trafficProvider = new ymaps.traffic.provider.Actual({}, { infoLayerShown: true });
        trafficProvider.setMap(map);
    });
}
