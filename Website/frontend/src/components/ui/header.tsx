'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { BellIcon } from '@heroicons/react/24/solid';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';

const navItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Stations', href: '/stations' },
  { name: 'Contacts', href: '/contacts' },
  { name: 'Drivers', href: '/drivers' },
  { name: 'Fare Matrix', href: '/fare-matrix' },
];

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="w-full border-b border-[#D1D1D1] bg-white">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between px-4 md:px-8 py-3">
        
        {/* Logo */}
        <div
          onClick={() => router.push('/dashboard')}
          className="flex items-center space-x-3 pr-8 cursor-pointer"
        >
          <Image
            src="/Beepney Logo (Website 2).svg"
            alt="Beepney Logo"
            width={64}
            height={64}
          />
        </div>

        {/* Navigation */}
        <nav className="flex space-x-10 md:space-x-6 sm:space-x-4">
          {navItems.map(({ name, href }) => (
            <div
              key={href}
              onClick={() => router.push(href)}
              className={`cursor-pointer text-[20px] md:text-[18px] sm:text-[16px] font-semibold transition-opacity duration-300 ease-in-out ${
                pathname === href
                  ? 'text-[#1E86DA]'
                  : 'text-[#737F83] hover:text-[#8a9aa0] hover:opacity-80'
              }`}
            >
              {name}
            </div>
          ))}
        </nav>

        <div className="flex items-center space-x-8 md:space-x-6 sm:space-x-4 pl-8">
          
          {/* Notification */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative">
                <BellIcon className="h-7 w-7 text-[#073051]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-72 bg-white shadow-md border rounded-md p-4"
            >
              <p className="text-sm text-gray-500">No notifications yet.</p>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium md:w-9 md:h-9 sm:w-8 sm:h-8">
                ET
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white shadow-md border rounded-md">
              <DropdownMenuItem onSelect={() => router.push('/edit-profile')}>
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 hover:!text-red-700"
                onSelect={() => router.push('/')}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;