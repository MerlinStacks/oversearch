# OverSeek Search

[![WordPress](https://img.shields.io/badge/WordPress-6.0%2B-blue.svg)](https://wordpress.org/)
[![WooCommerce](https://img.shields.io/badge/WooCommerce-7.0%2B-purple.svg)](https://woocommerce.com/)
[![PHP](https://img.shields.io/badge/PHP-8.0%2B-777BB4.svg)](https://php.net/)
[![License: GPL v2](https://img.shields.io/badge/License-GPL%20v2-blue.svg)](https://www.gnu.org/licenses/gpl-2.0)

A high-performance, self-contained search engine for WooCommerce. No external APIs, no monthly fees—runs entirely within your WordPress installation.

![OverSeek Search Demo](https://via.placeholder.com/800x400?text=OverSeek+Search+Demo)

## ✨ Features

- **Instant Search** — Real-time results as you type (300ms debounce)
- **Fuzzy Matching** — Typo tolerance using Levenshtein distance
- **Synonyms** — Configure "sneakers" to find "trainers"
- **Voice Search** — Browser-native speech recognition
- **Faceted Filters** — Filter by category, price range, stock status
- **Search Analytics** — Track what customers search for
- **Keyboard Shortcuts** — Press `/` or `Ctrl+K` to open search
- **Search History** — Recent searches with individual deletion
- **Popular Searches** — Display trending search terms
- **Recent Products** — Show recently viewed products
- **Autocomplete Suggestions** — Smart query completion
- **Session Caching** — Reduced server load via `sessionStorage`

## 🚀 Installation

### From GitHub

1. Download the [latest release](https://github.com/MerlinStacks/oversearch/releases)
2. Upload the `oversearch` folder to `/wp-content/plugins/`
3. Activate **OverSeek Search** in WordPress
4. Navigate to **OverSeek Search** in the admin menu
5. Click **Rebuild Index** to index your products

### From Source

```bash
git clone https://github.com/MerlinStacks/oversearch.git
cd oversearch
npm install
npm run build
```

## ⚙️ Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `fuzzy_enabled` | `true` | Enable typo tolerance |
| `fuzzy_threshold` | `2` | Max Levenshtein distance |
| `results_per_page` | `8` | Results shown per page |
| `max_dropdown_results` | `5` | Results in dropdown |
| `voice_search` | `false` | Enable voice input |
| `replace_search` | `true` | Replace native WooCommerce search |

## 🏗️ Architecture

```
oversearch/
├── build/                 # Compiled assets
├── includes/
│   ├── Admin/             # Admin dashboard
│   ├── API/               # REST controllers
│   ├── Frontend/          # Search UI injection
│   └── Search/            # Core search engine
├── src/
│   ├── admin/             # React admin components
│   └── frontend/          # React search components
└── overseek-search.php    # Plugin bootstrap
```

### Key Components

- **Search Engine** — MySQL FULLTEXT with weighted ranking
- **Fuzzy Matcher** — Levenshtein-based typo tolerance
- **Realtime Sync** — Product changes trigger re-indexing
- **Synonym Manager** — Bidirectional synonym mapping

## 📊 Performance

OverSeek uses MySQL FULLTEXT indexes, which work well for stores with up to ~50,000 products. For larger catalogs, consider dedicated search infrastructure like Elasticsearch.

## 🔧 Development

```bash
# Install dependencies
npm install

# Development build (with watch)
npm run start

# Production build
npm run build
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a PR.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the GPL v2 License - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits

Developed by [SLDevs](https://sldevs.com)

---

**Need help?** [Open an issue](https://github.com/MerlinStacks/oversearch/issues)
