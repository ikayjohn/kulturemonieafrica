<?php
declare(strict_types=1);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /gift-tokens/');
    exit;
}

$email = trim((string)($_POST['gift_email'] ?? ''));
$amount = trim((string)($_POST['gift_amount'] ?? ''));
$expiry = trim((string)($_POST['gift_expiry'] ?? ''));

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || !in_array($amount, ['10000', '50000'], true) || $expiry === '') {
    header('Location: /gift-tokens/?error=1');
    exit;
}

$dataDir = __DIR__ . DIRECTORY_SEPARATOR . 'secure-submissions';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0775, true);
}

$path = $dataDir . DIRECTORY_SEPARATOR . 'gift-card-orders.php';
$isNew = !file_exists($path);
$fp = fopen($path, 'ab');
if ($fp === false) {
    header('Location: /gift-tokens/?error=1');
    exit;
}

if ($isNew) {
    fwrite($fp, "<?php http_response_code(404); exit; __halt_compiler(); ?>\n");
    fputcsv($fp, ['timestamp_utc', 'recipient_email', 'amount_ngn', 'expiry_date']);
}

fputcsv($fp, [gmdate('c'), $email, $amount, $expiry]);
fclose($fp);

header('Location: /gift-tokens/?sent=1');
exit;
