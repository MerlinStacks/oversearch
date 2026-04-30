<?php
/**
 * Search index management.
 *
 * Handles indexing WooCommerce products into the search table.
 *
 * @package OverSeek_Search
 */

// Prevent direct access.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class Overseek_Search_Index
 *
 * Manages the product search index.
 */
class Overseek_Search_Index
{

    /**
     * Index a single product.
     *
     * @param int $product_id The product ID to index.
     * @return bool True on success, false on failure.
     */
    public function index_product($product_id)
    {
        $product = wc_get_product($product_id);

        if (!$product || 'publish' !== $product->get_status()) {
            $this->remove_product($product_id);
            return false;
        }

        $data = $this->extract_product_data($product);

        return $this->upsert_index($data);
    }

    /**
     * Extract searchable data from a product.
     *
     * @param WC_Product $product The product object.
     * @return array Extracted data.
     */
    private function extract_product_data($product)
    {
        $product_id = $product->get_id();

        // Get categories.
        $categories = array();
        $category_ids = $product->get_category_ids();
        foreach ($category_ids as $cat_id) {
            $term = get_term($cat_id, 'product_cat');
            if ($term && !is_wp_error($term)) {
                $categories[] = $term->name;
            }
        }

        // Get tags.
        $tags = array();
        $tag_ids = $product->get_tag_ids();
        foreach ($tag_ids as $tag_id) {
            $term = get_term($tag_id, 'product_tag');
            if ($term && !is_wp_error($term)) {
                $tags[] = $term->name;
            }
        }

        // Get attributes.
        $attributes = array();
        $product_attributes = $product->get_attributes();
        foreach ($product_attributes as $attribute) {
            if ($attribute->is_taxonomy()) {
                $terms = wp_get_post_terms($product_id, $attribute->get_name(), array('fields' => 'names'));
                if (!is_wp_error($terms)) {
                    $attributes = array_merge($attributes, $terms);
                }
            } else {
                $attributes = array_merge($attributes, $attribute->get_options());
            }
        }

        // Get variation SKUs for variable products.
        $variation_skus = array();
        if ($product->is_type('variable')) {
            $variations = $product->get_children();
            foreach ($variations as $variation_id) {
                $variation = wc_get_product($variation_id);
                if ($variation) {
                    $var_sku = $variation->get_sku();
                    if ($var_sku) {
                        $variation_skus[] = $var_sku;
                    }
                    // Also get variation-specific attributes for searchability.
                    $var_attributes = $variation->get_attributes();
                    foreach ($var_attributes as $attr_value) {
                        if ($attr_value && !in_array($attr_value, $attributes, true)) {
                            $attributes[] = $attr_value;
                        }
                    }
                }
            }
        }

        // Get image URL.
        $image_url = '';
        $image_id = $product->get_image_id();
        if ($image_id) {
            $image_url = wp_get_attachment_image_url($image_id, 'woocommerce_thumbnail');
        }

        // Build combined search content (including variation SKUs).
        $search_content = implode(' ', array_filter(array(
            $product->get_name(),
            $product->get_sku(),
            implode(' ', $variation_skus),
            wp_strip_all_tags($product->get_description()),
            wp_strip_all_tags($product->get_short_description()),
            implode(' ', $categories),
            implode(' ', $tags),
            implode(' ', $attributes),
        )));

        $data = array(
            'product_id' => $product_id,
            'title' => $product->get_name(),
            'sku' => $product->get_sku(),
            'variation_skus' => implode(', ', $variation_skus),
            'description' => wp_strip_all_tags($product->get_description()),
            'short_description' => wp_strip_all_tags($product->get_short_description()),
            'categories' => implode(', ', $categories),
            'tags' => implode(', ', $tags),
            'attributes' => implode(', ', $attributes),
            'price' => $product->get_price(),
            'sale_price' => $product->get_sale_price(),
            'stock_status' => $product->get_stock_status(),
            'image_url' => $image_url ? $image_url : '',
            'search_content' => $search_content,
            'language' => null, // Will be set by multilingual filter if active.
        );

        // Allow multilingual plugins to add language data.
        return apply_filters('overseek_index_product_data', $data);
    }

    /**
     * Insert or update a product in the index.
     *
     * @param array $data Product data.
     * @return bool True on success.
     */
    private function upsert_index($data)
    {
        global $wpdb;

        $table = Overseek_Search_Database::get_index_table();

        // Check if product exists in index.
        $exists = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT id FROM $table WHERE product_id = %d",
                $data['product_id']
            )
        );

        if ($exists) {
            // Update existing record.
            $result = $wpdb->update(
                $table,
                array(
                    'title' => $data['title'],
                    'sku' => $data['sku'],
                    'variation_skus' => $data['variation_skus'],
                    'description' => $data['description'],
                    'short_description' => $data['short_description'],
                    'categories' => $data['categories'],
                    'tags' => $data['tags'],
                    'attributes' => $data['attributes'],
                    'price' => $data['price'],
                    'sale_price' => $data['sale_price'],
                    'stock_status' => $data['stock_status'],
                    'image_url' => $data['image_url'],
                    'search_content' => $data['search_content'],
                    'language' => $data['language'],
                ),
                array('product_id' => $data['product_id']),
                array('%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%f', '%f', '%s', '%s', '%s', '%s'),
                array('%d')
            );
        } else {
            // Insert new record.
            $result = $wpdb->insert(
                $table,
                array(
                    'product_id' => $data['product_id'],
                    'title' => $data['title'],
                    'sku' => $data['sku'],
                    'variation_skus' => $data['variation_skus'],
                    'description' => $data['description'],
                    'short_description' => $data['short_description'],
                    'categories' => $data['categories'],
                    'tags' => $data['tags'],
                    'attributes' => $data['attributes'],
                    'price' => $data['price'],
                    'sale_price' => $data['sale_price'],
                    'stock_status' => $data['stock_status'],
                    'image_url' => $data['image_url'],
                    'search_content' => $data['search_content'],
                    'language' => $data['language'],
                ),
                array('%d', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%f', '%f', '%s', '%s', '%s', '%s')
            );
        }

        return false !== $result;
    }

    /**
     * Remove a product from the index.
     *
     * @param int $product_id The product ID to remove.
     * @return bool True on success.
     */
    public function remove_product($product_id)
    {
        global $wpdb;

        $table = Overseek_Search_Database::get_index_table();
        $result = $wpdb->delete($table, array('product_id' => $product_id), array('%d'));

        return false !== $result;
    }

    /**
     * Rebuild the entire search index.
     *
     * @param callable|null $progress_callback Optional callback for progress updates.
     * @return array Index stats.
     */
    public function rebuild_index($progress_callback = null)
    {
        global $wpdb;

        $table = Overseek_Search_Database::get_index_table();

        // Use transaction for safety - if something fails, we can rollback.
        $wpdb->query('START TRANSACTION');

        // Clear existing index only after starting transaction.
        $wpdb->query("TRUNCATE TABLE $table");

        // Get all published products (excluding variations - only index parent products).
        $args = array(
            'status' => 'publish',
            'limit' => -1,
            'orderby' => 'ID',
            'order' => 'ASC',
            'return' => 'ids',
            'type' => array( 'simple', 'variable', 'grouped', 'external' ),
        );

        $product_ids = wc_get_products($args);
        $total = count($product_ids);
        $indexed = 0;
        $failed = 0;

        foreach ($product_ids as $index => $product_id) {
            $success = $this->index_product($product_id);

            if ($success) {
                $indexed++;
            } else {
                $failed++;
            }

            if (is_callable($progress_callback)) {
                $progress_callback($index + 1, $total, $product_id);
            }
        }

        $wpdb->query('COMMIT');

        // Clear caches after rebuild.
        wp_cache_flush_group('overseek_search');

        return array(
            'total' => $total,
            'indexed' => $indexed,
            'failed' => $failed,
        );
    }

    /**
     * Get index statistics.
     *
     * @return array Index stats.
     */
    public function get_stats()
    {
        global $wpdb;

        $table = Overseek_Search_Database::get_index_table();

        $count = (int) $wpdb->get_var("SELECT COUNT(*) FROM $table");
        $last_updated = $wpdb->get_var("SELECT MAX(updated_at) FROM $table");

        return array(
            'indexed_count' => $count,
            'last_updated' => $last_updated,
        );
    }
}
