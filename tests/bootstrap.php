<?php
/**
 * PHPUnit bootstrap file.
 *
 * @package OverSeek_Search
 */

// PHPUnit polyfills.
require_once dirname(__DIR__) . '/vendor/yoast/phpunit-polyfills/phpunitpolyfills-autoload.php';

// Define constants.
define('OVERSEEK_SEARCH_VERSION', '1.0.0');
define('OVERSEEK_SEARCH_PLUGIN_DIR', dirname(__DIR__) . '/');
define('OVERSEEK_SEARCH_PLUGIN_URL', 'https://example.com/wp-content/plugins/overseek-search/');
define('OVERSEEK_SEARCH_PLUGIN_BASENAME', 'overseek-search/overseek-search.php');

if (!defined('OBJECT')) {
    define('OBJECT', 'OBJECT');
}

if (!class_exists('WP_Error')) {
    class WP_Error {
        private $code;
        private $message;
        private $data;

        public function __construct($code = '', $message = '', $data = '') {
            $this->code = $code;
            $this->message = $message;
            $this->data = $data;
        }

        public function get_error_code() {
            return $this->code;
        }

        public function get_error_message() {
            return $this->message;
        }
    }
}

// WordPress stubs.
if (!function_exists('add_action')) {
    function add_action($hook, $callback, $priority = 10, $accepted_args = 1) {}
}
if (!function_exists('add_filter')) {
    function add_filter($hook, $callback, $priority = 10, $accepted_args = 1) {}
}
if (!function_exists('do_action')) {
    function do_action($hook, ...$args) {}
}
if (!function_exists('apply_filters')) {
    function apply_filters($tag, $value, ...$args) { return $value; }
}
if (!function_exists('get_option')) {
    function get_option($option, $default = false) { return $default; }
}
if (!function_exists('update_option')) {
    function update_option($option, $value, $autoload = null) { return true; }
}
if (!function_exists('get_transient')) {
    function get_transient($transient) { return false; }
}
if (!function_exists('set_transient')) {
    function set_transient($transient, $value, $expiration = 0) { return true; }
}
if (!function_exists('delete_transient')) {
    function delete_transient($transient) { return true; }
}
if (!function_exists('wp_cache_flush_group')) {
    function wp_cache_flush_group() {}
}
if (!function_exists('sanitize_text_field')) {
    function sanitize_text_field($str) { return htmlspecialchars(strip_tags((string)$str), ENT_QUOTES, 'UTF-8'); }
}
if (!function_exists('wp_strip_all_tags')) {
    function wp_strip_all_tags($string, $remove_breaks = false) { return strip_tags($string); }
}
if (!function_exists('wp_json_encode')) {
    function wp_json_encode($data, $options = 0, $depth = 512) { return json_encode($data, $options, $depth); }
}
if (!function_exists('get_permalink')) {
    function get_permalink($post = 0, $leavename = false) { return 'https://example.com/product/' . $post; }
}
if (!function_exists('wp_trim_words')) {
    function wp_trim_words($text, $num_words = 55, $more = null) { return $text; }
}
if (!function_exists('wc_get_product')) {
    function wc_get_product($product_id) { return false; }
}

// WordPress DB stub.
if (!class_exists('WPDB')) {
    class WPDB {
        public $prefix = 'wp_';
        public $options = 'wp_options';

        public function prepare($query, ...$args) { return $query; }
        public function get_results($query, $output = OBJECT) { return array(); }
        public function get_var($query, $x = 0, $y = 0) { return 0; }
        public function query($query) { return true; }
        public function get_col($query, $x = 0) { return array(); }
    }
}

// Load plugin classes.
require_once OVERSEEK_SEARCH_PLUGIN_DIR . 'includes/Search/class-fuzzy-matcher.php';
require_once OVERSEEK_SEARCH_PLUGIN_DIR . 'includes/Search/class-boost-manager.php';
require_once OVERSEEK_SEARCH_PLUGIN_DIR . 'includes/Search/class-search-engine.php';
