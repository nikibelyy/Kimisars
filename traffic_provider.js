ymaps.ready(init);

function init() {
    // Создаем карту, центрируем на Воронеж
    var map = new ymaps.Map("map", {
        center: [51.660781, 39.200296], // координаты Воронежа
        zoom: 12,
        controls: [] // Убираем все кнопки
    });

    // Функция подключения пробок и ДТП
    function loadTraffic() {
        var trafficProvider = new ymaps.traffic.provider.Actual({}, { infoLayerShown: true });
        trafficProvider.setMap(map);
    }

    // Загружаем пробки и ДТП при старте
    loadTraffic();

    // Автообновление каждые 10 минут (600 000 мс)
    setInterval(function () {
        loadTraffic();
        console.log("Данные о пробках и ДТП обновлены");
    }, 600000);
}
