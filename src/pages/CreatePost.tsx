--- START OF FILE src/pages/CreatePost.tsx ---
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LocationInput } from '@/components/maps/LocationInput';
import { 
  Truck, Package, ArrowRight, ArrowLeft, CheckCircle2, 
  CreditCard, Phone, DollarSign, Construction, Zap, 
  Shield, Globe, Scale, Box, Calendar, Layers, 
  Settings2, Cpu 
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageUpload } from '@/components/ui/ImageUpload';

const CreatePost = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'cargo' as 'cargo' | 'route' | 'equipment',
    title: '',
    origin: { address: '', lat: 0, lng: 0 },
    destination: { address: '', lat: 0, lng: 0 },
    description: '',
    price: '',
    contactPhone: '',
    paymentPlan: 'standard' as 'standard' | 'premium' | 'vip' | 'exclusive',
    equipmentType: 'excavator',
    images: [] as string[],
    weight: '',
    volume: '',
    cargoType: 'general',
    vehicleType: 'truck',
    loadingDate: '',
    capacity: '',
    model: '',
    power: '',
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    if (!user) {
        toast.error("გთხოვთ გაიაროთ ავტორიზაცია");
        return;
    }
    setLoading(true);
    
    try {
      if (formData.type === 'equipment') {
        const { error } = await supabase.from('equipment').insert([{
          title: formData.title || formData.equipmentType,
          description: formData.description,
          price: parseFloat(formData.price),
          location: formData.origin.address,
          lat: formData.origin.lat,
          lng: formData.origin.lng,
          category: formData.equipmentType,
          image_url: formData.images[0] || null,
          user_id: user.id,
          status: 'active'
        }]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('posts').insert([{
          user_id: user.id,
          type: formData.type,
          title: formData.title || (formData.type === 'cargo' ? 'ტვირთი' : 'რეისი'),
          description: formData.description,
          price: parseFloat(formData.price),
          origin_address: formData.origin.address,
          origin_lat: formData.origin.lat,
          origin_lng: formData.origin.lng,
          destination_address: formData.destination.address,
          destination_lat: formData.destination.lat,
          destination_lng: formData.destination.lng,
          status: 'active',
          weight: formData.weight ? parseFloat(formData.weight) : null
        }]);
        if (error) throw error;
      }

      toast.success('განცხადება წარმატებით დაემატა');
      navigate(formData.type === 'equipment' ? '/heavy-equipment' : '/my-posts');
    } catch (error: any) {
      toast.error(error.message || 'დამატება ვერ მოხერხდა');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative py-8 md:py-16 px-4 bg-slate-50/50 dark:bg-slate-950/50">
        <div className="max-w-5xl mx-auto relative">
          <div className="relative mb-12 md:mb-24 px-2 md:px-8">
            <div className="absolute top-7 left-0 w-full h-1 bg-slate-200/50 rounded-full">
              <motion.div className="h-full bg-primary" animate={{ width: `${((step - 1) / 2) * 100}%` }} />
            </div>
            <div className="relative flex items-center justify-between">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex flex-col items-center gap-3">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black transition-all ${step >= s ? 'bg-primary text-white' : 'bg-white text-slate-400 border'}`}>
                    {step > s ? <CheckCircle2 /> : s}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-black">აირჩიეთ ტიპი</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <button onClick={() => { setFormData({...formData, type: 'cargo'}); handleNext(); }} className="p-8 rounded-3xl border-2 bg-white hover:border-primary transition-all text-left">
                    <Package className="h-12 w-12 mb-4 text-blue-500" />
                    <h3 className="text-2xl font-bold">ტვირთი</h3>
                    <p className="text-slate-500">ვეძებ გადამზიდველს</p>
                  </button>
                  <button onClick={() => { setFormData({...formData, type: 'route'}); handleNext(); }} className="p-8 rounded-3xl border-2 bg-white hover:border-primary transition-all text-left">
                    <Truck className="h-12 w-12 mb-4 text-emerald-500" />
                    <h3 className="text-2xl font-bold">რეისი</h3>
                    <p className="text-slate-500">ვეძებ ტვირთს</p>
                  </button>
                  <button onClick={() => { setFormData({...formData, type: 'equipment'}); handleNext(); }} className="p-8 rounded-3xl border-2 bg-white hover:border-primary transition-all text-left">
                    <Construction className="h-12 w-12 mb-4 text-amber-500" />
                    <h3 className="text-2xl font-bold">ტექნიკა</h3>
                    <p className="text-slate-500">ვთავაზობ სერვისს</p>
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="bg-white p-8 rounded-[2rem] border space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <LocationInput label="საიდან / მდებარეობა" placeholder="მისამართი" onLocationSelect={(loc) => setFormData({...formData, origin: loc})} />
                    {formData.type !== 'equipment' && (
                      <LocationInput label="სად" placeholder="დანიშნულება" onLocationSelect={(loc) => setFormData({...formData, destination: loc})} />
                    )}
                  </div>
                  <Input placeholder="სათაური" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                  <Textarea placeholder="აღწერა" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                  <div className="grid md:grid-cols-2 gap-6">
                    <Input type="number" placeholder="ფასი (₾)" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                    <Input placeholder="ტელეფონი" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} />
                  </div>
                  <ImageUpload images={formData.images} onChange={(imgs) => setFormData({...formData, images: imgs})} />
                </div>
                <div className="flex justify-between">
                  <Button variant="ghost" onClick={handleBack}>უკან</Button>
                  <Button onClick={handleNext}>გაგრძელება</Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-8">
                <h2 className="text-3xl font-bold">თითქმის მზად არის!</h2>
                <div className="max-w-md mx-auto p-8 bg-white rounded-3xl border">
                    <p className="mb-4">განცხადების გამოსაქვეყნებლად დააჭირეთ დასტურს</p>
                    <Button onClick={handleSubmit} disabled={loading} className="w-full h-12">
                        {loading ? "მუშავდება..." : "დადასტურება და გამოქვეყნება"}
                    </Button>
                </div>
                <Button variant="ghost" onClick={handleBack}>უკან</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
    </div>
  );
};

export default CreatePost;
