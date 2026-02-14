import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server"; // Use this for server-side session check
import { ArrowLeft, CarFront } from "lucide-react";
import { Button } from "@/components/ui/button";
import { checkUser } from '@/lib/checkUser';

const Header = async ({ isAdminPage = false }) => {
  // 1. Get auth status on the server to prevent flashing the Login button
  const { userId } = await auth(); 
  const user = await checkUser();
  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b shadow-sm">
      <nav className='container mx-auto px-4 py-4 flex items-center justify-between'>
        
        {/* Logo Section */}
        <Link href={isAdminPage ? "/admin" : "/"} className='flex items-center gap-2 hover:opacity-90 transition-opacity'>
          <Image 
            src="/img/logon.png"
            alt='Smart Wheels Logo'
            width={150} 
            height={50}
            className="h-10 w-auto object-contain"
            priority
          />
          
          {isAdminPage && (
            <span className="text-sm font-medium bg-gray-100 px-2 py-0.5 rounded-full ml-2">Admin</span>
          )}
        </Link>

        {/* Navigation Buttons */}
        <div className='flex items-center space-x-4'>
          
          {isAdminPage ? (
            <Link href='/saved-cars'>
              <Button variant="outline" className="text-black gap-2">
                <ArrowLeft size={16} />
                <span>Back to App</span>
              </Button>
            </Link>
          ) : (
            <SignedIn>
              <Link href='/saved-cars'>
                <Button variant="ghost" className="gap-2 text-gray-700 hover:text-black hover:bg-gray-100">
                  <CarFront size={18} />
                  <span className='hidden md:inline'>Saved Cars</span>
                </Button>
              </Link>

              {!isAdmin ? (
                <Link href='/reservations'>
                  <Button variant="ghost" className="gap-2 text-gray-700 hover:text-black hover:bg-gray-100">
                    <CarFront size={18} />
                    <span>My Reservations</span>
                  </Button>
                </Link>
              ) : (
                <Link href='/admin'>
                  <Button variant="outline" className="gap-2">
                    <CarFront size={18} />
                    <span className='hidden md:inline'>Admin Portal</span>
                  </Button>
                </Link>
              )}
            </SignedIn>
          )}

          {/* 2. THE FIX: Only render Login if NO userId exists on the server */}
          {!userId && (
            <SignedOut>
              <SignInButton mode="modal" forceRedirectUrl='/'>
                <Button className="bg-black text-white hover:bg-gray-800 transition-all">
                  Login
                </Button>
              </SignInButton>
            </SignedOut>
          )}

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10 border-2 border-gray-100",
                },
              }}
            />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
};

export default Header;