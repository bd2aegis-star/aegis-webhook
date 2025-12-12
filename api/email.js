import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { name, phone, location, purpose } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Gmail SMTP Transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "marketing@aegis-lifesciences.com",
      subject: "New Caller Lead Received",
      html: `
        <h2>New Caller Lead</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Location:</strong> ${location || "Not provided"}</p>
        <p><strong>Purpose:</strong> ${purpose || "Not provided"}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true, message: "Email sent successfully" });

  } catch (error) {
    console.error("Email sending failed:", error);
    return res.status(500).json({ error: "Email sending failed" });
  }
}
