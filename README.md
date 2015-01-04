express-lynx
============

Express Middleware for sending data to StatsD.

Please refer to the [Lynx](https://github.com/dscape/lynx) documentation for more in depth details for configuring
the Lynx StatsD Client.

Once your client is configured, it's pretty straight forward to configure express-lynx.

Installation:

```
npm install express-lynx
```

Configuration:

```javascript

// Import lynx and express-lynx
var lynx = require('lynx');
var expressLynx = require('express-lynx');

// Setup your Lynx StatsD client as normal, optionally passing a prefix (like 'express'), or [hostname] (http://nodejs.org/api/os.html#os_os_hostname)
var metrics = new lynx('localhost', 8125, {prefix: 'express'});

// Create the Express middleware passing in the Lynx StatsD Client you created
var statsdMiddleware = expressLynx(metrics);

// Tell Express to use your statsD middleware
server.use(statsdMiddleware());
```

By default express-lynx will track the counts for each response code and a response time for the overall system.
What's more useful is to have timing for each route in your Express app.  express-lynx can be configured to give you
per-route timing by adding an option timeByUrl to the middleware constructor.
```javascript
server.use(statsdMiddleware({timeByUrl: true})}
```
