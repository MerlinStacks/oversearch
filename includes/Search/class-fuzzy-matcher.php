<?php
/**
 * Fuzzy matching for typo tolerance.
 *
 * Uses Levenshtein distance and trigram similarity.
 *
 * @package OverSeek_Search
 */

// Prevent direct access.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class Overseek_Search_Fuzzy_Matcher
 *
 * Provides fuzzy string matching for typo tolerance.
 */
class Overseek_Search_Fuzzy_Matcher
{

    /**
     * Minimum word length to consider for matching.
     */
    const MIN_WORD_LENGTH = 3;

    /**
     * Minimum word length for trigram similarity checks.
     */
    const MIN_TRIGRAM_LENGTH = 4;

    /**
     * Trigram similarity threshold (0-1 scale, higher = stricter).
     */
    const TRIGRAM_THRESHOLD = 0.4;

    /**
     * Maximum length difference before skipping distance calculation.
     */
    const MAX_LENGTH_DIFF = 3;

    /**
     * Default Levenshtein distance threshold.
     */
    const DEFAULT_THRESHOLD = 2;

    /**
     * Get the minimum word length (filterable).
     *
     * @return int
     */
    private function get_min_word_length() {
        return apply_filters('overseek_fuzzy_min_word_length', self::MIN_WORD_LENGTH);
    }

    /**
     * Find fuzzy matches for a query against a list of candidates.
     *
     * @param string $query      The search query.
     * @param array  $candidates List of candidate strings to match against.
     * @param int    $threshold  Maximum Levenshtein distance (default: 2).
     * @return array Matched strings sorted by similarity.
     */
    public function find_matches($query, $candidates, $threshold = 2)
    {
        $query = strtolower(trim($query));
        $matches = array();

        // Get filterable minimum word length.
        $min_word_length = apply_filters('overseek_fuzzy_min_word_length', self::MIN_WORD_LENGTH);

        foreach ($candidates as $candidate) {
            $candidate_lower = strtolower($candidate);

            // Check each word in the query against the candidate.
            $query_words = preg_split('/\s+/', $query);

        foreach ($query_words as $word) {
            if (strlen($word) < $min_word_length) {
                continue;
            }

                // Check if any word in the candidate is similar.
                $candidate_words = preg_split('/\s+/', $candidate_lower);

                foreach ($candidate_words as $cword) {
                    $distance = $this->calculate_distance($word, $cword);

                    if ($distance <= $threshold) {
                        $matches[$candidate] = isset($matches[$candidate])
                            ? min($matches[$candidate], $distance)
                            : $distance;
                        break 2;
                    }

                    // Also check trigram similarity for longer words.
                    if (strlen($word) >= self::MIN_TRIGRAM_LENGTH && strlen($cword) >= self::MIN_TRIGRAM_LENGTH) {
                        $similarity = $this->trigram_similarity($word, $cword);
                        if ($similarity >= self::TRIGRAM_THRESHOLD) {
                            $matches[$candidate] = isset($matches[$candidate])
                                ? min($matches[$candidate], 1)
                                : 1;
                            break 2;
                        }
                    }
                }
            }
        }

        // Sort by distance (lower is better).
        asort($matches);

        return array_keys($matches);
    }

    /**
     * Calculate Levenshtein distance between two strings.
     *
     * Uses PHP's built-in function with optimizations.
     *
     * @param string $str1 First string.
     * @param string $str2 Second string.
     * @return int Levenshtein distance.
     */
    private function calculate_distance($str1, $str2)
    {
        // Quick checks for efficiency.
        if ($str1 === $str2) {
            return 0;
        }

        $len1 = strlen($str1);
        $len2 = strlen($str2);

        // If length difference is too large, skip detailed calculation.
        if (abs($len1 - $len2) > 3) {
            return 100;
        }

        // Use PHP's native levenshtein (limited to 255 chars).
        if ($len1 <= 255 && $len2 <= 255) {
            return levenshtein($str1, $str2);
        }

        // Fallback for very long strings (shouldn't happen for product titles).
        return 100;
    }

    /**
     * Calculate trigram similarity between two strings.
     *
     * Trigrams are 3-character substrings.
     *
     * @param string $str1 First string.
     * @param string $str2 Second string.
     * @return float Similarity score between 0 and 1.
     */
    private function trigram_similarity($str1, $str2)
    {
        $trigrams1 = $this->get_trigrams($str1);
        $trigrams2 = $this->get_trigrams($str2);

        if (empty($trigrams1) || empty($trigrams2)) {
            return 0;
        }

        $intersection = array_intersect($trigrams1, $trigrams2);
        $union = array_unique(array_merge($trigrams1, $trigrams2));

        return count($intersection) / count($union);
    }

    /**
     * Extract trigrams from a string.
     *
     * @param string $str The input string.
     * @return array Array of trigrams.
     */
    private function get_trigrams($str)
    {
        $str = strtolower(trim($str));
        $trigrams = array();
        $len = strlen($str);

        for ($i = 0; $i <= $len - 3; $i++) {
            $trigrams[] = substr($str, $i, 3);
        }

        return $trigrams;
    }

    /**
     * Suggest corrections for a misspelled query.
     *
     * @param string $query      The search query.
     * @param array  $dictionary List of known correct terms.
     * @return string|null Suggested correction or null.
     */
    public function suggest_correction($query, $dictionary)
    {
        $query = strtolower(trim($query));
        $best_match = null;
        $best_score = PHP_INT_MAX;

        foreach ($dictionary as $term) {
            $term_lower = strtolower($term);
            $distance = $this->calculate_distance($query, $term_lower);

            if ($distance < $best_score && $distance <= 2 && $distance > 0) {
                $best_score = $distance;
                $best_match = $term;
            }
        }

        return $best_match;
    }
}
