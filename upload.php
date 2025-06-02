
<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Check if this is a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Метод не разрешен']);
    exit;
}

try {
    // Get form data
    $data = [
        'firstName' => $_POST['firstName'] ?? '',
        'lastName' => $_POST['lastName'] ?? '',
        'email' => $_POST['email'] ?? '',
        'phone' => $_POST['phone'] ?? '',
        'overallRating' => $_POST['overallRating'] ?? '',
        'deliverySpeed' => $_POST['deliverySpeed'] ?? '',
        'packageCondition' => $_POST['packageCondition'] ?? '',
        'courierQualities' => $_POST['courierQualities'] ?? '',
        'improvements' => $_POST['improvements'] ?? '',
        'additionalComments' => $_POST['additionalComments'] ?? '',
        'recommend' => isset($_POST['recommend']) ? 'Да' : 'Нет',
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    // Validate required fields
    $requiredFields = ['firstName', 'lastName', 'email', 'overallRating', 'deliverySpeed', 'packageCondition'];
    $missingFields = [];
    
    foreach ($requiredFields as $field) {
        if (empty($data[$field])) {
            $missingFields[] = $field;
        }
    }
    
    if (!empty($missingFields)) {
        throw new Exception('Не заполнены обязательные поля: ' . implode(', ', $missingFields));
    }
    
    // Validate email
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Некорректный email адрес');
    }
    
    // Validate rating
    if (!in_array($data['overallRating'], ['1', '2', '3', '4', '5'])) {
        throw new Exception('Некорректная оценка');
    }
    
    // Create data directory if it doesn't exist
    $dataDir = 'survey_data';
    if (!file_exists($dataDir)) {
        mkdir($dataDir, 0755, true);
    }
    
    // Save to CSV file
    $csvFile = $dataDir . '/delivery_survey_' . date('Y-m') . '.csv';
    $isNewFile = !file_exists($csvFile);
    
    $file = fopen($csvFile, 'a');
    if (!$file) {
        throw new Exception('Не удалось открыть файл для записи');
    }
    
    // Add header for new file
    if ($isNewFile) {
        $headers = [
            'Время отправки',
            'Имя',
            'Фамилия',
            'Email',
            'Телефон',
            'Общая оценка',
            'Скорость доставки',
            'Состояние посылки',
            'Качества курьера',
            'Предложения по улучшению',
            'Дополнительные комментарии',
            'Рекомендует сервис'
        ];
        fputcsv($file, $headers, ';');
    }
    
    // Add data row
    $row = [
        $data['timestamp'],
        $data['firstName'],
        $data['lastName'],
        $data['email'],
        $data['phone'],
        $data['overallRating'],
        $data['deliverySpeed'],
        $data['packageCondition'],
        $data['courierQualities'],
        $data['improvements'],
        $data['additionalComments'],
        $data['recommend']
    ];
    
    if (fputcsv($file, $row, ';') === false) {
        throw new Exception('Ошибка записи данных в файл');
    }
    
    fclose($file);
    
    // Also save as JSON for easier processing
    $jsonFile = $dataDir . '/delivery_survey_' . date('Y-m-d') . '.json';
    $jsonData = [];
    
    if (file_exists($jsonFile)) {
        $existingData = file_get_contents($jsonFile);
        $jsonData = json_decode($existingData, true) ?: [];
    }
    
    $jsonData[] = $data;
    
    if (file_put_contents($jsonFile, json_encode($jsonData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) === false) {
        // JSON save failed, but CSV succeeded, so we'll continue
        error_log('Не удалось сохранить JSON файл');
    }
    
    // Log successful submission
    error_log("Новый отзыв о доставке от: {$data['firstName']} {$data['lastName']} ({$data['email']})");
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Спасибо за ваш отзыв! Данные успешно сохранены.',
        'data' => [
            'id' => count($jsonData),
            'timestamp' => $data['timestamp']
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
    
    // Log error
    error_log("Ошибка при обработке опроса: " . $e->getMessage());
}
?>
