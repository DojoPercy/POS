export const uploadBase64Image = async (
  base64: string,
): Promise<string | null> => {
  console.log('Uploading image to Cloudinary...');
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64 }),
  });

  const data = await res.json();
  return data.url || null;
};
