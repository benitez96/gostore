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
