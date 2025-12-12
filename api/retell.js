export default async function handler(req, res) {
  try {
    const event = req.body.event;

    console.log("Incoming Retell Event:", event);
    console.log("Full Payload:", JSON.stringify(req.body, null, 2));

    // Only send email after final analysis
    if (event === "call_analyzed") {
      const custom = req.body.analysis?.custom_analysis || {};

      const name = custom.name || "Not Provided";
      const phone = custom.phone || "Not Provided";
      const location = custom.location || "Not Provided";
      const requirement = custom.requirement || "Not Provided";

      // Send email
      await fetch("https://aegis-webhook.vercel.app/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "bd2.aegis@gmail.com",
          subject: "New Inquiry from Voice Agent",
          html: `
            <h2>New Call Received</h2>
            <p><b>Name:</b> ${name}</p>
            <p><b>Phone:</b> ${phone}</p>
            <p><b>Location:</b> ${location}</p>
            <p><b>Requirement:</b> ${requirement}</p>
          `
        })
      });

      console.log("Email sent successfully with extracted fields");
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
