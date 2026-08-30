const fs = require('fs');
let kt = fs.readFileSync('app/src/main/java/com/example/service/PlaybackService.kt', 'utf8');

kt = kt.replace('sendBroadcast(android.content.Intent("com.example.ACTION_NEXT"))', 'sendBroadcast(android.content.Intent("com.example.ACTION_NEXT").apply { setPackage(packageName) })');
kt = kt.replace('sendBroadcast(android.content.Intent("com.example.ACTION_PREV"))', 'sendBroadcast(android.content.Intent("com.example.ACTION_PREV").apply { setPackage(packageName) })');

fs.writeFileSync('app/src/main/java/com/example/service/PlaybackService.kt', kt, 'utf8');
