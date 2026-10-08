// demo.ts — KM5-02 Normalisierung-Demo (4 Konsolenzeilen, lesend, idempotent).
// Zeigt, dass die 3NF-Modellierung (Label <- Kuenstler <- Song <-> Playlist) funktioniert.
// Laufen lassen mit: deno task demo
import { prisma } from "./db.ts";
import { kuenstlerMitUndOhneLabel, songsProPlaylist, topKuenstler } from "./queries.ts";

const anzahlSongs = await prisma.song.count();
const anzahlKuenstler = await prisma.kuenstler.count();
const anzahlPlaylists = await prisma.playlist.count();

console.log(`1) Seed-Stand: ${anzahlKuenstler} Kuenstler, ${anzahlSongs} Songs, ${anzahlPlaylists} Playlists.`);
console.log("2) Top-Kuenstler:            ", await topKuenstler());
console.log("3) COUNT(*) vs. mit Label: ", await kuenstlerMitUndOhneLabel());
console.log("4) Songs pro Playlist:     ", await songsProPlaylist());

await prisma.$disconnect();
