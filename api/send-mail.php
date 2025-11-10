<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

function cleanQuillHtml($html) {
    $doc = new DOMDocument();
    libxml_use_internal_errors(true);
    $doc->loadHTML('<?xml encoding="utf-8" ?>' . $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
    libxml_clear_errors();

    $unsafe = ['script', 'iframe', 'object', 'embed', 'link', 'style'];
    foreach ($unsafe as $tag) {
        $elements = $doc->getElementsByTagName($tag);
        while ($elements->length > 0) {
            $el = $elements->item(0);
            $el->parentNode->removeChild($el);
        }
    }

    return $doc->saveHTML();
}

function formatDate($isoDate) {
    if (!$isoDate) return '';
    try {
        $date = new DateTime($isoDate);
        return $date->format('d/m/Y');
    } catch (Exception $e) {
        return $isoDate;
    }
}

$data = json_decode(file_get_contents("php://input"), true);

if ($data) {
    $formType  = $data['formType'] ?? 'contact';

    $toOrg = "Kanchana.Pragasam@missionmindtech.com";
    $fromEmail = "inspire.it@inspirationcs.ca";

    $userEmail = htmlspecialchars($data['email'] ?? '');
    $firstName = htmlspecialchars($data['firstName'] ?? '');

    $orgSubject = "New Submission: " . ucfirst($formType);
    $orgHeaders  = "From: Website <{$fromEmail}>\r\n";
    $orgHeaders .= "Reply-To: {$userEmail}\r\n";
    $orgHeaders .= "MIME-Version: 1.0\r\n";
    $orgHeaders .= "Content-Type: text/html; charset=UTF-8\r\n";

    // Theme colors
    $primaryColor = "#b64abc";
    $secondaryColor = "#02aed0";

    $style = "
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
        }
        .container {
          
            background: white;
            margin: auto;
            border-radius: 8px;
            border-top: 4px solid {$secondaryColor};
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            padding: 30px 50px;
        }
        h2 {
            
            color: #222;
            margin-bottom: 30px;
        }
        p {
            font-size: 16px;
            color: #333;
            margin: 8px 0;
        }
        strong {
            color: #000;
            display: inline-block;
            
        }
     
    ";

    $orgBody = "";

    if ($formType === 'enrollment') {
         // Clean and prepare data
        $lastName = htmlspecialchars($data['lastName'] ?? '');
        $fullName = trim($firstName . ' ' . $lastName);

        $gender = htmlspecialchars($data['gender'] ?? '');
        $dob = formatDate($data['dob'] ?? '');
        $occupation = htmlspecialchars($data['occupation'] ?? '');
        $address=htmlspecialchars($data['address']??'');
        $city=htmlspecialchars($data['city']??'');
        $pincode=htmlspecialchars($data['pincode']??'');
        $country=htmlspecialchars($data['country']??'');
        $mobile = htmlspecialchars($data['mobile'] ?? '');
        $email = htmlspecialchars($data['email']??'');
        $about = htmlspecialchars($data['about'] ?? '');
        $courseName = htmlspecialchars($data['selectedCourse'] ?? 'Unknown Course');
        $schedule = htmlspecialchars($data['schedule'] ?? '');
        $mode = htmlspecialchars($data['mode'] ?? '');
        $plannedStart = formatDate($data['plannedStart'] ?? '');
        $plannedEnd = formatDate($data['plannedEnd'] ?? '');
        $comments = nl2br(htmlspecialchars($data['comments'] ?? ''));
        $declaration = !empty($data['declaration']) ? 'Yes' : 'No';
          $backgroundImageUrl = '../src/assets/images/enrollment-banner.webp';
        $orgSubject = "New Enrollment Submission for {$courseName} from {$fullName}";

        $orgBody = "
        <html>
        <head><style>{$style}</style></head>
        <body>
        <div class='container'>
             <h2>New Enrollment Form Submission</h2>
            <h3><strong>Personal Details</strong></h3>
            <p><strong>Name:</strong> {$fullName}</p>
            <p><strong>Gender:</strong>{$gender}</p>
            <p><strong>Date of Birth:</strong> {$dob}</p>
            <p><strong>Occupation:</strong> {$occupation}</p>
            <p><strong>Address:</strong> {$address}</p>
            <p><strong>City:</strong> {$city}</p>
            <p><strong>Pincode:</strong> {$pincode}</p>
            <p><strong>Country:</strong> {$country}</p>
            <p><strong>Phone:</strong> {$mobile}</p>
            <p><strong>Email:</strong> {$userEmail}</p>
            <p><strong>Tell Us About Yourself:</strong>{$about}</p>
            <h3><strong>Course Details</strong></h3>
            <p><strong>Course:</strong> {$courseName}</p>
            <p><strong>Schedule:</strong> {$schedule}</p>
            <p><strong>Planned Start:</strong> {$plannedStart}</p>
            <p><strong>Planned End:</strong> {$plannedEnd}</p>
            <p><strong>Mode:</strong> {$mode}</p>
            <p><strong>Additional Comments:</strong> {$comments}</p>
            <h3><strong>Declaration</strong></h3>
            <p><strong>Declaration Accepted:</strong> {$declaration}</p>
        </div>
        </body>
        </html>
        ";
    } elseif ($formType === 'enquiry') {
        $name = htmlspecialchars($data['name'] ?? '');
        $subject = htmlspecialchars($data['subject'] ?? '');
        $mobile = htmlspecialchars($data['mobile'] ?? '');
        $message = cleanQuillHtml($data['message'] ?? '');

        $orgBody = "
        <html>
        <head><style>{$style}</style></head>
        <body>
        <div class='container'>
            <h2>Enquiry Form</h2>
            <p><strong>Name:</strong> {$name}</p>
            <p><strong>Email:</strong> {$userEmail}</p>
            <p><strong>Phone:</strong> {$mobile}</p>
            <p><strong>Subject:</strong> {$subject}</p>
            <p><strong>Message:</strong>{$message}</p>
           
        </div>
        </body>
        </html>
        ";
    } else {
        $name = htmlspecialchars($data['name'] ?? '');
        $mobile = htmlspecialchars($data['mobile'] ?? '');
        $message = cleanQuillHtml($data['message'] ?? '');

        $orgBody = "
        <html>
        <head><style>{$style}</style></head>
        <body>
        <div class='container'>
            <h2>Contact Form</h2>
            <p><strong>Name:</strong> {$name}</p>
            <p><strong>Email:</strong> {$userEmail}</p>
            <p><strong>Mobile:</strong> {$mobile}</p>
            <p><strong>Message:</strong>{$message}</p>
           
        </div>
        </body>
        </html>
        ";
    }

    // Auto-reply to user
    $userSubject = "Thanks for contacting us!";
    $userHeaders  = "From: Website <{$fromEmail}>\r\n";
    $userHeaders .= "Reply-To: {$toOrg}\r\n";
    $userHeaders .= "MIME-Version: 1.0\r\n";
    $userHeaders .= "Content-Type: text/html; charset=UTF-8\r\n";

    $userBody = "
    <html>
    <head><style>{$style}</style></head>
    <body>
    <div class='container'>
        <h2>Thank You, {$firstName}!</h2>
        <p>We’ve received your <strong>" . ucfirst($formType) . "</strong> request.</p>
        <p>Our team will contact you soon.</p>
        <p>Regards,<br>Training Website Team</p>
        <div class='footer'>This is an automated message, please do not reply.</div>
    </div>
    </body>
    </html>
    ";

    $orgSent = mail($toOrg, $orgSubject, $orgBody, $orgHeaders);
    $userSent = mail($userEmail, $userSubject, $userBody, $userHeaders);

    if ($orgSent && $userSent) {
        echo json_encode(["status" => "success", "message" => "Emails sent"]);
    } elseif ($orgSent) {
        echo json_encode(["status" => "partial", "message" => "Only organization received email"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Email sending failed"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "No data received"]);
}
