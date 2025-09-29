import React, { Suspense, lazy } from 'react';
import HeroSection from '@/components/feature/HeroSection';
import ErrorBoundary from '@/components/security/ErrorBoundary';
import OffersSection from '@/components/feature/OffersSection/OffersSection';
import Banner from '@/components/feature/Banner/Banner';

const AdventureVideoSection = lazy(() => import('@/components/feature/QASection/QA'));
const FAQ = lazy(() => import('@/components/feature/FAQSection/FAQ'));
const WhyChooseUs = lazy(() => import('@/components/feature/WhyChooseUsSection/WhyChooseUs'));
const FeaturedDestinations = lazy(() => import('@/components/feature/FeaturedDestinationsSection/FeaturedDestinations'));
const TestimonialsSection = lazy(() => import('@/components/feature/TestimonialsSection/TestimonialsSection'));
const InspirationSection = lazy(() => import('@/components/feature/InspirationSection/InspirationSection'));

const ComponentLoader = () => (
  <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
);

export default function HomePage() {
  return (
    <ErrorBoundary>
      <main className="relative overflow-hidden">
        <HeroSection />

        
        {/* Add the new Inspiration Section right after Hero */}

        <Suspense fallback={<ComponentLoader />}>
          <Banner />
        </Suspense>


        <Suspense fallback={<ComponentLoader />}>
          <OffersSection />
        </Suspense>

        <Suspense fallback={<ComponentLoader />}>
          <InspirationSection />
        </Suspense>

        <Suspense fallback={<ComponentLoader />}>
          <AdventureVideoSection />
        </Suspense>

        <Suspense fallback={<ComponentLoader />}>
          <WhyChooseUs />
        </Suspense>

        <Suspense fallback={<ComponentLoader />}>
          <FeaturedDestinations />
        </Suspense>

        {/* <Suspense fallback={<ComponentLoader />}>
          <TestimonialsSection />
        </Suspense> */}

        <Suspense fallback={<ComponentLoader />}>
          <FAQ />
        </Suspense>
      </main>
    </ErrorBoundary>
  );
}