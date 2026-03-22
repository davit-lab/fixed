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
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Search, UserPlus, Shield, User, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success(`მომხმარებლის როლი შეიცვალა: ${newRole}`);
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("როლის განახლება ვერ მოხერხდა");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("ნამდვილად გსურთ მომხმარებლის წაშლა?")) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      setUsers(users.filter(u => u.id !== userId));
      toast.success("მომხმარებელი წაიშალა");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("მომხმარებლის წაშლა ვერ მოხერხდა");
    }
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">მომხმარებლები</h1>
          <p className="text-muted-foreground">მართეთ მომხმარებლები და მათი როლები</p>
        </div>
        <Button className="rounded-xl gap-2 bg-amber-500 hover:bg-amber-600">
          <UserPlus className="h-4 w-4" />
          დამატება
        </Button>
      </div>

      <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-2xl shadow-sm border">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder="ძებნა სახელით ან იმეილით..." 
          className="border-none focus-visible:ring-0 bg-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-card rounded-3xl shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b">
              <TableHead className="w-[250px] px-6 py-4">მომხმარებელი</TableHead>
              <TableHead className="px-6 py-4">როლი</TableHead>
              <TableHead className="px-6 py-4">სტატუსი</TableHead>
              <TableHead className="px-6 py-4 text-right">მოქმედება</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className="group hover:bg-muted/30 transition-colors">
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold">
                      {user.email?.[0].toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{user.full_name || "მომხმარებელი"}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                    user.role === "admin" ? "bg-red-100 text-red-600" : 
                    user.role === "owner" ? "bg-blue-100 text-blue-600" : 
                    "bg-gray-100 text-gray-600"
                  )}>
                    {user.role === "admin" ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                    {user.role}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                    აქტიური
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem onClick={() => handleUpdateRole(user.id, "renter")}>როლი: Renter</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateRole(user.id, "owner")}>როლი: Owner</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateRole(user.id, "admin")}>როლი: Admin</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUser(user.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        წაშლა
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredUsers.length === 0 && !loading && (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">მომხმარებლები არ მოიძებნა</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
