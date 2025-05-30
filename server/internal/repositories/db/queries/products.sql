-- name: GetSaleProducts :many
SELECT * FROM products WHERE sale_id = ?;
