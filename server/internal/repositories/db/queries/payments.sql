-- name: GetQuotaPayments :many
SELECT * FROM payments WHERE quota_id = ?;

-- name: GetPaymentByID :one
SELECT * FROM payments WHERE id = ?;

-- name: CreatePayment :one
INSERT INTO payments (amount, date, quota_id, client_id) 
VALUES (?, ?, ?, ?) 
RETURNING *;

-- name: DeletePayment :exec
DELETE FROM payments WHERE id = ?;
