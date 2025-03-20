import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";
import crypto from "crypto";

// Initialize Redis
const redis = new Redis(process.env.REDIS_URL!);


function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }


    const otp = generateOTP();
    await redis.set(`otp:${email}`, otp, "EX", 900); 

  
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });


    const mailOptions = {
      from: `"Company Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It expires in 15 minutes.`,
      html: `<p>Your OTP code is <strong>${otp}</strong>. It expires in 15 minutes.</p>`,
    };

 
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "OTP sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
