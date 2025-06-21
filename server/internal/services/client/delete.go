package client

func (s *Service) Delete(id string) error {
	// Delete the client (database will cascade delete sales, quotas, payments, and sale_products)
	return s.Repo.Delete(id)
}
