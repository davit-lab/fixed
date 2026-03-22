import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  MessageSquare, 
  MapPin, 
  Info,
  Construction,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';

const EQUIPMENT_TYPES = [
  { id: 'excavator', name: 'ექსკავატორი' },
  { id: 'crane', name: 'ამწე' },
  { id: 'bulldozer', name: 'ბულდოზერი' },
  { id: 'loader', name: 'დამტვირთველი' },
  { id: 'truck', name: 'თვითმცლელი' },
  { id: 'roller', name: 'სატკეპნი' },
];

interface EquipmentItem {
  id: string;
  title: string;
  category: string | null;
  location: string | null;
  price: number;
  description: string | null;
  image_url: string | null;
  user_id: string;
}

const HeavyEquipment = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEquipment = async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching equipment:', error);
        toast.error('ტექნიკის ჩატვირთვა ვერ მოხერხდა');
      } else {
        setEquipment(data || []);
      }
      setLoading(false);
    };

    fetchEquipment();

    const channel = supabase
      .channel('equipment-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'equipment' }, () => {
        fetchEquipment();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = 
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType ? item.category === selectedType : true;
    return matchesSearch && matchesType;
  });

  const handleContact = (ownerId: string) => {
    if (!user) {
      toast.error('გთხოვთ გაიაროთ ავტორიზაცია');
      navigate('/login');
      return;
    }
    navigate(`/messages?chatWith=${ownerId}`);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] md:min-h-[60vh] flex items-center overflow-hidden bg-stone-950 text-white mx-4 md:mx-6 rounded-3xl mt-4">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/95 to-stone-950/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent" />
        
        <div className="relative z-10 max-w-screen-xl mx-auto px-6 md:px-8 py-16 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <Construction className="h-3.5 w-3.5" />
              სპეცტექნიკის პლატფორმა
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[0.95]">
              მძიმე ტექნიკის <br />
              <span className="text-gradient-accent">მომსახურება</span>
            </h1>
            
            <p className="text-stone-400 text-base md:text-lg max-w-xl leading-relaxed">
              იპოვეთ საუკეთესო სპეცტექნიკა და გამოცდილი ოპერატორები ნებისმიერი სირთულის პროექტისთვის.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button 
                asChild 
                className="h-12 px-6 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-white border-0 transition-all hover:scale-[1.02]"
              >
                <Link to="/create-post">
                  განცხადების დამატება
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 p-2 pr-5 rounded-xl">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-stone-950 bg-stone-800 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i + 15}`} alt="User" className="w-full h-full object-cover" crossOrigin="anonymous" />
                    </div>
                  ))}
                </div>
                <div className="text-xs">
                  <span className="text-amber-500 font-bold block">+500</span>
                  <span className="text-stone-400">ოპერატორი</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="sticky top-20 z-40 px-4 md:px-6 py-4">
        <div className="max-w-screen-xl mx-auto">
          <div className="bg-card/90 backdrop-blur-xl p-3 rounded-2xl shadow-lg border border-border/50 flex flex-col lg:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-amber-500 transition-colors" />
              <Input 
                placeholder="ძებნა..." 
                className="pl-11 h-12 rounded-xl border-border/30 bg-secondary/50 text-sm font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0 w-full lg:w-auto no-scrollbar">
              <Button 
                variant={selectedType === null ? 'default' : 'ghost'} 
                onClick={() => setSelectedType(null)}
                className={`rounded-xl h-12 px-5 font-bold text-xs shrink-0 transition-all ${
                  selectedType === null 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-secondary/50 hover:bg-secondary'
                }`}
              >
                ყველა
              </Button>
              {EQUIPMENT_TYPES.map(type => (
                <Button 
                  key={type.id}
                  variant={selectedType === type.id ? 'default' : 'ghost'} 
                  onClick={() => setSelectedType(type.id)}
                  className={`rounded-xl h-12 px-5 font-bold text-xs whitespace-nowrap shrink-0 transition-all ${
                    selectedType === type.id 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-secondary/50 hover:bg-secondary'
                  }`}
                >
                  {type.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="px-4 md:px-6 pt-8">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[400px] bg-card rounded-2xl border border-border/30 animate-pulse" />
              ))
            ) : filteredEquipment.length > 0 ? (
              filteredEquipment.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Card className="rounded-2xl border border-border/50 bg-card hover:shadow-xl hover:shadow-amber-500/5 hover:border-amber-500/20 transition-all duration-500 group overflow-hidden h-full flex flex-col">
                    <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.title} 
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Construction className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                      )}
                      
                      {item.category && (
                        <div className="absolute top-4 left-4">
                          <div className="px-3 py-1.5 rounded-lg bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm text-amber-600 dark:text-amber-400 text-xs font-bold shadow-lg">
                            {EQUIPMENT_TYPES.find(t => t.id === item.category)?.name || item.category}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <CardHeader className="p-5 pb-3 cursor-pointer" onClick={() => navigate(`/equipment/${item.id}`)}>
                      <CardTitle className="text-lg font-bold tracking-tight group-hover:text-amber-500 transition-colors line-clamp-1">
                        {item.title}
                      </CardTitle>
                      {item.location && (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <MapPin className="h-3.5 w-3.5 text-amber-500" />
                          {item.location}
                        </div>
                      )}
                    </CardHeader>
                    
                    <CardContent className="p-5 pt-0 flex-1 flex flex-col justify-between gap-4">
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                      
                      <div className="flex items-center gap-2 pt-4 border-t border-border/50">
                        <div className="flex-1">
                          <span className="text-lg font-black text-amber-500">{item.price} GEL</span>
                          <span className="text-xs text-muted-foreground ml-1">/დღე</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="rounded-xl h-10 font-bold text-xs hover:bg-amber-500/10 hover:text-amber-600 hover:border-amber-500/30"
                          onClick={() => navigate(`/equipment/${item.id}`)}
                        >
                          <Info className="h-3.5 w-3.5 mr-1.5" />
                          დეტალები
                        </Button>
                        <Button 
                          size="sm"
                          className="rounded-xl h-10 font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white border-0"
                          onClick={() => handleContact(item.user_id)}
                        >
                          <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                          მიწერა
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-24 text-center space-y-6 bg-card rounded-3xl border-2 border-dashed border-border/50">
                <div className="h-20 w-20 rounded-2xl bg-secondary flex items-center justify-center mx-auto">
                  <Construction className="h-10 w-10 text-muted-foreground/40" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">ტექნიკა არ მოიძებნა</h3>
                  <p className="text-muted-foreground text-sm">სცადეთ სხვა საძიებო პარამეტრები</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => { setSearchTerm(''); setSelectedType(null); }}
                  className="rounded-xl px-6 h-11 font-bold text-xs"
                >
                  ფილტრების გასუფთავება
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 md:px-6 mt-24">
        <div className="max-w-screen-xl mx-auto bg-stone-950 rounded-3xl p-8 md:p-16 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-amber-400 text-xs font-bold">
                პარტნიორობა
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[0.95]">
                გაქვთ მძიმე ტექნიკა? <br />
                <span className="text-amber-400">მიიღეთ შეკვეთები</span>
              </h2>
              <p className="text-stone-400 text-base leading-relaxed max-w-md mx-auto lg:mx-0">
                დაამატეთ თქვენი ტექნიკა პლატფორმაზე და მიიღეთ შეკვეთები ყოველდღიურად.
              </p>
              <Button 
                asChild 
                className="h-14 px-8 rounded-xl font-bold text-base bg-amber-500 hover:bg-amber-600 text-white border-0 transition-all hover:scale-[1.02]"
              >
                <Link to="/create-post">
                  დაიწყეთ ახლა
                  <ArrowUpRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'აქტიური ტექნიკა', value: '500+', color: 'text-amber-400' },
                { label: 'მხარდაჭერა', value: '24/7', color: 'text-blue-400' },
                { label: 'გამართული', value: '100%', color: 'text-emerald-400' },
                { label: 'საკომისიო', value: '0%', color: 'text-rose-400' }
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -4 }}
                  className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <h4 className={`font-black text-3xl md:text-4xl tracking-tight ${stat.color}`}>{stat.value}</h4>
                  <p className="text-xs text-stone-400 font-medium mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HeavyEquipment;
