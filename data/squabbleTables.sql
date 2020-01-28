DROP TABLE IF EXISTS topPlayers;

PRAGMA foreign_keys = ON;

CREATE TABLE topPlayers (
    socketId    TEXT NOT NULL,
    pname       TEXT,
    pscore      INT,
    primary key (socketId)
);
