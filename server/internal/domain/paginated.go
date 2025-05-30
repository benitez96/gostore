package domain

type Paginated[T any] struct {
	Results	[]T `json:"results"`
	Total 	int `json:"total"`
}
