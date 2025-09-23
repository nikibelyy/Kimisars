<?php
$data = json_decode(file_get_contents("data.json"), true);
?>
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Админ-панель</title>
</head>
<body>
  <h1>Заявки</h1>
  <a href="new.php">Создать новую</a>
  <table border="1" cellpadding="5">
    <tr>
      <th>ID</th><th>Клиент</th><th>Описание</th><th>Цена</th><th>Статус</th>
    </tr>
    <?php foreach ($data as $req): ?>
      <tr>
        <td><?= $req["id"] ?></td>
        <td><?= htmlspecialchars($req["client"]) ?></td>
        <td><?= htmlspecialchars($req["description"]) ?></td>
        <td><?= htmlspecialchars($req["price"]) ?></td>
        <td><?= $req["status"] ?></td>
      </tr>
    <?php endforeach; ?>
  </table>
</body>
</html>
