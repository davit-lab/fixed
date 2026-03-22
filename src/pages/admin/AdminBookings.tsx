import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  MoreVertical, 
  Search, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface Booking {
  id: string;
  equipment_id: string;
  user_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  notes?: string;
  created_at: string;
  equipment?: {
    title: string;
  };
  user_profile?: {
    email: string;
    full_name: string;
  };
}

const AdminBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          equipment:equipment_id (title),
          user_profile:user_id (email, full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
      toast.success(`Status updated: ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const filteredBookings = bookings.filter(booking => 
    booking.equipment?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.user_profile?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-600">
            <CheckCircle className="h-3 w-3" /> Confirmed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-600">
            <XCircle className="h-3 w-3" /> Cancelled
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-600">
            <CheckCircle className="h-3 w-3" /> Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-600">
            <Clock className="h-3 w-3" /> Pending
          </span>
        );
    }
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bookings</h1>
        <p className="text-muted-foreground">Manage all bookings in the system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-4 border shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total</p>
          <p className="text-3xl font-black">{stats.total}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Pending</p>
          <p className="text-3xl font-black text-amber-600">{stats.pending}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Confirmed</p>
          <p className="text-3xl font-black text-emerald-600">{stats.confirmed}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Completed</p>
          <p className="text-3xl font-black text-blue-600">{stats.completed}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-red-50 rounded-2xl p-4 border border-red-100">
          <p className="text-[10px] font-bold uppercase tracking-wider text-red-600">Cancelled</p>
          <p className="text-3xl font-black text-red-600">{stats.cancelled}</p>
        </motion.div>
      </div>

      <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-2xl shadow-sm border">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder="Search by equipment or email..." 
          className="border-none focus-visible:ring-0 bg-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-card rounded-3xl shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b">
              <TableHead className="px-6 py-4">Equipment</TableHead>
              <TableHead className="px-6 py-4">User</TableHead>
              <TableHead className="px-6 py-4">Dates</TableHead>
              <TableHead className="px-6 py-4">Price</TableHead>
              <TableHead className="px-6 py-4">Status</TableHead>
              <TableHead className="px-6 py-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.map((booking) => (
              <TableRow key={booking.id} className="group hover:bg-muted/30 transition-colors">
                <TableCell className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">{booking.equipment?.title || 'N/A'}</span>
                    <span className="text-xs text-muted-foreground">ID: {booking.id.slice(0, 8)}</span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-sm">{booking.user_profile?.full_name || "User"}</span>
                    <span className="text-xs text-muted-foreground">{booking.user_profile?.email}</span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-amber-500" />
                    {booking.start_date ? format(new Date(booking.start_date), "dd/MM/yyyy") : "N/A"}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span className="font-bold text-sm text-amber-600">${booking.total_price}</span>
                </TableCell>
                <TableCell className="px-6 py-4">
                  {getStatusBadge(booking.status)}
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, "pending")}>
                          <Clock className="h-4 w-4 mr-2 text-amber-500" />
                          Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, "confirmed")}>
                          <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />
                          Confirm
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, "completed")}>
                          <CheckCircle className="h-4 w-4 mr-2 text-blue-500" />
                          Complete
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, "cancelled")} className="text-red-600">
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredBookings.length === 0 && !loading && (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No bookings found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookings;
