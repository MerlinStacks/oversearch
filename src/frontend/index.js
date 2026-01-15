/**
 * OverSeek Search - Frontend App Entry Point
 * 
 * Dropdown-style instant search with history, suggestions, and caching.
 */

/* Did you mean styling is in frontend.css */

import { createRoot, useState, useEffect, useRef, useCallback } from '@wordpress/element';
import './frontend.css';

const { apiUrl, maxDropdownResults, replaceSearch, initialQuery, currency, i18n } = window.overseekSearch || {};

// Storage keys.
const HISTORY_KEY = 'overseek_history';
const RECENT_KEY = 'overseek_recent_products';
const CACHE_KEY_PREFIX = 'overseek_cache_';
const MAX_HISTORY = 10;
const MAX_RECENT = 5;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Decode HTML entities (e.g., &#36; -> $).
 */
function decodeHtmlEntities(str) {
    if (!str) return str;
    const textarea = document.createElement('textarea');
    textarea.innerHTML = str;
    return textarea.value;
}

/**
 * Debounce hook for search input.
 */
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Format price according to WooCommerce settings.
 */
function formatPrice(price) {
    if (!price && price !== 0) return '';
    const formatted = parseFloat(price).toFixed(currency?.decimals || 2);
    const symbol = decodeHtmlEntities(currency?.symbol || '$');

    switch (currency?.position) {
        case 'left': return `${symbol}${formatted}`;
        case 'right': return `${formatted}${symbol}`;
        case 'left_space': return `${symbol} ${formatted}`;
        case 'right_space': return `${formatted} ${symbol}`;
        default: return `${symbol}${formatted}`;
    }
}

// ============================================
// LOCAL STORAGE HELPERS
// ============================================

function getHistory() {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    } catch { return []; }
}

function saveToHistory(term) {
    if (!term || term.length < 2) return;
    try {
        let history = getHistory().filter(h => h.toLowerCase() !== term.toLowerCase());
        history.unshift(term);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
    } catch { }
}

function removeFromHistory(term) {
    try {
        const history = getHistory().filter(h => h !== term);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch { }
}

function clearHistory() {
    try { localStorage.removeItem(HISTORY_KEY); } catch { }
}

function getRecentProducts() {
    try {
        return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    } catch { return []; }
}

function saveRecentProduct(product) {
    try {
        let recent = getRecentProducts().filter(p => p.id !== product.id);
        recent.unshift({
            id: product.id,
            title: product.title_raw || product.title,
            price: product.price,
            image_url: product.image_url,
            url: product.url,
        });
        localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
    } catch { }
}

// ============================================
// CACHING HELPERS (sessionStorage)
// ============================================

function getCachedResults(query) {
    try {
        const key = CACHE_KEY_PREFIX + query.toLowerCase();
        const cached = sessionStorage.getItem(key);
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp > CACHE_TTL_MS) {
            sessionStorage.removeItem(key);
            return null;
        }
        return data;
    } catch { return null; }
}

function setCachedResults(query, data) {
    try {
        const key = CACHE_KEY_PREFIX + query.toLowerCase();
        sessionStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
    } catch { }
}

// ============================================
// SVG ICONS
// ============================================

function SearchIcon({ size = 20 }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
        </svg>
    );
}

function CloseIcon({ size = 14 }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
        </svg>
    );
}

// ============================================
// VOICE SEARCH COMPONENT
// ============================================

function VoiceSearch({ onResult, disabled }) {
    const [listening, setListening] = useState(false);
    const [supported, setSupported] = useState(false);
    const recognitionRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            setSupported(true);
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = document.documentElement.lang || 'en-US';

            recognitionRef.current.onresult = (event) => {
                onResult(event.results[0][0].transcript);
                setListening(false);
            };
            recognitionRef.current.onerror = () => setListening(false);
            recognitionRef.current.onend = () => setListening(false);
        }
        return () => recognitionRef.current?.abort();
    }, [onResult]);

    const toggle = () => {
        if (!recognitionRef.current) return;
        if (listening) {
            recognitionRef.current.abort();
            setListening(false);
        } else {
            recognitionRef.current.start();
            setListening(true);
        }
    };

    if (!supported) return null;

    return (
        <button
            type="button"
            className={`overseek-voice-btn ${listening ? 'is-listening' : ''}`}
            onClick={toggle}
            disabled={disabled}
            title="Voice search"
        >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 1.93c-3.94-.49-7-3.85-7-7.93h2c0 3.31 2.69 6 6 6s6-2.69 6-6h2c0 4.08-3.06 7.44-7 7.93V19h4v2H8v-2h4v-3.07z" />
            </svg>
            {listening && <span className="overseek-voice-pulse" />}
        </button>
    );
}

// ============================================
// PRODUCT CARD COMPONENT
// ============================================

function ProductCard({ product, onClick }) {
    const handleClick = () => {
        saveRecentProduct(product);
        onClick?.();
    };

    return (
        <a href={product.url} className="overseek-dropdown__product" onClick={handleClick}>
            {product.image_url && (
                <img src={product.image_url} alt="" className="overseek-dropdown__product-image" loading="lazy" />
            )}
            <div className="overseek-dropdown__product-info">
                <span className="overseek-dropdown__product-title" dangerouslySetInnerHTML={{ __html: product.title }} />
                <span className="overseek-dropdown__product-price">{formatPrice(product.sale_price || product.price)}</span>
            </div>
        </a>
    );
}

// ============================================
// HISTORY ITEM COMPONENT
// ============================================

function HistoryItem({ term, onClick, onDelete }) {
    return (
        <div className="overseek-dropdown__history-item">
            <button type="button" className="overseek-dropdown__history-btn" onClick={onClick}>
                <SearchIcon size={16} />
                <span>{term}</span>
            </button>
            <button type="button" className="overseek-dropdown__history-delete" onClick={onDelete} title="Remove">
                <CloseIcon size={12} />
            </button>
        </div>
    );
}

// ============================================
// RECENT PRODUCT ITEM
// ============================================

function RecentProductItem({ product }) {
    return (
        <a href={product.url} className="overseek-dropdown__recent-item">
            {product.image_url && <img src={product.image_url} alt="" className="overseek-dropdown__recent-image" />}
            <span className="overseek-dropdown__recent-title">{product.title}</span>
        </a>
    );
}

// ============================================
// SUGGESTION ITEM
// ============================================

function SuggestionItem({ term, onClick }) {
    return (
        <button type="button" className="overseek-dropdown__suggestion" onClick={onClick}>
            <SearchIcon size={14} />
            <span>{term}</span>
        </button>
    );
}

// ============================================
// MAIN SEARCH DROPDOWN COMPONENT
// ============================================

function SearchDropdown() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [popular, setPopular] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [history, setHistory] = useState([]);
    const [recentProducts, setRecentProducts] = useState([]);
    const [isMobile, setIsMobile] = useState(false);
    const [didYouMean, setDidYouMean] = useState(null);

    const inputRef = useRef(null);
    const dropdownRef = useRef(null);
    const debouncedQuery = useDebounce(query, 300);
    const maxResults = maxDropdownResults || 5;

    // Check for mobile.
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // Load history, recent products, and popular searches on mount.
    useEffect(() => {
        setHistory(getHistory());
        setRecentProducts(getRecentProducts());

        // Fetch popular searches.
        fetch(`${apiUrl}/popular?limit=5`)
            .then(r => r.json())
            .then(data => setPopular(data.popular || []))
            .catch(() => { });
    }, []);

    // Handle initial query from URL.
    useEffect(() => {
        if (initialQuery && initialQuery.length >= 2) {
            setQuery(initialQuery);
            setIsOpen(true);
        }
    }, []);

    // Perform search when debounced query changes.
    useEffect(() => {
        if (debouncedQuery.length >= 2) {
            performSearch();
            fetchSuggestions();
        } else {
            setResults([]);
            setSuggestions([]);
        }
    }, [debouncedQuery]);

    // Close dropdown when clicking outside.
    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Keyboard: Escape to close.
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
                inputRef.current?.blur();
            }
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, []);

    // Bind to PHP-rendered triggers.
    useEffect(() => {
        const triggers = document.querySelectorAll('.overseek-search-trigger');
        const handleClick = (e) => {
            e.preventDefault();
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 100);
        };
        triggers.forEach(t => t.addEventListener('click', handleClick));
        return () => triggers.forEach(t => t.removeEventListener('click', handleClick));
    }, []);

    const performSearch = async () => {
        // Check cache first.
        const cached = getCachedResults(debouncedQuery);
        if (cached) {
            setResults(cached.results || []);
            setDidYouMean(cached.did_you_mean || null);
            return;
        }

        setLoading(true);
        setDidYouMean(null);
        try {
            const params = new URLSearchParams({ q: debouncedQuery, per_page: maxResults });
            const response = await fetch(`${apiUrl}/search?${params}`);
            const data = await response.json();

            setResults(data.results || []);
            setDidYouMean(data.did_you_mean || null);
            setCachedResults(debouncedQuery, data);

            if (data.results?.length > 0) {
                saveToHistory(debouncedQuery);
                setHistory(getHistory());
            }
        } catch (err) {
            console.error('Search error:', err);
            setResults([]);
            setDidYouMean(null);
        }
        setLoading(false);
    };

    const fetchSuggestions = async () => {
        try {
            const params = new URLSearchParams({ q: debouncedQuery, limit: 5 });
            const response = await fetch(`${apiUrl}/suggest?${params}`);
            const data = await response.json();
            // Filter out exact matches to query.
            const filtered = (data.suggestions || []).filter(
                s => s.toLowerCase() !== debouncedQuery.toLowerCase()
            );
            setSuggestions(filtered);
        } catch {
            setSuggestions([]);
        }
    };

    const handleInputFocus = () => setIsOpen(true);
    const handleHistoryClick = (term) => { setQuery(term); inputRef.current?.focus(); };
    const handleHistoryDelete = (term) => { removeFromHistory(term); setHistory(getHistory()); };
    const handleClearHistory = () => { clearHistory(); setHistory([]); };
    const handleProductClick = () => setIsOpen(false);
    const handleSuggestionClick = (term) => { setQuery(term); inputRef.current?.focus(); };
    const handleDidYouMeanClick = (term) => { setQuery(term); setDidYouMean(null); inputRef.current?.focus(); };

    const showHistory = isOpen && query.length < 2 && history.length > 0;
    const showPopular = isOpen && query.length < 2 && history.length === 0 && popular.length > 0;
    const showRecent = isOpen && query.length < 2 && recentProducts.length > 0;
    const showResults = isOpen && query.length >= 2;
    const showSuggestions = showResults && suggestions.length > 0;
    const showNoResults = showResults && !loading && results.length === 0;
    const showDidYouMean = showResults && !loading && didYouMean && results.length <= 3;
    const showDropdown = showHistory || showPopular || showRecent || showResults;

    const viewAllUrl = `/?s=${encodeURIComponent(query)}&post_type=product`;

    // ============================================
    // MOBILE MODAL
    // ============================================
    if (isMobile && isOpen) {
        return (
            <div className="overseek-mobile-overlay">
                <div className="overseek-mobile-modal" ref={dropdownRef}>
                    <div className="overseek-mobile-header">
                        <div className="overseek-mobile-input-wrapper">
                            <SearchIcon size={20} />
                            <input
                                ref={inputRef}
                                type="text"
                                className="overseek-mobile-input"
                                placeholder={i18n?.searchPlaceholder || 'Search for products...'}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                autoFocus
                                autoComplete="off"
                            />
                            {loading && <div className="overseek-spinner" />}
                            <VoiceSearch onResult={setQuery} disabled={loading} />
                        </div>
                        <button type="button" className="overseek-mobile-close" onClick={() => setIsOpen(false)}>✕</button>
                    </div>
                    <div className="overseek-mobile-body">
                        {showRecent && (
                            <div className="overseek-dropdown__section">
                                <div className="overseek-dropdown__section-header">
                                    <span>Recently Viewed</span>
                                </div>
                                <div className="overseek-dropdown__recent">
                                    {recentProducts.map(p => <RecentProductItem key={p.id} product={p} />)}
                                </div>
                            </div>
                        )}
                        {showHistory && (
                            <div className="overseek-dropdown__section">
                                <div className="overseek-dropdown__section-header">
                                    <span>{i18n?.recentSearches || 'Your search history'}</span>
                                    <button type="button" onClick={handleClearHistory}>{i18n?.clear || 'Clear'}</button>
                                </div>
                                <div className="overseek-dropdown__history">
                                    {history.map((term, idx) => (
                                        <HistoryItem key={idx} term={term} onClick={() => handleHistoryClick(term)} onDelete={() => handleHistoryDelete(term)} />
                                    ))}
                                </div>
                            </div>
                        )}
                        {showPopular && (
                            <div className="overseek-dropdown__section">
                                <div className="overseek-dropdown__section-header"><span>Popular Searches</span></div>
                                <div className="overseek-dropdown__history">
                                    {popular.map((term, idx) => (
                                        <HistoryItem key={idx} term={term} onClick={() => handleHistoryClick(term)} onDelete={() => { }} />
                                    ))}
                                </div>
                            </div>
                        )}
                        {showResults && (
                            <>
                                <div className="overseek-dropdown__results">
                                    {results.map(p => <ProductCard key={p.id} product={p} onClick={handleProductClick} />)}
                                </div>
                                {showSuggestions && (
                                    <div className="overseek-dropdown__suggestions">
                                        {suggestions.map((term, idx) => (
                                            <SuggestionItem key={idx} term={term} onClick={() => handleSuggestionClick(term)} />
                                        ))}
                                    </div>
                                )}
                                {results.length > 0 && (
                                    <a href={viewAllUrl} className="overseek-dropdown__view-all">View all results</a>
                                )}
                            </>
                        )}
                        {showNoResults && <div className="overseek-dropdown__empty">{i18n?.noResults || 'No products found'}</div>}
                        {showDidYouMean && (
                            <div className="overseek-dropdown__did-you-mean">
                                <span>{i18n?.didYouMean || 'Did you mean:'}</span>
                                <button type="button" onClick={() => handleDidYouMeanClick(didYouMean)}>{didYouMean}</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ============================================
    // DESKTOP DROPDOWN
    // ============================================
    return (
        <div className="overseek-search-wrapper" ref={dropdownRef}>
            <div className="overseek-search-input-container">
                <SearchIcon size={20} />
                <input
                    ref={inputRef}
                    type="text"
                    className="overseek-search-input"
                    placeholder={i18n?.searchPlaceholder || 'Search for products...'}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={handleInputFocus}
                    autoComplete="off"
                />
                {loading && <div className="overseek-spinner" />}
                <VoiceSearch onResult={setQuery} disabled={loading} />
            </div>

            {showDropdown && (
                <div className="overseek-dropdown">
                    {showRecent && (
                        <div className="overseek-dropdown__section">
                            <div className="overseek-dropdown__section-header"><span>Recently Viewed</span></div>
                            <div className="overseek-dropdown__recent">
                                {recentProducts.map(p => <RecentProductItem key={p.id} product={p} />)}
                            </div>
                        </div>
                    )}

                    {showHistory && (
                        <div className="overseek-dropdown__section">
                            <div className="overseek-dropdown__section-header">
                                <span>{i18n?.recentSearches || 'Your search history'}</span>
                                <button type="button" onClick={handleClearHistory}>{i18n?.clear || 'Clear'}</button>
                            </div>
                            <div className="overseek-dropdown__history">
                                {history.map((term, idx) => (
                                    <HistoryItem key={idx} term={term} onClick={() => handleHistoryClick(term)} onDelete={() => handleHistoryDelete(term)} />
                                ))}
                            </div>
                        </div>
                    )}

                    {showPopular && (
                        <div className="overseek-dropdown__section">
                            <div className="overseek-dropdown__section-header"><span>Popular Searches</span></div>
                            <div className="overseek-dropdown__history">
                                {popular.map((term, idx) => (
                                    <HistoryItem key={idx} term={term} onClick={() => handleHistoryClick(term)} onDelete={() => { }} />
                                ))}
                            </div>
                        </div>
                    )}

                    {showResults && (
                        <>
                            <div className="overseek-dropdown__results">
                                {results.map(p => <ProductCard key={p.id} product={p} onClick={handleProductClick} />)}
                            </div>
                            {showSuggestions && (
                                <div className="overseek-dropdown__suggestions">
                                    {suggestions.map((term, idx) => (
                                        <SuggestionItem key={idx} term={term} onClick={() => handleSuggestionClick(term)} />
                                    ))}
                                </div>
                            )}
                            {results.length > 0 && (
                                <a href={viewAllUrl} className="overseek-dropdown__view-all">View all results →</a>
                            )}
                        </>
                    )}

                    {showNoResults && <div className="overseek-dropdown__empty">{i18n?.noResults || 'No products found'}</div>}
                    {showDidYouMean && (
                        <div className="overseek-dropdown__did-you-mean">
                            <span>{i18n?.didYouMean || 'Did you mean:'}</span>
                            <button type="button" onClick={() => handleDidYouMeanClick(didYouMean)}>{didYouMean}</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Mount the app into all available containers.
document.addEventListener('DOMContentLoaded', () => {
    const footerRoot = document.getElementById('overseek-search-root');
    const inlineContainers = document.querySelectorAll('[data-overseek-search="true"]');

    if (inlineContainers.length > 0) {
        inlineContainers.forEach((container) => {
            const root = createRoot(container);
            root.render(<SearchDropdown />);
        });
    } else if (footerRoot) {
        const root = createRoot(footerRoot);
        root.render(<SearchDropdown />);
    }
});
