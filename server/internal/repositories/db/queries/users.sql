-- name: GetUsers :many
SELECT 
  id,
  username,
  permissions,
  first_name,
  last_name,
  is_active,
  last_login_at,
  created_at,
  updated_at
FROM users
WHERE is_active = ?
ORDER BY created_at DESC
LIMIT ? OFFSET ?;

-- name: GetAllUsers :many
SELECT 
  id,
  username,
  permissions,
  first_name,
  last_name,
  is_active,
  last_login_at,
  created_at,
  updated_at
FROM users
ORDER BY is_active DESC, created_at DESC;

-- name: CountUsers :one
SELECT COUNT(id)
FROM users
WHERE is_active = ?;

-- name: GetUserByID :one
SELECT 
  id,
  username,
  permissions,
  first_name,
  last_name,
  is_active,
  last_login_at,
  created_at,
  updated_at
FROM users
WHERE id = ?;

-- name: GetUserByUsername :one
SELECT 
  id,
  username,
  password_hash,
  permissions,
  first_name,
  last_name,
  is_active,
  last_login_at,
  created_at,
  updated_at
FROM users
WHERE username = ?;

-- name: InsertUser :one
INSERT INTO users
(username, password_hash, permissions, first_name, last_name, is_active)
VALUES
(?, ?, ?, ?, ?, ?)
RETURNING id, username, permissions, first_name, last_name, is_active, created_at, updated_at;

-- name: UpdateUser :exec
UPDATE users 
SET username = ?, permissions = ?, first_name = ?, last_name = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- name: UpdateUserPassword :exec
UPDATE users 
SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- name: UpdateUserLastLogin :exec
UPDATE users 
SET last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- name: DeleteUser :exec
UPDATE users 
SET is_active = false, updated_at = CURRENT_TIMESTAMP
WHERE id = ?; 