<?php
/**
 * The core plugin class.
 *
 * Orchestrates the plugin by defining hooks and dependencies.
 *
 * @package OverSeek_Search
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class Overseek_Search
 *
 * Main plugin orchestrator.
 */
class Overseek_Search {

    /**
     * The loader responsible for maintaining and registering hooks.
     *
     * @var Overseek_Search_Loader
     */
    protected $loader;

    /**
     * Plugin text domain for i18n.
     *
     * @var string
     */
    protected $plugin_name = 'overseek-search';

    /**
     * Current plugin version.
     *
     * @var string
     */
    protected $version;

    /**
     * Initialize the plugin.
     */
    public function __construct() {
        $this->version = defined( 'OVERSEEK_SEARCH_VERSION' ) ? OVERSEEK_SEARCH_VERSION : '1.0.0';
        $this->load_dependencies();
        $this->set_locale();
        $this->define_admin_hooks();
        $this->define_public_hooks();
        $this->define_api_hooks();
    }

    /**
     * Load required dependencies.
     */
    private function load_dependencies() {
        // Core classes.
        require_once OVERSEEK_SEARCH_PLUGIN_DIR . 'includes/class-overseek-search-database.php';
        
        // Search engine classes.
        require_once OVERSEEK_SEARCH_PLUGIN_DIR . 'includes/Search/class-search-index.php';
        require_once OVERSEEK_SEARCH_PLUGIN_DIR . 'includes/Search/class-search-engine.php';
        require_once OVERSEEK_SEARCH_PLUGIN_DIR . 'includes/Search/class-fuzzy-matcher.php';
        require_once OVERSEEK_SEARCH_PLUGIN_DIR . 'includes/Search/class-synonym-manager.php';
        require_once OVERSEEK_SEARCH_PLUGIN_DIR . 'includes/Search/class-realtime-sync.php';
        
        // API controllers.
        require_once OVERSEEK_SEARCH_PLUGIN_DIR . 'includes/API/class-search-controller.php';
        require_once OVERSEEK_SEARCH_PLUGIN_DIR . 'includes/API/class-analytics-controller.php';
        require_once OVERSEEK_SEARCH_PLUGIN_DIR . 'includes/API/class-admin-controller.php';
        
        // Admin and frontend classes.
        require_once OVERSEEK_SEARCH_PLUGIN_DIR . 'includes/Admin/class-admin-page.php';
        require_once OVERSEEK_SEARCH_PLUGIN_DIR . 'includes/Frontend/class-frontend.php';
        require_once OVERSEEK_SEARCH_PLUGIN_DIR . 'includes/Frontend/class-search-replacement.php';
        
        $this->loader = new Overseek_Search_Loader();
    }

    /**
     * Set the plugin text domain for translations.
     */
    private function set_locale() {
        $this->loader->add_action( 'init', $this, 'load_textdomain' );
    }

    /**
     * Load the plugin text domain.
     */
    public function load_textdomain() {
        load_plugin_textdomain(
            'overseek-search',
            false,
            dirname( OVERSEEK_SEARCH_PLUGIN_BASENAME ) . '/languages/'
        );
    }

    /**
     * Register admin-specific hooks.
     */
    private function define_admin_hooks() {
        $admin_page = new Overseek_Search_Admin_Page( $this->get_plugin_name(), $this->get_version() );
        
        $this->loader->add_action( 'admin_menu', $admin_page, 'add_menu_page' );
        $this->loader->add_action( 'admin_enqueue_scripts', $admin_page, 'enqueue_assets' );
        
        // Real-time sync for product changes.
        $realtime_sync = new Overseek_Search_Realtime_Sync();
        $this->loader->add_action( 'woocommerce_new_product', $realtime_sync, 'on_product_created' );
        $this->loader->add_action( 'woocommerce_update_product', $realtime_sync, 'on_product_updated' );
        $this->loader->add_action( 'before_delete_post', $realtime_sync, 'on_product_deleted' );
        $this->loader->add_action( 'woocommerce_product_set_stock_status', $realtime_sync, 'on_stock_changed', 10, 2 );
    }

    /**
     * Register public-facing hooks.
     */
    private function define_public_hooks() {
        $frontend = new Overseek_Search_Frontend( $this->get_plugin_name(), $this->get_version() );
        
        $this->loader->add_action( 'wp_enqueue_scripts', $frontend, 'enqueue_assets' );
        $this->loader->add_action( 'wp_footer', $frontend, 'render_search_modal_root' );

        // Initialize search replacement (replaces WooCommerce search forms).
        $search_replacement = new Overseek_Search_Replacement();
        $search_replacement->init();
    }

    /**
     * Register REST API hooks.
     */
    private function define_api_hooks() {
        $search_controller    = new Overseek_Search_Search_Controller();
        $analytics_controller = new Overseek_Search_Analytics_Controller();
        $admin_controller     = new Overseek_Search_Admin_Controller();
        
        $this->loader->add_action( 'rest_api_init', $search_controller, 'register_routes' );
        $this->loader->add_action( 'rest_api_init', $analytics_controller, 'register_routes' );
        $this->loader->add_action( 'rest_api_init', $admin_controller, 'register_routes' );
    }

    /**
     * Run the loader to register all hooks.
     */
    public function run() {
        $this->loader->run();
    }

    /**
     * Get the plugin name/text domain.
     *
     * @return string
     */
    public function get_plugin_name() {
        return $this->plugin_name;
    }

    /**
     * Get the plugin version.
     *
     * @return string
     */
    public function get_version() {
        return $this->version;
    }

    /**
     * Get the loader instance.
     *
     * @return Overseek_Search_Loader
     */
    public function get_loader() {
        return $this->loader;
    }
}
