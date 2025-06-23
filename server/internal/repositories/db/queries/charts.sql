-- name: GetQuotaMonthlySummary :many
SELECT 
    strftime('%Y-%m', due_date) as month,
    SUM(amount) as total_amount,
    SUM(CASE WHEN is_paid = 1 THEN amount ELSE 0 END) as amount_paid,
    SUM(CASE WHEN is_paid = 0 THEN amount ELSE 0 END) as amount_not_paid
FROM quotas 
WHERE due_date IS NOT NULL
    AND strftime('%Y', due_date) = strftime('%Y', ?)
GROUP BY strftime('%Y-%m', due_date)
ORDER BY month ASC;

-- name: GetQuotaMonthlySummaryAll :many
SELECT 
    strftime('%Y-%m', due_date) as month,
    SUM(amount) as total_amount,
    SUM(CASE WHEN is_paid = 1 THEN amount ELSE 0 END) as amount_paid,
    SUM(CASE WHEN is_paid = 0 THEN amount ELSE 0 END) as amount_not_paid
FROM quotas 
WHERE due_date IS NOT NULL
GROUP BY strftime('%Y-%m', due_date)
ORDER BY month DESC;

-- name: GetAvailableYears :many
SELECT DISTINCT strftime('%Y', due_date) as year
FROM quotas 
WHERE due_date IS NOT NULL
ORDER BY year DESC;

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

-- name: GetPendingAmount :one
SELECT IFNULL(
    (SELECT SUM(amount) FROM sales WHERE is_paid = 0) +
    (SELECT SUM(amount) FROM quotas WHERE is_paid = 0 AND due_date < date('now')), 
    0
) as pending_amount;

-- name: GetCollectedThisMonth :one
SELECT IFNULL(SUM(amount), 0) FROM payments WHERE strftime('%Y-%m', date) = strftime('%Y-%m', 'now');

-- name: GetQuotasDueThisMonth :one
SELECT IFNULL(SUM(amount), 0) FROM quotas WHERE strftime('%Y-%m', due_date) = strftime('%Y-%m', 'now');

-- name: GetCollectedFromQuotasDueThisMonth :one
SELECT IFNULL(SUM(p.amount), 0)
FROM payments p
JOIN quotas q ON p.quota_id = q.id
WHERE strftime('%Y-%m', q.due_date) = strftime('%Y-%m', 'now');

-- name: GetQuotasDueNextMonth :one
SELECT IFNULL(SUM(amount), 0) FROM quotas WHERE strftime('%Y-%m', due_date) = strftime('%Y-%m', date('now', '+1 month'));

-- name: GetPaidQuotasDueThisMonth :one
SELECT COUNT(*) FROM quotas WHERE is_paid = 1 AND strftime('%Y-%m', due_date) = strftime('%Y-%m', 'now');

-- name: GetCountQuotasDueThisMonth :one
SELECT COUNT(*) FROM quotas WHERE strftime('%Y-%m', due_date) = strftime('%Y-%m', 'now');

-- name: GetPaidQuotasDueLastMonth :one
SELECT COUNT(*) FROM quotas WHERE is_paid = 1 AND strftime('%Y-%m', due_date) = strftime('%Y-%m', date('now', '-1 month'));

-- name: GetCountQuotasDueLastMonth :one
SELECT COUNT(*) FROM quotas WHERE strftime('%Y-%m', due_date) = strftime('%Y-%m', date('now', '-1 month')); 