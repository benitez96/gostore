
-- name: CreateSaleProduct :exec
INSERT INTO sale_products (name, cost, price, quantity, sale_id, client_id)
VALUES (?, ?, ?, ?, ?, ?);
