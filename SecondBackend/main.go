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
	userID := c.DefaultQuery("user_id", "")

	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
		return
	}

	var employee EmployeeProfile

	// Query to get employee details
	query := `
    SELECT employee_id, first_name, last_name, gender, date_of_birth, address, hire_date, 
           manager_id, position, salary, department, is_active
    FROM "Backend_employee"
    WHERE user_id = $1
    `
	row := db.QueryRow(query, userID)

	// Scan the result into the employee struct
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

	// If the employee has a manager, query for the manager's name
	if employee.Manager != nil {
		// Query to get the manager's name (based on manager_id)
		var managerName string
		managerQuery := `
			SELECT first_name, last_name 
			FROM "Backend_employee"
			WHERE employee_id = $1
		`

		err = db.QueryRow(managerQuery, *employee.Manager).Scan(&managerName)
		if err != nil {
			log.Printf("Error fetching manager data: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching manager data"})
			return
		}
		// Set the manager's name in the employee struct
		employee.Manager = &managerName
	}

	// Return the employee profile with the manager's name
	c.JSON(http.StatusOK, employee)
}

func listTables(c *gin.Context) {
	query := "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"

	rows, err := db.Query(query)
	if err != nil {
		log.Fatal("Error executing query:", err)
	}
	defer rows.Close()

	var tableName string
	fmt.Println("Tables in the database:")
	for rows.Next() {
		if err := rows.Scan(&tableName); err != nil {
			log.Fatal("Error scanning rows:", err)
		}
		fmt.Println(tableName)
	}
}

func getColumnNames(c *gin.Context) {
	// Get the table name from the URL parameter
	tableName := c.Param("tableName")

	// Query to get column names from the 'information_schema.columns'
	query := `
		SELECT column_name
		FROM information_schema.columns
		WHERE table_name = $1
	`

	rows, err := db.Query(query, tableName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var columns []string
	for rows.Next() {
		var columnName string
		err := rows.Scan(&columnName)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		columns = append(columns, columnName)
	}

	if err := rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"columns": columns})
}

// Function to list all rows from a table using dynamic column names
func listTableContents(c *gin.Context) {
	// Get the table name from the URL parameter
	tableName := c.Param("tableName")

	// Get the column names dynamically
	columns, err := getColumnNamesFromDb(tableName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Create a dynamic query with the column names
	query := fmt.Sprintf("SELECT * FROM %s", tableName)

	rows, err := db.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	// Dynamically create placeholders for the row data
	args := make([]interface{}, len(columns))
	values := make([]interface{}, len(columns))
	for i := range values {
		values[i] = &args[i]
	}

	var results []map[string]interface{}
	// Iterate through the rows
	for rows.Next() {
		err := rows.Scan(values...)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		rowData := make(map[string]interface{})
		for i, column := range columns {
			rowData[column] = args[i]
		}
		results = append(results, rowData)
	}

	if err := rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"rows": results})
}

// Helper function to get column names from the database
func getColumnNamesFromDb(tableName string) ([]string, error) {
	// Query to get column names from the 'information_schema.columns'
	query := `
		SELECT column_name
		FROM information_schema.columns
		WHERE table_name = $1
	`

	rows, err := db.Query(query, tableName)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var columns []string
	for rows.Next() {
		var columnName string
		err := rows.Scan(&columnName)
		if err != nil {
			return nil, err
		}
		columns = append(columns, columnName)
	}

	return columns, rows.Err()
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

	r.GET("/db", listTables)

	r.GET("/list-columns/:tableName", getColumnNames)

	// Route to get all rows for a given table
	r.GET("/list-table/:tableName", listTableContents)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // fallback for local dev
	}

	// Run the server
	r.Run(":" + port)
}
