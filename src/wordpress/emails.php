<?php
function send_onboarding_email($user_id)
{
	$user = get_userdata($user_id);
	$user_email = $user->user_email;
	$user_name = $user->display_name;
	$headers = 'Content-Type: text/html; charset=UTF-8';
	$subject = 'Welcome to Outboundly - Here\'s How to Get Up and Running.';

	$message = <<<EOT
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Welcome to Outboundly - Start Sending Personalized Messages in Minutes! 🚀</title>
<style>
    body {
        font-family: Arial, sans-serif;
        background-color: #f5f5f5;
        margin: 0;
        padding: 0;
    }
    .email-container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
    }
    .email-content {
        background-color: #ffffff;
        padding: 20px;
        border-radius: 5px;
    }
    .email-header {
        font-size: 24px;
        font-weight: bold;
        color: #2c3e50;
    }
    .email-text {
        font-size: 16px;
        line-height: 1.5;
        color: #333333;
    }
    .steps {
        padding-left: 20px;
    }
    .step {
        padding: 5px 0;
    }
    .note {
        font-weight: bold;
    }
    .signature {
        font-size: 16px;
        font-weight: bold;
        padding: 15px 0;
    }
</style>
</head>
<body>
<div class="email-container">
    <div class="email-content">
        <p class="email-header">Start Sending Personalized Messages in Minutes!</p>
        <p class="email-text">Hello {$user_name},</p>
        <p class="email-text">Welcome to Outboundly, and congratulations on making the decision to level up your outreach game! We're excited to have you on board and can't wait to see the connections you make with our powerful AI-driven messaging platform.</p>
        <p class="email-text">To help you get started, here's a step-by-step guide on using Outboundly:</p>
        <ol class="email-text steps">
            <li class="step">Visit the LinkedIn profile of the prospect you want to send a message. If you recently installed the extension, refresh the page.</li>
            <li class="step">Choose a messaging mode that best suits your prospecting efforts (e.g., Connection request, Recruiter, etc.) from the Outboundly extension.</li>
            <li class="step">Enter the information requested in the messaging mode and apply settings. You can also choose a previously saved preset for quick messaging.</li>
            <li class="step">Open the message window on the user's profile. This can either be an InMail, direct message, or connection request.</li>
            <li class="step">Click the "Generate" button in the message box to create a hyper-personalized message. Review, edit if needed, and then hit "Send" to connect with your prospect.</li>
        </ol>
        <p class="email-text">💡 <span class="note">Things to note:</span></p>
		<ul class="email-text steps">
		<li class="step">If enabled, disable the "press enter to send" on the individual message box by pressing the three dots.</li>
		<li class="step">The more information you provide the AI, the better your messages will be. Provide as many details as possible in your message settings.</li>
		<li class="step">Messages take 5-15 seconds to generate depending on your settings.</li>
		<li class="step">This extension works best on profiles that have a few paragraphs in their about section.</li>
		</ul>
		<p class="email-text">Remember, you have access to 7 powerful messaging modes, including General, Pitch, Template, Connection Request, Recruiter, Custom, Starter, and Brainstorm Modes. Feel free to experiment with these modes to find the one that best suits your needs.</p>
		<p class="email-text">If you need any assistance or have questions about using Outboundly, please don't hesitate to reach out to our support team. We're here to help!</p>
		<p class="email-text">Happy prospecting, and here's to your success with Outboundly!</p>
		You can download the extension here
		<p class="email-text"><a href="https://chrome.google.com/webstore/detail/outboundly/aclgcfmciekojimhckimdcapkejceili">Download Outboundly Extension</a><p class="email-text">
		<p class="signature">Best regards,</p>
		<p class="signature">Customer Success Team</p>
		<p class="signature">Outboundly</p>
		</div>
		
		</div>
		</body>
		</html>
EOT;
wp_mail($user_email, $subject, $message, $headers);

}
add_action('user_register', 'send_onboarding_email');


function schedule_emails_after_register($user_id)
	{
		$user = get_userdata($user_id);
		$email = $user->user_email;
		$name = $user->first_name;

		// schedule thank you email to be sent 1 days after registration
		wp_schedule_single_event(time() + (1 * DAY_IN_SECONDS), 'send_scheduled_thank_you_email', array($email, $name));

		// schedule follow up email to be sent 3 days after registration
		wp_schedule_single_event(time() + (3 * DAY_IN_SECONDS), 'send_scheduled_follow_up_email', array($email, $name));


	}

	add_action('user_register', 'schedule_emails_after_register');



	function send_thank_you_email_now($email, $name)
	{

		$subject = 'How are you finding Outboundly?';

		$headers = "From: Outboundly <info@outboundly.app\r\n";
		$headers .= "MIME-Version: 1.0\r\n";
		$headers .= "Content-Type: text/html; charset=UTF-8\r\n";

		$message = '<html><body>';
		$message .= '<h1>Hi ' . $name . ',</h1>';
		$message .= '<p>We wanted to take a moment to thank you for signing up for Outboundly. We\'re thrilled to have you on board as a user and hope you\'re finding our product to be useful in your prospecting efforts.</p>';
		$message .= '<p>We\'d love to hear your thoughts and feedback on how you\'re finding Outboundly. If you have any questions or run into any issues, please don\'t hesitate to reach out to our support team.</p>';
		$message .= '<p>Thank you for choosing Outboundly, and we look forward to helping you increase your response rate and save time on cold prospecting.</p>';
		$message .= '</br>';
		$message .= '</br>';
		$message .= '<p>Best regards,</p>';
		$message .= '<p>The Outboundly Team</p>';

		$message .= '</body></html>';

		// try to send the message
		try {
			$sent = wp_mail($email, $subject, $message, $headers);
			write_log('Email sent to ' . $email);
		} catch (Exception $e) {
			// write log
			write_log('Email not sent to ' . $email);
			write_log($e->getMessage());
		}
	}

	add_action('send_scheduled_thank_you_email', 'send_thank_you_email_now', 10, 2);


	function send_follow_up_email_now($email, $name)
	{

		$response = firebase_request("https://us-central1-outboundlyappai.cloudfunctions.net/getUser", "{\r \"email\": \"$email\"}");

		// convert the response to an array
		$user = json_decode($response, true);

		// get the user's first name
		$name = $user['firstName'];
		$credits = $user['credits'];
		$subscriptionLevel = $user['subscriptionLevel'];

		// prepare the email
		$subject = 'Touching base';
		$headers = "From: Outboundly <info@outboundly.app\r\n";
		$headers .= "MIME-Version: 1.0\r\n";
		$headers .= "Content-Type: text/html; charset=UTF-8\r\n";

		if ($subscriptionLevel == "Free") {

			// check if user credits is 15
			if ($credits == 15) {
				$message = '<html><body>';
				$message .= '<h1>Hi ' . $name . ',</h1>';
				$message .= '<p>Miguel here, Founder of Outboundly, I noticed you haven\'t used any of your credits yet. If you\'re having any trouble getting started I\'m happy to help you out.</p>';
				$message .= '<p>I can answer any questions you may have about our platform, or provide advice on how to best use Outboundly for your business. Feel free to reach out anytime and I\'ll be more than happy to assist you.</p>';
				$message .= '<p>Thank you for choosing Outboundly, and we look forward to helping you increase your response rate and save time on cold prospecting.</p>';

			} else {
				$message = '<html><body>';
				$message .= '<h1>Hi ' . $name . ',</h1>';
				$message .= '<p>Miguel here, Founder of Outboundly, I noticed you had a chance to try our product out and wanted to follow up and see if you had any questions or feedback.</p>';
				$message .= '<p>We really appreciate your interest in our product and would love to hear any thoughts or feedback you may have. We\'re always looking for ways to improve and make Outboundly even better, so any insight you can provide would be extremely helpful.</p>';
				$message .= '<p>If you have any questions about our product, feel free to reach out anytime and we\'ll be happy to answer them. Thank you again for your interest in Outboundly!</p>';

			}
			$message .= '</br>';
			$message .= '</br>';
			$message .= '<p>Best regards,</p>';
			$message .= '<p>Miguel</p>';
			$message .= '<p>Founder, Outboundly</p>';
			$message .= '</body></html>';

			// try to send the message
			try {
				$sent = wp_mail($email, $subject, $message, $headers);
				write_log('Follow up email sent to ' . $email);
			} catch (Exception $e) {
				// write log
				write_log('Follow up email not sent to ' . $email);
				write_log($e->getMessage());
			}
		} else {
			write_log('User ' . $email . ' is on a paid plan');
			write_log('User ' . $user );
		}

	}


add_action('send_scheduled_follow_up_email', 'send_follow_up_email_now', 10, 2);
?>