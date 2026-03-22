import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  Users, 
  Package, 
  Calendar, 
  TrendingUp, 
  Activity,
  ArrowUpRight
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEquipment: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });
  const [recentUsers, setRecentUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, equipRes, bookingsRes] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('equipment').select('*', { count: 'exact', head: true }),
          supabase.from('bookings').select('total_price, status')
        ]);

        let revenue = 0;
        bookingsRes.data?.forEach(booking => {
          if (booking.status === "confirmed" || booking.status === "completed") {
            revenue += booking.total_price || 0;
          }
        });

        setStats({
          totalUsers: usersRes.count || 0,
          totalEquipment: equipRes.count || 0,
          totalBookings: bookingsRes.data?.length || 0,
          totalRevenue: revenue,
        });

        // Fetch recent users
        const { data: users } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        
        setRecentUsers(users || []);
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const chartData = [
    { name: "Mon", users: 40, bookings: 24 },
    { name: "Tue", users: 30, bookings: 13 },
    { name: "Wed", users: 20, bookings: 98 },
    { name: "Thu", users: 27, bookings: 39 },
    { name: "Fri", users: 18, bookings: 48 },
    { name: "Sat", users: 23, bookings: 38 },
    { name: "Sun", users: 34, bookings: 43 },
  ];

  const statCards = [
    { label: "Users", value: stats.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-50", trend: "+12%" },
    { label: "Equipment", value: stats.totalEquipment, icon: Package, color: "text-purple-600", bg: "bg-purple-50", trend: "+5%" },
    { label: "Bookings", value: stats.totalBookings, icon: Calendar, color: "text-orange-600", bg: "bg-orange-50", trend: "+18%" },
    { label: "Revenue", value: `$${stats.totalRevenue}`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+24%" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">System overview and statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="border shadow-sm rounded-3xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className={cn("p-3 rounded-2xl", stat.bg)}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  <ArrowUpRight className="h-3 w-3" />
                  {stat.trend}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="p-6 pb-0">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-amber-500" />
              Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="users" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="bookings" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="p-6">
            <CardTitle className="text-xl font-bold">Recent Users</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-6">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center font-bold text-sm text-amber-600">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{user.full_name || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {user.role}
                  </div>
                </div>
              ))}
              {recentUsers.length === 0 && (
                <p className="text-sm text-center text-muted-foreground py-8">No users found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
