# Played schema

# --- !Ups

CREATE SEQUENCE user_id_seq;
CREATE TABLE User (
    id integer NOT NULL DEFAULT nextval('user_id_seq'),
    name varchar(255)
);

INSERT INTO User VALUES(1, "catalin", "Catalin")

# --- !Downs

DROP TABLE USER;
DROP SEQUENCE user_id_seq;