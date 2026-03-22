import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase, Category } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { 
  Truck, 
  Building2, 
  Construction, 
  Container,
  Cylinder,
  Shovel,
  Loader2
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Truck,
  Building2,
  Construction,
  Container,
  Cylinder,
  Shovel,
};

export function CategoriesSection() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data as Category[];
    },
  });

  const getCategoryName = (cat: Category) => {
    if (i18n.language === 'ka') return cat.name_ka || cat.name;
    if (i18n.language === 'ru') return cat.name_ru || cat.name;
    return cat.name;
  };

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/equipment?category=${encodeURIComponent(categoryName)}`);
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{t("categories.title", "Choose a Service")}</h2>
          <p className="text-muted-foreground">{t("categories.subtitle", "Select a category and find the service you need")}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories?.map((cat, index) => {
            const IconComponent = iconMap[cat.icon || ''] || Construction;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                onClick={() => handleCategoryClick(cat.name)}
                className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm text-center cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <IconComponent className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium text-sm">{getCategoryName(cat)}</h3>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
