# 2026-10-13 – Drizzle ORM (KM5-05)

Quelle: `GRG-INFI/3ahwii/2026-10-13_allerlei/README.md` +
`unterricht/KM5-05-drizzle-orm/aufgabe.md` bzw. `lesson.html` (Abschnitt
„Aufgabe").

Das Beispielprojekt `Beispielprojekte/km5-05-drizzle-orm/` liegt komplett in
diesem Ordner (unverändert außer `demo.ts` — siehe unten). Nachweis:
`deno task demo` und `deno task test` (9/9 grün).

## 1. Vorhersagen (erst notiert, dann per `toSQL()` geprüft)

### a) `db.select().from(artist).where(eq(artist.gruendungsjahr, 1999))`

Vorhersage:

```sql
select "id", "name", "gruendungsjahr" from "artist" where "artist"."gruendungsjahr" = ?
-- Parameter: [1999]
```

- Spaltenliste = alle Spalten des Schemas **in Schema-Reihenfolge**, mit den
  **SQL**-Spaltennamen (`gruendungsjahr` heißt im Schema gleich).
- `eq()` erzeugt eine parametrisierte WHERE-Klausel — der Wert 1999 steht
  **nicht** im SQL-Text, sondern in `toSQL().params`.

### b) `db.select({ n: count() }).from(album).where(eq(album.artistId, 1))`

Vorhersage:

```sql
select count(*) from "album" where "album"."artist_id" = ?
-- Parameter: [1]
```

- `count()` wird zu `count(*)` — der TypeScript-Alias `n` ist nur für das
  Ergebnisobjekt relevant und taucht **nicht** im SQL auf.
- `album.artistId` heißt in der DB `artist_id` (Schema-Definition
  `integer("artist_id")`) — Drizzle nutzt den SQL-Namen, nicht den TS-Namen.

## 2. Beispielprojekt erweitert — drei Queries in `demo.ts`

Ergänzt im Abschnitt `// --- HÜ KM5-05: drei Queries`, jeweils mit
`toSQL()`-Ausgabe:

1. **Ältestes Album** (`orderBy(album.jahr)` aufsteigend + `limit(1)`):
   `Night Ferry (2012)` →
   `select "id", "titel", "jahr", "artist_id" from "album" order by "album"."jahr" limit ?`
   (Parameter: `[1]` — auch `limit` wird parametrisiert!)
2. **Echo-Tracks** (`and` + `eq` + `like` auf Album „Silent Lines"):
   `["Echo Room"]` →
   `select "id", "titel", "dauer_sek", "album_id" from "track" where (("track"."album_id" = ?) and ("track"."titel" like ?))`
   (Parameter: `[1, "Echo%"]`)
3. **Anzahl Tracks je Album** (`count` + `groupBy`): siehe SQL-Vergleich unten →
   `[{ titel: "Silent Lines", anzahl: 2 }]`

## 3. SQL-Vergleich (Interleaving) — „Tracks pro Album"

Von Hand geschriebenes SQL:

```sql
SELECT album.titel, COUNT(*)
FROM track
INNER JOIN album ON track.album_id = album.id
GROUP BY album.id;
```

Von Drizzle erzeugt (`proAlbumQuery.toSQL().sql`):

```sql
select "album"."titel", count(*) from "track" inner join "album" on "track"."album_id" = "album"."id" group by "album"."id"
```

| Baustein    | Hand-SQL                                        | Drizzle                                                               |
| ----------- | ----------------------------------------------- | --------------------------------------------------------------------- |
| Spalten     | `album.titel, COUNT(*)`                         | `select("titel": album.titel, count())` → `"album"."titel", count(*)` |
| Verbindung  | `INNER JOIN album ON track.album_id = album.id` | `.innerJoin(album, eq(track.albumId, album.id))`                      |
| Aggregation | `COUNT(*)`                                      | `count()`                                                             |
| Gruppierung | `GROUP BY album.id`                             | `.groupBy(album.id)`                                                  |

Gleiches Ergebnis, gleiche Bausteine — Drizzle tippt das SQL, es ersetzt es
nicht. Einzige kosmetische Differenz: Schreibweise (Groß/Klein) und die
doppelten Anführungszeichen der SQLite-Identifiers.

## 4. Nachweis

- `deno task demo` — Ausgaben u. a.:
  - `HÜ: ältestes Album: Night Ferry ( 2012 )`
  - `HÜ: Echo-Tracks: [ "Echo Room" ] Parameter: [ 1, "Echo%" ]`
  - `HÜ: Tracks pro Album: [ { titel: "Silent Lines", anzahl: 2 } ]`
- `deno task test` — **9 passed | 0 failed**

## Bonus: „Jetzt du!"-Frage aus der Lesson

Welche Spalten listet `db.select().from(track)` — und in welcher Reihenfolge?
Alle Spalten des `track`-Schemas **in der Reihenfolge der Schema-Definition**
(`id, titel, dauer_sek, album_id`), benannt mit den **SQL**-Spaltennamen
(`dauer_sek`, nicht `dauerSek`). Wer im SQL nach dem TS-Namen sucht, findet ihn
nicht.
