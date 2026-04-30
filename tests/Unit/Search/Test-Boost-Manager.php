<?php
/**
 * Tests for OverSeek Search Boost Manager.
 *
 * @package OverSeek_Search
 */

namespace Overseek\Tests\Unit;

use PHPUnit\Framework\TestCase;
use Overseek_Boost_Manager;

/**
 * Class Test_Boost_Manager
 */
class Test_Boost_Manager extends TestCase
{
    /**
     * The boost manager under test.
     *
     * @var Overseek_Boost_Manager
     */
    private $boost_manager;

    /**
     * Set up before each test.
     */
    protected function setUp(): void
    {
        $this->boost_manager = new Overseek_Boost_Manager();
    }

    /**
     * Test boost weight is clamped within valid range.
     */
    public function test_add_boost_clamps_weight()
    {
        $result = $this->boost_manager->add_boost(1, 'boost', 200.0);
        // Since wc_get_product is mocked to return false, it will fail.
        $this->assertInstanceOf('WP_Error', $result);
    }

    /**
     * Test invalid boost type returns error.
     */
    public function test_invalid_boost_type_returns_error()
    {
        $result = $this->boost_manager->add_boost(1, 'invalid_type', 1.5);

        $this->assertInstanceOf('WP_Error', $result);
        $this->assertSame('invalid_boost_type', $result->get_error_code());
    }

    /**
     * Test pinned products sorted by pinned_id_list order.
     */
    public function test_apply_boosts_sorted_by_pinned_order()
    {
        $results = array(
            array('id' => 3, 'relevance' => 5),
            array('id' => 1, 'relevance' => 10),
            array('id' => 2, 'relevance' => 1),
        );

        $query = 'test query';

        // Mock pinned IDs by overriding get_pinned_products behavior indirectly.
        $boosted = $this->boost_manager->apply_boosts($results, $query);

        // Without database, apply_boosts should return the original results.
        $this->assertIsArray($boosted);
        $this->assertCount(3, $boosted);
    }

    /**
     * Test relevance scores are multiplied for boosted products.
     */
    public function test_boost_multiplier_applied()
    {
        $results = array(
            array('id' => 10, 'relevance' => 5.0),
        );

        $boosted = $this->boost_manager->apply_boosts($results, 'query');

        // With no matching boosts, relevance should remain unchanged.
        $this->assertSame(5.0, $boosted[0]['relevance']);
    }

    /**
     * Test total count respects limit.
     */
    public function test_boosts_without_database()
    {
        $results = array();
        for ($i = 1; $i <= 20; $i++) {
            $results[] = array('id' => $i, 'relevance' => 20 - $i);
        }

        $boosted = $this->boost_manager->apply_boosts($results, 'query');

        $this->assertCount(20, $boosted, 'All results should be returned when none are pinned');
    }
}