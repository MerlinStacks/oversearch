<?php
/**
 * Real-time synchronization.
 *
 * Hooks into WooCommerce to keep the search index in sync.
 *
 * @package OverSeek_Search
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Overseek_Search_Realtime_Sync
 *
 * Keeps the search index synchronized with WooCommerce products.
 */
class Overseek_Search_Realtime_Sync {


	/**
	 * Search index instance.
	 *
	 * @var Overseek_Search_Index
	 */
	private $index;

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->index = new Overseek_Search_Index();
	}

	/**
	 * Handle product creation.
	 *
	 * @param int $product_id The new product ID.
	 */
	public function on_product_created( $product_id ) {
		$this->index->index_product( $product_id );
		Overseek_Search_Engine::clear_cache();
	}

	/**
	 * Handle product update.
	 *
	 * @param int $product_id The updated product ID.
	 */
	public function on_product_updated( $product_id ) {
		$this->index->index_product( $product_id );
		Overseek_Search_Engine::clear_cache();
	}

	/**
	 * Handle product deletion.
	 *
	 * @param int $post_id The post/product ID being deleted.
	 */
	public function on_product_deleted( $post_id ) {
		$post_type = get_post_type( $post_id );

		if ( 'product' === $post_type ) {
			$this->index->remove_product( $post_id );
			Overseek_Search_Engine::clear_cache();
		}
	}

	/**
	 * Handle stock status change.
	 *
	 * @param int    $product_id   The product ID.
	 * @param string $stock_status The new stock status.
	 */
	public function on_stock_changed( $product_id, $stock_status ) {
		unset( $stock_status );
		// Re-index to update stock status in search index.
		$this->index->index_product( $product_id );
		Overseek_Search_Engine::clear_cache();
	}
}
