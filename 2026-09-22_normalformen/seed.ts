// Seed: Mini-Musik-DB befüllen (idempotent: erst leeren, dann neu).
// Daten analog zu KM5-01 praxis/src/seed.js + 2 Playlists (N:M-Demo).
import { prisma } from "./db.ts";

async function main() {
  await prisma.playlist.deleteMany();
  await prisma.song.deleteMany();
  await prisma.kuenstler.deleteMany();
  await prisma.label.deleteMany();

  await prisma.label.createMany({
    data: [{ name: "Ohrwurm Records" }, { name: "Indie Nord" }],
  });
  const ohrwurm = await prisma.label.findUniqueOrThrow({ where: { name: "Ohrwurm Records" } });
  const indie = await prisma.label.findUniqueOrThrow({ where: { name: "Indie Nord" } });

  await prisma.kuenstler.createMany({
    data: [
      { name: "Nova", labelId: ohrwurm.id },
      { name: "Pixel", labelId: ohrwurm.id },
      { name: "Solveig", labelId: indie.id },
      { name: "Ohne Label", labelId: null }, // für COUNT(*)-vs-COUNT(col)-Demo
    ],
  });
  const nova = await prisma.kuenstler.findFirstOrThrow({ where: { name: "Nova" } });
  const pixel = await prisma.kuenstler.findFirstOrThrow({ where: { name: "Pixel" } });
  const solveig = await prisma.kuenstler.findFirstOrThrow({ where: { name: "Solveig" } });
  const ohne = await prisma.kuenstler.findFirstOrThrow({ where: { name: "Ohne Label" } });

  const songs = [
    { titel: "Nordlicht", dauerSek: 245, kuenstlerId: nova.id },
    { titel: "Glut", dauerSek: 210, kuenstlerId: nova.id },
    { titel: "Funkeln", dauerSek: 198, kuenstlerId: nova.id },
    { titel: "Pixelstaub", dauerSek: 305, kuenstlerId: pixel.id },
    { titel: "Raster", dauerSek: 233, kuenstlerId: pixel.id },
    { titel: "Fjord", dauerSek: 260, kuenstlerId: solveig.id },
    { titel: "Kurz", dauerSek: 120, kuenstlerId: ohne.id },
  ];
  for (const s of songs) await prisma.song.create({ data: s });

  const nordlicht = await prisma.song.findFirstOrThrow({ where: { titel: "Nordlicht" } });
  const glut = await prisma.song.findFirstOrThrow({ where: { titel: "Glut" } });
  const pixelstaub = await prisma.song.findFirstOrThrow({ where: { titel: "Pixelstaub" } });
  const fjord = await prisma.song.findFirstOrThrow({ where: { titel: "Fjord" } });

  // N:M: ein Song kann in mehreren Playlists sein, eine Playlist hat mehrere Songs.
  await prisma.playlist.create({
    data: {
      name: "Focus",
      songs: { connect: [{ id: nordlicht.id }, { id: pixelstaub.id }, { id: fjord.id }] },
    },
  });
  await prisma.playlist.create({
    data: {
      name: "Workout",
      songs: { connect: [{ id: glut.id }, { id: pixelstaub.id }] },
    },
  });

  const anzahlSongs = await prisma.song.count();
  const anzahlKuenstler = await prisma.kuenstler.count();
  const anzahlPlaylists = await prisma.playlist.count();
  console.log(`Seed fertig: ${anzahlKuenstler} Künstler, ${anzahlSongs} Songs, ${anzahlPlaylists} Playlists.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    Deno.exit(1);
  });
