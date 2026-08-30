package com.example.cache

import android.content.Context
import androidx.annotation.OptIn
import androidx.media3.common.util.UnstableApi
import androidx.media3.database.StandaloneDatabaseProvider
import androidx.media3.datasource.DataSource
import androidx.media3.datasource.DefaultDataSource
import androidx.media3.datasource.DefaultHttpDataSource
import androidx.media3.datasource.cache.CacheDataSource
import androidx.media3.datasource.cache.LeastRecentlyUsedCacheEvictor
import androidx.media3.datasource.cache.SimpleCache
import java.io.File

@OptIn(UnstableApi::class)
object MediaCacheManager {

    private var simpleCache: SimpleCache? = null
    private const val MAX_CACHE_SIZE = 250L * 1024L * 1024L // 250 MB audio cache

    @Synchronized
    fun getCache(context: Context): SimpleCache {
        if (simpleCache == null) {
            val cacheDir = File(context.cacheDir, "media_cache")
            if (!cacheDir.exists()) {
                cacheDir.mkdirs()
            }
            val evictor = LeastRecentlyUsedCacheEvictor(MAX_CACHE_SIZE)
            val databaseProvider = StandaloneDatabaseProvider(context)
            simpleCache = SimpleCache(cacheDir, evictor, databaseProvider)
        }
        return simpleCache!!
    }

    fun createCacheDataSourceFactory(context: Context): DataSource.Factory {
        val httpDataSourceFactory = DefaultHttpDataSource.Factory()
            .setAllowCrossProtocolRedirects(true)
            .setUserAgent("RadioJavanAuto/1.0")

        val upstreamFactory = DefaultDataSource.Factory(context, httpDataSourceFactory)

        return CacheDataSource.Factory()
            .setCache(getCache(context))
            .setUpstreamDataSourceFactory(upstreamFactory)
            .setFlags(CacheDataSource.FLAG_IGNORE_CACHE_ON_ERROR)
    }
}
