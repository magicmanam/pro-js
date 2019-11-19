<span id="top"></span>
<strong>Advanced: </strong> <a href="#core">Core</a> | <a href="#http">Http</a> | <a href="#tree">Tree</a> | <a href="#time">Time</a> >> *[Basics](README.md#top)* | *[FAQs](FAQs.md#top)*

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

```javascript
function oneTimeListener(eventData) { }
coreInstance.once('event', oneTimeListener /*, skipLast */);
// skipLast - optional boolean argument

// Removes specified listener from regular- and once- listeners
coreInstance.no('event', oneTimeListener);
```
 
Use `pro.core` object to register global error handler for all listeners:
```javascript
pro.core.error(function yourGlobalErrorHandler({ error: thrownException, core: coreInstanceWhereExceptionWasOccurred }) { console.log('I am catching all errors!'); });

// Or subscribe on some particular core instance errors
pro.core.error(coreInstance, function catchAllErrorsInSpecifiedCoreInstance({ error: thrownException, core: coreInstanceWhereExceptionWasOccurred }) { ... });
```
---

### **pro.http** <span id="http"> |  </span><a href="#top">To top >></a>
A sweet wrapper over *XMLHttpRequest* object available via `pro.http` object:
 
```javascript
this.on('load-news', function (eventModel, callback) {
  pro.http.to('/api/news') // Defines request to the endpoint
     .on(200, function (response) { // On HTTP 200 status code
                newsStore.out('news-loaded', response.data);
                callback(); // newsStore.out('load-news', null, callback);
              }) 
     .on(204, function () { 
                newsStore.out('news-loaded', null);
                callback();
              }) // Subscribe on any HTTP status
     .on('success|redirect|fail|end', callback) // Three well-known events
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
pro.http.on('open', function (httpInstance) {
  httpInstance.header('Authorization', 'Bearer ' + token); // Adds auth token on each request
});

pro.http.on(401, function () {
  loginUnit.open(); // Sends 'open'-event to loginUnit
});
```

There is a special `pending` global event which is triggered before and after any request:

```javascript
pro.http.on('pending', function yourListener(count) {
  // count parameter contains number of pending requests at the moment
  if (count === 0) { // sample of using
    //hideLoader();
  } else {
    //showLoader();
  }
});
```

Full `pro.http`-events lifecycle:

```javascript
var httpInstance = pro.http.to('server-url')
                           .on(200, function () { })
                           .get();

// Events subscription in the order as they will be launched:
pro.http.on('open', function (httpInstance) { /* Request was opened */ });
pro.http.on('pending', function (pendingRequestsCount) {});
pro.http.on('send', function (httpInstance) { /* Request was sent */ });

// Now server is processing your request

pro.http.on('pending', function (pendingRequestsCount) { /* Response was received */ });

httpInstance.on(200 /* 500 or other http code */, function ({ data: responseText, status: httpStatus, url, requestUrl }) {});
pro.http.on(200 /* 500 or other http code */, function (responseText) {}); // Please do not ask me why this callback is being received response text and not the object as listener above

httpInstance.on('success|redirect|fail', function ({ data: responseText, status: httpStatus, url, requestUrl }) {});
pro.http.on('success|redirect|fail', function ({ data: responseText, status: httpStatus, url, requestUrl }) {});
// 'success' < 300
// 300 <= 'redirect' < 400
// 'fail' >= 400

httpInstance.on('end', function ({ data: responseText, status: httpStatus, url, requestUrl }) {});
pro.http.on('end', function ({ data: responseText, status: httpStatus, url, requestUrl }) {});
```

All Http errors (status codes >= 400) also throw JS-exception by default in you application and can be caught by global error handler, unless you explicitly suppress it:

```
pro.http.suppressErrors = true; // Now any http error does not throw JS-exception
```
---

### **pro.tree** <span id="tree"> |  </span><a href="#top">To top >></a>
Performs in depth DOM-tree traversal for DOM preprocessing:
 
 ```javascript
 // In case you have some custom logic
 pro.tree.on('node', function (element) {
    // Your logic with node here
 });

 pro.tree.on('end', function () {
    // Tree was traversed and all nodes are processed..
 });

 // Initialize tree traversal for all DOM-elements:
 pro.tree.document();

 // Above line is the alias for the following
 pro.tree.depth(document.children);
 // depth-method accepts array of elements to be traversed which can be used for any elements array

 // In case you need a new 'tree', just create it:
 var tree = pro.tree.new();
 // Now use tree-variable as 'pro.tree' object above
 tree.depth(element.children); // Initialize traversal on element's children
 tree.depth([element]); // In case you need traverse element itself with its children
 ```

 > Pro-philosophy: see in sources of `pro.load.js` file below how to use `pending` event for advanced scenarios.

---

### **pro.time** <span id="time"> |  </span><a href="#top">To top >></a>
Contains time-related helpers available via `pro.time` object.

---

### **More pro-functions**

```javascript
pro.safe(callback)(); // Safe function wrapper to avoid 'callback is not defined' exceptions
pro.JSON(function (jsonObject) { ... }); // See sources for more details :)
```

Array extensions:

```javascript
var list = [1, 4, 23];

list.remove(23); // Removes specified element(s) from array

var newList = list.clone(); // Creates a shallow copy
```

## [MIT license](http://opensource.org/licenses/MIT)