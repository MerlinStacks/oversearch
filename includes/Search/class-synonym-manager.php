<?php
/**
 * Synonym management.
 *
 * Handles synonym storage and query expansion.
 *
 * @package OverSeek_Search
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Overseek_Search_Synonym_Manager
 *
 * Manages synonyms for search query expansion.
 */
class Overseek_Search_Synonym_Manager {

	/**
	 * Cached synonyms.
	 *
	 * @var array|null
	 */
	private $cache = null;

	/**
	 * Get all synonym groups.
	 *
	 * @return array Array of synonym groups.
	 */
	public function get_all() {
		if ( null !== $this->cache ) {
			return $this->cache;
		}

		global $wpdb;

		$table   = Overseek_Search_Database::get_synonyms_table();
		$results = $wpdb->get_results(
			"SELECT id, base_term, synonyms, one_way FROM $table ORDER BY base_term ASC", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			ARRAY_A
		);

		$this->cache = array();

		foreach ( $results as $row ) {
			$this->cache[ $row['id'] ] = array(
				'base_term' => $row['base_term'],
				'synonyms'  => array_map( 'trim', explode( ',', $row['synonyms'] ) ),
				'one_way'   => (bool) $row['one_way'],
			);
		}

		return $this->cache;
	}

	/**
	 * Add a new synonym group.
	 *
	 * @param string $base_term The base term.
	 * @param array  $synonyms  Array of synonym terms.
	 * @param bool   $one_way   If true, only base_term expands to synonyms (not vice versa).
	 * @return int|false The new row ID or false on failure.
	 */
	public function add( $base_term, $synonyms, $one_way = false ) {
		global $wpdb;

		$table     = Overseek_Search_Database::get_synonyms_table();
		$base_term = sanitize_text_field( strtolower( trim( $base_term ) ) );
		$synonyms  = array_map(
			function ( $s ) {
				return sanitize_text_field( strtolower( trim( $s ) ) );
			},
			$synonyms
		);

		// Remove empty values and the base term from synonyms.
		$synonyms = array_filter(
			$synonyms,
			function ( $s ) use ( $base_term ) {
				return ! empty( $s ) && $s !== $base_term;
			}
		);

		if ( empty( $base_term ) || empty( $synonyms ) ) {
			return false;
		}

		$result = $wpdb->insert(
			$table,
			array(
				'base_term' => $base_term,
				'synonyms'  => implode( ', ', $synonyms ),
				'one_way'   => $one_way ? 1 : 0,
			),
			array( '%s', '%s', '%d' )
		);

		if ( $result ) {
			$this->cache = null; // Clear cache.
			return $wpdb->insert_id;
		}

		return false;
	}

	/**
	 * Update a synonym group.
	 *
	 * @param int    $id        The synonym group ID.
	 * @param string $base_term The base term.
	 * @param array  $synonyms  Array of synonym terms.
	 * @param bool   $one_way   One-way flag.
	 * @return bool True on success.
	 */
	public function update( $id, $base_term, $synonyms, $one_way = false ) {
		global $wpdb;

		$table     = Overseek_Search_Database::get_synonyms_table();
		$base_term = sanitize_text_field( strtolower( trim( $base_term ) ) );
		$synonyms  = array_map(
			function ( $s ) {
				return sanitize_text_field( strtolower( trim( $s ) ) );
			},
			$synonyms
		);

		$synonyms = array_filter(
			$synonyms,
			function ( $s ) use ( $base_term ) {
				return ! empty( $s ) && $s !== $base_term;
			}
		);

		$result = $wpdb->update(
			$table,
			array(
				'base_term' => $base_term,
				'synonyms'  => implode( ', ', $synonyms ),
				'one_way'   => $one_way ? 1 : 0,
			),
			array( 'id' => $id ),
			array( '%s', '%s', '%d' ),
			array( '%d' )
		);

		$this->cache = null; // Clear cache.

		return false !== $result;
	}

	/**
	 * Delete a synonym group.
	 *
	 * @param int $id The synonym group ID.
	 * @return bool True on success.
	 */
	public function delete( $id ) {
		global $wpdb;

		$table  = Overseek_Search_Database::get_synonyms_table();
		$result = $wpdb->delete( $table, array( 'id' => $id ), array( '%d' ) );

		$this->cache = null; // Clear cache.

		return false !== $result;
	}

	/**
	 * Expand a query with synonyms.
	 *
	 * @param string $query The original search query.
	 * @return string Expanded query with synonyms.
	 */
	public function expand_query( $query ) {
		$synonyms = $this->get_all();
		$query    = strtolower( trim( $query ) );
		$words    = preg_split( '/\s+/', $query );
		$expanded = array();

		foreach ( $words as $word ) {
			$found = false;

			foreach ( $synonyms as $group ) {
				$all_terms = array_merge( array( $group['base_term'] ), $group['synonyms'] );

				// Check if word matches base term.
				if ( $word === $group['base_term'] ) {
					// Add all synonyms.
					$expanded = array_merge( $expanded, $all_terms );
					$found    = true;
					break;
				}

				// If not one-way, also check synonyms.
				if ( ! $group['one_way'] && in_array( $word, $group['synonyms'], true ) ) {
					$expanded = array_merge( $expanded, $all_terms );
					$found    = true;
					break;
				}
			}

			if ( ! $found ) {
				$expanded[] = $word;
			}
		}

		// Remove duplicates and join.
		$expanded = array_unique( $expanded );

		return implode( ' ', $expanded );
	}

	/**
	 * Get synonyms for a specific term.
	 *
	 * @param string $term The term to look up.
	 * @return array Array of synonyms (empty if not found).
	 */
	public function get_for_term( $term ) {
		$synonyms = $this->get_all();
		$term     = strtolower( trim( $term ) );

		foreach ( $synonyms as $group ) {
			if ( $term === $group['base_term'] ) {
				return $group['synonyms'];
			}

			if ( ! $group['one_way'] && in_array( $term, $group['synonyms'], true ) ) {
				$all = array_merge( array( $group['base_term'] ), $group['synonyms'] );
				return array_filter(
					$all,
					function ( $s ) use ( $term ) {
						return $s !== $term;
					}
				);
			}
		}

		return array();
	}
}
