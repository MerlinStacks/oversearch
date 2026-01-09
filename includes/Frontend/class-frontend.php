<?php
/**
 * Frontend handler.
 *
 * Renders the search modal and enqueues frontend assets.
 *
 * @package OverSeek_Search
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class Overseek_Search_Frontend
 *
 * Handles frontend search modal injection.
 */
class Overseek_Search_Frontend {

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
     * Enqueue frontend assets.
     */
    public function enqueue_assets() {
        // Only load on frontend (not admin).
        if ( is_admin() ) {
            return;
        }

        $settings = get_option( 'overseek_search_settings', array() );

        // Enqueue React frontend app.
        $asset_file = OVERSEEK_SEARCH_PLUGIN_DIR . 'build/frontend.asset.php';
        $asset      = file_exists( $asset_file ) ? require $asset_file : array(
            'dependencies' => array( 'wp-element' ),
            'version'      => $this->version,
        );

        wp_enqueue_style(
            'overseek-search-frontend',
            OVERSEEK_SEARCH_PLUGIN_URL . 'build/frontend.css',
            array(),
            $asset['version']
        );

        wp_enqueue_script(
            'overseek-search-frontend',
            OVERSEEK_SEARCH_PLUGIN_URL . 'build/frontend.js',
            $asset['dependencies'],
            $asset['version'],
            true
        );

        wp_localize_script(
            'overseek-search-frontend',
            'overseekSearch',
            array(
                'apiUrl'             => rest_url( 'overseek-search/v1' ),
                'nonce'              => wp_create_nonce( 'wp_rest' ),
                'maxDropdownResults' => isset( $settings['max_dropdown_results'] ) ? (int) $settings['max_dropdown_results'] : 5,
                'replaceSearch'      => isset( $settings['replace_search'] ) ? (bool) $settings['replace_search'] : true,
                'initialQuery'       => Overseek_Search_Replacement::get_initial_query(),
                'currency'           => array(
                    'symbol'   => get_woocommerce_currency_symbol(),
                    'position' => get_option( 'woocommerce_currency_pos', 'left' ),
                    'decimals' => wc_get_price_decimals(),
                ),
                'i18n'               => array(
                    'searchPlaceholder' => __( 'Search for products...', 'overseek-search' ),
                    'noResults'         => __( 'No products found', 'overseek-search' ),
                    'recentSearches'    => __( 'Your search history', 'overseek-search' ),
                    'clear'             => __( 'Clear', 'overseek-search' ),
                    'pressEscape'       => __( 'Press ESC to close', 'overseek-search' ),
                ),
            )
        );

    }

    /**
     * Render the search modal root element.
     */
    public function render_search_modal_root() {
        if ( is_admin() ) {
            return;
        }

        echo '<div id="overseek-search-root"></div>';
    }
}
