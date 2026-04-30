<?php
/**
 * Tests for OverSeek Search Fuzzy Matcher.
 *
 * @package OverSeek_Search
 */

namespace Overseek\Tests\Unit;

use PHPUnit\Framework\TestCase;
use Overseek_Search_Fuzzy_Matcher;

/**
 * Class Test_Fuzzy_Matcher
 */
class Test_Fuzzy_Matcher extends TestCase
{
    /**
     * The matcher under test.
     *
     * @var Overseek_Search_Fuzzy_Matcher
     */
    private $matcher;

    /**
     * Set up before each test.
     */
    protected function setUp(): void
    {
        $this->matcher = new Overseek_Search_Fuzzy_Matcher();
    }

    /**
     * Test exact match.
     */
    public function test_exact_match()
    {
        $candidates = array('Wireless Headphones', 'Bluetooth Speaker', 'USB Cable');
        $matches = $this->matcher->find_matches('Wireless Headphones', $candidates, 2);

        $this->assertContains('Wireless Headphones', $matches, 'Exact title should match');
    }

    /**
     * Test fuzzy match with one typo (Levenshtein distance 1).
     */
    public function test_fuzzy_match_typo()
    {
        $candidates = array('Wireless Headphones', 'Bluetooth Speaker', 'USB Cable');
        $matches = $this->matcher->find_matches('Wireles Headphones', $candidates, 2);

        $this->assertContains('Wireless Headphones', $matches, 'Title with one-letter typo should match');
    }

    /**
     * Test fuzzy match with two typos.
     */
    public function test_fuzzy_match_two_typos()
    {
        $candidates = array('Wireless Headphones');
        $matches = $this->matcher->find_matches('Wireles Headphons', $candidates, 2);

        $this->assertContains('Wireless Headphones', $matches, 'Title with two-letter typo should match with threshold 2');
    }

    /**
     * Test no match when threshold exceeded.
     */
    public function test_no_match_when_threshold_exceeded()
    {
        $candidates = array('Wireless Headphones');
        $matches = $this->matcher->find_matches('Wire Headphon', $candidates, 2);

        $this->assertEmpty($matches, 'Title with too many typos should not match with threshold 2');
    }

    /**
     * Test empty query returns no matches.
     */
    public function test_empty_query_returns_empty()
    {
        $candidates = array('Wireless Headphones');
        $matches = $this->matcher->find_matches('', $candidates, 2);

        $this->assertEmpty($matches, 'Empty query should return no matches');
    }

    /**
     * Test matching with short words (below MIN_WORD_LENGTH).
     */
    public function test_short_words_ignored()
    {
        $candidates = array('A4 Paper', 'USBhub');
        $matches = $this->matcher->find_matches('A USB', $candidates, 2);

        $this->assertEmpty($matches, 'Words below minimum length should be ignored');
    }

    /**
     * Test case insensitivity.
     */
    public function test_case_insensitive_match()
    {
        $candidates = array('Wireless Headphones');
        $matches = $this->matcher->find_matches('wireless headphones', $candidates, 2);

        $this->assertContains('Wireless Headphones', $matches, 'Search should be case-insensitive');
    }

    /**
     * Test spell correction returns valid correction.
     */
    public function test_spell_correction_found()
    {
        $dictionary = array('headphones', 'speaker', 'cable');
        $suggestion = $this->matcher->suggest_correction('headphons', $dictionary);

        $this->assertSame('headphones', $suggestion, 'Should suggest correct spelling');
    }

    /**
     * Test spell correction with exact match returns null.
     */
    public function test_spell_correction_exact_match_returns_null()
    {
        $dictionary = array('headphones', 'speaker');
        $suggestion = $this->matcher->suggest_correction('headphones', $dictionary);

        $this->assertNull($suggestion, 'Exact match should not return correction');
    }

    /**
     * Test results sorted by distance.
     */
    public function test_results_sorted_by_distance()
    {
        $candidates = array('Watch', 'Wallet', 'Water Bottle');
        $matches = $this->matcher->find_matches('Walet', $candidates, 2);

        $this->assertArrayHasKey(0, $matches, 'Should return matches');
        $this->assertSame('Wallet', $matches[0], 'Closest match should be first');
    }
}