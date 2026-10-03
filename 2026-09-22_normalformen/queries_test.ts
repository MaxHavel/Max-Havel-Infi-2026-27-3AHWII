import { assertEquals } from "@std/assert";
import { prisma } from "./db.ts";
import { kuenstlerMitUndOhneLabel, songsProPlaylist, topKuenstler } from "./queries.ts";

Deno.test("Top-Künstler: Nova hat 3 Tracks und liegt vorne", async () => {
  const top = await topKuenstler();
  assertEquals(top[0].name, "Nova");
  assertEquals(top[0].tracks, 3);
  await prisma.$disconnect();
});

Deno.test("COUNT(*) = 4, mit Label = 3 (NULL zählt nicht)", async () => {
  const { alle, mitLabel } = await kuenstlerMitUndOhneLabel();
  assertEquals(alle, 4);
  assertEquals(mitLabel, 3);
  await prisma.$disconnect();
});

Deno.test("Songs pro Playlist: Focus=3, Workout=2", async () => {
  const rows = await songsProPlaylist();
  assertEquals(rows, [
    { name: "Focus", anzahl: 3 },
    { name: "Workout", anzahl: 2 },
  ]);
  await prisma.$disconnect();
});
