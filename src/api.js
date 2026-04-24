export async function handleAPI(request, env, json) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // ADMIN AUTH
  function isAdmin() {
    return (request.headers.get("x-admin-token") || "") === env.ADMIN_TOKEN;
  }

  // ============================================
  // 1) Get events (PUBLIC)
  // ============================================
  if (request.method === "GET" && pathname === "/api/events") {
    const res = await env.DB
      .prepare("SELECT id, title, description FROM events WHERE is_active = 1")
      .all();
    return json({ success: true, events: res.results || [] });
  }

  // ============================================
  // 2) Get form/questions by event
  // ============================================
  if (request.method === "GET" && pathname === "/api/form") {
    const id = url.searchParams.get("id");
    if (!id) return json({ success: false, error: "missing id" }, 400);

    const ev = await env.DB
      .prepare("SELECT * FROM events WHERE id = ?")
      .bind(id)
      .first();

    if (!ev) return json({ success: false, error: "event not found" }, 404);

    const qres = await env.DB
      .prepare("SELECT * FROM questions WHERE event_id = ? ORDER BY order_no ASC")
      .bind(id)
      .all();

    return json({
      success: true,
      event: ev,
      questions: qres.results || []
    });
  }

  // ============================================
  // 3) Submit form response
  // ============================================
  if (request.method === "POST" && pathname === "/api/submit") {
    const body = await request.json();
    const { event_id, answers } = body;

    console.log("SUBMIT RECEIVED - event_id:", event_id, "answers:", answers);

    if (!event_id || !Array.isArray(answers))
      return json({ success: false, error: "invalid payload" }, 400);

    try {
      const responseRow = await env.DB
        .prepare("INSERT INTO responses (event_id) VALUES (?)")
        .bind(event_id)
        .run();

      console.log("INSERT RESPONSE - result:", JSON.stringify(responseRow));

      const responseId = responseRow.meta.last_row_id;
      console.log("responseId from meta.last_row_id:", responseId);

      if (!responseId) {
        return json({ 
          success: false, 
          error: `Failed to get response ID. responseRow: ${JSON.stringify(responseRow)}` 
        }, 500);
      }

      const stmt = env.DB.prepare(
        "INSERT INTO answers (response_id, question_id, answer_text) VALUES (?, ?, ?)"
      );

      for (const a of answers) {
        console.log("Inserting answer:", { responseId, question_id: a.question_id, answer_text: a.answer_text });
        
        if (!a.question_id) {
          return json({ 
            success: false, 
            error: `Invalid question_id: ${a.question_id}. Answer object: ${JSON.stringify(a)}` 
          }, 400);
        }
        await stmt.bind(responseId, a.question_id, a.answer_text || "").run();
      }

      return json({ success: true });
    } catch (error) {
      console.error("ERROR in /api/submit:", error);
      return json({ 
        success: false, 
        error: `Server error: ${error.message}` 
      }, 500);
    }
  }

  // ======================================================
  //                ADMIN ROUTES START
  // ======================================================
  if (!isAdmin()) {
    return json({ success: false, error: "Unauthorized" }, 401);
  }

  // ============================================
  // 4) ADMIN: Create event
  // ============================================
  if (request.method === "POST" && pathname === "/api/admin/create-event") {
    const { id, title, description } = await request.json();

    await env.DB
      .prepare("INSERT INTO events (id, title, description) VALUES (?, ?, ?)")
      .bind(id, title, description)
      .run();

    return json({ success: true });
  }

  // ============================================
  // 5) ADMIN: Add question
  // ============================================
  if (request.method === "POST" && pathname === "/api/admin/add-question") {
    const { event_id, question_text, type, required, options, order_no } =
      await request.json();

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
        order_no
      )
      .run();

    return json({ success: true });
  }

  // ============================================
  // 6) ADMIN: Get responses
  // ============================================
  if (pathname === "/api/admin/responses" && request.method === "GET") {
    const event_id = url.searchParams.get("id");
    if (!event_id) return json({ success: false, error: "missing id" });

    const res = await env.DB
      .prepare(`SELECT * FROM responses WHERE event_id=? ORDER BY id DESC`)
      .bind(event_id)
      .all();

    return json({ success: true, responses: res.results || [] });
  }

  return json({ error: "API not found" }, 404);
}
