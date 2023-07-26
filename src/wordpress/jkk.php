<?php
/**
 * Plugin Name: Add User Credits
 * Description: A plugin to update user credits in Firebase using an autocomplete input for usernames
 * Version: 1.0
 * Author: Outboundly
 * Author URI: https://outboundly.app
 */

// Enqueue scripts and styles
function auc_enqueue_scripts()
{
	wp_enqueue_script('jquery-ui-autocomplete');
	wp_enqueue_style('jquery-ui-css', 'https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/smoothness/jquery-ui.css');
}
add_action('admin_enqueue_scripts', 'auc_enqueue_scripts');

// Create the admin page for the plugin
function auc_admin_menu()
{
	add_menu_page('Add User Credits', 'User Credits', 'manage_options', 'autocomplete-user-credits', 'auc_admin_page_callback');
}
add_action('admin_menu', 'auc_admin_menu');

// Display the admin page
function auc_admin_page_callback() {
    ?>
    <div class="wrap">
        <h1>Autocomplete User Credits</h1>
        <form id="auc_form" method="post">
            <table class="form-table">
                <tr>
                    <th scope="row"><label for="user_name">Username</label></th>
                    <td><input type="text" id="user_name" name="user_name" class="regular-text"></td>
                </tr>
                <tr>
                    <th scope="row"><label for="credits">Credits</label></th>
                    <td><input type="number" id="credits" name="credits" class="regular-text"></td>
                </tr>
            </table>
            <input type="submit" value="Apply" class="button button-primary" id="apply_button">
        </form>
    </div>
    <script type="text/javascript">
        jQuery(document).ready(function($) {
            // Autocomplete function
            $("#user_name").autocomplete({
                source: function(request, response) {
                    $.ajax({
                        url: ajaxurl,
                        dataType: "json",
                        data: {
                            action: "auc_get_users",
                            term: request.term
                        },
                        success: function(data) {
                            response(data);
                        }
                    });
                },
                minLength: 2
            });

            // Handle form submission
            $("#auc_form").on("submit", function(e) {
                e.preventDefault();
                const user_name = $("#user_name").val();
                const credits = $("#credits").val();
                const applyButton = $("#apply_button");

                applyButton.prop("disabled", true).val("Loading...");

                $.ajax({
                    url: ajaxurl,
                    dataType: "json",
                    method: "POST",
                    data: {
                        action: "auc_update_credits",
                        user_name: user_name,
                        credits: credits
                    },
                    success: function(data) {
                        alert(data.message);
                    },
                    complete: function() {
                        applyButton.prop("disabled", false).val("Apply");
                    }
                });
            });
        });
    </script>
    <?php
}

// AJAX action to get users
function auc_get_users()
{
	$search_term = $_GET['term'];
	$users = get_users(array('search' => '*' . $search_term . '*'));

	$usernames = array();
	foreach ($users as $user) {

		$usernames[] = $user->user_login;
	}
	echo json_encode($usernames);
	wp_die();
}
add_action('wp_ajax_auc_get_users', 'auc_get_users');

// AJAX action to update user credits in Firebase
function auc_update_credits()
{
	$user_name = $_POST['user_name'];
	$credits = $_POST['credits'];

	$user = get_user_by('login', $user_name);
	if ($user) {
		$author_id = $user->ID;
		$user_email = $user->user_email;
		$user_first_name = $user->first_name;
		$user_last_name = $user->last_name;



		$postfields = json_encode(
			array(
				"credits" => $credits,
				"userId" => $author_id,
			)
		);


		$endpoint = "https://us-central1-outboundlyappai.cloudfunctions.net/renewSubcriptionWP";
		
		$response = firebase_request($endpoint, $postfields);

		echo json_encode(array('message' => 'Credits updated successfully.'));
	} else {
		echo json_encode(array('message' => 'User not found.'));
	}
	wp_die();
}
add_action('wp_ajax_auc_update_credits', 'auc_update_credits');

?>