import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Car, Heart, Gavel, Plus, Settings, ChevronRight, LogOut, Bell,
  Bookmark, Trash2, Edit, Search, X, Check, Loader2, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { PublicLayout } from '@/components/layouts/PublicLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications, type Notification } from '@/hooks/useNotifications';
import { supabase } from '@/db/supabase';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils-xyz';
import type { Car as CarType, Wishlist, Bid, Auction } from '@/types/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface UserBidWithAuction extends Bid { auction: Auction; }
interface SavedSearch { id: string; name: string; filters: Record<string, unknown>; alert_enabled: boolean; created_at: string; }

export default function UserDashboardPage() {
  const { t } = useLanguage();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'listings';

  const { notifications, unreadCount, markRead, markAllRead, deleteNotification } = useNotifications();

  const [myCars, setMyCars] = useState<CarType[]>([]);
  const [wishlist, setWishlist] = useState<Wishlist[]>([]);
  const [myBids, setMyBids] = useState<UserBidWithAuction[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [editSearchOpen, setEditSearchOpen] = useState(false);
  const [editSearch, setEditSearch] = useState<SavedSearch | null>(null);
  const [deleteSearchId, setDeleteSearchId] = useState<string | null>(null);
  const [deletingNotifId, setDeletingNotifId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [carsRes, wlRes, bidsRes, searchesRes] = await Promise.all([
      supabase.from('cars').select('*').eq('seller_id', user.id).order('created_at', { ascending: false }).limit(20),
      supabase.from('wishlist').select('*, car:cars(id,title,brand_name,model_name,year,price,images,city,status)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      supabase.from('auction_bids').select('*, auction:auctions(id,title,current_price,status,end_time,car:cars(id,title,brand_name,model_name,year,images))').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      supabase.from('saved_searches').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ]);
    if (carsRes.data) setMyCars(carsRes.data as CarType[]);
    if (wlRes.data) setWishlist(wlRes.data as Wishlist[]);
    if (bidsRes.data) setMyBids(bidsRes.data as UserBidWithAuction[]);
    if (searchesRes.data) setSavedSearches(searchesRes.data as SavedSearch[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadData();
  }, [user, loadData]);

  const removeFromWishlist = async (carId: string) => {
    await supabase.from('wishlist').delete().eq('user_id', user!.id).eq('car_id', carId);
    setWishlist(prev => prev.filter(w => w.car_id !== carId));
    toast.success('Removed from wishlist');
  };

  const updateSavedSearch = async () => {
    if (!editSearch) return;
    await supabase.from('saved_searches').update({ name: editSearch.name, alert_enabled: editSearch.alert_enabled }).eq('id', editSearch.id);
    setSavedSearches(prev => prev.map(s => s.id === editSearch.id ? { ...s, name: editSearch.name, alert_enabled: editSearch.alert_enabled } : s));
    toast.success('Search updated');
    setEditSearchOpen(false);
  };

  const deleteSavedSearch = async () => {
    if (!deleteSearchId) return;
    await supabase.from('saved_searches').delete().eq('id', deleteSearchId);
    setSavedSearches(prev => prev.filter(s => s.id !== deleteSearchId));
    toast.success('Search deleted');
    setDeleteSearchId(null);
  };

  const runSearch = (filters: Record<string, unknown>) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, String(v)); });
    navigate(`/inventory?${params.toString()}`);
  };

  if (!user || !profile) return null;

  const stats = [
    { label: 'My Listings', value: myCars.length, icon: Car, tab: 'listings' },
    { label: 'Wishlist', value: wishlist.length, icon: Heart, tab: 'wishlist' },
    { label: 'Active Bids', value: myBids.filter(b => b.auction?.status === 'active').length, icon: Gavel, tab: 'bids' },
    { label: 'Notifications', value: unreadCount, icon: Bell, tab: 'notifications' },
  ];

  return (
    <PublicLayout>
      <div className="pt-[68px] min-h-screen">
        {/* Dark hero band */}
        <div className="section-bg-dark-premium border-b border-border/20">
          <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">

            {/* Profile header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14 ring-2 ring-white/20">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="bg-white/15 text-white text-xl font-bold border border-white/20">
                    {(profile.full_name || profile.email || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-lg font-bold text-primary-foreground">{profile.full_name || 'My Account'}</h1>
                  <p className="text-sm text-primary-foreground/60">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/sell')}
                  className="h-9 gap-1.5 border border-white/20 text-white hover:bg-white/10">
                  <Plus className="w-4 h-4" /> List a Car
                </Button>
                <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate('/'); }}
                  className="h-9 border border-white/10 text-white/70 hover:text-white hover:bg-white/10">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {stats.map(s => (
                <div key={s.label}
                  className="flex items-center gap-3 bg-white/8 border border-white/10 rounded-xl p-4 hover:bg-white/12 transition-colors cursor-pointer"
                  onClick={() => {/* handled by tabs below */}}>
                  <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                    <s.icon className="w-4 h-4 text-white/80" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-primary-foreground">{s.value}</p>
                    <p className="text-xs text-primary-foreground/55 whitespace-nowrap">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>{/* end hero-band */}
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
          {/* Tabs */}
          <Tabs defaultValue={defaultTab}>
            <TabsList className="border-b border-border bg-transparent rounded-none w-full justify-start gap-0 h-auto pb-0 overflow-x-auto">
              {[
                { value: 'listings', label: 'My Listings', count: myCars.length },
                { value: 'wishlist', label: 'Wishlist', count: wishlist.length },
                { value: 'bids', label: 'My Bids', count: myBids.length },
                { value: 'saved', label: 'Saved Searches', count: savedSearches.length },
                { value: 'notifications', label: 'Notifications', count: unreadCount },
              ].map(t => (
                <TabsTrigger key={t.value} value={t.value}
                  className="text-sm pb-3 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:shadow-none bg-transparent text-muted-foreground whitespace-nowrap shrink-0 gap-1.5">
                  {t.label}
                  {t.count > 0 && <Badge variant="secondary" className="text-xs h-4 px-1">{t.count}</Badge>}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* My Listings */}
            <TabsContent value="listings" className="pt-6">
              {loading ? (
                <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
              ) : myCars.length === 0 ? (
                <div className="text-center py-12 border border-border rounded-xl">
                  <p className="text-muted-foreground text-sm mb-3">No listings yet.</p>
                  <Button size="sm" onClick={() => navigate('/sell')}><Plus className="w-4 h-4 mr-1" /> List Your First Car</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myCars.map(car => (
                    <div key={car.id} className="flex items-center gap-4 p-4 border border-border rounded-xl hover:bg-muted/20 transition-colors">
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                        {car.images?.[0] && <img src={car.images[0]} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{car.title || `${car.brand_name} ${car.model_name}`}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-sm font-semibold text-foreground">{formatCurrency(car.price)}</span>
                          <span className="text-xs text-muted-foreground">· {car.city}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={cn('text-xs', getStatusColor(car.status))}>{car.status?.replace('_', ' ')}</Badge>
                        <Button variant="ghost" size="icon" className="w-7 h-7" asChild>
                          <Link to={`/inventory/${car.id}`}><ChevronRight className="w-4 h-4" /></Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Wishlist */}
            <TabsContent value="wishlist" className="pt-6">
              {loading ? (
                <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
              ) : wishlist.length === 0 ? (
                <div className="text-center py-12 border border-border rounded-xl">
                  <p className="text-muted-foreground text-sm mb-3">No saved vehicles yet.</p>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/inventory')}>Browse Inventory</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {wishlist.map(w => {
                    const car = w.car as CarType;
                    return (
                      <div key={w.id} className="flex items-center gap-4 p-4 border border-border rounded-xl hover:bg-muted/20 transition-colors">
                        <div className="w-16 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                          {car?.images?.[0] && <img src={car.images[0]} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{car?.title || `${car?.brand_name} ${car?.model_name}`}</p>
                          <p className="text-sm text-muted-foreground">{formatCurrency(car?.price)}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button variant="ghost" size="icon" className="w-7 h-7" asChild>
                            <Link to={`/inventory/${car?.id}`}><ChevronRight className="w-4 h-4" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive"
                            onClick={() => car?.id && removeFromWishlist(car.id)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Bids */}
            <TabsContent value="bids" className="pt-6">
              {loading ? (
                <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
              ) : myBids.length === 0 ? (
                <div className="text-center py-12 border border-border rounded-xl">
                  <p className="text-muted-foreground text-sm mb-3">No bids placed yet.</p>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/auctions')}>Browse Auctions</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myBids.map(bid => {
                    const auction = bid.auction as Auction & { car?: CarType };
                    return (
                      <div key={bid.id} className="flex items-center gap-4 p-4 border border-border rounded-xl hover:bg-muted/20 transition-colors">
                        <div className="w-16 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                          {auction?.car?.images?.[0] && <img src={auction.car.images[0]} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{auction?.title || 'Auction'}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">Your bid:</span>
                            <span className="text-sm font-semibold">{formatCurrency(bid.amount)}</span>
                            <span className="text-xs text-muted-foreground">· Current: {formatCurrency(auction?.current_price)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge className={cn('text-xs', auction?.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-muted text-muted-foreground')}>
                            {auction?.status}
                          </Badge>
                          <Button variant="ghost" size="icon" className="w-7 h-7" asChild>
                            <Link to={`/auctions/${auction?.id}`}><ChevronRight className="w-4 h-4" /></Link>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Saved Searches */}
            <TabsContent value="saved" className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">{savedSearches.length} saved searches</p>
                <Button variant="ghost" size="sm" onClick={() => navigate('/inventory')} className="h-8 text-xs gap-1.5 border border-border">
                  <Search className="w-3.5 h-3.5" /> New Search
                </Button>
              </div>
              {savedSearches.length === 0 ? (
                <div className="text-center py-12 border border-border rounded-xl">
                  <Bookmark className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm mb-3">No saved searches yet.</p>
                  <p className="text-xs text-muted-foreground">Save a search in the inventory to get alerted when new matching cars are listed.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedSearches.map(s => (
                    <div key={s.id} className="flex items-center gap-4 p-4 border border-border rounded-xl hover:bg-muted/20 transition-colors">
                      <div className="w-9 h-9 bg-[hsl(var(--gold)/0.1)] rounded-lg flex items-center justify-center shrink-0">
                        <Search className="w-4 h-4 text-[hsl(var(--gold))]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{s.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={cn('text-xs', s.alert_enabled ? 'text-green-600' : 'text-muted-foreground')}>
                            {s.alert_enabled ? '● Alerts on' : '○ Alerts off'}
                          </span>
                          <span className="text-xs text-muted-foreground">· {formatDate(s.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => runSearch(s.filters)} title="Run search">
                          <Search className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => { setEditSearch(s); setEditSearchOpen(true); }}>
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => setDeleteSearchId(s.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Notifications */}
            <TabsContent value="notifications" className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                </p>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllRead} className="h-8 text-xs gap-1.5">
                    <Check className="w-3.5 h-3.5" /> Mark all read
                  </Button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="text-center py-12 border border-border rounded-xl">
                  <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No notifications yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map(n => (
                    <div key={n.id} className={cn(
                      'flex items-start gap-3 p-4 border border-border rounded-xl cursor-pointer hover:bg-muted/20 transition-colors',
                      !n.is_read && 'bg-[hsl(var(--gold)/0.04)] border-[hsl(var(--gold)/0.15)]'
                    )} onClick={() => { markRead(n.id); if (n.link) navigate(n.link); }}>
                      {!n.is_read && <div className="w-2 h-2 rounded-full bg-[hsl(var(--gold))] shrink-0 mt-1.5" />}
                      <div className={cn('flex-1 min-w-0', n.is_read && 'ml-5')}>
                        <p className="text-sm font-medium">{n.title}</p>
                        {n.message && <p className="text-xs text-muted-foreground mt-0.5 text-pretty">{n.message}</p>}
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(n.created_at)}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="w-7 h-7 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={e => { e.stopPropagation(); setDeletingNotifId(n.id); }}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>{/* end main */}
      </div>

      {/* Edit saved search */}
      <Dialog open={editSearchOpen} onOpenChange={setEditSearchOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-sm">
          <DialogHeader><DialogTitle>Edit Saved Search</DialogTitle></DialogHeader>
          {editSearch && (
            <div className="space-y-4 py-2">
              <div>
                <Label className="text-xs mb-1.5 block">Search Name</Label>
                <Input value={editSearch.name} onChange={e => setEditSearch(s => s ? { ...s, name: e.target.value } : s)} className="h-9 text-sm" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Email Alerts</p>
                  <p className="text-xs text-muted-foreground">Get notified when new matches are listed</p>
                </div>
                <Switch checked={editSearch.alert_enabled} onCheckedChange={v => setEditSearch(s => s ? { ...s, alert_enabled: v } : s)} />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="ghost" size="sm" onClick={() => setEditSearchOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={updateSavedSearch}><Check className="w-4 h-4 mr-1" /> Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete saved search */}
      <AlertDialog open={!!deleteSearchId} onOpenChange={open => !open && setDeleteSearchId(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Saved Search?</AlertDialogTitle>
            <AlertDialogDescription>This search and its alert settings will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteSavedSearch} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete notification */}
      <AlertDialog open={!!deletingNotifId} onOpenChange={open => !open && setDeletingNotifId(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notification?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deletingNotifId) deleteNotification(deletingNotifId); setDeletingNotifId(null); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PublicLayout>
  );
}
