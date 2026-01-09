<?php
/**
 * The core plugin loader class.
 *
 * Registers actions and filters for the plugin.
 *
 * @package OverSeek_Search
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class Overseek_Search_Loader
 *
 * Maintains lists of hooks registered throughout the plugin.
 */
class Overseek_Search_Loader {

    /**
     * Array of actions to register.
     *
     * @var array
     */
    protected $actions = array();

    /**
     * Array of filters to register.
     *
     * @var array
     */
    protected $filters = array();

    /**
     * Add a new action to the collection.
     *
     * @param string $hook          The action hook name.
     * @param object $component     The object containing the callback.
     * @param string $callback      The callback method name.
     * @param int    $priority      Optional. Priority. Default 10.
     * @param int    $accepted_args Optional. Number of args. Default 1.
     */
    public function add_action( $hook, $component, $callback, $priority = 10, $accepted_args = 1 ) {
        $this->actions = $this->add( $this->actions, $hook, $component, $callback, $priority, $accepted_args );
    }

    /**
     * Add a new filter to the collection.
     *
     * @param string $hook          The filter hook name.
     * @param object $component     The object containing the callback.
     * @param string $callback      The callback method name.
     * @param int    $priority      Optional. Priority. Default 10.
     * @param int    $accepted_args Optional. Number of args. Default 1.
     */
    public function add_filter( $hook, $component, $callback, $priority = 10, $accepted_args = 1 ) {
        $this->filters = $this->add( $this->filters, $hook, $component, $callback, $priority, $accepted_args );
    }

    /**
     * Add a hook to the collection.
     *
     * @param array  $hooks         The current collection of hooks.
     * @param string $hook          The hook name.
     * @param object $component     The object containing the callback.
     * @param string $callback      The callback method name.
     * @param int    $priority      The priority.
     * @param int    $accepted_args Number of args.
     * @return array The updated hooks collection.
     */
    private function add( $hooks, $hook, $component, $callback, $priority, $accepted_args ) {
        $hooks[] = array(
            'hook'          => $hook,
            'component'     => $component,
            'callback'      => $callback,
            'priority'      => $priority,
            'accepted_args' => $accepted_args,
        );
        return $hooks;
    }

    /**
     * Register all collected actions and filters with WordPress.
     */
    public function run() {
        foreach ( $this->filters as $hook ) {
            add_filter(
                $hook['hook'],
                array( $hook['component'], $hook['callback'] ),
                $hook['priority'],
                $hook['accepted_args']
            );
        }

        foreach ( $this->actions as $hook ) {
            add_action(
                $hook['hook'],
                array( $hook['component'], $hook['callback'] ),
                $hook['priority'],
                $hook['accepted_args']
            );
        }
    }
}
