// Supabase Edge Function — notifies hospital staff by email whenever a
// patient books a new appointment. Fires immediately at booking time,
// separately from send-confirmation (which only fires once staff confirm
// the appointment + payment in the admin dashboard).
//
// Deploy with the Supabase CLI:
//   supabase functions deploy notify-new-booking
//   supabase secrets set RESEND_API_KEY=re_your_key_here
//   supabase secrets set ADMIN_NOTIFICATION_EMAIL=care@brdhospital.com   (optional, this is the default)

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("CONFIRMATION_FROM_EMAIL") ?? "BRD Hospital <onboarding@resend.dev>";
const ADMIN_EMAIL = Deno.env.get("ADMIN_NOTIFICATION_EMAIL") ?? "care@brdhospital.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NewBookingPayload {
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  doctorName: string;
  serviceName: string;
  date: string;
  time: string;
  reason?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: "RESEND_API_KEY is not configured" }), {
      status: 501,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const payload = (await req.json()) as NewBookingPayload;

    const html = `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; color: #2b2320;">
        <h1 style="color: #45262e; font-size: 22px;">New Appointment Booked</h1>
        <p>A new appointment was just booked on the website. Details:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 6px 0; color: #6b7280;">Patient</td><td style="padding: 6px 0; text-align: right; font-weight: bold;">${escapeHtml(payload.patientName)}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Phone</td><td style="padding: 6px 0; text-align: right; font-weight: bold;">${escapeHtml(payload.patientPhone)}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Email</td><td style="padding: 6px 0; text-align: right; font-weight: bold;">${escapeHtml(payload.patientEmail)}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Service</td><td style="padding: 6px 0; text-align: right; font-weight: bold;">${escapeHtml(payload.serviceName)}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Doctor</td><td style="padding: 6px 0; text-align: right; font-weight: bold;">${escapeHtml(payload.doctorName)}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Date</td><td style="padding: 6px 0; text-align: right; font-weight: bold;">${escapeHtml(payload.date)}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Time</td><td style="padding: 6px 0; text-align: right; font-weight: bold;">${escapeHtml(payload.time)}</td></tr>
          ${payload.reason ? `<tr><td style="padding: 6px 0; color: #6b7280;">Reason</td><td style="padding: 6px 0; text-align: right; font-weight: bold;">${escapeHtml(payload.reason)}</td></tr>` : ""}
        </table>
        <p>Confirm the appointment and payment in the admin dashboard once verified — the patient will get their confirmation email automatically at that point.</p>
        <p style="margin-top: 24px; color: #9c4d61;">— BRD Hospital booking system</p>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `New appointment: ${payload.patientName} — ${payload.date} ${payload.time}`,
        html,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return new Response(JSON.stringify({ error: "Resend request failed", detail }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
