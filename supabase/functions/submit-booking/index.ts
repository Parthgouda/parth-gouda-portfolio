import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@6.0.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...cors,
      "Content-Type": "application/json",
    },
  });

const clean = (value: string, max = 5000) =>
  value.trim().replace(/[<>]/g, "").slice(0, max);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const body = await req.json();

    const required = [
      "full_name",
      "email",
      "phone",
      "website_type",
      "project_description",
      "budget",
      "timeline",
      "preferred_contact",
    ];

    for (const key of required) {
      if (
        typeof body[key] !== "string" ||
        !body[key].trim()
      ) {
        return json({ error: `Missing ${key}` }, 400);
      }
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        body.email
      )
    ) {
      return json({ error: "Invalid email" }, 400);
    }

    if (
      body.website_type.length > 100 ||
      body.full_name.length > 120 ||
      body.email.length > 254
    ) {
      return json({ error: "Invalid input" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const resendFromEmail = Deno.env.get("RESEND_FROM_EMAIL");

    if (
      !supabaseUrl ||
      !serviceRoleKey ||
      !resendApiKey ||
      !resendFromEmail
    ) {
      console.error("Required environment variables are missing.");
      return json(
        { error: "Server configuration error." },
        500
      );
    }

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey
    );

    const resend = new Resend(resendApiKey);

    const year = new Date().getUTCFullYear();

    const { data: last, error: lastError } = await supabase
      .from("bookings")
      .select("request_id")
      .like("request_id", `PG-${year}-%`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastError) {
      throw lastError;
    }

    const n = last?.request_id
      ? parseInt(
          last.request_id.split("-").pop() || "0",
          10
        ) + 1
      : 1;

    const request_id = `PG-${year}-${String(n).padStart(
      4,
      "0"
    )}`;

    const row = {
      request_id,
      full_name: clean(body.full_name, 120),
      email: clean(body.email, 254),
      phone: clean(body.phone, 40),
      website_type: clean(body.website_type, 100),
      company_name: clean(body.company_name || "", 160),
      project_description: clean(
        body.project_description
      ),
      required_features: clean(
        body.required_features || ""
      ),
      reference_website: clean(
        body.reference_website || "",
        500
      ),
      budget: clean(body.budget, 80),
      timeline: clean(body.timeline, 80),
      preferred_contact: clean(
        body.preferred_contact,
        40
      ),
      additional_message: clean(
        body.additional_message || ""
      ),
      status: "NEW",
    };

    const { error: insertError } = await supabase
      .from("bookings")
      .insert(row);

    if (insertError) {
      throw insertError;
    }

    const adminHtml = `
      <h2>New Website Project Request</h2>

      <p><b>Request ID:</b> ${request_id}</p>
      <p><b>Client:</b> ${row.full_name}</p>
      <p><b>Email:</b> ${row.email}</p>
      <p><b>Phone:</b> ${row.phone}</p>
      <p><b>Website:</b> ${row.website_type}</p>
      <p><b>Company:</b> ${
        row.company_name || "Not provided"
      }</p>
      <p><b>Budget:</b> ${row.budget}</p>
      <p><b>Timeline:</b> ${row.timeline}</p>
      <p><b>Preferred contact:</b> ${
        row.preferred_contact
      }</p>

      <hr />

      <p>
        <b>Description:</b><br />
        ${row.project_description}
      </p>

      <p>
        <b>Required features:</b><br />
        ${row.required_features || "Not provided"}
      </p>

      <p>
        <b>Reference:</b>
        ${row.reference_website || "Not provided"}
      </p>

      <p>
        <b>Additional message:</b><br />
        ${row.additional_message || "Not provided"}
      </p>
    `;

    // Notification to Parth
    const { error: adminEmailError } =
      await resend.emails.send({
        from: resendFromEmail,
        to: ["goudaparth07@gmail.com"],
        subject: `New Website Project Request - ${request_id}`,
        html: adminHtml,
      });

    if (adminEmailError) {
      console.error(
        "Admin email failed:",
        adminEmailError
      );
    }

    // Confirmation email to client
    const { error: clientEmailError } =
      await resend.emails.send({
        from: resendFromEmail,
        to: [row.email],
        subject: `Project request received - ${request_id}`,
        html: `
          <h2>Request Received</h2>

          <p>
            Thanks for reaching out.
            Your project request has been received successfully.
          </p>

          <p>
            <b>Request ID:</b> ${request_id}
          </p>

          <p>
            We'll review the information and use your
            preferred contact method for next steps.
          </p>

          <p>
            This message does not mean the project has been accepted.
          </p>
        `,
      });

    if (clientEmailError) {
      console.error(
        "Client confirmation email failed:",
        clientEmailError
      );
    }

    return json({
      success: true,
      request_id,
    });
  } catch (error) {
    console.error("Submit booking error:", error);

    return json(
      {
        error:
          "Unable to submit request. Please try again.",
      },
      500
    );
  }
});