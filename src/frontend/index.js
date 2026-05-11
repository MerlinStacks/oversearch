/**
 * OverSeek Search - Frontend App Entry Point
 *
 * Dropdown-style instant search with history, suggestions, and caching.
 */

/* Did you mean styling is in frontend.css */
/* global localStorage, sessionStorage */

import {
	createRoot,
	useState,
	useEffect,
	useCallback,
	useRef,
	Component,
} from '@wordpress/element';
import './frontend.css';

const { apiUrl, maxDropdownResults, initialQuery, i18n } =
	window.overseekSearch || {};

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
class SearchErrorBoundary extends Component {
	constructor( props ) {
		super( props );
		this.state = { hasError: false };
	}

	static getDerivedStateFromError( /* error */ ) {
		return { hasError: true };
	}

	componentDidCatch( error, errorInfo ) {
		// eslint-disable-next-line no-console
		console.error( 'OverSeek Search error:', error, errorInfo );
	}

	render() {
		if ( this.state.hasError ) {
			return (
				<div className="overseek-search-wrapper">
					<div className="overseek-search-error">
						<p>
							{ i18n?.noResults ||
								'Something went wrong. Please refresh the page.' }
						</p>
					</div>
				</div>
			);
		}
		return this.props.children;
	}
}

function removeFromHistory( term ) {
	try {
		const history = getHistory().filter( ( h ) => h !== term );
		localStorage.setItem( HISTORY_KEY, JSON.stringify( history ) );
	} catch ( e ) {
		/* ignore */
	}
}

function clearHistory() {
	try {
		localStorage.removeItem( HISTORY_KEY );
	} catch ( e ) {
		/* ignore */
	}
}

function getHistory() {
	try {
		return JSON.parse( localStorage.getItem( HISTORY_KEY ) || '[]' );
	} catch ( e ) {
		return [];
	}
}

function getRecentProducts() {
	try {
		return JSON.parse( localStorage.getItem( RECENT_KEY ) || '[]' );
	} catch {
		return [];
	}
}

function saveRecentProduct( product ) {
	try {
		const recent = getRecentProducts().filter(
			( p ) => p.id !== product.id
		);
		recent.unshift( {
			id: product.id,
			title: product.title_raw || product.title,
			price: product.price,
			image_url: product.image_url,
			url: product.url,
		} );
		localStorage.setItem(
			RECENT_KEY,
			JSON.stringify( recent.slice( 0, MAX_RECENT ) )
		);
	} catch ( e ) {
		/* ignore */
	}
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function useDebounce( value, delay ) {
	const [ debouncedValue, setDebouncedValue ] = useState( value );

	useEffect( () => {
		const handler = setTimeout( () => {
			setDebouncedValue( value );
		}, delay );
		return () => {
			clearTimeout( handler );
		};
	}, [ value, delay ] );

	return debouncedValue;
}

function formatPrice( price ) {
	if ( price === null || price === undefined || price === '' ) {
		return '';
	}

	const numericPrice = Number( price );
	if ( Number.isNaN( numericPrice ) ) {
		return '';
	}

	return new Intl.NumberFormat( undefined, {
		style: 'currency',
		currency: 'USD',
	} ).format( numericPrice );
}

function saveToHistory( term ) {
	if ( ! term || term.trim().length < 2 ) {
		return;
	}
	try {
		const history = getHistory().filter( ( h ) => h !== term );
		history.unshift( term );
		localStorage.setItem(
			HISTORY_KEY,
			JSON.stringify( history.slice( 0, 10 ) )
		);
	} catch ( e ) {
		/* ignore */
	}
}

// ============================================
// CACHING HELPERS (sessionStorage)
// ============================================

function getCachedResults( query ) {
	try {
		const key = CACHE_KEY_PREFIX + query.toLowerCase();
		const cached = sessionStorage.getItem( key );
		if ( ! cached ) {
			return null;
		}

		const { data, timestamp } = JSON.parse( cached );
		if ( Date.now() - timestamp > CACHE_TTL_MS ) {
			sessionStorage.removeItem( key );
			return null;
		}
		return data;
	} catch {
		return null;
	}
}

function setCachedResults( query, data ) {
	try {
		const key = CACHE_KEY_PREFIX + query.toLowerCase();
		sessionStorage.setItem(
			key,
			JSON.stringify( { data, timestamp: Date.now() } )
		);
	} catch ( e ) {
		/* ignore */
	}
}

// ============================================
// SVG ICONS
// ============================================

function SearchIcon( { size = 20 } ) {
	return (
		<svg
			viewBox="0 0 24 24"
			width={ size }
			height={ size }
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		>
			<circle cx="11" cy="11" r="8" />
			<path d="M21 21l-4.35-4.35" />
		</svg>
	);
}

function CloseIcon( { size = 14 } ) {
	return (
		<svg
			viewBox="0 0 24 24"
			width={ size }
			height={ size }
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		>
			<path d="M18 6L6 18M6 6l12 12" />
		</svg>
	);
}

// ============================================
// VOICE SEARCH COMPONENT
// ============================================

function VoiceSearch( { onResult, disabled } ) {
	const [ listening, setListening ] = useState( false );
	const [ supported, setSupported ] = useState( false );
	const recognitionRef = useRef( null );

	useEffect( () => {
		const SpeechRecognition =
			window.SpeechRecognition || window.webkitSpeechRecognition;
		if ( SpeechRecognition ) {
			setSupported( true );
			recognitionRef.current = new SpeechRecognition();
			recognitionRef.current.continuous = false;
			recognitionRef.current.interimResults = false;
			recognitionRef.current.lang =
				document.documentElement.lang || 'en-US';

			recognitionRef.current.onresult = ( event ) => {
				onResult( event.results[ 0 ][ 0 ].transcript );
				setListening( false );
			};
			recognitionRef.current.onerror = () => setListening( false );
			recognitionRef.current.onend = () => setListening( false );
		}
		return () => recognitionRef.current?.abort();
	}, [ onResult ] );

	const toggle = () => {
		if ( ! recognitionRef.current ) {
			return;
		}
		if ( listening ) {
			recognitionRef.current.abort();
			setListening( false );
		} else {
			recognitionRef.current.start();
			setListening( true );
		}
	};

	if ( ! supported ) {
		return null;
	}

	return (
		<button
			type="button"
			className={ `overseek-voice-btn ${
				listening ? 'is-listening' : ''
			}` }
			onClick={ toggle }
			disabled={ disabled }
			title="Voice search"
		>
			<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
				<path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 1.93c-3.94-.49-7-3.85-7-7.93h2c0 3.31 2.69 6 6 6s6-2.69 6-6h2c0 4.08-3.06 7.44-7 7.93V19h4v2H8v-2h4v-3.07z" />
			</svg>
			{ listening && <span className="overseek-voice-pulse" /> }
		</button>
	);
}

// ============================================
// PRODUCT CARD COMPONENT
// ============================================

function ProductCard( { product, onClick } ) {
	const productUrl = product.url || product.permalink || '#';

	const handleClick = ( e ) => {
		if ( ! productUrl || '#' === productUrl ) {
			e.preventDefault();
			return;
		}

		saveRecentProduct( product );
		onClick?.();
		window.location.assign( productUrl );
		e.preventDefault();
	};

	return (
		<a
			href={ productUrl }
			className="overseek-dropdown__product"
			onClick={ handleClick }
		>
			{ product.image_url && (
				<img
					src={ product.image_url }
					alt=""
					className="overseek-dropdown__product-image"
					loading="lazy"
				/>
			) }
			{ ! product.image_url && (
				<div
					className="overseek-dropdown__product-image overseek-dropdown__product-image--placeholder"
					aria-hidden="true"
				>
					<ProductImagePlaceholderIcon />
				</div>
			) }
			<div className="overseek-dropdown__product-info">
				<span
					className="overseek-dropdown__product-title"
					dangerouslySetInnerHTML={ { __html: product.title } }
				/>
				<span className="overseek-dropdown__product-price">
					{ formatPrice( product.sale_price || product.price ) }
				</span>
			</div>
		</a>
	);
}

function ProductImagePlaceholderIcon() {
	return (
		<svg viewBox="0 0 24 24" width="20" height="20" fill="none">
			<rect
				x="3"
				y="4"
				width="18"
				height="16"
				rx="2"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
			<circle cx="9" cy="10" r="1.4" fill="currentColor" />
			<path
				d="M6 17l4.3-4.4a1 1 0 011.44 0L14 15l1.9-1.9a1 1 0 011.42 0L19 14.8V18H6z"
				fill="currentColor"
			/>
		</svg>
	);
}

// ============================================
// HISTORY ITEM COMPONENT
// ============================================

function HistoryItem( { term, onClick, onDelete } ) {
	return (
		<div className="overseek-dropdown__history-item">
			<button
				type="button"
				className="overseek-dropdown__history-btn"
				onClick={ onClick }
			>
				<SearchIcon size={ 16 } />
				<span>{ term }</span>
			</button>
			<button
				type="button"
				className="overseek-dropdown__history-delete"
				onClick={ onDelete }
				title="Remove"
			>
				<CloseIcon size={ 12 } />
			</button>
		</div>
	);
}

// ============================================
// RECENT PRODUCT ITEM
// ============================================

function RecentProductItem( { product } ) {
	return (
		<a href={ product.url } className="overseek-dropdown__recent-item">
			{ product.image_url && (
				<img
					src={ product.image_url }
					alt=""
					className="overseek-dropdown__recent-image"
				/>
			) }
			<span className="overseek-dropdown__recent-title">
				{ product.title }
			</span>
		</a>
	);
}

// ============================================
// SUGGESTION ITEM
// ============================================

function SuggestionItem( { term, onClick } ) {
	return (
		<button
			type="button"
			className="overseek-dropdown__suggestion"
			onClick={ onClick }
		>
			<SearchIcon size={ 14 } />
			<span>{ term }</span>
		</button>
	);
}

// ============================================
// MAIN SEARCH DROPDOWN COMPONENT
// ============================================

function SearchDropdown() {
	const [ query, setQuery ] = useState( '' );
	const [ results, setResults ] = useState( [] );
	const [ suggestions, setSuggestions ] = useState( [] );
	const [ popular, setPopular ] = useState( [] );
	const [ loading, setLoading ] = useState( false );
	const [ isOpen, setIsOpen ] = useState( false );
	const [ history, setHistory ] = useState( [] );
	const [ recentProducts, setRecentProducts ] = useState( [] );
	const [ isMobile, setIsMobile ] = useState( false );
	const [ didYouMean, setDidYouMean ] = useState( null );

	const [ activeIndex, setActiveIndex ] = useState( -1 );

	const inputRef = useRef( null );
	const dropdownRef = useRef( null );
	const debouncedQuery = useDebounce( query, 300 );
	const maxResults = maxDropdownResults || 5;
	const searchPlaceholder =
		i18n?.searchPlaceholder || 'Search for products...';
	const searchHistoryLabel = i18n?.recentSearches || 'Your search history';
	const clearLabel = i18n?.clear || 'Clear';
	const noResultsLabel = i18n?.noResults || 'No products found';
	const didYouMeanLabel = i18n?.didYouMean || 'Did you mean:';
	const mobileViewAllLabel = 'View all results';
	const desktopViewAllLabel = 'View all results →';

	// Check for mobile.
	useEffect( () => {
		const check = () => setIsMobile( window.innerWidth < 768 );
		check();
		window.addEventListener( 'resize', check );
		return () => window.removeEventListener( 'resize', check );
	}, [] );

	// Load history, recent products, and popular searches on mount.
	useEffect( () => {
		setHistory( getHistory() );
		setRecentProducts( getRecentProducts() );

		// Fetch popular searches.
		fetch( `${ apiUrl }/popular?limit=5` )
			.then( ( r ) => r.json() )
			.then( ( data ) => setPopular( data.popular || [] ) )
			.catch( () => {} );
	}, [] );

	// Handle initial query from URL.
	useEffect( () => {
		if ( initialQuery && initialQuery.length >= 2 ) {
			setQuery( initialQuery );
			setIsOpen( true );
		}
	}, [] );

	// Perform search when debounced query changes.
	useEffect( () => {
		if ( debouncedQuery.length >= 2 ) {
			performSearch();
			fetchSuggestions();
		} else {
			setResults( [] );
			setSuggestions( [] );
		}
	}, [ debouncedQuery, fetchSuggestions, performSearch ] );

	// Close dropdown when clicking outside.
	useEffect( () => {
		const handleClick = ( e ) => {
			if (
				dropdownRef.current &&
				! dropdownRef.current.contains( e.target )
			) {
				setIsOpen( false );
			}
		};
		document.addEventListener( 'mousedown', handleClick );
		return () => document.removeEventListener( 'mousedown', handleClick );
	}, [] );

	// Keyboard navigation inside dropdown.
	useEffect( () => {
		if ( ! isOpen ) {
			return;
		}

		const selectable =
			dropdownRef.current?.querySelectorAll( '[role="option"]' );
		if ( ! selectable || selectable.length === 0 ) {
			return;
		}

		const handleKey = ( e ) => {
			if (
				[ 'ArrowDown', 'ArrowUp', 'Enter', 'Tab', 'Escape' ].includes(
					e.key
				)
			) {
				e.preventDefault();
			}

			if ( e.key === 'Escape' ) {
				setIsOpen( false );
				inputRef.current?.focus();
				return;
			}

			if ( e.key === 'ArrowDown' ) {
				setActiveIndex( ( prev ) => ( prev + 1 ) % selectable.length );
				selectable[ ( activeIndex + 1 ) % selectable.length ]?.focus();
				return;
			}

			if ( e.key === 'ArrowUp' ) {
				setActiveIndex(
					( prev ) =>
						( prev - 1 + selectable.length ) % selectable.length
				);
				selectable[
					( activeIndex - 1 + selectable.length ) % selectable.length
				]?.focus();
				return;
			}

			if ( e.key === 'Enter' ) {
				// eslint-disable-next-line @wordpress/no-global-active-element
				const focused = document.activeElement;
				if ( focused && focused.tagName === 'A' ) {
					window.location.href = focused.href;
				} else if ( focused && focused.click ) {
					focused.click();
				}
				return;
			}

			if ( e.key === 'Tab' ) {
				// Allow tab to leave the dropdown naturally.
				setIsOpen( false );
			}
		};

		const dropdownElement = dropdownRef.current;
		dropdownElement?.addEventListener( 'keydown', handleKey );
		return () =>
			dropdownElement?.removeEventListener( 'keydown', handleKey );
	}, [ isOpen, activeIndex ] );

	// Bind to PHP-rendered triggers.
	useEffect( () => {
		const triggers = document.querySelectorAll(
			'.overseek-search-trigger'
		);
		const handleClick = ( e ) => {
			e.preventDefault();
			setIsOpen( true );
			setTimeout( () => inputRef.current?.focus(), 100 );
		};
		triggers.forEach( ( t ) => t.addEventListener( 'click', handleClick ) );
		return () =>
			triggers.forEach( ( t ) =>
				t.removeEventListener( 'click', handleClick )
			);
	}, [] );

	const abortControllerRef = useRef( null );

	const performSearch = useCallback( async () => {
		// Cancel previous request if still pending.
		if ( abortControllerRef.current ) {
			abortControllerRef.current.abort();
		}
		const abortController = new AbortController();
		abortControllerRef.current = abortController;

		// Check cache first.
		const cached = getCachedResults( debouncedQuery );
		if ( cached ) {
			setResults( cached.results || [] );
			setDidYouMean( cached.did_you_mean || null );
			return;
		}

		setLoading( true );
		setDidYouMean( null );
		try {
			const params = new URLSearchParams( {
				q: debouncedQuery,
				per_page: maxResults,
			} );
			const response = await fetch( `${ apiUrl }/search?${ params }`, {
				signal: abortController.signal,
			} );
			const data = await response.json();

			setResults( data.results || [] );
			setDidYouMean( data.did_you_mean || null );
			setCachedResults( debouncedQuery, data );

			if ( data.results?.length > 0 ) {
				saveToHistory( debouncedQuery );
				setHistory( getHistory() );
			}
		} catch ( err ) {
			if ( err.name !== 'AbortError' ) {
				// eslint-disable-next-line no-console
				console.error( 'Search error:', err );
				setResults( [] );
				setDidYouMean( null );
			}
		}
		setLoading( false );
	}, [ debouncedQuery, maxResults ] );

	const fetchSuggestions = useCallback( async () => {
		if ( abortControllerRef.current ) {
			abortControllerRef.current.abort();
		}
		const abortController = new AbortController();
		abortControllerRef.current = abortController;

		try {
			const params = new URLSearchParams( {
				q: debouncedQuery,
				limit: 5,
			} );
			const response = await fetch( `${ apiUrl }/suggest?${ params }`, {
				signal: abortController.signal,
			} );
			const data = await response.json();
			// Filter out exact matches to query.
			const filtered = ( data.suggestions || [] ).filter(
				( s ) => s.toLowerCase() !== debouncedQuery.toLowerCase()
			);
			setSuggestions( filtered );
		} catch ( err ) {
			if ( err.name !== 'AbortError' ) {
				setSuggestions( [] );
			}
		}
	}, [ debouncedQuery ] );

	const handleInputFocus = () => setIsOpen( true );
	const handleHistoryClick = ( term ) => {
		setQuery( term );
		inputRef.current?.focus();
	};
	const handleHistoryDelete = ( term ) => {
		removeFromHistory( term );
		setHistory( getHistory() );
	};
	const handleClearHistory = () => {
		clearHistory();
		setHistory( [] );
	};
	const handleProductClick = () => setIsOpen( false );
	const handleSuggestionClick = ( term ) => {
		setQuery( term );
		inputRef.current?.focus();
	};
	const handleDidYouMeanClick = ( term ) => {
		setQuery( term );
		setDidYouMean( null );
		inputRef.current?.focus();
	};

	const showHistory = isOpen && query.length < 2 && history.length > 0;
	const showPopular =
		isOpen &&
		query.length < 2 &&
		history.length === 0 &&
		popular.length > 0;
	const showRecent = isOpen && query.length < 2 && recentProducts.length > 0;
	const showResults = isOpen && query.length >= 2;
	const showSuggestions = showResults && suggestions.length > 0;
	const showNoResults = showResults && ! loading && results.length === 0;
	const showDidYouMean =
		showResults && ! loading && didYouMean && results.length <= 3;
	const showDropdown =
		showHistory || showPopular || showRecent || showResults;

	const viewAllUrl = `/?s=${ encodeURIComponent( query ) }&post_type=product`;

	const renderDropdownContent = ( viewAllLabel ) => (
		<>
			{ showRecent && (
				<div className="overseek-dropdown__section">
					<div className="overseek-dropdown__section-header">
						<span>Recently Viewed</span>
					</div>
					<div className="overseek-dropdown__recent">
						{ recentProducts.map( ( p ) => (
							<RecentProductItem key={ p.id } product={ p } />
						) ) }
					</div>
				</div>
			) }

			{ showHistory && (
				<div className="overseek-dropdown__section">
					<div className="overseek-dropdown__section-header">
						<span>{ searchHistoryLabel }</span>
						<button type="button" onClick={ handleClearHistory }>
							{ clearLabel }
						</button>
					</div>
					<div className="overseek-dropdown__history">
						{ history.map( ( term ) => (
							<HistoryItem
								key={ term }
								term={ term }
								onClick={ () => handleHistoryClick( term ) }
								onDelete={ () => handleHistoryDelete( term ) }
							/>
						) ) }
					</div>
				</div>
			) }

			{ showPopular && (
				<div className="overseek-dropdown__section">
					<div className="overseek-dropdown__section-header">
						<span>Popular Searches</span>
					</div>
					<div className="overseek-dropdown__history">
						{ popular.map( ( term ) => (
							<HistoryItem
								key={ term }
								term={ term }
								onClick={ () => handleHistoryClick( term ) }
								onDelete={ () => {} }
							/>
						) ) }
					</div>
				</div>
			) }

			{ showResults && (
				<>
					<div className="overseek-dropdown__results">
						{ results.map( ( p ) => (
							<ProductCard
								key={ p.id }
								product={ p }
								onClick={ handleProductClick }
							/>
						) ) }
					</div>
					{ showSuggestions && (
						<div className="overseek-dropdown__suggestions">
							{ suggestions.map( ( term ) => (
								<SuggestionItem
									key={ term }
									term={ term }
									onClick={ () =>
										handleSuggestionClick( term )
									}
								/>
							) ) }
						</div>
					) }
					{ results.length > 0 && (
						<a
							href={ viewAllUrl }
							className="overseek-dropdown__view-all"
						>
							{ viewAllLabel }
						</a>
					) }
				</>
			) }

			{ showNoResults && (
				<div className="overseek-dropdown__empty">
					{ noResultsLabel }
				</div>
			) }
			{ showDidYouMean && (
				<div className="overseek-dropdown__did-you-mean">
					<span>{ didYouMeanLabel }</span>
					<button
						type="button"
						onClick={ () => handleDidYouMeanClick( didYouMean ) }
					>
						{ didYouMean }
					</button>
				</div>
			) }
		</>
	);

	// ============================================
	// MOBILE MODAL
	// ============================================
	if ( isMobile && isOpen ) {
		return (
			<div className="overseek-mobile-overlay">
				<div className="overseek-mobile-modal" ref={ dropdownRef }>
					<div className="overseek-mobile-header">
						<div className="overseek-mobile-input-wrapper">
							<SearchIcon size={ 20 } />
							<input
								ref={ inputRef }
								type="text"
								className="overseek-mobile-input"
								placeholder={ searchPlaceholder }
								value={ query }
								onChange={ ( e ) => setQuery( e.target.value ) }
								// eslint-disable-next-line jsx-a11y/no-autofocus
								autoFocus
								autoComplete="off"
							/>
							{ loading && <div className="overseek-spinner" /> }
							<VoiceSearch
								onResult={ setQuery }
								disabled={ loading }
							/>
						</div>
						<button
							type="button"
							className="overseek-mobile-close"
							onClick={ () => setIsOpen( false ) }
						>
							✕
						</button>
					</div>
					<div className="overseek-mobile-body">
						{ renderDropdownContent( mobileViewAllLabel ) }
					</div>
				</div>
			</div>
		);
	}

	// ============================================
	// DESKTOP DROPDOWN
	// ============================================
	return (
		<div className="overseek-search-wrapper" ref={ dropdownRef }>
			<div className="overseek-search-input-container">
				<SearchIcon size={ 20 } />
				<input
					ref={ inputRef }
					type="text"
					className="overseek-search-input"
					placeholder={ searchPlaceholder }
					value={ query }
					onChange={ ( e ) => setQuery( e.target.value ) }
					onFocus={ handleInputFocus }
					autoComplete="off"
				/>
				{ loading && <div className="overseek-spinner" /> }
				<VoiceSearch onResult={ setQuery } disabled={ loading } />
			</div>

			{ showDropdown && (
				<div className="overseek-dropdown">
					{ renderDropdownContent( desktopViewAllLabel ) }
				</div>
			) }
		</div>
	);
}

// Mount the app into all available containers.
document.addEventListener( 'DOMContentLoaded', () => {
	const footerRoot = document.getElementById( 'overseek-search-root' );
	const inlineContainers = document.querySelectorAll(
		'[data-overseek-search="true"]'
	);

	if ( inlineContainers.length > 0 ) {
		inlineContainers.forEach( ( container ) => {
			const root = createRoot( container );
			root.render(
				<SearchErrorBoundary>
					<SearchDropdown />
				</SearchErrorBoundary>
			);
		} );
	} else if ( footerRoot ) {
		const root = createRoot( footerRoot );
		root.render(
			<SearchErrorBoundary>
				<SearchDropdown />
			</SearchErrorBoundary>
		);
	}
} );
