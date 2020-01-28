DROP TABLE IF EXISTS topPlayers;

PRAGMA foreign_keys = ON;

CREATE TABLE topPlayers (
    pname       TEXT,
    pscore      INT,
    primary key (pname, pscore)
);
