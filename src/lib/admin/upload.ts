import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

const MAX_BYTES = 4 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

/**
 * Uploads an image from a form file input to the public "media" bucket.
 * Returns the public URL, null if no file was chosen, or throws with a readable message.
 */
export async function uploadImage(supabase: SupabaseClient, file: FormDataEntryValue | null, folder: string) {
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > MAX_BYTES) throw new Error("Image must be 4 MB or smaller.");
  if (!TYPES.includes(file.type)) throw new Error("Upload a JPG, PNG, WebP, AVIF or GIF image.");

  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
}
