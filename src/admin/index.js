/**
 * OverSeek Search - Admin App Entry Point (2026 Edition)
 * 
 * Neubrutalist dashboard with Settings, Analytics, Synonyms, and Boosts tabs.
 */

import { createRoot, useState, useEffect, useCallback } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import {
    TabPanel,
    Button,
    TextControl,
    ToggleControl,
    RangeControl,
    Notice,
    Spinner,
    Card,
    CardHeader,
    CardBody,
    SelectControl,
    __experimentalHeading as Heading,
} from '@wordpress/components';

import './admin.css';

// Configure API fetch with nonce.
apiFetch.use(apiFetch.createNonceMiddleware(window.overseekSearchAdmin?.nonce));

/**
 * Header Component
 */
function AdminHeader() {
    const { version } = window.overseekSearchAdmin;

    return (
        <header className="overseek-header">
            <div className="overseek-brand">
                <div className="overseek-logo">🔍</div>
                <h1 className="overseek-admin-title">
                    OverSeek Search
                    <small>WooCommerce Search Engine</small>
                </h1>
            </div>
            <span className="overseek-version-badge">v{version}</span>
        </header>
    );
}

/**
 * Settings Tab Component
 */
function SettingsTab() {
    const [settings, setSettings] = useState(null);
    const [indexStats, setIndexStats] = useState(null);
    const [saving, setSaving] = useState(false);
    const [reindexing, setReindexing] = useState(false);
    const [notice, setNotice] = useState(null);

    useEffect(() => {
        loadSettings();
        loadIndexStats();
    }, []);

    const loadSettings = async () => {
        try {
            const response = await apiFetch({ path: '/overseek-search/v1/settings' });
            setSettings(response.settings);
        } catch (error) {
            setNotice({ type: 'error', message: 'Failed to load settings' });
        }
    };

    const loadIndexStats = async () => {
        try {
            const response = await apiFetch({ path: '/overseek-search/v1/index-stats' });
            setIndexStats(response);
        } catch (error) {
            console.error('Failed to load index stats:', error);
        }
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            await apiFetch({
                path: '/overseek-search/v1/settings',
                method: 'POST',
                data: settings,
            });
            setNotice({ type: 'success', message: '✓ Settings saved successfully!' });
        } catch (error) {
            setNotice({ type: 'error', message: 'Failed to save settings' });
        }
        setSaving(false);
    };

    const handleReindex = async () => {
        setReindexing(true);
        setNotice({ type: 'info', message: '⏳ Reindexing in progress...' });
        try {
            const response = await apiFetch({
                path: '/overseek-search/v1/reindex',
                method: 'POST',
            });
            setNotice({
                type: 'success',
                message: `✓ Indexed ${response.stats.indexed} products successfully!`
            });
            loadIndexStats();
        } catch (error) {
            setNotice({ type: 'error', message: 'Reindex failed' });
        }
        setReindexing(false);
    };

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    if (!settings) {
        return <Spinner />;
    }

    return (
        <div className="overseek-settings">
            {notice && (
                <Notice
                    status={notice.type}
                    onRemove={() => setNotice(null)}
                    isDismissible
                >
                    {notice.message}
                </Notice>
            )}

            <div className="overseek-bento-grid">
                <Card className="overseek-card bento-full card-accent">
                    <CardHeader>
                        <Heading level={3}>⚡ Index Status</Heading>
                    </CardHeader>
                    <CardBody>
                        <div className="overseek-index-stats">
                            <div className="stat">
                                <span className="stat-value">{indexStats?.indexed_count || 0}</span>
                                <span className="stat-label">Products Indexed</span>
                            </div>
                            <div className="stat">
                                <span className="stat-value">{indexStats?.total_products || 0}</span>
                                <span className="stat-label">Total Products</span>
                            </div>
                            <div className="stat">
                                <span className="stat-value">{indexStats?.last_updated || 'Never'}</span>
                                <span className="stat-label">Last Updated</span>
                            </div>
                        </div>
                        <Button
                            variant="secondary"
                            onClick={handleReindex}
                            disabled={reindexing}
                            isBusy={reindexing}
                        >
                            {reindexing ? '⏳ REINDEXING...' : '🔄 REBUILD INDEX'}
                        </Button>
                    </CardBody>
                </Card>

                <Card className="overseek-card bento-half">
                    <CardHeader>
                        <Heading level={3}>🔧 Search Behavior</Heading>
                    </CardHeader>
                    <CardBody>
                        <ToggleControl
                            label="Enable Fuzzy Matching (Typo Tolerance)"
                            checked={settings.fuzzy_enabled}
                            onChange={(value) => updateSetting('fuzzy_enabled', value)}
                        />
                        {settings.fuzzy_enabled && (
                            <RangeControl
                                label="Fuzzy Threshold (max typos)"
                                value={settings.fuzzy_threshold}
                                onChange={(value) => updateSetting('fuzzy_threshold', value)}
                                min={1}
                                max={3}
                            />
                        )}
                        <RangeControl
                            label="Results Per Page"
                            value={settings.results_per_page}
                            onChange={(value) => updateSetting('results_per_page', value)}
                            min={4}
                            max={20}
                        />
                        <RangeControl
                            label="Max Dropdown Results"
                            help="Number of products shown in the search dropdown"
                            value={settings.max_dropdown_results || 5}
                            onChange={(value) => updateSetting('max_dropdown_results', value)}
                            min={1}
                            max={15}
                        />
                    </CardBody>
                </Card>

                <Card className="overseek-card bento-half">
                    <CardHeader>
                        <Heading level={3}>✨ Features</Heading>
                    </CardHeader>
                    <CardBody>
                        <ToggleControl
                            label="Highlight Matching Terms"
                            checked={settings.highlight_matches}
                            onChange={(value) => updateSetting('highlight_matches', value)}
                        />
                        <ToggleControl
                            label="Enable Voice Search"
                            checked={settings.voice_search}
                            onChange={(value) => updateSetting('voice_search', value)}
                        />
                        <ToggleControl
                            label="Track Search Analytics"
                            checked={settings.track_analytics}
                            onChange={(value) => updateSetting('track_analytics', value)}
                        />
                        <ToggleControl
                            label="Replace WooCommerce Search"
                            help="Replace the default search bar with OverSeek"
                            checked={settings.replace_search !== false}
                            onChange={(value) => updateSetting('replace_search', value)}
                        />
                    </CardBody>
                </Card>

                <Card className="overseek-card bento-full">
                    <CardHeader>
                        <Heading level={3}>⚖️ Relevance Weights</Heading>
                    </CardHeader>
                    <CardBody>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                            <RangeControl
                                label="Title Weight"
                                value={settings.title_weight}
                                onChange={(value) => updateSetting('title_weight', value)}
                                min={1}
                                max={5}
                            />
                            <RangeControl
                                label="SKU Weight"
                                value={settings.sku_weight}
                                onChange={(value) => updateSetting('sku_weight', value)}
                                min={1}
                                max={5}
                            />
                            <RangeControl
                                label="Description Weight"
                                value={settings.description_weight}
                                onChange={(value) => updateSetting('description_weight', value)}
                                min={1}
                                max={5}
                            />
                        </div>
                    </CardBody>
                </Card>
            </div>

            <Button
                variant="primary"
                onClick={saveSettings}
                disabled={saving}
                isBusy={saving}
                className="overseek-save-button"
            >
                {saving ? '⏳ SAVING...' : '💾 SAVE SETTINGS'}
            </Button>
        </div>
    );
}

/**
 * Analytics Tab Component
 */
function AnalyticsTab() {
    const [summary, setSummary] = useState(null);
    const [topQueries, setTopQueries] = useState([]);
    const [noResults, setNoResults] = useState([]);
    const [days, setDays] = useState(30);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, [days]);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            const [summaryRes, queriesRes, noResultsRes] = await Promise.all([
                apiFetch({ path: `/overseek-search/v1/analytics/summary?days=${days}` }),
                apiFetch({ path: `/overseek-search/v1/analytics/queries?days=${days}&limit=10` }),
                apiFetch({ path: `/overseek-search/v1/analytics/no-results?days=${days}&limit=10` }),
            ]);
            setSummary(summaryRes);
            setTopQueries(queriesRes.queries);
            setNoResults(noResultsRes.queries);
        } catch (error) {
            console.error('Failed to load analytics:', error);
        }
        setLoading(false);
    };

    if (loading) {
        return <Spinner />;
    }

    return (
        <div className="overseek-analytics">
            <div className="overseek-date-filter">
                <label>📅 TIME PERIOD:</label>
                <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
                    <option value={7}>Last 7 days</option>
                    <option value={30}>Last 30 days</option>
                    <option value={90}>Last 90 days</option>
                </select>
            </div>

            <div className="overseek-kpi-grid">
                <div className="kpi-card">
                    <span className="kpi-value">{summary?.total_searches || 0}</span>
                    <span className="kpi-label">Total Searches</span>
                </div>
                <div className="kpi-card">
                    <span className="kpi-value">{summary?.total_clicks || 0}</span>
                    <span className="kpi-label">Product Clicks</span>
                </div>
                <div className="kpi-card">
                    <span className="kpi-value">{summary?.click_through_rate || 0}%</span>
                    <span className="kpi-label">Click-Through Rate</span>
                </div>
                <div className="kpi-card">
                    <span className="kpi-value">{summary?.unique_visitors || 0}</span>
                    <span className="kpi-label">Unique Visitors</span>
                </div>
                <div className="kpi-card">
                    <span className="kpi-value">{summary?.avg_results || 0}</span>
                    <span className="kpi-label">Avg Results</span>
                </div>
            </div>

            <div className="overseek-tables-grid">
                <Card className="overseek-card">
                    <CardHeader>
                        <Heading level={4}>🔥 Top Search Queries</Heading>
                    </CardHeader>
                    <CardBody>
                        {topQueries.length === 0 ? (
                            <div className="overseek-empty-state">
                                <span className="emoji">📊</span>
                                <p>No search data yet. Searches will appear here.</p>
                            </div>
                        ) : (
                            <table className="overseek-table">
                                <thead>
                                    <tr>
                                        <th>Query</th>
                                        <th>Searches</th>
                                        <th>CTR</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topQueries.map((q, i) => (
                                        <tr key={i}>
                                            <td>{q.query}</td>
                                            <td>{q.search_count}</td>
                                            <td>{q.ctr}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardBody>
                </Card>

                <Card className="overseek-card card-warning">
                    <CardHeader>
                        <Heading level={4}>⚠️ Queries With No Results</Heading>
                    </CardHeader>
                    <CardBody>
                        {noResults.length === 0 ? (
                            <div className="overseek-empty-state">
                                <span className="emoji">🎉</span>
                                <p>All searches returned results!</p>
                            </div>
                        ) : (
                            <table className="overseek-table">
                                <thead>
                                    <tr>
                                        <th>Query</th>
                                        <th>Count</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {noResults.map((q, i) => (
                                        <tr key={i}>
                                            <td>{q.query}</td>
                                            <td>{q.search_count}</td>
                                            <td>
                                                <Button
                                                    variant="link"
                                                    href={`${window.overseekSearchAdmin.adminUrl}?page=overseek-search-synonyms&add=${encodeURIComponent(q.query)}`}
                                                >
                                                    + Add Synonym
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}

/**
 * Synonyms Tab Component
 */
function SynonymsTab() {
    const [synonyms, setSynonyms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newBaseTerm, setNewBaseTerm] = useState('');
    const [newSynonyms, setNewSynonyms] = useState('');
    const [newOneWay, setNewOneWay] = useState(false);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState(null);

    useEffect(() => {
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
            const response = await apiFetch({ path: '/overseek-search/v1/synonyms' });
            setSynonyms(response.synonyms);
        } catch (error) {
            console.error('Failed to load synonyms:', error);
        }
        setLoading(false);
    };

    const addSynonym = async () => {
        if (!newBaseTerm || !newSynonyms) {
            setNotice({ type: 'error', message: 'Please fill in both fields' });
            return;
        }

        setSaving(true);
        try {
            await apiFetch({
                path: '/overseek-search/v1/synonyms',
                method: 'POST',
                data: {
                    base_term: newBaseTerm,
                    synonyms: newSynonyms.split(',').map(s => s.trim()),
                    one_way: newOneWay,
                },
            });
            setNewBaseTerm('');
            setNewSynonyms('');
            setNewOneWay(false);
            loadSynonyms();
            setNotice({ type: 'success', message: '✓ Synonym added!' });
        } catch (error) {
            setNotice({ type: 'error', message: 'Failed to add synonym' });
        }
        setSaving(false);
    };

    const deleteSynonym = async (id) => {
        if (!confirm('Delete this synonym group?')) return;

        try {
            await apiFetch({
                path: `/overseek-search/v1/synonyms/${id}`,
                method: 'DELETE',
            });
            loadSynonyms();
        } catch (error) {
            setNotice({ type: 'error', message: 'Failed to delete synonym' });
        }
    };

    if (loading) {
        return <Spinner />;
    }

    return (
        <div className="overseek-synonyms">
            {notice && (
                <Notice
                    status={notice.type}
                    onRemove={() => setNotice(null)}
                    isDismissible
                >
                    {notice.message}
                </Notice>
            )}

            <div className="overseek-bento-grid">
                <Card className="overseek-card bento-half card-purple">
                    <CardHeader>
                        <Heading level={3}>➕ Add New Synonym</Heading>
                    </CardHeader>
                    <CardBody>
                        <div className="overseek-synonym-form">
                            <TextControl
                                label="Base Term"
                                value={newBaseTerm}
                                onChange={setNewBaseTerm}
                                placeholder="e.g., sneakers"
                            />
                            <TextControl
                                label="Synonyms (comma separated)"
                                value={newSynonyms}
                                onChange={setNewSynonyms}
                                placeholder="e.g., trainers, kicks, tennis shoes"
                            />
                            <ToggleControl
                                label="One-way only"
                                help="Base term expands to synonyms, but not vice versa"
                                checked={newOneWay}
                                onChange={setNewOneWay}
                            />
                            <Button
                                variant="primary"
                                onClick={addSynonym}
                                disabled={saving}
                                isBusy={saving}
                            >
                                {saving ? '⏳ ADDING...' : '➕ ADD SYNONYM'}
                            </Button>
                        </div>
                    </CardBody>
                </Card>

                <Card className="overseek-card bento-half">
                    <CardHeader>
                        <Heading level={3}>📚 Existing Synonyms</Heading>
                    </CardHeader>
                    <CardBody>
                        {synonyms.length === 0 ? (
                            <div className="overseek-empty-state">
                                <span className="emoji">📝</span>
                                <p>No synonyms configured yet</p>
                            </div>
                        ) : (
                            <table className="overseek-table">
                                <thead>
                                    <tr>
                                        <th>Base Term</th>
                                        <th>Synonyms</th>
                                        <th>Type</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {synonyms.map((syn) => (
                                        <tr key={syn.base_term}>
                                            <td><strong>{syn.base_term}</strong></td>
                                            <td>{syn.synonyms.join(', ')}</td>
                                            <td>{syn.one_way ? '→ One-way' : '↔ Two-way'}</td>
                                            <td>
                                                <Button
                                                    variant="link"
                                                    isDestructive
                                                    onClick={() => deleteSynonym(syn.id)}
                                                >
                                                    🗑️ Delete
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}

/**
 * Boosts Tab Component (NEW!)
 */
function BoostsTab() {
    const [boosts, setBoosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notice, setNotice] = useState(null);
    const [newProductId, setNewProductId] = useState('');
    const [newQuery, setNewQuery] = useState('');
    const [newType, setNewType] = useState('pin');
    const [newWeight, setNewWeight] = useState(1.5);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadBoosts();
    }, []);

    const loadBoosts = async () => {
        try {
            const response = await apiFetch({ path: '/overseek-search/v1/boosts' });
            setBoosts(response.boosts || []);
        } catch (error) {
            console.error('Failed to load boosts:', error);
        }
        setLoading(false);
    };

    const addBoost = async () => {
        if (!newProductId) {
            setNotice({ type: 'error', message: 'Please enter a product ID' });
            return;
        }

        setSaving(true);
        try {
            await apiFetch({
                path: '/overseek-search/v1/boosts',
                method: 'POST',
                data: {
                    product_id: parseInt(newProductId),
                    query_pattern: newQuery || null,
                    boost_type: newType,
                    boost_weight: newWeight,
                },
            });
            setNewProductId('');
            setNewQuery('');
            setNewType('pin');
            setNewWeight(1.5);
            loadBoosts();
            setNotice({ type: 'success', message: '✓ Boost rule added!' });
        } catch (error) {
            setNotice({ type: 'error', message: error.message || 'Failed to add boost' });
        }
        setSaving(false);
    };

    const deleteBoost = async (id) => {
        if (!confirm('Delete this boost rule?')) return;

        try {
            await apiFetch({
                path: `/overseek-search/v1/boosts/${id}`,
                method: 'DELETE',
            });
            loadBoosts();
        } catch (error) {
            setNotice({ type: 'error', message: 'Failed to delete boost' });
        }
    };

    const toggleBoost = async (id, isActive) => {
        try {
            await apiFetch({
                path: `/overseek-search/v1/boosts/${id}/toggle`,
                method: 'POST',
                data: { is_active: !isActive },
            });
            loadBoosts();
        } catch (error) {
            setNotice({ type: 'error', message: 'Failed to toggle boost' });
        }
    };

    if (loading) {
        return <Spinner />;
    }

    return (
        <div className="overseek-boosts">
            {notice && (
                <Notice
                    status={notice.type}
                    onRemove={() => setNotice(null)}
                    isDismissible
                >
                    {notice.message}
                </Notice>
            )}

            <div className="overseek-bento-grid">
                <Card className="overseek-card bento-half card-pink">
                    <CardHeader>
                        <Heading level={3}>📌 Add Boost Rule</Heading>
                    </CardHeader>
                    <CardBody>
                        <div className="overseek-synonym-form">
                            <TextControl
                                label="Product ID"
                                type="number"
                                value={newProductId}
                                onChange={setNewProductId}
                                placeholder="e.g., 1234"
                                help="The WooCommerce product ID to boost"
                            />
                            <TextControl
                                label="Query Pattern (optional)"
                                value={newQuery}
                                onChange={setNewQuery}
                                placeholder="e.g., summer dress"
                                help="Leave empty for global boost on all searches"
                            />
                            <SelectControl
                                label="Boost Type"
                                value={newType}
                                onChange={setNewType}
                                options={[
                                    { label: '📌 Pin to Top', value: 'pin' },
                                    { label: '🚀 Boost Relevance', value: 'boost' },
                                ]}
                            />
                            {newType === 'boost' && (
                                <RangeControl
                                    label="Boost Multiplier"
                                    value={newWeight}
                                    onChange={setNewWeight}
                                    min={1.1}
                                    max={5}
                                    step={0.1}
                                />
                            )}
                            <Button
                                variant="primary"
                                onClick={addBoost}
                                disabled={saving}
                                isBusy={saving}
                            >
                                {saving ? '⏳ ADDING...' : '📌 ADD BOOST RULE'}
                            </Button>
                        </div>
                    </CardBody>
                </Card>

                <Card className="overseek-card bento-half">
                    <CardHeader>
                        <Heading level={3}>📋 Active Boost Rules</Heading>
                    </CardHeader>
                    <CardBody>
                        {boosts.length === 0 ? (
                            <div className="overseek-empty-state">
                                <span className="emoji">📌</span>
                                <p>No boost rules configured yet</p>
                            </div>
                        ) : (
                            <table className="overseek-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Query</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {boosts.map((boost) => (
                                        <tr key={boost.id} style={{ opacity: boost.is_active ? 1 : 0.5 }}>
                                            <td>
                                                <strong>#{boost.product_id}</strong>
                                                {boost.product_name && <><br /><small>{boost.product_name}</small></>}
                                            </td>
                                            <td>{boost.query_pattern || <em style={{ color: '#888' }}>All queries</em>}</td>
                                            <td>{boost.boost_type === 'pin' ? '📌 Pin' : `🚀 ×${boost.boost_weight}`}</td>
                                            <td>
                                                <Button
                                                    variant="link"
                                                    onClick={() => toggleBoost(boost.id, boost.is_active)}
                                                >
                                                    {boost.is_active ? '✅ Active' : '⏸️ Paused'}
                                                </Button>
                                            </td>
                                            <td>
                                                <Button
                                                    variant="link"
                                                    isDestructive
                                                    onClick={() => deleteBoost(boost.id)}
                                                >
                                                    🗑️
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}

/**
 * Main Admin App Component
 */
function AdminApp() {
    const { currentTab, i18n } = window.overseekSearchAdmin;

    const tabs = [
        { name: 'settings', title: '⚙️ Settings', className: 'overseek-tab' },
        { name: 'analytics', title: '📊 Analytics', className: 'overseek-tab' },
        { name: 'synonyms', title: '🔗 Synonyms', className: 'overseek-tab' },
        { name: 'boosts', title: '📌 Boosts', className: 'overseek-tab' },
    ];

    const renderTab = (tabName) => {
        switch (tabName) {
            case 'settings':
                return <SettingsTab />;
            case 'analytics':
                return <AnalyticsTab />;
            case 'synonyms':
                return <SynonymsTab />;
            case 'boosts':
                return <BoostsTab />;
            default:
                return <SettingsTab />;
        }
    };

    return (
        <div className="overseek-admin-app">
            <AdminHeader />
            <TabPanel
                className="overseek-tab-panel"
                activeClass="is-active"
                initialTabName={currentTab}
                tabs={tabs}
            >
                {(tab) => renderTab(tab.name)}
            </TabPanel>
        </div>
    );
}

// Mount the app.
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('overseek-search-admin');
    if (container) {
        const root = createRoot(container);
        root.render(<AdminApp />);
    }
});
