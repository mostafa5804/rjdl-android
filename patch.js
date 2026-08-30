const fs = require('fs');
let html = fs.readFileSync('app/src/main/assets/www/index.html', 'utf8');

// Instead of rewriting everything, we can just hook into the system.
// Wait! If the user just wants the notification, and they showed a screenshot where the notification is missing...
