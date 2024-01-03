PRAGMA foreign_keys = ON;

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  idusers INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL 
);

CREATE TABLE IF NOT EXISTS servers (
  idservers INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  price DECIMAL NOT NULL
);

CREATE TABLE IF NOT EXISTS accounts (
  idaccounts INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  start_date DATE NOT NULL,
  expirey_date DATE NOT NULL, 
  price DECIMAL NOT NULL,
  user_id INTEGER NOT NULL,
  server_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (idusers) ON DELETE NO ACTION ON UPDATE NO ACTION,
  FOREIGN KEY (server_id) REFERENCES servers (idservers) ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- Create a temporary table with the desired constraints
CREATE TABLE active_accounts(
  users_id INTEGER NOT NULL,
  accounts_id INTEGER NOT NULL,
  FOREIGN KEY (users_id) REFERENCES users (idusers) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (accounts_id) REFERENCES accounts (idaccounts) ON DELETE CASCADE ON UPDATE CASCADE
);

