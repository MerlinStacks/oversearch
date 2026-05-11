<?php
/**
 * Gutenberg Block for OverSeek Search.
 *
 * @package OverSeek_Search
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Overseek_Gutenberg_Block
 *
 * Registers OverSeek Search as a Gutenberg block.
 */
class Overseek_Gutenberg_Block {


	/**
	 * Initialize the block.
	 */
	public static function init() {
		add_action( 'init', array( __CLASS__, 'register_block' ) );
	}

	/**
	 * Register the Gutenberg block.
	 */
	public static function register_block() {
		// Don't register if Gutenberg is not available.
		if ( ! function_exists( 'register_block_type' ) ) {
			return;
		}

		register_block_type(
			'overseek/search',
			array(
				'attributes'      => array(
					'placeholder' => array(
						'type'    => 'string',
						'default' => 'Search products...',
					),
					'maxResults'  => array(
						'type'    => 'number',
						'default' => 8,
					),
					'showVoice'   => array(
						'type'    => 'boolean',
						'default' => true,
					),
					'align'       => array(
						'type'    => 'string',
						'default' => 'wide',
					),
				),
				'render_callback' => array( __CLASS__, 'render_block' ),
				'editor_script'   => 'overseek-search-block-editor',
				'editor_style'    => 'overseek-search-block-editor-style',
				'supports'        => array(
					'align'           => array( 'wide', 'full' ),
					'html'            => false,
					'className'       => true,
					'customClassName' => true,
				),
			)
		);

		// Register editor script.
		wp_register_script(
			'overseek-search-block-editor',
			OVERSEEK_SEARCH_PLUGIN_URL . 'build/blocks/search-block.js',
			array( 'wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-i18n' ),
			OVERSEEK_SEARCH_VERSION,
			true
		);

		// Register editor styles.
		wp_register_style(
			'overseek-search-block-editor-style',
			OVERSEEK_SEARCH_PLUGIN_URL . 'build/frontend.css',
			array( 'wp-edit-blocks' ),
			OVERSEEK_SEARCH_VERSION
		);
	}

	/**
	 * Render the block on the frontend.
	 *
	 * @param array $attributes Block attributes.
	 * @return string Rendered block HTML.
	 */
	public static function render_block( $attributes ) {
		$placeholder = esc_attr( $attributes['placeholder'] ?? 'Search products...' );
		$max_results = absint( $attributes['maxResults'] ?? 8 );
		$show_voice  = ! empty( $attributes['showVoice'] ) ? 'true' : 'false';
		$class_name  = isset( $attributes['className'] ) ? esc_attr( $attributes['className'] ) : '';
		$align_class = isset( $attributes['align'] ) ? 'align' . esc_attr( $attributes['align'] ) : '';

		// Build shortcode.
		$shortcode = sprintf(
			'[overseek_search placeholder="%s" max_results="%d" show_voice="%s"]',
			$placeholder,
			$max_results,
			$show_voice
		);

		$wrapper_class = trim( 'wp-block-overseek-search ' . $align_class . ' ' . $class_name );

		return sprintf(
			'<div class="%s">%s</div>',
			esc_attr( $wrapper_class ),
			do_shortcode( $shortcode )
		);
	}

	/**
	 * Get block category.
	 *
	 * @param array $categories Existing categories.
	 * @return array Modified categories.
	 */
	public static function register_category( $categories ) {
		return array_merge(
			$categories,
			array(
				array(
					'slug'  => 'overseek',
					'title' => __( 'OverSeek', 'overseek-search' ),
					'icon'  => 'search',
				),
			)
		);
	}
}

// Initialize the block.
Overseek_Gutenberg_Block::init();

// Register custom block category.
add_filter( 'block_categories_all', array( 'Overseek_Gutenberg_Block', 'register_category' ), 10, 1 );
