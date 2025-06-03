-- name: GetSaleQuotas :many
SELECT * FROM quotas WHERE sale_id = ?;

-- name: CreateQuota :exec
INSERT INTO quotas (number, amount, due_date, sale_id, client_id)
VALUES (?, ?, ?, ?, ?);
