import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Star, MessageSquare, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface Review {
  id: string;
  reviewer_id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface ReviewsProps {
  equipmentId: string;
  ownerId: string;
}

export const Reviews: React.FC<ReviewsProps> = ({ equipmentId, ownerId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles(full_name, avatar_url)')
        .eq('equipment_id', equipmentId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reviews:', error);
      } else {
        setReviews(data || []);
      }
      setLoading(false);
    };

    fetchReviews();

    // Set up realtime subscription
    const channel = supabase
      .channel('reviews-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'reviews', filter: `equipment_id=eq.${equipmentId}` },
        () => {
          fetchReviews();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [equipmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to leave a review');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          equipment_id: equipmentId,
          reviewer_id: user.id,
          rating,
          comment,
        });

      if (error) throw error;

      setComment('');
      setRating(5);
      toast.success('Review added successfully');
    } catch (error) {
      console.error('Error adding review:', error);
      toast.error('Error adding review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black tracking-tighter flex items-center gap-4">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          Reviews
          <span className="text-muted-foreground text-lg ml-2">({reviews.length})</span>
        </h2>
      </div>

      {user && user.id !== ownerId && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 md:p-10 rounded-[2.5rem] bg-card/50 backdrop-blur-sm border border-border/50 shadow-sm space-y-8"
        >
          <div className="space-y-2">
            <h3 className="text-xl font-black tracking-tight">Leave a Review</h3>
            <p className="text-muted-foreground text-sm font-medium">Share your experience</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex items-center gap-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-all hover:scale-125 active:scale-95"
                >
                  <Star 
                    className={`h-8 w-8 ${star <= rating ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/30'}`} 
                  />
                </button>
              ))}
              <span className="ml-4 text-2xl font-black text-amber-500">{rating}.0</span>
            </div>

            <div className="relative">
              <Textarea
                placeholder="Write your thoughts..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[150px] rounded-[2rem] p-8 bg-secondary/30 border-none focus-visible:ring-primary/20 text-lg font-medium resize-none"
              />
            </div>

            <Button 
              type="submit" 
              disabled={submitting}
              className="h-16 px-10 rounded-full font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:scale-105 transition-all"
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                <>
                  Submit
                  <Send className="ml-3 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </motion.div>
      )}

      <div className="space-y-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 bg-secondary/10 rounded-[3rem] border-2 border-dashed border-border/50">
            <MessageSquare className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No reviews yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            <AnimatePresence mode="popLayout">
              {reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-8 md:p-10 rounded-[2.5rem] bg-card/30 backdrop-blur-sm border border-border/50 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="h-16 w-16 rounded-2xl overflow-hidden border-2 border-primary/10 shadow-lg shrink-0">
                        {review.profiles?.avatar_url ? (
                          <img src={review.profiles.avatar_url} alt={review.profiles.full_name || 'User'} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-primary/5 flex items-center justify-center text-primary font-black text-xl">
                            {(review.profiles?.full_name || 'U')[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xl font-black tracking-tight">{review.profiles?.full_name || 'User'}</h4>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star}
                                className={`h-3 w-3 ${star <= review.rating ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/20'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                            {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 relative">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/10 rounded-full group-hover:bg-primary/30 transition-colors" />
                    <p className="text-lg font-medium text-muted-foreground leading-relaxed pl-4 italic">
                      "{review.comment}"
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
