import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { 
  Package, 
  CalendarCheck, 
  TrendingUp, 
  Users,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface Stats {
  totalServices: number;
  totalBookings: number;
  pendingBookings: number;
  totalRevenue: number;
}

interface Booking {
  id: string;
  equipment_title: string;
  renter_email: string;
  start_date: string;
  status: string;
  total_price: number;
}

const OwnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalServices: 0,
    totalBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        // Fetch services stats
        const { data: services, error: servicesError } = await supabase
          .from('equipment')
          .select('id')
          .eq('owner_id', user.id);
        
        if (servicesError) throw servicesError;

        // Fetch bookings stats
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('*, equipment(title), profiles!bookings_renter_id_fkey(email)')
          .eq('owner_id', user.id);
        
        if (bookingsError) throw bookingsError;

        let totalRevenue = 0;
        let pendingCount = 0;
        
        bookings?.forEach(booking => {
          if (booking.status === "confirmed" || booking.status === "completed") {
            totalRevenue += booking.total_price || 0;
          }
          if (booking.status === "pending") pendingCount++;
        });

        setStats({
          totalServices: services?.length || 0,
          totalBookings: bookings?.length || 0,
          pendingBookings: pendingCount,
          totalRevenue: totalRevenue,
        });

        // Map recent bookings
        const mappedBookings = (bookings || []).slice(0, 5).map(b => ({
          id: b.id,
          equipment_title: b.equipment?.title || 'N/A',
          renter_email: b.profiles?.email || 'N/A',
          start_date: b.start_date,
          status: b.status,
          total_price: b.total_price || 0
        }));
        
        setRecentBookings(mappedBookings);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Services",
      value: stats.totalServices,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-100",
      trend: "+2 this month",
      trendUp: true
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      icon: CalendarCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      trend: "+12% growth",
      trendUp: true
    },
    {
      title: "Pending",
      value: stats.pendingBookings,
      icon: Users,
      color: "text-amber-600",
      bg: "bg-amber-100",
      trend: "Needs attention",
      trendUp: false
    },
    {
      title: "Revenue",
      value: `${stats.totalRevenue} GEL`,
      icon: TrendingUp,
      color: "text-violet-600",
      bg: "bg-violet-100",
      trend: "+5% vs last month",
      trendUp: true
    },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome, {user?.displayName || user?.email?.split('@')[0]}</h1>
        <p className="text-muted-foreground">Here's what's happening on your CargoConnect account today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                {stat.trendUp ? (
                  <div className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {stat.trend}
                  </div>
                ) : (
                  <div className="flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                    {stat.trend}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="p-6 pb-0">
            <CardTitle className="text-xl font-bold">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {recentBookings.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No bookings yet.
              </div>
            ) : (
              <div className="space-y-6">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {booking.renter_email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{booking.equipment_title}</p>
                        <p className="text-xs text-muted-foreground">{booking.renter_email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{booking.total_price} GEL</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(booking.start_date), "MMM d, yyyy")}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 
                      booking.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {booking.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="p-6 pb-0">
            <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <button 
              onClick={() => navigate("/owner/services/new")}
              className="w-full p-4 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-between group"
            >
              Add New Service
              <Package className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </button>
            <button 
              onClick={() => navigate("/owner/bookings")}
              className="w-full p-4 bg-muted hover:bg-muted/80 rounded-2xl font-bold flex items-center justify-between group"
            >
              View Bookings
              <CalendarCheck className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </button>
            <button 
              onClick={() => navigate("/owner/settings")}
              className="w-full p-4 bg-muted hover:bg-muted/80 rounded-2xl font-bold flex items-center justify-between group"
            >
              Account Settings
              <TrendingUp className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OwnerDashboard;
