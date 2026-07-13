import { supabase } from './supabase';

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  module: string;
  status: 'success' | 'warning' | 'error';
  admin: string;
  details?: string;
}

/**
 * Log an admin action to site_settings under the 'activity_logs' key.
 * Keeps only the most recent 100 entries to stay within free-tier JSONB limits.
 */
export const logAdminAction = async (
  action: string,
  module: string,
  status: 'success' | 'warning' | 'error' = 'success',
  details?: string
) => {
  try {
    // Get current user email
    const { data: { user } } = await supabase.auth.getUser();
    const adminEmail = user?.email || 'Unknown';

    const newEntry: ActivityLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action,
      module,
      status,
      admin: adminEmail,
      details
    };

    // Fetch existing logs
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'activity_logs')
      .single();

    let logs: ActivityLog[] = [];
    if (data && data.value && Array.isArray(data.value.logs)) {
      logs = data.value.logs;
    }

    // Prepend new entry, keep max 100
    logs.unshift(newEntry);
    if (logs.length > 100) {
      logs = logs.slice(0, 100);
    }

    await supabase
      .from('site_settings')
      .upsert([{ key: 'activity_logs', value: { logs } }]);

  } catch (err) {
    console.error('Failed to log admin action:', err);
  }
};
