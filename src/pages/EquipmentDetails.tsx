import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ka } from "date-fns/locale";
import { MapPin, Star, Shield, Clock, Loader2, CheckCircle2, MessageSquare, Settings, User, PlusCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Reviews } from "@/components/equipment/Reviews";
import { BookingDialog, BookingFormData } from "@/components/booking/BookingDialog";

interface Equipment {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  image_url?: string;
  category: string;
  user_id: string;
  rating?: number;
  status?: 'active' | 'inactive' | 'pending';
}

interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
}

const EquipmentDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [owner, setOwner] = useState<Profile | null>(null);
  const [relatedEquipment, setRelatedEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);

  useEffect(() => {
    const fetchEquipmentAndOwner = async () => {
      if (!id) return;
      try {
        const { data: equipmentData, error: equipError } = await supabase
          .from('equipment')
          .select('*')
          .eq('id', id)
          .single();

        if (equipError) throw equipError;
        setEquipment(equipmentData as Equipment);

        if (equipmentData?.user_id) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', equipmentData.user_id)
            .single();

          if (!profileError && profileData) {
            setOwner(profileData as Profile);
          }

          if (equipmentData.category) {
            const { data: relatedData, error: relatedError } = await supabase
              .from('equipment')
              .select('*')
              .eq('category', equipmentData.category)
              .neq('id', id)
              .limit(4);

            if (!relatedError && relatedData) {
              setRelatedEquipment(relatedData as Equipment[]);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching equipment:", error);
        toast.error("სერვისის ჩატვირთვა ვერ მოხერხდა");
      } finally {
        setLoading(false);
      }
    };

    fetchEquipmentAndOwner();
  }, [id]);

  const handleOpenBookingDialog = () => {
    if (!user) {
      toast.error("საჭიროა ავტორიზაცია", {
        description: "გთხოვთ გაიაროთ ავტორიზაცია დაჯავშნისთვის",
      });
      navigate("/login");
      return;
    }
    setShowBookingDialog(true);
  };

  const handleBookingConfirm = async (data: BookingFormData) => {
    if (!user || !equipment) return;

    setIsBooking(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .insert([{
          equipment_id: equipment.id,
          user_id: user.id,
          owner_id: equipment.user_id,
          start_date: data.bookingDate.toISOString().split('T')[0],
          end_date: new Date(data.bookingDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          total_price: equipment.price,
          status: 'pending',
          notes: data.notes,
        }]);

      if (error) throw error;

      setBooked(true);
      setShowBookingDialog(false);
      toast.success("წარმატებული დაჯავშნა", {
        description: "თქვენი მოთხოვნა გაიგზავნა მფლობელთან",
      });
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("დაჯავშნა ვერ მოხერხდა");
    } finally {
      setIsBooking(false);
    }
  };

  const handleContact = () => {
    if (!user) {
      toast.error("საჭიროა ავტორიზაცია", {
        description: "გთხოვთ გაიაროთ ავტორიზაცია შეტყობინების გასაგზავნად",
      });
      navigate("/login");
      return;
    }
    
    if (user.id === equipment?.user_id) {
      toast.error("შეცდომა", {
        description: "თქვენ ვერ გაუგზავნით შეტყობინებას საკუთარ თავს",
      });
      return;
    }

    navigate(`/messages?chatWith=${equipment?.user_id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('ნამდვილად გსურთ წაშლა?')) return;
    
    try {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', equipment?.id);

      if (error) throw error;
      toast.success("სერვისი წაიშალა");
      navigate("/heavy-equipment");
    } catch (error) {
      console.error("Error deleting equipment:", error);
      toast.error("წაშლა ვერ მოხერხდა");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="container mx-auto py-20 px-4 text-center">
        <h1 className="text-2xl font-bold">სერვისი ვერ მოიძებნა</h1>
        <Button className="mt-4" onClick={() => navigate("/heavy-equipment")}>უკან დაბრუნება</Button>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-24 bg-background min-h-screen relative overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          <div className="lg:col-span-2 space-y-8 md:space-y-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="aspect-video rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl shadow-black/10 relative group"
            >
              <img
                src={equipment.image_url || `https://picsum.photos/seed/${equipment.id}/1200/800`}
                alt={equipment.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
            
            <div className="space-y-6 md:space-y-8">
              <div className="flex flex-wrap items-center gap-3 md:gap-4">
                <span className="bg-amber-500/10 text-amber-600 px-4 py-1.5 md:px-6 md:py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] border border-amber-500/10 shadow-sm">
                  {equipment.category}
                </span>
                <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/10 shadow-sm">
                  <CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span className="font-black text-[10px] md:text-xs tracking-tight uppercase">ხელმისაწვდომია</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/10 shadow-sm">
                  <Star className="h-3.5 w-3.5 md:h-4 md:w-4 fill-current" />
                  <span className="font-black text-[10px] md:text-xs tracking-tight">{equipment.rating || "4.5"}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-[0.9]">
                  {equipment.title}
                </h1>
                
                <div className="flex items-center gap-3 text-muted-foreground font-medium text-base md:text-lg">
                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl md:rounded-2xl bg-secondary/50 flex items-center justify-center">
                    <MapPin className="h-4 w-4 md:h-5 md:w-5 text-amber-500" />
                  </div>
                  <span>{equipment.location}</span>
                </div>
              </div>

              <div className="p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-card/50 backdrop-blur-sm border border-border/50 space-y-6 md:space-y-8 shadow-sm">
                <h2 className="text-xl md:text-2xl font-black tracking-tighter flex items-center gap-3">
                  <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg md:rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 md:h-4 md:w-4 text-amber-500" />
                  </div>
                  მფლობელი
                </h2>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl md:rounded-[2rem] overflow-hidden border-2 border-amber-500/20 shadow-xl">
                      <img 
                        src={owner?.avatar_url || `https://i.pravatar.cc/150?u=${equipment.user_id}`} 
                        alt={owner?.full_name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-black tracking-tight">{owner?.full_name || "მფლობელი"}</h3>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    {user?.id === equipment.user_id && (
                      <>
                        <Button 
                          variant="outline" 
                          className="w-full sm:w-auto rounded-xl md:rounded-2xl h-12 md:h-14 px-6 md:px-8 font-black uppercase tracking-widest text-[9px] md:text-[10px] border-2 border-amber-500/10 hover:bg-amber-500/5"
                          onClick={() => navigate(`/owner/services/edit/${equipment.id}`)}
                        >
                          რედაქტირება
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full sm:w-auto rounded-xl md:rounded-2xl h-12 md:h-14 px-6 md:px-8 font-black uppercase tracking-widest text-[9px] md:text-[10px] border-2 border-red-500/10 text-red-500 hover:bg-red-500/5"
                          onClick={handleDelete}
                        >
                          წაშლა
                        </Button>
                      </>
                    )}
                    <Button 
                      variant="outline" 
                      className="w-full sm:w-auto rounded-xl md:rounded-2xl h-12 md:h-14 px-6 md:px-8 font-black uppercase tracking-widest text-[9px] md:text-[10px] border-2 border-amber-500/10 hover:bg-amber-500/5"
                      onClick={handleContact}
                    >
                      დაკონტაქტება
                    </Button>
                  </div>
                </div>
              </div>

              {relatedEquipment.length > 0 && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between px-4">
                    <h2 className="text-2xl font-black tracking-tighter flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <PlusCircle className="h-4 w-4 text-amber-500" />
                      </div>
                      მსგავსი სერვისები
                    </h2>
                    <Button 
                      variant="ghost" 
                      className="text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/10 hover:text-amber-600 rounded-xl"
                      onClick={() => navigate('/heavy-equipment')}
                    >
                      ყველას ნახვა
                    </Button>
                  </div>
                  
                  <div className="flex gap-4 md:gap-6 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 snap-x">
                    {relatedEquipment.map((item) => (
                      <motion.div
                        key={item.id}
                        whileHover={{ y: -5 }}
                        className="min-w-[240px] md:min-w-[280px] bg-card/50 backdrop-blur-sm border border-border/50 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden group cursor-pointer snap-start shadow-sm hover:shadow-xl transition-all duration-500"
                        onClick={() => navigate(`/equipment/${item.id}`)}
                      >
                        <div className="aspect-[4/3] overflow-hidden relative">
                          <img 
                            src={item.image_url || `https://picsum.photos/seed/${item.id}/400/300`} 
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full border border-border/50">
                            <span className="text-[10px] font-black text-amber-600">₾{item.price}</span>
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="font-black tracking-tight text-lg line-clamp-1 group-hover:text-amber-600 transition-colors">
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{item.location}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="min-w-[200px] bg-amber-500/5 border-2 border-dashed border-amber-500/20 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 cursor-pointer group snap-start"
                      onClick={() => navigate('/heavy-equipment')}
                    >
                      <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all duration-500">
                        <ArrowRight className="h-6 w-6" />
                      </div>
                      <span className="font-black text-[10px] uppercase tracking-widest text-amber-600">ყველას ნახვა</span>
                    </motion.div>
                  </div>
                </div>
              )}

              <div className="p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-card/50 backdrop-blur-sm border border-border/50 space-y-4 md:space-y-6 shadow-sm">
                <h2 className="text-xl md:text-2xl font-black tracking-tighter flex items-center gap-3">
                  <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg md:rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <Settings className="h-3.5 w-3.5 md:h-4 md:w-4 text-amber-500" />
                  </div>
                  აღწერა
                </h2>
                <p className="text-muted-foreground text-base md:text-lg font-medium leading-relaxed whitespace-pre-wrap">
                  {equipment.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-8 bg-card/50 backdrop-blur-sm rounded-[2.5rem] border border-border/50 flex flex-col items-center text-center space-y-4 shadow-sm hover:shadow-md transition-all">
                  <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                    <Shield className="h-7 w-7 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-black tracking-tight text-lg">დაზღვეული</h3>
                    <p className="text-muted-foreground text-sm">სრულ რაოდენობით</p>
                  </div>
                </div>

                <div className="p-8 bg-card/50 backdrop-blur-sm rounded-[2.5rem] border border-border/50 flex flex-col items-center text-center space-y-4 shadow-sm hover:shadow-md transition-all">
                  <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                    <Clock className="h-7 w-7 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-black tracking-tight text-lg">24/7 ხელმისაწვდომი</h3>
                    <p className="text-muted-foreground text-sm">მე-მე-ის სერვისი</p>
                  </div>
                </div>

                <div className="p-8 bg-card/50 backdrop-blur-sm rounded-[2.5rem] border border-border/50 flex flex-col items-center text-center space-y-4 shadow-sm hover:shadow-md transition-all">
                  <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                    <MessageSquare className="h-7 w-7 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-black tracking-tight text-lg">მხარდაჭერა</h3>
                    <p className="text-muted-foreground text-sm">სწრაფი საპასუხო</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Booking Section */}
          <div className="lg:sticky lg:top-6 lg:h-fit space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-[2.5rem] p-8 space-y-6 shadow-sm"
            >
              <div>
                <div className="text-4xl font-black tracking-tighter text-amber-600 mb-2">
                  ₾ {equipment.price}
                  <span className="text-sm font-bold text-muted-foreground ml-2">/სთ</span>
                </div>
                <p className="text-sm text-muted-foreground">საშუო ფასი გამოკითხვის მიხედვით</p>
              </div>

              <div className="space-y-3">
                <Button 
                  className="w-full h-14 rounded-xl text-lg font-bold"
                  onClick={handleOpenBookingDialog}
                  disabled={booked}
                >
                  {booked ? "დაჯავშნილი" : "დაჯავშნა"}
                </Button>
                
                <Button 
                  variant="outline"
                  className="w-full h-14 rounded-xl text-lg font-bold gap-2"
                  onClick={handleContact}
                >
                  <MessageSquare className="h-5 w-5" />
                  დაკონტაქტება
                </Button>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 space-y-2">
                <p className="text-xs font-bold uppercase text-amber-700">წესები და პირობები</p>
                <p className="text-sm text-amber-800">დაჯავშნის დროს დაეთანხმეთ ჩვენი კანონი</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <BookingDialog 
        open={showBookingDialog}
        onOpenChange={setShowBookingDialog}
        onConfirm={handleBookingConfirm}
        loading={isBooking}
        equipment={equipment}
      />
    </div>
  );
};

export default EquipmentDetails;
