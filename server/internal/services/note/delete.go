package note

func (s *Service) Delete(id string) error {
	return s.Repo.Delete(id)
}
