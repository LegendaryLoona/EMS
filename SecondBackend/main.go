package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq" // import the PostgreSQL driver
)

var db *sql.DB

func init() {
	// Database connection string
	connStr := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_NAME"),
	)

	var errDb error
	db, errDb = sql.Open("postgres", connStr)
	if errDb != nil {
		log.Fatal(errDb)
	}

	err := db.Ping()
	if err != nil {
		log.Fatal(err)
	}
}

// Struct to represent the employee profile data
type EmployeeProfile struct {
	EmployeeID  string  `json:"employee_id"`
	FirstName   string  `json:"first_name"`
	LastName    string  `json:"last_name"`
	Gender      string  `json:"gender"`
	DateOfBirth string  `json:"date_of_birth"`
	Address     string  `json:"address"`
	HireDate    string  `json:"hire_date"`
	Manager     *string `json:"manager"`
	Position    string  `json:"position"`
	Salary      float64 `json:"salary"`
	Department  *string `json:"department"`
	IsActive    bool    `json:"is_active"`
}

func getEmployeeProfile(c *gin.Context) {
	// Assume the user ID is passed in the Authorization header or as a query parameter
	// Example: "Authorization: Bearer <token>"
	userID := c.DefaultQuery("user_id", "") // Just for simplicity, using a query parameter (replace with actual logic)

	// Validate user ID (in production, you would get this from the token/session)
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
		return
	}

	// Query the employee profile from the database based on the user ID
	var employee EmployeeProfile

	// Assuming the employee table has a foreign key to user, e.g., user_id
	query := `
		SELECT employee_id, first_name, last_name, gender, date_of_birth, address, hire_date, 
		       manager, position, salary, department, is_active
		FROM employee
		WHERE user_id = $1
	`
	row := db.QueryRow(query, userID)

	err := row.Scan(&employee.EmployeeID, &employee.FirstName, &employee.LastName, &employee.Gender,
		&employee.DateOfBirth, &employee.Address, &employee.HireDate, &employee.Manager,
		&employee.Position, &employee.Salary, &employee.Department, &employee.IsActive)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Employee not found"})
		} else {
			log.Printf("Error fetching employee data: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		}
		return
	}

	// Return the employee profile as JSON
	c.JSON(http.StatusOK, employee)
}

func main() {
	r := gin.Default()

	// CORS middleware setup
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"}, // Allow all origins for testing
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// Routes
	r.GET("/", func(c *gin.Context) {
		c.String(200, "Hello from Go + Gin + Render!")
	})

	r.GET("/profile", getEmployeeProfile) // Get profile for logged-in user

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // fallback for local dev
	}

	// Run the server
	r.Run(":" + port)
}
