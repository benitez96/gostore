-- name: CreateNote :one
INSERT INTO notes (content, sale_id)
VALUES (?, ?)
RETURNING *;

-- name: GetNotesBySaleID :many
SELECT * FROM notes WHERE sale_id = ? ORDER BY created_at DESC; 