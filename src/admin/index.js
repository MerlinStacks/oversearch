/**
 * OverSeek Search - Admin App Entry Point
 * 
 * Mounts the React admin dashboard with Settings, Analytics, and Synonyms tabs.
 */

import { createRoot, useState, useEffect } from '@wordpress/element';
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
    __experimentalHeading as Heading,
} from '@wordpress/components';

import './admin.css';

// Configure API fetch with nonce.
apiFetch.use(apiFetch.createNonceMiddleware(window.overseekSearchAdmin?.nonce));

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
            setNotice({ type: 'success', message: window.overseekSearchAdmin.i18n.saved });
        } catch (error) {
            setNotice({ type: 'error', message: 'Failed to save settings' });
        }
        setSaving(false);
    };

    const handleReindex = async () => {
        setReindexing(true);
        setNotice({ type: 'info', message: 'Reindexing in progress...' });
        try {
            const response = await apiFetch({
                path: '/overseek-search/v1/reindex',
                method: 'POST',
            });
            setNotice({
                type: 'success',
                message: `Reindex complete! Indexed ${response.stats.indexed} products.`
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

            <Card className="overseek-card">
                <CardHeader>
                    <Heading level={3}>Index Status</Heading>
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
                        {reindexing ? window.overseekSearchAdmin.i18n.reindexing : window.overseekSearchAdmin.i18n.reindex}
                    </Button>
                </CardBody>
            </Card>

            <Card className="overseek-card">
                <CardHeader>
                    <Heading level={3}>Search Settings</Heading>
                </CardHeader>
                <CardBody>
                    <ToggleControl
                        label="Enable Fuzzy Matching (Typo Tolerance)"
                        checked={settings.fuzzy_enabled}
                        onChange={(value) => updateSetting('fuzzy_enabled', value)}
                    />
                    {settings.fuzzy_enabled && (
                        <RangeControl
                            label="Fuzzy Threshold (max typos allowed)"
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
                        help="Replace the default WooCommerce search bar with OverSeek's instant search"
                        checked={settings.replace_search !== false}
                        onChange={(value) => updateSetting('replace_search', value)}
                    />
                </CardBody>
            </Card>

            <Card className="overseek-card">
                <CardHeader>
                    <Heading level={3}>Relevance Weights</Heading>
                </CardHeader>
                <CardBody>
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
                </CardBody>
            </Card>

            <Button
                variant="primary"
                onClick={saveSettings}
                disabled={saving}
                isBusy={saving}
                className="overseek-save-button"
            >
                {window.overseekSearchAdmin.i18n.saveSettings}
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
                <label>Time Period: </label>
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
                        <Heading level={4}>Top Search Queries</Heading>
                    </CardHeader>
                    <CardBody>
                        {topQueries.length === 0 ? (
                            <p>No search data yet</p>
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

                <Card className="overseek-card">
                    <CardHeader>
                        <Heading level={4}>Queries With No Results</Heading>
                    </CardHeader>
                    <CardBody>
                        {noResults.length === 0 ? (
                            <p>All searches returned results! 🎉</p>
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
                                                    Add Synonym
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
            setNotice({ type: 'success', message: 'Synonym added!' });
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

            <Card className="overseek-card">
                <CardHeader>
                    <Heading level={3}>{window.overseekSearchAdmin.i18n.addSynonym}</Heading>
                </CardHeader>
                <CardBody>
                    <div className="overseek-synonym-form">
                        <TextControl
                            label={window.overseekSearchAdmin.i18n.baseTerm}
                            value={newBaseTerm}
                            onChange={setNewBaseTerm}
                            placeholder="e.g., sneakers"
                        />
                        <TextControl
                            label={window.overseekSearchAdmin.i18n.synonymsList}
                            value={newSynonyms}
                            onChange={setNewSynonyms}
                            placeholder="e.g., trainers, kicks, tennis shoes"
                        />
                        <ToggleControl
                            label={window.overseekSearchAdmin.i18n.oneWay}
                            help="If enabled, only the base term will expand to synonyms, not vice versa"
                            checked={newOneWay}
                            onChange={setNewOneWay}
                        />
                        <Button
                            variant="primary"
                            onClick={addSynonym}
                            disabled={saving}
                            isBusy={saving}
                        >
                            {window.overseekSearchAdmin.i18n.addSynonym}
                        </Button>
                    </div>
                </CardBody>
            </Card>

            <Card className="overseek-card">
                <CardHeader>
                    <Heading level={3}>Existing Synonyms</Heading>
                </CardHeader>
                <CardBody>
                    {synonyms.length === 0 ? (
                        <p>No synonyms configured yet</p>
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
                                        <td>{syn.one_way ? 'One-way' : 'Two-way'}</td>
                                        <td>
                                            <Button
                                                variant="link"
                                                isDestructive
                                                onClick={() => deleteSynonym(syn.id)}
                                            >
                                                {window.overseekSearchAdmin.i18n.delete}
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
    );
}

/**
 * Main Admin App Component
 */
function AdminApp() {
    const { currentTab, i18n } = window.overseekSearchAdmin;

    const tabs = [
        { name: 'settings', title: i18n.settings, className: 'overseek-tab' },
        { name: 'analytics', title: i18n.analytics, className: 'overseek-tab' },
        { name: 'synonyms', title: i18n.synonyms, className: 'overseek-tab' },
    ];

    const renderTab = (tabName) => {
        switch (tabName) {
            case 'settings':
                return <SettingsTab />;
            case 'analytics':
                return <AnalyticsTab />;
            case 'synonyms':
                return <SynonymsTab />;
            default:
                return <SettingsTab />;
        }
    };

    return (
        <div className="overseek-admin-app">
            <h1 className="overseek-admin-title">
                <span className="dashicons dashicons-search"></span>
                OverSeek Search
            </h1>
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
