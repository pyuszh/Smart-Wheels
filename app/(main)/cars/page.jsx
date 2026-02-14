import { getCarFilters } from "@/actions/car-listing";
import React from "react";
import CarListings from "./_components/car-listing";
import  CarFilters  from "./_components/car-filter"; // CORRECT: No braces for default exports

export const metadata = {
  title: "Cars | Vehiql",
  description: "Browse and search for your dream car",
};

const CarsPage = async () => {
  const filtersData = await getCarFilters();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-6xl mb-4 gradient-title">Browse Cars</h1>

      <div className="flex flex-col lg:flex-row gap-8">
     <div className="w-full lg:w-80 flex-shrink-0">
        {/*Filter */}
        <CarFilters filters = {filtersData.data}/>
        
        </div> 


       <div className="flex-1">
        {/*Listings */}
        
        <CarListings />
        
        </div> 
      </div>
    </div>
  );
};

export default CarsPage;