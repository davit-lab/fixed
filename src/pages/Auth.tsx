import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Mail, Lock, User as UserIcon, ShieldCheck, ArrowRight, Truck } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'owner' | 'renter' | null>(null);
  const { signIn, signUp, signInWithGoogle, user, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const defaultTab = location.pathname === "/register" ? "register" : "login";

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await signIn(email, password);
      toast.success("Login successful");
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;

    try {
      await signUp(email, password, fullName);
      toast.success("Registration successful! Please check your email to verify your account.");
      setShowRoleSelection(true);
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Login successful");
    } catch (error: any) {
      toast.error(error.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelection = async () => {
    if (!user || !selectedRole) return;
    
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: selectedRole })
        .eq('id', user.id);

      if (error) throw error;
      
      toast.success("Role saved successfully");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to save role");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (user && userRole === null) {
      setShowRoleSelection(true);
    } else if (user && userRole) {
      navigate("/");
    }
  }, [user, userRole, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">

      <AnimatePresence mode="wait">
        {!showRoleSelection ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/30">
                  <Truck className="h-7 w-7" />
                </div>
              </div>
              <h1 className="text-2xl font-black tracking-tight">
                Cargo<span className="text-amber-500">Connect</span>
              </h1>
              <p className="text-muted-foreground mt-1 text-sm font-medium">Georgia's #1 Logistics Platform</p>
            </div>

            <Card className="border border-border/50 shadow-xl rounded-2xl overflow-hidden bg-card/80 backdrop-blur-xl">
              <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 rounded-none h-12 bg-secondary/50 p-0">
                  <TabsTrigger 
                    value="login" 
                    className="data-[state=active]:bg-background data-[state=active]:shadow-none rounded-none font-bold text-sm h-full"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register" 
                    className="data-[state=active]:bg-background data-[state=active]:shadow-none rounded-none font-bold text-sm h-full"
                  >
                    Register
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="p-6">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-bold text-xs ml-1">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="email" 
                          name="email" 
                          type="email" 
                          placeholder="name@example.com" 
                          className="pl-10 rounded-xl h-12 border-border/50 bg-secondary/30 focus:bg-background transition-all" 
                          required 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="font-bold text-xs ml-1">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="password" 
                          name="password" 
                          type="password" 
                          placeholder="Enter password" 
                          className="pl-10 rounded-xl h-12 border-border/50 bg-secondary/30 focus:bg-background transition-all" 
                          required 
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-12 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/20 border-0" 
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Login"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="p-6">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="font-bold text-xs ml-1">Full Name</Label>
                      <div className="relative">
                        <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="fullName" 
                          name="fullName" 
                          type="text" 
                          placeholder="John Doe" 
                          className="pl-10 rounded-xl h-12 border-border/50 bg-secondary/30 focus:bg-background transition-all" 
                          required 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email" className="font-bold text-xs ml-1">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="reg-email" 
                          name="email" 
                          type="email" 
                          placeholder="name@example.com" 
                          className="pl-10 rounded-xl h-12 border-border/50 bg-secondary/30 focus:bg-background transition-all" 
                          required 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password" className="font-bold text-xs ml-1">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="reg-password" 
                          name="password" 
                          type="password" 
                          placeholder="Create password" 
                          className="pl-10 rounded-xl h-12 border-border/50 bg-secondary/30 focus:bg-background transition-all" 
                          required 
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-12 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/20 border-0" 
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Register"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="px-6 pb-6">
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs font-bold">
                    <span className="bg-card px-3 text-muted-foreground">or</span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full h-12 rounded-xl font-bold text-sm border-border/50 hover:bg-secondary/50 transition-all" 
                  onClick={handleGoogleSignIn} 
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )}
                  Continue with Google
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="role-selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-lg"
          >
            <Card className="rounded-2xl border border-border/50 shadow-xl overflow-hidden bg-card/80 backdrop-blur-xl">
              <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 to-orange-500" />
              <CardHeader className="text-center space-y-3 pt-8">
                <CardTitle className="text-2xl font-black tracking-tight">Choose Your Role</CardTitle>
                <CardDescription className="text-sm font-medium">
                  How do you plan to use the platform?
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-8 pt-4 px-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setSelectedRole('renter')}
                    className={`p-6 rounded-2xl border-2 transition-all text-left flex flex-col gap-4 group relative ${
                      selectedRole === 'renter' 
                        ? 'border-amber-500 bg-amber-500/5 shadow-lg shadow-amber-500/10' 
                        : 'border-border/50 hover:border-amber-500/50 hover:bg-secondary/50'
                    }`}
                  >
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all ${
                      selectedRole === 'renter' 
                        ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white scale-105 shadow-lg shadow-amber-500/30' 
                        : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      <UserIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base">Customer</h3>
                      <p className="text-xs text-muted-foreground font-medium mt-1 leading-relaxed">I'm looking for services, cargo, and equipment</p>
                    </div>
                    {selectedRole === 'renter' && (
                      <motion.div 
                        layoutId="role-check" 
                        className="absolute top-3 right-3 h-5 w-5 bg-amber-500 rounded-full flex items-center justify-center text-white"
                      >
                        <ArrowRight className="h-3 w-3" />
                      </motion.div>
                    )}
                  </button>

                  <button
                    onClick={() => setSelectedRole('owner')}
                    className={`p-6 rounded-2xl border-2 transition-all text-left flex flex-col gap-4 group relative ${
                      selectedRole === 'owner' 
                        ? 'border-amber-500 bg-amber-500/5 shadow-lg shadow-amber-500/10' 
                        : 'border-border/50 hover:border-amber-500/50 hover:bg-secondary/50'
                    }`}
                  >
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all ${
                      selectedRole === 'owner' 
                        ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white scale-105 shadow-lg shadow-amber-500/30' 
                        : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base">Provider</h3>
                      <p className="text-xs text-muted-foreground font-medium mt-1 leading-relaxed">I offer cargo, routes, and equipment</p>
                    </div>
                    {selectedRole === 'owner' && (
                      <motion.div 
                        layoutId="role-check" 
                        className="absolute top-3 right-3 h-5 w-5 bg-amber-500 rounded-full flex items-center justify-center text-white"
                      >
                        <ArrowRight className="h-3 w-3" />
                      </motion.div>
                    )}
                  </button>
                </div>

                <Button 
                  onClick={handleRoleSelection} 
                  disabled={!selectedRole || loading}
                  className="w-full h-14 rounded-xl text-base font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xl shadow-amber-500/20 border-0 transition-all"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Auth;
