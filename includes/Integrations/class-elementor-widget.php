<?php
/**
 * Elementor Widget for OverSeek Search.
 *
 * @package OverSeek_Search
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Only load if Elementor is active.
if ( ! did_action( 'elementor/loaded' ) ) {
	return;
}

/**
 * Class Overseek_Elementor_Widget
 *
 * Provides OverSeek Search as an Elementor widget.
 */
class Overseek_Elementor_Widget extends \Elementor\Widget_Base {


	/**
	 * Get widget name.
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return 'overseek_search';
	}

	/**
	 * Get widget title.
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return __( 'OverSeek Search', 'overseek-search' );
	}

	/**
	 * Get widget icon.
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return 'eicon-search';
	}

	/**
	 * Get widget categories.
	 *
	 * @return array Widget categories.
	 */
	public function get_categories() {
		return array( 'general', 'woocommerce-elements' );
	}

	/**
	 * Get widget keywords.
	 *
	 * @return array Keywords.
	 */
	public function get_keywords() {
		return array( 'search', 'woocommerce', 'product', 'overseek' );
	}

	/**
	 * Register widget controls.
	 */
	protected function register_controls() {
		$this->start_controls_section(
			'section_general',
			array(
				'label' => __( 'General', 'overseek-search' ),
				'tab'   => \Elementor\Controls_Manager::TAB_CONTENT,
			)
		);

		$this->add_control(
			'placeholder',
			array(
				'label'       => __( 'Placeholder Text', 'overseek-search' ),
				'type'        => \Elementor\Controls_Manager::TEXT,
				'default'     => __( 'Search products...', 'overseek-search' ),
				'placeholder' => __( 'Search products...', 'overseek-search' ),
			)
		);

		$this->add_control(
			'max_results',
			array(
				'label'   => __( 'Max Results', 'overseek-search' ),
				'type'    => \Elementor\Controls_Manager::NUMBER,
				'default' => 8,
				'min'     => 3,
				'max'     => 20,
			)
		);

		$this->add_control(
			'show_voice',
			array(
				'label'        => __( 'Show Voice Search', 'overseek-search' ),
				'type'         => \Elementor\Controls_Manager::SWITCHER,
				'label_on'     => __( 'Yes', 'overseek-search' ),
				'label_off'    => __( 'No', 'overseek-search' ),
				'return_value' => 'yes',
				'default'      => 'yes',
			)
		);

		$this->end_controls_section();

		// Style controls.
		$this->start_controls_section(
			'section_style',
			array(
				'label' => __( 'Style', 'overseek-search' ),
				'tab'   => \Elementor\Controls_Manager::TAB_STYLE,
			)
		);

		$this->add_responsive_control(
			'width',
			array(
				'label'      => __( 'Width', 'overseek-search' ),
				'type'       => \Elementor\Controls_Manager::SLIDER,
				'size_units' => array( '%', 'px' ),
				'range'      => array(
					'%'  => array(
						'min' => 20,
						'max' => 100,
					),
					'px' => array(
						'min' => 200,
						'max' => 800,
					),
				),
				'default'    => array(
					'unit' => '%',
					'size' => 100,
				),
				'selectors'  => array(
					'{{WRAPPER}} .overseek-search-wrapper' => 'width: {{SIZE}}{{UNIT}}; max-width: {{SIZE}}{{UNIT}};',
				),
			)
		);

		$this->add_control(
			'border_radius',
			array(
				'label'      => __( 'Border Radius', 'overseek-search' ),
				'type'       => \Elementor\Controls_Manager::SLIDER,
				'size_units' => array( 'px' ),
				'range'      => array(
					'px' => array(
						'min' => 0,
						'max' => 50,
					),
				),
				'default'    => array( 'size' => 12 ),
				'selectors'  => array(
					'{{WRAPPER}} .overseek-search-input-container' => 'border-radius: {{SIZE}}{{UNIT}};',
				),
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Render widget output.
	 */
	protected function render() {
		$settings = $this->get_settings_for_display();

		$shortcode_atts = array(
			'placeholder' => $settings['placeholder'],
			'max_results' => $settings['max_results'],
			'show_voice'  => 'yes' === $settings['show_voice'] ? 'true' : 'false',
		);

		$atts_string = '';
		foreach ( $shortcode_atts as $key => $value ) {
			$atts_string .= ' ' . $key . '="' . esc_attr( $value ) . '"';
		}

		echo do_shortcode( '[overseek_search' . $atts_string . ']' );
	}

	/**
	 * Register Elementor widget.
	 *
	 * @param \Elementor\Widgets_Manager $widgets_manager Elementor widgets manager.
	 */
	public static function register_widget( $widgets_manager ) {
		$widgets_manager->register( new self() );
	}
}

add_action( 'elementor/widgets/register', array( 'Overseek_Elementor_Widget', 'register_widget' ) );
