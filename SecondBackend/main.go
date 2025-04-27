package main

import (
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// Add CORS config
	r.Use(cors.Default())

	r.GET("/profile", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"first_name": "John",
			"last_name":  "Doe",
			"email":      "john@example.com",
			"position":   "Mobile Developer",
		})
	})

	port := "8080" // or get from environment on Render
	r.Run(":" + port)
}
