-- name: GetClients :many
SELECT 
  c.id,
  name, 
  lastname, 
  dni, 
  s.description AS stateDescription, 
  s.id AS stateId
FROM clients c
  INNER JOIN states s ON c.state_id = s.id
WHERE name LIKE ?
   OR lastname LIKE ?
   OR dni LIKE ?
LIMIT ? OFFSET ?;

-- name: CountClients :one
SELECT COUNT(id)
FROM clients
WHERE name LIKE ?
   OR lastname LIKE ?
   OR dni LIKE ?;

-- name: InsertClient :one
INSERT INTO clients
( name, lastname, dni, email, phone, address, state_id)
VALUES
(?, ?, ?, ?, ?, ?, 1)
RETURNING *;

-- name: GetClientByID :one
SELECT 
  c.id, 
  c.name, 
  c.lastname, 
  c.dni, 
  c.email, 
  c.phone, 
  c.address,
  c.state_id, 
  s.id AS state_id, 
  s.description AS state_description,
  c.created_at, 
  c.updated_at
FROM clients c
INNER JOIN states s ON c.state_id = s.id
WHERE c.id = ?;

-- name: UpdateClientState :exec
UPDATE clients SET state_id = ? WHERE id = ?;

-- name: DeleteClient :exec
DELETE FROM clients WHERE id = ?;

-- name: UpdateClient :exec
UPDATE clients SET name = ?, lastname = ?, dni = ?, email = ?, phone = ?, address = ? WHERE id = ?;
