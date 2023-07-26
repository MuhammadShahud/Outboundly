<?php
/**
 * Theme functions and definitions.
 */

function add_svg_to_upload_mimes($upload_mimes)
{
	$upload_mimes['svg'] = 'image/svg+xml';
	return $upload_mimes;
}
add_filter('upload_mimes', 'add_svg_to_upload_mimes');

// function to write to wordpress log
function write_log($log)
{
	if (true === WP_DEBUG) {
		if (is_array($log) || is_object($log)) {
			error_log(print_r($log, true));
		} else {
			error_log($log);
		}
	}
}

// turn off admin password change emails
add_filter('send_password_change_email', '__return_false', 90000000);


// Extend Token Length
add_filter(
	'jwt_auth_expire',
	function ($expire, $issued_at) {
		// Modify the "expire" here.
		return time() + (86400 * 30);
	},
	10,
	2
);

function modify_jwt_auth_payload( $payload, $user ) {
    // Get the ob_user_id from the user meta
    $ob_user_id = get_user_meta( $user->ID, 'ob_user_id', true );

    if ( $ob_user_id ) {
        // Replace the default user ID with the ob_user_id
        $payload['data']['user']['id'] = $ob_user_id;
    }

    return $payload;
}

// auth payload modification
add_filter( 'jwt_auth_payload', 'modify_jwt_auth_payload', 10, 2 );

add_filter(
    'jwt_auth_valid_credential_response',
    function ( $response, $user ) {
        // Get the ob_user_id from user meta.
        $ob_user_id = get_user_meta( $user->ID, 'ob_user_id', true );
        
        // Replace the default ID with the ob_user_id in the response.
        $response['data']['id'] = $ob_user_id;

        return $response;
    },
    10,
    2
);

//direct to checkout
add_filter('add_to_cart_redirect', 'lw_add_to_cart_redirect');
function lw_add_to_cart_redirect()
{
	global $woocommerce;
	$lw_redirect_checkout = $woocommerce->cart->get_checkout_url();
	return $lw_redirect_checkout;
}


//remove image zoom
add_action('after_setup_theme', 'custom_remove_product_zoom', 11);

function custom_remove_product_zoom()
{
	remove_theme_support('wc-product-gallery-zoom');
}


// Change "Add to Cart" > "Add to Bag" in Single Page
add_filter('woocommerce_product_single_add_to_cart_text', 'woocommerce_single_page_add_to_cart_callback');
function woocommerce_single_page_add_to_cart_callback()
{
	if (has_term('subscriptions', 'product_cat')) {
		return __('Sign Up', 'text-domain');
	} else {
		return __('Buy Now', 'text-domain');
	}
}

// limit free to only one per customer

function limit_product_quantity_per_customer( $passed, $product_id, $quantity, $variation_id = null ) {
    // Set the ID of the product you want to limit.
    $limited_product_id = 17817; // Replace 123 with the actual product ID.

    // Check if the product being added to the cart is the limited product.
    if ( $product_id == $limited_product_id ) {
        // Check if the quantity being added is greater than 1.
        if ( $quantity > 1 ) {
            // Set the validation to false and display an error message.
            $passed = false;
            wc_add_notice( __( 'You can only do this once', 'woocommerce' ), 'error' );
        }
    }

    return $passed;
}
add_filter( 'woocommerce_add_to_cart_validation', 'limit_product_quantity_per_customer', 10, 4 );


// Function to generate random alphanumeric ID
function generate_random_alphanumeric_id( $length = 16 ) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $characters_length = strlen( $characters );
    $random_id = '';

    for ( $i = 0; $i < $length; $i++ ) {
        $random_id .= $characters[ rand( 0, $characters_length - 1 ) ];
    }

    return $random_id;
}

// Check for existing IDs and avoid duplicates
function is_ob_user_id_unique( $generated_id ) {
    $existing_ids = get_users( array(
        'meta_key' => 'ob_user_id',
        'meta_value' => $generated_id,
    ));

    return empty( $existing_ids );
}

// Function to generate unique ob_user_id
function generate_unique_ob_user_id() {
    do {
        $generated_id = generate_random_alphanumeric_id();
    } while ( !is_ob_user_id_unique( $generated_id ) );

    return $generated_id;
}

// Main script
function generate_ob_user_id($user_id) {

	$ob_user_id = generate_unique_ob_user_id();
	update_user_meta( $user_id, 'ob_user_id', $ob_user_id );

	return $ob_user_id;

}



//On subscription start
function sub_start_beta($post_ID)
{

	$order = wc_get_order($post_ID);

	$author_id = $order->get_user_id();
	$user_first_name = get_the_author_meta('user_firstname', $author_id);
	$user_last_name = get_the_author_meta('user_lastname', $author_id);
	$user_email = get_the_author_meta('user_email', $author_id);
	$user_name = get_the_author_meta('user_login', $author_id);
	//$order_id = get_post_meta($post_ID, "order_id", true);
	//echo $post_ID;			

	//get Product ID
	$order = wc_get_order($post_ID);
	$items = $order->get_items();
	foreach ($items as $item) {
		$product_post_id = $item->get_product_id();
		$credits = get_post_meta($product_post_id, "credits", true);
		$product_title = get_the_title($product_post_id);
	}

	$data = $order->get_data(); // The Order data	
	$billing_company = $data['billing']['company'];
	$billing_role = get_post_meta($post_ID, '_billing_role', true);

	$ob_user_id = get_user_meta($author_id, 'ob_user_id', true);

	firebase_request("https://us-central1-outboundlyappai.cloudfunctions.net/startSubscriptionWP", "{\r \"userId\": \"$ob_user_id\",\r \"credits\": \"$credits\", \"subscriptionLevel\": \"$product_title\",\r \"businessName\": \"$billing_company\",\r \"role\": \"$billing_role\",\r \"partnerId\": \"setly\",\r \"email\": \"$user_email\",\r \"firstName\": \"$user_first_name\",\r \"lastName\": \"$user_last_name\",\r \"username\": \"$user_name\"\r}");

	try {

		//$product_id = "PASTE_PRODUCT_ID";			

		$email = $user_email;
		$first_name = $user_first_name;
		$last_name = $user_last_name;
		$quantity = 1;



		http_response_code(200);

	} catch (Exception $e) {
		http_response_code(500);
		update_post_meta($post_ID, "sub_error", $e->getMessage());
		//update_post_meta($order_id, "sub_error", $e->getMessage());

	}

}

function sub_start($post_ID)
{
	$author_id = get_post_field('post_author', $post_ID);
	$user_first_name = get_the_author_meta('user_firstname', $author_id);
	$user_last_name = get_the_author_meta('user_lastname', $author_id);
	$user_email = get_the_author_meta('user_email', $author_id);
	$user_name = get_the_author_meta('user_login', $author_id);
	$order_id = get_post_meta($post_ID, "order_id", true);
	//echo $post_ID;			

	//get Product ID
	$order = wc_get_order($order_id);
	$items = $order->get_items();
	foreach ($items as $item) {
		$product_post_id = $item->get_product_id();
		$credits = get_post_meta($product_post_id, "credits", true);
		$product_title = get_the_title($product_post_id);
	}

	$data = $order->get_data(); // The Order data	
	$billing_company = $data['billing']['company'];
	$billing_role = get_post_meta($post_ID, '_billing_role', true);

	$ob_user_id = get_user_meta($author_id, 'ob_user_id', true);

	firebase_request("https://us-central1-outboundlyappai.cloudfunctions.net/startSubscriptionWP", "{\r \"userId\": \"$ob_user_id\",\r \"credits\": \"$credits\", \"subscriptionLevel\": \"$product_title\",\r \"businessName\": \"$billing_company\",\r \"role\": \"$billing_role\",\r \"partnerId\": \"setly\",\r \"email\": \"$user_email\",\r \"firstName\": \"$user_first_name\",\r \"lastName\": \"$user_last_name\",\r \"username\": \"$user_name\"\r}");

	try {

		//$product_id = "PASTE_PRODUCT_ID";			

		$email = $user_email;
		$first_name = $user_first_name;
		$last_name = $user_last_name;
		$quantity = 1;

		// required for renewing the license subscription

		/* creating user is optional
		$user_exists = false;
		$user = CryptlexApi::GetUser($email);
		if($user == NULL) {
		$user_body["email"] = $email;
		$user_body["firstName"] = $first_name;
		$user_body["lastName"] = $last_name;
		$user_body["company"] = $last_name;
		// generate a random 8 character password
		$user_body["password"] = substr(md5(uniqid()), 0, 8);
		$user_body["role"] = "user";
		$user = CryptlexApi::CreateUser($user_body);
		} else {
		$user_exists = true;
		} */


		http_response_code(200);

	} catch (Exception $e) {
		http_response_code(500);
		update_post_meta($post_ID, "sub_error", $e->getMessage());
		//update_post_meta($order_id, "sub_error", $e->getMessage());

	}

}

add_action('ywsbs_subscription_started', 'sub_start', 10, 1);


//On subscription start
function buy_credits($post_ID)
{

	$order = wc_get_order($post_ID);

	$author_id = $order->get_user_id();

	//get Product ID
	$order = wc_get_order($post_ID);
	$items = $order->get_items();
	foreach ($items as $item) {
		$product_post_id = $item->get_product_id();
		$credits = get_post_meta($product_post_id, "credits", true);
		$product_title = get_the_title($product_post_id);
		$quantity = $item->get_quantity();
	}

	$credits = $credits * $quantity;

	$ob_user_id = get_user_meta($author_id, 'ob_user_id', true);

	firebase_request("https://us-central1-outboundlyappai.cloudfunctions.net/buyCreditsWP", "{\r \"userId\": \"$ob_user_id\",\r \"credits\": \"$credits\"\r}");

}



//for one time payments
function after_order_processing($order_id)
{
	$order = wc_get_order($order_id);
	foreach ($order->get_items() as $item) {
		if ($item['product_id'] == 17817) {
			sub_start_beta($order_id);
			$order->update_status('completed');
		}

		if ($item['product_id'] == 18365) {
			buy_credits($order_id);
			$order->update_status('completed');
		}
	}
}
add_action('woocommerce_thankyou', 'after_order_processing', 10, 1);



// Fix buy credits page
function inject_javascript_for_product()
{

	$post_id = get_the_ID();
	if ($post_id == 18365) {
		?>
		<script type="text/javascript">
			quantityInput = document.querySelector('.input-text.qty.text');
			minusButton = document.querySelector('.fal.fa-minus');
			plusButton = document.querySelector('.fal.fa-plus');

			minusButton.addEventListener('click', function () {
				if (quantityInput.value > 1) {
					quantityInput.value--;
				}
			});

			plusButton.addEventListener('click', function () {
				quantityInput.value++;
			});

			document.querySelector('.product-quantity').style.display = 'block';
		</script>
		<?php
	}
}

add_action('wp_footer', 'inject_javascript_for_product');



//Renew Subscription
function sub_renew($sub_id, $order_id)
{

	try {
		write_log("Renew Subscription");

		$order = wc_get_order($order_id);
		$items = $order->get_items();
		foreach ($items as $item) {
			$product_post_id = $item->get_product_id();
			$credits = get_post_meta($product_post_id, "credits", true);
			$product_title = get_the_title($product_post_id);
			$author_id = get_post_field('post_author', $order_id);
		}

		$ob_user_id = get_user_meta($author_id, 'ob_user_id', true);

		firebase_request("https://us-central1-outboundlyappai.cloudfunctions.net/renewSubcriptionWP", "{\r \"userId\": \"$ob_user_id\",\r \"credits\": \"$credits\"}");

		http_response_code(200);

	} catch (Exception $e) {
		http_response_code(500);
		write_log("Renew Error" . $e->getMessage());
	}

}
add_action('ywsbs_renew_order_payed', 'sub_renew', 10, 2);



// Remove the Zip/postcode field 

add_filter('woocommerce_checkout_fields', 'njengah_remove_the_postcode_field');

function njengah_remove_the_postcode_field($fields)
{
	$fields['billing']['billing_postcode']['required'] = false;
	$fields['shipping']['shipping_postcode']['required'] = false;
	return $fields;
}


add_filter('woocommerce_checkout_fields', 'ywp_no_zip_validation');
function ywp_no_zip_validation($fields)
{

	unset($fields['billing']['billing_postcode']['validate']);

	$fields['billing']['billing_linkedin'] = array(
		'label' => __('LinkedIn Profile URL', 'woocommerce'),
		'required' => false,
		'class' => array('form-row-wide'),
		'clear' => true
	);

	return $fields;
}

function remove_additional_information_checkout($fields)
{

	//unset($fields['billing_company']);
	unset($fields['billing_address_1']);
	unset($fields['billing_address_2']);
	unset($fields['billing_state']);
	unset($fields['billing_phone']);
	unset($fields['billing_postcode']);
	return $fields;
}
add_filter('woocommerce_billing_fields', 'remove_additional_information_checkout');


add_filter('woocommerce_checkout_fields', 'custom_override_checkout_fields_ek', 99);
function custom_override_checkout_fields_ek($fields)
{
	//unset($fields['billing']['billing_company']);
	unset($fields['billing']['billing_address_1']);
	unset($fields['billing']['billing_address_2']);
	unset($fields['billing']['billing_state']);
	unset($fields['billing']['billing_phone']);
	unset($fields['billing']['billing_postcode']);

	return $fields;
}

// Add custom field to Woocommerce checkout

add_filter('woocommerce_checkout_fields', 'add_custom_checkout_field');

function add_custom_checkout_field($fields) {

	$fields['billing']['billing_role'] = array(
		'type'      => 'text',
		'label'     => __('Your Role'),
		'required'  => true,
		'class'     => array('form-row-wide'),
		'clear'     => true
	);

	return $fields;
}

add_action('woocommerce_checkout_create_order', 'save_custom_checkout_field_to_order_meta', 10, 2);

function save_custom_checkout_field_to_order_meta($order_id, $posted_data) {
    if (!empty($_POST['billing_role'])) {
        update_post_meta($order_id, '_billing_role', sanitize_text_field($_POST['billing_role']));
    }
}


add_filter('woocommerce_thankyou_order_received_text', 'woo_change_order_received_text', 10, 2);
function woo_change_order_received_text($str, $order)
{
	$new_str = 'You have been sent an order confirmation. Please ensure to mark the email as not SPAM if it went to your SPAM or Junk folder so you recieve future notifications.<br><br>Download the Chrome extension from the Chrome web store here --> <a href="https://chrome.google.com/webstore/detail/setly-linkedin-prospectin/hmfpfhobagcldmcoaigbaendlfcekpgj" target="_blank">Download Setly</a><br><br> <strong>Important</strong> When installing the extension you may recieve a warning notifying that we are new developer. This is a standard message that shows for all extensions that are newly uploaded.';
	return $new_str;
}

remove_action('woocommerce_after_single_product_summary', 'woocommerce_output_related_products', 20);

//TABGS UNDER IMAGE
remove_action('woocommerce_after_single_product_summary', 'woocommerce_output_product_data_tabs', 10);


//if product with id 18342 was already purchased don't allow user to purchase again
add_filter('woocommerce_is_purchasable', 'custom_woocommerce_is_purchasable', 10, 2);
function custom_woocommerce_is_purchasable($purchasable, $product)
{
	if ($product->get_id() == 18342 && wc_customer_bought_product('', get_current_user_id(), 18342)) {
		$purchasable = false;
	}
	return $purchasable;
}

function my_customize_rest_cors()
{
	remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
	add_filter('rest_pre_serve_request', function ($value) {
		header('Access-Control-Allow-Origin: *');
		header('Access-Control-Allow-Methods: GET,HEAD,OPTIONS,POST,PUT');
		header('Access-Control-Allow-Credentials: true');
		header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization');
		header('Access-Control-Expose-Headers: Link', false);
		return $value;
	});
}
add_action('rest_api_init', 'my_customize_rest_cors', 15);

function add_cors_http_header()
{
	header("Access-Control-Allow-Origin: *");
	header('Access-Control-Allow-Origin: *');
	header('Access-Control-Allow-Methods: GET,HEAD,OPTIONS,POST,PUT');
	header('Access-Control-Allow-Credentials: true');
	header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization');
	header('Access-Control-Expose-Headers: Link', false);
}
add_action('init', 'add_cors_http_header');


function custom_woocommerce_thank_you_page($order_id)
{
	$order = wc_get_order($order_id);
	foreach ($order->get_items() as $item_id => $item) {
		$product_id = $item->get_product_id();
		// Add your conditions here to check the product ID and redirect to the custom thank you page.
		if ($product_id == 17817) {
			wp_redirect(home_url('/signup-confirmation'));
			exit;
		}
	}
}

add_action('woocommerce_thankyou', 'custom_woocommerce_thank_you_page');

function firebase_request($endpoint, $postfields)
{
	$curl = curl_init();
	curl_setopt_array($curl, array(
		CURLOPT_URL => $endpoint,
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_ENCODING => "",
		CURLOPT_MAXREDIRS => 10,
		CURLOPT_TIMEOUT => 30,
		CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
		CURLOPT_CUSTOMREQUEST => "PATCH",
		CURLOPT_POSTFIELDS => $postfields,
		CURLOPT_HTTPHEADER => array("cache-control: no-cache", "content-type: application/json",
		),
	)
	);
	$response = curl_exec($curl);
	$err = curl_error($curl);
	curl_close($curl);
	if ($err) {
		echo "cURL Error #:";
	} else {
		write_log($response);
	}
	return $response;
}