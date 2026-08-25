import type { APIRoute } from 'astro';

export const prerender = false;

// GET application by ID from Cloudflare D1
export const GET: APIRoute = async ({ params, locals }) => {
  const { id } = params;
  const env = (locals as any)?.runtime?.env || process.env;
  const db = env.DB;

  if (!db) {
    return new Response(JSON.stringify({ error: 'Cloudflare D1 DB binding not available' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const result = await db.prepare('SELECT * FROM applications WHERE id = ?').bind(id).first();

    if (!result) {
      return new Response(JSON.stringify({ error: 'Application not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch related audit logs
    const auditLogs = await db.prepare('SELECT * FROM audit_logs WHERE application_id = ? ORDER BY created_at DESC').bind(id).all();

    return new Response(
      JSON.stringify({
        success: true,
        application: {
          ...result,
          form_payload: JSON.parse((result.form_payload as string) || '{}'),
          validation_errors: JSON.parse((result.validation_errors as string) || '[]'),
        },
        auditLogs: auditLogs.results || [],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// PUT update or submit application state in Cloudflare D1
export const PUT: APIRoute = async ({ params, request, locals }) => {
  const { id } = params;
  const env = (locals as any)?.runtime?.env || process.env;
  const db = env.DB;

  if (!db) {
    return new Response(JSON.stringify({ error: 'Cloudflare D1 DB binding not available' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const { status, formPayload, signatureName } = body;

    await db
      .prepare(
        `UPDATE applications SET
          status = COALESCE(?, status),
          form_payload = COALESCE(?, form_payload),
          signature_name = COALESCE(?, signature_name),
          signature_timestamp = CASE WHEN ? IS NOT NULL THEN datetime('now') ELSE signature_timestamp END,
          updated_at = datetime('now')
        WHERE id = ?`
      )
      .bind(
        status || null,
        formPayload ? JSON.stringify(formPayload) : null,
        signatureName || null,
        signatureName || null,
        id
      )
      .run();

    // Log the status transition
    await db
      .prepare(
        `INSERT INTO audit_logs (id, application_id, action_type, actor, details)
         VALUES (?, ?, ?, ?, ?)`
      )
      .bind(
        `audit_${Date.now()}`,
        id,
        status === 'submitted' ? 'SUBMITTED' : 'UPDATED',
        signatureName || 'citizen_user',
        JSON.stringify({ newStatus: status, signatureName })
      )
      .run();

    return new Response(JSON.stringify({ success: true, message: 'Application updated in Cloudflare D1' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
