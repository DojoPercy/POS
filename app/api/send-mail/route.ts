import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";

// Define the POST method for sending emails
export async function POST(req: NextRequest) {
  try {
    const { to, subject, body } = await req.json();

    if (!to || !subject || !body) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Configure your mail transport
    const transporter = nodemailer.createTransport({
      service: "Gmail", // You can use SMTP, SendGrid, etc.
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // App-specific password or SMTP password
      },
    });

    // Send mail
    const mailOptions = {
      from: `"Company Admin" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: body,
      html: `<p>${body.replace(/\n/g, "<br>")}</p>`,
    };

    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Email sent successfully", info }, { status: 200 });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
