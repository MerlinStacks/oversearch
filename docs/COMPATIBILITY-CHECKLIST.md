# OverSeek 1.0.1 Compatibility Checklist

This checklist focuses on storefront compatibility areas that frequently break in search plugins.

## Dynamic Pricing and Cache

- [ ] Verify guest and logged-in users see correct prices for the same query.
- [ ] Verify role-based pricing plugins show role-specific values in results.
- [ ] Verify multi-currency plugins show currency-correct values in results.
- [ ] Verify search cache can be disabled via `overseek_search_enable_cache` filter.

## Product Visibility Rules

- [ ] Verify hidden catalog products are not indexed.
- [ ] Verify role-based visibility plugins can include/exclude products via `overseek_search_indexable_product` filter.
- [ ] Verify out-of-stock visibility settings are respected after reindex.

## Variations and SKU Behavior

- [ ] Verify exact variation SKU queries open the matching variation URL.
- [ ] Verify variable products with many children still return expected parent/variation data.
- [ ] Verify single-variation plugins do not produce dead links in results.

## Brands and Taxonomies

- [ ] Verify brand names are searchable for taxonomies: `product_brand`, `brand`, and `pa_brand`.
- [ ] Verify custom brand taxonomy support using `overseek_search_brand_taxonomies` filter.

## JavaScript Loading and Theme Optimizers

- [ ] Verify search initializes with deferred/delayed JS optimizers (for example WP Rocket).
- [ ] Verify late-inserted header/search DOM elements mount correctly.
- [ ] Verify no duplicate mounts are created when theme scripts re-render header fragments.

## Multilingual

- [ ] Verify language-specific queries only return current-language products.
- [ ] Verify translated product indexing includes language codes and remains filterable.

## Operational Safety

- [ ] Verify index rebuild succeeds on hosts without `wp_cache_flush_group()`.
- [ ] Verify reindex and realtime sync clear stale result caches.
