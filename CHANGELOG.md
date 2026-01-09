# Changelog

All notable changes to OverSeek Search will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-10

### Added

- **Instant Search** — Real-time results with 300ms debounce
- **Fuzzy Matching** — Typo tolerance using Levenshtein distance
- **Synonym Management** — Bidirectional synonym mapping
- **Faceted Filters** — Category, price range, and stock status filters
- **Voice Search** — Web Speech API integration
- **Search Analytics** — Track search queries and clicks
- **Keyboard Shortcuts** — `/` and `Ctrl+K` to open search
- **Search History** — localStorage-based with individual deletion
- **Popular Searches** — Display trending search terms
- **Recent Products** — Show recently viewed products
- **Autocomplete Suggestions** — Smart query completion
- **Session Caching** — Reduced server load via sessionStorage
- **Replace Native Search** — Hook-based WooCommerce search replacement
- **HPOS Compatibility** — WooCommerce High-Performance Order Storage support
- **React Admin Dashboard** — Modern settings interface
- **Mobile-Responsive UI** — Inline dropdown design

### Technical

- MySQL FULLTEXT indexing with weighted fields
- REST API controllers for search, admin, and analytics
- Realtime product sync on save/update/delete
- Proper i18n support with text domain
