// main.go
package main

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	r.GET("/", func(c *gin.Context) {
		c.String(200, "Hello from Go + Gin + Render!")
	})
	r.GET("/profile", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"first_name": "John",
			"last_name":  "Doe",
			"email":      "john.doe@example.com",
			"position":   "Mobile Developer",
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // fallback for local dev
	}

	r.Run(":" + port)
}
