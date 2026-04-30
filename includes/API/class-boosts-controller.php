<?php
/**
 * Boosts REST API Controller.
 *
 * Handles CRUD operations for search boost rules.
 *
 * @package OverSeek_Search
 */

// Prevent direct access.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class Overseek_Boosts_Controller
 *
 * REST API controller for managing product boosts.
 */
class Overseek_Boosts_Controller
{

    /**
     * Namespace.
     *
     * @var string
     */
    protected $namespace = 'overseek-search/v1';

    /**
     * Rest base.
     *
     * @var string
     */
    protected $rest_base = 'boosts';

    /**
     * Boost manager instance.
     *
     * @var Overseek_Boost_Manager
     */
    private $boost_manager;

    /**
     * Constructor.
     */
    public function __construct()
    {
        $this->boost_manager = new Overseek_Boost_Manager();
    }

    /**
     * Register routes.
     */
    public function register_routes()
    {
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods' => WP_REST_Server::READABLE,
                    'callback' => array($this, 'get_boosts'),
                    'permission_callback' => array($this, 'check_permissions'),
                ),
                array(
                    'methods' => WP_REST_Server::CREATABLE,
                    'callback' => array($this, 'create_boost'),
                    'permission_callback' => array($this, 'check_permissions'),
                ),
            )
        );

        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/(?P<id>[\d]+)',
            array(
                array(
                    'methods' => WP_REST_Server::DELETABLE,
                    'callback' => array($this, 'delete_boost'),
                    'permission_callback' => array($this, 'check_permissions'),
                ),
            )
        );

        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/(?P<id>[\d]+)/toggle',
            array(
                array(
                    'methods' => WP_REST_Server::CREATABLE,
                    'callback' => array($this, 'toggle_boost'),
                    'permission_callback' => array($this, 'check_permissions'),
                ),
            )
        );
    }

    /**
     * Check if user has permission.
     *
     * @return bool True if has permission.
     */
    public function check_permissions()
    {
        return current_user_can('manage_woocommerce');
    }

    /**
     * Get all boost rules.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response Response object.
     */
    public function get_boosts($request)
    {
        $boosts = $this->boost_manager->get_all_boosts();

        // Enrich with product names.
        foreach ($boosts as &$boost) {
            $product = wc_get_product($boost['product_id']);
            $boost['product_name'] = $product ? $product->get_name() : 'Unknown';
        }
        unset($boost);

        return new WP_REST_Response(
            array('boosts' => $boosts),
            200
        );
    }

    /**
     * Create a new boost rule.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error Response or error.
     */
    public function create_boost($request)
    {
        $product_id = absint($request->get_param('product_id'));
        $boost_type = sanitize_text_field($request->get_param('boost_type') ?: 'pin');
        $boost_weight = floatval($request->get_param('boost_weight') ?: 1.5);
        $query_pattern = $request->get_param('query_pattern');

        if (!$product_id) {
            return new WP_Error('missing_product_id', 'Product ID is required', array('status' => 400));
        }

        // Validate product exists.
        $product = wc_get_product($product_id);
        if (!$product) {
            return new WP_Error('invalid_product', 'Product does not exist', array('status' => 400));
        }

        $result = $this->boost_manager->add_boost($product_id, $boost_type, $boost_weight, $query_pattern);

        if (is_wp_error($result)) {
            return new WP_Error($result->get_error_code(), $result->get_error_message(), array('status' => 400));
        }

        return new WP_REST_Response(
            array(
                'success' => true,
                'id' => $result,
                'message' => 'Boost rule created',
            ),
            201
        );
    }

    /**
     * Delete a boost rule.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response Response object.
     */
    public function delete_boost($request)
    {
        $id = absint($request->get_param('id'));

        $result = $this->boost_manager->remove_boost($id);

        return new WP_REST_Response(
            array(
                'success' => $result,
                'message' => $result ? 'Boost rule deleted' : 'Failed to delete',
            ),
            $result ? 200 : 400
        );
    }

    /**
     * Toggle boost active status.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response Response object.
     */
    public function toggle_boost($request)
    {
        $id = absint($request->get_param('id'));
        $is_active = (bool) $request->get_param('is_active');

        $result = $this->boost_manager->toggle_boost($id, $is_active);

        return new WP_REST_Response(
            array(
                'success' => $result,
                'message' => $result ? 'Boost status updated' : 'Failed to update',
            ),
            $result ? 200 : 400
        );
    }
}
