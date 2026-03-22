import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ChevronRight,
  Package
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface BookingWithEquipment {
  id: string;
  equipment_id: string;
  user_id: string;
  status: string;
  start_date: string;
  end_date: string;
  total_price: number;
  equipment?: {
    id: string;
    title: string;
    image_url: string;
    location: string;
    price: number;
  };
}

const UserDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingWithEquipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            equipment:equipment_id (
              id,
              title,
              image_url,
              location,
              price
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBookings(data || []);
      } catch (error) {
        console.error("Error fetching user bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider">
            <CheckCircle2 className="h-3 w-3" />
            დადასტურებული
          </div>
        );
      case "cancelled":
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase tracking-wider">
            <XCircle className="h-3 w-3" />
            გაუქმებული
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-[10px] font-black uppercase tracking-wider">
            <AlertCircle className="h-3 w-3" />
            მოდერაციაშია
          </div>
        );
    }
  };

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || "მომხმარებელო";

  return (
    <div className="py-24 bg-background min-h-screen relative overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-20">
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-black uppercase tracking-[0.2em] border border-amber-500/20"
            >
              <Calendar className="h-3.5 w-3.5" />
              მართვის პანელი
            </motion.div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85]">
              გამარჯობა, <br />
              <span className="text-amber-500">{userName}</span>
            </h1>
            <p className="text-muted-foreground text-xl md:text-2xl font-medium leading-relaxed max-w-md">
              თქვენი ჯავშნების ისტორია და სტატუსი ერთ სივრცეში.
            </p>
          </div>
          <Button asChild size="lg" className="rounded-full px-10 h-16 font-black uppercase tracking-widest text-[10px] bg-amber-500 hover:bg-amber-600 text-white">
            <Link to="/heavy-equipment">
              <Package className="mr-3 h-5 w-5" /> ახალი ჯავშანი
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20">
          {[
            { label: 'სულ ჯავშნები', value: bookings.length, icon: Calendar, color: 'amber' },
            { label: 'დადასტურებული', value: bookings.filter(b => b.status === "confirmed").length, icon: CheckCircle2, color: 'emerald' },
            { label: 'მოლოდინში', value: bookings.filter(b => b.status === "pending").length, icon: Clock, color: 'orange' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border shadow-sm hover:shadow-xl transition-all duration-500 rounded-3xl overflow-hidden bg-card group">
                <CardContent className="p-10 flex items-center gap-8">
                  <div className={cn(
                    "h-20 w-20 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110",
                    stat.color === 'amber' ? "bg-amber-500/10 text-amber-500" : 
                    stat.color === 'emerald' ? "bg-emerald-500/10 text-emerald-500" : 
                    "bg-orange-500/10 text-orange-500"
                  )}>
                    <stat.icon className="h-10 w-10" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{stat.label}</p>
                    <h3 className="text-5xl font-black tracking-tighter">{stat.value}</h3>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="space-y-10">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black tracking-tighter">ბოლო ჯავშნები</h2>
            <div className="h-px flex-1 mx-8 bg-border/50 hidden md:block" />
          </div>

          <div className="grid grid-cols-1 gap-8">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-48 bg-card rounded-3xl animate-pulse border" />
              ))
            ) : bookings.length > 0 ? (
              bookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border shadow-sm rounded-3xl overflow-hidden group hover:shadow-xl transition-all duration-500 bg-card">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-72 h-64 md:h-auto relative overflow-hidden">
                          <img 
                            src={booking.equipment?.image_url || `https://picsum.photos/seed/${booking.equipment_id}/800/600`} 
                            alt={booking.equipment?.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            crossOrigin="anonymous"
                          />
                        </div>
                        <div className="flex-1 p-10 flex flex-col justify-between">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                            <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                {getStatusBadge(booking.status)}
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">
                                  ID: {booking.id.slice(0, 8)}
                                </span>
                              </div>
                              <h3 className="text-3xl font-black tracking-tighter group-hover:text-amber-500 transition-colors leading-tight">
                                {booking.equipment?.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground font-medium">
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                                    <Calendar className="h-4 w-4 text-amber-500" />
                                  </div>
                                  {new Date(booking.start_date).toLocaleDateString('ka-GE', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                                    <MapPin className="h-4 w-4 text-amber-500" />
                                  </div>
                                  {booking.equipment?.location}
                                </div>
                              </div>
                            </div>
                            <div className="text-right space-y-1">
                              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">ჯამური ფასი</p>
                              <p className="text-5xl font-black text-amber-500 tracking-tighter">${booking.total_price}</p>
                            </div>
                          </div>
                          <div className="mt-10 flex items-center justify-end">
                            <Button variant="ghost" className="rounded-2xl h-14 px-8 gap-3 group/btn font-black uppercase tracking-widest text-[10px] bg-secondary/50 hover:bg-amber-500/10 hover:text-amber-600 transition-all" asChild>
                              <Link to={`/equipment/${booking.equipment_id}`}>
                                დეტალები
                                <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-2 transition-transform" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-40 bg-card rounded-3xl border-2 border-dashed flex flex-col items-center justify-center space-y-8"
              >
                <div className="h-32 w-32 rounded-2xl bg-secondary flex items-center justify-center">
                  <Package className="h-16 w-16 text-muted-foreground opacity-40" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-black tracking-tighter">ჯავშნები არ მოიძებნა</h3>
                  <p className="text-muted-foreground text-lg font-medium">თქვენ ჯერ არ გაგიკეთებიათ ჯავშანი</p>
                </div>
                <Button asChild size="lg" className="rounded-full px-12 h-16 font-black uppercase tracking-widest text-[10px] bg-amber-500 hover:bg-amber-600 text-white">
                  <Link to="/heavy-equipment">დაიწყეთ ძებნა</Link>
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
