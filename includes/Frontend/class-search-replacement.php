<?php
/**
 * Search replacement handler.
 *
 * Replaces WooCommerce search forms with OverSeek trigger and intercepts native search queries.
 *
 * @package OverSeek_Search
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class Overseek_Search_Replacement
 *
 * Handles replacement of WooCommerce search with OverSeek.
 */
class Overseek_Search_Replacement {

    /**
     * Whether search replacement is enabled.
     *
     * @var bool
     */
    private $enabled;

    /**
     * Constructor.
     */
    public function __construct() {
        $settings      = get_option( 'overseek_search_settings', array() );
        $this->enabled = isset( $settings['replace_search'] ) ? (bool) $settings['replace_search'] : true;
    }

    /**
     * Initialize hooks.
     */
    public function init() {
        if ( ! $this->enabled ) {
            return;
        }

        // Replace WooCommerce product search form.
        add_filter( 'get_product_search_form', array( $this, 'replace_product_search_form' ), 999 );

        // Replace generic search form on WooCommerce pages.
        add_filter( 'get_search_form', array( $this, 'replace_search_form' ), 999, 2 );

        // Intercept native product search queries.
        add_action( 'template_redirect', array( $this, 'intercept_search_redirect' ) );
    }

    /**
     * Replace the WooCommerce product search form with OverSeek trigger.
     *
     * @param string $form The original product search form HTML.
     * @return string The replacement HTML.
     */
    public function replace_product_search_form( $form ) {
        return $this->get_trigger_button();
    }

    /**
     * Replace generic search forms on WooCommerce pages.
     *
     * @param string $form The original search form HTML.
     * @param array  $args Optional. Search form arguments.
     * @return string The replacement HTML or original form.
     */
    public function replace_search_form( $form, $args = array() ) {
        // Only replace on WooCommerce pages or when explicitly searching products.
        if ( ! $this->is_woocommerce_context() ) {
            return $form;
        }

        return $this->get_trigger_button();
    }

    /**
     * Check if we're in a WooCommerce context.
     *
     * @return bool True if on a WooCommerce page.
     */
    private function is_woocommerce_context() {
        if ( ! function_exists( 'is_woocommerce' ) ) {
            return false;
        }

        return is_woocommerce() || is_shop() || is_product_category() || is_product_tag();
    }

    /**
     * Generate the OverSeek search replacement HTML.
     * 
     * Renders a container that React will mount the inline search bar into.
     *
     * @return string The search container HTML.
     */
    private function get_trigger_button() {
        // Generate unique ID for multiple search forms on same page.
        static $instance = 0;
        $instance++;

        $container_id = 'overseek-inline-search-' . $instance;

        // Set action to WooCommerce shop page (WC-products search).
        $action = function_exists( 'wc_get_page_id' )
            ? get_permalink( wc_get_page_id( 'shop' ) )
            : home_url( '/shop/' );

        return sprintf(
            '<div id="%1$s" class="overseek-inline-mount" data-overseek-search="true">
                <noscript>
                    <form role="search" method="get" action="%3$s" class="overseek-fallback-form">
                        <label for="overseek-search-input-%2$d" class="screen-reader-text">%4$s</label>
                        <input
                            id="overseek-search-input-%2$d"
                            type="search"
                            name="s"
                            placeholder="%5$s"
                            value="%6$s"
                            required
                        />
                        <input type="hidden" name="post_type" value="product" />
                        <button type="submit">%4$s</button>
                    </form>
                </noscript>
            </div>',
            esc_attr( $container_id ),                         // 1 %s
            absint( $instance ),                                // 2 %d
            esc_url( $action ),                                  // 3 %s
            esc_attr_x( 'Search', 'submit button', 'overseek-search' ), // 4 %s
            esc_attr_x( 'Search products...', 'placeholder', 'overseek-search' ), // 5 %s
            esc_attr( isset( $_GET['s'] ) ? sanitize_text_field( wp_unslash( $_GET['s'] ) ) : '' ) // 6 %s
        );

        // Only intercept product searches.
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        $post_type = isset( $_GET['post_type'] ) ? sanitize_text_field( wp_unslash( $_GET['post_type'] ) ) : '';

        if ( 'product' !== $post_type && ! is_shop() && ! is_product_category() && ! is_product_tag() ) {
            return;
        }

        // The query will be passed to JS via wp_localize_script in the Frontend class.
        // We don't redirect; we let the page load and the modal opens with the query pre-filled.
    }

    /**
     * Get the initial search query if coming from a native search.
     *
     * @return string The search query or empty string.
     */
    public static function get_initial_query() {
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only retrieval of search query.
        if ( ! isset( $_GET['s'] ) ) {
            return '';
        }

        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        $post_type = isset( $_GET['post_type'] ) ? sanitize_text_field( wp_unslash( $_GET['post_type'] ) ) : '';

        // Only capture product searches.
        if ( 'product' !== $post_type && ! is_shop() && ! is_product_category() && ! is_product_tag() ) {
            return '';
        }

        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        return sanitize_text_field( wp_unslash( $_GET['s'] ) );
    }
}
