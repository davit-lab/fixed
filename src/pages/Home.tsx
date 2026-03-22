import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Truck, 
  Shield, 
  Clock, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  Construction,
  Package,
  ChevronRight,
  Users,
  Globe,
  Zap,
  TrendingUp,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/useAuthStore';

const Home = () => {
  const { user, profile } = useAuthStore();
  
  const features = [
    {
      icon: <Truck className="h-6 w-6" />,
      title: 'სწრაფი გადაზიდვა',
      description: 'იპოვეთ საუკეთესო მარშრუტები და მძღოლები თქვენი ტვირთისთვის წამებში.',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'უსაფრთხოება',
      description: 'ყველა მძღოლი და კომპანია გადის ვერიფიკაციას უსაფრთხოების გარანტიისთვის.',
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: '24/7 მხარდაჭერა',
      description: 'ჩვენი გუნდი მზად არის დაგეხმაროთ ნებისმიერ დროს, ნებისმიერ საკითხზე.',
    },
    {
      icon: <Construction className="h-6 w-6" />,
      title: 'სპეცტექნიკა',
      description: 'მძიმე ტექნიკის ფართო არჩევანი ნებისმიერი სირთულის სამუშაოებისთვის.',
    }
  ];

  const stats = [
    { label: 'აქტიური მომხმარებელი', value: '10,000+', icon: <Users className="h-5 w-5" /> },
    { label: 'წარმატებული რეისი', value: '50,000+', icon: <CheckCircle2 className="h-5 w-5" /> },
    { label: 'ქალაქი საქართველოში', value: '60+', icon: <MapPin className="h-5 w-5" /> },
    { label: 'საერთაშორისო პარტნიორი', value: '15+', icon: <Globe className="h-5 w-5" /> },
  ];

  const services = [
    { 
      to: '/cargo', 
      title: 'ტვირთები', 
      desc: 'იპოვეთ საუკეთესო შემოთავაზებები ტვირთების გადასაზიდად.', 
      icon: <Package className="h-6 w-6" />, 
      gradient: 'from-amber-500 to-orange-600',
      bgImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800'
    },
    { 
      to: '/routes', 
      title: 'რეისები', 
      desc: 'დაამატეთ თქვენი მარშრუტი და იპოვეთ ტვირთები.', 
      icon: <Truck className="h-6 w-6" />, 
      gradient: 'from-emerald-500 to-teal-600',
      bgImage: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800'
    },
    { 
      to: '/heavy-equipment', 
      title: 'სპეცტექნიკა', 
      desc: 'მძიმე ტექნიკის გაქირავება და მომსახურება.', 
      icon: <Construction className="h-6 w-6" />, 
      gradient: 'from-stone-700 to-stone-900',
      bgImage: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=800'
    }
  ];

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <div className="space-y-24 md:space-y-40 pb-24">
        {/* Hero Section */}
        <section className="relative pt-24 md:pt-40 lg:pt-48">
          <div className="max-w-screen-xl mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-8 md:space-y-10">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20"
              >
                <span>#1 ლოჯისტიკური პლატფორმა საქართველოში</span>
              </motion.div>

              {/* Main Heading */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="space-y-4 max-w-4xl"
              >
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight">
                  მართე{' '}
                  <span className="relative inline-block">
                    <span className="text-gradient-accent">ლოჯისტიკა</span>
                    <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                      <path d="M2 8.5C50 2 150 2 198 8.5" stroke="url(#underline-gradient)" strokeWidth="4" strokeLinecap="round"/>
                      <defs>
                        <linearGradient id="underline-gradient" x1="0" y1="0" x2="200" y2="0">
                          <stop stopColor="#f59e0b"/>
                          <stop offset="1" stopColor="#ea580c"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </span>
                  <br />
                  <span className="text-muted-foreground/60">ჭკვიანურად.</span>
                </h1>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed text-balance"
              >
                CargoConnect GE აკავშირებს ტვირთის მფლობელებს, მძღოლებს და სპეცტექნიკის ოპერატორებს ერთიან, უსაფრთხო სივრცეში.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto pt-4"
              >
                <Button 
                  asChild 
                  size="lg" 
                  className="w-full sm:w-auto h-14 md:h-16 px-8 md:px-12 rounded-2xl text-base md:text-lg font-bold group bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xl shadow-amber-500/25 border-0 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Link to={profile?.role === 'owner' ? '/owner' : '/cargo'}>
                    {profile?.role === 'owner' ? 'მართვის პანელი' : 'დაიწყე ახლა'}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto h-14 md:h-16 px-8 md:px-12 rounded-2xl text-base md:text-lg font-bold border-2 hover:bg-secondary/80"
                >
                  <Link to="/map">
                    <MapPin className="mr-2 h-5 w-5" />
                    რუკის ნახვა
                  </Link>
                </Button>
              </motion.div>

              {/* Trust Badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-muted-foreground"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span className="font-medium">უფასო რეგისტრაცია</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-amber-500" />
                  <span className="font-medium">ვერიფიცირებული მომხმარებლები</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  <span className="font-medium">4.9 რეიტინგი</span>
                </div>
              </motion.div>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-20 md:mt-32"
            >
              {stats.map((stat, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative p-6 md:p-8 rounded-2xl md:rounded-3xl bg-card border border-border/50 hover:border-amber-500/30 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-500"
                >
                  <div className="absolute inset-0 rounded-2xl md:rounded-3xl bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative space-y-4">
                    <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-3xl md:text-4xl font-black tracking-tight">{stat.value}</p>
                      <p className="text-xs md:text-sm text-muted-foreground font-medium mt-1">{stat.label}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Services Section */}
        <section className="max-w-screen-xl mx-auto px-4 md:px-6">
          <div className="space-y-12 md:space-y-16">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold">
                  <TrendingUp className="h-3.5 w-3.5" />
                  სერვისები
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">
                  ყველაფერი რაც <br className="hidden sm:block" />
                  <span className="text-muted-foreground/40">გჭირდებათ.</span>
                </h2>
              </div>
              <Button variant="ghost" className="rounded-full font-bold group text-base h-12 px-6 hover:bg-amber-500/10 hover:text-amber-600">
                ყველას ნახვა 
                <ChevronRight className="ml-1 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Service Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {services.map((service, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                >
                  <Link 
                    to={service.to} 
                    className="group block relative aspect-[4/5] rounded-3xl overflow-hidden bg-stone-100 dark:bg-stone-900"
                  >
                    {/* Background Image */}
                    <img 
                      src={service.bgImage}
                      alt={service.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
                    
                    {/* Content */}
                    <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                      {/* Icon */}
                      <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 transition-transform duration-500`}>
                        {service.icon}
                      </div>
                      
                      {/* Text */}
                      <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">
                        {service.title}
                      </h3>
                      <p className="text-white/70 text-sm md:text-base font-medium leading-relaxed max-w-[250px]">
                        {service.desc}
                      </p>
                      
                      {/* Arrow */}
                      <div className="absolute top-6 right-6 h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white group-hover:bg-white group-hover:text-stone-900 transition-all duration-300">
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-stone-950 text-white py-24 md:py-32 overflow-hidden">
          <div className="max-w-screen-xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-20 items-center">
              {/* Left Column */}
              <div className="space-y-12">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-amber-400 text-xs font-bold">
                    <Zap className="h-3.5 w-3.5" />
                    რატომ ჩვენ?
                  </div>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[0.95]">
                    მომავლის <br />
                    <span className="text-white/30">ლოჯისტიკა.</span>
                  </h2>
                </div>
                
                {/* Feature List */}
                <div className="space-y-3">
                  {features.map((feature, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-5 p-5 rounded-2xl hover:bg-white/5 transition-colors group cursor-default"
                    >
                      <div className="h-12 w-12 rounded-xl bg-amber-500 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                        {feature.icon}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-lg font-bold">{feature.title}</h4>
                        <p className="text-white/50 text-sm font-medium leading-relaxed">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right Column - Visual */}
              <div className="relative hidden lg:block">
                <div className="relative">
                  {/* Main Image */}
                  <div className="aspect-square rounded-3xl overflow-hidden rotate-2 shadow-2xl">
                    <img 
                      src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800" 
                      alt="Logistics" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/50 to-transparent" />
                  </div>
                  
                  {/* Floating Card */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="absolute -bottom-8 -left-8 p-6 rounded-2xl bg-white text-stone-900 shadow-2xl max-w-[280px] -rotate-2"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-black uppercase tracking-wide">ვერიფიცირებული</span>
                    </div>
                    <p className="text-sm text-stone-600 font-medium leading-relaxed">
                      ყველა პარტნიორი გადის მკაცრ შემოწმებას პლატფორმაზე დაშვებამდე.
                    </p>
                  </motion.div>

                  {/* Stats Card */}
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="absolute -top-4 -right-4 p-5 rounded-2xl bg-amber-500 text-white shadow-xl rotate-3"
                  >
                    <div className="text-3xl font-black">98%</div>
                    <div className="text-sm font-medium opacity-90">კმაყოფილი კლიენტი</div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-screen-xl mx-auto px-4 md:px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative bg-stone-950 text-white rounded-3xl md:rounded-[3rem] p-10 md:p-16 lg:p-24 overflow-hidden"
          >
            {/* Content */}
            <div className="relative z-10 text-center space-y-8">
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight leading-[0.95]">
                მზად ხარ <br className="md:hidden" />
                <span className="text-amber-400">დასაწყებად?</span>
              </h2>
              <p className="text-lg md:text-xl text-white/70 font-medium max-w-2xl mx-auto leading-relaxed">
                შემოუერთდი 10,000-ზე მეტ პროფესიონალს და გახადე შენი ბიზნესი უფრო ეფექტური.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button 
                  asChild 
                  size="lg" 
                  className="w-full sm:w-auto h-14 md:h-16 px-10 md:px-14 rounded-2xl text-base md:text-lg font-bold bg-amber-500 hover:bg-amber-400 text-stone-900 shadow-xl shadow-amber-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Link to="/login">
                    რეგისტრაცია
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto h-14 md:h-16 px-10 md:px-14 rounded-2xl text-base md:text-lg font-bold border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/30"
                >
                  <Link to="/packets">გაიგე მეტი</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default Home;
