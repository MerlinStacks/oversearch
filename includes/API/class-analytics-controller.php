<?php
/**
 * REST API Analytics Controller.
 *
 * Handles analytics tracking and reporting.
 *
 * @package OverSeek_Search
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class Overseek_Search_Analytics_Controller
 *
 * REST API endpoints for analytics.
 */
class Overseek_Search_Analytics_Controller {

    /**
     * API namespace.
     *
     * @var string
     */
    private $namespace = 'overseek-search/v1';

    /**
     * Register REST routes.
     */
    public function register_routes() {
        // Public: Track click events.
        register_rest_route(
            $this->namespace,
            '/analytics/track',
            array(
                'methods'             => 'POST',
                'callback'            => array( $this, 'track_event' ),
                'permission_callback' => '__return_true',
                'args'                => array(
                    'event_type' => array(
                        'required'          => true,
                        'type'              => 'string',
                        'enum'              => array( 'click', 'add_to_cart', 'purchase' ),
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'product_id' => array(
                        'required'          => true,
                        'type'              => 'integer',
                        'sanitize_callback' => 'absint',
                    ),
                    'query' => array(
                        'type'              => 'string',
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'session_id' => array(
                        'type'              => 'string',
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                ),
            )
        );

        // Admin: Get analytics summary.
        register_rest_route(
            $this->namespace,
            '/analytics/summary',
            array(
                'methods'             => 'GET',
                'callback'            => array( $this, 'get_summary' ),
                'permission_callback' => array( $this, 'admin_permission_check' ),
                'args'                => array(
                    'days' => array(
                        'type'              => 'integer',
                        'default'           => 30,
                        'sanitize_callback' => 'absint',
                    ),
                ),
            )
        );

        // Admin: Get top queries.
        register_rest_route(
            $this->namespace,
            '/analytics/queries',
            array(
                'methods'             => 'GET',
                'callback'            => array( $this, 'get_top_queries' ),
                'permission_callback' => array( $this, 'admin_permission_check' ),
                'args'                => array(
                    'days' => array(
                        'type'              => 'integer',
                        'default'           => 30,
                        'sanitize_callback' => 'absint',
                    ),
                    'limit' => array(
                        'type'              => 'integer',
                        'default'           => 20,
                        'sanitize_callback' => 'absint',
                    ),
                ),
            )
        );

        // Admin: Get no-results queries.
        register_rest_route(
            $this->namespace,
            '/analytics/no-results',
            array(
                'methods'             => 'GET',
                'callback'            => array( $this, 'get_no_results' ),
                'permission_callback' => array( $this, 'admin_permission_check' ),
                'args'                => array(
                    'days' => array(
                        'type'              => 'integer',
                        'default'           => 30,
                        'sanitize_callback' => 'absint',
                    ),
                    'limit' => array(
                        'type'              => 'integer',
                        'default'           => 20,
                        'sanitize_callback' => 'absint',
                    ),
                ),
            )
        );

        // Admin: Get daily trends.
        register_rest_route(
            $this->namespace,
            '/analytics/trends',
            array(
                'methods'             => 'GET',
                'callback'            => array( $this, 'get_trends' ),
                'permission_callback' => array( $this, 'admin_permission_check' ),
                'args'                => array(
                    'days' => array(
                        'type'              => 'integer',
                        'default'           => 30,
                        'sanitize_callback' => 'absint',
                    ),
                ),
            )
        );
    }

    /**
     * Check admin permission.
     *
     * @return bool
     */
    public function admin_permission_check() {
        return current_user_can( 'manage_woocommerce' );
    }

    /**
     * Track a click/conversion event.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response
     */
    public function track_event( $request ) {
        global $wpdb;

        $settings = get_option( 'overseek_search_settings', array() );
        if ( empty( $settings['track_analytics'] ) ) {
            return new WP_REST_Response( array( 'success' => true ), 200 );
        }

        $table = Overseek_Search_Database::get_analytics_table();

        $wpdb->insert(
            $table,
            array(
                'query'              => $request->get_param( 'query' ) ?: '',
                'results_count'      => 0,
                'clicked_product_id' => $request->get_param( 'product_id' ),
                'session_id'         => $request->get_param( 'session_id' ) ?: '',
                'user_id'            => get_current_user_id() ?: null,
                'event_type'         => $request->get_param( 'event_type' ),
            ),
            array( '%s', '%d', '%d', '%s', '%d', '%s' )
        );

        return new WP_REST_Response( array( 'success' => true ), 200 );
    }

    /**
     * Get analytics summary.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response
     */
    public function get_summary( $request ) {
        global $wpdb;

        $days  = $request->get_param( 'days' );
        $table = Overseek_Search_Database::get_analytics_table();
        $date  = gmdate( 'Y-m-d', strtotime( "-{$days} days" ) );

        $stats = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT 
                    COUNT(CASE WHEN event_type = 'search' THEN 1 END) as total_searches,
                    COUNT(CASE WHEN event_type = 'click' THEN 1 END) as total_clicks,
                    COUNT(CASE WHEN event_type = 'add_to_cart' THEN 1 END) as total_add_to_cart,
                    COUNT(CASE WHEN event_type = 'purchase' THEN 1 END) as total_purchases,
                    COUNT(DISTINCT session_id) as unique_visitors,
                    AVG(CASE WHEN event_type = 'search' THEN results_count END) as avg_results
                FROM $table
                WHERE created_at >= %s",
                $date
            ),
            ARRAY_A
        );

        $ctr = $stats['total_searches'] > 0
            ? round( ( $stats['total_clicks'] / $stats['total_searches'] ) * 100, 2 )
            : 0;

        return new WP_REST_Response(
            array(
                'total_searches'    => (int) $stats['total_searches'],
                'total_clicks'      => (int) $stats['total_clicks'],
                'total_add_to_cart' => (int) $stats['total_add_to_cart'],
                'total_purchases'   => (int) $stats['total_purchases'],
                'unique_visitors'   => (int) $stats['unique_visitors'],
                'avg_results'       => round( (float) $stats['avg_results'], 1 ),
                'click_through_rate' => $ctr,
                'period_days'       => $days,
            ),
            200
        );
    }

    /**
     * Get top search queries.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response
     */
    public function get_top_queries( $request ) {
        global $wpdb;

        $days  = $request->get_param( 'days' );
        $limit = $request->get_param( 'limit' );
        $table = Overseek_Search_Database::get_analytics_table();
        $date  = gmdate( 'Y-m-d', strtotime( "-{$days} days" ) );

        $queries = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT 
                    query,
                    COUNT(*) as search_count,
                    AVG(results_count) as avg_results,
                    SUM(CASE WHEN clicked_product_id IS NOT NULL THEN 1 ELSE 0 END) as clicks
                FROM $table
                WHERE event_type = 'search' AND query != '' AND created_at >= %s
                GROUP BY query
                ORDER BY search_count DESC
                LIMIT %d",
                $date,
                $limit
            ),
            ARRAY_A
        );

        foreach ( $queries as &$row ) {
            $row['search_count'] = (int) $row['search_count'];
            $row['avg_results']  = round( (float) $row['avg_results'], 1 );
            $row['clicks']       = (int) $row['clicks'];
            $row['ctr']          = $row['search_count'] > 0
                ? round( ( $row['clicks'] / $row['search_count'] ) * 100, 2 )
                : 0;
        }

        return new WP_REST_Response( array( 'queries' => $queries ), 200 );
    }

    /**
     * Get queries with no results.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response
     */
    public function get_no_results( $request ) {
        global $wpdb;

        $days  = $request->get_param( 'days' );
        $limit = $request->get_param( 'limit' );
        $table = Overseek_Search_Database::get_analytics_table();
        $date  = gmdate( 'Y-m-d', strtotime( "-{$days} days" ) );

        $queries = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT 
                    query,
                    COUNT(*) as search_count
                FROM $table
                WHERE event_type = 'search' AND results_count = 0 AND query != '' AND created_at >= %s
                GROUP BY query
                ORDER BY search_count DESC
                LIMIT %d",
                $date,
                $limit
            ),
            ARRAY_A
        );

        foreach ( $queries as &$row ) {
            $row['search_count'] = (int) $row['search_count'];
        }

        return new WP_REST_Response( array( 'queries' => $queries ), 200 );
    }

    /**
     * Get daily trends.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response
     */
    public function get_trends( $request ) {
        global $wpdb;

        $days  = $request->get_param( 'days' );
        $table = Overseek_Search_Database::get_analytics_table();
        $date  = gmdate( 'Y-m-d', strtotime( "-{$days} days" ) );

        $trends = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT 
                    DATE(created_at) as date,
                    COUNT(CASE WHEN event_type = 'search' THEN 1 END) as searches,
                    COUNT(CASE WHEN event_type = 'click' THEN 1 END) as clicks
                FROM $table
                WHERE created_at >= %s
                GROUP BY DATE(created_at)
                ORDER BY date ASC",
                $date
            ),
            ARRAY_A
        );

        foreach ( $trends as &$row ) {
            $row['searches'] = (int) $row['searches'];
            $row['clicks']   = (int) $row['clicks'];
        }

        return new WP_REST_Response( array( 'trends' => $trends ), 200 );
    }
}
