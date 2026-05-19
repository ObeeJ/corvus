package sinks

import (
	"fmt"
	"io"
	"os"
	"time"

	"github.com/ObeeJ/corvus/internal/types"
)

// StdoutSink writes anomaly events to stdout in a human-readable format.
type StdoutSink struct {
	w io.Writer
}

func NewStdout() *StdoutSink {
	return &StdoutSink{w: os.Stdout}
}

func (s *StdoutSink) Send(event types.AnomalyEvent) error {
	symbol := severitySymbol(event.Severity)
	ts := event.Timestamp.Format(time.RFC3339)

	fmt.Fprintf(s.w, "\n  %s  %s [%s]\n", symbol, event.Type, event.Severity)
	fmt.Fprintf(s.w, "     host    %s:%d/%s\n", event.Host, event.Port, event.Protocol)
	fmt.Fprintf(s.w, "     message %s\n", event.Message)
	fmt.Fprintf(s.w, "     time    %s\n", ts)

	return nil
}

func severitySymbol(s types.Severity) string {
	switch s {
	case types.SeverityCritical:
		return "✖"
	case types.SeverityHigh:
		return "⚠"
	case types.SeverityMedium:
		return "●"
	default:
		return "○"
	}
}
