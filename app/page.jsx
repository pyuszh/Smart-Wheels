import Link from "next/link";
import Image from "next/image";
import HomeSearch from "@/components/home-search";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { ChevronRight, Car, Calendar, Shield } from "lucide-react";
import { carMakes, bodyTypes, faqItems } from "@/lib/data";
import CarCard from "@/components/car-card";
import { SignedOut } from "@clerk/nextjs";
import { getFeaturedCars } from "@/actions/cars";

export default async function Home() {

  const featuredCars = await getFeaturedCars();


  return (
    <div className="flex flex-col bg-white min-h-screen">
      
      {/* 1. NEW CINEMATIC HERO SECTION */}
      <section className="relative h-[85vh] flex flex-col justify-end items-center overflow-hidden pb-32">
        {/* Background Image with Cinematic Fade */}
        <div className="absolute inset-0 z-0">
    <Image
      src="/img/hero.jpg" 
      alt="Luxury Car Background"
      fill
      className="object-cover opacity-90"
      priority
    />
    <div className="absolute inset-0 bg-gradient-to-t from-[#020817] via-transparent to-black/40"></div>
  </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-5xl mx-auto text-center px-4 -mt-32">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/80 text-sm font-medium mb-6 animate-fade-in-up">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
      AI-Powered Search Engine
    </div>

          <h1 className="text-5xl md:text-8xl font-bold mb-6 text-white tracking-tighter drop-shadow-2xl">
            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Drive.</span>
          </h1>

          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Experience the future of car buying. AI-curated listings, instant financing, and verified dealers.
          </p>

          {/* Search Bar Container */}
          <div className="transform hover:scale-[1.01] transition-all duration-300">
            <HomeSearch />
          </div>
        </div>
      </section>

      {/* 2. FEATURED CARS SECTION (Your Original Logic) */}
      <section className="py-20 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Featured Cars</h2>
            <Button variant="ghost" className="flex items-center hover:bg-transparent hover:text-blue-600 transition-colors">
              <Link href="/cars">View All</Link>
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        </div>
      </section>

      {/* 3. BROWSE BY MAKE (Your Original Logic + Fixed Links) */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Browse by Make</h2>
            <Button variant="ghost" className="flex items-center hover:bg-transparent hover:text-blue-600 transition-colors">
              <Link href="/cars">View All</Link>
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {carMakes.map((make) => {
              return (
                <Link
                  key={make.name}
                  href={`/cars?make=${make.name}`} // Fixed the backticks for you
                  className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-transparent hover:border-blue-100"
                >
                  <div className="h-16 w-auto mx-auto mb-4 relative grayscale hover:grayscale-0 transition-all duration-500">
                    <Image
                      src={make.image}
                      alt={make.name}
                      fill
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                  <h3 className="font-semibold text-gray-700">{make.name}</h3>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. NEW BENTO GRID FOR BODY TYPES */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Browse by Body Type</h2>

            <Button variant="ghost" className="flex items-center">
              <Link href="/cars">View All</Link>
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bodyTypes.map((type) => {
              return (
                <Link
                  key={type.name}
                  href={`/cars?bodyType=${type.name}`}
                  className="relative group cursor-pointer"
                >
                  <div className="overflow-hidden rounded-lg flex justify-end h-28 mb-4 relative">
                    <Image
                      src={type.image}
                      alt={type.name}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/60 to transparent
                  rounded-lg flex items-end"
                  >
                    <h3 className="text-white text-xl font-bold pl-4 pb-2">
                      {type.name}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
                  
                  

      {/* 5. WHY CHOOSE US (Your Original Info) */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 tracking-tight">
            Why Choose Our Platform
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="bg-blue-50 text-blue-600 rounded-3xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <Car className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-3">Wide Selection</h3>
              <p className="text-gray-500 leading-relaxed">
                Thousands of verified vehicles from trusted dealerships and
                private sellers.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-blue-50 text-blue-600 rounded-3xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <Calendar className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-3">Easy Test Drive</h3>
              <p className="text-gray-500 leading-relaxed">
                Book a test drive online in minutes, with flexible scheduling
                options.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-blue-50 text-blue-600 rounded-3xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <Shield className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure Process</h3>
              <p className="text-gray-500 leading-relaxed">
                Verified listings and secure booking process for peace of mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION (Your Original Info) */}s
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-10 tracking-tight">
            Frequently Asked Questions
          </h2>

          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((faq, index) => {
              return (
                <AccordionItem
                 key={index}
                  value={`item-${index}`} className="border-b-gray-200">
                  <AccordionTrigger className="text-left text-lg font-medium py-6 hover:text-blue-600 hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 leading-relaxed pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </section>

      {/* 7. NEW GLOWING CTA SECTION */}
      <section className="relative py-24 overflow-hidden bg-[#0f172a]">
        {/* Glowing Background Orbs */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px]" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">
            Ready to find your dream car?
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto font-light">
            Join thousands of satisfied customers who found their perfect
            vehicle using our AI-powered platform.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Button 
              size="lg" 
              className="bg-white text-slate-900 hover:bg-gray-100 hover:scale-105 transition-all duration-300 rounded-full px-8 py-6 text-lg font-semibold shadow-xl shadow-white/10" 
              asChild
            >
              <Link href="/cars">View All Cars</Link>
            </Button>
            
            <SignedOut>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/20 text-white bg-transparent hover:bg-white/10 rounded-full px-8 py-6 text-lg backdrop-blur-sm" 
                asChild
              >
                <Link href="/sign-up">Sign Up Now</Link>
              </Button>
            </SignedOut>
          </div>
        </div>
      </section>

    </div>
  );
}