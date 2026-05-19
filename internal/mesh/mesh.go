package mesh

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net"
	"sync"
	"time"

	"github.com/ObeeJ/corvus/internal/types"
)

// NodeInfo describes a peer in the mesh.
type NodeInfo struct {
	ID        string    `json:"id"`
	Addr      string    `json:"addr"`
	LastSeen  time.Time `json:"last_seen"`
	ScanCount int       `json:"scan_count"`
}

// ScanShare is a scan result broadcast to peers.
type ScanShare struct {
	NodeID  string                `json:"node_id"`
	Results []types.EnrichedResult `json:"results"`
}

// Mesh implements a simple UDP gossip mesh for coordinating distributed Corvus nodes.
type Mesh struct {
	nodeID  string
	bindAddr string
	port    int
	log     *slog.Logger

	mu    sync.RWMutex
	peers map[string]*NodeInfo

	conn     *net.UDPConn
	incoming chan ScanShare
}

// New creates a new Mesh node.
func New(nodeID, bindAddr string, port int, log *slog.Logger) *Mesh {
	return &Mesh{
		nodeID:   nodeID,
		bindAddr: bindAddr,
		port:     port,
		log:      log,
		peers:    make(map[string]*NodeInfo),
		incoming: make(chan ScanShare, 64),
	}
}

// Start binds the UDP socket and begins listening for gossip messages.
func (m *Mesh) Start(ctx context.Context) error {
	addr, err := net.ResolveUDPAddr("udp4", fmt.Sprintf("%s:%d", m.bindAddr, m.port))
	if err != nil {
		return fmt.Errorf("resolving mesh addr: %w", err)
	}

	conn, err := net.ListenUDP("udp4", addr)
	if err != nil {
		return fmt.Errorf("binding mesh socket: %w", err)
	}
	m.conn = conn
	m.log.Info("mesh node started", "id", m.nodeID, "addr", addr)

	go m.readLoop(ctx)
	go m.heartbeatLoop(ctx)
	return nil
}

// Join sends a hello message to a known peer to join the mesh.
func (m *Mesh) Join(peerAddr string) error {
	msg := gossipMsg{Type: "hello", NodeID: m.nodeID, Addr: fmt.Sprintf("%s:%d", m.bindAddr, m.port)}
	return m.sendTo(peerAddr, msg)
}

// Broadcast shares scan results with all known peers.
func (m *Mesh) Broadcast(results []types.EnrichedResult) {
	share := ScanShare{NodeID: m.nodeID, Results: results}
	msg := gossipMsg{Type: "share", NodeID: m.nodeID, Payload: mustMarshal(share)}

	m.mu.RLock()
	peers := make([]*NodeInfo, 0, len(m.peers))
	for _, p := range m.peers {
		peers = append(peers, p)
	}
	m.mu.RUnlock()

	for _, peer := range peers {
		if err := m.sendTo(peer.Addr, msg); err != nil {
			m.log.Debug("broadcast failed", "peer", peer.Addr, "err", err)
		}
	}
}

// Nodes returns a snapshot of all known peers.
func (m *Mesh) Nodes() []NodeInfo {
	m.mu.RLock()
	defer m.mu.RUnlock()
	nodes := make([]NodeInfo, 0, len(m.peers))
	for _, p := range m.peers {
		nodes = append(nodes, *p)
	}
	return nodes
}

// Incoming returns the channel of scan shares received from peers.
func (m *Mesh) Incoming() <-chan ScanShare {
	return m.incoming
}

// Stop closes the mesh socket.
func (m *Mesh) Stop() {
	if m.conn != nil {
		m.conn.Close()
	}
}

// ── internal ─────────────────────────────────────────────────────────────────

type gossipMsg struct {
	Type    string          `json:"type"`
	NodeID  string          `json:"node_id"`
	Addr    string          `json:"addr,omitempty"`
	Payload json.RawMessage `json:"payload,omitempty"`
}

func (m *Mesh) readLoop(ctx context.Context) {
	buf := make([]byte, 65536)
	for {
		select {
		case <-ctx.Done():
			return
		default:
		}

		m.conn.SetReadDeadline(time.Now().Add(time.Second)) //nolint:errcheck
		n, remoteAddr, err := m.conn.ReadFromUDP(buf)
		if err != nil {
			continue
		}

		var msg gossipMsg
		if err := json.Unmarshal(buf[:n], &msg); err != nil {
			continue
		}

		m.handleMsg(msg, remoteAddr.String())
	}
}

func (m *Mesh) handleMsg(msg gossipMsg, from string) {
	m.mu.Lock()
	if _, exists := m.peers[msg.NodeID]; !exists && msg.NodeID != m.nodeID {
		m.log.Info("new mesh peer", "id", msg.NodeID, "addr", from)
	}
	if msg.NodeID != m.nodeID {
		addr := msg.Addr
		if addr == "" {
			addr = from
		}
		m.peers[msg.NodeID] = &NodeInfo{
			ID:       msg.NodeID,
			Addr:     addr,
			LastSeen: time.Now(),
		}
	}
	m.mu.Unlock()

	switch msg.Type {
	case "hello":
		// Reply with our own hello so the peer knows us.
		reply := gossipMsg{Type: "hello", NodeID: m.nodeID, Addr: fmt.Sprintf("%s:%d", m.bindAddr, m.port)}
		m.sendTo(from, reply) //nolint:errcheck

	case "share":
		var share ScanShare
		if err := json.Unmarshal(msg.Payload, &share); err == nil {
			select {
			case m.incoming <- share:
			default:
			}
		}

	case "heartbeat":
		// Peer liveness already updated above.
	}
}

func (m *Mesh) heartbeatLoop(ctx context.Context) {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			msg := gossipMsg{Type: "heartbeat", NodeID: m.nodeID}
			m.mu.RLock()
			for _, peer := range m.peers {
				m.sendTo(peer.Addr, msg) //nolint:errcheck
			}
			m.mu.RUnlock()

			// Evict peers not seen in 2 minutes.
			m.mu.Lock()
			for id, peer := range m.peers {
				if time.Since(peer.LastSeen) > 2*time.Minute {
					m.log.Info("evicting stale mesh peer", "id", id)
					delete(m.peers, id)
				}
			}
			m.mu.Unlock()
		}
	}
}

func (m *Mesh) sendTo(addr string, msg gossipMsg) error {
	if m.conn == nil {
		return fmt.Errorf("mesh not started")
	}
	data, err := json.Marshal(msg)
	if err != nil {
		return err
	}
	udpAddr, err := net.ResolveUDPAddr("udp4", addr)
	if err != nil {
		return err
	}
	_, err = m.conn.WriteToUDP(data, udpAddr)
	return err
}

func mustMarshal(v any) json.RawMessage {
	b, _ := json.Marshal(v)
	return b
}
