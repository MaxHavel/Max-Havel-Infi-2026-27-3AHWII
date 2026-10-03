import { prisma } from "./db.ts";
import { songsProPlaylist, topKuenstler } from "./queries.ts";

export function handler(req: Request): Response {
  const url = new URL(req.url);

  if (url.pathname === "/api") {
    return Response.json({
      message: "Hello, world!",
      time: new Date().toISOString(),
    });
  }

  return new Response("<h1>Welcome to Deno!</h1>", {
    headers: { "content-type": "text/html" },
  });
}

if (import.meta.main) {
  Deno.serve(async (req) => {
    const url = new URL(req.url);
    // DB-Routen (Normalformen-Demo); der synchrone handler() oben bleibt für Tests.
    if (url.pathname === "/api/top") {
      return Response.json(await topKuenstler());
    }
    if (url.pathname === "/api/playlists") {
      return Response.json(await songsProPlaylist());
    }
    if (url.pathname === "/api/kuenstler") {
      const kuenstler = await prisma.kuenstler.findMany({
        include: { label: true, _count: { select: { songs: true } } },
        orderBy: { name: "asc" },
      });
      return Response.json(kuenstler);
    }
    return handler(req);
  });
}
