<?php
/**
 * Boost Manager for search result merchandising.
 *
 * Allows pinning products to the top of search results for specific queries.
 *
 * @package OverSeek_Search
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Overseek_Boost_Manager
 *
 * Manages product boosting rules for search merchandising.
 */
class Overseek_Boost_Manager {


	/**
	 * Cache key for global boosts.
	 */
	const CACHE_KEY_GLOBAL = 'overseek_global_boosts';

	/**
	 * Cache TTL in seconds (5 minutes).
	 */
	const CACHE_TTL = 300;

	/**
	 * Allowed boost types.
	 */
	const ALLOWED_TYPES = array( 'pin', 'boost' );

	/**
	 * Get the boosts table name.
	 *
	 * @return string Table name.
	 */
	public static function get_table_name() {
		global $wpdb;
		return $wpdb->prefix . 'overseek_search_boosts';
	}

	/**
	 * Extract product ID from result array.
	 *
	 * @param array $result Result row.
	 * @return int Product ID.
	 */
	private function get_product_id( $result ) {
		return (int) ( $result['id'] ?? $result['product_id'] ?? 0 );
	}

	/**
	 * Get boost rules for a query.
	 *
	 * Returns products that should be boosted for this query.
	 *
	 * @param string $query The search query.
	 * @return array Array of boost rules with product_id and boost_weight.
	 */
	public function get_boosts_for_query( $query ) {
		global $wpdb;

		$cache_key = self::CACHE_KEY_GLOBAL . '_' . md5( $query );
		$cached    = get_transient( $cache_key );
		if ( false !== $cached ) {
			return $cached;
		}

		$table       = self::get_table_name();
		$query_lower = strtolower( trim( $query ) );

		// Get exact query matches and global boosts (NULL query_pattern).
		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$results = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT product_id, boost_weight, query_pattern, boost_type
                    FROM {$table}
                  WHERE (LOWER(query_pattern) = %s OR query_pattern IS NULL)
                    AND is_active = 1
                  ORDER BY boost_weight DESC",
				$query_lower
			),
			ARRAY_A
		);
		// phpcs:enable

		$results = $results ? $results : array();
		set_transient( $cache_key, $results, self::CACHE_TTL );

		return $results;
	}

	/**
	 * Get pinned product IDs for a query (products that should appear first).
	 *
	 * @param string $query The search query.
	 * @return array Array of product IDs in order of priority.
	 */
	public function get_pinned_products( $query ) {
		$boosts = $this->get_boosts_for_query( $query );

		// Filter to pinned type only and sort by weight.
		$pinned = array_filter(
			$boosts,
			function ( $boost ) {
				return 'pin' === $boost['boost_type'];
			}
		);

		usort(
			$pinned,
			function ( $a, $b ) {
				return $b['boost_weight'] - $a['boost_weight'];
			}
		);

		return array_column( $pinned, 'product_id' );
	}

	/**
	 * Get boost multipliers for products.
	 *
	 * @param string $query The search query.
	 * @return array Associative array of product_id => multiplier.
	 */
	public function get_boost_multipliers( $query ) {
		$boosts = $this->get_boosts_for_query( $query );

		$multipliers = array();
		foreach ( $boosts as $boost ) {
			if ( 'boost' === $boost['boost_type'] ) {
				$multipliers[ $boost['product_id'] ] = (float) $boost['boost_weight'];
			}
		}

		return $multipliers;
	}

	/**
	 * Add a boost rule.
	 *
	 * @param int         $product_id    The product ID to boost.
	 * @param string      $boost_type    'pin' or 'boost'.
	 * @param float       $boost_weight  Weight/priority (higher = more important).
	 * @param string|null $query_pattern Query to match (NULL for global boost).
	 * @return int|WP_Error Insert ID or error on failure.
	 */
	public function add_boost( $product_id, $boost_type = 'boost', $boost_weight = 1.5, $query_pattern = null ) {
		// Validate boost type.
		if ( ! in_array( $boost_type, self::ALLOWED_TYPES, true ) ) {
			return new WP_Error( 'invalid_boost_type', 'Boost type must be "pin" or "boost".' );
		}

		// Validate product exists.
		$product = wc_get_product( $product_id );
		if ( ! $product ) {
			return new WP_Error( 'invalid_product', 'Product does not exist.' );
		}

		// Validate weight.
		$boost_weight = max( 0.1, min( 100.0, (float) $boost_weight ) );

		global $wpdb;

		$table = self::get_table_name();

		$result = $wpdb->insert(
			$table,
			array(
				'product_id'    => $product_id,
				'boost_type'    => $boost_type,
				'boost_weight'  => $boost_weight,
				'query_pattern' => $query_pattern ? strtolower( trim( $query_pattern ) ) : null,
				'is_active'     => 1,
			),
			array( '%d', '%s', '%f', '%s', '%d' )
		);

		// Clear cache when boosts change.
		$this->clear_cache();

		return $result ? $wpdb->insert_id : new WP_Error( 'db_error', 'Failed to insert boost rule.' );
	}

	/**
	 * Remove a boost rule.
	 *
	 * @param int $boost_id The boost rule ID.
	 * @return bool True on success.
	 */
	public function remove_boost( $boost_id ) {
		global $wpdb;

		$table = self::get_table_name();

		$result = (bool) $wpdb->delete( $table, array( 'id' => $boost_id ), array( '%d' ) );

		// Clear cache when boosts change.
		$this->clear_cache();

		return $result;
	}

	/**
	 * Toggle a boost rule active/inactive.
	 *
	 * @param int  $boost_id  The boost rule ID.
	 * @param bool $is_active Whether to activate or deactivate.
	 * @return bool True on success.
	 */
	public function toggle_boost( $boost_id, $is_active ) {
		global $wpdb;

		$table = self::get_table_name();

		$result = (bool) $wpdb->update(
			$table,
			array( 'is_active' => $is_active ? 1 : 0 ),
			array( 'id' => $boost_id ),
			array( '%d' ),
			array( '%d' )
		);

		// Clear cache when boosts change.
		$this->clear_cache();

		return $result;
	}

	/**
	 * Clear boost caches.
	 */
	public function clear_cache() {
		delete_transient( self::CACHE_KEY_GLOBAL );
	}

	/**
	 * Get all boost rules.
	 *
	 * @param bool $active_only Only return active rules.
	 * @return array Array of boost rules.
	 */
	public function get_all_boosts( $active_only = false ) {
		global $wpdb;

		$table = self::get_table_name();

		$where = $active_only ? 'WHERE is_active = 1' : '';

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$results = $wpdb->get_results(
			"SELECT b.*, p.post_title as product_name
               FROM {$table} b
               LEFT JOIN {$wpdb->posts} p ON b.product_id = p.ID
               {$where}
              ORDER BY b.created_at DESC",
			ARRAY_A
		);
		// phpcs:enable

		return $results ? $results : array();
	}

	/**
	 * Apply boosts to search results.
	 *
	 * Reorders results to put pinned products first and applies multipliers.
	 *
	 * @param array  $results Original search results.
	 * @param string $query   The search query.
	 * @return array Reordered results with boosts applied.
	 */
	public function apply_boosts( $results, $query ) {
		if ( empty( $results ) ) {
			return $results;
		}

		// Single query to get all boosts (fixes #6 triple query issue).
		$boosts = $this->get_boosts_for_query( $query );

		// Separate pins and multipliers in one pass.
		$pinned_ids  = array();
		$multipliers = array();

		foreach ( $boosts as $boost ) {
			$pid = (int) $boost['product_id'];
			if ( 'pin' === $boost['boost_type'] ) {
				$pinned_ids[ $pid ] = (float) $boost['boost_weight'];
			} else {
				$multipliers[ $pid ] = (float) $boost['boost_weight'];
			}
		}

		// Sort pinned by weight (highest first).
		arsort( $pinned_ids );
		$pinned_id_list = array_keys( $pinned_ids );

		// Apply multipliers to relevance scores.
		foreach ( $results as &$result ) {
			$product_id = $this->get_product_id( $result );
			if ( isset( $multipliers[ $product_id ] ) && isset( $result['relevance'] ) ) {
				$result['relevance'] *= $multipliers[ $product_id ];
			}
		}
		unset( $result );

		// Separate pinned from non-pinned.
		$pinned_results  = array();
		$regular_results = array();

		foreach ( $results as $result ) {
			$product_id = $this->get_product_id( $result );
			if ( isset( $pinned_ids[ $product_id ] ) ) {
				$pinned_results[] = $result;
			} else {
				$regular_results[] = $result;
			}
		}

		// Sort pinned by their order in pinned_id_list.
		usort(
			$pinned_results,
			function ( $a, $b ) use ( $pinned_id_list ) {
				$a_id  = $this->get_product_id( $a );
				$b_id  = $this->get_product_id( $b );
				$a_pos = array_search( $a_id, $pinned_id_list );
				$b_pos = array_search( $b_id, $pinned_id_list );
				$a_pos = ( false !== $a_pos ) ? $a_pos : PHP_INT_MAX;
				$b_pos = ( false !== $b_pos ) ? $b_pos : PHP_INT_MAX;
				return $a_pos - $b_pos;
			}
		);

		// Sort regular by relevance.
		usort(
			$regular_results,
			function ( $a, $b ) {
				$a_rel = $a['relevance'] ?? 0;
				$b_rel = $b['relevance'] ?? 0;
				return $b_rel <=> $a_rel;
			}
		);

		return array_merge( $pinned_results, $regular_results );
	}
}
