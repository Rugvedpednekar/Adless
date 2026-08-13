CREATE TABLE IF NOT EXISTS adless.placement_events
(
 event_id String,
 event_type LowCardinality(String),
 timestamp DateTime64(3, 'UTC'),
 video_id String,
 placement_id String,
 campaign_id String,
 product_id String,
 viewer_session_id String,
 playback_second Float64,
 placement_start Float64,
 placement_end Float64,
 cta_show Float64,
 cta_hide Float64,
 surface LowCardinality(String),
 scene_environment LowCardinality(String),
 market LowCardinality(String)
)
ENGINE = MergeTree
ORDER BY (video_id, placement_id, timestamp);
