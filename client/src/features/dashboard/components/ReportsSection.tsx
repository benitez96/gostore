import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { RiBookOpenLine, RiBarChartLine, RiPieChartLine } from "react-icons/ri";
import { useState } from "react";

import { useToast } from "@/shared/hooks/useToast";
import { downloadSalesBook } from "@/api";

export function ReportsSection() {
  const { showSuccess, showApiError } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadSalesBook = async () => {
    setIsDownloading(true);
    try {
      await downloadSalesBook();
      showSuccess(
        "Libro generado",
        "El libro de ventas pendientes se descargó correctamente."
      );
    } catch (error) {
      showApiError(
        "Error al generar libro",
        "No se pudo descargar el libro de ventas. Inténtalo de nuevo."
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Libro de Ventas */}
        <Card className="border border-default-200 hover:shadow-md transition-shadow">
          <CardBody className="p-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <RiBookOpenLine className="text-secondary text-lg" />
                <h4 className="font-medium">Libro de Ventas</h4>
              </div>
              <p className="text-sm text-default-600">
                Genera un PDF con todas las fichas de ventas pendientes
                ordenadas alfabéticamente por cliente.
              </p>
              <Button
                className="font-medium"
                color="secondary"
                startContent={<RiBookOpenLine />}
                variant="flat"
                isLoading={isDownloading}
                onPress={handleDownloadSalesBook}
              >
                {isDownloading ? "Generando..." : "Descargar Libro"}
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Reporte de Ventas - Próximamente */}
        <Card className="border border-dashed border-default-300">
          <CardBody className="p-4">
            <div className="flex flex-col gap-3 items-center text-center">
              <RiBarChartLine className="text-default-400 text-2xl" />
              <h4 className="font-medium text-default-600">
                Reporte de Ventas
              </h4>
              <p className="text-sm text-default-500">
                Próximamente: Análisis detallado de ventas por período.
              </p>
              <Button
                className="font-medium"
                color="default"
                variant="flat"
                isDisabled
              >
                Próximamente
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Reporte Financiero - Próximamente */}
        <Card className="border border-dashed border-default-300">
          <CardBody className="p-4">
            <div className="flex flex-col gap-3 items-center text-center">
              <RiPieChartLine className="text-default-400 text-2xl" />
              <h4 className="font-medium text-default-600">
                Reporte Financiero
              </h4>
              <p className="text-sm text-default-500">
                Próximamente: Análisis de ingresos y pagos pendientes.
              </p>
              <Button
                className="font-medium"
                color="default"
                variant="flat"
                isDisabled
              >
                Próximamente
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
} 