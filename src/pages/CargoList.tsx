import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Phone, 
  Search, 
  Filter,
  Clock,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Post {
  id: string;
  title: string;
  description: string | null;
  from_location: string | null;
  to_location: string | null;
  price: number | null;
  created_at: string;
  user_id: string;
  profiles?: {
    phone: string | null;
  };
}

const CargoList = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles(phone)')
        .eq('type', 'cargo')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        toast.error('Error loading cargo posts');
      } else {
        setPosts(data || []);
      }
      setLoading(false);
    };

    fetchPosts();

    // Set up realtime subscription
    const channel = supabase
      .channel('cargo-posts')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'posts', filter: `type=eq.cargo` },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleContact = (post: Post) => {
    if (!user) {
      toast.error('Please log in first');
      navigate('/login');
      return;
    }
    if (user.id === post.user_id) {
      toast.info('This is your own post');
      return;
    }
    navigate(`/messages?chatWith=${post.user_id}`);
  };

  const filteredPosts = posts.filter(post => 
    post.from_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.to_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Section */}
      <section className="relative pt-8 pb-16 md:pt-12 md:pb-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/10 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-screen-xl mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 mb-10">
            {/* Header */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
                <Package className="h-3.5 w-3.5" />
                Cargo Database
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">
                Active{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Cargo</span>
              </h1>
              <p className="text-muted-foreground text-base md:text-lg font-medium max-w-md leading-relaxed">
                Find the best cargo shipping offers across the entire region.
              </p>
              <Button 
                asChild 
                className="h-12 px-6 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/20 border-0 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Link to="/create-post">
                  Post Cargo
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            {/* Search */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-amber-500 transition-colors" />
                <input 
                  placeholder="Search..." 
                  className="w-full pl-11 pr-4 h-12 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all text-sm font-medium outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-12 w-12 rounded-xl border-border/50 bg-card/80 backdrop-blur-sm hover:bg-secondary shrink-0 transition-all"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap items-center gap-4 p-4 rounded-2xl bg-card/50 border border-border/30 backdrop-blur-sm mb-10">
            <div className="flex items-center gap-2 text-sm">
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-amber-500" />
              </div>
              <span className="text-muted-foreground">Total:</span>
              <span className="font-bold">{filteredPosts.length} cargo</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-screen-xl mx-auto px-4 md:px-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[380px] rounded-2xl bg-card/50 border border-border/30 animate-pulse" />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredPosts.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-24 bg-card/30 backdrop-blur-sm rounded-3xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center space-y-6"
              >
                <div className="h-24 w-24 rounded-2xl bg-secondary flex items-center justify-center">
                  <Package className="h-12 w-12 text-muted-foreground/40" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">No posts found</h3>
                  <p className="text-muted-foreground">Try a different search term or change filters</p>
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    layout
                  >
                    <Card className="group h-full rounded-2xl border border-border/50 bg-card hover:shadow-xl hover:shadow-amber-500/5 hover:border-amber-500/20 transition-all duration-500 overflow-hidden flex flex-col">
                      <div className="p-6 pb-4 space-y-6 flex-1">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold">
                            Cargo
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                          </div>
                        </div>

                        {/* Route */}
                        <div className="space-y-4 relative">
                          <div className="absolute left-[7px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-amber-500 via-amber-500/30 to-emerald-500 rounded-full" />
                          
                          <div className="flex items-start gap-4 pl-5">
                            <div className="mt-1 h-3 w-3 rounded-full bg-amber-500 ring-4 ring-amber-500/20 shrink-0 -ml-[7px]" />
                            <div>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">From</p>
                              <p className="font-bold text-base">{post.from_location || 'Not specified'}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-4 pl-5">
                            <div className="mt-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 shrink-0 -ml-[7px]" />
                            <div>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">To</p>
                              <p className="font-bold text-base">{post.to_location || 'Not specified'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-muted-foreground font-medium leading-relaxed line-clamp-2">
                          {post.description}
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="p-6 pt-4 border-t border-border/50 bg-secondary/30">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Budget</p>
                            <p className="text-2xl font-black text-amber-500 tracking-tight">
                              {post.price ? `${post.price} GEL` : 'Negotiable'}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-11 w-11 rounded-xl border-border/50 hover:bg-amber-500/10 hover:text-amber-600 hover:border-amber-500/30 transition-all"
                              onClick={() => post.profiles?.phone && window.open(`tel:${post.profiles.phone}`)}
                            >
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button 
                              onClick={() => handleContact(post)}
                              className="h-11 rounded-xl px-5 font-bold text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/20 border-0 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                              Message
                              <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        )}
      </section>
    </div>
  );
};

export default CargoList;
