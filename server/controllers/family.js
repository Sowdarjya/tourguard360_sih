import pool from "../db/db.js";

export const addFamilyMember = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, email, fcm_token } = req.body;

    const { rows } = await pool.query(
      "SELECT COUNT(*)::int as c FROM family_members WHERE user_id=$1",
      [userId]
    );
    if (rows[0].c >= 5) {
      return res.status(400).json({ error: "Max 5 family members allowed" });
    }

    const result = await pool.query(
      `INSERT INTO family_members (user_id, name, phone, email, fcm_token)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, name, phone, email, fcm_token]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("addFamilyMember error:", err);
    res.status(500).json({ error: "Failed to add family member" });
  }
};

export const getFamilyMembers = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      "SELECT * FROM family_members WHERE user_id=$1",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("getFamilyMembers error:", err);
    res.status(500).json({ error: "Failed to fetch family members" });
  }
};

export const removeFamilyMember = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await pool.query("DELETE FROM family_members WHERE id=$1 AND user_id=$2", [
      id,
      userId,
    ]);
    res.json({ message: "Family member removed" });
  } catch (err) {
    console.error("removeFamilyMember error:", err);
    res.status(500).json({ error: "Failed to remove family member" });
  }
};
