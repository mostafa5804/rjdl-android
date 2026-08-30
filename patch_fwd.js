const fs = require('fs');
let kt = fs.readFileSync('app/src/main/java/com/example/service/PlaybackService.kt', 'utf8');

kt = kt.replace('private lateinit var player: ExoPlayer', 'private lateinit var player: Player\n    private lateinit var exoPlayer: ExoPlayer');

kt = kt.replace('player = ExoPlayer.Builder(this)', 'exoPlayer = ExoPlayer.Builder(this)');

const listenerStr = `        exoPlayer.addListener(object : Player.Listener {`;
kt = kt.replace('        player.addListener(object : Player.Listener {', listenerStr);

const sessionStr = `        player = object : androidx.media3.common.ForwardingPlayer(exoPlayer) {
            override fun getAvailableCommands(): Player.Commands {
                return super.getAvailableCommands().buildUpon()
                    .add(Player.COMMAND_SEEK_TO_NEXT)
                    .add(Player.COMMAND_SEEK_TO_PREVIOUS)
                    .add(Player.COMMAND_SEEK_TO_NEXT_MEDIA_ITEM)
                    .add(Player.COMMAND_SEEK_TO_PREVIOUS_MEDIA_ITEM)
                    .build()
            }
            override fun hasNextMediaItem(): Boolean = true
            override fun hasPreviousMediaItem(): Boolean = true
            override fun seekToNextMediaItem() {
                sendBroadcast(android.content.Intent("com.example.ACTION_NEXT"))
            }
            override fun seekToPreviousMediaItem() {
                sendBroadcast(android.content.Intent("com.example.ACTION_PREV"))
            }
        }

        mediaSession = MediaLibrarySession.Builder(this, player, LibrarySessionCallback())`;
kt = kt.replace('        mediaSession = MediaLibrarySession.Builder(this, player, LibrarySessionCallback())', sessionStr);

// exoPlayer needs to be released in onDestroy
kt = kt.replace('player.release()', 'exoPlayer.release()');

fs.writeFileSync('app/src/main/java/com/example/service/PlaybackService.kt', kt, 'utf8');
