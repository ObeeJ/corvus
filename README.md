# Corvus

> **Networks forget. Corvus doesn't.**

A stateful network intelligence engine built in Go. Corvus is not a port scanner. It is a living system that tracks how networks change over time, fuses passive intelligence before scanning, surfaces anomalies the moment they appear, and explains what it all means in plain English.

Where nmap, masscan, and rustscan answer *"what is open right now"* — Corvus answers *"what changed, when it changed, why it matters, and what you should do about it."*

---

## Why Corvus Exists

Every port scanner built to date operates the same way: send packets, receive responses, print results, exit. The state is thrown away. The next scan starts from zero. There is no memory, no learning, no context.

This is adequate for one-off reconnaissance. It is completely inadequate for:

- Platform engineers who need to know the moment a new port appears on their infrastructure
- Backend engineers performing continuous service discovery across dynamic environments
- Security engineers who need to correlate network exposure with known vulnerabilities
- Red teams who need to scan intelligently rather than brute-force 65,535 ports equally

Corvus was built to close this gap.

---

## Core Capabilities

**Temporal State Tracking**
Every host, port, and service state is stored in an embedded time-series graph. You can query the full history of any endpoint. New ports, banner changes, certificate rotations, and service version drift are first-class events, not afterthoughts.

**Predictive OSINT Fusion**
Before sending a single active packet, Corvus queries passive sources: certificate transparency logs, DNS records, BGP and ASN data, and cloud provider IP range registries. It builds a probability model of what ports are likely open and scans high-probability targets first. On real-world networks, this eliminates the need to brute-force 65,535 ports.

**Behavioral Anomaly Detection**
Corvus does not alert on "port open". It alerts on behavioral change: response time delta exceeding threshold, banner mutation, TLS certificate rotation, service version drift, unexpected port appearance. These are the signals that actually matter.

**Distributed Mesh Coordination**
Multiple Corvus instances across your infrastructure form a peer-to-peer mesh using a gossip protocol. They share scan results, coordinate CIDR division, and build a unified network model without central coordination or a single point of failure.

**Intent-Aware Query Interface**
A structured query DSL lets you express what you actually want to know rather than configuring raw scan parameters:

```
corvus query "find all hosts in 10.0.0.0/8 running outdated SSH opened in the last 7 days"
corvus watch 192.168.1.0/24 --alert-on new-port,cert-change,banner-drift
corvus predict 203.0.113.0/24
```

**CVE Correlation**
After fingerprinting services, Corvus cross-references detected versions against the NVD CVE database. Vulnerabilities are surfaced inline with scan results, not as a separate workflow.

**Real-Time Streaming API**
A Fiber-based REST API with WebSocket support streams live scan progress, state change events, and anomaly alerts to any connected client or downstream system.

**LLM Query Interface**
Ask questions in plain English. Corvus uses an LLM to translate natural language into query plans against the temporal store, then summarizes findings in plain English rather than raw data dumps. No DSL to learn.

```
corvus ask "what on my network looks most likely to be exploited right now?"
corvus ask "did anything unusual happen on 10.0.0.0/24 in the last 6 hours?"
corvus ask "which hosts are running software with critical CVEs and are publicly exposed?"
```

**Cloud API Correlation**
Beyond detecting which IP ranges belong to AWS, GCP, or Azure, Corvus queries cloud provider APIs directly to correlate open ports against actual security group rules, IAM context, and resource metadata. You know not just that a port is open, but which misconfigured rule exposed it and when it was last modified.

**Supply Chain and Dependency Awareness**
After fingerprinting a service, Corvus checks the detected software against the OSV (Open Source Vulnerabilities) database and GitHub Advisory Database — not just NVD. It detects debug endpoints, exposed package managers, dev tools, and known malicious package indicators that should never appear on production hosts.

**OpenTelemetry Observability**
All internal metrics, traces, and events are exported via OpenTelemetry. Corvus integrates natively with Grafana, Datadog, Honeycomb, or any OTEL-compatible backend. Scan throughput, anomaly rates, store write latency, and mesh health are all first-class metrics — not afterthoughts.

---

## Use Cases

| Persona | How Corvus is Used |
|---|---|
| Platform Engineer | Continuous monitoring of internal subnets, alerting on unexpected port exposure, cloud API correlation |
| Backend Engineer | Service discovery across dynamic container environments, change tracking |
| Penetration Tester | Intelligent pre-scan OSINT fusion, CVE + supply chain correlation, stealth-aware scanning |
| SOC Analyst | Network state diff over time, behavioral anomaly alerting, LLM-assisted triage |
| Security Researcher | Distributed scanning coordination across multiple nodes |
| Compliance Engineer | Continuous attack surface validation with OTEL metrics and audit-ready exports |

---

## Architecture Overview

```
                         Corvus Engine
  +------------------------------------------------------------------+
  |                                                                  |
  |  Passive OSINT       Active Scanner      Anomaly Engine          |
  |  CT logs             TCP / SYN / UDP     State diff              |
  |  DNS / BGP / ASN     Banner grab         Drift detection         |
  |  Cloud APIs          Fingerprinting      Alert dispatch          |
  |        |                   |                   |                 |
  |  +-----v-------------------v-------------------v-----------+    |
  |  |          Temporal Graph Store (bbolt)                   |    |
  |  |          host -> port -> service -> [state history]     |    |
  |  +---------------------------+-----------------------------+    |
  |                              |                                  |
  |  +-----------+   +-----------v-----------+   +--------------+  |
  |  | Supply    |   | Gossip Mesh           |   | LLM Query    |  |
  |  | Chain /   |   | (hashicorp/memberlist)|   | Interface    |  |
  |  | OSV / CVE |   | Distributed coord     |   | Natural lang |  |
  |  +-----------+   +-----------------------+   +--------------+  |
  |                              |                                  |
  |  Fiber REST API + WebSocket      CLI (cobra)                    |
  |  OpenTelemetry export            Web Dashboard                  |
  +------------------------------------------------------------------+
```

---

## Comparison With Existing Tools

| Feature | nmap | masscan | rustscan | Corvus |
|---|---|---|---|---|
| Stateful history | No | No | No | Yes |
| Temporal querying | No | No | No | Yes |
| Pre-scan OSINT | No | No | No | Yes |
| Anomaly detection | No | No | No | Yes |
| Distributed mesh | No | No | No | Yes |
| CVE correlation | Scripts only | No | No | Yes (native) |
| Supply chain checks | No | No | No | Yes (OSV + GH Advisory) |
| Cloud API correlation | No | No | No | Yes (AWS/GCP/Azure) |
| LLM natural language | No | No | No | Yes |
| OpenTelemetry export | No | No | No | Yes |
| Web dashboard | No | No | No | Yes |
| Streaming API | No | No | No | Yes |
| Self-hosted | Yes | Yes | Yes | Yes |

---

## Project Structure

```
corvus/
├── cmd/corvus/         # Binary entrypoint
├── internal/
│   ├── scanner/          # TCP, UDP, SYN scan engines
│   ├── osint/            # CT logs, DNS, BGP, cloud API, prediction model
│   ├── fingerprint/      # Banner grabbing, service identification
│   ├── store/            # Temporal graph store (bbolt)
│   ├── mesh/             # Gossip protocol, distributed coordination
│   ├── api/              # Fiber HTTP server, WebSocket, routes
│   ├── anomaly/          # Behavioral diff engine, alert dispatch
│   ├── cve/              # NVD + OSV + GitHub Advisory correlation
│   ├── supplychain/      # Dev tool detection, malicious package indicators
│   ├── llm/              # LLM query translation and result summarization
│   ├── query/            # Query execution engine
│   ├── response/         # Active Response for automated remediation
│   └── otel/             # OpenTelemetry metrics, traces, export
├── web/                  # Web dashboard (served by API)
├── pkg/
│   ├── iprange/          # CIDR parsing and iteration
│   └── logger/           # Structured logging
├── docs/
│   ├── SYSTEM_DESIGN.md  # Architecture and component design
│   ├── USE_CASES.md      # Detailed use case walkthroughs
│   └── BUILD_GUIDE.md    # Step-by-step implementation guide
├── configs/              # Default configuration
├── scripts/              # Install and setup scripts
└── .github/workflows/    # CI and release automation
```

---

## Installation

**From source (requires Go 1.22+)**

```bash
git clone https://github.com/ObeeJ/corvus.git
cd corvus
make build
sudo make install
```

**Binary releases**

Pre-built binaries for Linux, macOS, and Windows are available on the [releases page](https://github.com/ObeeJ/corvus/releases).

**Docker**

```bash
docker pull ghcr.io/obeej/corvus:latest
docker run --rm -it --network host ghcr.io/obeej/corvus:latest scan 192.168.1.0/24
```

---

## Quick Start

```bash
# Scan a single host
corvus scan 192.168.1.1

# Scan a subnet with OSINT pre-scan enabled
corvus scan 192.168.1.0/24 --predict

# Watch a subnet for changes and alert on new ports
corvus watch 10.0.0.0/8 --alert-on new-port,banner-drift

# Query historical state
corvus query "ports opened on 10.0.0.0/24 in last 24h"

# Start the API server
corvus serve --port 8080

# Start a mesh node
corvus node --join 10.0.0.1:7946
```

---

## API

When running `corvus serve`, the following endpoints are available:

```
POST   /api/v1/scan              Start a scan job
GET    /api/v1/scan/:id          Get scan job status and results
GET    /api/v1/scan/:id/stream   WebSocket: live result stream
POST   /api/v1/query             Execute a query (DSL or natural language)
POST   /api/v1/ask               Natural language question, LLM-summarized answer
GET    /api/v1/hosts             List all known hosts
GET    /api/v1/hosts/:ip         Get full state history for a host
GET    /api/v1/alerts            List anomaly alerts
GET    /api/v1/mesh/nodes        List connected mesh nodes
GET    /api/v1/supplychain/:ip   Supply chain and dev tool findings for a host
GET    /metrics                  OpenTelemetry Prometheus endpoint
```

---

## Configuration

Corvus is configured via `configs/default.yaml` or environment variables prefixed with `CORVUS_`.

```yaml
scanner:
  timeout: 3s
  concurrency: 1000
  default_ports: "1-1024,8080,8443,9200,5432,3306,6379,27017"

store:
  path: "/var/lib/corvus/data"
  retention: "90d"

api:
  port: 8080
  auth_token: ""

mesh:
  port: 7946
  advertise_addr: ""

osint:
  ct_logs: true
  bgp_lookup: true
  dns_resolve: true
  cloud_apis:
    aws_region: "us-east-1"       # uses ambient AWS credentials / instance role
    gcp_project: ""               # uses ambient GCP ADC
    azure_subscription_id: ""     # uses ambient Azure managed identity

cve:
  nvd_api_key: ""
  cache_ttl: "24h"
  osv: true                       # also query OSV database
  github_advisory: true           # also query GitHub Advisory Database

llm:
  provider: "anthropic"           # anthropic | openai | local
  model: "claude-sonnet-4-6"
  api_key: ""                     # or set CORVUS_LLM_API_KEY

otel:
  enabled: true
  endpoint: ""                    # OTLP gRPC endpoint, e.g. localhost:4317
  prometheus_port: 9090           # expose /metrics for Prometheus scraping
```

---

## Contributing

Corvus is open source and contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

Development requires Go 1.22 or later. Run `make test` to execute the test suite and `make lint` to run the linter before submitting.

---

## License

Apache 2.0. See [LICENSE](LICENSE) for details.

---

## Acknowledgments

Corvus stands on the shoulders of the tools that came before it. The scanning techniques pioneered by nmap, the throughput model proven by masscan, and the Go networking ecosystem made this project possible.
