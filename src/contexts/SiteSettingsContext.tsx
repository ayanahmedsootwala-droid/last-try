import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/db/supabase';
import type { SiteSetting } from '@/types/types';

type SettingsMap = Record<string, string>;

interface SiteSettingsContextType {
  settings: SettingsMap;
  loading: boolean;
  updateSetting: (key: string, value: string) => Promise<{ error: unknown }>;
  getSetting: (key: string, defaultVal?: string) => string;
  refresh: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | null>(null);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    const { data } = await supabase.from('site_settings').select('key, value');
    if (data) {
      const map: SettingsMap = {};
      (data as SiteSetting[]).forEach(s => { if (s.value !== null) map[s.key] = s.value; });
      setSettings(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();

    // Realtime: re-sync whenever any setting row changes in the DB
    const channel = supabase
      .channel('site_settings_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_settings' },
        (payload) => {
          // Merge the changed row into shared state immediately
          const row = (payload.new || payload.old) as SiteSetting | undefined;
          if (row?.key) {
            setSettings(prev => {
              if (payload.eventType === 'DELETE') {
                const next = { ...prev };
                delete next[row.key];
                return next;
              }
              if (row.value !== null && row.value !== undefined) {
                return { ...prev, [row.key]: row.value };
              }
              return prev;
            });
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchSettings]);

  const updateSetting = async (key: string, value: string) => {
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key, value }, { onConflict: 'key' });
    if (!error) {
      // Optimistically update shared state so all consumers see it immediately
      setSettings(prev => ({ ...prev, [key]: value }));
    }
    return { error };
  };

  const getSetting = useCallback(
    (key: string, defaultVal = '') => settings[key] || defaultVal,
    [settings]
  );

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, updateSetting, getSetting, refresh: fetchSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettingsContext() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error('useSiteSettingsContext must be used inside SiteSettingsProvider');
  return ctx;
}
