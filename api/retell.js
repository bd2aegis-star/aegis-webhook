export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const event = req.body;

  // Retell sends final call data on "call.completed"
  if (event.type !== "call.completed") {
    return res.status(200).json({ message: "Ignored event" });
  }

  const data = event.data?.collected_data || {};

  // Prepare email content
  const emailPayload = {
    to: process.env.GMAIL_USER,
    subject: `New Lead from AI Voice Agent`,
    text: `
New Lead Details:
Name: ${data.name || "Not provided"}
Phone: ${data.phone || "Not provided"}
Requirement: ${data.requirement || "Not provided"}
Location: ${data.location || "Not provided"}
    `,
  };

  // Send email via /api/email
  await fetch(`${req.headers.origin}/api/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(emailPayload),
  });

  return res.status(200).json({ success: true });
}
