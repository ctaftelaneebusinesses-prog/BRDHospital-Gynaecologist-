// Supabase Edge Function — sends an appointment confirmation email via Resend.
//
// Deploy with the Supabase CLI:
//   supabase functions deploy send-confirmation
//   supabase secrets set RESEND_API_KEY=re_your_key_here
//
// Requires a Resend account (resend.com) and a verified sender domain/email —
// see supabase/functions/send-confirmation/README.md for the full setup.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("CONFIRMATION_FROM_EMAIL") ?? "BRD Hospital <onboarding@resend.dev>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationPayload {
  toEmail: string;
  toName: string;
  doctorName: string;
  serviceName: string;
  date: string;
  time: string;
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
    const payload = (await req.json()) as ConfirmationPayload;

    const html = `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; color: #2b2320;">
        <h1 style="color: #45262e; font-size: 22px;">Appointment Confirmed</h1>
        <p>Hi ${escapeHtml(payload.toName)},</p>
        <p>Your appointment has been successfully scheduled. Here are the details:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 6px 0; color: #6b7280;">Service</td><td style="padding: 6px 0; text-align: right; font-weight: bold;">${escapeHtml(payload.serviceName)}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Doctor</td><td style="padding: 6px 0; text-align: right; font-weight: bold;">${escapeHtml(payload.doctorName)}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Date</td><td style="padding: 6px 0; text-align: right; font-weight: bold;">${escapeHtml(payload.date)}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Time</td><td style="padding: 6px 0; text-align: right; font-weight: bold;">${escapeHtml(payload.time)}</td></tr>
        </table>
        <p>If you need to reschedule or have any questions, please contact us directly.</p>
        <p style="margin-top: 24px; color: #9c4d61;">— BRD Hospital</p>
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
        to: payload.toEmail,
        subject: "Your appointment is confirmed — BRD Hospital",
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
