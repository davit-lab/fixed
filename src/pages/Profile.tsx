import React, { useState, useRef } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  ShieldCheck, 
  LogOut, 
  Save,
  Truck,
  Package,
  Camera,
  Loader2,
  Settings,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

const Profile = () => {
  const { user, profile, setProfile } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [role, setRole] = useState<'owner' | 'renter'>(profile?.role === 'owner' ? 'owner' : 'renter');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('სურათის ზომა არ უნდა აღემატებოდეს 2MB-ს');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `avatars/${user.id}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      if (profile) setProfile({ ...profile, avatar_url: publicUrl });
      toast.success('პროფილის სურათი განახლდა');
    } catch (error: any) {
      // If storage bucket doesn't exist, store as data URL
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const { error } = await supabase
          .from('profiles')
          .update({ avatar_url: base64 })
          .eq('id', user.id);
        if (!error) {
          if (profile) setProfile({ ...profile, avatar_url: base64 });
          toast.success('პროფილის სურათი განახლდა');
        } else {
          toast.error('სურათის ატვირთვა ვერ მოხერხდა');
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, role })
        .eq('id', user.id);

      if (error) throw error;

      if (profile) setProfile({ ...profile, full_name: fullName, role });
      toast.success('პროფილი განახლდა');
    } catch (error: any) {
      toast.error(error.message || 'განახლება ვერ მოხერხდა');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-32">
      {/* Profile Header */}
      <div className="relative pt-24 pb-20 overflow-hidden rounded-3xl bg-card shadow-xl border border-border/50">
        <div className="flex flex-col items-center text-center space-y-10 px-8">
          <div className="relative group">
            <Avatar className="h-36 w-36 border-4 border-background shadow-2xl transition-transform duration-700 group-hover:scale-105">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-amber-500/10 text-amber-500 text-5xl font-black">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-50 backdrop-blur-sm"
            >
              {uploading ? (
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              ) : (
                <Camera className="h-8 w-8 text-white" />
              )}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">{profile?.full_name || user?.email || 'მომხმარებელი'}</h1>
            <p className="text-muted-foreground font-medium text-lg">{user?.email}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-6 py-3 rounded-2xl bg-secondary/50 border border-border/50 flex items-center gap-3 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Package className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">როლი</p>
                <p className="text-base font-black uppercase tracking-tight">
                  {profile?.role === 'owner' ? 'მომწოდებელი' : 'მომხმარებელი'}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="h-16 px-6 rounded-2xl font-bold text-xs uppercase tracking-widest border-2 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 transition-all"
            >
              <LogOut className="mr-2 h-4 w-4" />
              გამოსვლა
            </Button>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Edit Profile */}
        <Card className="rounded-2xl border border-border/50 bg-card">
          <div className="p-8 space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Settings className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight">პროფილის პარამეტრები</h2>
                <p className="text-sm text-muted-foreground">განაახლეთ თქვენი ინფორმაცია</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">სახელი და გვარი</label>
                <Input 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12 rounded-xl bg-secondary/50 border-border/50 font-medium"
                  placeholder="სახელი გვარი"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">თქვენი როლი</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setRole('owner')}
                    className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      role === 'owner' 
                        ? 'border-amber-500 bg-amber-500/5' 
                        : 'border-border/50 bg-secondary/30 hover:bg-secondary/50'
                    }`}
                  >
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${role === 'owner' ? 'bg-amber-500 text-white' : 'bg-background text-muted-foreground'}`}>
                      <Package className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold">მომწოდებელი</span>
                  </button>
                  <button
                    onClick={() => setRole('renter')}
                    className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      role === 'renter' 
                        ? 'border-amber-500 bg-amber-500/5' 
                        : 'border-border/50 bg-secondary/30 hover:bg-secondary/50'
                    }`}
                  >
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${role === 'renter' ? 'bg-amber-500 text-white' : 'bg-background text-muted-foreground'}`}>
                      <Truck className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold">მომხმარებელი</span>
                  </button>
                </div>
              </div>

              <Button 
                onClick={handleUpdateProfile} 
                disabled={loading}
                className="w-full h-12 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-white border-0"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                ცვლილებების შენახვა
              </Button>
            </div>
          </div>
        </Card>

        {/* Quick Links */}
        <Card className="rounded-2xl border border-border/50 bg-card">
          <div className="p-8 space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight">სწრაფი ბმულები</h2>
                <p className="text-sm text-muted-foreground">ნავიგაცია</p>
              </div>
            </div>

            <div className="space-y-3">
              <Link to="/my-bookings" className="flex items-center justify-between p-5 rounded-xl bg-secondary/40 border border-border/50 hover:bg-secondary/60 transition-colors group">
                <div>
                  <p className="font-bold">ჩემი ჯავშნები</p>
                  <p className="text-xs text-muted-foreground mt-0.5">ჯავშნების ისტორია</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
              </Link>

              <Link to="/my-posts" className="flex items-center justify-between p-5 rounded-xl bg-secondary/40 border border-border/50 hover:bg-secondary/60 transition-colors group">
                <div>
                  <p className="font-bold">ჩემი განცხადებები</p>
                  <p className="text-xs text-muted-foreground mt-0.5">პოსტების მართვა</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
              </Link>

              <Link to="/messages" className="flex items-center justify-between p-5 rounded-xl bg-secondary/40 border border-border/50 hover:bg-secondary/60 transition-colors group">
                <div>
                  <p className="font-bold">ყველა ჩატი</p>
                  <p className="text-xs text-muted-foreground mt-0.5">მიმოწერები</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
              </Link>

              <div className="flex items-center justify-between p-5 rounded-xl bg-red-50/40 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 hover:bg-red-50/70 transition-colors cursor-pointer group" onClick={handleSignOut}>
                <div>
                  <p className="font-bold text-red-600">გამოსვლა</p>
                  <p className="text-xs text-red-500/70 mt-0.5">ანგარიშიდან გამოსვლა</p>
                </div>
                <LogOut className="h-5 w-5 text-red-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card className="rounded-2xl border border-border/50 bg-card lg:col-span-2">
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight">უსაფრთხოება</h2>
                <p className="text-sm text-muted-foreground">ანგარიშის დაცვა</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-5 rounded-xl bg-secondary/40 border border-border/50">
                <div>
                  <p className="font-bold">ორფაქტორიანი ავტენტიფიკაცია</p>
                  <p className="text-xs text-muted-foreground mt-0.5">SMS კოდით დამატებითი დაცვა</p>
                </div>
                <div className="h-7 w-12 rounded-full bg-border relative cursor-pointer">
                  <div className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-md" />
                </div>
              </div>
              <div className="flex items-center justify-between p-5 rounded-xl bg-secondary/40 border border-border/50">
                <div>
                  <p className="font-bold">პაროლის შეცვლა</p>
                  <p className="text-xs text-muted-foreground mt-0.5">განახლება რეკომენდებულია</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-lg h-9 font-bold text-xs">შეცვლა</Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
