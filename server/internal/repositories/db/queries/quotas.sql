-- name: GetSaleQuotas :many
SELECT * FROM quotas WHERE sale_id = ?;

-- name: GetQuotaByID :one
SELECT * FROM quotas WHERE id = ?;

-- name: CreateQuota :exec
INSERT INTO quotas (number, amount, due_date, sale_id, client_id)
VALUES (?, ?, ?, ?, ?);

-- name: UpdateQuotaPaymentStatus :exec
UPDATE quotas SET is_paid = ?, state_id = ? WHERE id = ?;

-- name: UpdateQuota :exec
UPDATE quotas SET amount = ?, due_date = ? WHERE id = ?;
