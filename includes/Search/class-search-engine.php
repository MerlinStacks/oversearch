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
        
        $where_sql = '';
        if ( ! empty( $where_clauses ) ) {
            $where_sql = 'AND ' . implode( ' AND ', $where_clauses );
        }
        
        // Get field weights from settings.
        $title_weight = isset( $this->settings['title_weight'] ) ? (float) $this->settings['title_weight'] : 3;
        $sku_weight   = isset( $this->settings['sku_weight'] ) ? (float) $this->settings['sku_weight'] : 2;
        
        // Build the main search query with weighted scoring.
        $sql = $wpdb->prepare(
            "SELECT 
                product_id,
                title,
                sku,
                short_description,
                categories,
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
        
        $results = $wpdb->get_results( $sql, ARRAY_A );
        
        // If no results and fuzzy is enabled, try fuzzy matching.
        if ( empty( $results ) && ! empty( $this->settings['fuzzy_enabled'] ) ) {
            $results = $this->fuzzy_search( $query, $filters, $limit, $offset );
        }
        
        // Get total count for pagination.
        $count_sql = $wpdb->prepare(
            "SELECT COUNT(*) FROM $table 
            WHERE MATCH(title, sku, search_content) AGAINST(%s IN BOOLEAN MODE)
            $where_sql",
            array_merge( array( $search_terms ), $where_values )
        );
        
        $total_count = (int) $wpdb->get_var( $count_sql );
        
        // Get facets (category counts).
        $facets = $this->get_facets( $search_terms );
        
        return array(
            'results'      => $this->format_results( $results, $query ),
            'total'        => $total_count,
            'page'         => $page,
            'per_page'     => $limit,
            'total_pages'  => ceil( $total_count / $limit ),
            'facets'       => $facets,
            'query'        => $query,
            'expanded'     => $expanded_query !== $query ? $expanded_query : null,
        );
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
        $candidates = $wpdb->get_results(
            "SELECT DISTINCT title FROM $table LIMIT 1000",
            ARRAY_A
        );
        
        // Find fuzzy matches.
        $matched_titles = $this->fuzzy_matcher->find_matches( $query, array_column( $candidates, 'title' ), $threshold );
        
        if ( empty( $matched_titles ) ) {
            return array();
        }
        
        // Build query with matched titles.
        $placeholders = implode( ', ', array_fill( 0, count( $matched_titles ), '%s' ) );
        
        $sql = $wpdb->prepare(
            "SELECT product_id, title, sku, short_description, categories, price, sale_price, stock_status, image_url, 1 AS relevance_score
            FROM $table
            WHERE title IN ($placeholders)
            LIMIT %d OFFSET %d",
            array_merge( $matched_titles, array( $limit, $offset ) )
        );
        
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
        $category_sql = $wpdb->prepare(
            "SELECT categories, COUNT(*) as count 
            FROM $table 
            WHERE MATCH(title, sku, search_content) AGAINST(%s IN BOOLEAN MODE)
            AND categories != ''
            GROUP BY categories
            ORDER BY count DESC
            LIMIT 20",
            $search_terms
        );
        
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
        $price_sql = $wpdb->prepare(
            "SELECT MIN(price) as min_price, MAX(price) as max_price 
            FROM $table 
            WHERE MATCH(title, sku, search_content) AGAINST(%s IN BOOLEAN MODE)",
            $search_terms
        );
        
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
            $title = $row['title'];
            
            if ( $highlight ) {
                $title = $this->highlight_matches( $title, $query );
            }
            
            $formatted[] = array(
                'id'                => (int) $row['product_id'],
                'title'             => $title,
                'title_raw'         => $row['title'],
                'sku'               => $row['sku'],
                'short_description' => wp_trim_words( $row['short_description'], 15, '...' ),
                'categories'        => $row['categories'],
                'price'             => (float) $row['price'],
                'sale_price'        => $row['sale_price'] ? (float) $row['sale_price'] : null,
                'stock_status'      => $row['stock_status'],
                'image_url'         => $row['image_url'],
                'url'               => get_permalink( $row['product_id'] ),
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
}
