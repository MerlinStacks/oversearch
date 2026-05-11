/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/admin/admin.css"
/*!*****************************!*\
  !*** ./src/admin/admin.css ***!
  \*****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ },

/***/ "@wordpress/api-fetch"
/*!**********************************!*\
  !*** external ["wp","apiFetch"] ***!
  \**********************************/
(module) {

module.exports = window["wp"]["apiFetch"];

/***/ },

/***/ "@wordpress/components"
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
(module) {

module.exports = window["wp"]["components"];

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
/*!****************************!*\
  !*** ./src/admin/index.js ***!
  \****************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _admin_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./admin.css */ "./src/admin/admin.css");

/**
 * OverSeek Search - Admin App Entry Point (2026 Edition)
 *
 * Neubrutalist dashboard with Settings, Analytics, Synonyms, and Boosts tabs.
 */






/* global confirm */

// Configure API fetch with nonce.
_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default().use(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default().createNonceMiddleware(window.overseekSearchAdmin?.nonce));

/**
 * Header Component
 */
function AdminHeader() {
  const {
    version
  } = window.overseekSearchAdmin;
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("header", {
    className: "overseek-header"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-brand"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-logo"
  }, "\uD83D\uDD0D"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h1", {
    className: "overseek-admin-title"
  }, "OverSeek Search", (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("small", null, "WooCommerce Search Engine"))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "overseek-version-badge"
  }, "v", version));
}

/**
 * Settings Tab Component
 */
function SettingsTab() {
  const [settings, setSettings] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [indexStats, setIndexStats] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [saving, setSaving] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [reindexing, setReindexing] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [notice, setNotice] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    loadSettings();
    loadIndexStats();
  }, []);
  const loadSettings = async () => {
    try {
      const response = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
        path: '/overseek-search/v1/settings'
      });
      setSettings(response.settings);
    } catch (error) {
      setNotice({
        type: 'error',
        message: 'Failed to load settings'
      });
    }
  };
  const loadIndexStats = async () => {
    try {
      const response = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
        path: '/overseek-search/v1/index-stats'
      });
      setIndexStats(response);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load index stats:', error);
    }
  };
  const saveSettings = async () => {
    setSaving(true);
    try {
      await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
        path: '/overseek-search/v1/settings',
        method: 'POST',
        data: settings
      });
      setNotice({
        type: 'success',
        message: '✓ Settings saved successfully!'
      });
    } catch (error) {
      setNotice({
        type: 'error',
        message: 'Failed to save settings'
      });
    }
    setSaving(false);
  };
  const handleReindex = async () => {
    setReindexing(true);
    setNotice({
      type: 'info',
      message: '⏳ Reindexing in progress...'
    });
    try {
      const response = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
        path: '/overseek-search/v1/reindex',
        method: 'POST'
      });
      setNotice({
        type: 'success',
        message: `✓ Indexed ${response.stats.indexed} products successfully!`
      });
      loadIndexStats();
    } catch (error) {
      setNotice({
        type: 'error',
        message: 'Reindex failed'
      });
    }
    setReindexing(false);
  };
  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  if (!settings) {
    return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Spinner, null);
  }
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-settings"
  }, notice && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Notice, {
    status: notice.type,
    onRemove: () => setNotice(null),
    isDismissible: true
  }, notice.message), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-bento-grid"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Card, {
    className: "overseek-card bento-full card-accent"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.CardHeader, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.__experimentalHeading, {
    level: 3
  }, "\u26A1 Index Status")), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.CardBody, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-index-stats"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "stat"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "stat-value"
  }, indexStats?.indexed_count || 0), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "stat-label"
  }, "Products Indexed")), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "stat"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "stat-value"
  }, indexStats?.total_products || 0), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "stat-label"
  }, "Total Products")), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "stat"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "stat-value"
  }, indexStats?.last_updated || 'Never'), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "stat-label"
  }, "Last Updated"))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
    variant: "secondary",
    onClick: handleReindex,
    disabled: reindexing,
    isBusy: reindexing
  }, reindexing ? '⏳ REINDEXING...' : '🔄 REBUILD INDEX'))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Card, {
    className: "overseek-card bento-half"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.CardHeader, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.__experimentalHeading, {
    level: 3
  }, "\uD83D\uDD27 Search Behavior")), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.CardBody, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
    label: "Enable Fuzzy Matching (Typo Tolerance)",
    checked: settings.fuzzy_enabled,
    onChange: value => updateSetting('fuzzy_enabled', value)
  }), settings.fuzzy_enabled && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.RangeControl, {
    label: "Fuzzy Threshold (max typos)",
    value: settings.fuzzy_threshold,
    onChange: value => updateSetting('fuzzy_threshold', value),
    min: 1,
    max: 3
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.RangeControl, {
    label: "Results Per Page",
    value: settings.results_per_page,
    onChange: value => updateSetting('results_per_page', value),
    min: 4,
    max: 20
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.RangeControl, {
    label: "Max Dropdown Results",
    help: "Number of products shown in the search dropdown",
    value: settings.max_dropdown_results || 5,
    onChange: value => updateSetting('max_dropdown_results', value),
    min: 1,
    max: 15
  }))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Card, {
    className: "overseek-card bento-half"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.CardHeader, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.__experimentalHeading, {
    level: 3
  }, "\u2728 Features")), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.CardBody, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
    label: "Highlight Matching Terms",
    checked: settings.highlight_matches,
    onChange: value => updateSetting('highlight_matches', value)
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
    label: "Enable Voice Search",
    checked: settings.voice_search,
    onChange: value => updateSetting('voice_search', value)
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
    label: "Track Search Analytics",
    checked: settings.track_analytics,
    onChange: value => updateSetting('track_analytics', value)
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
    label: "Replace WooCommerce Search",
    help: "Replace the default search bar with OverSeek",
    checked: settings.replace_search !== false,
    onChange: value => updateSetting('replace_search', value)
  }))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Card, {
    className: "overseek-card bento-full"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.CardHeader, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.__experimentalHeading, {
    level: 3
  }, "\u2696\uFE0F Relevance Weights")), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.CardBody, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '24px'
    }
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.RangeControl, {
    label: "Title Weight",
    value: settings.title_weight,
    onChange: value => updateSetting('title_weight', value),
    min: 1,
    max: 5
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.RangeControl, {
    label: "SKU Weight",
    value: settings.sku_weight,
    onChange: value => updateSetting('sku_weight', value),
    min: 1,
    max: 5
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.RangeControl, {
    label: "Description Weight",
    value: settings.description_weight,
    onChange: value => updateSetting('description_weight', value),
    min: 1,
    max: 5
  }))))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
    variant: "primary",
    onClick: saveSettings,
    disabled: saving,
    isBusy: saving,
    className: "overseek-save-button"
  }, saving ? '⏳ SAVING...' : '💾 SAVE SETTINGS'));
}

/**
 * Analytics Tab Component
 */
function AnalyticsTab() {
  const [summary, setSummary] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [topQueries, setTopQueries] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)([]);
  const [noResults, setNoResults] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)([]);
  const [days, setDays] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(30);
  const [loading, setLoading] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(true);
  const loadAnalytics = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)(async () => {
    setLoading(true);
    try {
      const [summaryRes, queriesRes, noResultsRes] = await Promise.all([_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
        path: `/overseek-search/v1/analytics/summary?days=${days}`
      }), _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
        path: `/overseek-search/v1/analytics/queries?days=${days}&limit=10`
      }), _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
        path: `/overseek-search/v1/analytics/no-results?days=${days}&limit=10`
      })]);
      setSummary(summaryRes);
      setTopQueries(queriesRes.queries);
      setNoResults(noResultsRes.queries);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load analytics:', error);
    }
    setLoading(false);
  }, [days]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    loadAnalytics();
  }, [loadAnalytics]);
  if (loading) {
    return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Spinner, null);
  }
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-analytics"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-date-filter"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("label", {
    htmlFor: "overseek-date-filter"
  }, "\uD83D\uDCC5 TIME PERIOD:"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("select", {
    id: "overseek-date-filter",
    value: days,
    onChange: e => setDays(Number(e.target.value))
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("option", {
    value: 7
  }, "Last 7 days"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("option", {
    value: 30
  }, "Last 30 days"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("option", {
    value: 90
  }, "Last 90 days"))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-kpi-grid"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "kpi-card"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "kpi-value"
  }, summary?.total_searches || 0), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "kpi-label"
  }, "Total Searches")), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "kpi-card"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "kpi-value"
  }, summary?.total_clicks || 0), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "kpi-label"
  }, "Product Clicks")), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "kpi-card"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "kpi-value"
  }, summary?.click_through_rate || 0, "%"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "kpi-label"
  }, "Click-Through Rate")), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "kpi-card"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "kpi-value"
  }, summary?.unique_visitors || 0), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "kpi-label"
  }, "Unique Visitors")), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "kpi-card"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "kpi-value"
  }, summary?.avg_results || 0), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "kpi-label"
  }, "Avg Results"))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-tables-grid"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Card, {
    className: "overseek-card"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.CardHeader, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.__experimentalHeading, {
    level: 4
  }, "\uD83D\uDD25 Top Search Queries")), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.CardBody, null, topQueries.length === 0 ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-empty-state"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "emoji"
  }, "\uD83D\uDCCA"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, "No search data yet. Searches will appear here.")) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("table", {
    className: "overseek-table"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("thead", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("tr", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("th", null, "Query"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("th", null, "Searches"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("th", null, "CTR"))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("tbody", null, topQueries.map((q, i) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("tr", {
    key: i
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("td", null, q.query), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("td", null, q.search_count), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("td", null, q.ctr, "%"))))))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Card, {
    className: "overseek-card card-warning"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.CardHeader, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.__experimentalHeading, {
    level: 4
  }, "\u26A0\uFE0F Queries With No Results")), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.CardBody, null, noResults.length === 0 ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-empty-state"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "emoji"
  }, "\uD83C\uDF89"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, "All searches returned results!")) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("table", {
    className: "overseek-table"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("thead", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("tr", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("th", null, "Query"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("th", null, "Count"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("th", null, "Action"))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("tbody", null, noResults.map((q, i) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("tr", {
    key: i
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("td", null, q.query), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("td", null, q.search_count), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("td", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
    variant: "link",
    href: `${window.overseekSearchAdmin.adminUrl}?page=overseek-search-synonyms&add=${encodeURIComponent(q.query)}`
  }, "+ Add Synonym"))))))))));
}

/**
 * Synonyms Tab Component
 */
function SynonymsTab() {
  const [synonyms, setSynonyms] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)([]);
  const [loading, setLoading] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(true);
  const [newBaseTerm, setNewBaseTerm] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('');
  const [newSynonyms, setNewSynonyms] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('');
  const [newOneWay, setNewOneWay] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [saving, setSaving] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [notice, setNotice] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    loadSynonyms();

    // Check URL for pre-fill.
    const params = new URLSearchParams(window.location.search);
    const addTerm = params.get('add');
    if (addTerm) {
      setNewBaseTerm(addTerm);
    }
  }, []);
  const loadSynonyms = async () => {
    try {
      const response = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
        path: '/overseek-search/v1/synonyms'
      });
      setSynonyms(response.synonyms);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load synonyms:', error);
    }
    setLoading(false);
  };
  const addSynonym = async () => {
    if (!newBaseTerm || !newSynonyms) {
      setNotice({
        type: 'error',
        message: 'Please fill in both fields'
      });
      return;
    }
    setSaving(true);
    try {
      await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
        path: '/overseek-search/v1/synonyms',
        method: 'POST',
        data: {
          base_term: newBaseTerm,
          synonyms: newSynonyms.split(',').map(s => s.trim()),
          one_way: newOneWay
        }
      });
      setNewBaseTerm('');
      setNewSynonyms('');
      setNewOneWay(false);
      loadSynonyms();
      setNotice({
        type: 'success',
        message: '✓ Synonym added!'
      });
    } catch (error) {
      setNotice({
        type: 'error',
        message: 'Failed to add synonym'
      });
    }
    setSaving(false);
  };
  const deleteSynonym = async id => {
    // eslint-disable-next-line no-alert
    if (!confirm('Delete this synonym group?')) {
      return;
    }
    try {
      await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
        path: `/overseek-search/v1/synonyms/${id}`,
        method: 'DELETE'
      });
      loadSynonyms();
    } catch (error) {
      setNotice({
        type: 'error',
        message: 'Failed to delete synonym'
      });
    }
  };
  if (loading) {
    return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Spinner, null);
  }
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-synonyms"
  }, notice && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Notice, {
    status: notice.type,
    onRemove: () => setNotice(null),
    isDismissible: true
  }, notice.message), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-bento-grid"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Card, {
    className: "overseek-card bento-half card-purple"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.CardHeader, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.__experimentalHeading, {
    level: 3
  }, "\u2795 Add New Synonym")), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.CardBody, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-synonym-form"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TextControl, {
    label: "Base Term",
    value: newBaseTerm,
    onChange: setNewBaseTerm,
    placeholder: "e.g., sneakers"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TextControl, {
    label: "Synonyms (comma separated)",
    value: newSynonyms,
    onChange: setNewSynonyms,
    placeholder: "e.g., trainers, kicks, tennis shoes"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
    label: "One-way only",
    help: "Base term expands to synonyms, but not vice versa",
    checked: newOneWay,
    onChange: setNewOneWay
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
    variant: "primary",
    onClick: addSynonym,
    disabled: saving,
    isBusy: saving
  }, saving ? '⏳ ADDING...' : '➕ ADD SYNONYM')))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Card, {
    className: "overseek-card bento-half"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.CardHeader, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.__experimentalHeading, {
    level: 3
  }, "\uD83D\uDCDA Existing Synonyms")), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.CardBody, null, synonyms.length === 0 ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-empty-state"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "emoji"
  }, "\uD83D\uDCDD"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, "No synonyms configured yet")) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("table", {
    className: "overseek-table"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("thead", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("tr", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("th", null, "Base Term"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("th", null, "Synonyms"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("th", null, "Type"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("th", null, "Actions"))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("tbody", null, synonyms.map(syn => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("tr", {
    key: syn.base_term
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("td", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("strong", null, syn.base_term)), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("td", null, syn.synonyms.join(', ')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("td", null, syn.one_way ? '→ One-way' : '↔ Two-way'), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("td", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
    variant: "link",
    isDestructive: true,
    onClick: () => deleteSynonym(syn.id)
  }, "\uD83D\uDDD1\uFE0F Delete"))))))))));
}

/**
 * Boosts Tab Component (NEW!)
 */
function BoostsTab() {
  const [boosts, setBoosts] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)([]);
  const [loading, setLoading] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(true);
  const [notice, setNotice] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [newProductId, setNewProductId] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('');
  const [newQuery, setNewQuery] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('');
  const [newType, setNewType] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('pin');
  const [newWeight, setNewWeight] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(1.5);
  const [saving, setSaving] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    loadBoosts();
  }, []);
  const loadBoosts = async () => {
    try {
      const response = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
        path: '/overseek-search/v1/boosts'
      });
      setBoosts(response.boosts || []);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load boosts:', error);
    }
    setLoading(false);
  };
  const addBoost = async () => {
    if (!newProductId) {
      setNotice({
        type: 'error',
        message: 'Please enter a product ID'
      });
      return;
    }
    setSaving(true);
    try {
      await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
        path: '/overseek-search/v1/boosts',
        method: 'POST',
        data: {
          product_id: parseInt(newProductId),
          query_pattern: newQuery || null,
          boost_type: newType,
          boost_weight: newWeight
        }
      });
      setNewProductId('');
      setNewQuery('');
      setNewType('pin');
      setNewWeight(1.5);
      loadBoosts();
      setNotice({
        type: 'success',
        message: '✓ Boost rule added!'
      });
    } catch (error) {
      setNotice({
        type: 'error',
        message: error.message || 'Failed to add boost'
      });
    }
    setSaving(false);
  };
  const deleteBoost = async id => {
    // eslint-disable-next-line no-alert
    if (!confirm('Delete this boost rule?')) {
      return;
    }
    try {
      await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
        path: `/overseek-search/v1/boosts/${id}`,
        method: 'DELETE'
      });
      loadBoosts();
    } catch (error) {
      setNotice({
        type: 'error',
        message: 'Failed to delete boost'
      });
    }
  };
  const toggleBoost = async (id, isActive) => {
    try {
      await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
        path: `/overseek-search/v1/boosts/${id}/toggle`,
        method: 'POST',
        data: {
          is_active: !isActive
        }
      });
      loadBoosts();
    } catch (error) {
      setNotice({
        type: 'error',
        message: 'Failed to toggle boost'
      });
    }
  };
  if (loading) {
    return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Spinner, null);
  }
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-boosts"
  }, notice && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Notice, {
    status: notice.type,
    onRemove: () => setNotice(null),
    isDismissible: true
  }, notice.message), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-bento-grid"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Card, {
    className: "overseek-card bento-half card-pink"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.CardHeader, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.__experimentalHeading, {
    level: 3
  }, "\uD83D\uDCCC Add Boost Rule")), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.CardBody, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-synonym-form"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TextControl, {
    label: "Product ID",
    type: "number",
    value: newProductId,
    onChange: setNewProductId,
    placeholder: "e.g., 1234",
    help: "The WooCommerce product ID to boost"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TextControl, {
    label: "Query Pattern (optional)",
    value: newQuery,
    onChange: setNewQuery,
    placeholder: "e.g., summer dress",
    help: "Leave empty for global boost on all searches"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
    label: "Boost Type",
    value: newType,
    onChange: setNewType,
    options: [{
      label: '📌 Pin to Top',
      value: 'pin'
    }, {
      label: '🚀 Boost Relevance',
      value: 'boost'
    }]
  }), newType === 'boost' && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.RangeControl, {
    label: "Boost Multiplier",
    value: newWeight,
    onChange: setNewWeight,
    min: 1.1,
    max: 5,
    step: 0.1
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
    variant: "primary",
    onClick: addBoost,
    disabled: saving,
    isBusy: saving
  }, saving ? '⏳ ADDING...' : '📌 ADD BOOST RULE')))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Card, {
    className: "overseek-card bento-half"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.CardHeader, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.__experimentalHeading, {
    level: 3
  }, "\uD83D\uDCCB Active Boost Rules")), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.CardBody, null, boosts.length === 0 ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-empty-state"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "emoji"
  }, "\uD83D\uDCCC"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, "No boost rules configured yet")) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("table", {
    className: "overseek-table"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("thead", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("tr", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("th", null, "Product"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("th", null, "Query"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("th", null, "Type"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("th", null, "Status"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("th", null, "Actions"))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("tbody", null, boosts.map(boost => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("tr", {
    key: boost.id,
    style: {
      opacity: boost.is_active ? 1 : 0.5
    }
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("td", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("strong", null, "#", boost.product_id), boost.product_name && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("br", null), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("small", null, boost.product_name))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("td", null, boost.query_pattern || (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("em", {
    style: {
      color: '#888'
    }
  }, "All queries")), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("td", null, boost.boost_type === 'pin' ? '📌 Pin' : `🚀 ×${boost.boost_weight}`), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("td", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
    variant: "link",
    onClick: () => toggleBoost(boost.id, boost.is_active)
  }, boost.is_active ? '✅ Active' : '⏸️ Paused')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("td", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
    variant: "link",
    isDestructive: true,
    onClick: () => deleteBoost(boost.id)
  }, "\uD83D\uDDD1\uFE0F"))))))))));
}

/**
 * Main Admin App Component
 */
function AdminApp() {
  const {
    currentTab
  } = window.overseekSearchAdmin;
  const tabs = [{
    name: 'settings',
    title: '⚙️ Settings',
    className: 'overseek-tab'
  }, {
    name: 'analytics',
    title: '📊 Analytics',
    className: 'overseek-tab'
  }, {
    name: 'synonyms',
    title: '🔗 Synonyms',
    className: 'overseek-tab'
  }, {
    name: 'boosts',
    title: '📌 Boosts',
    className: 'overseek-tab'
  }];
  const renderTab = tabName => {
    switch (tabName) {
      case 'settings':
        return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(SettingsTab, null);
      case 'analytics':
        return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(AnalyticsTab, null);
      case 'synonyms':
        return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(SynonymsTab, null);
      case 'boosts':
        return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(BoostsTab, null);
      default:
        return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(SettingsTab, null);
    }
  };
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "overseek-admin-app"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(AdminHeader, null), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TabPanel, {
    className: "overseek-tab-panel",
    activeClass: "is-active",
    initialTabName: currentTab,
    tabs: tabs
  }, tab => renderTab(tab.name)));
}

// Mount the app.
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('overseek-search-admin');
  if (container) {
    const root = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createRoot)(container);
    root.render((0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(AdminApp, null));
  }
});
})();

/******/ })()
;
//# sourceMappingURL=admin.js.map