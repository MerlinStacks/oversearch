<?php
/**
 * Spell Checker for search queries.
 *
 * Provides "Did you mean?" suggestions by comparing against successful queries.
 *
 * @package OverSeek_Search
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Overseek_Spell_Checker
 *
 * Finds spelling corrections using Levenshtein distance against known good queries.
 */
class Overseek_Spell_Checker {


	/**
	 * Cache key for successful queries.
	 */
	const CACHE_KEY_QUERIES = 'overseek_spellcheck_queries';

	/**
	 * Cache key for indexed terms.
	 */
	const CACHE_KEY_TERMS = 'overseek_spellcheck_terms';

	/**
	 * Cache TTL in seconds (1 hour).
	 */
	const CACHE_TTL = 3600;

	/**
	 * Maximum Levenshtein distance for a suggestion.
	 *
	 * @var int
	 */
	private $max_distance = 2;

	/**
	 * Minimum query length to check.
	 *
	 * @var int
	 */
	private $min_length = 3;

	/**
	 * Get a spelling suggestion for a query.
	 *
	 * @param string $query The original search query.
	 * @return string|null Suggested query or null if no suggestion.
	 */
	public function get_suggestion( $query ) {
		$query = strtolower( trim( $query ) );

		// Skip short queries.
		if ( strlen( $query ) < $this->min_length ) {
			return null;
		}

		// Get successful queries from analytics.
		$candidates = $this->get_successful_queries();

		if ( empty( $candidates ) ) {
			return null;
		}

		$best_match    = null;
		$best_distance = PHP_INT_MAX;
		$best_count    = 0;

		foreach ( $candidates as $candidate ) {
			$candidate_lower = strtolower( $candidate['query'] );

			// Skip if it's the same query.
			if ( $candidate_lower === $query ) {
				return null;
			}

			// Calculate Levenshtein distance.
			$distance = levenshtein( $query, $candidate_lower );

			// Only consider if within max distance.
			if ( $distance <= $this->max_distance ) {
				// Prefer shorter distance, then higher count.
				if (
					$distance < $best_distance ||
					( $distance === $best_distance && $candidate['count'] > $best_count )
				) {
					$best_match    = $candidate['query'];
					$best_distance = $distance;
					$best_count    = $candidate['count'];
				}
			}
		}

		return $best_match;
	}

	/**
	 * Get queries that returned results from analytics.
	 *
	 * @param int $limit Maximum candidates to fetch.
	 * @return array Array of [ 'query' => string, 'count' => int ].
	 */
	private function get_successful_queries( $limit = 100 ) {
		// Check cache first.
		$cached = get_transient( self::CACHE_KEY_QUERIES );
		if ( false !== $cached ) {
			return $cached;
		}

		global $wpdb;

		$table = Overseek_Search_Database::get_analytics_table();

		// Get queries that had results, ordered by frequency.
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$results = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT query, COUNT(*) as count 
                   FROM {$table}
                  WHERE results_count > 0 
                    AND event_type = 'search'
                    AND CHAR_LENGTH(query) >= %d
                  GROUP BY query 
                  ORDER BY count DESC 
                  LIMIT %d",
				$this->min_length,
				$limit
			),
			ARRAY_A
		);
		// phpcs:enable

		$results = $results ? $results : array();

		// Cache for 1 hour.
		set_transient( self::CACHE_KEY_QUERIES, $results, self::CACHE_TTL );

		return $results;
	}

	/**
	 * Check if a query is likely misspelled.
	 *
	 * @param string $query         The query to check.
	 * @param int    $results_count Number of results for this query.
	 * @return bool True if likely misspelled.
	 */
	public function is_likely_misspelled( $query, $results_count ) {
		// If there are results, probably not misspelled.
		if ( $results_count > 3 ) {
			return false;
		}

		// Check if we can find a better suggestion.
		$suggestion = $this->get_suggestion( $query );

		return null !== $suggestion;
	}

	/**
	 * Get indexed product names for dictionary fallback.
	 *
	 * @param int $limit Maximum terms to fetch.
	 * @return array Array of product names.
	 */
	public function get_indexed_terms( $limit = 500 ) {
		// Check cache first.
		$cached = get_transient( self::CACHE_KEY_TERMS );
		if ( false !== $cached ) {
			return $cached;
		}

		global $wpdb;

		$table = Overseek_Search_Database::get_index_table();

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$results = $wpdb->get_col(
			$wpdb->prepare( // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- $table is safe from Overseek_Search_Database
				"SELECT DISTINCT title FROM {$table} LIMIT %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				$limit
			)
		);

		// Also get words from titles.
		$words = array();
		foreach ( $results as $title ) {
			$title_words = preg_split( '/\s+/', strtolower( $title ) );
			foreach ( $title_words as $word ) {
				$word = preg_replace( '/[^a-z0-9]/', '', $word );
				if ( strlen( $word ) >= $this->min_length ) {
					$words[ $word ] = true;
				}
			}
		}

		$terms = array_keys( $words );

		// Cache for 2 hours (terms change less frequently).
		set_transient( self::CACHE_KEY_TERMS, $terms, self::CACHE_TTL * 2 );

		return $terms;
	}

	/**
	 * Find suggestion from indexed terms (fallback).
	 *
	 * @param string $query The query word.
	 * @return string|null Suggested word or null.
	 */
	public function suggest_from_index( $query ) {
		$query = strtolower( trim( $query ) );

		if ( strlen( $query ) < $this->min_length ) {
			return null;
		}

		$indexed_terms = $this->get_indexed_terms();

		$best_match    = null;
		$best_distance = PHP_INT_MAX;

		foreach ( $indexed_terms as $term ) {
			if ( $term === $query ) {
				return null; // Exact match found.
			}

			$distance = levenshtein( $query, $term );

			if ( $distance <= $this->max_distance && $distance < $best_distance ) {
				$best_match    = $term;
				$best_distance = $distance;
			}
		}

		return $best_match;
	}
}
