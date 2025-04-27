// main.go
package main

import (
    "github.com/gin-gonic/gin"
    "os"
)

func main() {
    r := gin.Default()
    r.GET("/", func(c *gin.Context) {
        c.String(200, "Hello from Go + Gin + Render!")
    })

    port := os.Getenv("PORT")
    if port == "" {
        port = "8080" // fallback for local dev
    }

    r.Run(":" + port)
}
