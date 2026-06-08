<?php
declare(strict_types=1);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /contact/');
    exit;
}

$honeypot = trim((string)($_POST['company'] ?? ''));
if ($honeypot !== '') {
    header('Location: /contact/');
    exit;
}

$fullName = trim((string)($_POST['full-name'] ?? ''));
$subject = trim((string)($_POST['subject'] ?? ''));
$email = trim((string)($_POST['email'] ?? ''));
$comment = trim((string)($_POST['comment'] ?? ''));

if ($fullName === '' || $subject === '' || $comment === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($comment) < 10) {
    header('Location: /contact/?error=1');
    exit;
}

$dataDir = __DIR__ . DIRECTORY_SEPARATOR . 'secure-submissions';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0775, true);
}

$csvPath = $dataDir . DIRECTORY_SEPARATOR . 'contact-submissions.php';
$isNew = !file_exists($csvPath);

$fp = fopen($csvPath, 'ab');
if ($fp === false) {
    header('Location: /contact/?error=1');
    exit;
}

if ($isNew) {
    fwrite($fp, "<?php http_response_code(404); exit; __halt_compiler(); ?>\n");
    fputcsv($fp, ['timestamp_utc', 'full_name', 'subject', 'email', 'comment']);
}

fputcsv($fp, [
    gmdate('c'),
    $fullName,
    $subject,
    $email,
    preg_replace('/\s+/', ' ', $comment),
]);
fclose($fp);

header('Location: /contact/?sent=1');
exit;
