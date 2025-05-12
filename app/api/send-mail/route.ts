import nodemailer from "nodemailer";
import { Resend } from 'resend';
import { NextRequest, NextResponse } from "next/server";

// Define the POST method for sending emails
export async function POST(req: NextRequest) {
  try {
    const { to, subject, body } = await req.json();

    if (!to || !subject || !body) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Configure your mail transport
    const resend = new Resend(process.env.RESEND_API_KEY)
 
   const info = await resend.emails.send({
      from: `"Company Admin" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: body,
      html: '<p>' + body.replace(/\n/g, "<br>") + '</p>',
    });
    
    

    return NextResponse.json({ message: "Email sent successfully", info }, { status: 200 });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
