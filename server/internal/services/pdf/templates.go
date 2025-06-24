package pdf

import (
	"bytes"
	"embed"
	"fmt"
	"html/template"
	"log"
	"os"
	"path/filepath"
	"strings"
)

//go:embed templates/*
var templateFiles embed.FS

// TemplateManager maneja la generación de templates HTML
type TemplateManager struct {
	templatesDir string
	useEmbed     bool
}

// NewTemplateManager crea una nueva instancia del gestor de templates
func NewTemplateManager() *TemplateManager {
	// Intentar usar archivos embebidos primero
	return &TemplateManager{
		useEmbed: true,
	}
}

// GeneratePaymentReceiptHTML genera el HTML para el comprobante de pago
func (tm *TemplateManager) GeneratePaymentReceiptHTML(data PaymentReceiptData) (string, error) {
	// Leer el template HTML
	htmlTemplate, err := tm.readTemplateFile("payment_receipt.html")
	if err != nil {
		return "", fmt.Errorf("error reading HTML template: %w", err)
	}

	// Leer los estilos CSS
	commonCSS, err := tm.readCSSFile("styles/common.css")
	if err != nil {
		return "", fmt.Errorf("error reading common CSS: %w", err)
	}

	specificCSS, err := tm.readCSSFile("styles/payment_receipt.css")
	if err != nil {
		return "", fmt.Errorf("error reading specific CSS: %w", err)
	}

	// Combinar CSS en un solo bloque
	combinedCSS := commonCSS + "\n" + specificCSS

	// Crear el HTML final con estilos embebidos
	finalHTML := tm.embedCSSInHTML(htmlTemplate, combinedCSS, []string{
		"styles/common.css",
		"styles/payment_receipt.css",
	})

	return tm.executeTemplate("payment_receipt", finalHTML, data)
}

// GenerateSaleSheetHTML genera el HTML para la ficha de venta
func (tm *TemplateManager) GenerateSaleSheetHTML(data SaleSheetData) (string, error) {
	htmlTemplate, err := tm.readTemplateFile("sale_sheet.html")
	if err != nil {
		return "", err
	}

	commonCSS, err := tm.readCSSFile("styles/common.css")
	if err != nil {
		return "", err
	}

	finalHTML := tm.embedCSSInHTML(htmlTemplate, commonCSS, []string{"styles/common.css"})
	return tm.executeTemplate("sale_sheet", finalHTML, data)
}

// GenerateSalesBookHTML genera el HTML para el libro de ventas masivo
func (tm *TemplateManager) GenerateSalesBookHTML(data SalesBookData) (string, error) {
	// Leer el template de ficha de venta existente
	htmlTemplate, err := tm.readTemplateFile("sale_sheet.html")
	if err != nil {
		return "", err
	}

	commonCSS, err := tm.readCSSFile("styles/common.css")
	if err != nil {
		return "", err
	}

	// Crear el HTML base con todos los estilos
	finalHTML := tm.embedCSSInHTML(htmlTemplate, commonCSS, []string{"styles/common.css"})

	// Extraer el head completo con estilos de la primera página
	headStart := strings.Index(finalHTML, "<head>")
	headEnd := strings.Index(finalHTML, "</head>")

	if headStart == -1 || headEnd == -1 {
		return "", fmt.Errorf("no se pudo extraer el head del template")
	}

	headContent := finalHTML[headStart : headEnd+7] // +7 para incluir </head>

	// Agregar estilos adicionales para saltos de página
	headContent = strings.ReplaceAll(headContent, "</head>", `
		<style>
			.page-break { page-break-after: always; }
			.page-break:last-child { page-break-after: avoid; }
			/* Asegurar que cada sheet-box ocupe una página completa */
			.sheet-box { 
				page-break-inside: avoid; 
				min-height: calc(100vh - 40px); 
			}
		</style>
	</head>`)

	// Comenzar el HTML combinado
	combinedHTML := `<!DOCTYPE html>
<html lang="es">` + headContent + `
<body>`

	// Generar el contenido de cada venta
	for i, sale := range data.Sales {
		// Convertir SaleEntry a SaleSheetData
		saleData := SaleSheetData{
			ClientName:     sale.ClientName,
			ClientLastname: sale.ClientLastname,
			ClientInitials: sale.ClientInitials,
			ClientDni:      sale.ClientDni,
			ClientEmail:    sale.ClientEmail,
			ClientPhone:    sale.ClientPhone,
			SaleDate:       sale.SaleDate,
			ProductDesc:    sale.ProductDesc,
			NumQuotas:      sale.NumQuotas,
			QuotaPrice:     sale.QuotaPrice,
			Quotas:         sale.Quotas,
		}

		// Ejecutar el template para esta venta
		pageHTML, err := tm.executeTemplate(fmt.Sprintf("sale_sheet_%d", i), finalHTML, saleData)
		if err != nil {
			return "", err
		}

		// Extraer solo el contenido del div.sheet-box
		bodyStart := strings.Index(pageHTML, "<body>")
		bodyEnd := strings.Index(pageHTML, "</body>")

		if bodyStart != -1 && bodyEnd != -1 {
			bodyContent := pageHTML[bodyStart+6 : bodyEnd]

			// Agregar clase page-break al sheet-box
			bodyContent = strings.ReplaceAll(bodyContent, `<div class="sheet-box"`, `<div class="sheet-box page-break"`)

			combinedHTML += bodyContent
		}
	}

	combinedHTML += `</body></html>`

	return combinedHTML, nil
}

// readTemplateFile lee un archivo de template HTML
func (tm *TemplateManager) readTemplateFile(filename string) (string, error) {
	if tm.useEmbed {
		filePath := fmt.Sprintf("templates/%s", filename)
		log.Printf("Reading embedded template file: %s", filePath)
		content, err := templateFiles.ReadFile(filePath)
		if err != nil {
			return "", fmt.Errorf("error reading embedded template file %s: %w", filePath, err)
		}
		return string(content), nil
	}

	// Fallback a archivos del sistema
	filePath := filepath.Join(tm.templatesDir, filename)
	log.Printf("Reading template file: %s", filePath)
	content, err := os.ReadFile(filePath)
	if err != nil {
		return "", fmt.Errorf("error reading template file %s: %w", filePath, err)
	}
	return string(content), nil
}

// readCSSFile lee un archivo CSS
func (tm *TemplateManager) readCSSFile(filename string) (string, error) {
	if tm.useEmbed {
		filePath := fmt.Sprintf("templates/%s", filename)
		log.Printf("Reading embedded CSS file: %s", filePath)
		content, err := templateFiles.ReadFile(filePath)
		if err != nil {
			return "", fmt.Errorf("error reading embedded CSS file %s: %w", filePath, err)
		}
		return string(content), nil
	}

	// Fallback a archivos del sistema
	filePath := filepath.Join(tm.templatesDir, filename)
	log.Printf("Reading CSS file: %s", filePath)
	content, err := os.ReadFile(filePath)
	if err != nil {
		return "", fmt.Errorf("error reading CSS file %s: %w", filePath, err)
	}
	return string(content), nil
}

// embedCSSInHTML embebe el CSS en el HTML reemplazando los links externos
func (tm *TemplateManager) embedCSSInHTML(htmlContent, cssContent string, cssFiles []string) string {
	// Reemplazar los links de CSS externos con estilos embebidos
	for _, cssFile := range cssFiles {
		linkTag := fmt.Sprintf(`<link rel="stylesheet" href="%s">`, cssFile)
		htmlContent = strings.ReplaceAll(htmlContent, linkTag, "")
	}

	// Insertar el CSS en el head
	cssStyle := fmt.Sprintf("<style>\n%s\n</style>", cssContent)
	htmlContent = strings.ReplaceAll(htmlContent,
		"</head>", cssStyle+"\n</head>")

	return htmlContent
}

// executeTemplate ejecuta un template con los datos proporcionados
func (tm *TemplateManager) executeTemplate(name, tmplStr string, data interface{}) (string, error) {
	t, err := template.New(name).Parse(tmplStr)
	if err != nil {
		return "", fmt.Errorf("error parsing template %s: %w", name, err)
	}

	var buf bytes.Buffer
	if err := t.Execute(&buf, data); err != nil {
		return "", fmt.Errorf("error executing template %s: %w", name, err)
	}

	return buf.String(), nil
}
