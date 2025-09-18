import React, { Suspense, lazy } from 'react';
import HeroSection from '@/components/feature/HeroSection';
import ErrorBoundary from '@/components/security/ErrorBoundary';

const AdventureVideoSection = lazy(() => import('@/components/feature/QASection/QA'));
const FAQ = lazy(() => import('@/components/feature/FAQSection/FAQ'));
const WhyChooseUs = lazy(() => import('@/components/feature/WhyChooseUsSection/WhyChooseUs'));
const FeaturedDestinations = lazy(() => import('@/components/feature/FeaturedDestinationsSection/FeaturedDestinations'));
const TestimonialsSection = lazy(() => import('@/components/feature/TestimonialsSection/TestimonialsSection'));

const ComponentLoader = () => (
  <div className="h-96 bg-gray-100 animate-pulse" />
);

export default function HomePage() {
  return (
    <ErrorBoundary>
      <main className="relative overflow-hidden">
        <HeroSection />

        {/* <Suspense fallback={<ComponentLoader />}> */}
        {/*   <AdventureVideoSection /> */}
        {/* </Suspense> */}

        <Suspense fallback={<ComponentLoader />}>
          <WhyChooseUs />
        </Suspense>

        <Suspense fallback={<ComponentLoader />}>
          <FeaturedDestinations />
        </Suspense>

        {/* <Suspense fallback={<ComponentLoader />}> */}
        {/*   <TestimonialsSection /> */}
        {/* </Suspense> */}

        <Suspense fallback={<ComponentLoader />}>
          <FAQ />
        </Suspense>
      </main>
    </ErrorBoundary>
  );
}