import { supabase } from "./supabase";

export const createNotification = async (
  userId: string,
  type: string,
  title: string,
  message: string,
  status?: string,
  referenceId?: number
) => {
  try {
    const { error } = await supabase.from("notifications").insert({
      user_id: userId,
      type,
      title,
      message,
      status,
      reference_id: referenceId,
    });

    if (error) {
      console.error("Error creating notification:", error);
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
};
