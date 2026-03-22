// Passenger entry point — routing/endpoints/authorization ONLY
// All business logic lives in /scripts/
require('dotenv').config();

const { app } = require('./dist/app');

// Passenger listens automatically — no port needed
app.listen();
