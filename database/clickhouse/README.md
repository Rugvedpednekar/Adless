# ClickHouse Database Directory

This directory contains ClickHouse schemas and queries for analytical data and campaign tracking.

- `placement_events.sql` defines the anonymous shoppable-placement event table.
- `campaign_performance_shoppable_seed.sql` contains development-only fictional campaign rows. The connected Remote MCP exposes read-only queries, so this seed must be applied by an authorized ClickHouse operator.
