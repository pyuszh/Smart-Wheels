import React from 'react'
import CarsList from './_components/car-list'


export const metadata = {
    title: "Cars|Smart Wheels Admin",
    description: "Manage cars in your Marketplace",
};


const CarPage = () => {
  return <div className='p-6'>
    <h1 className='text-2xl font-bold mb-6'>Cars Management</h1>
    <CarsList />
  </div>
};

export default CarPage