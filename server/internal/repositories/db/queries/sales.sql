-- name: GetSalesByClientID :many
SELECT * FROM sales WHERE client_id = ?;
