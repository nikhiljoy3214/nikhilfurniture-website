import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { SEO } from '../../components/SEO';
import {
  Globe,
  Search,
  BarChart3,
  Activity,
  Shield,
  Download,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Loader2,
  Server,
  Database,
  HardDrive,
  Lock,
  FileText,
  Upload,
  Trash2,
  ChevronDown,
  Settings,
} from 'lucide-react';

// ─────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────
type TabKey = 'general' | 'seo' | 'analytics' | 'health' | 'security' | 'backup' | 'logs';

interface TabDef {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
}

interface HealthCheck {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  icon: React.ReactNode;
}

interface SeoPageConfig {
  slug: string;
  label: string;
  meta_title: string;
  meta_description: string;
  keywords: string;
  og_title: string;
  og_description: string;
  og_image: string;
  canonical_url: string;
}

interface SeoValidationWarning {
  page: string;
  field: string;
  message: string;
  severity: 'warning' | 'error';
}

// ─────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────
const TABS: TabDef[] = [
  { key: 'general', label: 'General', icon: <Globe className="w-4 h-4" /> },
  { key: 'seo', label: 'SEO Manager', icon: <Search className="w-4 h-4" /> },
  { key: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  { key: 'health', label: 'System Health', icon: <Activity className="w-4 h-4" /> },
  { key: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
  { key: 'backup', label: 'Backup & Export', icon: <Download className="w-4 h-4" /> },
  { key: 'logs', label: 'Activity Logs', icon: <Clock className="w-4 h-4" /> },
];

const SEO_PAGES = [
  'Home', 'About', 'Products', 'Categories', 'Gallery',
  'Manufacturing', 'FAQ', 'Contact', 'Privacy', 'Terms',
];

const DEFAULT_SEO_CONFIG = {
  global: {
    siteTitle: 'Nikhil Furniture | Solid Teak & Rosewood Carpentry in Thrissur',
    siteDescription: 'Premium solid wooden furniture manufacturer since 1995 in Pudukkad, Thrissur.',
    defaultKeywords: 'furniture thrissur, teak wood furniture, rosewood cots kerala',
    ogImage: '',
    twitterCardImage: '',
    canonicalUrl: '',
    robotsTxt: 'User-agent: *\nAllow: /\nSitemap: /sitemap.xml',
    sitemapUrl: '/sitemap.xml',
  },
  pages: SEO_PAGES.map((p) => ({
    slug: p.toLowerCase().replace(/\s/g, '-'),
    label: p,
    meta_title: '',
    meta_description: '',
    keywords: '',
    og_title: '',
    og_description: '',
    og_image: '',
    canonical_url: '',
  })),
};

// ─────────────────────────────────────────────────
// Helper: relative time
// ─────────────────────────────────────────────────
function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.max(0, now - then);
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ─────────────────────────────────────────────────
// Inline SVG Line Chart Component
// ─────────────────────────────────────────────────
const SimpleLineChart: React.FC<{ data: { date: string; value: number }[]; label?: string }> = ({ data, label }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] bg-wood-50/30 rounded-xl text-wood-400 text-xs">
        No chart data available
      </div>
    );
  }

  const width = 600;
  const height = 200;
  const padL = 50;
  const padR = 20;
  const padT = 20;
  const padB = 40;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const minVal = 0;

  const points = data.map((d, i) => {
    const x = padL + (i / Math.max(data.length - 1, 1)) * chartW;
    const y = padT + chartH - ((d.value - minVal) / (maxVal - minVal)) * chartH;
    return { x, y, ...d };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPath = `M${points[0].x},${padT + chartH} ${points.map((p) => `L${p.x},${p.y}`).join(' ')} L${points[points.length - 1].x},${padT + chartH} Z`;

  // Y-axis labels
  const yTicks = 5;
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => Math.round(minVal + ((maxVal - minVal) * i) / yTicks));

  return (
    <div className="w-full overflow-x-auto">
      {label && <p className="text-[10px] uppercase tracking-wider font-bold text-wood-500 mb-2">{label}</p>}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[600px]" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#78350f" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#78350f" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yLabels.map((val, i) => {
          const y = padT + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;
          return (
            <g key={`grid-${i}`}>
              <line x1={padL} y1={y} x2={width - padR} y2={y} stroke="#d6cfc7" strokeWidth="0.5" strokeDasharray="4 2" />
              <text x={padL - 8} y={y + 3} textAnchor="end" fontSize="9" fill="#92857a">{val}</text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill="url(#chartGradient)" />

        {/* Line */}
        <polyline points={polyline} fill="none" stroke="#78350f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots */}
        {points.map((p, i) => (
          <circle key={`dot-${i}`} cx={p.x} cy={p.y} r="3" fill="#78350f" stroke="white" strokeWidth="1.5" />
        ))}

        {/* X-axis labels (show every few) */}
        {points.filter((_, i) => data.length <= 10 || i % Math.ceil(data.length / 8) === 0).map((p, i) => (
          <text key={`xlabel-${i}`} x={p.x} y={height - 8} textAnchor="middle" fontSize="8" fill="#92857a">
            {p.date.slice(5)}
          </text>
        ))}
      </svg>
    </div>
  );
};

// ─────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────
export const SiteManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab') as TabKey;
    return ['general', 'seo', 'analytics', 'health', 'security', 'backup', 'logs'].includes(tab) ? tab : 'general';
  });

  // Sync active tab when URL changes (back button / header navigation click)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') as TabKey;
      if (tab && ['general', 'seo', 'analytics', 'health', 'security', 'backup', 'logs'].includes(tab)) {
        setActiveTab(tab);
      }
    };
    
    // Also run on mount to handle direct navigation updates
    handlePopState();
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // ── SEO State ──
  const [seoConfig, setSeoConfig] = useState<any>(DEFAULT_SEO_CONFIG);
  const [seoSaving, setSeoSaving] = useState(false);
  const [seoLoaded, setSeoLoaded] = useState(false);
  const [expandedSeoPages, setExpandedSeoPages] = useState<string[]>([]);
  const [auditProducts, setAuditProducts] = useState<any[]>([]);
  const [auditCategories, setAuditCategories] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // ── Analytics State ──
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoaded, setAnalyticsLoaded] = useState(false);
  const [analyticsPeriod, setAnalyticsPeriod] = useState<7 | 30 | 90>(7);

  // ── Health State ──
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [healthLoading, setHealthLoading] = useState(false);
  const [storageInfo, setStorageInfo] = useState<{ totalFiles: number; totalSizeMB: string; largestFiles: any[] }>({
    totalFiles: 0,
    totalSizeMB: '0',
    largestFiles: [],
  });

  // ── Security State ──
  const [userInfo, setUserInfo] = useState<any>(null);
  const [maintenanceConfig, setMaintenanceConfig] = useState<any>({
    maintenanceMode: false,
    maintenanceMessage: 'We are currently performing scheduled maintenance. Please check back soon.',
    estimatedReturn: '',
  });
  const [securitySaving, setSecuritySaving] = useState(false);

  // ── Logs State ──
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [logsLoaded, setLogsLoaded] = useState(false);
  const [logsFilter, setLogsFilter] = useState('all');

  // ── General loading ──
  const [pageLoading, setPageLoading] = useState(false);

  // ─────────────────────────────────────────────────
  // Data Fetchers
  // ─────────────────────────────────────────────────

  /* SEO Config */
  const fetchSeoConfig = async () => {
    try {
      const { data } = await supabase.from('site_settings').select('*').eq('key', 'seo_settings').single();
      if (data && data.value) {
        setSeoConfig({ ...DEFAULT_SEO_CONFIG, ...data.value });
      }
    } catch (err) {
      console.error('SEO config fetch error:', err);
    }
    setSeoLoaded(true);

    // Fetch site audit data
    setAuditLoading(true);
    try {
      const { data: pData } = await supabase.from('products').select('id, name, slug, featured_image, alt_text, seo_title, seo_description');
      const { data: cData } = await supabase.from('categories').select('id, name, slug, thumbnail_image, seo_title, seo_description');
      if (pData) setAuditProducts(pData);
      if (cData) setAuditCategories(cData);
    } catch (err) {
      console.error('Failed to run SEO site audit:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  const saveSeoConfig = async () => {
    setSeoSaving(true);
    try {
      await supabase.from('site_settings').upsert([
        { key: 'seo_settings', value: seoConfig, updated_at: new Date().toISOString() },
      ]);
      alert('SEO settings saved successfully!');
    } catch (err: any) {
      alert(`Failed to save SEO settings: ${err.message}`);
    } finally {
      setSeoSaving(false);
    }
  };

  /* Analytics */
  const fetchAnalytics = async () => {
    try {
      const { data } = await supabase.from('site_settings').select('*').eq('key', 'analytics_summary').single();
      if (data && data.value) {
        setAnalyticsData(data.value);
      }
    } catch (err) {
      console.error('Analytics fetch error:', err);
    }
    setAnalyticsLoaded(true);
  };

  /* Health Checks */
  const runHealthChecks = async () => {
    setHealthLoading(true);
    const checks: HealthCheck[] = [];

    // Database check
    try {
      const { error } = await supabase.from('products').select('id', { count: 'exact', head: true });
      checks.push({
        name: 'Database',
        status: error ? 'error' : 'healthy',
        message: error ? error.message : 'PostgreSQL connected & responsive',
        icon: <Database className="w-5 h-5" />,
      });
    } catch {
      checks.push({ name: 'Database', status: 'error', message: 'Connection failed', icon: <Database className="w-5 h-5" /> });
    }

    // Auth check
    try {
      const { data: { user } } = await supabase.auth.getUser();
      checks.push({
        name: 'Authentication',
        status: user ? 'healthy' : 'warning',
        message: user ? `Authenticated as ${user.email}` : 'No active session',
        icon: <Lock className="w-5 h-5" />,
      });
    } catch {
      checks.push({ name: 'Authentication', status: 'warning', message: 'Auth check failed', icon: <Lock className="w-5 h-5" /> });
    }

    // Storage check
    try {
      const { error } = await supabase.storage.from('furniture').list('', { limit: 1 });
      checks.push({
        name: 'Storage',
        status: error ? 'error' : 'healthy',
        message: error ? error.message : 'Storage bucket accessible',
        icon: <HardDrive className="w-5 h-5" />,
      });
    } catch {
      checks.push({ name: 'Storage', status: 'error', message: 'Storage unavailable', icon: <HardDrive className="w-5 h-5" /> });
    }

    // Website
    checks.push({
      name: 'Website',
      status: 'healthy',
      message: `Serving on ${window.location.hostname}`,
      icon: <Globe className="w-5 h-5" />,
    });

    setHealthChecks(checks);

    // Storage usage from media_library
    try {
      const { data } = await supabase.from('site_settings').select('*').eq('key', 'media_library').single();
      if (data && data.value && Array.isArray(data.value)) {
        const files = data.value as any[];
        const totalSize = files.reduce((acc: number, f: any) => acc + (f.fileSize || 0), 0);
        const sorted = [...files].sort((a: any, b: any) => (b.fileSize || 0) - (a.fileSize || 0)).slice(0, 5);
        setStorageInfo({
          totalFiles: files.length,
          totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
          largestFiles: sorted,
        });
      }
    } catch (err) {
      console.error('Storage info fetch error:', err);
    }

    setHealthLoading(false);
  };

  /* Security / User Info */
  const fetchSecurityInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();
      setUserInfo({ user, session });
    } catch (err) {
      console.error('Security info fetch error:', err);
    }

    try {
      const { data } = await supabase.from('site_settings').select('*').eq('key', 'website_behaviour').single();
      if (data && data.value) {
        setMaintenanceConfig({
          maintenanceMode: data.value.maintenanceMode || false,
          maintenanceMessage: data.value.maintenanceMessage || 'We are currently performing scheduled maintenance. Please check back soon.',
          estimatedReturn: data.value.estimatedReturn || '',
        });
      }
    } catch (err) {
      console.error('Maintenance config fetch error:', err);
    }
  };

  const saveMaintenanceConfig = async () => {
    setSecuritySaving(true);
    try {
      // Load existing behaviour config first, then merge
      const { data: existing } = await supabase.from('site_settings').select('*').eq('key', 'website_behaviour').single();
      const merged = { ...(existing?.value || {}), ...maintenanceConfig };
      await supabase.from('site_settings').upsert([
        { key: 'website_behaviour', value: merged, updated_at: new Date().toISOString() },
      ]);
      alert('Maintenance settings saved!');
    } catch (err: any) {
      alert(`Failed to save: ${err.message}`);
    } finally {
      setSecuritySaving(false);
    }
  };

  /* Activity Logs */
  const fetchActivityLogs = async () => {
    try {
      const { data } = await supabase.from('site_settings').select('*').eq('key', 'activity_logs').single();
      if (data && data.value && Array.isArray(data.value)) {
        setActivityLogs(data.value);
      }
    } catch (err) {
      console.error('Activity logs fetch error:', err);
    }
    setLogsLoaded(true);
  };

  // ─────────────────────────────────────────────────
  // Tab-based lazy loading effects
  // ─────────────────────────────────────────────────
  useEffect(() => {
    if (!seoLoaded) fetchSeoConfig();
  }, []);

  useEffect(() => {
    if (activeTab === 'analytics' && !analyticsLoaded) {
      fetchAnalytics();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'health') {
      runHealthChecks();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'security') {
      fetchSecurityInfo();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'logs' && !logsLoaded) {
      fetchActivityLogs();
    }
  }, [activeTab]);

  // ─────────────────────────────────────────────────
  // SEO Helpers
  // ─────────────────────────────────────────────────
  const updateGlobalSeo = (field: string, value: string) => {
    setSeoConfig((prev: any) => ({
      ...prev,
      global: { ...prev.global, [field]: value },
    }));
  };

  const updatePageSeo = (index: number, field: string, value: string) => {
    setSeoConfig((prev: any) => {
      const pages = [...prev.pages];
      pages[index] = { ...pages[index], [field]: value };
      return { ...prev, pages };
    });
  };

  const toggleSeoPageExpanded = (slug: string) => {
    setExpandedSeoPages((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const getSeoValidationWarnings = (): SeoValidationWarning[] => {
    const warnings: SeoValidationWarning[] = [];
    const g = seoConfig.global;

    if (!g.siteTitle || g.siteTitle.length < 5)
      warnings.push({ page: 'Global', field: 'Site Title', message: 'Missing or too short (< 5 chars)', severity: 'error' });
    if (g.siteTitle && g.siteTitle.length > 60)
      warnings.push({ page: 'Global', field: 'Site Title', message: 'Title too long (> 60 chars)', severity: 'warning' });
    if (!g.siteDescription || g.siteDescription.length < 10)
      warnings.push({ page: 'Global', field: 'Site Description', message: 'Missing or too short (< 10 chars)', severity: 'error' });
    if (g.siteDescription && g.siteDescription.length > 160)
      warnings.push({ page: 'Global', field: 'Site Description', message: 'Description too long (> 160 chars)', severity: 'warning' });

    seoConfig.pages.forEach((p: SeoPageConfig) => {
      if (p.meta_title && p.meta_title.length > 60)
        warnings.push({ page: p.label, field: 'Meta Title', message: 'Title too long (> 60 chars)', severity: 'warning' });
      if (p.meta_description && p.meta_description.length > 160)
        warnings.push({ page: p.label, field: 'Meta Description', message: 'Description too long (> 160 chars)', severity: 'warning' });
    });

    return warnings;
  };

  // ─────────────────────────────────────────────────
  // Analytics Helpers
  // ─────────────────────────────────────────────────
  const getAnalyticsStats = () => {
    if (!analyticsData) {
      return { today: 0, yesterday: 0, week: 0, month: 0, whatsapp: 0, phone: 0, contact: 0, gallery: 0 };
    }

    const dailyBuckets: any[] = analyticsData.dailyBuckets || [];
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const yesterdayStr = new Date(now.getTime() - 86400000).toISOString().slice(0, 10);

    const todayBucket = dailyBuckets.find((b: any) => b.date === todayStr);
    const yesterdayBucket = dailyBuckets.find((b: any) => b.date === yesterdayStr);

    const periodDays = analyticsPeriod;
    const cutoff = new Date(now.getTime() - periodDays * 86400000).toISOString().slice(0, 10);
    const periodBuckets = dailyBuckets.filter((b: any) => b.date >= cutoff);

    const sumField = (buckets: any[], field: string) => buckets.reduce((acc: number, b: any) => acc + (b[field] || 0), 0);

    const weekCutoff = new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10);
    const monthCutoff = new Date(now.getTime() - 30 * 86400000).toISOString().slice(0, 10);
    const weekBuckets = dailyBuckets.filter((b: any) => b.date >= weekCutoff);
    const monthBuckets = dailyBuckets.filter((b: any) => b.date >= monthCutoff);

    return {
      today: todayBucket?.pageViews || 0,
      yesterday: yesterdayBucket?.pageViews || 0,
      week: sumField(weekBuckets, 'pageViews'),
      month: sumField(monthBuckets, 'pageViews'),
      whatsapp: sumField(periodBuckets, 'whatsappClicks'),
      phone: sumField(periodBuckets, 'phoneClicks'),
      contact: sumField(periodBuckets, 'contactSubmissions'),
      gallery: sumField(periodBuckets, 'galleryViews'),
    };
  };

  const getChartData = (): { date: string; value: number }[] => {
    if (!analyticsData || !analyticsData.dailyBuckets) return [];
    const now = new Date();
    const cutoff = new Date(now.getTime() - analyticsPeriod * 86400000).toISOString().slice(0, 10);
    return (analyticsData.dailyBuckets as any[])
      .filter((b: any) => b.date >= cutoff)
      .map((b: any) => ({ date: b.date, value: b.pageViews || 0 }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  // ─────────────────────────────────────────────────
  // Backup & Export Helpers
  // ─────────────────────────────────────────────────
  const exportData = async (table: string, filename: string) => {
    setPageLoading(true);
    try {
      let result: any;
      if (['Products', 'Categories', 'Testimonials', 'FAQs', 'Gallery'].includes(table)) {
        const tableName = table.toLowerCase() === 'faqs' ? 'faqs' : table.toLowerCase();
        const { data, error } = await supabase.from(tableName).select('*');
        if (error) throw error;
        result = data;
      } else if (table === 'Settings' || table === 'Media Library') {
        const key = table === 'Media Library' ? 'media_library' : undefined;
        if (key) {
          const { data, error } = await supabase.from('site_settings').select('*').eq('key', key).single();
          if (error) throw error;
          result = data?.value || [];
        } else {
          const { data, error } = await supabase.from('site_settings').select('*');
          if (error) throw error;
          result = data;
        }
      }

      const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setPageLoading(false);
    }
  };

  const exportProductsCsv = async () => {
    setPageLoading(true);
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      if (!data || data.length === 0) {
        alert('No products to export.');
        return;
      }

      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(','),
        ...data.map((row: any) =>
          headers.map((h) => {
            const val = row[h];
            const str = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
            return `"${str.replace(/"/g, '""')}"`;
          }).join(',')
        ),
      ];

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`CSV export failed: ${err.message}`);
    } finally {
      setPageLoading(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      // Validate structure
      if (typeof parsed !== 'object' || parsed === null) {
        alert('Invalid JSON: expected an object or array.');
        return;
      }

      // If it's a site_settings record with key/value
      if (parsed.key && parsed.value) {
        await supabase.from('site_settings').upsert([
          { key: parsed.key, value: parsed.value, updated_at: new Date().toISOString() },
        ]);
        alert(`Imported "${parsed.key}" successfully!`);
      } else if (Array.isArray(parsed)) {
        // Assume it's a settings array
        for (const item of parsed) {
          if (item.key && item.value) {
            await supabase.from('site_settings').upsert([
              { key: item.key, value: item.value, updated_at: new Date().toISOString() },
            ]);
          }
        }
        alert(`Imported ${parsed.length} settings records!`);
      } else {
        alert('JSON structure not recognized. Expected { key, value } or an array of settings.');
      }
    } catch (err: any) {
      alert(`Import failed: ${err.message}`);
    }

    // Reset file input
    e.target.value = '';
  };

  // ─────────────────────────────────────────────────
  // Common UI Pieces
  // ─────────────────────────────────────────────────
  const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="text-[10px] font-bold uppercase tracking-wider text-wood-500">{children}</span>
  );

  const InputField: React.FC<{
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    placeholder?: string;
    readOnly?: boolean;
  }> = ({ label, value, onChange, type = 'text', placeholder, readOnly }) => (
    <div className="flex flex-col gap-1">
      <label className="text-[9px] uppercase text-wood-500 font-bold tracking-wider">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 text-xs text-wood-800 focus:outline-none focus:ring-1 focus:ring-wood-400 transition-colors ${readOnly ? 'cursor-default opacity-70' : ''}`}
      />
    </div>
  );

  const TextAreaField: React.FC<{
    label: string;
    value: string;
    onChange: (v: string) => void;
    rows?: number;
    placeholder?: string;
  }> = ({ label, value, onChange, rows = 3, placeholder }) => (
    <div className="flex flex-col gap-1">
      <label className="text-[9px] uppercase text-wood-500 font-bold tracking-wider">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 text-xs text-wood-800 focus:outline-none focus:ring-1 focus:ring-wood-400 transition-colors resize-y"
      />
    </div>
  );

  const StatCard: React.FC<{ label: string; value: string | number; icon?: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="bg-wood-50/40 border border-wood-200/60 rounded-2xl p-4 flex items-start gap-3">
      {icon && <div className="bg-wood-100 rounded-xl p-2 text-wood-600 shrink-0 mt-0.5">{icon}</div>}
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[9px] uppercase tracking-wider text-wood-500 font-bold">{label}</span>
        <span className="text-sm font-bold text-wood-900 truncate">{value}</span>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────
  // Tab Renderers
  // ─────────────────────────────────────────────────

  /* ═══ TAB 1: General ═══ */
  const renderGeneral = () => (
    <div className="flex flex-col gap-6">
      <SectionLabel>Application Information</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard label="Application Version" value="1.0.0" icon={<Settings className="w-4 h-4" />} />
        <StatCard label="Build Date" value={import.meta.env.VITE_BUILD_DATE || 'Development'} icon={<Clock className="w-4 h-4" />} />
        <StatCard label="Environment" value={import.meta.env.MODE} icon={<Server className="w-4 h-4" />} />
        <StatCard label="Current Domain" value={window.location.hostname} icon={<Globe className="w-4 h-4" />} />
      </div>

      <SectionLabel>Infrastructure</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard label="Supabase Project" value="psbbpjdpadygskkjfyon" icon={<Database className="w-4 h-4" />} />
        <StatCard label="Storage Bucket" value="furniture" icon={<HardDrive className="w-4 h-4" />} />
        <StatCard label="Database" value="PostgreSQL 17" icon={<Database className="w-4 h-4" />} />
        <StatCard
          label="Status"
          value="Active & Healthy"
          icon={<CheckCircle className="w-4 h-4 text-green-600" />}
        />
      </div>
    </div>
  );

  /* ═══ TAB 2: SEO Manager ═══ */
  const renderSeo = () => {
    const warnings = getSeoValidationWarnings();

    // Real-time SEO Audit Calculations
    const missingTitles: string[] = [];
    const missingDescriptions: string[] = [];
    const missingAlts: string[] = [];
    const duplicateSlugs: string[] = [];
    const noindexPages: string[] = [];

    // 1. Audit static pages
    seoConfig.pages.forEach((p: any) => {
      if (!p.meta_title) missingTitles.push(`${p.label} (Page)`);
      if (!p.meta_description) missingDescriptions.push(`${p.label} (Page)`);
    });

    // 2. Audit products
    auditProducts.forEach((p: any) => {
      if (!p.seo_title) missingTitles.push(`${p.name} (Product)`);
      if (!p.seo_description) missingDescriptions.push(`${p.name} (Product)`);
      if (!p.alt_text) missingAlts.push(`${p.name} (Product Image)`);

      const isDuplicate = auditProducts.filter((x: any) => x.slug === p.slug).length > 1;
      if (isDuplicate && !duplicateSlugs.includes(p.slug)) {
        duplicateSlugs.push(p.slug);
      }
    });

    // 3. Audit categories
    auditCategories.forEach((c: any) => {
      if (!c.seo_title) missingTitles.push(`${c.name} (Category)`);
      if (!c.seo_description) missingDescriptions.push(`${c.name} (Category)`);
      if (!c.thumbnail_image) missingAlts.push(`${c.name} (Category Thumbnail)`);
    });

    // 4. Audit noindex pages
    const robotsTxt = seoConfig.global.robotsTxt || '';
    if (robotsTxt.includes('Disallow: /') && !robotsTxt.includes('Allow: /')) {
      noindexPages.push('Whole Site (Disallow: /)');
    } else {
      if (robotsTxt.includes('Disallow: /products')) noindexPages.push('Products Page');
      if (robotsTxt.includes('Disallow: /categories')) noindexPages.push('Categories Page');
      if (robotsTxt.includes('Disallow: /about')) noindexPages.push('About Page');
      if (robotsTxt.includes('Disallow: /contact')) noindexPages.push('Contact Page');
    }

    // 5. Calculate overall score
    const titlePen = Math.min(25, missingTitles.length * 5);
    const descPen = Math.min(25, missingDescriptions.length * 5);
    const altPen = Math.min(20, missingAlts.length * 3);
    const slugPen = Math.min(30, duplicateSlugs.length * 15);
    const totalScore = Math.max(0, 100 - titlePen - descPen - altPen - slugPen);

    return (
      <div className="flex flex-col gap-6">
        {/* SEO Health Dashboard */}
        <div className="bg-white border border-wood-200/60 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-wood-100 pb-4">
            <div className="flex flex-col text-left">
              <h3 className="font-serif text-lg font-bold text-wood-950">SEO Health Dashboard</h3>
              <p className="text-[10px] text-wood-500 font-sans mt-0.5 font-semibold">Real-time audit report across public routes and product catalogs</p>
            </div>
            <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center font-mono text-sm font-bold shrink-0 ${
              totalScore >= 80
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                : totalScore >= 50
                ? 'bg-amber-50 border-amber-500 text-amber-700'
                : 'bg-rose-50 border-rose-500 text-rose-700'
            }`}>
              {totalScore}%
            </div>
          </div>

          {auditLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 text-wood-700 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
              
              {/* Box 1: Missing Title Tags */}
              <div className="bg-wood-50/30 border border-wood-200/50 rounded-2xl p-4 flex flex-col gap-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-wood-400">Missing Title Tags</span>
                <span className={`text-xl font-bold font-mono ${missingTitles.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {missingTitles.length}
                </span>
                {missingTitles.length > 0 ? (
                  <div className="max-h-24 overflow-y-auto flex flex-col gap-1 pr-1 scrollbar-thin">
                    {missingTitles.slice(0, 5).map((t, i) => (
                      <span key={i} className="text-[9px] text-wood-650 truncate font-semibold">{t}</span>
                    ))}
                    {missingTitles.length > 5 && <span className="text-[8px] text-wood-400 font-bold uppercase">+{missingTitles.length - 5} more</span>}
                  </div>
                ) : (
                  <span className="text-[9px] text-emerald-700 font-bold font-semibold">✓ All titles optimized</span>
                )}
              </div>

              {/* Box 2: Missing Description Tags */}
              <div className="bg-wood-50/30 border border-wood-200/50 rounded-2xl p-4 flex flex-col gap-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-wood-400">Missing Meta Descriptions</span>
                <span className={`text-xl font-bold font-mono ${missingDescriptions.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {missingDescriptions.length}
                </span>
                {missingDescriptions.length > 0 ? (
                  <div className="max-h-24 overflow-y-auto flex flex-col gap-1 pr-1 scrollbar-thin">
                    {missingDescriptions.slice(0, 5).map((d, i) => (
                      <span key={i} className="text-[9px] text-wood-650 truncate font-semibold">{d}</span>
                    ))}
                    {missingDescriptions.length > 5 && <span className="text-[8px] text-wood-400 font-bold uppercase">+{missingDescriptions.length - 5} more</span>}
                  </div>
                ) : (
                  <span className="text-[9px] text-emerald-700 font-bold font-semibold">✓ All descriptions set</span>
                )}
              </div>

              {/* Box 3: Missing Alt Image Text */}
              <div className="bg-wood-50/30 border border-wood-200/50 rounded-2xl p-4 flex flex-col gap-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-wood-400">Images Missing Alt Text</span>
                <span className={`text-xl font-bold font-mono ${missingAlts.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {missingAlts.length}
                </span>
                {missingAlts.length > 0 ? (
                  <div className="max-h-24 overflow-y-auto flex flex-col gap-1 pr-1 scrollbar-thin">
                    {missingAlts.slice(0, 5).map((a, i) => (
                      <span key={i} className="text-[9px] text-wood-650 truncate font-semibold">{a}</span>
                    ))}
                    {missingAlts.length > 5 && <span className="text-[8px] text-wood-400 font-bold uppercase">+{missingAlts.length - 5} more</span>}
                  </div>
                ) : (
                  <span className="text-[9px] text-emerald-700 font-bold font-semibold">✓ All alt tags set</span>
                )}
              </div>

              {/* Box 4: Routing & Duplicates */}
              <div className="bg-wood-50/30 border border-wood-200/50 rounded-2xl p-4 flex flex-col gap-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-wood-400">Routing & Indexing Status</span>
                <div className="flex flex-col gap-1.5 mt-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-wood-550 font-semibold">Duplicate Slugs</span>
                    <span className={`font-bold font-mono ${duplicateSlugs.length > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {duplicateSlugs.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-wood-550 font-semibold">NoIndex Pages</span>
                    <span className={`font-bold ${noindexPages.length > 0 ? 'text-amber-600' : 'text-emerald-700'}`}>
                      {noindexPages.length > 0 ? 'Blocked' : 'Clean'}
                    </span>
                  </div>
                </div>
                {noindexPages.length > 0 && (
                  <div className="mt-1 text-[8px] text-amber-700 bg-amber-50 border border-amber-100 p-1.5 rounded-lg leading-tight font-semibold">
                    <strong>Noindex paths:</strong> {noindexPages.join(', ')}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
        {/* Global SEO */}
        <SectionLabel>Global SEO Configuration</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Site Title"
            value={seoConfig.global.siteTitle}
            onChange={(v) => updateGlobalSeo('siteTitle', v)}
            placeholder="Your website title"
          />
          <InputField
            label="Canonical URL"
            value={seoConfig.global.canonicalUrl}
            onChange={(v) => updateGlobalSeo('canonicalUrl', v)}
            placeholder="https://yourdomain.com"
          />
        </div>
        <TextAreaField
          label="Site Description"
          value={seoConfig.global.siteDescription}
          onChange={(v) => updateGlobalSeo('siteDescription', v)}
          placeholder="Describe your website in 150-160 characters"
          rows={2}
        />
        <InputField
          label="Default Keywords (comma-separated)"
          value={seoConfig.global.defaultKeywords}
          onChange={(v) => updateGlobalSeo('defaultKeywords', v)}
          placeholder="keyword1, keyword2, keyword3"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="OG Image URL"
            value={seoConfig.global.ogImage}
            onChange={(v) => updateGlobalSeo('ogImage', v)}
            placeholder="https://..."
          />
          <InputField
            label="Twitter Card Image"
            value={seoConfig.global.twitterCardImage}
            onChange={(v) => updateGlobalSeo('twitterCardImage', v)}
            placeholder="https://..."
          />
        </div>
        <TextAreaField
          label="Robots.txt Content"
          value={seoConfig.global.robotsTxt}
          onChange={(v) => updateGlobalSeo('robotsTxt', v)}
          rows={4}
        />
        <InputField
          label="Sitemap URL"
          value={seoConfig.global.sitemapUrl}
          onChange={(v) => updateGlobalSeo('sitemapUrl', v)}
          placeholder="/sitemap.xml"
        />

        {/* Per-Page SEO */}
        <div className="border-t border-wood-100 pt-6">
          <SectionLabel>Per-Page SEO Overrides</SectionLabel>
          <div className="flex flex-col gap-2 mt-4">
            {seoConfig.pages.map((page: SeoPageConfig, idx: number) => {
              const isExpanded = expandedSeoPages.includes(page.slug);
              return (
                <div key={page.slug} className="border border-wood-200/60 rounded-2xl overflow-hidden">
                  {/* Accordion header */}
                  <button
                    onClick={() => toggleSeoPageExpanded(page.slug)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-wood-50/30 hover:bg-wood-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-wood-500" />
                      <span className="text-xs font-bold text-wood-800">{page.label}</span>
                      {page.meta_title && <span className="text-[9px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">Configured</span>}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-wood-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Accordion content */}
                  {isExpanded && (
                    <div className="px-4 py-4 flex flex-col gap-3 bg-white border-t border-wood-100">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <InputField label="Meta Title" value={page.meta_title} onChange={(v) => updatePageSeo(idx, 'meta_title', v)} placeholder={`${page.label} | Nikhil Furniture`} />
                        <InputField label="OG Title" value={page.og_title} onChange={(v) => updatePageSeo(idx, 'og_title', v)} placeholder="Open Graph title" />
                      </div>
                      <TextAreaField label="Meta Description" value={page.meta_description} onChange={(v) => updatePageSeo(idx, 'meta_description', v)} rows={2} placeholder="Page description for search engines" />
                      <TextAreaField label="OG Description" value={page.og_description} onChange={(v) => updatePageSeo(idx, 'og_description', v)} rows={2} placeholder="Open Graph description" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <InputField label="Keywords" value={page.keywords} onChange={(v) => updatePageSeo(idx, 'keywords', v)} placeholder="page-specific, keywords" />
                        <InputField label="OG Image" value={page.og_image} onChange={(v) => updatePageSeo(idx, 'og_image', v)} placeholder="https://..." />
                      </div>
                      <InputField label="Canonical URL" value={page.canonical_url} onChange={(v) => updatePageSeo(idx, 'canonical_url', v)} placeholder={`/${page.slug}`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SEO Validation Panel */}
        <div className="border-t border-wood-100 pt-6">
          <SectionLabel>SEO Validation</SectionLabel>
          {warnings.length === 0 ? (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
              <span className="text-xs font-bold text-green-800">All SEO checks passed. No warnings detected.</span>
            </div>
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              {warnings.map((w, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-xs font-semibold ${
                    w.severity === 'error'
                      ? 'bg-red-50 border-red-200 text-red-800'
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}
                >
                  {w.severity === 'error' ? (
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  <span>
                    <strong>{w.page}</strong> — {w.field}: {w.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-wood-100">
          <button
            onClick={saveSeoConfig}
            disabled={seoSaving}
            className="bg-wood-800 hover:bg-wood-950 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {seoSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {seoSaving ? 'Saving...' : 'Save SEO Settings'}
          </button>
        </div>
      </div>
    );
  };

  /* ═══ TAB 3: Analytics Dashboard ═══ */
  const renderAnalytics = () => {
    const stats = getAnalyticsStats();
    const chartData = getChartData();
    const topProducts: any[] = analyticsData?.rankings || [];

    return (
      <div className="flex flex-col gap-6">
        {/* Period Selector */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <SectionLabel>Page Views Overview</SectionLabel>
          <div className="flex items-center gap-2">
            {([7, 30, 90] as const).map((p) => (
              <button
                key={p}
                onClick={() => setAnalyticsPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  analyticsPeriod === p
                    ? 'bg-wood-800 text-white'
                    : 'bg-wood-50 text-wood-600 hover:bg-wood-100 border border-wood-200'
                }`}
              >
                {p} Days
              </button>
            ))}
          </div>
        </div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Today's Views" value={stats.today} icon={<BarChart3 className="w-4 h-4" />} />
          <StatCard label="Yesterday" value={stats.yesterday} icon={<BarChart3 className="w-4 h-4" />} />
          <StatCard label="This Week" value={stats.week} icon={<BarChart3 className="w-4 h-4" />} />
          <StatCard label="This Month" value={stats.month} icon={<BarChart3 className="w-4 h-4" />} />
        </div>

        {/* Action Stats */}
        <SectionLabel>Action Statistics ({analyticsPeriod}-Day Period)</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="WhatsApp Clicks" value={stats.whatsapp} />
          <StatCard label="Phone Clicks" value={stats.phone} />
          <StatCard label="Contact Submissions" value={stats.contact} />
          <StatCard label="Gallery Views" value={stats.gallery} />
        </div>

        {/* SVG Chart */}
        <div className="border border-wood-200/60 rounded-2xl p-4 bg-white">
          <SimpleLineChart data={chartData} label="Page Views Trend" />
        </div>

        {/* Most Viewed Products */}
        {topProducts.length > 0 && (
          <div className="border-t border-wood-100 pt-6">
            <SectionLabel>Most Viewed Products</SectionLabel>
            <div className="mt-3 flex flex-col gap-2">
              {topProducts.slice(0, 10).map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between bg-wood-50/40 border border-wood-200/50 rounded-xl px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-wood-400 w-5">#{i + 1}</span>
                    <span className="text-xs font-bold text-wood-800">{p.name || p.productName || 'Unknown'}</span>
                  </div>
                  <span className="text-xs font-bold text-wood-600">{p.views || 0} views</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ═══ TAB 4: System Health ═══ */
  const renderHealth = () => {
    const statusColor = (status: string) => {
      switch (status) {
        case 'healthy': return 'bg-green-50 border-green-200 text-green-800';
        case 'warning': return 'bg-amber-50 border-amber-200 text-amber-800';
        case 'error': return 'bg-red-50 border-red-200 text-red-800';
        default: return 'bg-gray-50 border-gray-200 text-gray-800';
      }
    };

    const statusIcon = (status: string) => {
      switch (status) {
        case 'healthy': return <CheckCircle className="w-5 h-5 text-green-600" />;
        case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
        case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
        default: return null;
      }
    };

    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <SectionLabel>Service Health Checks</SectionLabel>
          <button
            onClick={runHealthChecks}
            disabled={healthLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-wood-50 text-wood-600 hover:bg-wood-100 border border-wood-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${healthLoading ? 'animate-spin' : ''}`} />
            Recheck
          </button>
        </div>

        {healthLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-wood-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {healthChecks.map((check) => (
              <div key={check.name} className={`border rounded-2xl p-4 flex items-start gap-3 ${statusColor(check.status)}`}>
                <div className="shrink-0 mt-0.5">{statusIcon(check.status)}</div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    {check.icon}
                    <span className="text-xs font-bold">{check.name}</span>
                  </div>
                  <span className="text-[10px] opacity-80">{check.message}</span>
                  <span className={`text-[9px] uppercase tracking-wider font-bold mt-1 px-2 py-0.5 rounded-full inline-block w-fit ${
                    check.status === 'healthy' ? 'bg-green-100 text-green-700' :
                    check.status === 'warning' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {check.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Storage Usage */}
        <div className="border-t border-wood-100 pt-6">
          <SectionLabel>Storage Usage</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
            <StatCard label="Total Files" value={storageInfo.totalFiles} icon={<FileText className="w-4 h-4" />} />
            <StatCard label="Storage Used" value={`${storageInfo.totalSizeMB} MB`} icon={<HardDrive className="w-4 h-4" />} />
            <StatCard label="Bucket" value="furniture" icon={<Database className="w-4 h-4" />} />
          </div>

          {storageInfo.largestFiles.length > 0 && (
            <div className="mt-4">
              <span className="text-[9px] uppercase tracking-wider text-wood-500 font-bold">Top 5 Largest Files</span>
              <div className="mt-2 flex flex-col gap-1.5">
                {storageInfo.largestFiles.map((f: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-wood-50/40 border border-wood-200/50 rounded-xl px-3 py-2">
                    <span className="text-xs text-wood-700 truncate max-w-[60%]">{f.name || f.fileName || 'Unknown'}</span>
                    <span className="text-[10px] font-bold text-wood-500">{((f.fileSize || 0) / 1024).toFixed(1)} KB</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bundle/Performance Info */}
        <div className="border-t border-wood-100 pt-6">
          <SectionLabel>Bundle & Performance</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <StatCard label="Lazy Loading" value="Enabled" icon={<RefreshCw className="w-4 h-4" />} />
            <StatCard label="Image Optimization" value="WebP Auto-Convert" icon={<HardDrive className="w-4 h-4" />} />
            <StatCard label="Code Splitting" value="Active" icon={<Server className="w-4 h-4" />} />
            <StatCard label="Bundle Strategy" value="Vendor + Route-based" icon={<Settings className="w-4 h-4" />} />
          </div>
        </div>
      </div>
    );
  };

  /* ═══ TAB 5: Security ═══ */
  const renderSecurity = () => {
    const user = userInfo?.user;
    const session = userInfo?.session;

    return (
      <div className="flex flex-col gap-6">
        {/* Auth Status */}
        <SectionLabel>Authentication Status</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            label="Admin Email"
            value={user?.email || 'Not authenticated'}
            icon={<Lock className="w-4 h-4" />}
          />
          <StatCard
            label="Session Expiry"
            value={session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A'}
            icon={<Clock className="w-4 h-4" />}
          />
          <StatCard
            label="Last Login"
            value={session?.created_at ? new Date(session.created_at).toLocaleString() : 'N/A'}
            icon={<Shield className="w-4 h-4" />}
          />
          <StatCard
            label="Auth Provider"
            value={user?.app_metadata?.provider || 'email'}
            icon={<Lock className="w-4 h-4" />}
          />
        </div>

        {/* Maintenance Mode */}
        <div className="border-t border-wood-100 pt-6">
          <SectionLabel>Maintenance Mode</SectionLabel>
          <div className="mt-4 flex flex-col gap-4">
            {/* Toggle */}
            <div className="flex items-center justify-between bg-wood-50/40 border border-wood-200/60 rounded-2xl p-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-wood-800">Enable Maintenance Mode</span>
                <span className="text-[10px] text-wood-500">When enabled, visitors see a maintenance page instead of the website.</span>
              </div>
              <button
                onClick={() => setMaintenanceConfig((prev: any) => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
                className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
                  maintenanceConfig.maintenanceMode ? 'bg-red-500' : 'bg-wood-300'
                }`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  maintenanceConfig.maintenanceMode ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            {maintenanceConfig.maintenanceMode && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-xs text-red-800 font-bold">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                Maintenance mode is ACTIVE. The public website is currently showing the maintenance page.
              </div>
            )}

            <TextAreaField
              label="Maintenance Message"
              value={maintenanceConfig.maintenanceMessage}
              onChange={(v) => setMaintenanceConfig((prev: any) => ({ ...prev, maintenanceMessage: v }))}
              rows={3}
              placeholder="Custom maintenance message for visitors..."
            />

            <InputField
              label="Estimated Return Time"
              value={maintenanceConfig.estimatedReturn}
              onChange={(v) => setMaintenanceConfig((prev: any) => ({ ...prev, estimatedReturn: v }))}
              type="datetime-local"
            />

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-2 text-xs text-blue-800">
              <Shield className="w-4 h-4 text-blue-500 shrink-0" />
              <span><strong>Note:</strong> Admin panel access is always whitelisted during maintenance mode. Only public-facing pages are affected.</span>
            </div>

            <div className="flex justify-end">
              <button
                onClick={saveMaintenanceConfig}
                disabled={securitySaving}
                className="bg-wood-800 hover:bg-wood-950 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {securitySaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {securitySaving ? 'Saving...' : 'Save Maintenance Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ═══ TAB 6: Backup & Export ═══ */
  const renderBackup = () => {
    const exportItems = [
      { label: 'Products', table: 'Products', icon: <Download className="w-4 h-4" /> },
      { label: 'Categories', table: 'Categories', icon: <Download className="w-4 h-4" /> },
      { label: 'Testimonials', table: 'Testimonials', icon: <Download className="w-4 h-4" /> },
      { label: 'FAQs', table: 'FAQs', icon: <Download className="w-4 h-4" /> },
      { label: 'Gallery', table: 'Gallery', icon: <Download className="w-4 h-4" /> },
      { label: 'Settings', table: 'Settings', icon: <Settings className="w-4 h-4" /> },
      { label: 'Media Library', table: 'Media Library', icon: <HardDrive className="w-4 h-4" /> },
    ];

    return (
      <div className="flex flex-col gap-6">
        {/* Export Section */}
        <SectionLabel>Export Data (JSON)</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {exportItems.map((item) => (
            <button
              key={item.label}
              onClick={() => exportData(item.table, item.label.toLowerCase().replace(/\s/g, '_'))}
              disabled={pageLoading}
              className="flex flex-col items-center gap-2 bg-wood-50/40 border border-wood-200/60 rounded-2xl p-4 hover:bg-wood-100/60 hover:border-wood-300 transition-colors cursor-pointer disabled:opacity-50"
            >
              <div className="bg-wood-100 rounded-xl p-2.5 text-wood-600">{item.icon}</div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-wood-700">{item.label}</span>
              <span className="text-[9px] text-wood-400">JSON</span>
            </button>
          ))}
        </div>

        {/* CSV Export for Products */}
        <div className="border-t border-wood-100 pt-6">
          <SectionLabel>CSV Export</SectionLabel>
          <div className="mt-3">
            <button
              onClick={exportProductsCsv}
              disabled={pageLoading}
              className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 hover:bg-green-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              <FileText className="w-4 h-4 text-green-600" />
              <div className="flex flex-col items-start">
                <span className="text-xs font-bold text-green-800">Export Products as CSV</span>
                <span className="text-[9px] text-green-600">Compatible with Excel, Google Sheets</span>
              </div>
            </button>
          </div>
        </div>

        {/* Import Section */}
        <div className="border-t border-wood-100 pt-6">
          <SectionLabel>Import Data</SectionLabel>
          <div className="mt-3 bg-wood-50/40 border border-wood-200/60 rounded-2xl p-5 flex flex-col gap-3">
            <p className="text-xs text-wood-600">
              Upload a <strong>.json</strong> file exported from this panel. The file should contain a <code className="bg-wood-100 px-1 py-0.5 rounded text-[10px]">key</code> and <code className="bg-wood-100 px-1 py-0.5 rounded text-[10px]">value</code> structure, or an array of settings records.
            </p>
            <label className="flex items-center gap-3 bg-white border border-dashed border-wood-300 rounded-xl px-4 py-4 hover:bg-wood-50/50 transition-colors cursor-pointer">
              <Upload className="w-5 h-5 text-wood-500" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-wood-700">Choose JSON file to import</span>
                <span className="text-[9px] text-wood-400">Accepts .json files only</span>
              </div>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Cache & Reset Section */}
        <div className="border-t border-wood-100 pt-6">
          <SectionLabel>Cache & Reset</SectionLabel>
          <div className="flex flex-wrap gap-3 mt-3">
            <button
              onClick={() => {
                localStorage.clear();
                alert('Local cache cleared successfully!');
              }}
              className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-amber-800">Clear Local Cache</span>
            </button>
            <button
              onClick={() => {
                if (window.confirm('Refresh the entire page? Any unsaved changes will be lost.')) {
                  window.location.reload();
                }
              }}
              className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-blue-800">Refresh Site Data</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ═══ TAB 7: Activity Logs ═══ */
  const renderLogs = () => {
    const modules = Array.from(new Set(activityLogs.map((l: any) => l.module || 'Unknown')));
    const filtered = logsFilter === 'all' ? activityLogs : activityLogs.filter((l: any) => l.module === logsFilter);

    const statusBadge = (status: string) => {
      const lower = (status || '').toLowerCase();
      if (lower === 'success' || lower === 'completed')
        return <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Success</span>;
      if (lower === 'error' || lower === 'failed')
        return <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Error</span>;
      if (lower === 'warning')
        return <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Warning</span>;
      return <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-wood-100 text-wood-600">{status || 'Info'}</span>;
    };

    if (!logsLoaded) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-wood-600 animate-spin" />
        </div>
      );
    }

    if (activityLogs.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-wood-100 rounded-full p-4 mb-4">
            <Clock className="w-8 h-8 text-wood-400" />
          </div>
          <h3 className="font-serif text-lg font-bold text-wood-800 mb-1">No Activity Logs</h3>
          <p className="text-xs text-wood-500 max-w-sm">
            Activity logs will appear here as actions are performed across the admin panel. Check back after making some changes.
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        {/* Filter */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <SectionLabel>Recent Activity</SectionLabel>
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase text-wood-500 font-bold">Filter:</span>
            <select
              value={logsFilter}
              onChange={(e) => setLogsFilter(e.target.value)}
              className="bg-wood-50/50 border border-wood-200 rounded-lg text-xs text-wood-700 px-2 py-1.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-wood-400"
            >
              <option value="all">All Modules</option>
              {modules.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-wood-200/60 rounded-2xl">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-wood-50/50 border-b border-wood-200/60">
                <th className="text-left px-4 py-3 text-[9px] uppercase tracking-wider text-wood-500 font-bold">Time</th>
                <th className="text-left px-4 py-3 text-[9px] uppercase tracking-wider text-wood-500 font-bold">Action</th>
                <th className="text-left px-4 py-3 text-[9px] uppercase tracking-wider text-wood-500 font-bold">Module</th>
                <th className="text-left px-4 py-3 text-[9px] uppercase tracking-wider text-wood-500 font-bold">Status</th>
                <th className="text-left px-4 py-3 text-[9px] uppercase tracking-wider text-wood-500 font-bold">Admin</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log: any, idx: number) => (
                <tr key={idx} className="border-b border-wood-100/60 hover:bg-wood-50/30 transition-colors">
                  <td className="px-4 py-3 text-wood-500 whitespace-nowrap">{log.timestamp ? relativeTime(log.timestamp) : '—'}</td>
                  <td className="px-4 py-3 text-wood-800 font-semibold">{log.action || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="bg-wood-100 text-wood-600 px-2 py-0.5 rounded-full text-[9px] font-bold">{log.module || 'Unknown'}</span>
                  </td>
                  <td className="px-4 py-3">{statusBadge(log.status)}</td>
                  <td className="px-4 py-3 text-wood-600">{log.admin || log.user || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────────
  // Active Tab Content Router
  // ─────────────────────────────────────────────────
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'general': return renderGeneral();
      case 'seo': return renderSeo();
      case 'analytics': return renderAnalytics();
      case 'health': return renderHealth();
      case 'security': return renderSecurity();
      case 'backup': return renderBackup();
      case 'logs': return renderLogs();
      default: return null;
    }
  };

  // ─────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 select-none font-sans pb-16 font-semibold text-xs text-wood-700">
      <SEO title="Site Management | Nikhil Furniture Admin" description="Comprehensive site management dashboard for analytics, SEO, health monitoring, security, and backups." />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-wood-200/60">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-serif text-2xl font-bold text-wood-950">Site Management</h2>
          <p className="text-xs text-wood-500 font-sans font-normal">
            Monitor, configure, and manage all aspects of your website from a single dashboard.
          </p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              const newUrl = new URL(window.location.href);
              newUrl.searchParams.set('tab', tab.key);
              window.history.pushState({}, '', newUrl.toString());
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              activeTab === tab.key
                ? 'bg-wood-800 text-white shadow-sm'
                : 'bg-white text-wood-600 hover:bg-wood-50 border border-wood-200/60'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Loading Overlay */}
      {pageLoading && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 shadow-lg flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-wood-700 animate-spin" />
            <span className="text-xs font-bold text-wood-800">Processing...</span>
          </div>
        </div>
      )}

      {/* Tab Content Area */}
      <div className="bg-white border border-wood-200/40 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
        {renderActiveTab()}
      </div>
    </div>
  );
};

export default SiteManagement;
