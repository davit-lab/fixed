import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { supabase, Post } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { MessageSquare, MapPin, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Fix Leaflet default marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const cargoIcon = L.divIcon({
  html: `<div style="width:32px;height:32px;background:#f59e0b;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -34],
  className: '',
});

const routeIcon = L.divIcon({
  html: `<div style="width:32px;height:32px;background:#10b981;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -34],
  className: '',
});

const MapView = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'cargo' | 'route'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'active');

      if (!error) setPosts(data || []);
      setLoading(false);
    };

    fetchPosts();

    const channel = supabase
      .channel('map-posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, fetchPosts)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const filteredPosts = posts.filter(p => {
    if (filter === 'all') return true;
    return p.type === filter;
  });

  const visiblePosts = filteredPosts.filter(p => p.origin_lat && p.origin_lng);

  if (loading) {
    return (
      <div className="h-[80vh] w-full flex items-center justify-center bg-muted/20 rounded-2xl">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <p className="text-sm text-muted-foreground font-medium">რუკა იტვირთება...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 p-1 bg-secondary/60 rounded-xl border border-border/40">
          {(['all', 'cargo', 'route'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                filter === f
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f === 'all' ? 'ყველა' : f === 'cargo' ? 'ტვირთები' : 'რეისები'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground ml-auto">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-amber-500" />
            <span className="font-medium">ტვირთი ({posts.filter(p => p.type === 'cargo' && p.origin_lat).length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="font-medium">რეისი ({posts.filter(p => p.type === 'route' && p.origin_lat).length})</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="h-[70vh] w-full rounded-2xl overflow-hidden shadow-xl border border-border/50 relative">
        <MapContainer
          center={[42.3154, 43.3569]}
          zoom={7}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <ZoomControl position="bottomright" />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {visiblePosts.map((post) => (
            <Marker
              key={post.id}
              position={[post.origin_lat!, post.origin_lng!]}
              icon={post.type === 'cargo' ? cargoIcon : routeIcon}
            >
              <Popup minWidth={220}>
                <div className="space-y-3 p-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      post.type === 'cargo'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {post.type === 'cargo' ? 'ტვირთი' : 'რეისი'}
                    </span>
                    {post.price && (
                      <span className="font-bold text-amber-600 text-sm">{post.price} GEL</span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-start gap-2 text-xs">
                      <div className="h-2 w-2 rounded-full bg-amber-500 mt-1 shrink-0" />
                      <span className="font-medium line-clamp-1">{post.origin_address || 'დასაწყისი'}</span>
                    </div>
                    {post.destination_address && (
                      <div className="flex items-start gap-2 text-xs">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                        <span className="font-medium line-clamp-1">{post.destination_address}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => navigate(`/messages?chatWith=${post.user_id}`)}
                    className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="h-3 w-3" />
                    მიწერა
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* No posts overlay */}
        {visiblePosts.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1000]">
            <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-6 text-center shadow-xl border border-border/50">
              <MapPin className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm font-bold">განცხადებები არ მოიძებნა</p>
              <p className="text-xs text-muted-foreground mt-1">კოორდინატები არ არის მითითებული</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
