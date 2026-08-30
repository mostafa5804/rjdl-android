const fs = require('fs');
let kt = fs.readFileSync('app/src/main/java/com/example/MainActivity.kt', 'utf8');

const receiverCode = `
    private val playbackReceiver = object : android.content.BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            when (intent?.action) {
                "com.example.ACTION_NEXT" -> webView?.evaluateJavascript("if(window.playNextInQueue){window.playNextInQueue();}", null)
                "com.example.ACTION_PREV" -> webView?.evaluateJavascript("if(window.playPrevInQueue){window.playPrevInQueue();}", null)
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {`;

kt = kt.replace('    override fun onCreate(savedInstanceState: Bundle?) {', receiverCode);

const registerCode = `
        enableEdgeToEdge()
        val filter = android.content.IntentFilter().apply {
            addAction("com.example.ACTION_NEXT")
            addAction("com.example.ACTION_PREV")
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(playbackReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            registerReceiver(playbackReceiver, filter)
        }`;
kt = kt.replace('        enableEdgeToEdge()', registerCode);

const destroyCode = `
    override fun onDestroy() {
        super.onDestroy()
        unregisterReceiver(playbackReceiver)`;
kt = kt.replace('    override fun onDestroy() {\n        super.onDestroy()', destroyCode);

fs.writeFileSync('app/src/main/java/com/example/MainActivity.kt', kt, 'utf8');
