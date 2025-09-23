<?php
$id = $_GET["id"] ?? null;
$data = json_decode(file_get_contents("data.json"), true);

foreach ($data as &$req) {
    if ($req["id"] == $id) {
        if (isset($_GET["action"])) {
            $req["status"] = ($_GET["action"] == "yes") ? "Согласился" : "Отказался";
            file_put_contents("data.json", json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        }
        ?>
        <h1>Заявка для <?= htmlspecialchars($req["client"]) ?></h1>
        <p><?= htmlspecialchars($req["description"]) ?></p>
        <p>Цена: <?= htmlspecialchars($req["price"]) ?></p>
        <p>Статус: <?= $req["status"] ?></p>
        <?php if ($req["status"] == "Ожидание"): ?>
          <a href="?id=<?= $id ?>&action=yes">✅ Согласен</a><br>
          <a href="?id=<?= $id ?>&action=no">❌ Отказаться</a>
        <?php endif; ?>
        <?php
        exit;
    }
}
echo "Заявка не найдена!";
?>
