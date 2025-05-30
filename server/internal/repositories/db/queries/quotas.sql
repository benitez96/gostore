-- name: GetSaleQuotas :many
SELECT * FROM quotas WHERE sale_id = ?;
