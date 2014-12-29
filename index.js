/*
 * Return express middleware that measures overall performance.
 *
 *  The `options`-argument is optional.
 *  * You can set `timeByUrl`, that add a timer per URL template (ex:
 *    `/api/:username/:thingie`). This can be changed run-time by setting
 *    `res.locals.statsdUrlKey`.
 *
 *  Adapted by work from Ross Kukulinski
 *  See: https://github.com/rosskukulinski/lynx-express
 * 
 * Original License:
 * 
 * Copyright © 2012, Morten Siebuhr <sbhr@sbhr.dk>
 * 
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 * LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 * OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 * PERFORMANCE OF THIS SOFTWARE.
 */

function factory(client) { // Client is a Lynx StatsD client
  return function (options) {
    options = options || {};
    var timeByUrl = options.timeByUrl || false;

    return function (req, res, next) {
      var startTime = new Date();
      var endTime;

      // Shadow end request
      var end = res.end;
      res.end = function () {
        end.apply(res, arguments);

        // Time by URL?
        if (timeByUrl) {
          var routeName = "unknown_express_route";

          // Did we get a harc-coded name, or should we figure one out?
          if (res.locals && res.locals.statsdUrlKey) {
            routeName = res.locals.statsdUrlKey;
          } else if (req.route && req.route.path) {
            routeName = req.route.path;
            if (Object.prototype.toString.call(routeName) === '[object RegExp]') {
              // Might want to do some sanitation here?
              routeName = routeName.source;
            }
            if (routeName === "/") {
              routeName = "root";
            }
            routeName = req.method + '.' + routeName;
          }
          else if (req.url) { // Required to pickup static routes
            routeName = req.method + '.' + req.url;
          }

          // personnal hack : get version of the web service
          if (req.params && req.params.version) {
                routeName = routeName.replace(/:version/g, req.params.version)
          }
          // Get rid of : in route names, remove first and last /,
          // and replace rest with _.
          
          routeName = routeName.replace(/:/g, "_").replace(/^\/|\/$/g, "_").replace(/\//g, ".");
          endTime = new Date();
          var duration = endTime - startTime;
          client.timing('response_time_code.' + routeName + '.' + res.statusCode + '.time', duration);
         
        } else {
            endTime = new Date();
            client.timing('response_time', endTime - startTime);
            client.increment('response_code.' + res.statusCode);

        }
      };
      next();
    };
  };
}

module.exports = factory;
