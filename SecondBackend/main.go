package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

var db *sql.DB

func init() {
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

	query := `
    SELECT employee_id, first_name, last_name, gender, date_of_birth, address, hire_date, 
           manager_id, position, salary, department_id, is_active
    FROM "Backend_employee"
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

	if employee.Manager != nil {
		var managerFirstName, managerLastName string
		managerQuery := `
			SELECT first_name, last_name 
			FROM "Backend_employee"
			WHERE employee_id = $1
		`

		err = db.QueryRow(managerQuery, *employee.Manager).Scan(&managerFirstName, &managerLastName)
		if err != nil {
			log.Printf("Error fetching manager data: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching manager data"})
			return
		}
		managerFullName := managerFirstName + " " + managerLastName
		employee.Manager = &managerFullName
	}
	if employee.Department != nil {
		var departmentName string
		departmentQuery := `
			SELECT name
			FROM "Backend_department"
			WHERE id = $1
		`

		err = db.QueryRow(departmentQuery, *employee.Department).Scan(&departmentName)
		if err != nil {
			log.Printf("Error fetching department data: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching department data"})
			return
		}
		// Set the manager's name in the employee struct
		employee.Department = &departmentName
	}
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
	tableName := c.Param("tableName")

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

func listTableContents(c *gin.Context) {
	tableName := c.Param("tableName")

	columns, err := getColumnNamesFromDb(tableName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	query := fmt.Sprintf("SELECT * FROM %s", tableName)

	rows, err := db.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	args := make([]interface{}, len(columns))
	values := make([]interface{}, len(columns))
	for i := range values {
		values[i] = &args[i]
	}

	var results []map[string]interface{}
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

func getColumnNamesFromDb(tableName string) ([]string, error) {
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

func fetchTasks(c *gin.Context) {
	userID := c.DefaultQuery("user_id", "")

	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
		return
	}
	var employeeID int
	err := db.QueryRow(`SELECT id FROM "Backend_employee" WHERE user_id = $1`, userID).Scan(&employeeID)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Employee not found for user"})
		} else {
			log.Printf("Error fetching employee ID: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		}
		return
	}
	rows, err := db.Query(`
		SELECT id, created_at, updated_at, assigned_by_id, assigned_to_id, deadline, title, description, status, rejection_comment
		FROM "Backend_task"
		WHERE assigned_to_id = $1
	`, employeeID)
	if err != nil {
		log.Printf("Error fetching tasks: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching tasks"})
		return
	}
	defer rows.Close()

	// Step 3: Build tasks list
	tasks := []map[string]interface{}{}

	for rows.Next() {
		var (
			id, assignedByID, assignedToID               int
			createdAt, updatedAt, deadline               string
			title, description, status, rejectionComment sql.NullString
		)

		err := rows.Scan(&id, &createdAt, &updatedAt, &assignedByID, &assignedToID, &deadline, &title, &description, &status, &rejectionComment)
		if err != nil {
			log.Printf("Error scanning task row: %v", err)
			continue
		}

		task := map[string]interface{}{
			"id":                id,
			"created_at":        createdAt,
			"updated_at":        updatedAt,
			"assigned_by_id":    assignedByID,
			"assigned_to_id":    assignedToID,
			"deadline":          deadline,
			"title":             title.String,
			"description":       description.String,
			"status":            status.String,
			"rejection_comment": rejectionComment.String,
		}

		tasks = append(tasks, task)
	}
	fmt.Println(tasks)
	log.Println(tasks)

	c.JSON(http.StatusOK, tasks)
}

func submitTask(c *gin.Context) {
	taskID := c.DefaultQuery("task_id", "")
	if taskID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Task ID is required"})
		return
	}

	// Update the task status to 'submitted'
	query := `
		UPDATE "Backend_task"
		SET status = 'submitted'
		WHERE id = $1
	`

	result, err := db.Exec(query, taskID)
	if err != nil {
		log.Printf("Error updating task: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to submit task"})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		log.Printf("Error getting rows affected: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to confirm task submission"})
		return
	}

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Task submitted successfully"})
}

func main() {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	r.GET("/", func(c *gin.Context) {
		c.String(200, "Hello from Go + Gin + Render!")
	})

	r.GET("/profile", getEmployeeProfile)

	r.GET("/db", listTables)

	r.GET("/list-columns/:tableName", getColumnNames)

	r.GET("/list-table/:tableName", listTableContents)

	r.GET("/tasks", fetchTasks)

	r.GET("/task_submit", submitTask)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	r.Run(":" + port)
}
