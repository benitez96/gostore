package main

import (
	"bufio"
	"context"
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"syscall"

	"github.com/pressly/goose/v3"
	"golang.org/x/term"

	_ "github.com/mattn/go-sqlite3"

	"github.com/benitez96/gostore/internal/dto"
	"github.com/benitez96/gostore/internal/repositories/db/sqlc"
	userRepository "github.com/benitez96/gostore/internal/repositories/user"
	"github.com/benitez96/gostore/internal/services/jwt"
	userSvc "github.com/benitez96/gostore/internal/services/user"
	"github.com/benitez96/gostore/internal/shared/constants"
)

const (
	databasePath      = "data/database.db"
	migrationsPath    = "internal/repositories/db/migrations"
	minPasswordLength = 6
)

func main() {
	fmt.Println("🚀 Inicializando GoStore...")
	fmt.Println("===============================")

	// 1. Crear directorio de datos si no existe
	if err := createDataDirectory(); err != nil {
		fmt.Printf("❌ Error creando directorio de datos: %v\n", err)
		os.Exit(1)
	}

	// 2. Conectar a la base de datos
	db, err := connectDatabase()
	if err != nil {
		fmt.Printf("❌ Error conectando a la base de datos: %v\n", err)
		os.Exit(1)
	}
	defer db.Close()

	// 3. Ejecutar migraciones
	if err := runMigrations(db); err != nil {
		fmt.Printf("❌ Error ejecutando migraciones: %v\n", err)
		os.Exit(1)
	}

	// 4. Crear superusuario
	if err := createSuperUser(db); err != nil {
		fmt.Printf("❌ Error creando superusuario: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("\n✅ Inicialización completada exitosamente!")
	fmt.Println("Ahora puedes ejecutar el servidor con: ./main")
}

// createDataDirectory crea el directorio 'data' si no existe
func createDataDirectory() error {
	dataDir := filepath.Dir(databasePath)
	if _, err := os.Stat(dataDir); os.IsNotExist(err) {
		fmt.Printf("📁 Creando directorio de datos: %s\n", dataDir)
		return os.MkdirAll(dataDir, 0755)
	}
	fmt.Printf("📁 Directorio de datos ya existe: %s\n", dataDir)
	return nil
}

// connectDatabase conecta a la base de datos SQLite
func connectDatabase() (*sql.DB, error) {
	fmt.Printf("🔗 Conectando a la base de datos: %s\n", databasePath)
	db, err := sql.Open("sqlite3", databasePath+"?_foreign_keys=on")
	if err != nil {
		return nil, fmt.Errorf("error abriendo base de datos: %w", err)
	}

	// Verificar conexión
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("error verificando conexión: %w", err)
	}

	fmt.Println("✅ Conexión a la base de datos establecida")
	return db, nil
}

// runMigrations ejecuta todas las migraciones usando goose
func runMigrations(db *sql.DB) error {
	fmt.Println("\n🔄 Ejecutando migraciones...")

	// Configurar goose
	if err := goose.SetDialect("sqlite3"); err != nil {
		return fmt.Errorf("error configurando goose: %w", err)
	}

	// Ejecutar migraciones
	if err := goose.Up(db, migrationsPath); err != nil {
		return fmt.Errorf("error ejecutando migraciones: %w", err)
	}

	fmt.Println("✅ Migraciones ejecutadas correctamente")
	return nil
}

// createSuperUser solicita datos al usuario y crea el primer superusuario
func createSuperUser(db *sql.DB) error {
	fmt.Println("\n👤 Configuración del Superusuario")
	fmt.Println("==================================")

	// Verificar si ya existe algún usuario
	if exists, err := checkUsersExist(db); err != nil {
		return fmt.Errorf("error verificando usuarios existentes: %w", err)
	} else if exists {
		fmt.Println("⚠️  Ya existen usuarios en la base de datos")
		if !askYesNo("¿Deseas crear un nuevo superusuario de todas formas?") {
			fmt.Println("✅ Inicialización completada sin crear nuevo usuario")
			return nil
		}
	}

	// Solicitar datos del usuario
	userData, err := getUserInput()
	if err != nil {
		return fmt.Errorf("error obteniendo datos del usuario: %w", err)
	}

	// Crear el usuario siguiendo el patrón del main del proyecto
	ctx := context.Background()

	// Inicializar JWT service con una key temporal
	jwtService := jwt.NewService("temp-key-for-init")

	// Crear repositorio y servicio de usuario
	userRepo := userRepository.Repository{
		Queries: sqlc.New(db),
	}

	userService := userSvc.Service{
		Repo:       &userRepo,
		JWTService: jwtService,
	}

	createReq := &dto.CreateUserRequest{
		Username:    userData.Username,
		Password:    userData.Password,
		FirstName:   userData.FirstName,
		LastName:    userData.LastName,
		Permissions: constants.PermissionAdmin, // Todos los permisos
	}

	createdUser, err := userService.CreateUser(ctx, createReq)
	if err != nil {
		return fmt.Errorf("error creando superusuario: %w", err)
	}

	fmt.Println("\n✅ Superusuario creado exitosamente!")
	fmt.Printf("   👤 Usuario: %s\n", createdUser.Username)
	fmt.Printf("   📛 Nombre: %s %s\n", createdUser.FirstName, createdUser.LastName)
	fmt.Printf("   🔑 Permisos: %s\n", strings.Join(constants.GetPermissionNames(createdUser.Permissions), ", "))

	return nil
}

// checkUsersExist verifica si ya existen usuarios en la base de datos
func checkUsersExist(db *sql.DB) (bool, error) {
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM users").Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// UserData estructura para almacenar los datos del usuario
type UserData struct {
	Username  string
	Password  string
	FirstName string
	LastName  string
}

// getUserInput solicita y recopila todos los datos del usuario
func getUserInput() (*UserData, error) {
	scanner := bufio.NewScanner(os.Stdin)

	// Username
	username, err := readInput(scanner, "Ingresa el nombre de usuario")
	if err != nil {
		return nil, err
	}

	// Password (oculto)
	password, err := readPassword("Ingresa la contraseña (mínimo 6 caracteres)")
	if err != nil {
		return nil, err
	}

	// Confirmar password
	confirmPassword, err := readPassword("Confirma la contraseña")
	if err != nil {
		return nil, err
	}

	if password != confirmPassword {
		return nil, fmt.Errorf("las contraseñas no coinciden")
	}

	if len(password) < minPasswordLength {
		return nil, fmt.Errorf("la contraseña debe tener al menos %d caracteres", minPasswordLength)
	}

	// Nombre
	firstName, err := readInput(scanner, "Ingresa el nombre")
	if err != nil {
		return nil, err
	}

	// Apellido
	lastName, err := readInput(scanner, "Ingresa el apellido")
	if err != nil {
		return nil, err
	}

	return &UserData{
		Username:  strings.TrimSpace(strings.ToLower(username)),
		Password:  password,
		FirstName: strings.TrimSpace(firstName),
		LastName:  strings.TrimSpace(lastName),
	}, nil
}

// readInput lee una línea de texto del usuario
func readInput(scanner *bufio.Scanner, prompt string) (string, error) {
	for {
		fmt.Printf("%s: ", prompt)
		if !scanner.Scan() {
			if err := scanner.Err(); err != nil {
				return "", fmt.Errorf("error leyendo input: %w", err)
			}
			return "", fmt.Errorf("EOF inesperado")
		}

		input := strings.TrimSpace(scanner.Text())
		if input == "" {
			fmt.Println("⚠️  Este campo no puede estar vacío. Intenta de nuevo.")
			continue
		}

		return input, nil
	}
}

// readPassword lee una contraseña de forma oculta
func readPassword(prompt string) (string, error) {
	fmt.Printf("%s: ", prompt)

	// Leer password sin mostrar en pantalla
	passwordBytes, err := term.ReadPassword(int(syscall.Stdin))
	fmt.Println() // Nueva línea después de la entrada oculta

	if err != nil {
		return "", fmt.Errorf("error leyendo contraseña: %w", err)
	}

	password := strings.TrimSpace(string(passwordBytes))
	if password == "" {
		return "", fmt.Errorf("la contraseña no puede estar vacía")
	}

	return password, nil
}

// askYesNo hace una pregunta yes/no al usuario
func askYesNo(question string) bool {
	scanner := bufio.NewScanner(os.Stdin)

	for {
		fmt.Printf("%s (s/n): ", question)
		if !scanner.Scan() {
			return false
		}

		answer := strings.ToLower(strings.TrimSpace(scanner.Text()))
		switch answer {
		case "s", "si", "sí", "y", "yes":
			return true
		case "n", "no":
			return false
		default:
			fmt.Println("⚠️  Por favor responde 's' o 'n'")
		}
	}
}
