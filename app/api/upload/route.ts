import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const { base64 } = await req.json();

    if (!base64) {
      return new NextResponse(
        JSON.stringify({ error: 'Base64 string is required' }),
        { status: 400 }
      );
    }

    // Upload the base64 image to Cloudinary
    const result = await cloudinary.uploader.upload(base64, {
      folder: 'uploads', // Folder where the image will be stored
      resource_type: 'image', // Set the resource type as image
    });

    // Return the uploaded image URL
    return new NextResponse(JSON.stringify({ url: result.secure_url }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to upload image' }),
      { status: 500 }
    );
  }
}
