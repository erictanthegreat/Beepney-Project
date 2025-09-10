'use client';

import React, { useEffect, useState, forwardRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { BellIcon } from '@heroicons/react/24/solid';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

const navItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Stations', href: '/stations' },
  { name: 'Contacts', href: '/contacts' },
  { name: 'Drivers', href: '/drivers' },
  { name: 'Fare Matrix', href: '/fare-matrix' },
];

// Extend user type so we can store avatar_url
interface UserWithAvatar extends User {
  avatar_url?: string | null;
}

// Forward the ref to the header element
const Header = forwardRef<HTMLElement, {}>((_, ref) => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserWithAvatar | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // get avatar from profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single();

        setUser({
          ...user,
          avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url,
        });
      }

      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <header ref={ref} className="w-full border-b border-[#D1D1D1] bg-white">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between px-4 md:px-8 py-3">
        
        {/* Logo */}
        <div
          onClick={() => router.push('/dashboard')}
          className="flex items-center space-x-3 pr-8 cursor-pointer"
        >
          <img
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
              <button className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium md:w-9 md:h-9 sm:w-8 sm:h-8 overflow-hidden">
                {loading ? (
                  <div className="w-full h-full bg-gray-400 rounded-full animate-pulse" />
                ) : (
                  <img
                    src={user?.avatar_url || "/Default Profile.svg"}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white shadow-md border rounded-md">
              <DropdownMenuItem onSelect={() => router.push('/edit-profile')}>
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 hover:!text-red-700"
                onSelect={handleLogout}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;