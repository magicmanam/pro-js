<span id="top"><span>
<a href="#base">Base</a> | <a href="#core">Core</a> | <a href="#unit">Unit</a> | <a href="#http">Http</a> | <a href="#tree">Tree</a> | <a href="#load">Load</a> | <a href="#data">Data</a> | <a href="#view">View</a> | <a href="#mvvm">MVVM</a> | <a href="#time">Time</a> >> <a href="tut-by">Example</a>

```html
<!-- Total gzipped & compiled size < 2.5KB -->
<!-- Total original & uncompressed size < 20KB -->
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

### &lt;script src="pro.js">&lt;/script> <span id="base"> |  </span><a href="#top">To top >></a>
 - defines short aliases for popular DOM-methods:

```javascript
pro.id('element-id'); // Gets element by id
pro.class('class-name'); // Gets elements by class name
pro.tag('tag-name'); // Gets elements by tag name
document.on('some-event', fn); // Adds an event listener
document.no('some-event', fn); // Removes an event listener

element.proId('child-element-id'); // Gets child element by id
element.proClass('class-name'); // Gets child elements by class name
element.proSelector('css-selector'); // Gets child elements by specified selector
element.proTag('tag-name'); // Gets child elements by tag name
element.to('attribute', value); // Adds attribute with optional value, e.g. element.to('hidden')
element.out('attribute'); //Removes attribute from element, e.g. element.out('hidden')
element.is('attribute'); // Checks that element has attribute
element.toClass('class-name'); // Adds css-class to element
element.outClass('class-name'); // Removes css-class from element
element.on('event', listener); // Adds an event listener
element.no('event', listener); // Removes an event listener
element.toChildFree(); // Removes all childs (makes an element child free)
```
---

### &lt;script src="pro.core.js">&lt;/script> <span id="core"> |  </span><a href="#top">To top >></a>
 - provides **sync** event-based programming model with on/once/out interface.
Use `pro.core` constructor-function to create new ProJS-like components:

```javascript
var unit = new pro.core();

/* Subscribe on event. If event was triggered, listener is executed
immediately. To override this pass the third 'skipLast' argument as true. */ 
unit.on('event', function (eventData /*, function callback() { 'I am optional'; } */) {
               console.log('Event was triggered: ' + eventData);
             }/*, true */);

// Trigger event. Optional the third callback can be executed after all listeners (* bug here *)
unit.out('event', 23 /*, function () { console.log('Well done!'); } */);
//  Event was triggered: 23
//  Well done!

// One-time listener
unit.once('event', function (eventData) { } /*, true */);
```
 
Use `pro.core` object to register global error handler for all listeners managed by ProJS:
```javascript
pro.core.error(function (err) { console.log(err); });
```
---

### &lt;script src="pro.unit.js">&lt;/script> <span id="unit"> |  </span><a href="#top">To top >></a>
 - introduces unit with *states* concept:

```javascript
var app = new pro.Unit(); // Initializes a new application unit
```

```javascript
app.unit('NewsStore') // Defines 'NewsStore' unit inside of the application
   .out(function () { // Initialization function. 'this' refers to the unit itself
     var me = this;

     this.on('load-news', function (eventModel) {
       var newsModel = retrieveNews(eventModel);
       me.out('news-loaded', newsModel); // Notify all listeners
       //me.newsLoaded(newsModel);
       // Syntax sugar for the line above in case some listener exists
     });
     ...
     // Or notify about smth else
     this.out('any-event', eventDataIsOptional);
   });
```
```javascript
app.unit('NewsList') // Defines 'NewsList' unit
  .on('NewsStore') // Optional method, lists unit's dependencies
  .out(function (newsStore) {
    var me = this;
    
    me.state('no-news') // Defines optional state
        .to(function () { // Execute on entering into the state
           proId('blank-text').out('hidden'); // Removes 'hidden' attribute
        }) // Returns state object with 'out' method
        .out(function () { // Optinal, execute on leaving the state
           proId('blank-text').to('hidden'); // Adds 'hidden' attribute
        }) // Returns current unit object
      .state('news')
        .to(function (news) { ... });
      
    me.to('no-news'); // Go to initial state, if you wish...
      
    newsStore.on('news-loaded', function (newsList) {
       if (newsList && newsList.length > 0) {
         me.to('news', newsList);
       } else {
         me.out('empty'); // Notify 'NewsList' unit subscribers that news list is empty
       }
    });
  });
```

> Define hierarchical states (separated with periods, e.g. 'news.expanded'). See sources for more details.

---

### &lt;script src="pro.http.js">&lt;/script> <span id="http"> |  </span><a href="#top">To top >></a>
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

There are special `pro.http` object events: **'open'**, **'end'**, any **%status code%** (e.g. 403, 500) - to add some HTTP-interceptor:

```javascript
pro.http.on('open', function (request) {
  request.header('Authorization', 'Bearer ' + token); // Adds auth token on each request
});

pro.http.on(401, function () {
  loginUnit.open(); // Sends 'open'-event to loginUnit
});
```
---

### &lt;script src="pro.tree.js">&lt;/script> <span id="tree"> |  </span><a href="#top">To top >></a>
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

### &lt;script src="pro.load.js">&lt;/script> <span id="load"> |  </span><a href="#top">To top >></a>
- subscribes on DOM-tree traversal and loads HTML content for elements with **'pro-load'** tags:

`<div pro-load="news-component.html"></div>`

Content for the element above will be downloaded from the specified url. Nested 'pro-load'-elements are supported, content for them will be loaded immediately.

To handle situations with html missing, subscribe on `pro.load` 404 event:

```javascript
pro.load.on(404, function (elementInfo) {
   // console.log(elementInfo.url + ' was not loaded');
   // elementInfo.element.innerHTML = 'Content is missing';
});
```

Subscribe on success loading event to manipulate with loaded markup:

```javascript
pro.load.on(200, function (elementInfo) {
    // elementInfo.element
    // elementInfo.url
});
```

> You can subscribe on any status code in a similar way.

In case your code unit depends on this markup, use `pro.load` object:

```javascript
pro.load.on('news-component.html', function (newsContainerDiv) {
  // After loading and ALL status code listeners execution
  app.unit('NewsList')
     .on('NewsStore')
     .out(function (newsStore) { ... });
});
```
---

### &lt;script src="pro.data.js">&lt;/script> <span id="data"> |  </span><a href="#top">To top >></a>

- introduces observable wrapper over JS-objects and arrays:

```javascript
var model = { topic: 'Sample', text: 'Observable model' },
    news = pro.data(model); // Or empty observable: 'pro.data();'

news.topic.on(function (topic) {
    // On topic change
}); // See the line below which triggers this listener
news.topic('New topic');

news.on(function (model) {
    // On the whole news change
}); // See the line below which triggers this listener
// As well as the listener above, because topic is changed too
news({ topic: 'New article', text: 'Text' });

// Read current value:
var topic = news.topic(); // Evaluated into 'New article'
var value = news(); // Evaluated into an object: { topic: 'New article', text: 'Text' }
```

- observable arrays:

```javascript
var modelArray = [model],
    newsList = pro.data(modelArray);

newsList[0].topic.on(function (topic) {
    // On the 0-th element's topic change
}); // See the line below which triggers this listener
newsList[0].topic('Indexation as for ordinal array!');

newsList[0].on(function (article) {
    // On the first news change
}); // See the line below which triggers this listener
// As well as the listener above, because topic is changed too
newsList[0]({ topic: 'Whole article changed', text: 'Text' });

newsList.on(function (list) {
    // On news list change
}); // See the line below which triggers this listener
// As well as two listeners above
newsList([]); // * Here I have a bug - only the last listener was executed

// Read current value:
var value = newsList(); // Evaluated into an empty array
```

> Initial object is changed with observable as well.

---

### &lt;script src="pro.view.js">&lt;/script> <span id="view"> |  </span><a href="#top">To top >></a>

- Introduces UI-view which can be binded to model. Sample with markup loaded via `pro-load`:

```javascript
pro.load.once('news-template.html', function (view) {
    'use strict';
    // Define view named 'news-view'
    pro.view.name('news-view')(function () {
            return view.cloneNode(true);
        }) // It was markup-factory function
        .on(function (model) { // Executed on model binding
            this.out('hidden');
            this.proClass('topic')[0].textContent = model.topic;
            this.proClass('text')[0].textContent = model.text;
        });
});
```

Somewhere in body:

```html
    ...
    <article pro-load="news-template.html" hidden></article>
</body>
```

`news-template.html` content:

```html
<h2 class="topic"></h2>
<p class="text"></p>
```

Now you can mention this view in two ways:


1) Imperative way via JS:

```javascript
newsList.forEach(function (newsModel) {
    pro.view.out('news-view', newsModel, function (newsNode) {
        // Model-binded view node is passed
        proId('news-container').appendChild(newsNode);
    });
});
```


2) Declarative way via MVVM-pattern introduced in `pro.mvvm.js`-file below:

---

### &lt;script src="pro.mvvm.js">&lt;/script> <span id="mvvm"> |  </span><a href="#top">To top >></a>

- Model-View-ViewModel implementation. ViewModel here is an observable `pro.data` object binded to HTML-element as following:

```javascript
var viewModel = pro.data({ newsList: [] });

pro.mvvm.to(proId('news-container'), viewModel);
```

Here is how markup looks like:

```html
<div id="news-container">
    <div pro="show(newsList.length === 0)">There are no news to read.</div>
    <div pro="each(newsList, view('news-view'))">
        <!-- Here will be inserted list of news view -->
    </div>
    <div pro="hide(newsList.length === 0)">Happy reading!</div>
</div>
```

`pro`-attributes in markup contain valid JS-expressions with predefined list of hacks: `show`, `hide`, `each`, `view` - for DOM-manipulation with element.
Markup is reevaluated on every model change. Extension point for custom hacks will be added later.

```javascript
viewModel.newsList([{ topic: '...', text: '...' }]);
// The html above will be immediately updated
```
---

### &lt;script src="pro.time.js">&lt;/script> <span id="time"> |  </span><a href="#top">To top >></a>

- contains time-related helpers available via `pro.time` object.

---

## [MIT license](http://opensource.org/licenses/MIT)