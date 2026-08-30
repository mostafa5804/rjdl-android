const fs = require('fs');
let xml = fs.readFileSync('app/src/main/AndroidManifest.xml', 'utf8');

const autoMeta = `
        <meta-data
            android:name="com.google.android.gms.car.application"
            android:resource="@xml/automotive_app_desc" />
`;

xml = xml.replace('</application>', autoMeta + '\n    </application>');
fs.writeFileSync('app/src/main/AndroidManifest.xml', xml, 'utf8');
