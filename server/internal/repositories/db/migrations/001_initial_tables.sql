-- +goose Up
CREATE TABLE clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    dni VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address VARCHAR(255),
    state_id INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (state_id) REFERENCES states(id)
);

CREATE TABLE sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description VARCHAR(255) NOT NULL,
    amount FLOAT NOT NULL,
    is_paid BOOLEAN NOT NULL DEFAULT false,
    state_id INT NOT NULL DEFAULT 1,
    client_id INT NOT NULL,
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE TABLE sale_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    cost FLOAT,
    price FLOAT,
    quantity INT NOT NULL DEFAULT 1,
    sale_id INT NOT NULL,
    client_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    cost FLOAT,
    price FLOAT,
    stock INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quotas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    number INT NOT NULL,
    amount FLOAT NOT NULL,
    due_date TIMESTAMP NOT NULL,
    is_paid BOOLEAN DEFAULT false,
    state_id INT NOT NULL DEFAULT 1,
    sale_id INT NOT NULL,
    client_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
    FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE TABLE payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount FLOAT NOT NULL,
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    quota_id INT NOT NULL,
    client_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quota_id) REFERENCES quotas(id) ON DELETE CASCADE
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE TABLE states (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description VARCHAR(255) NOT NULL
);

CREATE TABLE notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    sale_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
);

CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_lastname ON clients(lastname);
CREATE INDEX idx_clients_dni ON clients(dni);
CREATE INDEX idx_quotas_client_id ON quotas(client_id);
CREATE INDEX idx_sales_client_id ON sales(client_id);
CREATE INDEX idx_products_sale_id ON sale_products(sale_id);
CREATE INDEX idx_quotas_sale_id ON quotas(sale_id);
CREATE INDEX idx_notes_sale_id ON notes(sale_id);
CREATE INDEX idx_payments_quota_id ON payments(quota_id);

-- Insert initial states
INSERT INTO states (id, description) VALUES
  (1, 'OK'),
  (2, 'Warning'),
  (3, 'Suspended');

-- +goose Down
DROP TABLE clients;
DROP TABLE sales;
DROP TABLE sale_products;
DROP TABLE products;
DROP TABLE quotas;
DROP TABLE payments;
DROP TABLE notes;
DROP TABLE states;
DROP INDEX IF EXISTS idx_clients_name;
DROP INDEX IF EXISTS idx_clients_lastname;
DROP INDEX IF EXISTS idx_clients_dni;
DROP INDEX IF EXISTS idx_quotas_client_id;
DROP INDEX IF EXISTS idx_sales_client_id;
DROP INDEX IF EXISTS idx_products_sale_id;
DROP INDEX IF EXISTS idx_quotas_sale_id;
DROP INDEX IF EXISTS idx_payments_quota_id;
DROP INDEX IF EXISTS idx_notes_sale_id;
