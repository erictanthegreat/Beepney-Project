"use client";

import { PencilIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Header from "../../components/ui/header";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  role: string | null;
}

const EditProfilePage = () => {
  const [user, setUser] = useState<Profile | null>(null);
  const [username, setUsername] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single<Profile>();

        if (data) {
          setUser(data);
          setUsername(data.username ?? "");
          setAvatarUrl(data.avatar_url ?? "");
          setRole(data.role ?? "");
        }
      }
    };

    fetchUserProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (username.trim() === "") {
      alert("Username cannot be empty");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    let updatedAvatarUrl = avatarUrl;

    if (selectedImage && user) {
      const filePath = `pics/${user.id}/${selectedImage.name}`;
      const { error: uploadError } = await supabase.storage
        .from("beepney-bucket")
        .upload(filePath, selectedImage, { upsert: true });

      if (uploadError) {
        alert("Error uploading image: " + uploadError.message);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("beepney-bucket")
        .getPublicUrl(filePath);

      updatedAvatarUrl = publicUrlData.publicUrl ?? avatarUrl;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ username, avatar_url: updatedAvatarUrl, role: role.trim() })
      .eq("id", user?.id);

    if (updateError) {
      alert("Error updating profile: " + updateError.message);
    } else {
      if (password.trim() !== "") {
        const { error: passwordError } = await supabase.auth.updateUser({
          password,
        });
        if (passwordError) {
          alert("Error updating password: " + passwordError.message);
          return;
        }
      }
      alert("Profile updated successfully!");
      router.push("/dashboard");
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
    router.push("/dashboard");
  };

  return (
    <>
      <Header />
      <main className="max-w-screen-2xl mx-auto px-4 md:px-8 mt-[50px] space-y-[45px]">
        <div className="border border-[#D1D1D1] rounded-[30px] p-6">
          <h1 className="text-[32px] sm:text-[40px] font-bold text-[#073051] mb-6">
            Profile
          </h1>

          <form onSubmit={handleSave} className="space-y-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 mb-4 relative">
                <Image
                  src={avatarUrl || "/Default Profile.svg"}
                  alt="Avatar"
                  fill
                  className="rounded-full object-cover"
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

            {/* Username + Role inline */}
            <div className="flex gap-4">
              <div className="w-2/3">
                <label
                  className="block text-sm font-medium"
                  style={{ color: "#737F83" }}
                >
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  placeholder="Enter your username"
                />
              </div>

              <div className="w-1/3">
                <label
                  className="block text-sm font-medium"
                  style={{ color: "#737F83" }}
                >
                  Role
                </label>
                <input
                  type="text"
                  value={
                    role.toLowerCase() === "admin"
                      ? "Super Admin"
                      : role.toUpperCase()
                  }
                  readOnly
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                  placeholder="N/A"
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label
                className="block text-sm font-medium"
                style={{ color: "#737F83" }}
              >
                New Password
              </label>
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
              <label
                className="block text-sm font-medium"
                style={{ color: "#737F83" }}
              >
                Confirm Password
              </label>
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
