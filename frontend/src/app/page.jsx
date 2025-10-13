import React, { Suspense, lazy } from 'react';
import HeroSection from '@/components/feature/HeroSection';
import ErrorBoundary from '@/components/security/ErrorBoundary';
import OffersSection from '@/components/feature/OffersSection/OffersSection';
import Banner from '@/components/feature/Banner/Banner';

const AdventureVideoSection = lazy(() => import('@/components/feature/QASection/QA'));
const FAQ = lazy(() => import('@/components/feature/FAQSection/FAQ'));
const WhyChooseUs = lazy(() => import('@/components/feature/WhyChooseUsSection/WhyChooseUs'));
const FeaturedDestinations = lazy(() => import('@/components/feature/FeaturedDestinationsSection/FeaturedDestinations'));
const PopularActivities = lazy(() => import('@/components/feature/PopularActivitiesSection/PopularActivities'));
const ActivitiesByCountries = lazy(() => import('@/components/feature/ActivitiesByCountriesSection/ActivitiesByCountries'));
const TestimonialsSection = lazy(() => import('@/components/feature/TestimonialsSection/TestimonialsSection'));
// const InspirationSection = lazy(() => import('@/components/feature/InspirationSection/InspirationSection'));

const ComponentLoader = () => (
  <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
);

export default function HomePage() {
  return (
    <ErrorBoundary>
      <main className="relative overflow-hidden">
        {/* 1. HERO SECTION - Main CTA & Search */}
        <HeroSection />

        {/* 2. WHY CHOOSE US - Build Trust Early (Best Practice: Airbnb, Booking.com) */}
        {/* <Suspense fallback={<ComponentLoader />}>
          <WhyChooseUs />
        </Suspense> */}

        {/* 3. BANNER - Promotional Announcements */}
        {/* <Suspense fallback={<ComponentLoader />}>
          <Banner />
        </Suspense> */}

        

        {/* 4. OFFERS SECTION - Special Deals & Urgency (Best Practice: Expedia, Klook) */}
        <Suspense fallback={<ComponentLoader />}>
          <OffersSection />
        </Suspense>.

                {/* 6. ACTIVITIES BY COUNTRIES - Browse by Location (Best Practice: Booking.com) */}
                <Suspense fallback={<ComponentLoader />}>
          <ActivitiesByCountries />
        </Suspense>

        {/* 5. POPULAR ACTIVITIES - Social Proof (Best Practice: TripAdvisor, Klook) */}
        <Suspense fallback={<ComponentLoader />}>
          <PopularActivities />
        </Suspense>



        {/* 7. Q&A / HOW IT WORKS - Educational Content */}
        {/* <Suspense fallback={<ComponentLoader />}>
          <AdventureVideoSection />
        </Suspense> */}

        {/* 8. FAQ - Comprehensive Questions at Bottom */}
        <Suspense fallback={<ComponentLoader />}>
          <FAQ />
        </Suspense>

        {/* COMMENTED OUT SECTIONS */}
        {/* <Suspense fallback={<ComponentLoader />}>
          <InspirationSection />
        </Suspense> */}

        {/* <Suspense fallback={<ComponentLoader />}>
          <FeaturedDestinations />
        </Suspense> */}

        {/* <Suspense fallback={<ComponentLoader />}>
          <TestimonialsSection />
        </Suspense> */}
      </main>
    </ErrorBoundary>
  );
}