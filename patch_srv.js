const fs = require('fs');
let kt = fs.readFileSync('app/src/main/java/com/example/service/PlaybackService.kt', 'utf8');

const oldStart = `if (isPlaying) {
                    val intent = Intent(this@PlaybackService, PlaybackService::class.java)
                    startService(intent)
                }`;
kt = kt.replace(oldStart, `// Auto handled by Media3`);

fs.writeFileSync('app/src/main/java/com/example/service/PlaybackService.kt', kt, 'utf8');
