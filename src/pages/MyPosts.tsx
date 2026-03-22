--- START OF FILE src/pages/MyPosts.tsx ---
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Truck, Clock, Trash2, CheckCircle2, PlusCircle, MapPin, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ka } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const MyPosts = () => {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserContent = async () => {
    if (!user) return;
    try {
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id);

      const { data: equipData } = await supabase
        .from('equipment')
        .select('*')
        .eq('user_id', user.id);

      const combined = [
        ...(postsData || []),
        ...(equipData || []).map(e => ({ ...e, type: 'equipment' }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setPosts(combined);
    } catch (error) {
      toast.error("მონაცემების ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserContent();
  }, [user]);

  const handleDelete = async (id: string, type: string) => {
    if (!confirm("ნამდვილად გსურთ წაშლა?")) return;
    
    const table = type === 'equipment' ? 'equipment' : 'posts';
    const { error } = await supabase.from(table).delete().eq('id', id);

    if (error) {
        toast.error("წაშლა ვერ მოხერხდა");
    } else {
        toast.success("წაიშალა");
        fetchUserContent();
    }
  };

  return (
    <div className="py-24 bg-background min-h-screen">
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-5xl font-black tracking-tighter">ჩემი განცხადებები</h1>
          </div>
          <Button asChild className="rounded-xl h-12 bg-amber-500">
            <Link to="/create-post"><PlusCircle className="mr-2 h-4 w-4" /> დამატება</Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-amber-500" /></div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-3xl">
            <p className="text-muted-foreground">განცხადებები არ გაქვთ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card key={post.id} className="rounded-3xl border overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-[10px] font-bold uppercase p-1 px-2 bg-secondary rounded-md">{post.type}</span>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id, post.type)} className="text-red-500 h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <h3 className="font-bold text-lg">{post.title || post.type}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{post.origin_address || post.location}</span>
                  </div>
                  <div className="pt-4 border-t flex justify-between items-center">
                    <span className="font-black text-amber-600">₾{post.price}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{post.status}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPosts;
