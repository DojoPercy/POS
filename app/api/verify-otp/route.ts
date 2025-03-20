import { NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";

// Initialize Redis
const redis = new Redis(process.env.REDIS_URL!);

// POST request handler for verifying OTP
export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    // Retrieve OTP from Redis
    const storedOtp = await redis.get(`otp:${email}`);

    if (!storedOtp) {
      return NextResponse.json({ error: "OTP expired or invalid" }, { status: 400 });
    }

    if (storedOtp !== otp) {
      return NextResponse.json({ error: "Incorrect OTP" }, { status: 400 });
    }

    // Delete OTP from Redis after successful verification
    await redis.del(`otp:${email}`);

    return NextResponse.json({ message: "OTP verified successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
  }
}
