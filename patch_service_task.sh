sed -i '/^}$/d' app/src/main/java/com/example/service/PlaybackService.kt
cat << 'INNER_EOF' >> app/src/main/java/com/example/service/PlaybackService.kt

    override fun onTaskRemoved(rootIntent: Intent?) {
        val p = mediaSession?.player
        if (p == null || !p.playWhenReady || p.mediaItemCount == 0 || p.playbackState == Player.STATE_ENDED) {
            stopSelf()
        }
    }
}
INNER_EOF
