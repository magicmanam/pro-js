<span id="top"></span>
<strong>Advanced: </strong> <a href="#core">Core</a> | <a href="#http">Http</a> | <a href="#tree">Tree</a> | <a href="#time">Time</a> >> *[Basic](README.md#top)*

### **Smart start**
Look under the framework's hood and try to understand how it is built:

```html
<script src="pro.js"></script>     <!-- DOM-methods aliases -->
<script src="pro.core.js"></script><!-- Framework core -->
<script src="pro.unit.js"></script><!-- App units with states and DI -->
<script src="pro.http.js"></script><!-- Sweet HTTP client -->
<script src="pro.tree.js"></script><!-- DOM-tree traversal -->
<script src="pro.load.js"></script><!-- Dynamic markup loading -->
<script src="pro.data.js"></script><!-- Observable objects -->
<script src="pro.view.js"></script><!-- Model-bindable UI-unit -->
<script src="pro.mvvm.js"></script><!-- Lightweight & simple MVVM -->
<script src="pro.time.js"></script><!-- Time-functions -->
```
---

### **pro.core** <span id="core"></span> | <a href="#top">To top >></a>
 - provides **sync** event-based programming model with *fluent* `on/once/no/out` interface.
Use `pro.core` constructor-function to create complex ProJS-like components:

```javascript
var unit = new pro.core();

/* Subscribe on event. If event was triggered, listener is executed
immediately. To override this pass the third 'skipLast' argument as true. */ 
unit.on('event', function (eventData /*, function callback() { 'I am optional'; } */) {
               console.log('Event was triggered: ' + eventData);
             }/*, true */);

// Triggers event. Optional the third callback can be executed after all listeners (* bug here *)
unit.out('event', 23 /*, function () { console.log('Well done!'); } */);
//  Event was triggered: 23
//  Well done!

// One-time listener
function listener(eventData) { }
unit.once('event', listener /*, true */);

// Removes specified listener from regular- and once- listeners
unit.no('event', listener);
```
 
Use `pro.core` object to register global error handler for all listeners managed by ProJS:
```javascript
pro.core.error(function (err) { console.log(err); });
```
---

### **pro.http** <span id="http"> |  </span><a href="#top">To top >></a>
 - a sweet wrapper over *XMLHttpRequest* object available via `pro.http` object:
 
```javascript
this.on('load-news', function (eventModel, callback) {
  pro.http.to('/api/news') // Defines request to the endpoint
     .on(200, function (response) { // On HTTP 200 status code
                newsStore.out('news-loaded', response);
                callback(); // newsStore.out('load-news', null, callback);
              }) 
     .on(204, function () { 
                newsStore.out('news-loaded', null);
                callback();
              }) // Subscribe on any HTTP status
     .on('success|fail|end', callback) // Three well-known events
     .header('Content-Type', 'application/json') // Any header is welcome
     .get(); // Sends 'GET' request
}); // This is how 'NewsStore' unit's code can be enhanced
```

Send other types of requests:
```javascript
pro.http.to('api/news')
   .post({ topic: 'ProJS framework released!',
           text: 'Good news for all of you!' })
   //.put({ text: 'Frontend future is elegant with ProJS!' })
   //.delete({ text: 'Angular + React + VueJS' })
   //.out('%HTTP_VERB%', data); // - Generic request
```

There are special `pro.http` object events: **'open'** - before request start, **'send'** - right after request send, **'end'** - after response received and all callbacks completed, any **%status code%** (e.g. 403, 500) - to add some HTTP-interceptor:

```javascript
pro.http.on('open', function (request) {
  request.header('Authorization', 'Bearer ' + token); // Adds auth token on each request
});

pro.http.on(401, function () {
  loginUnit.open(); // Sends 'open'-event to loginUnit
});
```
---

### **pro.tree** <span id="tree"> |  </span><a href="#top">To top >></a>
 - performs in depth DOM-tree traversal for DOM preprocessing:
 
 ```javascript
 // In case you have some custom logic
 pro.tree.on('node', function (element) {
    // Your logic with node here
 });

 pro.tree.on('end', function () {
    // Tree was traversed and all nodes are processed..
 });

 // Initialize tree traversal for elements:
 pro.tree.depth(document.children);

 // In case you need a new 'tree', create it
 var tree = pro.tree.new();
 // Use 'tree' variable as 'pro.tree' object above
 ```

 > Pro-philosophy: see in sources of `pro.load.js` file below how to use `pending` event for advanced scenarios.

---

### **pro.time** <span id="time"> |  </span><a href="#top">To top >></a>
- contains time-related helpers available via `pro.time` object.

---

### **More pro-functions**

```javascript
pro.safe(callback)(); // Safe function wrapper to avoid 'callback is not defined' exceptions
pro.JSON(function (jsonObject) { ... }); // See sources for more details :)
```

Extends Array objects:

```javascript
var list = [1, 4, 23];
list.remove(23); // Removes specified element(s) from array
```

## [MIT license](http://opensource.org/licenses/MIT)