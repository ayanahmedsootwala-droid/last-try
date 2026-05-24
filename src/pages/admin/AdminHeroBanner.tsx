import { useState, useEffect } from 'react';
import { Save, Upload, Loader2, Check, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { supabase } from '@/db/supabase';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { HERO_IMAGE_PRESETS } from '@/pages/HomePage';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export default function AdminHeroBanner() {
  const { t } = useLanguage();
  const { settings, updateSetting } = useSiteSettings();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [local, setLocal] = useState({
    hero_title:               '',
    hero_subtitle:            '',
    hero_preset:              'ferrari_night',
    hero_image_url:           '',
    hero_overlay_opacity:     '0.52',
    hero_slideshow_enabled:   'false',
    hero_slideshow_interval:  '5',
  });

  useEffect(() => {
    if (Object.keys(settings).length) {
      setLocal({
        hero_title:               settings.hero_title              || 'Find Your Perfect Drive',
        hero_subtitle:            settings.hero_subtitle           || "Pakistan's most trusted platform for premium vehicles.",
        hero_preset:              settings.hero_preset             || 'ferrari_night',
        hero_image_url:           settings.hero_image_url          || '',
        hero_overlay_opacity:     settings.hero_overlay_opacity    || '0.52',
        hero_slideshow_enabled:   settings.hero_slideshow_enabled  || 'false',
        hero_slideshow_interval:  settings.hero_slideshow_interval || '5',
      });
    }
  }, [settings]);

  const set = (key: string, value: string) => setLocal(prev => ({ ...prev, [key]: value }));

  const saveAll = async () => {
    setSaving(true);
    for (const [key, value] of Object.entries(local)) {
      await updateSetting(key, value);
    }
    setSaving(false);
    toast.success('Hero settings saved');
  };

  const uploadCustomImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `hero/custom_${Date.now()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('site-assets').upload(path, file, { upsert: true });
    if (error) { toast.error('Upload failed: ' + error.message); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from('site-assets').getPublicUrl(path);
    set('hero_image_url', publicUrl);
    set('hero_preset', ''); // clear preset when custom uploaded
    setUploading(false);
    toast.success('Custom image uploaded — save to apply');
  };

  const currentPreset = HERO_IMAGE_PRESETS.find(p => p.key === local.hero_preset);
  const previewUrl = local.hero_image_url || currentPreset?.url || HERO_IMAGE_PRESETS[0].url;

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Hero Section</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage the homepage hero backdrop and text</p>
          </div>
          <Button onClick={saveAll} disabled={saving} className="h-9 gap-1.5">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? 'Saving…' : 'Save All'}
          </Button>
        </div>

        {/* Live preview strip */}
        <div className="relative rounded-xl overflow-hidden border border-border" style={{ height: 160 }}>
          <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${local.hero_overlay_opacity})` }} />
          <div className="absolute inset-0 flex flex-col justify-end p-4">
            <p className="text-white font-bold text-lg leading-tight text-balance">{local.hero_title || 'Your Title'}</p>
            <p className="text-white/60 text-xs mt-1 line-clamp-1">{local.hero_subtitle || 'Your subtitle'}</p>
          </div>
          <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded font-medium backdrop-blur-sm">
            Preview
          </div>
        </div>

        {/* Text content */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Hero Text</CardTitle>
            <CardDescription className="text-xs">Headline and sub-headline displayed over the backdrop</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Headline</Label>
              <Input value={local.hero_title} onChange={e => set('hero_title', e.target.value)}
                className="h-9 text-sm" placeholder="Find Your Perfect Drive" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Sub-headline</Label>
              <Textarea value={local.hero_subtitle} onChange={e => set('hero_subtitle', e.target.value)}
                className="text-sm resize-none min-h-[60px]" />
            </div>
          </CardContent>
        </Card>

        {/* Quick presets */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Quick Presets</CardTitle>
            <CardDescription className="text-xs">Choose a high-quality supercar backdrop. Click a preset to select it.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {HERO_IMAGE_PRESETS.map(p => (
                <button
                  key={p.key}
                  onClick={() => { set('hero_preset', p.key); set('hero_image_url', ''); }}
                  className={cn(
                    'relative rounded-lg overflow-hidden border-2 transition-all group',
                    local.hero_preset === p.key && !local.hero_image_url
                      ? 'border-[hsl(var(--gold))] ring-2 ring-[hsl(var(--gold)/0.35)] scale-[1.02]'
                      : 'border-border hover:border-border/80'
                  )}
                >
                  <div className="aspect-video w-full relative">
                    <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                    {local.hero_preset === p.key && !local.hero_image_url && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[hsl(var(--gold))] flex items-center justify-center">
                        <Check className="w-3 h-3 text-black" />
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-center py-1 text-muted-foreground font-medium truncate px-1">{p.label}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Custom image upload */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" /> Custom Image
            </CardTitle>
            <CardDescription className="text-xs">Upload your own backdrop image — overrides the selected preset</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input value={local.hero_image_url} onChange={e => set('hero_image_url', e.target.value)}
                className="h-9 text-sm" placeholder="Paste URL or upload a file…" />
              <label className={cn(
                'h-9 px-3 border border-border rounded-md flex items-center gap-1.5 text-sm shrink-0 whitespace-nowrap',
                uploading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-secondary'
              )}>
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                Upload
                <input type="file" accept="image/*" onChange={uploadCustomImage} className="hidden" disabled={uploading} />
              </label>
            </div>
            {local.hero_image_url && (
              <div className="relative rounded-lg overflow-hidden border border-border" style={{ height: 80 }}>
                <img src={local.hero_image_url} alt="custom" className="w-full h-full object-cover" />
                <button onClick={() => set('hero_image_url', '')}
                  className="absolute top-1.5 right-1.5 bg-black/60 text-white text-xs px-2 py-0.5 rounded hover:bg-black/80">
                  Remove
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overlay + Slideshow */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Display Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Overlay darkness */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label className="text-xs text-muted-foreground">Overlay Darkness</Label>
                <span className="text-xs font-mono text-muted-foreground">{parseFloat(local.hero_overlay_opacity).toFixed(2)}</span>
              </div>
              <Slider
                min={0} max={0.9} step={0.02}
                value={[parseFloat(local.hero_overlay_opacity)]}
                onValueChange={([v]) => set('hero_overlay_opacity', v.toFixed(2))}
                className="w-full"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-muted-foreground">Light</span>
                <span className="text-[10px] text-muted-foreground">Dark</span>
              </div>
            </div>

            {/* Slideshow toggle */}
            <div className="flex items-center justify-between py-2 border-t border-border/40">
              <div>
                <p className="text-sm font-medium">Auto Slideshow</p>
                <p className="text-xs text-muted-foreground mt-0.5">Rotate through all 7 presets automatically</p>
              </div>
              <Switch
                checked={local.hero_slideshow_enabled === 'true'}
                onCheckedChange={v => set('hero_slideshow_enabled', v ? 'true' : 'false')}
              />
            </div>

            {/* Slideshow interval */}
            {local.hero_slideshow_enabled === 'true' && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-xs text-muted-foreground">Slide Interval</Label>
                  <span className="text-xs font-mono text-muted-foreground">{local.hero_slideshow_interval}s</span>
                </div>
                <Slider
                  min={3} max={15} step={1}
                  value={[parseInt(local.hero_slideshow_interval, 10)]}
                  onValueChange={([v]) => set('hero_slideshow_interval', String(v))}
                  className="w-full"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-muted-foreground">3s (fast)</span>
                  <span className="text-[10px] text-muted-foreground">15s (slow)</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
