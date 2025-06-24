-- name: CreateProduct :one
INSERT INTO products (name, cost, price, stock)
VALUES (?, ?, ?, ?)
RETURNING *;

-- name: GetAllProducts :many
SELECT * FROM products ORDER BY created_at DESC;

-- name: GetProductsPaginated :many
SELECT * FROM products 
WHERE (? = '' OR name LIKE '%' || ? || '%')
ORDER BY created_at DESC
LIMIT ? OFFSET ?;

-- name: GetProductsCount :one
SELECT COUNT(*) FROM products 
WHERE (? = '' OR name LIKE '%' || ? || '%');

-- name: GetProductStats :one
SELECT 
    COUNT(*) as total_products,
    IFNULL(SUM(price * stock), 0) as total_value,
    IFNULL(SUM(cost * stock), 0) as total_cost,
    IFNULL(SUM(stock), 0) as total_stock,
    COUNT(CASE WHEN stock = 0 THEN 1 END) as out_of_stock_count
FROM products;

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
