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

-- name: GetUnpaidQuotasForStateUpdate :many
SELECT id, due_date, is_paid, state_id, sale_id, client_id 
FROM quotas 
WHERE is_paid = 0;

-- name: UpdateQuotaStateBulk :exec
UPDATE quotas SET state_id = ? WHERE id = ?;

-- name: GetSalesByQuotaStates :many
SELECT DISTINCT s.id, s.client_id, s.state_id
FROM sales s
INNER JOIN quotas q ON s.id = q.sale_id
WHERE q.is_paid = 0;

-- name: UpdateSaleStateBulk :exec
UPDATE sales SET state_id = ? WHERE id = ?;

-- name: GetClientsBySaleStates :many
SELECT DISTINCT c.id, c.state_id
FROM clients c
INNER JOIN sales s ON c.id = s.client_id
WHERE s.is_paid = 0;

-- name: UpdateClientStateBulk :exec
UPDATE clients SET state_id = ? WHERE id = ?;
