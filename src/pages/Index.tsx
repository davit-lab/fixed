import React from "react";
import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { PopularListings } from '@/components/home/PopularListings';

const Index = () => {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <PopularListings />
    </>
  );
};

export default Index;
