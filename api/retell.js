export default async function handler(req, res) {
  try {
    const event = req.body.event;

    console.log("Incoming Retell Event:", event);
    console.log("Full Payload:", JSON.stringify(req.body, null, 2));

    // Only send email once analysis is complete
    if (event === "call_analyzed") {
      const analysis = req.body.analysis || {};

      const name = analysis.name || "Not Provided";
      const phone = analysis.phone || "Not Provided";
      const location = analysis.location || "Not Provided";
      const requirement = analysis.requirement || "Not Provided";

      // Send email using your email API endpoint
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

      console.log("Email sent successfully");
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
