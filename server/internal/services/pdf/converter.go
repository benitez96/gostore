package pdf

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"time"
)

// PDFConverter maneja la conversión de HTML a PDF
type PDFConverter struct {
	tempDir string
	config  ReportConfig
}

// NewPDFConverter crea una nueva instancia del conversor de PDF
func NewPDFConverter(tempDir string, config ReportConfig) *PDFConverter {
	return &PDFConverter{
		tempDir: tempDir,
		config:  config,
	}
}

// ConvertHTMLToPDF convierte contenido HTML a PDF usando wkhtmltopdf en contenedor
func (pc *PDFConverter) ConvertHTMLToPDF(htmlContent string) ([]byte, error) {
	// Crear archivo temporal para el HTML
	htmlFile := filepath.Join(pc.tempDir, fmt.Sprintf("report_%d.html", time.Now().UnixNano()))
	if err := os.WriteFile(htmlFile, []byte(htmlContent), 0644); err != nil {
		return nil, fmt.Errorf("error writing HTML file: %w", err)
	}
	defer os.Remove(htmlFile)

	// Crear archivo temporal para el PDF
	pdfFile := filepath.Join(pc.tempDir, fmt.Sprintf("report_%d.pdf", time.Now().UnixNano()))
	defer os.Remove(pdfFile)

	// Construir comando wkhtmltopdf
	cmd := pc.buildWKHTMLToPDFCommand(htmlFile, pdfFile)

	// Ejecutar el comando
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

// buildWKHTMLToPDFCommand construye el comando para ejecutar wkhtmltopdf
func (pc *PDFConverter) buildWKHTMLToPDFCommand(htmlFile, pdfFile string) *exec.Cmd {
	args := []string{
		"run", "--rm",
		"-v", fmt.Sprintf("%s:/tmp", pc.tempDir), // Montar /tmp del host
		"--user", "1000:1000", // Usuario sin privilegios
		"--network", "none", // Sin acceso a red
		"--read-only",                         // Sistema de archivos solo lectura
		"--security-opt", "no-new-privileges", // No permitir escalación de privilegios
		"--cap-drop", "ALL", // Remover todas las capabilities
		"gostore-wkhtmltopdf", // Nombre de la imagen
		"wkhtmltopdf",
	}

	// Agregar opciones de configuración
	args = append(args, pc.buildWKHTMLToPDFOptions()...)

	// Agregar archivos de entrada y salida
	args = append(args,
		"/tmp/"+filepath.Base(htmlFile), // Ruta dentro del contenedor
		"/tmp/"+filepath.Base(pdfFile))  // Ruta dentro del contenedor

	return exec.Command("docker", args...)
}

// buildWKHTMLToPDFOptions construye las opciones de wkhtmltopdf basadas en la configuración
func (pc *PDFConverter) buildWKHTMLToPDFOptions() []string {
	options := []string{
		"--page-size", pc.config.PageSize,
		"--margin-top", pc.config.MarginTop,
		"--margin-right", pc.config.MarginRight,
		"--margin-bottom", pc.config.MarginBottom,
		"--margin-left", pc.config.MarginLeft,
		"--disable-local-file-access", // Deshabilitar acceso a archivos locales
	}

	if pc.config.DisableJS {
		options = append(options, "--disable-javascript")
	}

	if pc.config.DisableImages {
		options = append(options, "--disable-images")
	}

	return options
}
