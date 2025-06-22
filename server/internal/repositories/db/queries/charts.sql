-- name: GetQuotaMonthlySummary :many
SELECT 
    strftime('%Y-%m', due_date) as month,
    SUM(amount) as total_amount,
    SUM(CASE WHEN is_paid = 1 THEN amount ELSE 0 END) as amount_paid,
    SUM(CASE WHEN is_paid = 0 THEN amount ELSE 0 END) as amount_not_paid
FROM quotas 
WHERE due_date IS NOT NULL
GROUP BY strftime('%Y-%m', due_date)
ORDER BY month DESC;

-- name: GetClientStatusCount :many
SELECT 
    s.id as status_id,
    s.description as status_name,
    COUNT(c.id) as client_count
FROM states s
LEFT JOIN clients c ON s.id = c.state_id
WHERE s.id IN (1, 2, 3)
GROUP BY s.id, s.description
ORDER BY s.id;

-- name: GetTotalClients :one
SELECT COUNT(id) FROM clients;

-- name: GetTotalProducts :one
SELECT COUNT(id) FROM products;

-- name: GetTotalSales :one
SELECT COUNT(id) FROM sales;

-- name: GetActiveSales :one
SELECT COUNT(id) FROM sales WHERE is_paid = 0;

-- name: GetTotalRevenue :one
SELECT IFNULL(SUM(amount), 0) FROM payments; 