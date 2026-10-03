// Queries zur Musik-DB (Normalformen-Demo, analog zu KM5-01 praxis/src/queries.js).
import { prisma } from "./db.ts";

// 1. Top-Künstler nach Track-Anzahl (GROUP BY + ORDER + LIMIT).
export async function topKuenstler(limit = 5) {
  const gruppen = await prisma.song.groupBy({
    by: ["kuenstlerId"],
    _count: { _all: true },
    orderBy: { _count: { kuenstlerId: "desc" } },
    take: limit,
  });
  const namen = await prisma.kuenstler.findMany({
    where: { id: { in: gruppen.map((g) => g.kuenstlerId) } },
    select: { id: true, name: true },
  });
  const byId = new Map(namen.map((k) => [k.id, k.name]));
  return gruppen.map((g) => ({ name: byId.get(g.kuenstlerId), tracks: g._count._all }));
}

// 4. COUNT(*) vs. COUNT(labelId): NULL zählt nicht mit.
export async function kuenstlerMitUndOhneLabel() {
  const alle = await prisma.kuenstler.count();
  const mitLabel = await prisma.kuenstler.count({ where: { labelId: { not: null } } });
  return { alle, mitLabel };
}

// Aufgabe 3 (Erweiterung): pro Playlist die Song-Anzahl (N:M Song <-> Playlist).
export async function songsProPlaylist() {
  const playlists = await prisma.playlist.findMany({
    include: { _count: { select: { songs: true } } },
    orderBy: { name: "asc" },
  });
  return playlists.map((p) => ({ name: p.name, anzahl: p._count.songs }));
}

if (import.meta.main) {
  console.log("1) Top-Künstler:            ", await topKuenstler());
  console.log("4) COUNT(*) vs. mit Label: ", await kuenstlerMitUndOhneLabel());
  console.log("P) Songs pro Playlist:     ", await songsProPlaylist());
  await prisma.$disconnect();
}
