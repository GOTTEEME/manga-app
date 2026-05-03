export default async function handler(req, res) {
  const segments = Array.isArray(req.query.path)
    ? req.query.path
    : [req.query.path].filter(Boolean);

  const qs = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  const url = `https://api.mangadex.org/${segments.join("/")}${qs}`;

  try {
    const upstream = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const contentType = upstream.headers.get("content-type") || "application/json";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=300");

    const buf = Buffer.from(await upstream.arrayBuffer());
    res.status(upstream.status).end(buf);
  } catch {
    res.status(502).json({ error: "API proxy error" });
  }
}
