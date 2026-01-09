<?php
/**
 * Uninstall script for OverSeek Search.
 *
 * Removes all plugin data from the database.
 *
 * @package OverSeek_Search
 */

// If uninstall not called from WordPress, exit.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    exit;
}

global $wpdb;

// Delete custom tables.
$tables = array(
    $wpdb->prefix . 'overseek_search_index',
    $wpdb->prefix . 'overseek_search_analytics',
    $wpdb->prefix . 'overseek_search_synonyms',
);

foreach ( $tables as $table ) {
    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
    $wpdb->query( "DROP TABLE IF EXISTS {$table}" );
}

// Delete options.
delete_option( 'overseek_search_settings' );
delete_option( 'overseek_search_db_version' );

// Delete transients.
$wpdb->query(
    "DELETE FROM {$wpdb->options} 
    WHERE option_name LIKE '_transient_overseek_%' 
    OR option_name LIKE '_transient_timeout_overseek_%'"
);

// Clear scheduled hooks.
wp_clear_scheduled_hook( 'overseek_search_reindex_cron' );
