<?php
/**
 * Plugin Name: OverSeek Search
 * Plugin URI: https://github.com/SLDevs/overseek-search
 * Description: A high-performance, self-contained search engine for WooCommerce with instant search, fuzzy matching, synonyms, faceted filters, analytics, and voice search.
 * Version: 1.0.0
 * Requires at least: 6.0
 * Requires PHP: 8.0
 * Author: SLDevs
 * Author URI: https://sldevs.com
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: overseek-search
 * Domain Path: /languages
 * WC requires at least: 7.0
 * WC tested up to: 9.0
 *
 * @package OverSeek_Search
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Plugin version constant.
define( 'OVERSEEK_SEARCH_VERSION', '1.0.0' );
define( 'OVERSEEK_SEARCH_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'OVERSEEK_SEARCH_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'OVERSEEK_SEARCH_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

/**
 * Declare HPOS compatibility.
 */
add_action(
	'before_woocommerce_init',
	function () {
		if ( class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) {
			\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__, true );
		}
	}
);

/**
 * Check if WooCommerce is active and initialize the plugin.
 */
function overseek_search_init() {
	// Check for WooCommerce.
	if ( ! class_exists( 'WooCommerce' ) ) {
		add_action( 'admin_notices', 'overseek_search_woocommerce_missing_notice' );
		return;
	}

	// Load plugin dependencies.
	require_once OVERSEEK_SEARCH_PLUGIN_DIR . 'includes/class-overseek-search-loader.php';
	require_once OVERSEEK_SEARCH_PLUGIN_DIR . 'includes/class-overseek-search.php';

	// Initialize the plugin.
	$plugin = new Overseek_Search();
	$plugin->run();
}
add_action( 'plugins_loaded', 'overseek_search_init' );

/**
 * Display admin notice if WooCommerce is not active.
 */
function overseek_search_woocommerce_missing_notice() {
	?>
	<div class="notice notice-error">
		<p>
			<strong><?php esc_html_e( 'OverSeek Search', 'overseek-search' ); ?></strong>
			<?php esc_html_e( 'requires WooCommerce to be installed and activated.', 'overseek-search' ); ?>
		</p>
	</div>
	<?php
}

/**
 * Register the shortcode for search replacement.
 *
 * @param array $atts Shortcode attributes.
 */
function overseek_search_shortcode( $atts ) {
	$atts = shortcode_atts(
		array(
			'placeholder' => __( 'Search products...', 'overseek-search' ),
			'max_results' => 5,
			'show_voice'  => 'true',
		),
		$atts,
		'overseek_search'
	);

	$container_id = 'overseek-inline-search-' . uniqid();

	return sprintf(
		'<div id="%s" class="overseek-inline-mount" data-overseek-search="true"></div>',
		esc_attr( $container_id )
	);
}
add_shortcode( 'overseek_search', 'overseek_search_shortcode' );

/**
 * Plugin activation hook.
 */
function overseek_search_activate() {
	require_once OVERSEEK_SEARCH_PLUGIN_DIR . 'includes/class-overseek-search-database.php';
	Overseek_Search_Database::create_tables();

	// Set default options.
	$defaults = array(
		'fuzzy_enabled'        => true,
		'fuzzy_threshold'      => 2,
		'results_per_page'     => 8,
		'max_dropdown_results' => 5,
		'highlight_matches'    => true,
		'track_analytics'      => true,
		'voice_search'         => false,
		'replace_search'       => true,
		'search_fields'        => array( 'title', 'sku', 'description', 'categories' ),
		'title_weight'         => 3,
		'sku_weight'           => 2,
		'description_weight'   => 1,
	);

	if ( ! get_option( 'overseek_search_settings' ) ) {
		update_option( 'overseek_search_settings', $defaults );
	}

	// Store DB version for future migrations.
	update_option( 'overseek_search_db_version', OVERSEEK_SEARCH_VERSION );

	// Flush rewrite rules to ensure REST API routes work.
	flush_rewrite_rules();
}
register_activation_hook( __FILE__, 'overseek_search_activate' );

/**
 * Plugin deactivation hook.
 */
function overseek_search_deactivate() {
	// Clear any scheduled events if applicable.
	wp_clear_scheduled_hook( 'overseek_search_reindex_cron' );
}
register_deactivation_hook( __FILE__, 'overseek_search_deactivate' );

/**
 * Cron callback for background reindexing.
 */
function overseek_search_cron_reindex() {
	require_once OVERSEEK_SEARCH_PLUGIN_DIR . 'includes/Search/class-search-index.php';
	$stats = Overseek_Search_Index::cron_reindex();

	// Log results.
	if ( is_array( $stats ) ) {
		// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- Useful operational log for scheduled reindex.
		error_log( 'OverSeek Search: Background reindex batch completed. Indexed: ' . $stats['indexed'] . ', Failed: ' . $stats['failed'] . ', Remaining: ' . $stats['remaining'] );
	}
}
add_action( 'overseek_search_reindex_cron', 'overseek_search_cron_reindex' );
