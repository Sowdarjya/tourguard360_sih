import pool from "../db/db.js";
import twilio from "twilio";

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

export async function triggerSOS(req, res) {
  try {
    const userId = req.user.id;
    const { latitude, longitude } = req.body;

    const userRes = await pool.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [userId]
    );
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = userRes.rows[0];

    const famRes = await pool.query(
      "SELECT id, name, phone FROM family_members WHERE user_id = $1",
      [userId]
    );

    if (famRes.rows.length === 0) {
      return res
        .status(400)
        .json({ error: "No family members added to notify" });
    }

    for (const fam of famRes.rows) {
      try {
        await client.messages.create({
          body: `🚨 SOS ALERT 🚨\nUser: ${user.name} (${user.email})\nLocation: https://maps.google.com/?q=${latitude},${longitude}`,
          from: process.env.TWILIO_PHONE,
          to: fam.phone,
        });
      } catch (smsErr) {
        console.error(`❌ Failed to send SMS to ${fam.phone}:`, smsErr.message);
      }
    }

    res.json({ success: true, notified: famRes.rows.length });
  } catch (err) {
    console.error("triggerSOS error:", err);
    res.status(500).json({ error: "Failed to send SOS alert" });
  }
}
