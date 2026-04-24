// ================ JWT UTILITIES ================
// Generate HMAC-SHA256 signature for JWT
async function generateSignature(message, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

// Create JWT token
async function createJWT(payload, secret) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  const signature = await generateSignature(`${header}.${body}`, secret);
  return `${header}.${body}.${signature}`;
}

// Verify JWT token
async function verifyJWT(token, secret) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const header = parts[0];
    const body = parts[1];
    const signature = parts[2];

    // Verify signature
    const expectedSignature = await generateSignature(`${header}.${body}`, secret);
    if (signature !== expectedSignature) return null;

    // Decode and verify payload
    const payload = JSON.parse(
      atob(body.replace(/-/g, "+").replace(/_/g, "/"))
    );

    // Check expiration
    if (payload.exp && Date.now() > payload.exp * 1000) {
      return null; // Token expired
    }

    return payload;
  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
}

// Extract Bearer token from Authorization header
function getBearerToken(request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    const json = (data, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" },
      });

    // Super secure admin verification using JWT
    const isAdmin = async (request) => {
      const token = getBearerToken(request);
      if (!token) return false;
      
      const payload = await verifyJWT(token, env.JWT_SECRET || "default-test-secret");
      return payload && payload.admin === true;
    };

    try {
      /* ================= ADMIN REDIRECT ================= */
      // Redirect /admin paths to login (which then redirects to portal if token exists)
      if (pathname === "/admin" || pathname === "/admin.html") {
        return new Response(null, {
          status: 302,
          headers: { "Location": "/admin-login.html" },
        });
      }

      /* ================= API ROUTES ================= */
      if (pathname.startsWith("/api/")) {


        // List all active events
        if (pathname === "/api/events" && request.method === "GET") {
          const res = await env.DB
            .prepare(
              "SELECT id, title, description FROM events WHERE is_active = 1 ORDER BY created_at DESC"
            )
            .all();

          return json({ success: true, events: res.results || [] });
        }

        // Get event + questions from database
        if (pathname === "/api/form" && request.method === "GET") {
          const eventId = url.searchParams.get("id");
          if (!eventId) return json({ success: false, error: "missing id" }, 400);

          const ev = await env.DB
            .prepare("SELECT id, title, description FROM events WHERE id = ?")
            .bind(eventId)
            .first();

          if (!ev) return json({ success: false, error: "event not found" }, 404);

          // Get questions from database for this event
          const qres = await env.DB
            .prepare("SELECT * FROM questions WHERE event_id = ? ORDER BY order_no ASC")
            .bind(eventId)
            .all();

          return json({
            success: true,
            event: ev,
            questions: qres.results || [],
          });
        }

        // Submit registration
        if (pathname === "/api/submit" && request.method === "POST") {
          try {
            const { event_id, answers } = await request.json();

            if (!event_id || !Array.isArray(answers)) {
              return json({ success: false, error: "invalid payload" }, 400);
            }

            const r = await env.DB
              .prepare("INSERT INTO responses (event_id) VALUES (?)")
              .bind(event_id)
              .run();

            const responseId = r.meta.last_row_id;

            const stmt = env.DB.prepare(
              "INSERT INTO answers (response_id, question_id, answer_text) VALUES (?, ?, ?)"
            );

            for (const a of answers) {
              await stmt
                .bind(responseId, a.question_id, a.answer_text || "")
                .run();
            }

            return json({ success: true, response_id: responseId });
          } catch (error) {
            console.error("Submit error:", error);
            return json({ success: false, error: error.message || "Submission failed" }, 500);
          }
        }

        // Submit feedback
        if (pathname === "/api/feedback" && request.method === "POST") {
          try {
            const body = await request.json();
            console.log("Feedback submission received:", body);

            const { name, email, rating, feedback_text, feedback_type } = body;

            if (!name || !email || !feedback_text) {
              console.log("Validation failed - missing fields");
              return json({ success: false, error: "name, email, and feedback_text are required" }, 400);
            }

            console.log("Inserting feedback into database...");
            const r = await env.DB
              .prepare(
                "INSERT INTO feedbacks (name, email, rating, feedback_text, feedback_type) VALUES (?, ?, ?, ?, ?)"
              )
              .bind(name, email, rating || null, feedback_text, feedback_type || "general")
              .run();

            console.log("Feedback inserted successfully:", r);
            return json({ success: true, feedback_id: r.meta.last_row_id });
          } catch (error) {
            console.error("Feedback submission error:", error);
            return json({ success: false, error: error.message || "Feedback submission failed" }, 500);
          }
        }

        /* ---------- ADMIN ---------- */
        if (pathname.startsWith("/api/admin/")) {
          // Login endpoint - MUST come before auth check
          if (pathname === "/api/admin/login" && request.method === "POST") {
            try {
              const { username, password } = await request.json();

              // Get credentials from environment variables
              const ADMIN_USERNAME = env.ADMIN_USERNAME || "admin";
              const ADMIN_PASSWORD = env.ADMIN_PASSWORD || "password";

              if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
                return json({ success: false, error: "Invalid credentials" }, 401);
              }

              // Create JWT token (expires in 24 hours)
              const now = Math.floor(Date.now() / 1000);
              const token = await createJWT(
                {
                  admin: true,
                  username: username,
                  iat: now,
                  exp: now + (24 * 60 * 60), // 24 hours
                },
                env.JWT_SECRET || "default-test-secret"
              );

              return json({ success: true, token, message: "Login successful" });
            } catch (error) {
              console.error("Login error:", error);
              return json({ success: false, error: error.message || "Login failed" }, 500);
            }
          }

          // All other admin endpoints require authentication
          if (!await isAdmin(request)) {
            return json({ success: false, error: "Unauthorized - Please login" }, 401);
          }

          // Create event
          if (pathname === "/api/admin/create-event" && request.method === "POST") {
            const { id, title, description } = await request.json();

            if (!id || !title) {
              return json({ success: false, error: "missing fields" }, 400);
            }

            await env.DB
              .prepare(
                "INSERT INTO events (id, title, description, is_active) VALUES (?, ?, ?, 1)"
              )
              .bind(id, title, description || "")
              .run();

            return json({ success: true });
          }

          // List all events (admin)
          if (pathname === "/api/admin/events" && request.method === "GET") {
            const res = await env.DB
              .prepare("SELECT * FROM events ORDER BY created_at DESC")
              .all();

            return json({ success: true, events: res.results || [] });
          }

          // Delete event
          if (pathname === "/api/admin/delete-event" && request.method === "POST") {
            const { id } = await request.json();
            if (!id) {
              return json({ success: false, error: "missing event id" }, 400);
            }

            await env.DB
              .prepare("DELETE FROM events WHERE id = ?")
              .bind(id)
              .run();

            return json({ success: true });
          }

          // Update event
          if (pathname === "/api/admin/update-event" && request.method === "POST") {
            const { id, title, description, is_active } = await request.json();
            if (!id || !title) {
              return json({ success: false, error: "missing required fields" }, 400);
            }

            await env.DB
              .prepare("UPDATE events SET title = ?, description = ?, is_active = ? WHERE id = ?")
              .bind(title, description || "", is_active ? 1 : 0, id)
              .run();

            return json({ success: true });
          }

          // Delete question
          if (pathname === "/api/admin/delete-question" && request.method === "POST") {
            const { id } = await request.json();
            if (!id) {
              return json({ success: false, error: "missing question id" }, 400);
            }

            await env.DB
              .prepare("DELETE FROM questions WHERE id = ?")
              .bind(id)
              .run();

            return json({ success: true });
          }

          // Add question to event
          if (pathname === "/api/admin/add-question" && request.method === "POST") {
            const { event_id, question_text, type, required, options, order_no } = await request.json();

            if (!event_id || !question_text || !type) {
              return json({ success: false, error: "missing required fields" }, 400);
            }

            await env.DB
              .prepare(
                "INSERT INTO questions (event_id, question_text, type, required, options, order_no) VALUES (?, ?, ?, ?, ?, ?)"
              )
              .bind(
                event_id,
                question_text,
                type,
                required ? 1 : 0,
                options ? JSON.stringify(options) : null,
                order_no || 0
              )
              .run();

            return json({ success: true });
          }

          // Get event details with questions and all responses
          if (pathname === "/api/admin/event-detail" && request.method === "GET") {
            const event_id = url.searchParams.get("id");
            console.log("EVENT-DETAIL REQUEST for:", event_id);
            
            if (!event_id) {
              return json({ success: false, error: "missing event id" }, 400);
            }

            // Get event details
            const eventRes = await env.DB
              .prepare("SELECT * FROM events WHERE id = ?")
              .bind(event_id)
              .first();

            console.log("Event found:", eventRes);

            if (!eventRes) {
              return json({ success: false, error: "event not found" }, 404);
            }

            // Get all questions for this event
            const questionsRes = await env.DB
              .prepare("SELECT * FROM questions WHERE event_id = ? ORDER BY order_no ASC")
              .bind(event_id)
              .all();

            const questions = questionsRes.results || [];
            console.log("Questions found:", questions.length);

            // Get all responses for this event
            const responsesRes = await env.DB
              .prepare("SELECT * FROM responses WHERE event_id = ? ORDER BY id DESC")
              .bind(event_id)
              .all();

            const responses = responsesRes.results || [];
            console.log("Responses found:", responses.length);

            // For each response, get all its answers with question text
            const responsesWithAnswers = await Promise.all(
              responses.map(async (response) => {
                const answersRes = await env.DB
                  .prepare(
                    `SELECT a.*, q.question_text, q.type 
                     FROM answers a 
                     JOIN questions q ON a.question_id = q.id 
                     WHERE a.response_id = ? 
                     ORDER BY q.order_no ASC`
                  )
                  .bind(response.id)
                  .all();

                return {
                  response_id: response.id,
                  submitted_at: response.submitted_at,
                  answers: answersRes.results || []
                };
              })
            );

            const result = {
              success: true,
              event: eventRes,
              questions: questions,
              responses: responsesWithAnswers
            };
            
            console.log("Returning:", JSON.stringify(result, null, 2));
            return json(result);
          }

          // Get all feedbacks
          if (pathname === "/api/admin/feedbacks" && request.method === "GET") {
            const res = await env.DB
              .prepare("SELECT * FROM feedbacks ORDER BY submitted_at DESC")
              .all();

            return json({ success: true, feedbacks: res.results || [] });
          }

          // Export event data as CSV
          if (pathname === "/api/admin/export-csv" && request.method === "GET") {
            const event_id = url.searchParams.get("id");
            
            if (!event_id) {
              return json({ success: false, error: "missing event id" }, 400);
            }

            // Get event details
            const eventRes = await env.DB
              .prepare("SELECT * FROM events WHERE id = ?")
              .bind(event_id)
              .first();

            if (!eventRes) {
              return json({ success: false, error: "event not found" }, 404);
            }

            // Get all questions
            const questionsRes = await env.DB
              .prepare("SELECT * FROM questions WHERE event_id = ? ORDER BY order_no ASC")
              .bind(event_id)
              .all();

            const questions = questionsRes.results || [];

            // Get all responses
            const responsesRes = await env.DB
              .prepare("SELECT * FROM responses WHERE event_id = ? ORDER BY id DESC")
              .bind(event_id)
              .all();

            const responses = responsesRes.results || [];

            // Get all answers
            const answersRes = await env.DB
              .prepare(`
                SELECT a.*, q.question_text, q.order_no
                FROM answers a
                JOIN questions q ON a.question_id = q.id
                WHERE q.event_id = ?
                ORDER BY a.response_id, q.order_no
              `)
              .bind(event_id)
              .all();

            const answers = answersRes.results || [];

            // Build CSV
            let csv = "Submission #,Timestamp," + questions.map(q => `"${q.question_text.replace(/"/g, '""')}"`).join(",") + "\n";

            responses.forEach((response, idx) => {
              const timestamp = new Date(response.submitted_at).toLocaleString();
              const submissionNum = responses.length - idx;
              
              const answerMap = {};
              answers
                .filter(a => a.response_id === response.id)
                .forEach(a => {
                  answerMap[a.question_id] = a.answer_text;
                });

              const row = [submissionNum, `"${timestamp}"`];
              questions.forEach(q => {
                const answer = answerMap[q.id] || "";
                row.push(`"${answer.replace(/"/g, '""')}"`);
              });

              csv += row.join(",") + "\n";
            });

            return new Response(csv, {
              status: 200,
              headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="${event_id}-responses.csv"`
              }
            });
          }

          return json({ success: false, error: "admin api not found" }, 404);
        }

        return json({ success: false, error: "api not found" }, 404);
      }

      /* ================= STATIC FILES ================= */
      // Serve static files from public directory via ASSETS binding
      if (env.ASSETS) {
        try {
          const assetResponse = await env.ASSETS.fetch(request);
          // Return asset response (whether 200, 404, etc)
          return assetResponse;
        } catch (error) {
          console.log("Error fetching asset:", error.message);
        }
      }

      // Default: return 404
      return new Response(
        JSON.stringify({ success: false, error: "File not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );

    } catch (err) {
      console.error("Error:", err);
      return json({ success: false, error: err.message || String(err) }, 500);
    }
  },
};

