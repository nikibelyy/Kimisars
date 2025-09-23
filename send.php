<?php
$data = json_decode(file_get_contents("data.json"), true);
$id = time(); // простой уникальный ID

$new = [
  "id" => $id,
  "client" => $_POST["client"],
  "description" => $_POST["description"],
  "price" => $_POST["price"],
  "status" => "Ожидание"
];

$data[] = $new;
file_put_contents("data.json", json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo "Заявка создана!<br>";
echo "Ссылка для клиента: <a href='request.php?id=$id'>request.php?id=$id</a>";
?>
