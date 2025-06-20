
-- name: CreateSaleProduct :exec
INSERT INTO sale_products (name, cost, price, quantity, sale_id, client_id)
VALUES (?, ?, ?, ?, ?, ?);

-- name: GetSaleProductsBySaleID :many
SELECT id, name, cost, price, quantity
FROM sale_products
WHERE sale_id = ?;
