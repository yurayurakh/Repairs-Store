<?php
	function to_utf8($from_text) {
		return '=?UTF-8?B?'.base64_encode($from_text).'?='; //fix Кракозябрица в имени отправителя письма на почте Yandex
	}
	
	$name  = trim(strip_tags($_POST['name']));
	$phone   = trim(strip_tags($_POST['phone']));
	$email  = trim(strip_tags($_POST['email']));
	$message  = trim(strip_tags($_POST['message']));
//	$form  = trim(strip_tags($_POST['form']));
	
	$to    = 'easergiu@gmail.com'; // кому отправляем trim(strip_tags($_POST['send_to_email']));
	$title = 'Заявка с сайта'; // заголовок письма
	$body   = "
		Имя: {$name} <br>
		Телефон: {$phone} <br>
		E-mail: {$email} <br>
		Сообщение: {$message}
	"; // содержание письма
	
	$headers = "MIME-Version: 1.0 \r\n";
	$headers .= "Content-Transfer-Encoding: 8bit \r\n";
	$headers .= "Content-type:text/html;charset=utf-8 \r\n"; //кодировка и тип контента
	//$headers .= "From: " . to_utf8('Название сайта') . "<test@mserj.ru> \r\n"; // откуда письмо
	//$headers .= "Reply-To: test@mserj.ru \r\n"; // отвечать на адрес
	$headers .= 'X-Mailer: PHP/' . phpversion();

	// отправка письма
	if (mail($to, $title, $body, $headers)) { 
		echo "Отправлено!";
	} else { 
		echo "Возникла ошибка, попробуйте ещй раз!";
	};
?>