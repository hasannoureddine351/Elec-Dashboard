-- Insert dummy data into the users table
INSERT INTO users (name, email) VALUES ('John Doe', 'john@example.com');
INSERT INTO users (name, email) VALUES ('Jane Smith', 'jane@example.com');

-- Insert dummy data into the servers table
INSERT INTO servers (name, url, price) VALUES ('Server A', 'http://servera.com', 10.99);
INSERT INTO servers (name, url, price) VALUES ('Server B', 'http://serverb.com', 15.99);

-- Insert dummy data into the accounts table
INSERT INTO accounts (name, password, start_date, expirey_date, price, user_id, server_id) 
VALUES ('Account 1', 'password1', '2023-01-01', '2024-01-01', 5.99, 1, 1);
INSERT INTO accounts (name, password, start_date, expirey_date, price, user_id, server_id) 
VALUES ('Account 2', 'password2', '2023-02-01', '2024-02-01', 8.99, 2, 2);

-- Insert dummy data into the active_accounts table
INSERT INTO active_accounts (users_id, accounts_id) VALUES (1, 1);
INSERT INTO active_accounts (users_id, accounts_id) VALUES (2, 2);
