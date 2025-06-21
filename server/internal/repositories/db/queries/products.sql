-- name: CreateProduct :one
INSERT INTO products (name, cost, price, stock)
VALUES (?, ?, ?, ?)
RETURNING *;

-- name: GetAllProducts :many
SELECT * FROM products ORDER BY created_at DESC;

-- name: GetProductByID :one
SELECT * FROM products WHERE id = ?;

-- name: UpdateProduct :one
UPDATE products
SET name = ?, cost = ?, price = ?, stock = ?, updated_at = CURRENT_TIMESTAMP
WHERE id = ?
RETURNING *;

-- name: DeleteProduct :exec
DELETE FROM products WHERE id = ?;

-- name: UpdateProductStock :exec
UPDATE products
SET stock = MAX(stock - ?, 0)
WHERE id = ?
