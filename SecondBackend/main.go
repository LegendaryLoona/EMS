package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	r.GET("/profile", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"first_name": "John",
			"last_name":  "Doe",
			"email":      "john.doe@example.com",
			"position":   "Mobile Developer",
		})
	})

	r.Run()
}
