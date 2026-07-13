import { supabase } from './supabase';

/**
 * Lightweight analytics tracker.
 * Increments counters in site_settings under key 'analytics_summary'.
 * Each day gets its own entry; counters are additive.
 */
export const trackEvent = async (
  eventType: 'page_view' | 'whatsapp_click' | 'phone_click' | 'contact_submit' | 'gallery_view' | 'wishlist_add' | 'product_view' | 'category_view',
  meta?: { slug?: string; name?: string }
) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'analytics_summary')
      .single();

    const summary = data?.value || { daily: {}, events: [] };

    // Ensure daily bucket exists
    if (!summary.daily[today]) {
      summary.daily[today] = {
        page_views: 0,
        whatsapp_clicks: 0,
        phone_clicks: 0,
        contact_submissions: 0,
        gallery_views: 0,
        wishlist_adds: 0,
        product_views: 0,
        category_views: 0
      };
    }

    const day = summary.daily[today];
    switch (eventType) {
      case 'page_view': day.page_views++; break;
      case 'whatsapp_click': day.whatsapp_clicks++; break;
      case 'phone_click': day.phone_clicks++; break;
      case 'contact_submit': day.contact_submissions++; break;
      case 'gallery_view': day.gallery_views++; break;
      case 'wishlist_add': day.wishlist_adds++; break;
      case 'product_view': day.product_views++; break;
      case 'category_view': day.category_views++; break;
    }

    // Track individual product/category views for "most viewed" rankings
    if ((eventType === 'product_view' || eventType === 'category_view') && meta?.slug) {
      if (!summary.rankings) summary.rankings = {};
      if (!summary.rankings[eventType]) summary.rankings[eventType] = {};
      summary.rankings[eventType][meta.slug] = (summary.rankings[eventType][meta.slug] || 0) + 1;
      if (meta.name) {
        if (!summary.rankingNames) summary.rankingNames = {};
        summary.rankingNames[meta.slug] = meta.name;
      }
    }

    // Prune daily entries older than 90 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    for (const dateKey of Object.keys(summary.daily)) {
      if (dateKey < cutoffStr) {
        delete summary.daily[dateKey];
      }
    }

    await supabase
      .from('site_settings')
      .upsert([{ key: 'analytics_summary', value: summary }]);

  } catch (err) {
    // Silently fail — analytics should never break user experience
    console.error('Analytics tracking error:', err);
  }
};
