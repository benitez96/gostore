package repositories

import (
	"github.com/benitez96/gostore/internal/domain"
	"github.com/benitez96/gostore/internal/repositories/utils"
)

func (r *Repository) GetClientStatusCount() ([]*domain.ClientStatusCount, error) {
	ctx, cancel := utils.GetContext()
	defer cancel()

	statusCounts, err := r.Queries.GetClientStatusCount(ctx)
	if err != nil {
		return nil, err
	}

	var domainStatusCounts []*domain.ClientStatusCount
	for _, statusCount := range statusCounts {
		domainStatusCounts = append(domainStatusCounts, &domain.ClientStatusCount{
			StatusID:    int(statusCount.StatusID),
			StatusName:  statusCount.StatusName,
			ClientCount: int(statusCount.ClientCount),
		})
	}

	return domainStatusCounts, nil
}
