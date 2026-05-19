package auth

import (
	"database/sql"

	"github.com/ObeeJ/corvus/internal/db"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// Handlers handles signup and login routes.
type Handlers struct {
	client *db.Client
}

// NewHandlers creates auth route handlers.
func NewHandlers(client *db.Client) *Handlers {
	return &Handlers{client: client}
}

// AuthRequest represents a login or signup payload.
type AuthRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Signup creates a new user.
func (h *Handlers) Signup(c *fiber.Ctx) error {
	var req AuthRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request"})
	}

	if req.Email == "" || len(req.Password) < 8 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid email or short password"})
	}

	hash, err := HashPassword(req.Password)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "server error"})
	}

	userID := uuid.New().String()
	_, err = h.client.DB.Exec(
		"INSERT INTO users (id, email, password_hash, plan) VALUES ($1, $2, $3, 'free')",
		userID, req.Email, hash,
	)
	if err != nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "email already exists"})
	}

	token, err := GenerateToken(userID, "free")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to generate token"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"token": token,
		"user": fiber.Map{
			"id":    userID,
			"email": req.Email,
			"plan":  "free",
		},
	})
}

// Login authenticates a user.
func (h *Handlers) Login(c *fiber.Ctx) error {
	var req AuthRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request"})
	}

	var userID, hash, plan string
	err := h.client.DB.QueryRow(
		"SELECT id, password_hash, plan FROM users WHERE email = $1", req.Email,
	).Scan(&userID, &hash, &plan)

	if err == sql.ErrNoRows || !CheckPasswordHash(req.Password, hash) {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid credentials"})
	} else if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "database error"})
	}

	token, err := GenerateToken(userID, plan)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to generate token"})
	}

	return c.JSON(fiber.Map{
		"token": token,
		"user": fiber.Map{
			"id":    userID,
			"email": req.Email,
			"plan":  plan,
		},
	})
}

// Me returns the current authenticated user's fresh profile.
// GET /api/v1/auth/me
func (h *Handlers) Me(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(string)
	if !ok || userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
	}

	var email, plan string
	err := h.client.DB.QueryRow(
		"SELECT email, plan FROM users WHERE id = $1", userID,
	).Scan(&email, &plan)
	if err == sql.ErrNoRows {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "user not found"})
	} else if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "database error"})
	}

	return c.JSON(fiber.Map{
		"id":    userID,
		"email": email,
		"plan":  plan,
	})
}

// Refresh issues a new JWT using the current valid token.
// The frontend calls this before expiry to stay logged in silently.
// POST /api/v1/auth/refresh
func (h *Handlers) Refresh(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(string)
	if !ok || userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
	}

	// Always fetch fresh plan from DB — catches upgrades/downgrades.
	var email, plan string
	err := h.client.DB.QueryRow(
		"SELECT email, plan FROM users WHERE id = $1", userID,
	).Scan(&email, &plan)
	if err == sql.ErrNoRows {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "user not found"})
	} else if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "database error"})
	}

	token, err := GenerateToken(userID, plan)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to generate token"})
	}

	return c.JSON(fiber.Map{
		"token": token,
		"user":  fiber.Map{"id": userID, "email": email, "plan": plan},
	})
}
