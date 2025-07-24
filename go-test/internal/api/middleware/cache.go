package middleware

import (
	"bytes"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/patrickmn/go-cache"
)

var (
	pageCache = cache.New(5*time.Minute, 10*time.Minute)
)

type cachedWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

func (w *cachedWriter) Write(b []byte) (int, error) {
	w.body.Write(b)
	return w.ResponseWriter.Write(b)
}

func Cache() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.Method != "GET" {
			c.Next()
			return
		}

		key := c.Request.URL.String()
		if response, found := pageCache.Get(key); found {
			c.Data(200, "application/json", response.([]byte))
			c.Abort()
			return
		}

		writer := &cachedWriter{body: &bytes.Buffer{}, ResponseWriter: c.Writer}
		c.Writer = writer
		c.Next()

		if c.Writer.Status() == 200 {
			pageCache.Set(key, writer.body.Bytes(), cache.DefaultExpiration)
		}
	}
}
