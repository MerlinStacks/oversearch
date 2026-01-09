=== OverSeek Search ===
Contributors: sldevs
Tags: woocommerce, search, ajax search, instant search, product search
Requires at least: 6.0
Tested up to: 6.4
Requires PHP: 8.0
WC requires at least: 7.0
WC tested up to: 9.0
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A high-performance, self-contained search engine for WooCommerce with instant search, fuzzy matching, synonyms, faceted filters, and analytics.

== Description ==

OverSeek Search replaces the default WooCommerce search with a powerful, instant search experience. No external APIs or hosting required—it runs entirely within your WordPress installation.

**Features:**

* **Instant Search** - Real-time results as you type with 300ms debounce
* **Fuzzy Matching** - Typo tolerance using Levenshtein distance
* **Synonyms** - Configure synonyms so "sneakers" finds "trainers"
* **Faceted Filters** - Filter by category, price range, and stock status
* **Voice Search** - Browser-native speech recognition (Chrome, Edge, Safari)
* **Search Analytics** - Track what customers search for and improve your store
* **Keyboard Shortcuts** - Press `/` or `Ctrl+K` to open search
* **Glassmorphism UI** - Modern, premium design

**Self-Contained:**

Unlike Algolia or similar services, OverSeek Search uses MySQL FULLTEXT indexes. No monthly fees, no API limits, no external dependencies.

== Installation ==

1. Upload `overseek-search` to `/wp-content/plugins/`
2. Activate the plugin in WordPress
3. Go to **OverSeek Search** in the admin menu
4. Click **Rebuild Index** to index your products
5. Configure synonyms and settings as needed

== Frequently Asked Questions ==

= Does this require any external service? =

No. OverSeek Search runs entirely on your WordPress/MySQL server.

= How many products can it handle? =

MySQL FULLTEXT indexes work well for stores with up to ~50,000 products. For larger catalogs, consider dedicated search infrastructure.

= Does it work with variable products? =

Yes. Product variations are indexed with their parent product data.

= How do I add the search to my theme? =

The search modal is automatically injected into every page. Customers can press `/` or `Ctrl+K` to open it, or click the search trigger button.

== Changelog ==

= 1.0.0 =
* Initial release
* Instant search with autocomplete
* Fuzzy matching (typo tolerance)
* Synonym management
* Faceted filters (category, price, stock)
* Voice search (Web Speech API)
* Search analytics dashboard
* React-based admin and frontend

== Upgrade Notice ==

= 1.0.0 =
Initial release of OverSeek Search.
