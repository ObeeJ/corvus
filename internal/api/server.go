package api

import (
	"fmt"
	"log/slog"
	"os"
	"time"

	"github.com/getsentry/sentry-go"
	sentryfiber "github.com/getsentry/sentry-go/fiber"
	"github.com/ObeeJ/corvus/internal/api/handlers"
	"github.com/ObeeJ/corvus/internal/auth"
	"github.com/ObeeJ/corvus/internal/billing"
	"github.com/ObeeJ/corvus/internal/db"
	"github.com/ObeeJ/corvus/internal/engine"
	"github.com/ObeeJ/corvus/internal/mesh"
	"github.com/ObeeJ/corvus/internal/store"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

// Config holds API server configuration.
type Config struct {
	Port      int
	AuthToken string
}

// Server provides the REST and WebSocket API.
type Server struct {
	app                *fiber.App
	engine             *engine.Engine
	db                 *db.Client
	cfg                Config
	log                *slog.Logger
	scanHandlers       *Handlers
	hostHandlers       *handlers.HostHandlers
	alertHandlers      *handlers.AlertHandlers
	queryHandlers      *handlers.QueryHandlers
	askHandlers        *handlers.AskHandlers
	supplyChainHandlers *handlers.SupplyChainHandlers
	auth               *auth.Handlers
	billing            *billing.Handlers
	mesh               *mesh.Mesh
}

// New creates a new API Server instance.
func New(eng *engine.Engine, storeMgr *store.Manager, dbClient *db.Client, meshNode *mesh.Mesh, cfg Config, log *slog.Logger) *Server {
	// Init Sentry if DSN is configured.
	if dsn := os.Getenv("SENTRY_DSN"); dsn != "" {
		if err := sentry.Init(sentry.ClientOptions{
			Dsn:              dsn,
			TracesSampleRate: 1.0,
			EnableLogs:       true,
			Environment:      os.Getenv("APP_ENV"),
			BeforeSend: func(event *sentry.Event, hint *sentry.EventHint) *sentry.Event {
				// Strip sensitive headers before sending to Sentry.
				if event.Request != nil {
					delete(event.Request.Headers, "Authorization")
					delete(event.Request.Headers, "Cookie")
				}
				return event
			},
		}); err != nil {
			log.Warn("Sentry init failed", "err", err)
		} else {
			log.Info("Sentry error tracking enabled")
		}
	}

	app := fiber.New(fiber.Config{
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	})

	s := &Server{
		app:                 app,
		engine:              eng,
		db:                  dbClient,
		cfg:                 cfg,
		log:                 log,
		scanHandlers:        &Handlers{engine: eng, log: log},
		hostHandlers:        handlers.NewHostHandlers(storeMgr, log),
		alertHandlers:       handlers.NewAlertHandlers(storeMgr, log),
		queryHandlers:       handlers.NewQueryHandlers(storeMgr, log),
		askHandlers:         handlers.NewAskHandlers(storeMgr, log),
		supplyChainHandlers: handlers.NewSupplyChainHandlers(storeMgr, log),
		mesh:                meshNode,
	}

	if dbClient != nil {
		s.auth = auth.NewHandlers(dbClient)
		svc := billing.NewPaystackService(log)
		s.billing = billing.NewHandlers(svc, dbClient.DB, log)
	}

	s.registerMiddleware()
	s.registerRoutes()

	return s
}

// Start begins listening on the configured port.
func (s *Server) Start() error {
	addr := fmt.Sprintf("0.0.0.0:%d", s.cfg.Port)
	s.log.Info("Starting API server", "addr", addr)
	return s.app.Listen(addr)
}

func (s *Server) registerMiddleware() {
	// Sentry must be first to catch all panics and errors.
	if os.Getenv("SENTRY_DSN") != "" {
		s.app.Use(sentryfiber.New(sentryfiber.Options{
			Repanic:         true,
			WaitForDelivery: false,
		}))
		// Capture every request as a Sentry transaction + tag user + report 5xx.
		s.app.Use(func(c *fiber.Ctx) error {
			hub := sentryfiber.GetHubFromContext(c)
			if hub == nil {
				return c.Next()
			}

			// Start a transaction for every request.
			txName := c.Method() + " " + c.Path()
			span := sentry.StartTransaction(c.Context(), txName,
				sentry.WithTransactionSource(sentry.SourceURL),
			)
			span.SetTag("http.method", c.Method())
			span.SetTag("http.url", c.Path())
			defer span.Finish()

			err := c.Next()

			// Tag user after auth middleware has run.
			if uid, ok := c.Locals("user_id").(string); ok && uid != "" {
				hub.Scope().SetUser(sentry.User{ID: uid})
				span.SetTag("user.id", uid)
			}

			status := c.Response().StatusCode()
			span.SetTag("http.status_code", fmt.Sprintf("%d", status))

			// Capture 4xx client errors and all 5xx as Sentry events.
			if status >= 400 {
				hub.WithScope(func(scope *sentry.Scope) {
					scope.SetTag("http.method", c.Method())
					scope.SetTag("http.path", c.Path())
					scope.SetTag("http.status", fmt.Sprintf("%d", status))
					if status >= 500 {
						hub.CaptureMessage(fmt.Sprintf("%s %s → %d", c.Method(), c.Path(), status))
					}
				})
			}

			return err
		})
	}
	// CORS for development — allows the Next.js dev server to call the API.
	s.app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))

	s.app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${latency} ${method} ${path}\n",
	}))

	// Basic rate limiter: 100 requests per minute per IP.
	s.app.Use(limiter.New(limiter.Config{
		Max:        100,
		Expiration: time.Minute,
	}))

	// Use JWT middleware for authenticated routes if DB is configured
	if s.db != nil {
		s.app.Use("/api/v1/scan", auth.Middleware())
		s.app.Use("/api/v1/hosts", auth.Middleware())
		s.app.Use("/api/v1/alerts", auth.Middleware())
		s.app.Use("/api/v1/query", auth.Middleware())
		
		// Apply quota middleware to scan endpoint
		s.app.Use("/api/v1/scan", billing.QuotaMiddleware(s.db.DB))
	}
}

func (s *Server) registerRoutes() {
	s.app.Get("/healthz", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})
	s.app.Get("/readyz", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	v1 := s.app.Group("/api/v1")

	// Auth routes (always registered; return 503 if DB not configured)
	v1.Post("/auth/signup", func(c *fiber.Ctx) error {
		if s.auth == nil {
			return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{"error": "authentication not configured (DATABASE_URL not set)"})
		}
		return s.auth.Signup(c)
	})
	v1.Post("/auth/login", func(c *fiber.Ctx) error {
		if s.auth == nil {
			return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{"error": "authentication not configured (DATABASE_URL not set)"})
		}
		return s.auth.Login(c)
	})
	v1.Get("/auth/me", auth.Middleware(), func(c *fiber.Ctx) error {
		if s.auth == nil {
			return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{"error": "authentication not configured"})
		}
		return s.auth.Me(c)
	})

	// Billing routes
	if s.billing != nil {
		v1.Post("/billing/checkout", auth.Middleware(), s.billing.CreateCheckout)
		v1.Post("/billing/crypto", auth.Middleware(), s.billing.CryptoCheckout)
		v1.Post("/billing/crypto/verify", auth.Middleware(), s.billing.VerifyCrypto)
		v1.Get("/billing/invoices", auth.Middleware(), s.billing.ListInvoices)
		v1.Get("/billing/usage", auth.Middleware(), s.billing.GetUsage)
		v1.Post("/billing/cancel", auth.Middleware(), s.billing.CancelSubscription)
		v1.Post("/billing/webhook", s.billing.Webhook)
	}

	// Scan routes
	v1.Post("/scan", s.scanHandlers.StartScan)
	v1.Get("/scan/:id", s.scanHandlers.GetScan)
	v1.Get("/scan/:id/stream", s.scanHandlers.StreamScan)

	// Host routes
	v1.Get("/hosts", s.hostHandlers.ListHosts)
	v1.Get("/hosts/:ip", s.hostHandlers.GetHost)

	// Alert routes
	v1.Get("/alerts", s.alertHandlers.ListAlerts)

	// Query routes
	v1.Post("/query", s.queryHandlers.ExecuteQuery)

	// LLM ask route
	v1.Post("/ask", s.askHandlers.Ask)
	v1.Post("/ask/transcribe", s.askHandlers.Transcribe)
	v1.Post("/ask/speak", s.askHandlers.Speak)
	v1.Get("/ask/models", s.askHandlers.ListModels)

	// Supply chain route
	v1.Get("/supplychain/:ip", s.supplyChainHandlers.GetSupplyChain)

	// Mesh routes
	v1.Get("/mesh/nodes", s.handleMeshNodes)

	// Static fallback for the Next.js frontend build.
	s.app.Static("/", "./web/out")
}

func (s *Server) handleMeshNodes(c *fiber.Ctx) error {
	if s.mesh == nil {
		return c.JSON(fiber.Map{"nodes": []struct{}{}, "total": 0})
	}
	nodes := s.mesh.Nodes()
	return c.JSON(fiber.Map{"nodes": nodes, "total": len(nodes)})
}
