package billing

import (
	"database/sql"
	"net/http"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// QuotaMiddleware enforces billing limits based on the user's plan.
func QuotaMiddleware(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// If db is not configured, we're running without billing constraints
		if db == nil {
			return c.Next()
		}

		userID, ok := c.Locals("user_id").(string)
		if !ok || userID == "" {
			// Unauthenticated, might be allowed by some routes, but let's assume if this middleware is applied, we need auth.
			// However, local dev without auth might hit this, handled above if db == nil.
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
		}

		plan, ok := c.Locals("plan").(string)
		if !ok || plan == "" {
			plan = "free"
		}

		// Pro plan has unlimited scans
		if plan == "pro" {
			return proceedAndLog(c, db, userID, "scan")
		}

		// Free plan: Check rolling 30-day usage
		thirtyDaysAgo := time.Now().AddDate(0, 0, -30)
		var count int
		err := db.QueryRow(
			`SELECT COUNT(*) FROM usage_logs WHERE user_id = $1 AND feature = $2 AND created_at >= $3`,
			userID, "scan", thirtyDaysAgo,
		).Scan(&count)

		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to check quota"})
		}

		if count >= 5 {
			return c.Status(fiber.StatusPaymentRequired).JSON(fiber.Map{
				"error":   "Free plan limit reached (5 scans). Upgrade to Pro for unlimited scans.",
				"upgrade": "/billing",
			})
		}

		return proceedAndLog(c, db, userID, "scan")
	}
}

// proceedAndLog calls the next handler and if successful, logs the usage.
func proceedAndLog(c *fiber.Ctx, db *sql.DB, userID string, feature string) error {
	// Let the request proceed
	err := c.Next()

	// Only log usage if the request was successful
	if err == nil && c.Response().StatusCode() < http.StatusBadRequest {
		id := uuid.New().String()
		_, logErr := db.Exec(
			`INSERT INTO usage_logs (id, user_id, feature, created_at) VALUES ($1, $2, $3, $4)`,
			id, userID, feature, time.Now(),
		)
		if logErr != nil {
			// We just log it or ignore, since the main request succeeded
			// Ideally we'd inject logger, but this is fire-and-forget
		}
	}

	return err
}
