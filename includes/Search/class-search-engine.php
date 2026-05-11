<?php
/**
 * Core search engine.
 *
 * Executes search queries against the FULLTEXT index.
 *
 * @package OverSeek_Search
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Overseek_Search_Engine
 *
 * Performs search queries with weighted ranking.
 */
class Overseek_Search_Engine {


	/**
	 * Cache TTL in seconds (5 minutes).
	 */
	const CACHE_TTL = 300;

	/**
	 * Cache key prefix.
	 */
	const CACHE_PREFIX = 'overseek_search_';

	/**
	 * Fuzzy matcher instance.
	 *
	 * @var Overseek_Search_Fuzzy_Matcher
	 */
	private $fuzzy_matcher;

	/**
	 * Synonym manager instance.
	 *
	 * @var Overseek_Search_Synonym_Manager
	 */
	private $synonym_manager;

	/**
	 * Plugin settings.
	 *
	 * @var array
	 */
	private $settings;

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->fuzzy_matcher   = new Overseek_Search_Fuzzy_Matcher();
		$this->synonym_manager = new Overseek_Search_Synonym_Manager();
		$this->settings        = get_option( 'overseek_search_settings', array() );
	}

	/**
	 * Execute a search query.
	 *
	 * @param string $query   The search query.
	 * @param array  $filters Optional filters (category, price_min, price_max, stock_status).
	 * @param int    $page    Page number (1-indexed).
	 * @param int    $limit   Results per page.
	 * @return array Search results with pagination info.
	 */
	public function search( $query, $filters = array(), $page = 1, $limit = 8 ) {
		global $wpdb;

		$query = sanitize_text_field( $query );

		if ( empty( $query ) ) {
			return $this->empty_response();
		}

		// Ensure limit is at least 1 to prevent division by zero.
		$limit = max( 1, (int) $limit );

		$cache_key      = $this->get_cache_key( $query, $filters, $page, $limit );
		$cache_enabled  = $this->is_cache_enabled_for_request( $query, $filters );
		$cached_results = $cache_enabled ? get_transient( $cache_key ) : false;

		if ( false !== $cached_results ) {
			return $cached_results;
		}

		// Apply filters hook for multilingual support (WPML/Polylang).
		$filters = apply_filters( 'overseek_search_query_filters', $filters );

		// Expand query with synonyms.
		$expanded_query = $this->synonym_manager->expand_query( $query );

		// Build the FULLTEXT search query.
		$table  = Overseek_Search_Database::get_index_table();
		$offset = ( max( 1, $page ) - 1 ) * $limit;

		// Prepare MATCH AGAINST with boolean mode for better control.
		$search_terms = $this->prepare_search_terms( $expanded_query );

		// Build WHERE clauses for filters.
		$where_clauses = array();
		$where_values  = array();

		if ( ! empty( $filters['category'] ) ) {
			$where_clauses[] = 'categories LIKE %s';
			$where_values[]  = '%' . $wpdb->esc_like( sanitize_text_field( $filters['category'] ) ) . '%';
		}

		if ( isset( $filters['price_min'] ) && is_numeric( $filters['price_min'] ) ) {
			$where_clauses[] = 'price >= %f';
			$where_values[]  = floatval( $filters['price_min'] );
		}

		if ( isset( $filters['price_max'] ) && is_numeric( $filters['price_max'] ) ) {
			$where_clauses[] = 'price <= %f';
			$where_values[]  = floatval( $filters['price_max'] );
		}

		if ( ! empty( $filters['stock_status'] ) ) {
			$where_clauses[] = 'stock_status = %s';
			$where_values[]  = sanitize_text_field( $filters['stock_status'] );
		}

		$where_clauses[] = "catalog_visibility IN ('visible', 'catalog')";

		// Language filter for WPML/Polylang multilingual support.
		if ( ! empty( $filters['language'] ) ) {
			$where_clauses[] = 'language = %s';
			$where_values[]  = sanitize_text_field( $filters['language'] );
		}

		$where_sql = '';
		if ( ! empty( $where_clauses ) ) {
			$where_sql = 'AND ' . implode( ' AND ', $where_clauses );
		}

		// Get field weights from settings.
		$title_weight = isset( $this->settings['title_weight'] ) ? (float) $this->settings['title_weight'] : 3;
		$sku_weight   = isset( $this->settings['sku_weight'] ) ? (float) $this->settings['sku_weight'] : 2;

		// Build the main search query with weighted scoring.
		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$sql = $wpdb->prepare( // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber -- Dynamic placeholder list assembled safely.
			"SELECT 
                product_id,
                title,
                sku,
                short_description,
                categories,
                brands,
                price,
                sale_price,
                stock_status,
                image_url,
                (
                    MATCH(title) AGAINST(%s IN BOOLEAN MODE) * %f +
                    MATCH(sku) AGAINST(%s IN BOOLEAN MODE) * %f +
                    MATCH(search_content) AGAINST(%s IN BOOLEAN MODE)
                ) AS relevance_score
            FROM $table
            WHERE MATCH(title, sku, search_content) AGAINST(%s IN BOOLEAN MODE)
            $where_sql
            ORDER BY relevance_score DESC
            LIMIT %d OFFSET %d",
			array_merge(
				array( $search_terms, $title_weight, $search_terms, $sku_weight, $search_terms, $search_terms ),
				$where_values,
				array( $limit, $offset )
			)
		);
		// phpcs:enable

		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- $sql is prepared above
		$results = $wpdb->get_results( $sql, ARRAY_A );

		// If no results and fuzzy is enabled, try fuzzy matching.
		if ( empty( $results ) && ! empty( $this->settings['fuzzy_enabled'] ) ) {
			$results = $this->fuzzy_search( $query, $filters, $limit, $offset );
		}

		// Get total count for pagination.
		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$count_sql = $wpdb->prepare( // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- $count_sql is prepared above
			"SELECT COUNT(*) FROM $table
            WHERE MATCH(title, sku, search_content) AGAINST(%s IN BOOLEAN MODE)
            $where_sql",
			array_merge( array( $search_terms ), $where_values )
		);
		// phpcs:enable

		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- $count_sql is prepared above
		$total_count = (int) $wpdb->get_var( $count_sql );

		// Get facets (category counts).
		$facets = $this->get_facets( $search_terms );

		// Apply boosts/pins from merchandising rules.
		$boost_manager   = new Overseek_Boost_Manager();
		$boosted_results = $boost_manager->apply_boosts( $results, $query );

		$response = array(
			'results'     => $this->format_results( $boosted_results, $query ),
			'total'       => $total_count,
			'page'        => $page,
			'per_page'    => $limit,
			'total_pages' => ceil( $total_count / $limit ),
			'facets'      => $facets,
			'query'       => $query,
			'expanded'    => $expanded_query !== $query ? $expanded_query : null,
		);

		if ( $cache_enabled ) {
			set_transient( $cache_key, $response, self::CACHE_TTL );
		}

		return $response;
	}

	/**
	 * Prepare search terms for BOOLEAN MODE.
	 *
	 * @param string $query The search query.
	 * @return string Prepared search terms.
	 */
	private function prepare_search_terms( $query ) {
		// Split into words and add wildcards for partial matching.
		$words = preg_split( '/\s+/', trim( $query ) );
		$terms = array();

		foreach ( $words as $word ) {
			$word = preg_replace( '/[^\w\-]/', '', $word );
			if ( strlen( $word ) >= 2 ) {
				// Add wildcard for partial matching.
				$terms[] = '+' . $word . '*';
			}
		}

		// If no valid terms, return a dummy search that won't match anything.
		if ( empty( $terms ) ) {
			return '"___no_match___"';
		}

		// If no valid terms, return a dummy search that won't match anything.
		if ( empty( $terms ) ) {
			return '"___no_match___"';
		}

		return implode( ' ', $terms );
	}

	/**
	 * Perform fuzzy search as fallback.
	 *
	 * @param string $query   Original query.
	 * @param array  $filters Filters.
	 * @param int    $limit   Result limit.
	 * @param int    $offset  Offset.
	 * @return array Results.
	 */
	private function fuzzy_search( $query, $filters, $limit, $offset ) {
		global $wpdb;

		$table     = Overseek_Search_Database::get_index_table();
		$threshold = isset( $this->settings['fuzzy_threshold'] ) ? (int) $this->settings['fuzzy_threshold'] : 2;

		// Get all indexed titles for fuzzy matching.
		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$candidates = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT DISTINCT title FROM {$table} LIMIT %d",
				1000
			),
			ARRAY_A
		);
		// phpcs:enable

		// Find fuzzy matches.
		$matched_titles = $this->fuzzy_matcher->find_matches( $query, array_column( $candidates, 'title' ), $threshold );

		if ( empty( $matched_titles ) ) {
			return array();
		}

		// Build query with matched titles.
		$placeholders = implode( ', ', array_fill( 0, count( $matched_titles ), '%s' ) );

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$sql = $wpdb->prepare( // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber -- Dynamic placeholder list assembled safely.
			"SELECT product_id, title, sku, short_description, categories, brands, price, sale_price, stock_status, image_url, 1 AS relevance_score
            FROM $table
            WHERE title IN ($placeholders)
            LIMIT %d OFFSET %d",
			array_merge( $matched_titles, array( $limit, $offset ) )
		);
		// phpcs:enable

		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- $sql is prepared above
		return $wpdb->get_results( $sql, ARRAY_A );
	}

	/**
	 * Get facet counts for filtering.
	 *
	 * @param string $search_terms The search terms.
	 * @return array Facets with counts.
	 */
	private function get_facets( $search_terms ) {
		global $wpdb;

		$table = Overseek_Search_Database::get_index_table();

		// Get category facets.
		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$category_sql = $wpdb->prepare( // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- $category_sql is prepared above
			"SELECT categories, COUNT(*) as count 
            FROM $table
            WHERE MATCH(title, sku, search_content) AGAINST(%s IN BOOLEAN MODE)
            AND categories != ''
            GROUP BY categories
            ORDER BY count DESC
            LIMIT 20",
			$search_terms
		);
		// phpcs:enable

		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- $category_sql is prepared above
		$category_results = $wpdb->get_results( $category_sql, ARRAY_A );

		// Parse categories (they may be comma-separated).
		$category_counts = array();
		foreach ( $category_results as $row ) {
			$cats = explode( ', ', $row['categories'] );
			foreach ( $cats as $cat ) {
				$cat = trim( $cat );
				if ( $cat ) {
					if ( ! isset( $category_counts[ $cat ] ) ) {
						$category_counts[ $cat ] = 0;
					}
					$category_counts[ $cat ] += (int) $row['count'];
				}
			}
		}
		arsort( $category_counts );

		// Get price range.
		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$price_sql = $wpdb->prepare( // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- $price_sql is prepared above
			"SELECT MIN(price) as min_price, MAX(price) as max_price 
            FROM $table
            WHERE MATCH(title, sku, search_content) AGAINST(%s IN BOOLEAN MODE)",
			$search_terms
		);
		// phpcs:enable

		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- $price_sql is prepared above
		$price_range = $wpdb->get_row( $price_sql, ARRAY_A );

		return array(
			'categories'  => array_slice( $category_counts, 0, 10, true ),
			'price_range' => array(
				'min' => floatval( $price_range['min_price'] ?? 0 ),
				'max' => floatval( $price_range['max_price'] ?? 0 ),
			),
		);
	}

	/**
	 * Format results for JSON response.
	 *
	 * @param array  $results Raw results.
	 * @param string $query   Original query for highlighting.
	 * @return array Formatted results.
	 */
	private function format_results( $results, $query ) {
		$formatted = array();
		$highlight = ! empty( $this->settings['highlight_matches'] );

		foreach ( $results as $row ) {
			$product_id = isset( $row['product_id'] ) ? (int) $row['product_id'] : 0;
			$title      = $row['title'];

			if ( $highlight ) {
				$title = $this->highlight_matches( $title, $query );
			}

			$permalink = $product_id > 0 ? get_permalink( $product_id ) : '';

			$image_url = ! empty( $row['image_url'] ) ? $row['image_url'] : '';
			if ( empty( $image_url ) && $product_id > 0 ) {
				$thumbnail_id = get_post_thumbnail_id( $product_id );
				if ( $thumbnail_id ) {
					$image_url = wp_get_attachment_image_url( $thumbnail_id, 'woocommerce_thumbnail' );
				}
			}

			$price      = isset( $row['price'] ) ? (float) $row['price'] : 0.0;
			$sale_price = ! empty( $row['sale_price'] ) ? (float) $row['sale_price'] : null;
			if ( $product_id > 0 && ( $price <= 0 || ( null === $sale_price && isset( $row['sale_price'] ) ) ) && function_exists( 'wc_get_product' ) ) {
				$product = wc_get_product( $product_id );
				if ( $product ) {
					$product_price = $product->get_price();
					if ( '' !== $product_price && null !== $product_price ) {
						$price = (float) $product_price;
					}
					$product_sale_price = $product->get_sale_price();
					if ( '' !== $product_sale_price && null !== $product_sale_price ) {
						$sale_price = (float) $product_sale_price;
					}
				}
			}

			$result_url = $permalink ? $permalink : '';
			if ( $product_id > 0 ) {
				$variation_url = $this->resolve_variation_url_for_query( $product_id, $query );
				if ( $variation_url ) {
					$result_url = $variation_url;
				}
			}

			$formatted[] = array(
				'id'                => $product_id,
				'title'             => $title,
				'title_raw'         => $row['title'],
				'sku'               => $row['sku'],
				'short_description' => wp_trim_words( $row['short_description'], 15, '...' ),
				'categories'        => $row['categories'],
				'brands'            => $row['brands'] ?? '',
				'price'             => $price,
				'sale_price'        => $sale_price,
				'stock_status'      => $row['stock_status'],
				'image_url'         => $image_url,
				'url'               => $result_url,
				'score'             => isset( $row['relevance_score'] ) ? (float) $row['relevance_score'] : 0,
			);
		}

		return $formatted;
	}

	/**
	 * Highlight matching terms in text.
	 *
	 * @param string $text  The text to highlight.
	 * @param string $query The search query.
	 * @return string Text with <mark> tags.
	 */
	private function highlight_matches( $text, $query ) {
		$text  = wp_strip_all_tags( $text );
		$words = preg_split( '/\s+/', $query );

		foreach ( $words as $word ) {
			if ( strlen( $word ) >= 2 ) {
				$pattern = '/(' . preg_quote( $word, '/' ) . ')/i';
				$text    = preg_replace( $pattern, '<mark>$1</mark>', $text );
			}
		}

		return $text;
	}

	/**
	 * Generate a cache key for a search query.
	 *
	 * @param string $query   The search query.
	 * @param array  $filters Applied filters.
	 * @param int    $page    Page number.
	 * @param int    $limit   Results per page.
	 * @return string Cache key.
	 */
	private function get_cache_key( $query, $filters, $page, $limit ) {
		$key_data = array(
			'q' => strtolower( trim( $query ) ),
			'f' => array_filter( $filters ),
			'p' => $page,
			'l' => $limit,
			'x' => $this->get_cache_context_key(),
		);

		return self::CACHE_PREFIX . md5( wp_json_encode( $key_data ) );
	}

	/**
	 * Clear all search caches.
	 *
	 * Call this when products are updated to ensure fresh results.
	 *
	 * @return void
	 */
	public static function clear_cache() {
		global $wpdb;

		// Delete all transients with our prefix.
		$wpdb->query(
			$wpdb->prepare(
				"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s",
				'_transient_' . self::CACHE_PREFIX . '%'
			)
		);
		$wpdb->query(
			$wpdb->prepare(
				"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s",
				'_transient_timeout_' . self::CACHE_PREFIX . '%'
			)
		);
	}

	/**
	 * Return empty response structure.
	 *
	 * @return array Empty response.
	 */
	private function empty_response() {
		return array(
			'results'     => array(),
			'total'       => 0,
			'page'        => 1,
			'per_page'    => 8,
			'total_pages' => 0,
			'facets'      => array(),
			'query'       => '',
		);
	}

	/**
	 * Determine if caching is safe for current request context.
	 *
	 * @param string $query Search query.
	 * @param array  $filters Search filters.
	 * @return bool
	 */
	private function is_cache_enabled_for_request( $query, $filters ) {
		$enabled = ! is_user_logged_in();

		return (bool) apply_filters( 'overseek_search_enable_cache', $enabled, $query, $filters );
	}

	/**
	 * Build a cache context key to avoid sharing contextual prices.
	 *
	 * @return array
	 */
	private function get_cache_context_key() {
		$context = array(
			'currency' => function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : '',
			'lang'     => function_exists( 'get_locale' ) ? get_locale() : '',
			'logged'   => is_user_logged_in() ? 1 : 0,
		);

		if ( is_user_logged_in() ) {
			$user = wp_get_current_user();
			if ( $user instanceof WP_User ) {
				$context['roles'] = implode( ',', (array) $user->roles );
			}
		}

		return (array) apply_filters( 'overseek_search_cache_context', $context );
	}

	/**
	 * Resolve a variation URL for exact SKU-like searches.
	 *
	 * @param int    $product_id Parent product ID.
	 * @param string $query Search query.
	 * @return string
	 */
	private function resolve_variation_url_for_query( $product_id, $query ) {
		$query = strtoupper( trim( (string) $query ) );
		if ( '' === $query || ! function_exists( 'wc_get_product' ) ) {
			return '';
		}

		$product = wc_get_product( $product_id );
		if ( ! $product || ! $product->is_type( 'variable' ) ) {
			return '';
		}

		$children = $product->get_children();
		foreach ( $children as $variation_id ) {
			$variation = wc_get_product( $variation_id );
			if ( ! $variation ) {
				continue;
			}

			$sku = strtoupper( (string) $variation->get_sku() );
			if ( '' !== $sku && $query === $sku ) {
				$url = get_permalink( $variation_id );
				return $url ? $url : '';
			}
		}

		return '';
	}
}
