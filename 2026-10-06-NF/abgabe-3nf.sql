-- abgabe-3nf.sql — KM5-02 Abgabe (Max Havel, 3AHWII)
-- 1) bestellung_denorm zerlegt bis 3NF
-- 2) zwei eigene Quiz-Tabellen zerlegt: kunde_hobby_denorm (1NF), song_playlist_denorm (2NF)
-- Laden mit: sqlite3 normalisierung.db < abgabe-3nf.sql

----------------------------------------------------------------------
-- Teil 1: bestellung_denorm -> 3NF
-- Vorhersage: ort verletzt 3NF (bestell_nr -> plz -> ort, transitiv).
-- 1NF ok (atomar), 2NF ok (PK einspaltig).
----------------------------------------------------------------------
DROP TABLE IF EXISTS bestellung_denorm;
CREATE TABLE bestellung_denorm(
  bestell_nr INTEGER PRIMARY KEY,
  kunde      TEXT NOT NULL,
  plz        TEXT NOT NULL,
  ort        TEXT NOT NULL
);
INSERT INTO bestellung_denorm(bestell_nr, kunde, plz, ort) VALUES
  (101, 'Auer',  '1020', 'Wien'),
  (102, 'Beck',  '1020', 'Wien'),
  (103, 'Cevik', '4020', 'Linz');

-- 3NF-Fix: ort hängt nur von plz ab -> eigene Tabelle
DROP TABLE IF EXISTS bestellung;
DROP TABLE IF EXISTS plz;
CREATE TABLE plz(
  plz TEXT PRIMARY KEY,
  ort TEXT NOT NULL
);
INSERT INTO plz(plz, ort) VALUES
  ('1020', 'Wien'),
  ('4020', 'Linz'),
  ('8010', 'Graz');  -- 3. Beispielzeile: neue PLZ ohne Bestellung speicherbar (Insert-Anomalie behoben)

CREATE TABLE bestellung(
  bestell_nr INTEGER PRIMARY KEY,
  kunde      TEXT NOT NULL,
  plz        TEXT NOT NULL REFERENCES plz(plz)
);
INSERT INTO bestellung(bestell_nr, kunde, plz) VALUES
  (101, 'Auer',  '1020'),
  (102, 'Beck',  '1020'),
  (103, 'Cevik', '4020');

----------------------------------------------------------------------
-- Teil 2a: eigene Tabelle 1 — kunde_hobby_denorm (1NF-Verletzung)
-- Problem: hobbys = 'Lesen, Schwimmen' (Liste in einer Zelle, nicht atomar)
-- Fix: Kindtabelle hobby, eine Zeile pro Wert
----------------------------------------------------------------------
DROP TABLE IF EXISTS hobby;
DROP TABLE IF EXISTS kunde_hobby_denorm;
DROP TABLE IF EXISTS kunde;
CREATE TABLE kunde(
  kunde_id INTEGER PRIMARY KEY,
  name     TEXT NOT NULL
);
CREATE TABLE hobby(
  kunde_id INTEGER NOT NULL REFERENCES kunde(kunde_id),
  hobby    TEXT NOT NULL,
  PRIMARY KEY(kunde_id, hobby)
);
INSERT INTO kunde(kunde_id, name) VALUES
  (1, 'Auer'),
  (2, 'Beck'),
  (3, 'Cevik');
INSERT INTO hobby(kunde_id, hobby) VALUES
  (1, 'Lesen'),
  (1, 'Schwimmen'),
  (2, 'Schach');

----------------------------------------------------------------------
-- Teil 2b: eigene Tabelle 2 — song_playlist_denorm (2NF-Verletzung)
-- Problem: PK = (song_id, playlist_id), aber song_titel haengt nur an
-- song_id (Teil des Schluessels): song_id -> song_titel (partiell)
-- Fix: Titel in song-Tabelle, Zwischentabelle nur Beziehung
----------------------------------------------------------------------
DROP TABLE IF EXISTS song_playlist_denorm;
DROP TABLE IF EXISTS song_playlist;
DROP TABLE IF EXISTS song;
DROP TABLE IF EXISTS playlist;
CREATE TABLE song(
  song_id   INTEGER PRIMARY KEY,
  titel     TEXT NOT NULL,
  dauer_sek INTEGER NOT NULL
);
CREATE TABLE playlist(
  playlist_id INTEGER PRIMARY KEY,
  name        TEXT NOT NULL
);
CREATE TABLE song_playlist(
  song_id     INTEGER NOT NULL REFERENCES song(song_id),
  playlist_id INTEGER NOT NULL REFERENCES playlist(playlist_id),
  PRIMARY KEY(song_id, playlist_id)
);
INSERT INTO song(song_id, titel, dauer_sek) VALUES
  (1, 'Silent Lines', 215),
  (2, 'Night Ferry', 240),
  (3, 'Dust Choir', 198);
INSERT INTO playlist(playlist_id, name) VALUES
  (10, 'Fokus'),
  (20, 'Nachtfahrt'),
  (30, 'Sport');
INSERT INTO song_playlist(song_id, playlist_id) VALUES
  (1, 10),
  (1, 20),
  (2, 20);
