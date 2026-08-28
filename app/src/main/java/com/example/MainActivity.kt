package com.example

import android.annotation.SuppressLint
import android.app.DownloadManager
import android.content.ComponentName
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.os.Handler
import android.os.Looper
import android.provider.MediaStore
import android.util.Base64
import android.view.ViewGroup
import android.webkit.ConsoleMessage
import android.webkit.CookieManager
import android.webkit.DownloadListener
import android.webkit.JavascriptInterface
import android.webkit.URLUtil
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.lifecycleScope
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import androidx.media3.common.Player
import androidx.media3.session.MediaController
import androidx.media3.session.SessionToken
import com.example.service.PlaybackService
import com.google.common.util.concurrent.ListenableFuture
import com.google.common.util.concurrent.MoreExecutors
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream

class MainActivity : ComponentActivity() {

    private var webView: WebView? = null
    private var controllerFuture: ListenableFuture<MediaController>? = null
    private var mediaController: MediaController? = null
    private var progressJob: Job? = null

    private val playerListener = object : Player.Listener {
        override fun onIsPlayingChanged(isPlaying: Boolean) {
            runOnUiThread {
                webView?.evaluateJavascript("if(window.onNativePlaybackStateChanged){window.onNativePlaybackStateChanged($isPlaying);}", null)
            }
        }

        override fun onMediaItemTransition(mediaItem: MediaItem?, reason: Int) {
            runOnUiThread {
                val controller = mediaController ?: return@runOnUiThread
                val currentIdx = controller.currentMediaItemIndex
                val id = mediaItem?.mediaId ?: ""
                val title = JSONObject.quote(mediaItem?.mediaMetadata?.title?.toString() ?: "")
                val artist = JSONObject.quote(mediaItem?.mediaMetadata?.artist?.toString() ?: "")
                val artworkUri = JSONObject.quote(mediaItem?.mediaMetadata?.artworkUri?.toString() ?: "")
                val json = """{"index":$currentIdx,"id":${JSONObject.quote(id)},"title":$title,"artist":$artist,"coverUrl":$artworkUri}"""
                webView?.evaluateJavascript("if(window.onNativeTrackChanged){window.onNativeTrackChanged($json);}", null)
            }
        }

        override fun onPlaybackStateChanged(playbackState: Int) {
            if (playbackState == Player.STATE_ENDED) {
                runOnUiThread {
                    webView?.evaluateJavascript("if(window.onNativePlaybackEnded){window.onNativePlaybackEnded();}", null)
                }
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        connectToMediaService()
        startProgressUpdates()

        // Handle hardware back button navigation in WebView
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                val wv = webView
                if (wv != null && wv.canGoBack()) {
                    wv.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })

        setContent {
            val isDark = isSystemInDarkTheme()
            val colorScheme = if (isDark) {
                darkColorScheme(background = Color(0xFF0B0F19))
            } else {
                lightColorScheme(background = Color(0xFFEBF0F7))
            }

            MaterialTheme(colorScheme = colorScheme) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(MaterialTheme.colorScheme.background)
                        .systemBarsPadding()
                        .imePadding()
                ) {
                    HybridWebViewContainer(
                        onWebViewCreated = { wv ->
                            webView = wv
                        }
                    )
                }
            }
        }
    }

    private fun connectToMediaService() {
        val sessionToken = SessionToken(this, ComponentName(this, PlaybackService::class.java))
        controllerFuture = MediaController.Builder(this, sessionToken).buildAsync()
        controllerFuture?.addListener({
            try {
                mediaController = controllerFuture?.get()
                mediaController?.addListener(playerListener)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }, MoreExecutors.directExecutor())
    }

    private fun startProgressUpdates() {
        progressJob?.cancel()
        progressJob = lifecycleScope.launch {
            while (isActive) {
                val controller = mediaController
                if (controller != null && controller.isPlaying) {
                    val pos = controller.currentPosition
                    val dur = controller.duration
                    if (dur > 0) {
                        runOnUiThread {
                            webView?.evaluateJavascript("if(window.onNativeProgress){window.onNativeProgress($pos,$dur);}", null)
                        }
                    }
                }
                delay(400)
            }
        }
    }

    override fun onDestroy() {
        progressJob?.cancel()
        mediaController?.removeListener(playerListener)
        controllerFuture?.let { MediaController.releaseFuture(it) }
        webView?.destroy()
        webView = null
        super.onDestroy()
    }

    @SuppressLint("SetJavaScriptEnabled")
    @Composable
    private fun HybridWebViewContainer(onWebViewCreated: (WebView) -> Unit) {
        AndroidView(
            modifier = Modifier.fillMaxSize(),
            factory = { context ->
                WebView(context).apply {
                    layoutParams = ViewGroup.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT
                    )

                    settings.apply {
                        javaScriptEnabled = true
                        domStorageEnabled = true
                        databaseEnabled = true
                        allowFileAccess = true
                        allowContentAccess = true
                        mediaPlaybackRequiresUserGesture = false
                        loadWithOverviewMode = true
                        useWideViewPort = true
                        cacheMode = WebSettings.LOAD_DEFAULT
                        mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                        displayZoomControls = false
                        builtInZoomControls = false
                        userAgentString = "$userAgentString RadioJavanAuto/1.0"
                    }

                    CookieManager.getInstance().setAcceptCookie(true)
                    CookieManager.getInstance().setAcceptThirdPartyCookies(this, true)

                    addJavascriptInterface(AndroidBridge(context), "AndroidBridge")

                    setDownloadListener { url, userAgent, contentDisposition, mimetype, _ ->
                        if (url.startsWith("http://") || url.startsWith("https://")) {
                            try {
                                val filename = URLUtil.guessFileName(url, contentDisposition, mimetype)
                                val request = DownloadManager.Request(Uri.parse(url)).apply {
                                    if (!mimetype.isNullOrEmpty()) {
                                        setMimeType(mimetype)
                                    }
                                    addRequestHeader("User-Agent", userAgent)
                                    setDescription("در حال دانلود موزیک...")
                                    setTitle(filename)
                                    setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                                    setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, filename)
                                    setAllowedOverMetered(true)
                                    setAllowedOverRoaming(true)
                                }
                                val dm = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
                                dm.enqueue(request)
                                Toast.makeText(context, "دانلود آغاز شد", Toast.LENGTH_SHORT).show()
                            } catch (e: Exception) {
                                try {
                                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                                    context.startActivity(intent)
                                } catch (e2: Exception) {
                                    Toast.makeText(context, "خطا در شروع دانلود: ${e.message}", Toast.LENGTH_SHORT).show()
                                }
                            }
                        }
                    }

                    webChromeClient = object : WebChromeClient() {
                        override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                            return super.onConsoleMessage(consoleMessage)
                        }
                    }

                    webViewClient = object : WebViewClient() {
                        override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                            val targetUri = request?.url ?: return false
                            val scheme = targetUri.scheme ?: return false
                            if (scheme == "http" || scheme == "https" || scheme == "file") {
                                return false
                            }
                            return try {
                                val intent = Intent(Intent.ACTION_VIEW, targetUri)
                                context.startActivity(intent)
                                true
                            } catch (e: Exception) {
                                true
                            }
                        }
                    }

                    loadUrl("file:///android_asset/www/index.html")
                    onWebViewCreated(this)
                }
            }
        )
    }

    inner class AndroidBridge(private val context: Context) {

        @JavascriptInterface
        fun downloadHttp(url: String, fileName: String) {
            try {
                val request = DownloadManager.Request(Uri.parse(url)).apply {
                    setTitle(fileName)
                    setDescription("دانلود فایل")
                    setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                    setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName)
                    setAllowedOverMetered(true)
                    setAllowedOverRoaming(true)
                }
                val dm = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
                dm.enqueue(request)
                Handler(Looper.getMainLooper()).post {
                    Toast.makeText(context, "دانلود در پس‌زمینه آغاز شد", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                e.printStackTrace()
                Handler(Looper.getMainLooper()).post {
                    Toast.makeText(context, "خطا در دانلود: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }

        @JavascriptInterface
        fun saveBase64(base64Data: String, fileName: String, mimeType: String) {
            try {
                val bytes = Base64.decode(base64Data, Base64.DEFAULT)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    val values = ContentValues().apply {
                        put(MediaStore.Downloads.DISPLAY_NAME, fileName)
                        put(MediaStore.Downloads.MIME_TYPE, if (mimeType.isNotEmpty()) mimeType else "application/zip")
                        put(MediaStore.Downloads.IS_PENDING, 1)
                    }
                    val uri = context.contentResolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
                    uri?.let {
                        context.contentResolver.openOutputStream(it)?.use { output -> output.write(bytes) }
                        values.clear()
                        values.put(MediaStore.Downloads.IS_PENDING, 0)
                        context.contentResolver.update(it, values, null, null)
                    }
                } else {
                    val dir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
                    if (!dir.exists()) {
                        dir.mkdirs()
                    }
                    val file = File(dir, fileName)
                    FileOutputStream(file).use { it.write(bytes) }
                }
                Handler(Looper.getMainLooper()).post {
                    Toast.makeText(context, "فایل ZIP در پوشه Downloads ذخیره شد", Toast.LENGTH_LONG).show()
                }
            } catch (e: Exception) {
                e.printStackTrace()
                Handler(Looper.getMainLooper()).post {
                    Toast.makeText(context, "خطا در ذخیره فایل: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }

        @JavascriptInterface
        fun playQueue(jsonArrayStr: String, startIndex: Int, startPositionMs: Long) {
            runOnUiThread {
                val controller = mediaController ?: return@runOnUiThread
                try {
                    val jsonArr = JSONArray(jsonArrayStr)
                    val mediaItems = mutableListOf<MediaItem>()
                    for (i in 0 until jsonArr.length()) {
                        val obj = jsonArr.getJSONObject(i)
                        val id = obj.optString("id").ifEmpty { obj.optString("permlink") }
                        val title = obj.optString("title", "Radio Javan")
                        val artist = obj.optString("artist", "Radio Javan")
                        val coverUrl = obj.optString("coverUrl").ifEmpty { obj.optString("cover") }
                        val streamUrl = obj.optString("streamUrl")

                        val metadata = MediaMetadata.Builder()
                            .setTitle(title)
                            .setArtist(artist)
                            .setArtworkUri(if (coverUrl.isNotEmpty()) Uri.parse(coverUrl) else null)
                            .setIsPlayable(true)
                            .setIsBrowsable(false)
                            .build()

                        val mediaItem = MediaItem.Builder()
                            .setMediaId(id)
                            .setUri(Uri.parse(streamUrl))
                            .setMediaMetadata(metadata)
                            .build()

                        mediaItems.add(mediaItem)
                    }

                    if (mediaItems.isNotEmpty()) {
                        val validIndex = startIndex.coerceIn(0, mediaItems.size - 1)
                        val seekPos = if (startPositionMs > 0) startPositionMs else 0L
                        controller.setMediaItems(mediaItems, validIndex, seekPos)
                        controller.prepare()
                        controller.play()
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
        }

        @JavascriptInterface
        fun playMedia(id: String, title: String, artist: String, coverUrl: String, streamUrl: String) {
            runOnUiThread {
                val controller = mediaController ?: return@runOnUiThread
                val metadata = MediaMetadata.Builder()
                    .setTitle(title)
                    .setArtist(artist)
                    .setArtworkUri(if (coverUrl.isNotEmpty()) Uri.parse(coverUrl) else null)
                    .setIsPlayable(true)
                    .setIsBrowsable(false)
                    .build()

                val item = MediaItem.Builder()
                    .setMediaId(id)
                    .setUri(Uri.parse(streamUrl))
                    .setMediaMetadata(metadata)
                    .build()

                controller.setMediaItem(item)
                controller.prepare()
                controller.play()
            }
        }

        @JavascriptInterface
        fun pause() {
            runOnUiThread {
                mediaController?.pause()
            }
        }

        @JavascriptInterface
        fun resume() {
            runOnUiThread {
                mediaController?.play()
            }
        }

        @JavascriptInterface
        fun stop() {
            runOnUiThread {
                mediaController?.stop()
            }
        }

        @JavascriptInterface
        fun seekTo(positionMs: Long) {
            runOnUiThread {
                mediaController?.seekTo(positionMs)
            }
        }

        @JavascriptInterface
        fun skipToNext() {
            runOnUiThread {
                val controller = mediaController ?: return@runOnUiThread
                if (controller.hasNextMediaItem()) {
                    controller.seekToNextMediaItem()
                }
            }
        }

        @JavascriptInterface
        fun skipToPrevious() {
            runOnUiThread {
                val controller = mediaController ?: return@runOnUiThread
                if (controller.hasPreviousMediaItem()) {
                    controller.seekToPreviousMediaItem()
                } else {
                    controller.seekTo(0L)
                }
            }
        }

        @JavascriptInterface
        fun setRepeatMode(mode: String) {
            runOnUiThread {
                when (mode) {
                    "one" -> mediaController?.repeatMode = Player.REPEAT_MODE_ONE
                    "all" -> mediaController?.repeatMode = Player.REPEAT_MODE_ALL
                    else -> mediaController?.repeatMode = Player.REPEAT_MODE_OFF
                }
            }
        }

        @JavascriptInterface
        fun setShuffleMode(enabled: Boolean) {
            runOnUiThread {
                mediaController?.shuffleModeEnabled = enabled
            }
        }

        @JavascriptInterface
        fun showToast(message: String) {
            runOnUiThread {
                Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
            }
        }

        @JavascriptInterface
        fun saveTheme(theme: String) {
            val appPrefs = context.getSharedPreferences("rj_ui_prefs", Context.MODE_PRIVATE)
            appPrefs.edit().putString("app_theme_mode", theme).apply()
        }

        @JavascriptInterface
        fun getTheme(): String {
            val appPrefs = context.getSharedPreferences("rj_ui_prefs", Context.MODE_PRIVATE)
            return appPrefs.getString("app_theme_mode", "light") ?: "light"
        }
    }
}
