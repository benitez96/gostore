-- name: GetQuotaPayments :many
SELECT * FROM payments WHERE quota_id = ?;
