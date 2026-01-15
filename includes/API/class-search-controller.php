<?php
/**
 * REST API Search Controller.
 *
 * Handles public search requests.
 *
 * @package OverSeek_Search
 */

// Prevent direct access.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class Overseek_Search_Search_Controller
 *
 * REST API endpoints for search functionality.
 */
class Overseek_Search_Search_Controller
{

    /**
     * API namespace.
     *
     * @var string
     */
    private $namespace = 'overseek-search/v1';

    /**
     * Register REST routes.
     */
    public function register_routes()
    {
        register_rest_route(
            $this->namespace,
            '/search',
            array(
                'methods' => 'GET',
                'callback' => array($this, 'search'),
                'permission_callback' => '__return_true', // Public endpoint.
                'args' => array(
                    'q' => array(
                        'required' => true,
                        'type' => 'string',
                        'sanitize_callback' => 'sanitize_text_field',
                        'description' => 'The search query.',
                    ),
                    'category' => array(
                        'type' => 'string',
                        'sanitize_callback' => 'sanitize_text_field',
                        'description' => 'Filter by category name.',
                    ),
                    'price_min' => array(
                        'type' => 'number',
                        'sanitize_callback' => 'floatval',
                        'description' => 'Minimum price filter.',
                    ),
                    'price_max' => array(
                        'type' => 'number',
                        'sanitize_callback' => 'floatval',
                        'description' => 'Maximum price filter.',
                    ),
                    'stock_status' => array(
                        'type' => 'string',
                        'sanitize_callback' => 'sanitize_text_field',
                        'enum' => array('instock', 'outofstock', 'onbackorder'),
                        'description' => 'Filter by stock status.',
                    ),
                    'page' => array(
                        'type' => 'integer',
                        'default' => 1,
                        'sanitize_callback' => 'absint',
                        'description' => 'Page number.',
                    ),
                    'per_page' => array(
                        'type' => 'integer',
                        'default' => 8,
                        'sanitize_callback' => 'absint',
                        'minimum' => 1,
                        'maximum' => 50,
                        'description' => 'Results per page.',
                    ),
                ),
            )
        );

        register_rest_route(
            $this->namespace,
            '/suggest',
            array(
                'methods' => 'GET',
                'callback' => array($this, 'suggest'),
                'permission_callback' => '__return_true',
                'args' => array(
                    'q' => array(
                        'required' => true,
                        'type' => 'string',
                        'sanitize_callback' => 'sanitize_text_field',
                        'description' => 'The query to get suggestions for.',
                    ),
                    'limit' => array(
                        'type' => 'integer',
                        'default' => 5,
                        'sanitize_callback' => 'absint',
                        'description' => 'Number of suggestions.',
                    ),
                ),
            )
        );

        register_rest_route(
            $this->namespace,
            '/popular',
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_popular_searches'),
                'permission_callback' => '__return_true',
                'args' => array(
                    'limit' => array(
                        'type' => 'integer',
                        'default' => 5,
                        'sanitize_callback' => 'absint',
                        'description' => 'Number of popular searches to return.',
                    ),
                ),
            )
        );
    }

    /**
     * Handle search request.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response
     */
    public function search($request)
    {
        try {
            $query = $request->get_param('q');
            $filters = array(
                'category' => $request->get_param('category'),
                'price_min' => $request->get_param('price_min'),
                'price_max' => $request->get_param('price_max'),
                'stock_status' => $request->get_param('stock_status'),
            );
            $page = $request->get_param('page');
            $per_page = $request->get_param('per_page');

            // Rate limiting via transients (10 searches per minute per IP).
            $ip_hash = md5($this->get_client_ip());
            $rate_key = 'overseek_rate_' . $ip_hash;
            $rate_count = (int) get_transient($rate_key);

            if ($rate_count >= 60) {
                return new WP_REST_Response(
                    array('error' => 'Rate limit exceeded. Please try again later.'),
                    429
                );
            }

            set_transient($rate_key, $rate_count + 1, MINUTE_IN_SECONDS);

            // Execute search.
            $engine = new Overseek_Search_Engine();
            $results = $engine->search($query, array_filter($filters), $page, $per_page);

            // Check for spelling suggestion if few or no results.
            $did_you_mean = null;
            if ($results['total'] <= 3) {
                $spell_checker = new Overseek_Spell_Checker();
                $suggestion = $spell_checker->get_suggestion($query);

                // Fallback to index-based suggestion if analytics has nothing.
                if (!$suggestion && $results['total'] === 0) {
                    $suggestion = $spell_checker->suggest_from_index($query);
                }

                if ($suggestion) {
                    $did_you_mean = $suggestion;
                }
            }

            // Add did_you_mean to results.
            $results['did_you_mean'] = $did_you_mean;

            // Track analytics if enabled.
            $settings = get_option('overseek_search_settings', array());
            if (!empty($settings['track_analytics'])) {
                $this->track_search($query, $results['total'], $filters);
            }

            return new WP_REST_Response($results, 200);
        } catch (\Exception $e) {
            // Log full error details server-side.
            error_log('OverSeek Search Error: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());

            // Only expose details in debug mode.
            $error_response = array(
                'error' => defined('WP_DEBUG') && WP_DEBUG ? $e->getMessage() : __('An error occurred while searching.', 'overseek-search'),
                'results' => array(),
                'total' => 0,
            );

            return new WP_REST_Response($error_response, 500);
        } catch (\Error $e) {
            // Log full error details server-side.
            error_log('OverSeek Search Fatal: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());

            // Only expose details in debug mode.
            $error_response = array(
                'error' => defined('WP_DEBUG') && WP_DEBUG ? $e->getMessage() : __('An error occurred while searching.', 'overseek-search'),
                'results' => array(),
                'total' => 0,
            );

            return new WP_REST_Response($error_response, 500);
        }
    }

    /**
     * Handle suggestion request (autocomplete).
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response
     */
    public function suggest($request)
    {
        global $wpdb;

        $query = $request->get_param('q');
        $limit = min($request->get_param('limit'), 10);

        if (strlen($query) < 2) {
            return new WP_REST_Response(array('suggestions' => array()), 200);
        }

        $table = Overseek_Search_Database::get_index_table();

        // Get title suggestions.
        $suggestions = $wpdb->get_col(
            $wpdb->prepare(
                "SELECT DISTINCT title FROM $table 
                WHERE title LIKE %s 
                ORDER BY title ASC 
                LIMIT %d",
                $wpdb->esc_like($query) . '%',
                $limit
            )
        );

        return new WP_REST_Response(array('suggestions' => $suggestions), 200);
    }

    /**
     * Get popular search queries from analytics.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response
     */
    public function get_popular_searches($request)
    {
        global $wpdb;

        $limit = min($request->get_param('limit'), 10);
        $table = Overseek_Search_Database::get_analytics_table();

        // Get most common search queries from the last 30 days.
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $popular = $wpdb->get_col(
            $wpdb->prepare(
                "SELECT query 
                FROM $table 
                WHERE event_type = 'search' 
                AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                AND results_count > 0
                GROUP BY query 
                ORDER BY COUNT(*) DESC 
                LIMIT %d",
                $limit
            )
        );

        return new WP_REST_Response(array('popular' => $popular ?: array()), 200);
    }

    /**
     * Track search query for analytics.
     *
     * @param string $query        The search query.
     * @param int    $results_count Number of results.
     * @param array  $filters      Applied filters.
     */
    private function track_search($query, $results_count, $filters)
    {
        global $wpdb;

        $table = Overseek_Search_Database::get_analytics_table();

        $wpdb->insert(
            $table,
            array(
                'query' => substr($query, 0, 255),
                'results_count' => $results_count,
                'session_id' => $this->get_session_id(),
                'user_id' => get_current_user_id() ?: null,
                'filters_json' => wp_json_encode(array_filter($filters)),
                'event_type' => 'search',
            ),
            array('%s', '%d', '%s', '%d', '%s', '%s')
        );
    }

    /**
     * Get session ID from cookie or generate one.
     *
     * @return string Session ID.
     */
    private function get_session_id()
    {
        if (isset($_COOKIE['overseek_sid'])) {
            return sanitize_text_field(wp_unslash($_COOKIE['overseek_sid']));
        }
        return md5($this->get_client_ip() . time());
    }

    /**
     * Get client IP address.
     * 
     * Only trusts proxy headers when explicitly configured to prevent IP spoofing.
     *
     * @return string IP address.
     */
    private function get_client_ip()
    {
        $settings = get_option('overseek_search_settings', array());
        $trust_proxy = !empty($settings['trust_proxy_headers']);

        $ip = '';

        // Only check proxy headers if explicitly trusted (site behind load balancer/CDN).
        if ($trust_proxy) {
            if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
                // Take the first IP in the chain (original client).
                $forwarded = sanitize_text_field(wp_unslash($_SERVER['HTTP_X_FORWARDED_FOR']));
                $ips = explode(',', $forwarded);
                $ip = trim($ips[0]);
            } elseif (!empty($_SERVER['HTTP_CLIENT_IP'])) {
                $ip = sanitize_text_field(wp_unslash($_SERVER['HTTP_CLIENT_IP']));
            }
        }

        // Fallback to REMOTE_ADDR (always available and not spoofable).
        if (empty($ip) && !empty($_SERVER['REMOTE_ADDR'])) {
            $ip = sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR']));
        }

        return $ip;
    }
}
