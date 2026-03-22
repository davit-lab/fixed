import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Zap, Shield, Globe, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const postPackets = [
  {
    name: 'სტანდარტული',
    price: '5',
    description: 'ერთი განცხადების განთავსება 24 საათით',
    features: [
      'აქტიურია 24 საათი',
      'მყისიერი გამოქვეყნება',
      'რუკაზე გამოჩენა',
      'პირდაპირი კონტაქტი'
    ],
    icon: <Zap className="h-6 w-6" />,
    gradient: 'from-blue-500 to-cyan-500',
    badge: 'სწრაფი'
  },
  {
    name: 'პრემიუმი',
    price: '15',
    description: 'განცხადების განთავსება 7 დღით',
    features: [
      'აქტიურია 7 დღე',
      'პრიორიტეტული გამოჩენა',
      'რუკაზე გამოჩენა',
      'სტატისტიკის ნახვა',
      'სოც. მედია გაზიარება'
    ],
    icon: <Shield className="h-6 w-6" />,
    gradient: 'from-amber-500 to-orange-500',
    badge: 'პოპულარული',
    popular: true
  },
  {
    name: 'VIP პაკეტი',
    price: '50',
    description: 'ერთი განცხადების განთავსება 30 დღით',
    features: [
      'აქტიურია 30 დღე',
      'TOP პოზიცია სიაში',
      'გამოყოფილი ფერი',
      'პერსონალური მხარდაჭერა',
      'რუკაზე VIP მარკერი'
    ],
    icon: <Zap className="h-6 w-6" />,
    gradient: 'from-emerald-500 to-teal-500',
    badge: 'საუკეთესო ფასი'
  },
  {
    name: 'ექსკლუზივი',
    price: '120',
    description: 'მაქსიმალური ხილვადობა 60 დღით',
    features: [
      'აქტიურია 60 დღე',
      'მუდმივი TOP პოზიცია',
      'SMS შეტყობინებები',
      'პრემიუმ ანალიტიკა',
      'VIP მხარდაჭერა 24/7'
    ],
    icon: <Globe className="h-6 w-6" />,
    gradient: 'from-violet-500 to-purple-600',
    badge: 'მაქსიმალური'
  }
];

const Packets = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Section */}
      <section className="relative pt-8 pb-16 md:pt-12 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/10 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-screen-xl mx-auto px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20 mb-6"
          >
            <Sparkles className="h-3.5 w-3.5" />
            ტარიფები და პაკეტები
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight"
          >
            აირჩიეთ თქვენი <br className="hidden sm:block" />
            <span className="text-gradient-accent">შესაძლებლობა</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-lg text-muted-foreground font-medium max-w-xl mx-auto"
          >
            გაზარდეთ თქვენი ლოჯისტიკური ბიზნესის ხილვადობა და ეფექტურობა ჩვენი პრემიუმ სერვისებით.
          </motion.p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-screen-xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-1 w-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-500">ერთჯერადი</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">განცხადების პაკეტები</h2>
          </div>
          <p className="text-muted-foreground text-sm font-medium max-w-sm">კონკრეტული განცხადების პოპულარიზაციისთვის და სწრაფი შედეგისთვის.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {postPackets.map((packet, index) => (
            <motion.div
              key={packet.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <Card className={`p-6 h-full flex flex-col rounded-2xl border transition-all duration-500 bg-card group overflow-hidden relative ${
                packet.popular 
                  ? 'border-amber-500/50 shadow-xl shadow-amber-500/10' 
                  : 'border-border/50 hover:border-border hover:shadow-lg'
              }`}>
                {/* Popular Badge */}
                {packet.popular && (
                  <div className="absolute -top-px left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
                )}

                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${packet.gradient} flex items-center justify-center text-white shadow-lg`}>
                    {packet.icon}
                  </div>
                  {packet.badge && (
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                      packet.popular 
                        ? 'bg-amber-500 text-white' 
                        : 'bg-secondary text-muted-foreground'
                    }`}>
                      {packet.badge}
                    </span>
                  )}
                </div>

                {/* Title */}
                <div className="space-y-2 mb-6">
                  <h3 className="text-lg font-bold tracking-tight">{packet.name}</h3>
                  <p className="text-muted-foreground text-xs font-medium leading-relaxed">{packet.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-black tracking-tight bg-gradient-to-r ${packet.gradient} bg-clip-text text-transparent`}>
                      {packet.price}₾
                    </span>
                    <span className="text-muted-foreground font-medium text-xs">/პაკეტი</span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8 flex-grow">
                  {packet.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2.5">
                      <div className={`h-5 w-5 rounded-md bg-gradient-to-br ${packet.gradient} flex items-center justify-center shrink-0`}>
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-xs font-medium text-foreground/80">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Button className={`w-full h-12 rounded-xl font-bold text-sm bg-gradient-to-r ${packet.gradient} hover:opacity-90 text-white shadow-lg transition-all active:scale-[0.98]`}>
                  არჩევა
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-screen-xl mx-auto px-4 md:px-6 mt-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Shield, title: 'უსაფრთხოება', desc: 'ყველა ტრანზაქცია და მონაცემი დაცულია საერთაშორისო SSL სტანდარტებით.', gradient: 'from-emerald-500 to-teal-500' },
            { icon: Globe, title: 'გლობალური წვდომა', desc: 'მართეთ თქვენი გადაზიდვები და ლოჯისტიკა მსოფლიოს ნებისმიერი წერტილიდან.', gradient: 'from-blue-500 to-cyan-500' },
            { icon: Zap, title: 'სისწრაფე', desc: 'მყისიერი შეტყობინებები, სწრაფი ძიება და მარშრუტის ავტომატური ოპტიმიზაცია.', gradient: 'from-amber-500 to-orange-500' }
          ].map((item, idx) => (
            <motion.div 
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 rounded-2xl bg-card border border-border/50 hover:border-border hover:shadow-lg transition-all group text-center"
            >
              <div className={`h-14 w-14 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center mx-auto mb-5 text-white shadow-lg group-hover:scale-110 transition-transform`}>
                <item.icon className="h-7 w-7" />
              </div>
              <h4 className="text-lg font-bold tracking-tight mb-2">{item.title}</h4>
              <p className="text-muted-foreground text-sm font-medium leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Packets;
