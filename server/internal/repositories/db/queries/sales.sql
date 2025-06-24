-- name: GetSalesByClientID :many
SELECT 
  s.id,
  s.client_id,
  s.description,
  s.date,
  s.state_id,
  s.is_paid
FROM sales s WHERE s.client_id = ? ORDER BY s.id desc;

-- name: GetSaleByID :one
SELECT * FROM sales WHERE id = ?;

-- name: CreateSale :one
INSERT INTO sales (description, amount, client_id, date)
VALUES (?, ?, ?, ?)
RETURNING id;

-- name: UpdateSalePaymentStatus :exec
UPDATE sales SET is_paid = ?, state_id = ? WHERE id = ?;

-- name: DeleteSale :exec
DELETE FROM sales WHERE id = ?;

-- name: GetPendingSalesOrderedByClient :many
SELECT 
  s.id,
  s.description,
  s.amount,
  s.date,
  s.client_id,
  c.name as client_name,
  c.lastname as client_lastname
FROM sales s
INNER JOIN clients c ON s.client_id = c.id
WHERE s.is_paid = 0
ORDER BY c.lastname ASC, c.name ASC, s.id ASC;
