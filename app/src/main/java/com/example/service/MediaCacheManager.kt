package com.example.service

import android.content.Context
import androidx.annotation.OptIn
import androidx.media3.common.util.UnstableApi
import androidx.media3.database.StandaloneDatabaseProvider
import androidx.media3.datasource.DataSource
import androidx.media3.datasource.DefaultHttpDataSource
import androidx.media3.datasource.cache.CacheDataSource
import androidx.media3.datasource.cache.LeastRecentlyUsedCacheEvictor
import androidx.media3.datasource.cache.SimpleCache
import java.io.File

@OptIn(UnstableApi::class)
object MediaCacheManager {

    private const val CACHE_SIZE_BYTES = 500L * 1024L * 1024L // 500 MB limit
    private var simpleCache: SimpleCache? = null
    private var databaseProvider: StandaloneDatabaseProvider? = null

    @Synchronized
    fun getSimpleCache(context: Context): SimpleCache {
        if (simpleCache == null) {
            val cacheDir = File(context.cacheDir, "media_cache")
            if (!cacheDir.exists()) {
                cacheDir.mkdirs()
            }
            val evictor = LeastRecentlyUsedCacheEvictor(CACHE_SIZE_BYTES)
            val dbProvider = StandaloneDatabaseProvider(context.applicationContext).also {
                databaseProvider = it
            }
            simpleCache = SimpleCache(cacheDir, evictor, dbProvider)
        }
        return simpleCache!!
    }

    fun createCacheDataSourceFactory(context: Context): DataSource.Factory {
        val cache = getSimpleCache(context)
        val upstreamFactory = DefaultHttpDataSource.Factory()
            .setUserAgent("Mozilla/5.0 (Android; RadioJavanAuto/1.0)")
            .setConnectTimeoutMs(15000)
            .setReadTimeoutMs(25000)
            .setAllowCrossProtocolRedirects(true)

        return CacheDataSource.Factory()
            .setCache(cache)
            .setUpstreamDataSourceFactory(upstreamFactory)
            .setFlags(CacheDataSource.FLAG_IGNORE_CACHE_ON_ERROR)
    }

    @Synchronized
    fun release() {
        try {
            simpleCache?.release()
            simpleCache = null
            databaseProvider = null
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
