<?php
/**
 * REST API Admin Controller.
 *
 * Handles admin settings, reindexing, and synonym management.
 *
 * @package OverSeek_Search
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Overseek_Search_Admin_Controller
 *
 * REST API endpoints for admin functionality.
 */
class Overseek_Search_Admin_Controller {

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
		// Settings.
		register_rest_route(
			$this->namespace,
			'/settings',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_settings' ),
					'permission_callback' => array( $this, 'admin_permission_check' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'update_settings' ),
					'permission_callback' => array( $this, 'admin_permission_check' ),
				),
			)
		);

		// Reindex.
		register_rest_route(
			$this->namespace,
			'/reindex',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'reindex' ),
				'permission_callback' => array( $this, 'admin_permission_check' ),
			)
		);

		// Index stats.
		register_rest_route(
			$this->namespace,
			'/index-stats',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_index_stats' ),
				'permission_callback' => array( $this, 'admin_permission_check' ),
			)
		);

		// Synonyms CRUD.
		register_rest_route(
			$this->namespace,
			'/synonyms',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_synonyms' ),
					'permission_callback' => array( $this, 'admin_permission_check' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'add_synonym' ),
					'permission_callback' => array( $this, 'admin_permission_check' ),
					'args'                => $this->get_synonym_args(),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/synonyms/(?P<id>\d+)',
			array(
				array(
					'methods'             => 'PUT',
					'callback'            => array( $this, 'update_synonym' ),
					'permission_callback' => array( $this, 'admin_permission_check' ),
					'args'                => $this->get_synonym_args(),
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => array( $this, 'delete_synonym' ),
					'permission_callback' => array( $this, 'admin_permission_check' ),
				),
			)
		);
	}

	/**
	 * Get shared args for synonym create/update endpoints.
	 *
	 * @return array
	 */
	private function get_synonym_args() {
		return array(
			'base_term' => array(
				'required'          => true,
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_text_field',
			),
			'synonyms'  => array(
				'required' => true,
				'type'     => 'array',
			),
			'one_way'   => array(
				'type'    => 'boolean',
				'default' => false,
			),
		);
	}

	/**
	 * Check admin permission.
	 *
	 * @return bool
	 */
	public function admin_permission_check() {
		// phpcs:ignore WordPress.WP.Capabilities.Unknown -- WooCommerce capability.
		return current_user_can( 'manage_woocommerce' );
	}

	/**
	 * Get plugin settings.
	 *
	 * @return WP_REST_Response
	 */
	public function get_settings() {
		$settings = get_option( 'overseek_search_settings', array() );

		return new WP_REST_Response(
			array(
				'settings' => $settings,
				'version'  => OVERSEEK_SEARCH_VERSION,
			),
			200
		);
	}

	/**
	 * Update plugin settings.
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return WP_REST_Response
	 */
	public function update_settings( $request ) {
		$new_settings = $request->get_json_params();

		// Validate and sanitize.
		$sanitized = array();

		$bool_fields = array( 'fuzzy_enabled', 'highlight_matches', 'track_analytics', 'voice_search' );
		foreach ( $bool_fields as $field ) {
			if ( isset( $new_settings[ $field ] ) ) {
				$sanitized[ $field ] = (bool) $new_settings[ $field ];
			}
		}

		$int_fields = array( 'fuzzy_threshold', 'results_per_page', 'title_weight', 'sku_weight', 'description_weight' );
		foreach ( $int_fields as $field ) {
			if ( isset( $new_settings[ $field ] ) ) {
				$value = absint( $new_settings[ $field ] );
				// Validate ranges.
				if ( 'fuzzy_threshold' === $field ) {
					$value = max( 1, min( 3, $value ) );
				} elseif ( 'results_per_page' === $field ) {
					$value = max( 1, min( 50, $value ) );
				} elseif ( in_array( $field, array( 'title_weight', 'sku_weight', 'description_weight' ), true ) ) {
					$value = max( 1, min( 10, $value ) );
				}
				$sanitized[ $field ] = $value;
			}
		}

		if ( isset( $new_settings['search_fields'] ) && is_array( $new_settings['search_fields'] ) ) {
			$valid_fields               = array( 'title', 'sku', 'description', 'categories', 'tags', 'attributes' );
			$sanitized['search_fields'] = array_intersect( $new_settings['search_fields'], $valid_fields );
		}

		// Merge with existing.
		$current = get_option( 'overseek_search_settings', array() );
		$merged  = array_merge( $current, $sanitized );

		update_option( 'overseek_search_settings', $merged );

		return new WP_REST_Response(
			array(
				'success'  => true,
				'settings' => $merged,
			),
			200
		);
	}

	/**
	 * Trigger full reindex.
	 *
	 * @return WP_REST_Response
	 */
	public function reindex() {
		set_time_limit( 300 ); // 5 minutes max.

		$index = new Overseek_Search_Index();
		$stats = $index->rebuild_index();

		return new WP_REST_Response(
			array(
				'success' => true,
				'stats'   => $stats,
			),
			200
		);
	}

	/**
	 * Get index statistics.
	 *
	 * @return WP_REST_Response
	 */
	public function get_index_stats() {
		$index = new Overseek_Search_Index();
		$stats = $index->get_stats();

		// Get total WooCommerce products.
		$total_products          = wp_count_posts( 'product' );
		$stats['total_products'] = (int) $total_products->publish;

		return new WP_REST_Response( $stats, 200 );
	}

	/**
	 * Get all synonyms.
	 *
	 * @return WP_REST_Response
	 */
	public function get_synonyms() {
		$manager  = new Overseek_Search_Synonym_Manager();
		$synonyms = $manager->get_all();

		return new WP_REST_Response( array( 'synonyms' => array_values( $synonyms ) ), 200 );
	}

	/**
	 * Add a synonym group.
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return WP_REST_Response
	 */
	public function add_synonym( $request ) {
		$manager = new Overseek_Search_Synonym_Manager();

		$id = $manager->add(
			$request->get_param( 'base_term' ),
			$request->get_param( 'synonyms' ),
			$request->get_param( 'one_way' )
		);

		if ( $id ) {
			return new WP_REST_Response(
				array(
					'success' => true,
					'id'      => $id,
				),
				201
			);
		}

		return new WP_REST_Response( array( 'error' => 'Failed to add synonym' ), 400 );
	}

	/**
	 * Update a synonym group.
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return WP_REST_Response
	 */
	public function update_synonym( $request ) {
		$manager = new Overseek_Search_Synonym_Manager();

		$success = $manager->update(
			$request->get_param( 'id' ),
			$request->get_param( 'base_term' ),
			$request->get_param( 'synonyms' ),
			$request->get_param( 'one_way' )
		);

		if ( $success ) {
			return new WP_REST_Response( array( 'success' => true ), 200 );
		}

		return new WP_REST_Response( array( 'error' => 'Failed to update synonym' ), 400 );
	}

	/**
	 * Delete a synonym group.
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return WP_REST_Response
	 */
	public function delete_synonym( $request ) {
		$manager = new Overseek_Search_Synonym_Manager();
		$success = $manager->delete( $request->get_param( 'id' ) );

		if ( $success ) {
			return new WP_REST_Response( array( 'success' => true ), 200 );
		}

		return new WP_REST_Response( array( 'error' => 'Failed to delete synonym' ), 400 );
	}
}
