const fs = require('fs');
let xml = fs.readFileSync('app/src/main/AndroidManifest.xml', 'utf8');

const serviceXml = `
        <meta-data
            android:name="androidx.media3.session.service"
            android:value="androidx.media3.session.MediaLibraryService" />
        <service
            android:name=".service.PlaybackService"
            android:exported="true"
            android:foregroundServiceType="mediaPlayback"
            android:permission="android.permission.FOREGROUND_SERVICE">
            <intent-filter>
                <action android:name="androidx.media3.session.MediaLibraryService" />
                <action android:name="androidx.media3.session.MediaSessionService" />
                <action android:name="android.media.browse.MediaBrowserService" />
            </intent-filter>
        </service>
`;

xml = xml.replace('</application>', serviceXml + '\n    </application>');
fs.writeFileSync('app/src/main/AndroidManifest.xml', xml, 'utf8');
