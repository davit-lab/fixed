import React from "react";
import { Link } from "react-router-dom";
import { Truck, Mail, Phone, MapPin, Instagram, Facebook, Linkedin, Send, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { name: 'ტვირთები', to: '/cargo' },
      { name: 'რეისები', to: '/routes' },
      { name: 'სპეცტექნიკა', to: '/heavy-equipment' },
      { name: 'რუკა', to: '/map' },
    ],
    company: [
      { name: 'ჩვენს შესახებ', to: '/about' },
      { name: 'პაკეტები', to: '/packets' },
      { name: 'კონტაქტი', to: '/contact' },
      { name: 'დახმარება', to: '/faq' },
    ],
    contact: [
      { icon: <Mail className="h-4 w-4" />, text: 'info@cargoconnect.ge' },
      { icon: <Phone className="h-4 w-4" />, text: '+995 555 123 456' },
      { icon: <MapPin className="h-4 w-4" />, text: 'თბილისი, საქართველო' },
    ]
  };

  const socialLinks = [
    { icon: <Facebook className="h-4 w-4" />, href: '#', label: 'Facebook' },
    { icon: <Instagram className="h-4 w-4" />, href: '#', label: 'Instagram' },
    { icon: <Linkedin className="h-4 w-4" />, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer className="w-full border-t bg-stone-50 dark:bg-stone-950 pt-16 pb-8 overflow-hidden relative">
      {/* Top Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
      
      <div className="max-w-screen-xl mx-auto px-4 md:px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white p-2.5 rounded-xl shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-all">
                <Truck className="h-5 w-5" />
              </div>
              <span className="text-xl font-black tracking-tight">
                Cargo<span className="text-amber-500">Connect</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              საქართველოს წამყვანი ლოჯისტიკური პლატფორმა. ჩვენ ვაკავშირებთ ტვირთის მფლობელებს და გადამზიდველებს უსაფრთხო და ეფექტური გზით.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-2">
              {socialLinks.map((social, i) => (
                <a 
                  key={i} 
                  href={social.href}
                  aria-label={social.label}
                  className="h-10 w-10 rounded-xl bg-secondary hover:bg-amber-500 flex items-center justify-center text-muted-foreground hover:text-white transition-all duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">პლატფორმა</h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link, i) => (
                <li key={i}>
                  <Link 
                    to={link.to} 
                    className="text-sm font-medium text-foreground/80 hover:text-amber-500 transition-colors flex items-center gap-1 group"
                  >
                    {link.name}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">კომპანია</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link, i) => (
                <li key={i}>
                  <Link 
                    to={link.to} 
                    className="text-sm font-medium text-foreground/80 hover:text-amber-500 transition-colors flex items-center gap-1 group"
                  >
                    {link.name}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="lg:col-span-4 space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">საკონტაქტო</h4>
            <ul className="space-y-3">
              {footerLinks.contact.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-foreground/80">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                    {item.icon}
                  </div>
                  {item.text}
                </li>
              ))}
            </ul>

            {/* Newsletter */}
            <div className="space-y-3 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">სიახლეები</h4>
              <div className="flex gap-2">
                <Input 
                  type="email" 
                  placeholder="თქვენი ელ-ფოსტა" 
                  className="h-11 rounded-xl bg-background border-border/50 text-sm"
                />
                <Button className="h-11 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/20 border-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground font-medium">
            &copy; {currentYear} CargoConnect Georgia. ყველა უფლება დაცულია.
          </p>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link to="/privacy" className="hover:text-amber-500 transition-colors font-medium">
              კონფიდენციალურობა
            </Link>
            <Link to="/terms" className="hover:text-amber-500 transition-colors font-medium">
              წესები და პირობები
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
