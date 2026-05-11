<?php
/**
 * Database management class.
 *
 * Handles custom table creation and schema migrations.
 *
 * @package OverSeek_Search
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Overseek_Search_Database
 *
 * Manages custom database tables for the plugin.
 */
class Overseek_Search_Database {


	/**
	 * Create all custom tables.
	 */
	public static function create_tables() {
		global $wpdb;

		$charset_collate = $wpdb->get_charset_collate();

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		// Search index table with FULLTEXT support.
		$search_index_table = $wpdb->prefix . 'overseek_search_index';
		$sql_index          = "CREATE TABLE $search_index_table (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            product_id BIGINT UNSIGNED NOT NULL,
            title VARCHAR(255) NOT NULL DEFAULT '',
            sku VARCHAR(100) NOT NULL DEFAULT '',
            variation_skus TEXT,
            description TEXT,
            short_description TEXT,
            categories TEXT,
            tags TEXT,
            attributes TEXT,
            price DECIMAL(10,2) DEFAULT 0.00,
            sale_price DECIMAL(10,2) DEFAULT NULL,
            stock_status VARCHAR(20) DEFAULT 'instock',
            image_url VARCHAR(500) DEFAULT '',
            search_content TEXT,
            language VARCHAR(10) DEFAULT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY idx_product_id (product_id),
            KEY idx_language (language),
            FULLTEXT KEY ft_search (title, sku, search_content),
            FULLTEXT KEY ft_title (title),
            FULLTEXT KEY ft_sku (sku),
            FULLTEXT KEY ft_content (search_content)
        ) $charset_collate ENGINE=InnoDB;";

		dbDelta( $sql_index );

		// Analytics table.
		$analytics_table = $wpdb->prefix . 'overseek_search_analytics';
		$sql_analytics   = "CREATE TABLE $analytics_table (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            query VARCHAR(255) NOT NULL,
            results_count INT UNSIGNED DEFAULT 0,
            clicked_product_id BIGINT UNSIGNED DEFAULT NULL,
            session_id VARCHAR(64) NOT NULL,
            user_id BIGINT UNSIGNED DEFAULT NULL,
            filters_json TEXT,
            event_type VARCHAR(20) DEFAULT 'search',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY idx_query (query(100)),
            KEY idx_created (created_at),
            KEY idx_session (session_id)
        ) $charset_collate;";

		dbDelta( $sql_analytics );

		// Synonyms table.
		$synonyms_table = $wpdb->prefix . 'overseek_search_synonyms';
		$sql_synonyms   = "CREATE TABLE $synonyms_table (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            base_term VARCHAR(100) NOT NULL,
            synonyms TEXT NOT NULL,
            one_way TINYINT(1) DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY idx_base_term (base_term)
        ) $charset_collate;";

		dbDelta( $sql_synonyms );

		// Boosts table for search merchandising.
		$boosts_table = $wpdb->prefix . 'overseek_search_boosts';
		$sql_boosts   = "CREATE TABLE $boosts_table (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            product_id BIGINT UNSIGNED NOT NULL,
            query_pattern VARCHAR(255) DEFAULT NULL,
            boost_type ENUM('pin', 'boost') DEFAULT 'boost',
            boost_weight DECIMAL(5,2) DEFAULT 1.50,
            is_active TINYINT(1) DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY idx_query (query_pattern(100)),
            KEY idx_product (product_id),
            KEY idx_active (is_active)
        ) $charset_collate;";

		dbDelta( $sql_boosts );

		// Ensure indexes exist (dbDelta doesn't always add indexes to existing tables).
		self::ensure_indexes();
	}

	/**
	 * Ensure all required FULLTEXT indexes exist.
	 *
	 * DbDelta() may not create indexes on existing tables, so we add them manually.
	 */
	public static function ensure_indexes() {
		global $wpdb;

		// Validate table name against known value to prevent injection.
		$table          = self::get_index_table();
		$expected_table = $wpdb->prefix . 'overseek_search_index';

		if ( $table !== $expected_table ) {
			return; // Safety check - table name doesn't match expected pattern.
		}

		// Escape table name for use in queries.
		$safe_table = esc_sql( $table );

		// Check and add individual FULLTEXT indexes if they don't exist.
		$indexes = array(
			'ft_title'   => 'title',
			'ft_sku'     => 'sku',
			'ft_content' => 'search_content',
		);

		foreach ( $indexes as $index_name => $column ) {
			// Validate index name and column against whitelist.
			$safe_index  = esc_sql( $index_name );
			$safe_column = esc_sql( $column );

			// Check if index exists.
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$existing = $wpdb->get_row(
				$wpdb->prepare( // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- $safe_table is escaped via esc_sql
					"SHOW INDEX FROM `{$safe_table}` WHERE Key_name = %s", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
					$index_name
				)
			);

			if ( ! $existing ) {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				$wpdb->query( "ALTER TABLE `{$safe_table}` ADD FULLTEXT INDEX `{$safe_index}` (`{$safe_column}`)" );
			}
		}
	}

	/**
	 * Drop all custom tables.
	 * Used during uninstall.
	 */
	public static function drop_tables() {
		global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}overseek_search_index" );
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}overseek_search_analytics" );
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}overseek_search_synonyms" );
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}overseek_search_boosts" );
	}

	/**
	 * Get the search index table name.
	 *
	 * @return string
	 */
	public static function get_index_table() {
		global $wpdb;
		return $wpdb->prefix . 'overseek_search_index';
	}

	/**
	 * Get the analytics table name.
	 *
	 * @return string
	 */
	public static function get_analytics_table() {
		global $wpdb;
		return $wpdb->prefix . 'overseek_search_analytics';
	}

	/**
	 * Get the synonyms table name.
	 *
	 * @return string
	 */
	public static function get_synonyms_table() {
		global $wpdb;
		return $wpdb->prefix . 'overseek_search_synonyms';
	}

	/**
	 * Get the boosts table name.
	 *
	 * @return string
	 */
	public static function get_boosts_table() {
		global $wpdb;
		return $wpdb->prefix . 'overseek_search_boosts';
	}
}
