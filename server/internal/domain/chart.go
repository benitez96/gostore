package domain

type DashboardStats struct {
	TotalClients  int64   `json:"totalClients"`
	TotalProducts int64   `json:"totalProducts"`
	TotalSales    int64   `json:"totalSales"`
	ActiveSales   int64   `json:"activeSales"`
	TotalRevenue  float64 `json:"totalRevenue"`
}

// QuotaMonthlySummary represents the monthly quota summary for charts
type QuotaMonthlySummary struct {
	Month         string  `json:"month"`           // Format: "2024-01"
	TotalAmount   float64 `json:"total_amount"`    // Total amount of all quotas in the month
	AmountPaid    float64 `json:"amount_paid"`     // Total amount paid in the month
	AmountNotPaid float64 `json:"amount_not_paid"` // Total amount not paid in the month
}

// ClientStatusCount represents the count of clients by status for pie charts
type ClientStatusCount struct {
	StatusID    int    `json:"status_id"`
	StatusName  string `json:"status_name"`
	ClientCount int    `json:"client_count"`
}
