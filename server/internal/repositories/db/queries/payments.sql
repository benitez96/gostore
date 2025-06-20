-- name: GetQuotaPayments :many
SELECT * FROM payments WHERE quota_id = ?;

-- name: CreatePayment :one
INSERT INTO payments (amount, date, quota_id, client_id) 
VALUES (?, ?, ?, ?) 
RETURNING *;
