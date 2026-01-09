<?php
/**
 * Admin page handler.
 *
 * Renders the admin dashboard and enqueues React app.
 *
 * @package OverSeek_Search
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class Overseek_Search_Admin_Page
 *
 * Handles the WordPress admin interface.
 */
class Overseek_Search_Admin_Page {

    /**
     * Plugin name.
     *
     * @var string
     */
    private $plugin_name;

    /**
     * Plugin version.
     *
     * @var string
     */
    private $version;

    /**
     * Constructor.
     *
     * @param string $plugin_name The plugin name.
     * @param string $version     The plugin version.
     */
    public function __construct( $plugin_name, $version ) {
        $this->plugin_name = $plugin_name;
        $this->version     = $version;
    }

    /**
     * Add admin menu page.
     */
    public function add_menu_page() {
        add_menu_page(
            __( 'OverSeek Search', 'overseek-search' ),
            __( 'OverSeek Search', 'overseek-search' ),
            'manage_woocommerce',
            'overseek-search',
            array( $this, 'render_page' ),
            'dashicons-search',
            56
        );

        add_submenu_page(
            'overseek-search',
            __( 'Settings', 'overseek-search' ),
            __( 'Settings', 'overseek-search' ),
            'manage_woocommerce',
            'overseek-search',
            array( $this, 'render_page' )
        );

        add_submenu_page(
            'overseek-search',
            __( 'Analytics', 'overseek-search' ),
            __( 'Analytics', 'overseek-search' ),
            'manage_woocommerce',
            'overseek-search-analytics',
            array( $this, 'render_page' )
        );

        add_submenu_page(
            'overseek-search',
            __( 'Synonyms', 'overseek-search' ),
            __( 'Synonyms', 'overseek-search' ),
            'manage_woocommerce',
            'overseek-search-synonyms',
            array( $this, 'render_page' )
        );
    }

    /**
     * Render the admin page.
     */
    public function render_page() {
        echo '<div id="overseek-search-admin" class="wrap"></div>';
    }

    /**
     * Enqueue admin assets.
     *
     * @param string $hook_suffix The current admin page hook.
     */
    public function enqueue_assets( $hook_suffix ) {
        // Only load on our pages.
        $our_pages = array(
            'toplevel_page_overseek-search',
            'overseek-search_page_overseek-search-analytics',
            'overseek-search_page_overseek-search-synonyms',
        );

        if ( ! in_array( $hook_suffix, $our_pages, true ) ) {
            return;
        }

        // Determine current tab.
        $current_page = isset( $_GET['page'] ) ? sanitize_text_field( wp_unslash( $_GET['page'] ) ) : 'overseek-search';
        $tab_map = array(
            'overseek-search'           => 'settings',
            'overseek-search-analytics' => 'analytics',
            'overseek-search-synonyms'  => 'synonyms',
        );
        $current_tab = isset( $tab_map[ $current_page ] ) ? $tab_map[ $current_page ] : 'settings';

        // Enqueue React app.
        $asset_file = OVERSEEK_SEARCH_PLUGIN_DIR . 'build/admin.asset.php';
        $asset      = file_exists( $asset_file ) ? require $asset_file : array(
            'dependencies' => array( 'wp-element', 'wp-components', 'wp-api-fetch', 'wp-i18n' ),
            'version'      => $this->version,
        );

        wp_enqueue_style(
            'overseek-search-admin',
            OVERSEEK_SEARCH_PLUGIN_URL . 'build/admin.css',
            array( 'wp-components' ),
            $asset['version']
        );

        wp_enqueue_script(
            'overseek-search-admin',
            OVERSEEK_SEARCH_PLUGIN_URL . 'build/admin.js',
            $asset['dependencies'],
            $asset['version'],
            true
        );

        wp_localize_script(
            'overseek-search-admin',
            'overseekSearchAdmin',
            array(
                'apiUrl'     => rest_url( 'overseek-search/v1' ),
                'nonce'      => wp_create_nonce( 'wp_rest' ),
                'currentTab' => $current_tab,
                'version'    => $this->version,
                'adminUrl'   => admin_url( 'admin.php' ),
                'i18n'       => array(
                    'settings'       => __( 'Settings', 'overseek-search' ),
                    'analytics'      => __( 'Analytics', 'overseek-search' ),
                    'synonyms'       => __( 'Synonyms', 'overseek-search' ),
                    'reindex'        => __( 'Rebuild Index', 'overseek-search' ),
                    'reindexing'     => __( 'Reindexing...', 'overseek-search' ),
                    'saveSettings'   => __( 'Save Settings', 'overseek-search' ),
                    'saved'          => __( 'Settings saved!', 'overseek-search' ),
                    'addSynonym'     => __( 'Add Synonym', 'overseek-search' ),
                    'baseTerm'       => __( 'Base Term', 'overseek-search' ),
                    'synonymsList'   => __( 'Synonyms (comma separated)', 'overseek-search' ),
                    'oneWay'         => __( 'One-way only', 'overseek-search' ),
                    'delete'         => __( 'Delete', 'overseek-search' ),
                    'noResults'      => __( 'No results found', 'overseek-search' ),
                ),
            )
        );
    }
}
