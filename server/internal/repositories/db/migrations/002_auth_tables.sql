-- +goose Up
-- Users table with bitmask permissions
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    permissions INTEGER NOT NULL DEFAULT 0, -- Bitmask: 1=clientes, 2=productos, 4=dashboard
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_permissions ON users(permissions);
CREATE INDEX idx_users_active ON users(is_active);

-- +goose Down
DROP TABLE users;

DROP INDEX IF EXISTS idx_users_username;
DROP INDEX IF EXISTS idx_users_permissions;
DROP INDEX IF EXISTS idx_users_active; 