<?php
declare(strict_types=1);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /vendor/');
    exit;
}

$required = ['full_name', 'phone', 'email', 'store_name', 'category'];
foreach ($required as $field) {
    if (trim((string)($_POST[$field] ?? '')) === '') {
        header('Location: /vendor/?error=1');
        exit;
    }
}

$email = trim((string)$_POST['email']);
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    header('Location: /vendor/?error=1');
    exit;
}

$dataDir = __DIR__ . DIRECTORY_SEPARATOR . 'secure-submissions';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0775, true);
}

$path = $dataDir . DIRECTORY_SEPARATOR . 'vendor-submissions.php';
$isNew = !file_exists($path);
$fp = fopen($path, 'ab');
if ($fp === false) {
    header('Location: /vendor/?error=1');
    exit;
}

if ($isNew) {
    fwrite($fp, "<?php http_response_code(404); exit; __halt_compiler(); ?>\n");
    fputcsv($fp, ['timestamp_utc', 'full_name', 'phone', 'email', 'store_name', 'category', 'business_name', 'country', 'city', 'bank_name']);
}

fputcsv($fp, [
    gmdate('c'),
    trim((string)$_POST['full_name']),
    trim((string)$_POST['phone']),
    $email,
    trim((string)$_POST['store_name']),
    trim((string)$_POST['category']),
    trim((string)($_POST['business_name'] ?? '')),
    trim((string)($_POST['country'] ?? '')),
    trim((string)($_POST['city'] ?? '')),
    trim((string)($_POST['bank_name'] ?? '')),
]);
fclose($fp);

header('Location: /vendor/?sent=1');
exit;
