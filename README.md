```html
<!-- Total size < 4KB gzipped or < 18KB uncompressed -->
<script src="pro.js"></script>     <!-- DOM-methods aliases -->
<script src="pro.core.js"></script><!-- Framework's heart... -->
<script src="pro.unit.js"></script><!-- App units with states and DI -->
<script src="pro.http.js"></script><!-- Sweet HTTP client -->
<script src="pro.tree.js"></script><!-- DOM-tree traversal -->
<script src="pro.load.js"></script><!-- Dynamic markup loading -->
<script src="pro.mvvm.js"></script>
<script src="pro.data.js"></script><!-- Observable objects -->
<script src="pro.time.js"></script><!-- Time-functions -->
```

## Framework features per files

### &lt;script src="pro.js">&lt;/script>
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
```
---

### &lt;script src="pro.core.js">&lt;/script>
 - provides **sync** event-based programming model with on/once/out interface.
Use `pro.core` constructor-function to create new ProJS-like components:

```javascript
var unit = new pro.core();

/* Subscribe on event. If event was triggered, listener is executed
immediately. To override this pass the third 'skipLast' argument as true. */ 
unit.on('event', function (eventData) {
               console.log('Event was triggered: ' + eventData);
             }/*, true */);

// Trigger event. Optional the third callback can be executed after all listeners
unit.out('event', 23 /*, function () { console.log('Well done!'); } */);
//  Event was triggered: 23
//  Well done!

// One-time listener
unit.once('event', function (eventData) { } /*, true */);
```
 
Use `pro.core` object to register global error handler for all listeners added via `on` / `once` as well as for `out` callbacks:
```javascript
pro.core.error(function (err) { console.log(err); });
```
---

### &lt;script src="pro.unit.js">&lt;/script> (depends on **pro.core.js**)
 - introduces unit with *states* concept:

```javascript
var app = new pro.Unit(); // Initializes a new application unit
```

```javascript
app.unit('NewsStore') // Defines 'NewsStore' unit inside of the application
   .out(function () { // Initialization function. 'this' refers to the unit itself
     var me = this;

     this.on('some-event', function (eventModel) {
       var newsModel = retrieveNews(eventModel);
       me.out('newsLoaded', newsModel); // Notify all listeners
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
        })
        .out(function () { // Optinal, execute on leaving the state
           proId('blank-text').to('hidden'); // Adds 'hidden' attribute
        })
      .state('news')
        .to(function (news) { ... });
      
    me.to('no-news'); // Go to initial state, if you wish...
      
    newsStore.on('newsLoaded', function (newsList) {
       if (newsList && newsList.length > 0) {
         me.to('news', newsList);
       } else {
         me.out('empty'); // Notify 'NewsList' unit subscribers that news list is empty
       }
    });
  }
```

> You can define hierarchical states (separated with periods, e.g. 'news.expanded'). See sources for more details.
---

### &lt;script src="pro.http.js">&lt;/script> (depends on **pro.core.js**)
 - a sweet wrapper over *XMLHttpRequest* object available via `pro.http` object:
 
```javascript
this.on('some-event', function (eventModel) {
  pro.http.to('/api/news') // Defines request to the endpoint
     .on(200, function (response) { // On HTTP 200 status code
                newsStore.out('newsLoaded', response);
              }) 
     .on(204, function () { 
                newsStore.out('newsLoaded', null);
              }) // Subscribe on any HTTP status
     .on('success|fail|end', callback) // Three well-known events
     .header('Content-Type', 'application/json') // Any header is welcome
     .get(); // Sends 'GET' request
}); // This is how 'NewsStore' unit's code can be enhanced
```

Send other types of requests:
```javascript
pro.http.to('api/news')
   .post({ title: 'ProJS framework released!',
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

### &lt;script src="pro.tree.js">&lt;/script> (depends on **pro.core.js**)
 - performs in depth DOM-tree traversal for DOM preprocessing:
 
 ```javascript
 // Initialize tree traversal
 pro.tree.depth(document.children);

 // In case you need to add some custom logic
 pro.tree.on('node', function (element) {
    // Your logic here;
 });
 ```
---

### &lt;script src="pro.load.js">&lt;/script> (depends on **pro.http.js** and **pro.tree.js**)
- subscribes on DOM-tree traversal and loads HTML content for elements with **'pro-load'** tags:

`<div pro-load="news-component.html"></div>`

Content for the element above will be downloaded from the specified url. In case your code unit depends on this markup, use `pro.load` object:

```javascript
pro.load.on('news-component.html', function (newsContainerDiv) {
  // Execute after markup loading
  app.unit('NewsList')
     .on('NewsStore')
     .out(function (newsStore) { ... });
});
```

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
---

### &lt;script src="pro.data.js">&lt;/script> (depends on **pro.core.js**)

- introduces observable model:

```javascript
var model = { topic: 'Sample', text: 'Observable model' },
    article = new pro.data(model); // Or empty observable: 'new pro.data();'

article(); // Returns model object: { topic: ..., text: ... }
article.topic(); // Returns topic string: 'Sample'

article.on(function (model) {
    // On the whole article's model change
});
article.topic.on(function (topic) {
    // On topic change
});

article.topic('New topic'); // Triggers the last listener only
article({ topic: 'New article', text: '' }); // Triggers two listeners
```
---

### &lt;script src="pro.time.js">&lt;/script>

- contains time-related helpers available via `pro.time` object.
---

## [MIT license](http://opensource.org/licenses/MIT)