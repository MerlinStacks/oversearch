<?php
/**
 * Multilingual Support (WPML/Polylang).
 *
 * @package OverSeek_Search
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Overseek_Multilingual_Support
 *
 * Adds WPML and Polylang compatibility to OverSeek Search.
 */
class Overseek_Multilingual_Support {


	/**
	 * Initialize multilingual support.
	 */
	public static function init() {
		add_filter( 'overseek_search_query_filters', array( __CLASS__, 'add_language_filter' ) );
		add_filter( 'overseek_index_product_data', array( __CLASS__, 'add_language_to_index' ) );
	}

	/**
	 * Get the current language code.
	 *
	 * @return string|null Language code (e.g., 'en', 'de') or null if not multilingual.
	 */
	public static function get_current_language() {
		// WPML support.
		if ( defined( 'ICL_LANGUAGE_CODE' ) ) {
			return ICL_LANGUAGE_CODE;
		}

		// WPML via filter (preferred method).
		$wpml_lang = apply_filters( 'wpml_current_language', null );
		if ( $wpml_lang ) {
			return $wpml_lang;
		}

		// Polylang support.
		if ( function_exists( 'pll_current_language' ) ) {
			return pll_current_language();
		}

		return null;
	}

	/**
	 * Get language for a specific product.
	 *
	 * @param int $product_id The product ID.
	 * @return string|null Language code or null.
	 */
	public static function get_product_language( $product_id ) {
		// WPML.
		$wpml_lang = apply_filters(
			'wpml_element_language_code',
			null,
			array(
				'element_id'   => $product_id,
				'element_type' => 'post_product',
			)
		);

		if ( $wpml_lang ) {
			return $wpml_lang;
		}

		// Polylang.
		if ( function_exists( 'pll_get_post_language' ) ) {
			return pll_get_post_language( $product_id );
		}

		return null;
	}

	/**
	 * Check if multilingual plugin is active.
	 *
	 * @return bool True if WPML or Polylang is active.
	 */
	public static function is_multilingual_active() {
		return defined( 'ICL_SITEPRESS_VERSION' ) || function_exists( 'pll_current_language' );
	}

	/**
	 * Add language filter to search queries.
	 *
	 * @param array $filters Current filters.
	 * @return array Modified filters.
	 */
	public static function add_language_filter( $filters ) {
		if ( ! self::is_multilingual_active() ) {
			return $filters;
		}

		$current_language = self::get_current_language();

		if ( $current_language ) {
			$filters['language'] = $current_language;
		}

		return $filters;
	}

	/**
	 * Add language to indexed product data.
	 *
	 * @param array $data Product data being indexed.
	 * @return array Modified data with language.
	 */
	public static function add_language_to_index( $data ) {
		if ( ! self::is_multilingual_active() ) {
			return $data;
		}

		$product_id = $data['product_id'] ?? 0;

		if ( $product_id ) {
			$language         = self::get_product_language( $product_id );
			$data['language'] = $language ? $language : 'default';
		}

		return $data;
	}

	/**
	 * Get translatable strings for the search interface.
	 *
	 * @return array Translatable strings.
	 */
	public static function get_i18n_strings() {
		return array(
			'placeholder'     => __( 'Search products...', 'overseek-search' ),
			'noResults'       => __( 'No products found', 'overseek-search' ),
			'viewAll'         => __( 'View all results', 'overseek-search' ),
			'recentSearches'  => __( 'Recent Searches', 'overseek-search' ),
			'popularSearches' => __( 'Popular Searches', 'overseek-search' ),
			'clearHistory'    => __( 'Clear', 'overseek-search' ),
			'didYouMean'      => __( 'Did you mean:', 'overseek-search' ),
			'voiceSearch'     => __( 'Voice Search', 'overseek-search' ),
		);
	}
}

// Initialize multilingual support.
Overseek_Multilingual_Support::init();
