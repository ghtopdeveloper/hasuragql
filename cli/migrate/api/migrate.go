package api

import (
	"net/http"
	"net/url"
	"runtime"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/hasura/graphql-engine/cli/migrate"
	"github.com/hasura/graphql-engine/cli/migrate/cmd"
)

const (
	DataAPIError  = "Data Error: "
	MigrationMode = "migration_mode"
)

type Response struct {
	Code       string `json:"code,omitempty"`
	Message    string `json:"message,omitempty"`
	Name       string `json:"name,omitempty"`
	StatusCode int    `json:"-"`
}

type Request struct {
	Name string        `json:"name"`
	Up   []interface{} `json:"up"`
}

func MigrateAPI(c *gin.Context) {
	// Get File url
	sourcePtr, ok := c.Get("filedir")
	if !ok {
		return
	}

	// Get hasuradb url
	databasePtr, ok := c.Get("dbpath")
	if !ok {
		return
	}

	// Convert to url.URL
	databaseURL := databasePtr.(url.URL)

	sourceURL, err := url.Parse(sourcePtr.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, &Response{Code: "internal_error", Message: err.Error()})
		return
	}

	// Create new migrate
	t, err := migrate.New(sourcePtr.(string), databaseURL.String(), false)
	if err != nil {
		if strings.HasPrefix(err.Error(), DataAPIError) {
			c.JSON(http.StatusInternalServerError, &Response{Code: "data_api_error", Message: err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, &Response{Code: "internal_error", Message: err.Error()})
		return
	}

	// Switch on request method
	switch c.Request.Method {
	case "POST":
		var request Request

		// Bind Request body to Request struct
		if c.BindJSON(&request) != nil {
			c.JSON(http.StatusInternalServerError, &Response{Code: "internal_error", Message: "Something went wrong"})
			return
		}

		startTime := time.Now()
		// Conver to Millisecond
		timestamp := startTime.UnixNano() / int64(time.Millisecond)
		var dirPtr string
		if runtime.GOOS == "windows" {
			dirPtr = strings.Trim(sourceURL.Path, "/")
		} else {
			dirPtr = "/" + strings.Trim(sourceURL.Path, "/") + "/"
		}

		err = cmd.CreateCmd(dirPtr, timestamp, request.Name, request.Up)
		if err != nil {
			c.JSON(http.StatusInternalServerError, &Response{Code: "create_file_error", Message: err.Error()})
			return
		}

		// Rescan file system
		err = t.SourceReScan()
		if err != nil {
			deleteErr := cmd.DeleteCmd(dirPtr, timestamp)
			if deleteErr != nil {
				c.JSON(http.StatusInternalServerError, &Response{Code: "delete_file_error", Message: deleteErr.Error()})
				return
			}
			c.JSON(http.StatusInternalServerError, &Response{Code: "internal_error", Message: err.Error()})
			return
		}

		if err = t.Migrate(uint64(timestamp), "up"); err != nil {
			deleteErr := cmd.DeleteCmd(dirPtr, timestamp)
			if deleteErr != nil {
				c.JSON(http.StatusInternalServerError, &Response{Code: "delete_file_error", Message: deleteErr.Error()})
				return
			}

			if strings.HasPrefix(err.Error(), DataAPIError) {
				c.JSON(http.StatusBadRequest, &Response{Code: "data_api_error", Message: strings.TrimPrefix(err.Error(), DataAPIError)})
				return
			}

			if err == migrate.ErrNoMigrationMode {
				c.JSON(http.StatusBadRequest, &Response{Code: "migration_mode_disabled", Message: err.Error()})
				return
			}

			c.JSON(http.StatusInternalServerError, &Response{Code: "internal_error", Message: err.Error()})
			return
		}
		c.JSON(http.StatusOK, &Response{Name: request.Name})
	default:
		c.JSON(http.StatusMethodNotAllowed, &gin.H{"message": "Method not allowed"})
	}
}
