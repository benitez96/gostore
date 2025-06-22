package sale

import (
	"fmt"

	"github.com/benitez96/gostore/internal/dto"
)

func (s Service) Create(dto *dto.CreateSaleDto) (int64, error) {
	saleID, err := s.Sr.CreateSaleWithProductsAndQuotas(dto)
	if err != nil {
		return 0, err
	}

	// Actualizar estados después de crear la venta y sus cuotas
	if err := s.StateUpdater.UpdateSaleStateAndPropagate(fmt.Sprintf("%d", saleID)); err != nil {
		// Log el error pero no fallar la creación
		// TODO: Agregar logging aquí
	}

	return saleID, nil
}
