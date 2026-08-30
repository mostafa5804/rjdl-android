package com.example.data

import android.net.Uri
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONArray
import org.json.JSONObject
import java.net.URLEncoder
import java.util.concurrent.TimeUnit

object MusicRepository {

    private const val CF_WORKER_URL = "https://player.foadtoonak.workers.dev"
    private const val DEFAULT_COVER = "https://image.qwenlm.ai/public_source/e65c539b-21b0-4d51-a3dc-04fdb44f3766/1b687daa5-7a77-44b3-9c54-a87811103bb5.png"

    private val client = OkHttpClient.Builder()
        .connectTimeout(12, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .followRedirects(true)
        .build()

    fun proxyUrl(url: String?): String {
        if (url.isNullOrBlank()) return ""
        if (url.startsWith("data:") || url.startsWith("blob:")) return url
        val encoded = URLEncoder.encode(url, "UTF-8")
        return "$CF_WORKER_URL/?kind=file&url=$encoded"
    }

    suspend fun getFeaturedSongs(): List<MediaItem> = withContext(Dispatchers.IO) {
        val targetUrl = "https://rj-deskcloud.com/api2/mp3s?url=mp3s&type=featured&page=1"
        val fetchUrl = "$CF_WORKER_URL/?kind=file&url=${URLEncoder.encode(targetUrl, "UTF-8")}"
        fetchMediaItemsFromEndpoint(fetchUrl, isPodcast = false)
    }

    suspend fun getNewPodcasts(): List<MediaItem> = withContext(Dispatchers.IO) {
        val targetUrl = "https://rj-deskcloud.com/api2/podcasts?url=podcasts&type=featured&page=1"
        val fetchUrl = "$CF_WORKER_URL/?kind=file&url=${URLEncoder.encode(targetUrl, "UTF-8")}"
        fetchMediaItemsFromEndpoint(fetchUrl, isPodcast = true)
    }

    suspend fun getPodcastShows(): List<MediaItem> = withContext(Dispatchers.IO) {
        val shows = listOf(
            Triple("Abo Atash", "آب و آتش (Abo Atash)", "دی‌جی تبا - DJ Taba"),
            Triple("Mystery Box", "جعبه اسرار (Mystery Box)", "دی‌جی پی‌اس - DJ PS"),
            Triple("Tehrangeles", "تهرانجلس (Tehrangeles)", "رادیو جوان - Radio Javan"),
            Triple("Mixx", "میکس (Mixx)", "دی‌جی معین - DJ Moein"),
            Triple("RJ Countdown", "شمارش معکوس (RJ Countdown)", "رادیو جوان - Radio Javan"),
            Triple("Shabe Jomeh", "شب جمعه (Shabe Jomeh)", "رادیو جوان - Radio Javan"),
            Triple("Club Mix", "کلاب میکس (Club Mix)", "دی‌جی ممسی - DJ Mamsi"),
            Triple("Trance Form", "ترنس‌فرم (Trance Form)", "رادیو جوان - Radio Javan"),
            Triple("Bass", "بیس (Bass)", "دی‌جی مانی - DJ Mani"),
            Triple("Euphoria", "یوفوریا (Euphoria)", "دی‌جی کوروش - DJ Kourosh")
        )

        shows.map { (queryName, title, artist) ->
            val metadata = MediaMetadata.Builder()
                .setTitle(title)
                .setArtist(artist)
                .setArtworkUri(Uri.parse(DEFAULT_COVER))
                .setIsBrowsable(true)
                .setIsPlayable(false)
                .setMediaType(MediaMetadata.MEDIA_TYPE_FOLDER_PODCASTS)
                .build()

            MediaItem.Builder()
                .setMediaId("SHOW_$queryName")
                .setMediaMetadata(metadata)
                .build()
        }
    }

    suspend fun getPodcastShowEpisodes(showId: String): List<MediaItem> = withContext(Dispatchers.IO) {
        val showName = showId.removePrefix("SHOW_")
        val cleanName = showName.replace("-", " ")
        val slug = cleanName.lowercase().replace(" ", "-")

        // 1. Try direct show endpoint
        val directShowUrl = "https://rj-deskcloud.com/api2/podcast_show?id=${URLEncoder.encode(slug, "UTF-8")}"
        val directItems = fetchMediaItemsFromEndpoint("$CF_WORKER_URL/?kind=file&url=${URLEncoder.encode(directShowUrl, "UTF-8")}", isPodcast = true)
        if (directItems.isNotEmpty()) {
            return@withContext directItems
        }

        // 2. Try show query endpoint
        val showQueryUrl = "https://rj-deskcloud.com/api2/podcasts?show=${URLEncoder.encode(cleanName, "UTF-8")}"
        val showQueryItems = fetchMediaItemsFromEndpoint("$CF_WORKER_URL/?kind=file&url=${URLEncoder.encode(showQueryUrl, "UTF-8")}", isPodcast = true)
        if (showQueryItems.isNotEmpty()) {
            return@withContext showQueryItems
        }

        // 3. Try standard podcast search by show name
        val searchResults = search(cleanName).filter { item ->
            item.mediaMetadata.mediaType == MediaMetadata.MEDIA_TYPE_PODCAST_EPISODE ||
            item.mediaMetadata.title?.toString()?.contains(cleanName, ignoreCase = true) == true ||
            item.mediaMetadata.artist?.toString()?.contains(cleanName, ignoreCase = true) == true
        }

        if (searchResults.isNotEmpty()) {
            return@withContext searchResults
        }

        // 4. Fallback to querying general podcasts
        getNewPodcasts().filter { item ->
            item.mediaMetadata.title?.toString()?.contains(cleanName, ignoreCase = true) == true ||
            item.mediaMetadata.artist?.toString()?.contains(cleanName, ignoreCase = true) == true
        }
    }

    suspend fun search(query: String): List<MediaItem> = withContext(Dispatchers.IO) {
        if (query.isBlank()) return@withContext emptyList()
        val fetchUrl = "$CF_WORKER_URL/?kind=search&query=${URLEncoder.encode(query.trim(), "UTF-8")}"
        val request = Request.Builder().url(fetchUrl).get().build()
        try {
            client.newCall(request).execute().use { response ->
                if (!response.isSuccessful) return@withContext emptyList()
                val bodyStr = response.body?.string() ?: return@withContext emptyList()
                val json = JSONObject(bodyStr)
                val items = mutableListOf<MediaItem>()

                if (json.has("mp3s")) {
                    val mp3s = json.getJSONArray("mp3s")
                    for (i in 0 until mp3s.length()) {
                        val obj = mp3s.getJSONObject(i)
                        parseJsonToMediaItem(obj, isPodcast = false)?.let { items.add(it) }
                    }
                }
                if (json.has("podcasts")) {
                    val podcasts = json.getJSONArray("podcasts")
                    for (i in 0 until podcasts.length()) {
                        val obj = podcasts.getJSONObject(i)
                        parseJsonToMediaItem(obj, isPodcast = true)?.let { items.add(it) }
                    }
                }
                if (json.has("songs")) {
                    val songs = json.getJSONArray("songs")
                    for (i in 0 until songs.length()) {
                        val obj = songs.getJSONObject(i)
                        parseJsonToMediaItem(obj, isPodcast = false)?.let { items.add(it) }
                    }
                }
                items
            }
        } catch (e: Exception) {
            e.printStackTrace()
            emptyList()
        }
    }

    suspend fun resolveDirectMediaItem(item: MediaItem): MediaItem = withContext(Dispatchers.IO) {
        val currentUri = item.requestMetadata.mediaUri ?: item.localConfiguration?.uri
        val uriStr = currentUri?.toString() ?: ""

        // If it's already a direct mp3 stream, return as is
        if (uriStr.contains(".mp3") || uriStr.contains("media.rj")) {
            return@withContext item
        }

        // If it's a search query item, perform search and resolve
        val searchQuery = item.requestMetadata.searchQuery
        if (!searchQuery.isNullOrBlank()) {
            val searchResults = search(searchQuery)
            if (searchResults.isNotEmpty()) {
                return@withContext searchResults.first()
            }
        }

        val isPodcast = item.mediaMetadata.mediaType == MediaMetadata.MEDIA_TYPE_PODCAST_EPISODE ||
                item.mediaMetadata.artist?.contains("Podcast", ignoreCase = true) == true

        val kind = if (isPodcast) "podcast" else "song"
        val resolved = getMediaItemById(kind, item.mediaId) ?: item
        resolved
    }

    suspend fun getMediaItemById(kind: String, id: String): MediaItem? = withContext(Dispatchers.IO) {
        val cleanId = id.trim()
        val fetchUrl = "$CF_WORKER_URL/?kind=$kind&id=${URLEncoder.encode(cleanId, "UTF-8")}"
        val request = Request.Builder().url(fetchUrl).get().build()
        try {
            client.newCall(request).execute().use { response ->
                if (!response.isSuccessful) return@withContext null
                val bodyStr = response.body?.string() ?: return@withContext null
                val json = JSONObject(bodyStr)
                parseJsonToMediaItem(json, isPodcast = (kind == "podcast"))
            }
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    private fun fetchMediaItemsFromEndpoint(url: String, isPodcast: Boolean): List<MediaItem> {
        val request = Request.Builder()
            .url(url)
            .header("User-Agent", "RadioJavan/AutoPlayer")
            .get()
            .build()

        return try {
            client.newCall(request).execute().use { response ->
                if (!response.isSuccessful) return emptyList()
                val bodyStr = response.body?.string() ?: return emptyList()
                val items = mutableListOf<MediaItem>()

                val trimmed = bodyStr.trim()
                if (trimmed.startsWith("[")) {
                    val jsonArray = JSONArray(trimmed)
                    for (i in 0 until jsonArray.length()) {
                        val obj = jsonArray.getJSONObject(i)
                        parseJsonToMediaItem(obj, isPodcast)?.let { items.add(it) }
                    }
                } else if (trimmed.startsWith("{")) {
                    val jsonObj = JSONObject(trimmed)
                    val array = when {
                        jsonObj.has("items") -> jsonObj.getJSONArray("items")
                        jsonObj.has("mp3s") -> jsonObj.getJSONArray("mp3s")
                        jsonObj.has("podcasts") -> jsonObj.getJSONArray("podcasts")
                        jsonObj.has("songs") -> jsonObj.getJSONArray("songs")
                        else -> null
                    }
                    if (array != null) {
                        for (i in 0 until array.length()) {
                            val obj = array.getJSONObject(i)
                            parseJsonToMediaItem(obj, isPodcast)?.let { items.add(it) }
                        }
                    }
                }
                items
            }
        } catch (e: Exception) {
            e.printStackTrace()
            emptyList()
        }
    }

    fun parseJsonToMediaItem(json: JSONObject, isPodcast: Boolean): MediaItem? {
        val id = json.optString("permlink").ifEmpty {
            json.optString("id").ifEmpty {
                json.optString("title")
            }
        }
        if (id.isEmpty()) return null

        val title = json.optString("title").ifEmpty {
            json.optString("song").ifEmpty {
                json.optString("name", "Radio Javan")
            }
        }

        val artist = json.optString("artist").ifEmpty {
            json.optString("podcast_artist").ifEmpty {
                json.optString("artist_name", if (isPodcast) "Radio Javan Podcast" else "Radio Javan")
            }
        }

        val coverUrl = json.optString("photo_player").ifEmpty {
            json.optString("photo_large").ifEmpty {
                json.optString("photo").ifEmpty {
                    json.optString("thumbnail", DEFAULT_COVER)
                }
            }
        }

        // Extract direct audio URL if available
        var rawAudioUrl = json.optString("hq_link").ifEmpty {
            json.optString("link").ifEmpty {
                json.optString("audio_url").ifEmpty {
                    json.optString("lq_link", "")
                }
            }
        }

        // Direct stream construction for standard Radio Javan audio files if missing
        if (rawAudioUrl.isEmpty()) {
            if (isPodcast) {
                rawAudioUrl = "https://media.rj-deskcloud.com/media/podcast/mp3-128/$id.mp3"
            } else {
                rawAudioUrl = "https://media.rj-deskcloud.com/media/mp3/mp3-128/$id.mp3"
            }
        }

        val streamUrl = proxyUrl(rawAudioUrl)

        val metadata = MediaMetadata.Builder()
            .setTitle(title)
            .setArtist(artist)
            .setArtworkUri(Uri.parse(proxyUrl(coverUrl)))
            .setIsPlayable(true)
            .setIsBrowsable(false)
            .setMediaType(if (isPodcast) MediaMetadata.MEDIA_TYPE_PODCAST_EPISODE else MediaMetadata.MEDIA_TYPE_MUSIC)
            .build()

        return MediaItem.Builder()
            .setMediaId(id)
            .setUri(Uri.parse(streamUrl))
            .setMediaMetadata(metadata)
            .build()
    }
}
