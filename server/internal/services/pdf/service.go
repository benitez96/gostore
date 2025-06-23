package pdf

import (
	"bytes"
	"fmt"
	"html/template"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/benitez96/gostore/internal/domain"
)

type Service struct {
	tempDir string
}

type PaymentReceiptData struct {
	PaymentID     int64     `json:"payment_id"`
	Amount        float64   `json:"amount"`
	Date          time.Time `json:"date"`
	ClientName    string    `json:"client_name"`
	ClientDni     string    `json:"client_dni"`
	QuotaNumber   int       `json:"quota_number"`
	SaleID        int64     `json:"sale_id"`
	ReceiptNumber string    `json:"receipt_number"`
}

func NewService() *Service {
	return &Service{
		tempDir: "/tmp",
	}
}

// GeneratePaymentReceipt genera un comprobante de pago en PDF
func (s *Service) GeneratePaymentReceipt(payment *domain.Payment, client *domain.Client, quota *domain.Quota, sale *domain.Sale) ([]byte, error) {
	// Usar fecha actual si payment.Date es nil
	paymentDate := time.Now()
	if payment.Date != nil {
		paymentDate = *payment.Date
	}

	// Preparar datos para el template
	data := PaymentReceiptData{
		PaymentID:     payment.ID,
		Amount:        payment.Amount,
		Date:          paymentDate,
		ClientName:    fmt.Sprintf("%s %s", client.Name, client.Lastname),
		ClientDni:     client.Dni,
		QuotaNumber:   int(quota.Number),
		SaleID:        payment.ID,
		ReceiptNumber: fmt.Sprintf("R-%d-%d", payment.ID, time.Now().Unix()),
	}

	// Generar HTML
	htmlContent, err := s.generateHTML(data)
	if err != nil {
		return nil, fmt.Errorf("error generating HTML: %w", err)
	}

	// Convertir HTML a PDF usando wkhtmltopdf
	pdfContent, err := s.convertHTMLToPDF(htmlContent)
	if err != nil {
		return nil, fmt.Errorf("error converting to PDF: %w", err)
	}

	return pdfContent, nil
}

// generateHTML genera el HTML del comprobante
func (s *Service) generateHTML(data PaymentReceiptData) (string, error) {
	// Template HTML básico para pruebas
	tmpl := `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprobante de Pago</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .receipt {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin: 0;
        }
        .receipt-number {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
        }
        .info-section {
            margin-bottom: 25px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .label {
            font-weight: bold;
            color: #555;
        }
        .value {
            color: #333;
        }
        .amount {
            font-size: 20px;
            font-weight: bold;
            color: #2c5aa0;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
        .stamp {
            text-align: center;
            margin-top: 30px;
        }
        .stamp-box {
            display: inline-block;
            border: 2px solid #2c5aa0;
            padding: 20px;
            border-radius: 5px;
            color: #2c5aa0;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="header">
            <h1 class="title">COMPROBANTE DE PAGO</h1>
            <div class="receipt-number">N° {{.ReceiptNumber}}</div>
        </div>

        <div class="info-section">
            <div class="info-row">
                <span class="label">Cliente:</span>
                <span class="value">{{.ClientName}}</span>
            </div>
            <div class="info-row">
                <span class="label">DNI:</span>
                <span class="value">{{.ClientDni}}</span>
            </div>
            <div class="info-row">
                <span class="label">Venta N°:</span>
                <span class="value">{{.SaleID}}</span>
            </div>
            <div class="info-row">
                <span class="label">Cuota N°:</span>
                <span class="value">{{.QuotaNumber}}</span>
            </div>
            <div class="info-row">
                <span class="label">Fecha de Pago:</span>
                <span class="value">{{.Date.Format "02/01/2006 15:04"}}</span>
            </div>
        </div>

        <div class="info-section">
            <div class="info-row">
                <span class="label">Monto Pagado:</span>
                <span class="value amount">${{printf "%.2f" .Amount}}</span>
            </div>
        </div>

        <div class="stamp">
            <div class="stamp-box">
                PAGO RECIBIDO
            </div>
        </div>

        <div class="footer">
            <p>Este documento es un comprobante oficial de pago.</p>
            <p>Generado el {{.Date.Format "02/01/2006 15:04:05"}}</p>
        </div>
    </div>
</body>
</html>`

	// Parsear el template
	t, err := template.New("receipt").Parse(tmpl)
	if err != nil {
		return "", err
	}

	// Ejecutar el template
	var buf bytes.Buffer
	if err := t.Execute(&buf, data); err != nil {
		return "", err
	}

	return buf.String(), nil
}

// convertHTMLToPDF convierte HTML a PDF usando wkhtmltopdf en contenedor
func (s *Service) convertHTMLToPDF(htmlContent string) ([]byte, error) {
	// Crear archivo temporal para el HTML
	htmlFile := filepath.Join(s.tempDir, fmt.Sprintf("receipt_%d.html", time.Now().UnixNano()))
	if err := os.WriteFile(htmlFile, []byte(htmlContent), 0644); err != nil {
		return nil, fmt.Errorf("error writing HTML file: %w", err)
	}
	defer os.Remove(htmlFile)

	// Crear archivo temporal para el PDF
	pdfFile := filepath.Join(s.tempDir, fmt.Sprintf("receipt_%d.pdf", time.Now().UnixNano()))
	defer os.Remove(pdfFile)

	// Ejecutar wkhtmltopdf usando docker run --rm (contenedor efímero)
	cmd := exec.Command("docker", "run", "--rm",
		"-v", fmt.Sprintf("%s:/tmp", s.tempDir), // Montar /tmp del host
		"--user", "1000:1000", // Usuario sin privilegios
		"--network", "none", // Sin acceso a red
		"--read-only",                         // Sistema de archivos solo lectura
		"--security-opt", "no-new-privileges", // No permitir escalación de privilegios
		"--cap-drop", "ALL", // Remover todas las capabilities
		"gostore-wkhtmltopdf", // Nombre de la imagen
		"wkhtmltopdf",
		"--disable-javascript",        // Deshabilitar JavaScript
		"--disable-local-file-access", // Deshabilitar acceso a archivos locales
		"--page-size", "A4",
		"--margin-top", "10mm",
		"--margin-right", "10mm",
		"--margin-bottom", "10mm",
		"--margin-left", "10mm",
		"/tmp/"+filepath.Base(htmlFile), // Ruta dentro del contenedor
		"/tmp/"+filepath.Base(pdfFile))  // Ruta dentro del contenedor

	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("wkhtmltopdf error: %w, output: %s", err, string(output))
	}

	fmt.Printf("wkhtmltopdf output: %s\n", string(output))

	// Leer el PDF generado
	pdfContent, err := os.ReadFile(pdfFile)
	if err != nil {
		return nil, fmt.Errorf("error reading PDF file: %w", err)
	}

	return pdfContent, nil
}

// GenerateDuplicate genera un duplicado del comprobante
func (s *Service) GenerateDuplicate(paymentID string) ([]byte, error) {
	// TODO: Implementar generación de duplicado
	// Por ahora retornamos un error
	return nil, fmt.Errorf("duplicate generation not implemented yet")
}
