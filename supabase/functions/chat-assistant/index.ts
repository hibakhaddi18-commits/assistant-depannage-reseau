const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SYSTEM_PROMPT = `Tu es un assistant de dépannage réseau pour particuliers et petites entreprises. Tu réponds en français simple et clair. Tu poses des questions une par une pour diagnostiquer le problème, tu proposes des vérifications concrètes avec les commandes Windows CMD exactes quand c'est utile (ipconfig, ping, nslookup, ipconfig /flushdns...), et tu expliques chaque étape simplement. Tu restes uniquement sur les sujets réseau et informatique de base ; si la question sort de ce cadre, tu le dis poliment.`;

const PARCOURS = [
  "Pas d'Internet",
  "Pas d'adresse IP (DHCP)",
  "Wi-Fi qui ne se connecte pas ou se déconnecte",
  "Connecté, pas d'Internet (réseau non identifié)",
  "Conflit d'adresse IP",
  "Aucun réseau détecté (câble ou carte)",
  "Panne totale (plus aucun poste n'a de réseau)",
  "Les sites ne s'ouvrent pas par leur nom (DNS)",
  "Le poste ne voit pas les autres ordinateurs",
  "Dossier partagé inaccessible",
  "Ressources du domaine inaccessibles mais Internet OK",
  "Connexion au domaine impossible",
  "VPN qui ne se connecte pas",
  "Un seul site ou service inaccessible",
  "Réseau très lent",
  "Imprimante réseau inaccessible",
  "Visioconférence qui coupe (Teams/Zoom)",
  "Heure du poste fausse, connexion refusée",
];

type IncomingMessage = { role: "user" | "assistant"; content: string };

function isValidMessages(value: unknown): value is IncomingMessage[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= 30 &&
    value.every(
      (m) =>
        m &&
        typeof m === "object" &&
        ((m as { role?: string }).role === "user" ||
          (m as { role?: string }).role === "assistant") &&
        typeof (m as { content?: string }).content === "string" &&
        (m as { content?: string }).content!.length > 0 &&
        (m as { content?: string }).content!.length <= 4000,
    )
  );
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Méthode non autorisée" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => null);
    if (!isValidMessages(body?.messages)) {
      return new Response(JSON.stringify({ error: "Requête invalide" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const messages: IncomingMessage[] = body.messages;

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Le service IA n'est pas encore configuré." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const model = Deno.env.get("GEMINI_MODEL") ?? "gemini-3.1-flash-lite";
    const fallbackModels = [model, "gemini-flash-latest", "gemini-3.8-flash"].filter(
      (m, i, arr) => m && arr.indexOf(m) === i,
    );

    const systemInstruction = {
      parts: [
        {
          text:
            SYSTEM_PROMPT +
            "\n\nL'application propose aussi des parcours de diagnostic guidés pas à pas sur ces symptômes exacts : " +
            PARCOURS.join(" ; ") +
            '. Quand le problème décrit correspond clairement à l\'un d\'eux, suggère en fin de réponse de lancer ce parcours, en une seule phrase courte du type : "Ce problème ressemble à notre parcours « <nom exact du parcours> », vous pouvez le lancer depuis l\'écran d\'accueil."',
        },
      ],
    };

    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const payload = JSON.stringify({
      systemInstruction,
      contents,
      generationConfig: { temperature: 0.4, maxOutputTokens: 800 },
    });

    let upstream: Response | null = null;
    let lastStatus = 0;
    for (const m of fallbackModels) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`,
        {
          method: "POST",
          headers: {
            "x-goog-api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: payload,
        },
      );
      if (res.ok) {
        upstream = res;
        break;
      }
      lastStatus = res.status;
      // 503 = modèle momentanément surchargé : on tente le modèle suivant.
      if (res.status !== 503) break;
    }

    if (!upstream) {
      console.error("Gemini upstream error", lastStatus);
      return new Response(
        JSON.stringify({ error: "Le service IA a rencontré un problème. Réessayez." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await upstream.json();
    const parts = data?.candidates?.[0]?.content?.parts;
    const reply = Array.isArray(parts)
      ? parts.map((p: { text?: string }) => p.text ?? "").join("").trim()
      : "";
    if (reply.length === 0) {
      return new Response(
        JSON.stringify({ error: "Réponse du service IA inattendue." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("chat-assistant error", err);
    return new Response(
      JSON.stringify({ error: "Une erreur est survenue. Réessayez." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
