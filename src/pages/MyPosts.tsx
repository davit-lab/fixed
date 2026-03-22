import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { db } from '@/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Package, 
  Truck, 
  Clock, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  PlusCircle,
  MapPin,
  Lock,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ka } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const MyPosts = () => {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<any>(null);
  const [hasActiveBookings, setHasActiveBookings] = useState(false);
  const [checkingBookings, setCheckingBookings] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Fetch cargo/route posts
    const qPosts = query(
      collection(db, 'posts'),
      where('userId', '==', user.uid)
    );

    // Fetch equipment posts
    const qEquipment = query(
      collection(db, 'equipment'),
      where('ownerId', '==', user.uid)
    );

    const unsubscribePosts = onSnapshot(qPosts, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        type: doc.data().type || 'post',
        ...doc.data()
      }));
      
      setPosts(prev => {
        const equipmentPosts = prev.filter(p => p.type === 'equipment');
        return [...equipmentPosts, ...postsData].sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB - dateA;
        });
      });
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'posts');
    });

    const unsubscribeEquipment = onSnapshot(qEquipment, (snapshot) => {
      const equipmentData = snapshot.docs.map(doc => ({
        id: doc.id,
        type: 'equipment',
        ...doc.data()
      }));

      setPosts(prev => {
        const nonEquipmentPosts = prev.filter(p => p.type !== 'equipment');
        return [...nonEquipmentPosts, ...equipmentData].sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB - dateA;
        });
      });
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'equipment');
    });

    return () => {
      unsubscribePosts();
      unsubscribeEquipment();
    };
  }, [user]);

  const checkForActiveBookings = async (post: any) => {
    if (post.type !== 'equipment') return false;
    
    try {
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('equipmentId', '==', post.id),
        where('status', 'in', ['pending', 'confirmed'])
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);
      return !bookingsSnapshot.empty;
    } catch (error) {
      console.error('Error checking bookings:', error);
      return false;
    }
  };

  const handleDeleteClick = async (post: any) => {
    setPostToDelete(post);
    setCheckingBookings(true);
    setDeleteDialogOpen(true);
    
    const hasBookings = await checkForActiveBookings(post);
    setHasActiveBookings(hasBookings);
    setCheckingBookings(false);
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    
    setIsDeleting(true);
    const collectionName = postToDelete.type === 'equipment' ? 'equipment' : 'posts';
    
    try {
      await deleteDoc(doc(db, collectionName, postToDelete.id));
      toast.success('განცხადება წაიშალა');
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    } catch (error: any) {
      console.error('Error deleting post:', error);
      toast.error('წაშლა ვერ მოხერხდა');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (post: any) => {
    const newStatus = post.status === 'active' ? 'completed' : 'active';
    try {
      await updateDoc(doc(db, 'posts', post.id), { status: newStatus });
      toast.success('სტატუსი განახლდა');
    } catch (error: any) {
      console.error('Error updating status:', error);
      if (error.message && error.message.includes('{"error":')) throw error;
      handleFirestoreError(error, OperationType.UPDATE, `posts/${post.id}`);
    }
  };

  return (
    <div className="py-24 bg-background min-h-screen relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-amber-500/5 blur-[140px] -z-10" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] -z-10" />

      <div className="max-w-screen-2xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-20">
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-black uppercase tracking-[0.2em] border border-amber-500/10 shadow-sm"
            >
              <Package className="h-3.5 w-3.5" />
              მართვა
            </motion.div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] font-display">
              ჩემი <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600">განცხადებები</span>
            </h1>
            <p className="text-muted-foreground text-xl md:text-2xl font-medium leading-relaxed max-w-md">
              მართეთ თქვენი ტვირთები, რეისები და სპეცტექნიკა ერთ სივრცეში.
            </p>
          </div>
          <Button asChild size="lg" className="rounded-full px-10 h-16 font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-amber-500/20 hover:scale-105 transition-all bg-amber-500 hover:bg-amber-600">
            <Link to="/create-post">
              <PlusCircle className="mr-3 h-5 w-5" /> დამატება
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[400px] rounded-[3rem] bg-card/50 animate-pulse border border-border/50" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-40 bg-card/30 backdrop-blur-sm rounded-[4rem] border-4 border-dashed border-border/50 flex flex-col items-center justify-center space-y-8"
          >
            <div className="h-32 w-32 rounded-[2.5rem] bg-secondary flex items-center justify-center shadow-inner">
              <Package className="h-16 w-16 text-muted-foreground opacity-40" />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-black tracking-tighter">განცხადებები არ გაქვთ</h3>
              <p className="text-muted-foreground text-lg font-medium">განათავსეთ თქვენი პირველი განცხადება დღესვე</p>
            </div>
            <Button asChild size="lg" className="rounded-full px-12 h-16 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-amber-500/20 bg-amber-500 hover:bg-amber-600">
              <Link to="/create-post">დამატება</Link>
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`group rounded-[3rem] border-none shadow-sm hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] transition-all duration-500 overflow-hidden bg-card/50 backdrop-blur-sm flex flex-col h-full ${post.status === 'completed' ? 'opacity-60 grayscale' : ''}`}>
                  <div className="p-10 pb-6 space-y-8 flex-1">
                    <div className="flex items-center justify-between">
                      <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${
                        post.type === 'cargo' 
                          ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' 
                          : post.type === 'route'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                        {post.type === 'cargo' ? 'ტვირთი' : post.type === 'route' ? 'რეისი' : 'სპეცტექნიკა'}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                        <Clock className="h-3.5 w-3.5" />
                        {post.createdAt?.toDate ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true, locale: ka }) : 'ახლახანს'}
                      </div>
                    </div>

                    <div className="space-y-6 relative">
                      {post.type !== 'equipment' ? (
                        <>
                          <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-amber-500 via-amber-500/20 to-emerald-500 rounded-full" />
                          
                          <div className="flex items-start gap-6 pl-6">
                            <div className="mt-1.5 h-3 w-3 rounded-full bg-amber-500 ring-4 ring-amber-500/20 shrink-0" />
                            <div className="space-y-1">
                              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">საიდან</p>
                              <p className="font-black text-lg tracking-tight line-clamp-1">{post.origin?.address}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-6 pl-6">
                            <div className="mt-1.5 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 shrink-0" />
                            <div className="space-y-1">
                              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">სად</p>
                              <p className="font-black text-lg tracking-tight line-clamp-1">{post.destination?.address}</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-4">
                          <div className="aspect-video rounded-2xl overflow-hidden bg-muted">
                            <img 
                              src={post.image || (post.images && post.images[0]) || post.imageUrl || `https://picsum.photos/seed/${post.id}/400/300`} 
                              alt={post.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-black text-xl tracking-tight line-clamp-1">{post.title}</h3>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">{post.location}</span>
                            </div>
                            <p className="text-amber-600 font-black">₾{post.price} / სთ</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-10 pt-6 border-t border-border/50 bg-secondary/20">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1.5">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">სტატუსი</p>
                        <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest ${post.status !== 'completed' ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                          {post.status !== 'completed' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                          {post.status !== 'completed' ? 'აქტიური' : 'დასრულებული'}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {post.type !== 'equipment' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-12 w-12 rounded-2xl bg-card hover:bg-amber-500/10 hover:text-amber-600 transition-all shadow-sm border border-border/50"
                            onClick={() => handleToggleStatus(post)}
                            title={post.status === 'active' ? 'დასრულება' : 'გააქტიურება'}
                          >
                            <CheckCircle2 className="h-5 w-5" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-12 w-12 rounded-2xl bg-card hover:bg-red-500/10 hover:text-red-500 transition-all shadow-sm border border-border/50"
                          onClick={() => handleDeleteClick(post)}
                          title="წაშლა"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-[2rem] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-3">
              {checkingBookings ? (
                <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
              ) : hasActiveBookings ? (
                <Lock className="h-6 w-6 text-red-500" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              )}
              {checkingBookings ? 'მოწმდება...' : hasActiveBookings ? 'წაშლა შეუძლებელია' : 'განცხადების წაშლა'}
            </DialogTitle>
            <DialogDescription className="text-base">
              {checkingBookings ? (
                'მიმდინარეობს აქტიური ჯავშნების შემოწმება...'
              ) : hasActiveBookings ? (
                <div className="space-y-4 mt-4">
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <p className="text-red-600 font-medium">
                      ამ განცხადებას აქვს აქტიური ან მომლოდინე ჯავშნები. წაშლა შესაძლებელი იქნება მხოლოდ მას შემდეგ, რაც ყველა ჯავშანი დასრულდება ან გაუქმდება.
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    გადადით ჯავშნების გვერდზე აქტიური ჯავშნების სანახავად.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 mt-4">
                  <p>ნამდვილად გსურთ ამ განცხადების წაშლა?</p>
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <p className="text-amber-600 font-medium text-sm">
                      ეს მოქმედება შეუქცევადია. განცხადება სამუდამოდ წაიშლება.
                    </p>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              className="rounded-xl"
            >
              გაუქმება
            </Button>
            {!checkingBookings && !hasActiveBookings && (
              <Button 
                variant="destructive" 
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="rounded-xl"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                წაშლა
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyPosts;
