-- name: UpdateProductStock :exec
UPDATE products
SET stock = MAX(stock - ?, 0)
WHERE id = ?
