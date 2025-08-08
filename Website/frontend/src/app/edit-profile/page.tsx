'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '../../components/ui/header';
import { useRouter } from 'next/navigation';

const EditProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setUser(data);
          setUsername(data.username || '');  // Set current username
          setAvatarUrl(data.avatar_url || '');  // Set current avatar URL
        }
      }
    };

    fetchUserProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (username.trim() === '') {
      alert('Username cannot be empty');
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ username, avatar_url: avatarUrl })
      .eq('id', user?.id);

    if (error) {
      alert('Error updating profile: ' + error.message);
    } else {
      alert('Profile updated successfully!');
      router.push('/dashboard');
    }
  };

  return (
    <>
      <Header />
      <main className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Edit Profile</h1>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              placeholder="Enter your username"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Avatar URL</label>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              placeholder="Enter your avatar URL"
            />
          </div>
          
          <button
            type="submit"
            className="w-full mt-4 bg-blue-500 text-white py-2 rounded-md"
          >
            Save Changes
          </button>
        </form>
      </main>
    </>
  );
};

export default EditProfilePage;