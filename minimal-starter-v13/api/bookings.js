import { db, email } from "hatchable";

export const access = "public";
export const methods = ["POST"];

export default async function (req, res) {
  const { name, phone, email: customerEmail, service, bookingDate, bookingTime, address, notes } = req.body || {};
  if (!name || !phone || !service || !bookingDate || !bookingTime || !address) {
    return res.status(400).json({ error: "Please fill all required fields." });
  }
  const { rows } = await db.query(
    "INSERT INTO bookings (name, phone, email, service, booking_date, booking_time, address, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id",
    [name, phone, customerEmail || null, service, bookingDate, bookingTime, address, notes || null]
  );
  const id = rows[0].id;
  if (process.env.ADMIN_EMAIL) {
    await email.send({
      to: process.env.ADMIN_EMAIL,
      subject: `New cleaning booking — ${service}`,
      html: `<h2>New booking</h2><p><b>Name:</b> ${name}</p><p><b>Phone:</b> ${phone}</p><p><b>Email:</b> ${customerEmail || "Not provided"}</p><p><b>Service:</b> ${service}</p><p><b>Date:</b> ${bookingDate}</p><p><b>Time:</b> ${bookingTime}</p><p><b>Address:</b> ${address}</p><p><b>Notes:</b> ${notes || "None"}</p><p><b>Booking ID:</b> ${id}</p>`
    });
  }
  res.status(201).json({ success: true, bookingId: id });
}