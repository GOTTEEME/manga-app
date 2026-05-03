export default async function handler(req, res) {
  const segments = Array.isArray(req.query.path)
    ? req.query.path
    : [req.query.path].filter(Boolean);

  const url = `https://uploads.mangadex.org/data/${segments.join("/")}`;

  try {
    const upstream = await fetch(url, {
      headers: {
        Referer: "https://mangadex.org/",
        "User-Agent": "Mozilla/5.0 (compatible; MangaReader/1.0)",
      },
    });

    if (!upstream.ok) return res.status(upstream.status).end();

    const buf = Buffer.from(await upstream.arrayBuffer());
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.end(buf);
  } catch {
    res.status(502).end();
  }
}
