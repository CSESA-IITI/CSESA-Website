/** Imported photos reference a public URL or a file already in uploads/. */
export function normalizeProfileImage(value: string): string | null {
  const photo = value.trim();
  if (!photo) return null;
  if (photo.length > 2048)
    throw new Error("Photo reference exceeds 2048 characters.");
  if (/^https?:\/\//i.test(photo)) {
    const url = new URL(photo);
    if (!url.hostname || url.username || url.password || /\s/.test(photo))
      throw new Error("Invalid photo URL.");
    return url.href;
  }
  const filename = photo.replace(/^\/?uploads\//, "");
  if (
    !/^[a-zA-Z0-9][a-zA-Z0-9._-]*\.(?:jpe?g|png|webp|gif|avif)$/i.test(filename)
  )
    throw new Error(
      "Use a public HTTP(S) image URL or an existing uploads filename.",
    );
  return filename;
}

export function resolveProfileImage(
  imagePath: string | null,
  origin: string,
): string | null {
  if (!imagePath) return null;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  return `${origin.replace(/\/$/, "")}/uploads/${imagePath.replace(/^\/?uploads\//, "")}`;
}
