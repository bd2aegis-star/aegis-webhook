import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const payload = req.body;

    // Correct field paths from Retell Webhook
    const name = payload?.analysis?.name || "Not Provided";
    const phone = payload?.analysis?.phone || "Not Provided";
    const location = payload?.analysis?.location || "Not Provided";
    const requirement = payload?.analysis?.requirement || "Not Provided";

    // Prepare email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER, // send to same Gmail
      subject: "New Inquiry from Voice Agent",
      html: `
        <h2>New Call Received</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Requirement:</strong> ${requirement}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Email sent",
    });
  } catch (err) {
    console.error("Webhook Error:", err);
    return res.status(500).json({ error: err.message });
  }
}
