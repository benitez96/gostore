package domain

type Paginated[T any] struct {
	Results	[]T `json:"results"`
	Count 	int `json:"count"`
}
