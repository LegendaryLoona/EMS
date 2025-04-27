package main

import (
	"fmt" // This is necessary for logging
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// CORS Middleware
	r.Use(cors.Default())

	r.GET("/profile", func(c *gin.Context) {
		// Sample profile data
		profile := gin.H{
			"first_name": "John",
			"last_name":  "Doe",
			"email":      "john@example.com",
			"position":   "Mobile Developer",
		}

		// Log the profile data being returned
		fmt.Println("Returning profile:", profile)

		// Respond with JSON
		c.JSON(http.StatusOK, profile)
	})

	port := "8080"    // Set the desired port
	r.Run(":" + port) // Run the server
}
