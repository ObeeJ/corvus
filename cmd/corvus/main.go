package main

import (
	"context"
	"fmt"
	"log/slog"
	"net"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
	"text/tabwriter"
	"time"

	"github.com/ObeeJ/corvus/internal/anomaly"
	"github.com/ObeeJ/corvus/internal/anomaly/sinks"
	"github.com/ObeeJ/corvus/internal/api"
	"github.com/ObeeJ/corvus/internal/db"
	"github.com/ObeeJ/corvus/internal/engine"
	"github.com/joho/godotenv"
	"github.com/ObeeJ/corvus/internal/mesh"
	"github.com/ObeeJ/corvus/internal/osint"
	"github.com/ObeeJ/corvus/internal/otel"
	"github.com/ObeeJ/corvus/internal/query"
	"github.com/ObeeJ/corvus/internal/store"
	"github.com/ObeeJ/corvus/internal/types"
	"github.com/ObeeJ/corvus/pkg/config"
	"github.com/ObeeJ/corvus/pkg/iprange"
	"github.com/ObeeJ/corvus/pkg/logger"
	"github.com/spf13/cobra"
)

var version = "dev"

var (
	logLevel  string
	logFormat string
)

func main() {
	// Load .env if present (silently ignored when missing — production uses real env vars).
	_ = godotenv.Load()

	root := buildRoot()
	if err := root.Execute(); err != nil {
		os.Exit(1)
	}
}

func buildRoot() *cobra.Command {
	root := &cobra.Command{
		Use:   "corvus",
		Short: config.ProductTagline,
		Long:  fmt.Sprintf("%s %s\n%s", config.ProductName, version, config.ProductTagline),
	}

	root.PersistentFlags().StringVar(&logLevel, "log-level", "info", "log level (debug|info|warn|error)")
	root.PersistentFlags().StringVar(&logFormat, "log-format", "text", "log format (text|json)")

	root.AddCommand(buildScan())
	root.AddCommand(buildWatch())
	root.AddCommand(buildPredict())
	root.AddCommand(buildQuery())
	root.AddCommand(buildServe())
	root.AddCommand(buildNode())
	root.AddCommand(buildVersion())

	return root
}

// ── scan ─────────────────────────────────────────────────────────────────────

func buildScan() *cobra.Command {
	var (
		portsFlag       string
		timeoutFlag     time.Duration
		concurrencyFlag int
		rateFlag        int
		storeFlag       string
		predictFlag     bool
		scanTypeFlag    string
	)

	cmd := &cobra.Command{
		Use:   "scan [target]",
		Short: "Scan a host, range, or CIDR and detect changes",
		Example: `  corvus scan 192.168.1.1
  corvus scan 192.168.1.0/24
  corvus scan 10.0.0.1-10.0.0.50 --ports 22,80,443
  corvus scan 192.168.1.0/24 --predict
  corvus scan 192.168.1.0/24 --scan-type syn
  corvus scan 192.168.1.0/24 --ports 1-65535 --concurrency 1000`,
		Args: cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return runScan(args[0], portsFlag, timeoutFlag, concurrencyFlag, rateFlag, storeFlag, predictFlag, scanTypeFlag)
		},
	}

	cmd.Flags().StringVarP(&portsFlag, "ports", "p", "1-1024,8080,8443,9200,5432,3306,6379,27017", "ports to scan")
	cmd.Flags().DurationVarP(&timeoutFlag, "timeout", "t", 3*time.Second, "per-port connection timeout")
	cmd.Flags().IntVarP(&concurrencyFlag, "concurrency", "c", 500, "concurrent scan workers")
	cmd.Flags().IntVarP(&rateFlag, "rate", "r", 0, "max probes per second (0 = unlimited)")
	cmd.Flags().StringVar(&storeFlag, "store", defaultStorePath(), "path to state store")
	cmd.Flags().BoolVar(&predictFlag, "predict", false, "run OSINT pre-scan to prioritise likely-open ports")
	cmd.Flags().StringVar(&scanTypeFlag, "scan-type", "tcp", "scan type: tcp, syn, or udp")

	return cmd
}

func runScan(target, portsSpec string, timeout time.Duration, concurrency, rate int, storePath string, predict bool, scanType string) error {
	log := logger.New(logLevel, logFormat)

	storeDir := filepath.Dir(storePath)
	storeMgr := store.NewManager(storeDir, logger.Named(log, "store"))
	defer storeMgr.CloseAll()

	ctx, cancel := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer cancel()

	sinksList := []anomaly.AlertSink{sinks.NewStdout()}
	eng := engine.New(storeMgr, sinksList, logger.Named(log, "engine"))

	cfg := engine.ScanConfig{
		UserID:      "default",
		Target:      target,
		Predict:     predict,
		Ports:       portsSpec,
		ScanType:    scanType,
		Timeout:     timeout,
		Concurrency: concurrency,
		Rate:        rate,
	}

	job, err := eng.StartScan(ctx, cfg)
	if err != nil {
		return fmt.Errorf("starting scan: %w", err)
	}

	if predict {
		fmt.Printf("\n  ◉ %s %s — OSINT pre-scan\n", config.ProductName, version)
		fmt.Printf("  gathering passive intelligence…\n\n")
		// The OSINT is run in the background engine, so we just wait for results.
	} else {
		printScanHeader(target, job.Hosts, job.Ports)
	}

	w := tabwriter.NewWriter(os.Stdout, 0, 0, 3, ' ', 0)
	fmt.Fprintln(w, "  HOST\tPORT\tPROTO\tSERVICE\tVERSION\tLATENCY\tCVES\tFLAGS")
	fmt.Fprintln(w, "  ────\t────\t─────\t───────\t───────\t───────\t────\t─────")

	started := time.Now()
	var openCount int
	var cveTotal int
	var flagTotal int

	ch := eng.Subscribe(job.ID)

	for enriched := range ch {
		svc := dash(enriched.ServiceName)
		ver := dash(enriched.Version)
		lat := fmt.Sprintf("%dms", enriched.ResponseMs)
		cveStr := "—"
		flagStr := "—"

		if len(enriched.CVEs) > 0 {
			cveTotal += len(enriched.CVEs)
			cveStr = formatCVECount(enriched.CVEs)
		}
		if len(enriched.SupplyChainFindings) > 0 {
			flagTotal += len(enriched.SupplyChainFindings)
			flagStr = formatFindings(enriched.SupplyChainFindings)
		}

		fmt.Fprintf(w, "  %s\t%d\t%s\t%s\t%s\t%s\t%s\t%s\n",
			enriched.IP, enriched.Port, enriched.Protocol, svc, ver, lat, cveStr, flagStr)
		w.Flush()
		openCount++

		if len(enriched.CVEs) > 0 {
			printCVEDetails(enriched.CVEs)
		}
		if len(enriched.SupplyChainFindings) > 0 {
			printSupplyChainDetails(enriched.SupplyChainFindings)
		}
	}

	w.Flush()
	printScanFooter(job.Hosts, openCount, time.Since(started))

	if cveTotal > 0 || flagTotal > 0 {
		fmt.Printf("  ⚠  %d CVE(s) found  ·  %d supply chain flag(s)\n\n", cveTotal, flagTotal)
	}

	return nil
}

// ── watch ────────────────────────────────────────────────────────────────────

func buildWatch() *cobra.Command {
	var (
		portsFlag       string
		timeoutFlag     time.Duration
		concurrencyFlag int
		rateFlag        int
		storeFlag       string
		intervalFlag    time.Duration
		alertOnFlag     string
	)

	cmd := &cobra.Command{
		Use:   "watch [target]",
		Short: "Continuously monitor a target and alert on any change",
		Example: `  corvus watch 192.168.1.0/24
  corvus watch 10.0.0.0/8 --interval 10m --alert-on new-port,banner-drift`,
		Args: cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return runWatch(args[0], portsFlag, timeoutFlag, concurrencyFlag, rateFlag, storeFlag, intervalFlag, alertOnFlag)
		},
	}

	cmd.Flags().StringVarP(&portsFlag, "ports", "p", "1-1024,8080,8443,9200,5432,3306,6379,27017", "ports to scan")
	cmd.Flags().DurationVarP(&timeoutFlag, "timeout", "t", 3*time.Second, "per-port connection timeout")
	cmd.Flags().IntVarP(&concurrencyFlag, "concurrency", "c", 500, "concurrent scan workers")
	cmd.Flags().IntVarP(&rateFlag, "rate", "r", 0, "max probes per second (0 = unlimited)")
	cmd.Flags().StringVar(&storeFlag, "store", defaultStorePath(), "path to state store")
	cmd.Flags().DurationVarP(&intervalFlag, "interval", "i", 5*time.Minute, "time between scans")
	cmd.Flags().StringVar(&alertOnFlag, "alert-on", "new-port,port-closed,banner-drift,cert-rotation", "anomaly types to alert on")

	return cmd
}

func runWatch(target, portsSpec string, timeout time.Duration, concurrency, rate int, storePath string, interval time.Duration, alertOn string) error {
	log := logger.New(logLevel, logFormat)

	storeDir := filepath.Dir(storePath)
	storeMgr := store.NewManager(storeDir, logger.Named(log, "store"))
	defer storeMgr.CloseAll()

	ctx, cancel := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer cancel()

	sinksList := []anomaly.AlertSink{sinks.NewStdout()}
	eng := engine.New(storeMgr, sinksList, logger.Named(log, "engine"))

	cfg := engine.ScanConfig{
		UserID:      "default",
		Target:      target,
		Ports:       portsSpec,
		ScanType:    "tcp",
		Timeout:     timeout,
		Concurrency: concurrency,
		Rate:        rate,
	}

	fmt.Printf("\n  ◉ %s watch\n", config.ProductName)
	fmt.Printf("  target: %s  |  interval: %s  |  alert-on: %s\n", target, interval, alertOn)
	fmt.Printf("  Ctrl+C to stop.\n\n")

	_ = strings.Split(alertOn, ",") // alert-on filter wired in Phase 3 API layer

	runOnce := func() {
		fmt.Printf("  ── %s ──\n", time.Now().Format("2006-01-02 15:04:05"))

		job, err := eng.StartScan(ctx, cfg)
		if err != nil {
			log.Error("Failed to start scan", "err", err)
			return
		}

		ch := eng.Subscribe(job.ID)
		var openCount int
		for range ch {
			openCount++
		}

		fmt.Printf("  %d ports open\n\n", openCount)
	}

	runOnce()

	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			runOnce()
		case <-ctx.Done():
			fmt.Printf("\n  corvus watch stopped.\n")
			return nil
		}
	}
}

// ── predict ──────────────────────────────────────────────────────────────────

func buildPredict() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "predict [target]",
		Short: "Run OSINT pre-scan and display intelligence profile without active scanning",
		Example: `  corvus predict 192.168.1.1
  corvus predict 203.0.113.0/24`,
		Args: cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return runPredict(args[0])
		},
	}
	return cmd
}

func runPredict(target string) error {
	log := logger.New(logLevel, logFormat)

	ips, err := iprange.Parse(target)
	if err != nil {
		return fmt.Errorf("invalid target: %w", err)
	}

	ctx, cancel := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer cancel()

	predictor := osint.New(logger.Named(log, "osint"))

	fmt.Printf("\n  ◉ %s predict\n", config.ProductName)
	fmt.Printf("  gathering passive intelligence for %d host(s)…\n\n", len(ips))

	for _, ip := range ips {
		if ctx.Err() != nil {
			break
		}
		profile := predictor.Predict(ctx, ip)
		printFullOSINTProfile(ip, profile)
	}

	return nil
}

// ── query ────────────────────────────────────────────────────────────────────

func buildQuery() *cobra.Command {
	var storeFlag string

	cmd := &cobra.Command{
		Use:   "query [expression]",
		Short: "Query historical scan data",
		Example: `  corvus query "ports opened in last 24h"
  corvus query "open ports on 10.0.0.0/24"
  corvus query "hosts running ssh in last 7d"`,
		Args: cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return runQuery(args[0], storeFlag)
		},
	}

	cmd.Flags().StringVar(&storeFlag, "store", defaultStorePath(), "path to state store")
	return cmd
}

func runQuery(expression, storePath string) error {
	log := logger.New(logLevel, logFormat)

	storeDir := filepath.Dir(storePath)
	storeMgr := store.NewManager(storeDir, logger.Named(log, "store"))
	defer storeMgr.CloseAll()

	st, err := storeMgr.GetStore("default")
	if err != nil {
		return err
	}

	plan, err := query.Parse(expression)
	if err != nil {
		return fmt.Errorf("parsing query: %w", err)
	}

	eng := query.NewEngine(st, logger.Named(log, "query"))
	results, err := eng.Execute(plan)
	if err != nil {
		return fmt.Errorf("executing query: %w", err)
	}

	if len(results) == 0 {
		fmt.Printf("\n  no results for: %s\n\n", expression)
		return nil
	}

	fmt.Printf("\n  ◉ %s query — %d result(s)\n\n", config.ProductName, len(results))

	w := tabwriter.NewWriter(os.Stdout, 0, 0, 3, ' ', 0)
	fmt.Fprintln(w, "  HOST\tPORT\tPROTO\tSERVICE\tVERSION\tSTATUS\tLAST SEEN")
	fmt.Fprintln(w, "  ────\t────\t─────\t───────\t───────\t──────\t─────────")

	for _, r := range results {
		status := "closed"
		if r.State.Open {
			status = "open"
		}
		svc := dash(r.State.ServiceName)
		ver := dash(r.State.Version)
		seen := r.State.Timestamp.Format("2006-01-02 15:04")

		fmt.Fprintf(w, "  %s\t%d\t%s\t%s\t%s\t%s\t%s\n",
			r.IP, r.Port, r.Protocol, svc, ver, status, seen)
	}
	w.Flush()
	fmt.Println()

	return nil
}

// ── serve ────────────────────────────────────────────────────────────────────

func buildServe() *cobra.Command {
	var (
		portFlag  int
		storeFlag string
		authFlag  string
		dbFlag    string
	)

	cmd := &cobra.Command{
		Use:   "serve",
		Short: "Start the Corvus API server and Web Dashboard",
		Example: `  corvus serve
  corvus serve --port 8080 --db postgres://user:pass@localhost:5432/corvus`,
		RunE: func(cmd *cobra.Command, args []string) error {
			return runServe(portFlag, storeFlag, authFlag, dbFlag)
		},
	}

	cmd.Flags().IntVarP(&portFlag, "port", "p", 8080, "API server port")
	cmd.Flags().StringVar(&storeFlag, "store", defaultStorePath(), "path to state store")
	cmd.Flags().StringVar(&authFlag, "auth", "", "API bearer token (optional)")
	cmd.Flags().StringVar(&dbFlag, "db", "", "PostgreSQL connection string (or set DATABASE_URL)")

	return cmd
}

func runServe(port int, storePath string, authToken string, dbUrl string) error {
	log := logger.New(logLevel, logFormat)

	if dbUrl == "" {
		dbUrl = os.Getenv("DATABASE_URL")
	}

	var dbClient *db.Client
	if dbUrl != "" {
		var err error
		dbClient, err = db.New(dbUrl, logger.Named(log, "db"))
		if err != nil {
			return fmt.Errorf("database init failed: %w", err)
		}
		defer dbClient.Close()
	} else {
		log.Warn("DATABASE_URL not set, running without authentication and billing")
	}

	storeDir := filepath.Dir(storePath)
	storeMgr := store.NewManager(storeDir, logger.Named(log, "store"))
	defer storeMgr.CloseAll()

	// Start OTEL metrics server on port 7777 (best-effort).
	otelProvider := otel.New(7777, logger.Named(log, "otel"))
	_ = otelProvider.Start()

	// Initialize the central orchestration engine.
	sinksList := []anomaly.AlertSink{sinks.NewStdout()}
	eng := engine.New(storeMgr, sinksList, logger.Named(log, "engine"))

	// Initialize and start the Fiber API server.
	apiServer := api.New(eng, storeMgr, dbClient, nil, api.Config{
		Port:      port,
		AuthToken: authToken,
	}, logger.Named(log, "api"))

	return apiServer.Start()
}

// ── node ─────────────────────────────────────────────────────────────────────

func buildNode() *cobra.Command {
	var (
		joinFlag  string
		portFlag  int
		storeFlag string
		apiPort   int
		dbFlag    string
	)

	cmd := &cobra.Command{
		Use:   "node",
		Short: "Start a Corvus mesh node",
		Example: `  corvus node
  corvus node --join 10.0.0.1:7946`,
		RunE: func(cmd *cobra.Command, args []string) error {
			return runNode(joinFlag, portFlag, storeFlag, apiPort, dbFlag)
		},
	}

	cmd.Flags().StringVar(&joinFlag, "join", "", "address of an existing mesh node to join")
	cmd.Flags().IntVar(&portFlag, "mesh-port", 7946, "UDP port for mesh gossip")
	cmd.Flags().StringVar(&storeFlag, "store", defaultStorePath(), "path to state store")
	cmd.Flags().IntVar(&apiPort, "port", 8080, "API server port")
	cmd.Flags().StringVar(&dbFlag, "db", "", "PostgreSQL connection string")

	return cmd
}

func runNode(joinAddr string, meshPort int, storePath string, apiPort int, dbUrl string) error {
	log := logger.New(logLevel, logFormat)

	if dbUrl == "" {
		dbUrl = os.Getenv("DATABASE_URL")
	}

	var dbClient *db.Client
	if dbUrl != "" {
		var err error
		dbClient, err = db.New(dbUrl, logger.Named(log, "db"))
		if err != nil {
			return fmt.Errorf("database init failed: %w", err)
		}
		defer dbClient.Close()
	}

	storeDir := filepath.Dir(storePath)
	storeMgr := store.NewManager(storeDir, logger.Named(log, "store"))
	defer storeMgr.CloseAll()

	sinksList := []anomaly.AlertSink{sinks.NewStdout()}
	eng := engine.New(storeMgr, sinksList, logger.Named(log, "engine"))

	nodeID := fmt.Sprintf("corvus-%d", time.Now().UnixNano())
	meshNode := mesh.New(nodeID, "0.0.0.0", meshPort, logger.Named(log, "mesh"))

	ctx, cancel := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer cancel()

	if err := meshNode.Start(ctx); err != nil {
		return fmt.Errorf("starting mesh: %w", err)
	}
	defer meshNode.Stop()

	if joinAddr != "" {
		if err := meshNode.Join(joinAddr); err != nil {
			log.Warn("failed to join mesh peer", "addr", joinAddr, "err", err)
		} else {
			log.Info("joined mesh", "peer", joinAddr)
		}
	}

	fmt.Printf("\n  ◉ %s node\n", config.ProductName)
	fmt.Printf("  node-id: %s  |  mesh-port: %d  |  api-port: %d\n\n", nodeID, meshPort, apiPort)

	apiServer := api.New(eng, storeMgr, dbClient, meshNode, api.Config{
		Port: apiPort,
	}, logger.Named(log, "api"))

	return apiServer.Start()
}

// ── version ───────────────────────────────────────────────────────────────────

func buildVersion() *cobra.Command {
	return &cobra.Command{
		Use:   "version",
		Short: "Print version",
		Run: func(cmd *cobra.Command, args []string) {
			fmt.Printf("%s %s\n", config.ProductName, version)
		},
	}
}

// ── helpers ───────────────────────────────────────────────────────────────────

func openStore(path string, log *slog.Logger) (*store.Store, error) {
	return store.Open(path, log)
}

func defaultStorePath() string {
	if home, err := os.UserHomeDir(); err == nil {
		return home + "/.corvus/corvus.db"
	}
	return "/var/lib/corvus/corvus.db"
}

func printScanHeader(target string, hosts, ports int) {
	fmt.Printf("\n  ◉ %s %s\n", config.ProductName, version)
	fmt.Printf("  target: %s  |  %d hosts  |  %d ports/host\n\n", target, hosts, ports)
}

func printScanFooter(hosts, open int, elapsed time.Duration) {
	fmt.Printf("\n  ─────────────────────────────────────────────────────\n")
	fmt.Printf("  %d hosts  ·  %d open ports  ·  %.1fs\n\n", hosts, open, elapsed.Seconds())
}

func dash(s string) string {
	if s == "" {
		return "—"
	}
	return s
}

// ── Phase 2 output formatters ────────────────────────────────────────────────

func printOSINTSummary(ip net.IP, profile *types.OSINTProfile) {
	fmt.Printf("  %s", ip)

	if len(profile.Hostnames) > 0 {
		fmt.Printf("  ← %s", strings.Join(profile.Hostnames[:min(3, len(profile.Hostnames))], ", "))
		if len(profile.Hostnames) > 3 {
			fmt.Printf(" (+%d more)", len(profile.Hostnames)-3)
		}
	}

	if profile.Organization != "" {
		fmt.Printf("  [%s]", profile.Organization)
	}
	if profile.CloudProvider != "" {
		fmt.Printf("  ☁ %s", profile.CloudProvider)
	}
	if profile.ASN > 0 {
		fmt.Printf("  AS%d", profile.ASN)
	}

	if len(profile.PortScores) > 0 {
		fmt.Printf("  — %d port predictions", len(profile.PortScores))
	}
	fmt.Println()
}

func printFullOSINTProfile(ip net.IP, profile *types.OSINTProfile) {
	fmt.Printf("  ┌─ %s ─────────────────────────────────\n", ip)

	if len(profile.Hostnames) > 0 {
		fmt.Printf("  │  hostnames:     %s\n", strings.Join(profile.Hostnames, ", "))
	}
	if profile.Organization != "" {
		fmt.Printf("  │  organization:  %s\n", profile.Organization)
	}
	if profile.ASN > 0 {
		fmt.Printf("  │  ASN:           AS%d\n", profile.ASN)
	}
	if profile.CloudProvider != "" {
		fmt.Printf("  │  cloud:         %s\n", profile.CloudProvider)
	}

	if len(profile.PortScores) > 0 {
		fmt.Printf("  │\n")
		fmt.Printf("  │  predicted ports (by probability):\n")

		// Sort ports by score descending for display.
		sortedPorts := sortPortsByScore(profile.PortScores)
		displayed := 0
		for _, ps := range sortedPorts {
			if displayed >= 15 {
				fmt.Printf("  │    … and %d more\n", len(sortedPorts)-displayed)
				break
			}
			bar := strings.Repeat("█", int(ps.score*20))
			fmt.Printf("  │    %5d  %s %.0f%%\n", ps.port, bar, ps.score*100)
			displayed++
		}
	}

	fmt.Printf("  └──────────────────────────────────────\n\n")
}

type portScore struct {
	port  uint16
	score float64
}

func sortPortsByScore(scores map[uint16]float64) []portScore {
	items := make([]portScore, 0, len(scores))
	for port, score := range scores {
		items = append(items, portScore{port: port, score: score})
	}
	// Insertion sort descending by score.
	for i := 1; i < len(items); i++ {
		for j := i; j > 0 && items[j].score > items[j-1].score; j-- {
			items[j], items[j-1] = items[j-1], items[j]
		}
	}
	return items
}

func formatCVECount(cves []types.CVERef) string {
	critical, high, medium, low := 0, 0, 0, 0
	for _, cv := range cves {
		switch strings.ToUpper(cv.Severity) {
		case "CRITICAL":
			critical++
		case "HIGH":
			high++
		case "MEDIUM":
			medium++
		default:
			low++
		}
	}

	parts := []string{}
	if critical > 0 {
		parts = append(parts, fmt.Sprintf("%dC", critical))
	}
	if high > 0 {
		parts = append(parts, fmt.Sprintf("%dH", high))
	}
	if medium > 0 {
		parts = append(parts, fmt.Sprintf("%dM", medium))
	}
	if low > 0 {
		parts = append(parts, fmt.Sprintf("%dL", low))
	}
	return strings.Join(parts, "/")
}

func formatFindings(findings []types.SupplyChainFinding) string {
	if len(findings) == 1 {
		return findings[0].Type
	}
	return fmt.Sprintf("%d issues", len(findings))
}

func printCVEDetails(cves []types.CVERef) {
	for _, cv := range cves {
		sev := cv.Severity
		if sev == "" {
			sev = "?"
		}
		desc := cv.Description
		if len(desc) > 80 {
			desc = desc[:77] + "…"
		}
		fmt.Printf("        ⚠ %s [%s] %s\n", cv.ID, sev, desc)
	}
}

func printSupplyChainDetails(findings []types.SupplyChainFinding) {
	for _, f := range findings {
		fmt.Printf("        ⛓ [%s] %s\n", f.Severity, f.Description)
	}
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
