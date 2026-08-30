package com.example.service

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.net.wifi.WifiManager
import android.os.Build
import android.os.Bundle
import android.os.PowerManager
import androidx.annotation.OptIn
import androidx.media3.common.AudioAttributes
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.source.DefaultMediaSourceFactory
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.session.CommandButton
import androidx.media3.session.DefaultMediaNotificationProvider
import androidx.media3.session.LibraryResult
import androidx.media3.session.MediaLibraryService
import androidx.media3.session.MediaSession
import androidx.media3.session.SessionCommand
import androidx.media3.session.SessionResult
import com.example.MainActivity
import com.example.R
import com.example.cache.MediaCacheManager
import com.example.data.MusicRepository
import com.google.common.collect.ImmutableList
import com.google.common.util.concurrent.Futures
import com.google.common.util.concurrent.ListenableFuture
import com.google.common.util.concurrent.SettableFuture
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeoutOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONArray
import java.io.ByteArrayOutputStream
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.TimeUnit

@OptIn(UnstableApi::class)
class PlaybackService : MediaLibraryService() {

    private var mediaSession: MediaLibrarySession? = null
    private lateinit var player: Player
    private lateinit var exoPlayer: ExoPlayer
    private val serviceScope = CoroutineScope(Dispatchers.Main + SupervisorJob())

    private var wakeLock: PowerManager.WakeLock? = null
    private var wifiLock: WifiManager.WifiLock? = null
    private lateinit var prefs: SharedPreferences

    // In-memory cache for Android Auto categories, artwork bytes, and items
    private val categoryItemsCache = ConcurrentHashMap<String, List<MediaItem>>()
    private val searchResultsCache = ConcurrentHashMap<String, List<MediaItem>>()
    private val allKnownItemsMap = ConcurrentHashMap<String, MediaItem>()
    private val artworkBytesCache = ConcurrentHashMap<String, ByteArray>()

    private val imageClient = OkHttpClient.Builder()
        .connectTimeout(8, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .build()

    companion object {
        const val ROOT_ID = "[ROOT]"
        const val TAB_FEATURED_SONGS = "TAB_FEATURED_SONGS"
        const val TAB_PODCASTS = "TAB_PODCASTS"
        const val TAB_PODCAST_SHOWS = "TAB_PODCAST_SHOWS"

        // Backward compatibility IDs
        const val LEGACY_ROOT_ID = "root_radio_javan"
        const val LEGACY_ID_FEATURED_SONGS = "root_featured_songs"
        const val LEGACY_ID_NEW_PODCASTS = "root_new_podcasts"

        // Custom actions for Podcast controls
        const val ACTION_REWIND_10 = "ACTION_REWIND_10"
        const val ACTION_FORWARD_30 = "ACTION_FORWARD_30"

        // SharedPreferences keys for resumption
        private const val PREFS_NAME = "rj_playback_prefs"
        private const val KEY_LAST_MEDIA_ID = "last_media_id"
        private const val KEY_LAST_POSITION = "last_position"
        private const val KEY_LAST_INDEX = "last_index"
        private const val KEY_LAST_QUEUE_JSON = "last_queue_json"

        const val CHANNEL_ID = "radio_javan_playback_channel"
        private const val NETWORK_TIMEOUT_MS = 6000L
    }

    override fun onCreate() {
        super.onCreate()
        prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        createNotificationChannel()
        initLocks()
        initializePlayer()
        initializeSession()
        setupNotificationProvider()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                getString(R.string.app_name),
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Radio Javan background music playback"
                setShowBadge(false)
            }
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager?.createNotificationChannel(channel)
        }
    }

    private fun initLocks() {
        try {
            val powerManager = getSystemService(Context.POWER_SERVICE) as? PowerManager
            wakeLock = powerManager?.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "RadioJavan:PlaybackWakeLock")?.apply {
                setReferenceCounted(false)
            }

            val wifiManager = applicationContext.getSystemService(Context.WIFI_SERVICE) as? WifiManager
            @Suppress("DEPRECATION")
            wifiLock = wifiManager?.createWifiLock(WifiManager.WIFI_MODE_FULL_HIGH_PERF, "RadioJavan:PlaybackWifiLock")?.apply {
                setReferenceCounted(false)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun acquireLocks() {
        try {
            if (wakeLock?.isHeld == false) {
                wakeLock?.acquire(24 * 60 * 60 * 1000L) // 24 hours safety
            }
            if (wifiLock?.isHeld == false) {
                wifiLock?.acquire()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun releaseLocks() {
        try {
            if (wakeLock?.isHeld == true) {
                wakeLock?.release()
            }
            if (wifiLock?.isHeld == true) {
                wifiLock?.release()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun initializePlayer() {
        val audioAttributes = AudioAttributes.Builder()
            .setContentType(C.AUDIO_CONTENT_TYPE_MUSIC)
            .setUsage(C.USAGE_MEDIA)
            .build()

        val cacheDataSourceFactory = MediaCacheManager.createCacheDataSourceFactory(this)
        val mediaSourceFactory = DefaultMediaSourceFactory(cacheDataSourceFactory)

        exoPlayer = ExoPlayer.Builder(this)
            .setMediaSourceFactory(mediaSourceFactory)
            .setAudioAttributes(audioAttributes, /* handleAudioFocus= */ true)
            .setHandleAudioBecomingNoisy(true)
            .setWakeMode(C.WAKE_MODE_NETWORK)
            .build()

        exoPlayer.addListener(object : Player.Listener {
            override fun onIsPlayingChanged(isPlaying: Boolean) {
                // Auto handled by Media3
                if (isPlaying) {
                    acquireLocks()
                } else {
                    releaseLocks()
                    savePlaybackState()
                }
            }

            override fun onPlaybackStateChanged(playbackState: Int) {
                if (playbackState == Player.STATE_ENDED || playbackState == Player.STATE_IDLE) {
                    releaseLocks()
                }
            }

            override fun onMediaItemTransition(mediaItem: MediaItem?, reason: Int) {
                savePlaybackState()
                updateCustomPodcastLayout(mediaItem)
                preloadArtworkBytes(mediaItem)
            }
        })
    }

    private fun initializeSession() {
        val sessionActivityIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val sessionActivityPendingIntent = PendingIntent.getActivity(
            this,
            0,
            sessionActivityIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        player = object : androidx.media3.common.ForwardingPlayer(exoPlayer) {
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
                sendBroadcast(android.content.Intent("com.example.ACTION_NEXT").apply { setPackage(packageName) })
            }
            override fun seekToPreviousMediaItem() {
                sendBroadcast(android.content.Intent("com.example.ACTION_PREV").apply { setPackage(packageName) })
            }
        }

        mediaSession = MediaLibrarySession.Builder(this, player, LibrarySessionCallback())
            .setSessionActivity(sessionActivityPendingIntent)
            .build()
    }

    private fun setupNotificationProvider() {
        val notificationProvider = DefaultMediaNotificationProvider.Builder(this)
            .setChannelId(CHANNEL_ID)
            .setChannelName(R.string.app_name)
            .build()
        setMediaNotificationProvider(notificationProvider)
    }

    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo): MediaLibrarySession? {
        return mediaSession
    }

    private fun savePlaybackState() {
        try {
            val currentItem = player.currentMediaItem ?: return
            val pos = player.currentPosition
            val index = player.currentMediaItemIndex

            val mediaIds = mutableListOf<String>()
            for (i in 0 until player.mediaItemCount) {
                mediaIds.add(player.getMediaItemAt(i).mediaId)
            }

            prefs.edit()
                .putString(KEY_LAST_MEDIA_ID, currentItem.mediaId)
                .putLong(KEY_LAST_POSITION, maxOf(0L, pos))
                .putInt(KEY_LAST_INDEX, index)
                .putString(KEY_LAST_QUEUE_JSON, JSONArray(mediaIds).toString())
                .apply()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun preloadArtworkBytes(mediaItem: MediaItem?) {
        val artUri = mediaItem?.mediaMetadata?.artworkUri ?: return
        val url = artUri.toString()
        if (url.isEmpty() || artworkBytesCache.containsKey(url)) return

        serviceScope.launch(Dispatchers.IO) {
            try {
                val req = Request.Builder().url(url).build()
                imageClient.newCall(req).execute().use { res ->
                    if (res.isSuccessful) {
                        res.body?.bytes()?.let { bytes ->
                            artworkBytesCache[url] = bytes
                        }
                    }
                }
            } catch (e: Exception) {
                // Ignore silent artwork failure
            }
        }
    }

    private fun updateCustomPodcastLayout(mediaItem: MediaItem?) {
        val session = mediaSession ?: return
        val isPodcast = mediaItem?.mediaMetadata?.mediaType == MediaMetadata.MEDIA_TYPE_PODCAST_EPISODE ||
                mediaItem?.mediaMetadata?.artist?.contains("Podcast", ignoreCase = true) == true

        if (isPodcast) {
            val rewind10Button = CommandButton.Builder()
                .setDisplayName("۱۰ ثانیه قبل")
                .setIconResId(R.drawable.ic_replay_10)
                .setSessionCommand(SessionCommand(ACTION_REWIND_10, Bundle.EMPTY))
                .build()

            val forward30Button = CommandButton.Builder()
                .setDisplayName("۳۰ ثانیه بعد")
                .setIconResId(R.drawable.ic_forward_30)
                .setSessionCommand(SessionCommand(ACTION_FORWARD_30, Bundle.EMPTY))
                .build()

            session.setCustomLayout(ImmutableList.of(rewind10Button, forward30Button))
        } else {
            session.setCustomLayout(ImmutableList.of())
        }
    }

    override fun onDestroy() {
        savePlaybackState()
        releaseLocks()
        mediaSession?.run {
            exoPlayer.release()
            release()
            mediaSession = null
        }
        serviceScope.cancel()
        super.onDestroy()
    }

    private inner class LibrarySessionCallback : MediaLibrarySession.Callback {

        override fun onConnect(
            session: MediaSession,
            controller: MediaSession.ControllerInfo
        ): MediaSession.ConnectionResult {
            val connectionResult = super.onConnect(session, controller)
            val availablePlayerCommands = connectionResult.availablePlayerCommands.buildUpon()
                .add(Player.COMMAND_PLAY_PAUSE)
                .add(Player.COMMAND_PREPARE)
                .add(Player.COMMAND_STOP)
                .add(Player.COMMAND_SEEK_TO_DEFAULT_POSITION)
                .add(Player.COMMAND_SEEK_IN_CURRENT_MEDIA_ITEM)
                .add(Player.COMMAND_SEEK_TO_PREVIOUS_MEDIA_ITEM)
                .add(Player.COMMAND_SEEK_TO_PREVIOUS)
                .add(Player.COMMAND_SEEK_TO_NEXT_MEDIA_ITEM)
                .add(Player.COMMAND_SEEK_TO_NEXT)
                .add(Player.COMMAND_SEEK_BACK)
                .add(Player.COMMAND_SEEK_FORWARD)
                .add(Player.COMMAND_SET_SPEED_AND_PITCH)
                .add(Player.COMMAND_SET_SHUFFLE_MODE)
                .add(Player.COMMAND_SET_REPEAT_MODE)
                .add(Player.COMMAND_GET_CURRENT_MEDIA_ITEM)
                .add(Player.COMMAND_GET_TIMELINE)
                .add(Player.COMMAND_GET_METADATA)
                .build()

            val availableSessionCommands = connectionResult.availableSessionCommands.buildUpon()
                .add(SessionCommand(ACTION_REWIND_10, Bundle.EMPTY))
                .add(SessionCommand(ACTION_FORWARD_30, Bundle.EMPTY))
                .build()

            return MediaSession.ConnectionResult.AcceptedResultBuilder(session)
                .setAvailablePlayerCommands(availablePlayerCommands)
                .setAvailableSessionCommands(availableSessionCommands)
                .build()
        }

        override fun onCustomCommand(
            session: MediaSession,
            controller: MediaSession.ControllerInfo,
            customCommand: SessionCommand,
            args: Bundle
        ): ListenableFuture<SessionResult> {
            when (customCommand.customAction) {
                ACTION_REWIND_10 -> {
                    val currentPos = player.currentPosition
                    val targetPos = maxOf(0L, currentPos - 10_000L)
                    player.seekTo(targetPos)
                    return Futures.immediateFuture(SessionResult(SessionResult.RESULT_SUCCESS))
                }
                ACTION_FORWARD_30 -> {
                    val currentPos = player.currentPosition
                    val duration = if (player.duration > 0) player.duration else Long.MAX_VALUE
                    val targetPos = minOf(duration, currentPos + 30_000L)
                    player.seekTo(targetPos)
                    return Futures.immediateFuture(SessionResult(SessionResult.RESULT_SUCCESS))
                }
            }
            return super.onCustomCommand(session, controller, customCommand, args)
        }

        override fun onPlaybackResumption(
            mediaSession: MediaSession,
            controller: MediaSession.ControllerInfo
        ): ListenableFuture<MediaSession.MediaItemsWithStartPosition> {
            val future = SettableFuture.create<MediaSession.MediaItemsWithStartPosition>()

            serviceScope.launch {
                try {
                    val lastMediaId = prefs.getString(KEY_LAST_MEDIA_ID, null)
                    val lastPos = prefs.getLong(KEY_LAST_POSITION, 0L)
                    val lastIndex = prefs.getInt(KEY_LAST_INDEX, 0)
                    val lastQueueJson = prefs.getString(KEY_LAST_QUEUE_JSON, null)

                    if (!lastMediaId.isNullOrEmpty()) {
                        val fullQueue = findQueueContaining(lastMediaId)
                            ?: if (!lastQueueJson.isNullOrEmpty()) {
                                val jsonArr = JSONArray(lastQueueJson)
                                val queueIds = (0 until jsonArr.length()).map { jsonArr.getString(it) }
                                queueIds.mapNotNull { id -> allKnownItemsMap[id] }
                            } else null

                        if (!fullQueue.isNullOrEmpty()) {
                            val resolvedIndex = fullQueue.indexOfFirst { it.mediaId == lastMediaId }
                                .let { if (it >= 0) it else lastIndex.coerceIn(0, fullQueue.size - 1) }

                            future.set(
                                MediaSession.MediaItemsWithStartPosition(
                                    fullQueue,
                                    resolvedIndex,
                                    lastPos
                                )
                            )
                            return@launch
                        }

                        // Fallback to single saved track
                        val singleItem = withTimeoutOrNull(NETWORK_TIMEOUT_MS) {
                            MusicRepository.getMediaItemById("song", lastMediaId)
                                ?: MusicRepository.getMediaItemById("podcast", lastMediaId)
                        }
                        if (singleItem != null) {
                            future.set(
                                MediaSession.MediaItemsWithStartPosition(
                                    listOf(singleItem),
                                    0,
                                    lastPos
                                )
                            )
                            return@launch
                        }
                    }

                    // Default fallback to featured songs
                    val defaultSongs = categoryItemsCache[TAB_FEATURED_SONGS]
                        ?: MusicRepository.getFeaturedSongs()
                    future.set(
                        MediaSession.MediaItemsWithStartPosition(
                            defaultSongs,
                            0,
                            0L
                        )
                    )
                } catch (e: Exception) {
                    future.set(
                        MediaSession.MediaItemsWithStartPosition(
                            emptyList(),
                            0,
                            0L
                        )
                    )
                }
            }

            return future
        }

        override fun onGetLibraryRoot(
            session: MediaLibrarySession,
            browser: MediaSession.ControllerInfo,
            params: LibraryParams?
        ): ListenableFuture<LibraryResult<MediaItem>> {
            val rootMetadata = MediaMetadata.Builder()
                .setTitle("RJ DL")
                .setIsBrowsable(true)
                .setIsPlayable(false)
                .setMediaType(MediaMetadata.MEDIA_TYPE_FOLDER_MIXED)
                .build()

            val rootItem = MediaItem.Builder()
                .setMediaId(ROOT_ID)
                .setMediaMetadata(rootMetadata)
                .build()

            return Futures.immediateFuture(LibraryResult.ofItem(rootItem, params))
        }

        override fun onGetChildren(
            session: MediaLibrarySession,
            browser: MediaSession.ControllerInfo,
            parentId: String,
            page: Int,
            pageSize: Int,
            params: LibraryParams?
        ): ListenableFuture<LibraryResult<ImmutableList<MediaItem>>> {
            val future = SettableFuture.create<LibraryResult<ImmutableList<MediaItem>>>()

            when {
                // Root View: Clean 3 Tab Structure
                parentId == ROOT_ID || parentId == LEGACY_ROOT_ID -> {
                    val rootItems = ImmutableList.of(
                        createCategoryTabItem(TAB_FEATURED_SONGS, "🔥 داغ‌ترین آهنگ‌ها", MediaMetadata.MEDIA_TYPE_FOLDER_ALBUMS),
                        createCategoryTabItem(TAB_PODCASTS, "🎙 جدیدترین پادکست‌ها", MediaMetadata.MEDIA_TYPE_FOLDER_PODCASTS),
                        createCategoryTabItem(TAB_PODCAST_SHOWS, "📻 آرشیو شوهای پادکست", MediaMetadata.MEDIA_TYPE_FOLDER_PODCASTS)
                    )
                    future.set(LibraryResult.ofItemList(rootItems, params))
                }

                // Tab 1: Featured Songs
                parentId == TAB_FEATURED_SONGS || parentId == LEGACY_ID_FEATURED_SONGS -> {
                    val cached = categoryItemsCache[TAB_FEATURED_SONGS]
                    if (!cached.isNullOrEmpty()) {
                        future.set(LibraryResult.ofItemList(ImmutableList.copyOf(cached), params))
                    } else {
                        serviceScope.launch {
                            try {
                                val items = withTimeoutOrNull(NETWORK_TIMEOUT_MS) {
                                    MusicRepository.getFeaturedSongs()
                                } ?: emptyList()
                                if (items.isNotEmpty()) {
                                    categoryItemsCache[TAB_FEATURED_SONGS] = items
                                    items.forEach { allKnownItemsMap[it.mediaId] = it }
                                }
                                future.set(LibraryResult.ofItemList(ImmutableList.copyOf(items), params))
                            } catch (e: Exception) {
                                future.set(LibraryResult.ofItemList(ImmutableList.of(), params))
                            }
                        }
                    }
                }

                // Tab 2: New Podcasts
                parentId == TAB_PODCASTS || parentId == LEGACY_ID_NEW_PODCASTS -> {
                    val cached = categoryItemsCache[TAB_PODCASTS]
                    if (!cached.isNullOrEmpty()) {
                        future.set(LibraryResult.ofItemList(ImmutableList.copyOf(cached), params))
                    } else {
                        serviceScope.launch {
                            try {
                                val items = withTimeoutOrNull(NETWORK_TIMEOUT_MS) {
                                    MusicRepository.getNewPodcasts()
                                } ?: emptyList()
                                if (items.isNotEmpty()) {
                                    categoryItemsCache[TAB_PODCASTS] = items
                                    items.forEach { allKnownItemsMap[it.mediaId] = it }
                                }
                                future.set(LibraryResult.ofItemList(ImmutableList.copyOf(items), params))
                            } catch (e: Exception) {
                                future.set(LibraryResult.ofItemList(ImmutableList.of(), params))
                            }
                        }
                    }
                }

                // Tab 3: Podcast Shows Archive
                parentId == TAB_PODCAST_SHOWS -> {
                    val cached = categoryItemsCache[TAB_PODCAST_SHOWS]
                    if (!cached.isNullOrEmpty()) {
                        future.set(LibraryResult.ofItemList(ImmutableList.copyOf(cached), params))
                    } else {
                        serviceScope.launch {
                            try {
                                val shows = withTimeoutOrNull(NETWORK_TIMEOUT_MS) {
                                    MusicRepository.getPodcastShows()
                                } ?: emptyList()
                                if (shows.isNotEmpty()) {
                                    categoryItemsCache[TAB_PODCAST_SHOWS] = shows
                                    shows.forEach { allKnownItemsMap[it.mediaId] = it }
                                }
                                future.set(LibraryResult.ofItemList(ImmutableList.copyOf(shows), params))
                            } catch (e: Exception) {
                                future.set(LibraryResult.ofItemList(ImmutableList.of(), params))
                            }
                        }
                    }
                }

                // Specific Podcast Show Episodes
                parentId.startsWith("SHOW_") -> {
                    val cached = categoryItemsCache[parentId]
                    if (!cached.isNullOrEmpty()) {
                        future.set(LibraryResult.ofItemList(ImmutableList.copyOf(cached), params))
                    } else {
                        serviceScope.launch {
                            try {
                                val episodes = withTimeoutOrNull(NETWORK_TIMEOUT_MS) {
                                    MusicRepository.getPodcastShowEpisodes(parentId)
                                } ?: emptyList()
                                if (episodes.isNotEmpty()) {
                                    categoryItemsCache[parentId] = episodes
                                    episodes.forEach { allKnownItemsMap[it.mediaId] = it }
                                }
                                future.set(LibraryResult.ofItemList(ImmutableList.copyOf(episodes), params))
                            } catch (e: Exception) {
                                future.set(LibraryResult.ofItemList(ImmutableList.of(), params))
                            }
                        }
                    }
                }

                else -> {
                    future.set(LibraryResult.ofItemList(ImmutableList.of(), params))
                }
            }

            return future
        }

        override fun onSearch(
            session: MediaLibrarySession,
            browser: MediaSession.ControllerInfo,
            query: String,
            params: LibraryParams?
        ): ListenableFuture<LibraryResult<Void>> {
            serviceScope.launch {
                try {
                    val results = withTimeoutOrNull(NETWORK_TIMEOUT_MS) {
                        MusicRepository.search(query)
                    } ?: emptyList()
                    searchResultsCache[query] = results
                    results.forEach { allKnownItemsMap[it.mediaId] = it }
                    session.notifySearchResultChanged(browser, query, results.size, params)
                } catch (e: Exception) {
                    searchResultsCache[query] = emptyList()
                    session.notifySearchResultChanged(browser, query, 0, params)
                }
            }
            return Futures.immediateFuture(LibraryResult.ofVoid())
        }

        override fun onGetSearchResult(
            session: MediaLibrarySession,
            browser: MediaSession.ControllerInfo,
            query: String,
            page: Int,
            pageSize: Int,
            params: LibraryParams?
        ): ListenableFuture<LibraryResult<ImmutableList<MediaItem>>> {
            val future = SettableFuture.create<LibraryResult<ImmutableList<MediaItem>>>()
            val cached = searchResultsCache[query]
            if (cached != null) {
                future.set(LibraryResult.ofItemList(ImmutableList.copyOf(cached), params))
            } else {
                serviceScope.launch {
                    try {
                        val results = withTimeoutOrNull(NETWORK_TIMEOUT_MS) {
                            MusicRepository.search(query)
                        } ?: emptyList()
                        searchResultsCache[query] = results
                        results.forEach { allKnownItemsMap[it.mediaId] = it }
                        future.set(LibraryResult.ofItemList(ImmutableList.copyOf(results), params))
                    } catch (e: Exception) {
                        future.set(LibraryResult.ofItemList(ImmutableList.of(), params))
                    }
                }
            }
            return future
        }

        override fun onGetItem(
            session: MediaLibrarySession,
            browser: MediaSession.ControllerInfo,
            mediaId: String
        ): ListenableFuture<LibraryResult<MediaItem>> {
            val future = SettableFuture.create<LibraryResult<MediaItem>>()
            val cachedItem = allKnownItemsMap[mediaId]
            if (cachedItem != null) {
                return Futures.immediateFuture(LibraryResult.ofItem(cachedItem, null))
            }

            serviceScope.launch {
                try {
                    val item = withTimeoutOrNull(NETWORK_TIMEOUT_MS) {
                        MusicRepository.getMediaItemById("song", mediaId)
                            ?: MusicRepository.getMediaItemById("podcast", mediaId)
                    }
                    if (item != null) {
                        allKnownItemsMap[mediaId] = item
                        future.set(LibraryResult.ofItem(item, null))
                    } else {
                        future.set(LibraryResult.ofError(LibraryResult.RESULT_ERROR_BAD_VALUE))
                    }
                } catch (e: Exception) {
                    future.set(LibraryResult.ofError(LibraryResult.RESULT_ERROR_UNKNOWN))
                }
            }
            return future
        }

        override fun onSetMediaItems(
            mediaSession: MediaSession,
            controller: MediaSession.ControllerInfo,
            mediaItems: MutableList<MediaItem>,
            startIndex: Int,
            startPositionMs: Long
        ): ListenableFuture<MediaSession.MediaItemsWithStartPosition> {
            val future = SettableFuture.create<MediaSession.MediaItemsWithStartPosition>()

            serviceScope.launch {
                try {
                    if (mediaItems.size == 1) {
                        val clickedId = mediaItems[0].mediaId
                        val fullQueue = findQueueContaining(clickedId)

                        if (!fullQueue.isNullOrEmpty()) {
                            val resolvedIndex = fullQueue.indexOfFirst { it.mediaId == clickedId }.coerceAtLeast(0)
                            future.set(
                                MediaSession.MediaItemsWithStartPosition(
                                    fullQueue,
                                    resolvedIndex,
                                    if (startPositionMs > 0) startPositionMs else 0L
                                )
                            )
                            return@launch
                        }
                    }

                    val resolvedItems = resolveMediaItemsList(mediaItems)
                    val safeIndex = startIndex.coerceIn(0, (resolvedItems.size - 1).coerceAtLeast(0))
                    future.set(
                        MediaSession.MediaItemsWithStartPosition(
                            resolvedItems,
                            safeIndex,
                            if (startPositionMs > 0) startPositionMs else 0L
                        )
                    )
                } catch (e: Exception) {
                    future.set(
                        MediaSession.MediaItemsWithStartPosition(
                            mediaItems,
                            startIndex,
                            startPositionMs
                        )
                    )
                }
            }

            return future
        }

        override fun onAddMediaItems(
            mediaSession: MediaSession,
            controller: MediaSession.ControllerInfo,
            mediaItems: List<MediaItem>
        ): ListenableFuture<List<MediaItem>> {
            val future = SettableFuture.create<List<MediaItem>>()
            serviceScope.launch {
                try {
                    val resolvedItems = resolveMediaItemsList(mediaItems)
                    future.set(resolvedItems)
                } catch (e: Exception) {
                    future.set(mediaItems)
                }
            }
            return future
        }

        private suspend fun resolveMediaItemsList(items: List<MediaItem>): List<MediaItem> {
            return items.map { item ->
                val currentUri = item.requestMetadata.mediaUri ?: item.localConfiguration?.uri
                val uriStr = currentUri?.toString() ?: ""
                if (uriStr.isNotEmpty() && !uriStr.contains("kind=podcast&") && !uriStr.contains("kind=song&")) {
                    item
                } else {
                    allKnownItemsMap[item.mediaId] ?: run {
                        val fetched = withTimeoutOrNull(NETWORK_TIMEOUT_MS) {
                            MusicRepository.resolveDirectMediaItem(item)
                        }
                        fetched?.also { allKnownItemsMap[item.mediaId] = it } ?: item
                    }
                }
            }
        }

        private fun findQueueContaining(mediaId: String): List<MediaItem>? {
            categoryItemsCache[TAB_FEATURED_SONGS]?.let { list ->
                if (list.any { it.mediaId == mediaId }) return list
            }
            categoryItemsCache[TAB_PODCASTS]?.let { list ->
                if (list.any { it.mediaId == mediaId }) return list
            }
            for ((key, list) in categoryItemsCache) {
                if (key.startsWith("SHOW_") && list.any { it.mediaId == mediaId }) {
                    return list
                }
            }
            for (queryList in searchResultsCache.values) {
                if (queryList.any { it.mediaId == mediaId }) return queryList
            }
            return null
        }
    }

    private fun createCategoryTabItem(id: String, title: String, mediaType: Int): MediaItem {
        val metadata = MediaMetadata.Builder()
            .setTitle(title)
            .setIsBrowsable(true)
            .setIsPlayable(false)
            .setMediaType(mediaType)
            .build()

        return MediaItem.Builder()
            .setMediaId(id)
            .setMediaMetadata(metadata)
            .build()
    }


    override fun onTaskRemoved(rootIntent: Intent?) {
        val p = mediaSession?.player
        if (p == null || !p.playWhenReady || p.mediaItemCount == 0 || p.playbackState == Player.STATE_ENDED) {
            stopSelf()
        }
    }
}
