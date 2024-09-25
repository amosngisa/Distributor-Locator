<?php
/*
 * Plugin Name: ADistributor Locator
 * Plugin URI: https://github.com/amosngisa/Distributor-Locator
 * Description: A plugin to add distributors and allow users to search by country or state.
 * Version: 1.1
 * Author: Amos Nyaundi
 * Author URI: https://www.linkedin.com/in/amosngisa
 */

// Register a distributor custom post type
function dl_register_distributor_post_type() {
    $labels = array(
        'name' => 'Distributors',
        'singular_name' => 'Distributor',
        'menu_name' => 'Distributors',
        'name_admin_bar' => 'Distributor',
        'add_new' => 'Add New',
        'add_new_item' => 'Add New Distributor',
        'new_item' => 'New Distributor',
        'edit_item' => 'Edit Distributor',
        'view_item' => 'View Distributor',
        'all_items' => 'All Distributors',
        'search_items' => 'Search Distributors',
        'not_found' => 'No distributors found.',
        'not_found_in_trash' => 'No distributors found in Trash.',
    );

    $args = array(
        'labels' => $labels,
        'public' => true,
        'publicly_queryable' => true,
        'show_ui' => true,
        'show_in_menu' => true,
        'query_var' => true,
        'rewrite' => array('slug' => 'distributor'),
        'capability_type' => 'post',
        'has_archive' => true,
        'hierarchical' => false,
        'menu_position' => null,
        'supports' => array('title', 'editor', 'thumbnail'),
    );

    register_post_type('distributor', $args);
}
add_action('init', 'dl_register_distributor_post_type');

// Meta box for entering distributor details
function dl_add_distributor_meta_box() {
    add_meta_box(
        'distributor_details', 
        'Distributor Details', 
        'dl_display_distributor_meta_box', 
        'distributor', 
        'normal', 
        'high'
    );
}
add_action('add_meta_boxes', 'dl_add_distributor_meta_box');

function dl_display_distributor_meta_box($post) {
    // Retrieve existing metadata
    $fields = [
        'country' => 'Country',
        'state' => 'State (if USA)',
        'name' => 'Distributor Name',
        'address' => 'Address',
        'phone' => 'Phone',
        'email' => 'Email',
        'website' => 'Website'
    ];
    
    foreach ($fields as $key => $label) {
        $value = get_post_meta($post->ID, "distributor_$key", true);
        echo "<label for='distributor_$key'>$label:</label>
              <input type='text' id='distributor_$key' name='distributor_$key' value='" . esc_attr($value) . "' /><br/><br/>";
    }
}

// Save distributor details
function dl_save_distributor_details($post_id) {
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;

    $fields = ['country', 'state', 'name', 'address', 'phone', 'email', 'website'];
    
    foreach ($fields as $field) {
        if (isset($_POST["distributor_$field"])) {
            $value = $field === 'email' ? sanitize_email($_POST["distributor_$field"]) : sanitize_text_field($_POST["distributor_$field"]);
            update_post_meta($post_id, "distributor_$field", $value);
        }
    }
}
add_action('save_post', 'dl_save_distributor_details');

// Add columns to the admin list for the distributors post type
function dl_set_custom_edit_distributor_columns($columns) {
    unset($columns['date']);
    $columns['title'] = 'Distributor Name';
    $columns['address'] = 'Address';
    $columns['email'] = 'Email';
    $columns['phone'] = 'Phone';
    $columns['website'] = 'Website';
    $columns['country'] = 'Country/State';
    return $columns;
}
add_filter('manage_distributor_posts_columns', 'dl_set_custom_edit_distributor_columns');

// Display custom column content
function dl_custom_distributor_column($column, $post_id) {
    switch ($column) {
        case 'address':
            echo esc_html(get_post_meta($post_id, 'distributor_address', true));
            break;
        case 'country':
            echo esc_html(get_post_meta($post_id, 'distributor_country', true) ?: get_post_meta($post_id, 'distributor_state', true));
            break;
        case 'email':
            echo esc_html(get_post_meta($post_id, 'distributor_email', true));
            break;
        case 'phone':
            echo esc_html(get_post_meta($post_id, 'distributor_phone', true));
            break;
        case 'website':
            echo esc_html(get_post_meta($post_id, 'distributor_website', true));
            break;
    }
}
add_action('manage_distributor_posts_custom_column', 'dl_custom_distributor_column', 10, 2);

// Make the new columns sortable
function dl_set_custom_sortable_distributor_columns($columns) {
    $columns['country'] = 'country';
    $columns['email'] = 'email';
    $columns['phone'] = 'phone';
    $columns['website'] = 'website';
    return $columns;
}
add_filter('manage_edit-distributor_sortable_columns', 'dl_set_custom_sortable_distributor_columns');

// Hook to enqueue styles and scripts
add_action('wp_enqueue_scripts', 'distributor_locations_enqueue_assets');
function distributor_locations_enqueue_assets() {
    // Plugin directory URL
    $plugin_url = plugin_dir_url(__FILE__);

    // Enqueue the CSS file
    wp_enqueue_style('distributor-locations-style', $plugin_url . 'css/style.css');

    // Enqueue the JS file
    wp_enqueue_script('distributor-locations-script', $plugin_url . 'js/script.js', array('jquery'), null, true); 
    // The 'array('jquery')' adds jQuery as a dependency, and 'true' loads the JS file in the footer.
}

// Shortcode to display distributors based on selected country or state
function dl_distributor_map_shortcode() {
    ?>
		<div class="form-container">
			<div class="form-group">
				 <select id="international">
                    <option value="" selected="">Select a Country</option>
                </select>
				<span class="label">International</span>
			</div>

			<div class="form-group">
				 <select id="unitedstates">
                    <option value="" selected="">Select a State</option>
                </select>
				<span class="label">US</span>
			</div>
		</div>
    <section class="content-max-width">
       
        <div class="results" id="majibu" hidden>
			<p class="note">Your search retrieved the following representatives</p>
				<hr>
            <div class="wrap" id="distributor-list">
                <!-- Distributor results will be populated here -->
            </div>
        </div>
    </section>
  
    <?php
}
add_shortcode('distributor_map', 'dl_distributor_map_shortcode');

// AJAX handler for getting countries and states
function dl_get_countries_states() {
    $region = sanitize_text_field($_POST['region']);
    
    $meta_key = $region === 'USA' ? 'distributor_state' : 'distributor_country';
    
    global $wpdb;
    $countriesStates = $wpdb->get_col($wpdb->prepare("
        SELECT DISTINCT meta_value 
        FROM $wpdb->postmeta 
        WHERE meta_key = %s
    ", $meta_key));

    wp_send_json($countriesStates);
}
add_action('wp_ajax_get_countries_states', 'dl_get_countries_states');
add_action('wp_ajax_nopriv_get_countries_states', 'dl_get_countries_states');

// AJAX handler for getting distributors
function dl_get_distributors() {
    $region = $_POST['region'];
    $countryOrState = $_POST['countryOrState'];

    $args = array(
        'post_type' => 'distributor',
        'meta_query' => array(
            array(
                'key' => ($region === 'International' ? 'distributor_country' : 'distributor_state'),
                'value' => $countryOrState,
                'compare' => '='
            )
        )
    );

    $distributors = new WP_Query($args);
    $results = array();

    if ($distributors->have_posts()) {
        while ($distributors->have_posts()) {
            $distributors->the_post();
            $results[] = array(
                'name' => get_the_title(),
                'address' => get_post_meta(get_the_ID(), 'distributor_address', true),
                'phone' => get_post_meta(get_the_ID(), 'distributor_phone', true),
                'email' => get_post_meta(get_the_ID(), 'distributor_email', true),
                'website' => get_post_meta(get_the_ID(), 'distributor_website', true),
            );
        }
        wp_reset_postdata();
    }
    echo json_encode($results);
    wp_die();
}
add_action('wp_ajax_get_distributors', 'dl_get_distributors');
add_action('wp_ajax_nopriv_get_distributors', 'dl_get_distributors');