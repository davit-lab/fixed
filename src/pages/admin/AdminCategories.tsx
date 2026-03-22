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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit2, Tags, Search } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  name_ka?: string;
  name_ru?: string;
  icon?: string;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", icon: "", name_ka: "", name_ru: "" });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(formData)
          .eq('id', editingCategory.id);

        if (error) throw error;
        toast.success("Category updated");
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([formData]);

        if (error) throw error;
        toast.success("Category added");
      }
      setIsDialogOpen(false);
      setEditingCategory(null);
      setFormData({ name: "", icon: "", name_ka: "", name_ru: "" });
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete?")) return;
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCategories(categories.filter(c => c.id !== id));
      toast.success("Deleted successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete");
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Manage equipment categories</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl gap-2 bg-amber-500 hover:bg-amber-600" onClick={() => {
              setEditingCategory(null);
              setFormData({ name: "", icon: "", name_ka: "", name_ru: "" });
            }}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl">
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Edit Category" : "New Category"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name (English)</Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name_ka">Name (Georgian)</Label>
                <Input 
                  id="name_ka" 
                  value={formData.name_ka}
                  onChange={(e) => setFormData({ ...formData, name_ka: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">Icon (Lucide name)</Label>
                <Input 
                  id="icon" 
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="rounded-xl"
                  placeholder="e.g. Truck"
                />
              </div>
              <DialogFooter>
                <Button type="submit" className="rounded-xl w-full bg-amber-500 hover:bg-amber-600">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-2xl shadow-sm border">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder="Search by name..." 
          className="border-none focus-visible:ring-0 bg-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-card rounded-3xl shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b">
              <TableHead className="px-6 py-4">Category</TableHead>
              <TableHead className="px-6 py-4">Georgian</TableHead>
              <TableHead className="px-6 py-4">Icon</TableHead>
              <TableHead className="px-6 py-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.map((category) => (
              <TableRow key={category.id} className="group hover:bg-muted/30 transition-colors">
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <Tags className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-sm">{category.name}</span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span className="text-sm">{category.name_ka || '-'}</span>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span className="text-sm text-muted-foreground">{category.icon || '-'}</span>
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full"
                      onClick={() => {
                        setEditingCategory(category);
                        setFormData({ 
                          name: category.name, 
                          icon: category.icon || "", 
                          name_ka: category.name_ka || "",
                          name_ru: category.name_ru || ""
                        });
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredCategories.length === 0 && !loading && (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No categories found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;
