import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { 
  CalendarCheck, 
  Check, 
  X, 
  Loader2,
  Mail,
  Calendar as CalendarIcon,
  Clock,
  Phone,
  MapPin,
  FileText,
  Lock,
  AlertTriangle,
  User,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { format, differenceInHours } from "date-fns";
import { ka } from "date-fns/locale";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface Booking {
  id: string;
  equipment_id: string;
  user_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  created_at: string;
  updated_at: string;
}

const OwnerBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const fetchBookings = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data as Booking[]);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("ჯავშნების ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const canCancelBooking = (booking: Booking) => {
    if (booking.status !== 'confirmed') return true;
    const confirmedDate = new Date(booking.updated_at);
    const hoursSinceConfirmation = differenceInHours(new Date(), confirmedDate);
    return hoursSinceConfirmation < 24;
  };

  const handleStatusChange = async (id: string, newStatus: "confirmed" | "cancelled" | "pending" | "completed") => {
    const booking = bookings.find(b => b.id === id);
    
    if (newStatus === 'cancelled' && booking && !canCancelBooking(booking)) {
      toast.error("გაუქმება შეუძლებელია", {
        description: "დადასტურებიდან გასულია 24 საათზე მეტი"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
      
      const messages: Record<string, string> = {
        confirmed: "ჯავშანი დადასტურდა",
        cancelled: "ჯავშანი გაუქმდა",
        completed: "ჯავშანი დასრულდა",
        pending: "სტატუსი განახლდა"
      };
      
      toast.success(messages[newStatus]);
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("სტატუსის შეცვლა ვერ მოხერხდა");
    }
  };

  const openBookingDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setDetailsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">ჯავშნები</h1>
        <p className="text-muted-foreground">მართეთ თქვენი სერვისების ჯავშნები</p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-20 bg-card border border-dashed rounded-3xl">
          <CalendarCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">ჯავშნები ჯერ არ არის.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {bookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card border border-border rounded-3xl p-6 hover:shadow-lg transition-all"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 
                      booking.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                      booking.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {booking.status === 'confirmed' ? 'დადასტურებული' : 
                       booking.status === 'pending' ? 'მომლოდინე' : 
                       booking.status === 'completed' ? 'დასრულებული' :
                       'გაუქმებული'}
                    </div>
                    {booking.status === 'confirmed' && !canCancelBooking(booking) && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-stone-100 text-stone-600 text-[10px] font-bold">
                        <Lock className="h-3 w-3" />
                        ჩაკეტილი
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground">
                      ID: {booking.id.slice(0, 8)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">დამქირავებელი</p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-amber-500" />
                          <span className="font-medium">მომხმარებელი</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">ჯავშნის დეტალები</p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarIcon className="h-4 w-4 text-amber-500" />
                          <span className="font-medium">{format(new Date(booking.start_date), "PPP", { locale: ka })}</span>
                        </div>
                        <div className="text-lg font-bold text-amber-600">
                          {booking.total_price} ₾
                        </div>
                      </div>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 space-y-1">
                      <div className="flex items-start gap-2 text-sm">
                        <FileText className="h-4 w-4 text-amber-500 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">შენიშვნა</span>
                          <span className="text-amber-800">{booking.notes}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-row lg:flex-col justify-end gap-2 lg:min-w-[140px]">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="rounded-xl gap-2"
                    onClick={() => openBookingDetails(booking)}
                  >
                    <FileText className="h-4 w-4" />
                    დეტალები
                  </Button>
                  
                  {booking.status === "pending" && (
                    <>
                      <Button 
                        size="sm"
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 gap-2"
                        onClick={() => handleStatusChange(booking.id, "confirmed")}
                      >
                        <Check className="h-4 w-4" />
                        დადასტურება
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="rounded-xl text-destructive hover:bg-destructive hover:text-destructive-foreground gap-2"
                        onClick={() => handleStatusChange(booking.id, "cancelled")}
                      >
                        <X className="h-4 w-4" />
                        უარყოფა
                      </Button>
                    </>
                  )}
                  
                  {booking.status === "confirmed" && (
                    <>
                      <Button 
                        size="sm"
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 gap-2"
                        onClick={() => handleStatusChange(booking.id, "completed")}
                      >
                        <Check className="h-4 w-4" />
                        დასრულება
                      </Button>
                      {canCancelBooking(booking) && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="rounded-xl text-destructive hover:bg-destructive hover:text-destructive-foreground gap-2"
                          onClick={() => handleStatusChange(booking.id, "cancelled")}
                        >
                          <X className="h-4 w-4" />
                          გაუქმება
                        </Button>
                      )}
                    </>
                  )}

                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="rounded-xl gap-2"
                    onClick={() => navigate(`/messages?chatWith=${booking.user_id}`)}
                  >
                    <MessageSquare className="h-4 w-4" />
                    შეტყობინება
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="rounded-[2rem] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-tight">ჯავშნის დეტალები</DialogTitle>
            <DialogDescription>
              დეტალური ინფორმაცია
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-6 mt-4">
              <div className="flex items-center gap-3">
                <div className={`px-4 py-2 rounded-xl text-sm font-bold ${
                  selectedBooking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 
                  selectedBooking.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                  selectedBooking.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                  'bg-rose-100 text-rose-700'
                }`}>
                  {selectedBooking.status === 'confirmed' ? 'დადასტურებული' : 
                   selectedBooking.status === 'pending' ? 'მომლოდინე' : 
                   selectedBooking.status === 'completed' ? 'დასრულებული' :
                   'გაუქმებული'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 space-y-3">
                <h4 className="font-bold text-sm flex items-center gap-2 text-amber-800">
                  <CalendarIcon className="h-4 w-4 text-amber-500" />
                  ჯავშნის დრო
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-700 text-sm">დაწყების თარიღი:</span>
                    <span className="font-bold text-amber-800">{format(new Date(selectedBooking.start_date), "PPP", { locale: ka })}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-700 text-sm">დასრულების თარიღი:</span>
                    <span className="font-bold text-amber-800">{format(new Date(selectedBooking.end_date), "PPP", { locale: ka })}</span>
                  </div>
                </div>
              </div>

              {selectedBooking.notes && (
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 space-y-2">
                  <h4 className="font-bold text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4 text-stone-500" />
                    შენიშვნა
                  </h4>
                  <p className="text-sm text-stone-600">{selectedBooking.notes}</p>
                </div>
              )}

              <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                <span className="font-medium text-emerald-700">საიტოგო ფასი:</span>
                <span className="text-2xl font-black text-emerald-600">{selectedBooking.total_price} ₾</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OwnerBookings;
