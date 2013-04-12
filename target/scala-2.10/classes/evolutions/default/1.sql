# Played schema

# --- !Ups

CREATE SEQUENCE user_id_seq;
CREATE TABLE User (
    id integer NOT NULL DEFAULT nextval('user_id_seq'),
    userId varchar(255),
    full_name varchar(255)
);

INSERT INTO User (id, userId, full_name) VALUES(1, 'catalin', 'Catalin')

# --- !Downs

DROP TABLE User;
DROP SEQUENCE user_id_seq;