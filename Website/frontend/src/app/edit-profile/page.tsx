'use client';

import { PencilIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '../../components/ui/header';
import { useRouter } from 'next/navigation';

const EditProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
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
          setUsername(data.username || '');
          setAvatarUrl(data.avatar_url || '');
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

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    let updatedAvatarUrl = avatarUrl; // Default to the current avatar URL

    if (selectedImage) {
      const filePath = `pics/${user?.id}-${selectedImage.name}`;
      const { data, error } = await supabase.storage
        .from('beepney-bucket')
        .upload(filePath, selectedImage);

      if (error) {
        alert('Error uploading image: ' + error.message);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('beepney-bucket')
        .getPublicUrl(filePath);

      updatedAvatarUrl = publicUrlData.publicUrl || avatarUrl;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ username, avatar_url: updatedAvatarUrl })
      .eq('id', user?.id);

    if (error) {
      alert('Error updating profile: ' + error.message);
    } else {

      if (password.trim() !== '') {
        const { error: passwordError } = await supabase.auth.updateUser({ password });
        if (passwordError) {
          alert('Error updating password: ' + passwordError.message);
          return;
        }
      }
      alert('Profile updated successfully!');
      router.push('/dashboard');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
      const objectUrl = URL.createObjectURL(e.target.files[0]);
      setAvatarUrl(objectUrl);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  return (
    <>
      <Header />
      <main className="max-w-screen-2xl mx-auto px-4 md:px-8 mt-[50px] space-y-[45px]">
        <div className="border border-[#D1D1D1] rounded-[15px] p-6">
          <h1 className="text-[32px] sm:text-[40px] font-bold text-[#073051] mb-6">Profile</h1>
          
          <form onSubmit={handleSave} className="space-y-8">
            
            {/* Avatar Section */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 mb-4">
                <img
                  src={avatarUrl || '/Default Profile.svg'}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>

              <label
                htmlFor="image-upload"
                className="cursor-pointer group flex items-center space-x-2 border border-[#D1D1D1] px-4 py-2 rounded-[15px] text-[#9A9A9A] hover:bg-[#D1D1D1] hover:text-[#6B6B6B] transition-colors duration-200"
              >
                <PencilIcon className="h-5 w-5 text-[#073051] group-hover:text-[#6B6B6B]" />
                <span>Edit Picture</span>
              </label>

              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium" style={{ color: '#737F83' }}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                placeholder="Enter your username"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium" style={{ color: '#737F83' }}>New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                placeholder="Enter new password"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium" style={{ color: '#737F83' }}>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                placeholder="Confirm new password"
              />
            </div>

            {/* Submit & Cancel */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center space-x-2 border border-[#D1D1D1] px-4 py-2 rounded-[15px] text-[#9A9A9A] hover:bg-[#D1D1D1] hover:text-[#6B6B6B] transition-colors duration-200"
              >
                <span>Cancel</span>
              </button>

              <button
                type="submit"
                className="bg-[#1E86DA] text-white py-2 px-6 rounded-[15px] hover:bg-[#1478C9] transition-colors duration-200"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default EditProfilePage;