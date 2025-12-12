// api/retell.js
export default async function handler(req, res) {
  try {
    const payload = req.body || {};
    console.log("RAW WEBHOOK PAYLOAD:", JSON.stringify(payload, null, 2));

    // helper to search for candidate values in many common paths
    const getField = (paths) => {
      for (const p of paths) {
        try {
          const parts = p.split(".");
          let v = payload;
          for (const key of parts) {
            if (v == null) { v = undefined; break; }
            v = v[key];
          }
          if (v !== undefined && v !== null && String(v).trim() !== "") return v;
        } catch (e) { /* ignore */ }
      }
      return undefined;
    };

    // candidate paths where Retell might put data
    const name = getField([
      "analysis.custom_analysis.name",
      "analysis.name",
      "analysis.custom.name",
      "analysis.data.name",
      "data.analysis.custom_analysis.name",
      "call.analysis.custom_analysis.name",
      "arguments.name",                // function_call
      "args.name",
      "payload.analysis.custom_analysis.name"
    ]) || "Not Provided";

    const phone = getField([
      "analysis.custom_analysis.phone",
      "analysis.phone",
      "analysis.custom.phone",
      "analysis.data.phone",
      "data.analysis.custom_analysis.phone",
      "call.analysis.custom_analysis.phone",
      "arguments.phone",
      "args.phone",
      "payload.analysis.custom_analysis.phone"
    ]) || "Not Provided";

    const location = getField([
      "analysis.custom_analysis.location",
      "analysis.location",
      "analysis.custom.location",
      "analysis.data.location",
      "data.analysis.custom_analysis.location",
      "call.analysis.custom_analysis.location",
      "arguments.location",
      "args.location",
      "payload.analysis.custom_analysis.location"
    ]) || "Not Provided";

    const requirement = getField([
      "analysis.custom_analysis.requirement",
      "analysis.requirement",
      "analysis.custom.requirement",
      "analysis.data.requirement",
      "data.analysis.custom_analysis.requirement",
      "call.analysis.custom_analysis.requirement",
      "arguments.requirement",
      "args.requirement",
      "payload.analysis.custom_analysis.requirement"
    ]) || "Not Provided";

    console.log("Extracted:", { name, phone, location, requirement });

    // Only send an email when event indicates analysis or function was called.
    // Some providers send call_started/call_ended only; but we still allow sending if values exist.
    const event = payload.event || payload.type || payload.name || "";

    const shouldSend =
      event === "call_analyzed" ||
      event === "function_call" ||
      event === "call:analyzed" ||
      // or if we actually have at least one real field extracted (avoid false sends)
      [name, phone, location, requirement].some(v => v !== "Not Provided");

    if (shouldSend) {
      // call your email endpoint (existing email handler)
      await fetch("https://aegis-webhook.vercel.app/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: process.env.NOTIFICATION_EMAIL || "bd2.aegis@gmail.com",
          subject: "New Inquiry from Voice Agent",
          html: `
            <h2>New Call Received</h2>
            <p><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
            <p><strong>Location:</strong> ${escapeHtml(location)}</p>
            <p><strong>Requirement:</strong> ${escapeHtml(requirement)}</p>
          `
        })
      });
      console.log("Email send request made");
    } else {
      console.log("Not sending email: no event or no fields");
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// small escaping helper
function escapeHtml(s) {
  if (!s) return "";
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
