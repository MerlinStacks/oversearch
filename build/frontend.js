/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/frontend/frontend.css"
/*!***********************************!*\
  !*** ./src/frontend/frontend.css ***!
  \***********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ },

/***/ "@wordpress/element"
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
(module) {

module.exports = window["wp"]["element"];

/***/ },

/***/ "react"
/*!************************!*\
  !*** external "React" ***!
  \************************/
(module) {

module.exports = window["React"];

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Check if module exists (development only)
/******/ 		if (__webpack_modules__[moduleId] === undefined) {
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!*******************************!*\
  !*** ./src/frontend/index.js ***!
  \*******************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _frontend_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./frontend.css */ "./src/frontend/frontend.css");

/**
 * OverSeek Search - Frontend App Entry Point
 *
 * Dropdown-style instant search with history, suggestions, and caching.
 */

/* Did you mean styling is in frontend.css */
/* global localStorage, sessionStorage */



const {
  apiUrl,
  maxDropdownResults,
  initialQuery,
  i18n
} = window.overseekSearch || {};

// Storage keys.
const HISTORY_KEY = 'overseek_history';
const RECENT_KEY = 'overseek_recent_products';
const CACHE_KEY_PREFIX = 'overseek_cache_';
const MAX_RECENT = 5;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * React Error Boundary for Search Dropdown.
 * Catches render errors and prevents them from crashing the page.
 */
class SearchErrorBoundary extends _wordpress_element__WEBPACK_IMPORTED_MODULE_1__.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false
    };
  }
  static getDerivedStateFromError(/* error */
  ) {
    return {
      hasError: true
    };
  }
  componentDidCatch(error, errorInfo) {
    // eslint-disable-next-line no-console
    console.error('OverSeek Search error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
        className: "overseek-search-wrapper"
      }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
        className: "overseek-search-error"
      }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, i18n?.noResults || 'Something went wrong. Please refresh the page.')));
    }
    return this.props.children;
  }
}
function removeFromHistory(term) {
  try {
    const history = getHistory().filter(h => h !== term);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    /* ignore */
  }
}
function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    /* ignore */
  }
}
function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch (e) {
    return [];
  }
}
function getRecentProducts() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch {
    return [];
  }
}
function saveRecentProduct(product) {
  try {
    const recent = getRecentProducts().filter(p => p.id !== product.id);
    recent.unshift({
      id: product.id,
      title: product.title_raw || product.title,
      price: product.price,
      image_url: product.image_url,
      url: product.url
    });
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
  } catch (e) {
    /* ignore */
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(value);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}
function formatPrice(price) {
  if (!price) {
    return '';
  }
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD'
  }).format(price);
}
function saveToHistory(term) {
  if (!term || term.trim().length < 2) {
    return;
  }
  try {
    const history = getHistory().filter(h => h !== term);
    history.unshift(term);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 10)));
  } catch (e) {
    /* ignore */
  }
}

// ============================================
// CACHING HELPERS (sessionStorage)
// ============================================

function getCachedResults(query) {
  try {
    const key = CACHE_KEY_PREFIX + query.toLowerCase();
    const cached = sessionStorage.getItem(key);
    if (!cached) {
      return null;
    }
    const {
      data,
      timestamp
    } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_TTL_MS) {
      sessionStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}
function setCachedResults(query, data) {
  try {
    const key = CACHE_KEY_PREFIX + query.toLowerCase();
    sessionStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (e) {
    /* ignore */
  }
}

// ============================================
// SVG ICONS
// ============================================

function SearchIcon({
  size = 20
}) {
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("svg", {
    viewBox: "0 0 24 24",
    width: size,
    height: size,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("circle", {
    cx: "11",
    cy: "11",
    r: "8"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
    d: "M21 21l-4.35-4.35"
  }));
}
function CloseIcon({
  size = 14
}) {
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("svg", {
    viewBox: "0 0 24 24",
    width: size,
    height: size,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
    d: "M18 6L6 18M6 6l12 12"
  }));
}

// ============================================
// VOICE SEARCH COMPONENT
// ============================================

function VoiceSearch({
  onResult,
  disabled
}) {
  const [listening, setListening] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [supported, setSupported] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const recognitionRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = document.documentElement.lang || 'en-US';
      recognitionRef.current.onresult = event => {
        onResult(event.results[0][0].transcript);
        setListening(false);
      };
      recognitionRef.current.onerror = () => setListening(false);
      recognitionRef.current.onend = () => setListening(false);
    }
    return () => recognitionRef.current?.abort();
  }, [onResult]);
  const toggle = () => {
    if (!recognitionRef.current) {
      return;
    }
    if (listening) {
      recognitionRef.current.abort();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };
  if (!supported) {
    return null;
  }
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    type: "button",
    className: `overseek-voice-btn ${listening ? 'is-listening' : ''}`,
    onClick: toggle,
    disabled: disabled,
    title: "Voice search"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("svg", {
    viewBox: "0 0 24 24",
    width: "20",
    height: "20",
    fill: "currentColor"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
    d: "M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 1.93c-3.94-.49-7-3.85-7-7.93h2c0 3.31 2.69 6 6 6s6-2.69 6-6h2c0 4.08-3.06 7.44-7 7.93V19h4v2H8v-2h4v-3.07z"
  })), listening && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "overseek-voice-pulse"
  }));
}

// ============================================
// PRODUCT CARD COMPONENT
// ============================================

function ProductCard({
  product,
  onClick
}) {
  const handleClick = () => {
    saveRecentProduct(product);
    onClick?.();
  };
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
    href: product.url,
    className: "overseek-dropdown__product",
    onClick: handleClick
  }, product.image_url && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("img", {
    src: product.image_url,
    alt: "",
    className: "overseek-dropdown__product-image",
    loading: "lazy"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-dropdown__product-info"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "overseek-dropdown__product-title",
    dangerouslySetInnerHTML: {
      __html: product.title
    }
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "overseek-dropdown__product-price"
  }, formatPrice(product.sale_price || product.price))));
}

// ============================================
// HISTORY ITEM COMPONENT
// ============================================

function HistoryItem({
  term,
  onClick,
  onDelete
}) {
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-dropdown__history-item"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    type: "button",
    className: "overseek-dropdown__history-btn",
    onClick: onClick
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(SearchIcon, {
    size: 16
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", null, term)), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    type: "button",
    className: "overseek-dropdown__history-delete",
    onClick: onDelete,
    title: "Remove"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(CloseIcon, {
    size: 12
  })));
}

// ============================================
// RECENT PRODUCT ITEM
// ============================================

function RecentProductItem({
  product
}) {
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
    href: product.url,
    className: "overseek-dropdown__recent-item"
  }, product.image_url && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("img", {
    src: product.image_url,
    alt: "",
    className: "overseek-dropdown__recent-image"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "overseek-dropdown__recent-title"
  }, product.title));
}

// ============================================
// SUGGESTION ITEM
// ============================================

function SuggestionItem({
  term,
  onClick
}) {
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    type: "button",
    className: "overseek-dropdown__suggestion",
    onClick: onClick
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(SearchIcon, {
    size: 14
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", null, term));
}

// ============================================
// MAIN SEARCH DROPDOWN COMPONENT
// ============================================

function SearchDropdown() {
  const [query, setQuery] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('');
  const [results, setResults] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)([]);
  const [suggestions, setSuggestions] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)([]);
  const [popular, setPopular] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)([]);
  const [loading, setLoading] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [isOpen, setIsOpen] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [history, setHistory] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)([]);
  const [recentProducts, setRecentProducts] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)([]);
  const [isMobile, setIsMobile] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [didYouMean, setDidYouMean] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [activeIndex, setActiveIndex] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(-1);
  const inputRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);
  const dropdownRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);
  const debouncedQuery = useDebounce(query, 300);
  const maxResults = maxDropdownResults || 5;

  // Check for mobile.
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Load history, recent products, and popular searches on mount.
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    setHistory(getHistory());
    setRecentProducts(getRecentProducts());

    // Fetch popular searches.
    fetch(`${apiUrl}/popular?limit=5`).then(r => r.json()).then(data => setPopular(data.popular || [])).catch(() => {});
  }, []);

  // Handle initial query from URL.
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (initialQuery && initialQuery.length >= 2) {
      setQuery(initialQuery);
      setIsOpen(true);
    }
  }, []);

  // Perform search when debounced query changes.
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (debouncedQuery.length >= 2) {
      performSearch();
      fetchSuggestions();
    } else {
      setResults([]);
      setSuggestions([]);
    }
  }, [debouncedQuery]);

  // Close dropdown when clicking outside.
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    const handleClick = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Keyboard navigation inside dropdown.
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (!isOpen) {
      return;
    }
    const selectable = dropdownRef.current?.querySelectorAll('[role="option"]');
    if (!selectable || selectable.length === 0) {
      return;
    }
    const handleKey = e => {
      if (['ArrowDown', 'ArrowUp', 'Enter', 'Tab', 'Escape'].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.focus();
        return;
      }
      if (e.key === 'ArrowDown') {
        setActiveIndex(prev => (prev + 1) % selectable.length);
        selectable[(activeIndex + 1) % selectable.length]?.focus();
        return;
      }
      if (e.key === 'ArrowUp') {
        setActiveIndex(prev => (prev - 1 + selectable.length) % selectable.length);
        selectable[(activeIndex - 1 + selectable.length) % selectable.length]?.focus();
        return;
      }
      if (e.key === 'Enter') {
        // eslint-disable-next-line @wordpress/no-global-active-element
        const focused = document.activeElement;
        if (focused && focused.tagName === 'A') {
          window.location.href = focused.href;
        } else if (focused && focused.click) {
          focused.click();
        }
        return;
      }
      if (e.key === 'Tab') {
        // Allow tab to leave the dropdown naturally.
        setIsOpen(false);
      }
    };
    dropdownRef.current?.addEventListener('keydown', handleKey);
    return () => dropdownRef.current?.removeEventListener('keydown', handleKey);
  }, [isOpen, activeIndex]);

  // Bind to PHP-rendered triggers.
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    const triggers = document.querySelectorAll('.overseek-search-trigger');
    const handleClick = e => {
      e.preventDefault();
      setIsOpen(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    };
    triggers.forEach(t => t.addEventListener('click', handleClick));
    return () => triggers.forEach(t => t.removeEventListener('click', handleClick));
  }, []);
  const abortControllerRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);
  const performSearch = async () => {
    // Cancel previous request if still pending.
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

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
      const params = new URLSearchParams({
        q: debouncedQuery,
        per_page: maxResults
      });
      const response = await fetch(`${apiUrl}/search?${params}`, {
        signal: abortController.signal
      });
      const data = await response.json();
      setResults(data.results || []);
      setDidYouMean(data.did_you_mean || null);
      setCachedResults(debouncedQuery, data);
      if (data.results?.length > 0) {
        saveToHistory(debouncedQuery);
        setHistory(getHistory());
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        // eslint-disable-next-line no-console
        console.error('Search error:', err);
        setResults([]);
        setDidYouMean(null);
      }
    }
    setLoading(false);
  };
  const fetchSuggestions = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    try {
      const params = new URLSearchParams({
        q: debouncedQuery,
        limit: 5
      });
      const response = await fetch(`${apiUrl}/suggest?${params}`, {
        signal: abortController.signal
      });
      const data = await response.json();
      // Filter out exact matches to query.
      const filtered = (data.suggestions || []).filter(s => s.toLowerCase() !== debouncedQuery.toLowerCase());
      setSuggestions(filtered);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setSuggestions([]);
      }
    }
  };
  const handleInputFocus = () => setIsOpen(true);
  const handleHistoryClick = term => {
    setQuery(term);
    inputRef.current?.focus();
  };
  const handleHistoryDelete = term => {
    removeFromHistory(term);
    setHistory(getHistory());
  };
  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };
  const handleProductClick = () => setIsOpen(false);
  const handleSuggestionClick = term => {
    setQuery(term);
    inputRef.current?.focus();
  };
  const handleDidYouMeanClick = term => {
    setQuery(term);
    setDidYouMean(null);
    inputRef.current?.focus();
  };
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
    return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "overseek-mobile-overlay"
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "overseek-mobile-modal",
      ref: dropdownRef
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "overseek-mobile-header"
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "overseek-mobile-input-wrapper"
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(SearchIcon, {
      size: 20
    }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
      ref: inputRef,
      type: "text",
      className: "overseek-mobile-input",
      placeholder: i18n?.searchPlaceholder || 'Search for products...',
      value: query,
      onChange: e => setQuery(e.target.value)
      // eslint-disable-next-line jsx-a11y/no-autofocus
      ,
      autoFocus: true,
      autoComplete: "off"
    }), loading && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "overseek-spinner"
    }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(VoiceSearch, {
      onResult: setQuery,
      disabled: loading
    })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
      type: "button",
      className: "overseek-mobile-close",
      onClick: () => setIsOpen(false)
    }, "\u2715")), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "overseek-mobile-body"
    }, showRecent && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "overseek-dropdown__section"
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "overseek-dropdown__section-header"
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", null, "Recently Viewed")), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "overseek-dropdown__recent"
    }, recentProducts.map(p => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(RecentProductItem, {
      key: p.id,
      product: p
    })))), showHistory && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "overseek-dropdown__section"
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "overseek-dropdown__section-header"
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", null, i18n?.recentSearches || 'Your search history'), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
      type: "button",
      onClick: handleClearHistory
    }, i18n?.clear || 'Clear')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "overseek-dropdown__history"
    }, history.map(term => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(HistoryItem, {
      key: term,
      term: term,
      onClick: () => handleHistoryClick(term),
      onDelete: () => handleHistoryDelete(term)
    })))), showPopular && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "overseek-dropdown__section"
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "overseek-dropdown__section-header"
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", null, "Popular Searches")), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "overseek-dropdown__history"
    }, popular.map(term => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(HistoryItem, {
      key: term,
      term: term,
      onClick: () => handleHistoryClick(term),
      onDelete: () => {}
    })))), showResults && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "overseek-dropdown__results"
    }, results.map(p => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(ProductCard, {
      key: p.id,
      product: p,
      onClick: handleProductClick
    }))), showSuggestions && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "overseek-dropdown__suggestions"
    }, suggestions.map(term => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(SuggestionItem, {
      key: term,
      term: term,
      onClick: () => handleSuggestionClick(term)
    }))), results.length > 0 && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
      href: viewAllUrl,
      className: "overseek-dropdown__view-all"
    }, "View all results")), showNoResults && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "overseek-dropdown__empty"
    }, i18n?.noResults || 'No products found'), showDidYouMean && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "overseek-dropdown__did-you-mean"
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", null, i18n?.didYouMean || 'Did you mean:'), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
      type: "button",
      onClick: () => handleDidYouMeanClick(didYouMean)
    }, didYouMean)))));
  }

  // ============================================
  // DESKTOP DROPDOWN
  // ============================================
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-search-wrapper",
    ref: dropdownRef
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-search-input-container"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(SearchIcon, {
    size: 20
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    ref: inputRef,
    type: "text",
    className: "overseek-search-input",
    placeholder: i18n?.searchPlaceholder || 'Search for products...',
    value: query,
    onChange: e => setQuery(e.target.value),
    onFocus: handleInputFocus,
    autoComplete: "off"
  }), loading && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-spinner"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(VoiceSearch, {
    onResult: setQuery,
    disabled: loading
  })), showDropdown && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-dropdown"
  }, showRecent && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-dropdown__section"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-dropdown__section-header"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", null, "Recently Viewed")), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-dropdown__recent"
  }, recentProducts.map(p => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(RecentProductItem, {
    key: p.id,
    product: p
  })))), showHistory && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-dropdown__section"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-dropdown__section-header"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", null, i18n?.recentSearches || 'Your search history'), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    type: "button",
    onClick: handleClearHistory
  }, i18n?.clear || 'Clear')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-dropdown__history"
  }, history.map((term, idx) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(HistoryItem, {
    key: idx,
    term: term,
    onClick: () => handleHistoryClick(term),
    onDelete: () => handleHistoryDelete(term)
  })))), showPopular && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-dropdown__section"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-dropdown__section-header"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", null, "Popular Searches")), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-dropdown__history"
  }, popular.map((term, idx) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(HistoryItem, {
    key: idx,
    term: term,
    onClick: () => handleHistoryClick(term),
    onDelete: () => {}
  })))), showResults && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-dropdown__results"
  }, results.map(p => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(ProductCard, {
    key: p.id,
    product: p,
    onClick: handleProductClick
  }))), showSuggestions && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-dropdown__suggestions"
  }, suggestions.map((term, idx) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(SuggestionItem, {
    key: idx,
    term: term,
    onClick: () => handleSuggestionClick(term)
  }))), results.length > 0 && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
    href: viewAllUrl,
    className: "overseek-dropdown__view-all"
  }, "View all results \u2192")), showNoResults && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-dropdown__empty"
  }, i18n?.noResults || 'No products found'), showDidYouMean && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-dropdown__did-you-mean"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", null, i18n?.didYouMean || 'Did you mean:'), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    type: "button",
    onClick: () => handleDidYouMeanClick(didYouMean)
  }, didYouMean))));
}

// Mount the app into all available containers.
document.addEventListener('DOMContentLoaded', () => {
  const footerRoot = document.getElementById('overseek-search-root');
  const inlineContainers = document.querySelectorAll('[data-overseek-search="true"]');
  if (inlineContainers.length > 0) {
    inlineContainers.forEach(container => {
      const root = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createRoot)(container);
      root.render((0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(SearchErrorBoundary, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(SearchDropdown, null)));
    });
  } else if (footerRoot) {
    const root = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createRoot)(footerRoot);
    root.render((0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(SearchErrorBoundary, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(SearchDropdown, null)));
  }
});
})();

/******/ })()
;
//# sourceMappingURL=frontend.js.map