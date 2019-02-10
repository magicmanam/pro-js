# ProJS

Simple and lightweight JS-framework for decomposing app into code- and html markup- *units* with fluent interface.
The framework is made of several `pro.*.js` files with total size *<4KB gzipped and <18KB uncompressed*.

```html
    <script src="pro.js"></script><!-- DOM-methods aliases -->
    <script src="pro.core.js"></script><!-- Framework's heart... -->
    <script src="pro.unit.js"></script><!-- Extends pro.core with states -->
    <script src="pro.http.js"></script><!-- Sweet HTTP client -->
    <script src="pro.tree.js"></script><!-- DOM processing -->
    <script src="pro.load.js"></script><!-- Dynamic markup loading -->
    <script src="pro.mvvm.js"></script>
    <script src="pro.data.js"></script><!-- Observable objects -->
    <script src="pro.time.js"></script><!-- Time-functions -->
```

## Pro features per files

### &lt;script src="pro.js">&lt;/script>
 - defines short aliases for popular DOM-methods:


```javascript
element.to('attribute', value); // adds attribute with optional value, e.g. element.to('hidden')
element.out('attribute'); // removes attribute from element, e.g. element.out('disabled')
element.is('attribute'); // checks that element has specified attribute
element.toClass('class-name'); // adds css-class to element
element.outClass('class-name'); // removes css-class from element
element.on('event', listener); // adds an event listener
element.no('event', listener); // removes an event listener

element.proId('sub-element-id'); // gets sub element by id
element.proClass('class-name'); // gets sub elements by class name
element.proSelector('css-selector'); // gets elements by specified selector
element.proTag('tag-name'); // gets sub elements by tag name

pro.id('element-id'); // gets element by id
pro.class('class-name'); // gets elements by class name
pro.tag('tag-name'); // gets elements by tag name
document.on('some-event', fn); // adds an event listener
document.no('some-event', fn); // removes an event listener
```
---

### &lt;script src="pro.core.js">&lt;/script>
 - provides **sync** event-based programming model with on/once/out interface.
 `pro.core` constructor-function can be used to create new ProJS-like components:

 ```javascript
 var module = new pro.core();

 /* subscribe on event. By default listener will be executed immidiately for the last event's data if event was already triggered.
To override this behavior pass the third parameter 'skipLast' = true */ 
 module.on('event', function (eventData) {
							console.log('Event was triggered: ' + eventData);
						}, /* skipLast */);

//trigger event. Pass optional callback as the third argument to be executed after all 'event'-listeners
 module.out('event', 23 /*, function () { console.log('Well done!'); } */);
 // Console output:
 //    Event was triggered: 23
 //    Well done!
 
 //One-time listener
 module.once('event', function (eventData) { } /*, skipLast */);
 ```
 
 `pro.core` object allows to register global error handler for all listeners added via `on` and `once` as well as for `out` callbacks:
```javascript
pro.core.error(function (err) { console.log(err); });
```

---

### &lt;script src="pro.unit.js">&lt;/script> (depends on **pro.core.js**)
 - introduces unit with *states model*:

```javascript
 var app = new pro.Unit(); // Initializes a new application unit
```

```javascript
 app.unit('NewsStore') // Defines 'NewsStore' unit inside of the application unit
    .out(function () { // Initialization function. 'this' refers to the unit itself
       var me = this;
       // Below is a sample of subscription on some event
       this.on('some-event', function (eventModel) {
         // Just imagine that 'retrieveNews' function somewhere exists
	 var newsModel = retrieveNews(eventModel);
	 // Notify all subscribers that news are loaded
         me.out('newsLoaded', newsModel);
         //me.newsLoaded(newsModel); - shortcut for the line above. Available only if some listener is already exist!!! 
       });
       ...
       // Or notify about smth else
       this.out('any-event', withOptionalEventDataObject);
    });
```

```javascript
app.unit('NewsList') // Defines another 'NewsList' unit
   .on('NewsStore') // Optional method, points to unit's dependencies
   .out(function (newsStore) {
     var me = this;
     
     me.state('no-news') // Defines an optional state
             .to(function () { // Will be executed on entering into this state
                proId('blank-text').out('hidden'); // Removes 'hidden' attribute from blank text
             })
             .out(function () { // Optinal callback to be executed on leaving this state
                proId('blank-text').to('hidden'); // Adds 'hidden' attribute to blank text element
             })
          .state('news')
              .to(function (news) {
                 ...
              });
       
       me.to('no-news'); // Go to initial state if you wish...
       
       newsStore.on('newsLoaded', function (newsList) { // Subscribes on fresh news
          if (newsList && newsList.length > 0) {
            me.to('news', newsList);
          }
          else
          {
            me.out('empty'); // Notify 'NewsList' unit subscribers that news control is empty
          }
       });
    }
```

*Also you can define hierarchical states (like 'news.expanded' and so on). Please see sources to have more details.*
---

### &lt;script src="pro.http.js">&lt;/script> (depends on **pro.core.js**)
 - a sweet wrapper over *XMLHttpRequest* object. Available via `pro.http` object:


```javascript
     // Below is how 'NewsStore' unit's code can be enhanced
     this.on('some-event', function (eventModel) {
	pro.http.to('/api/news') // Defines request to the endpoint
	      .on(200, function (response) { 
			  newsStore.out('newsLoaded', response);
		       }) 
	      .on(204, function () { 
			  newsStore.out('newsLoaded', null);
		       }) // Just subscribe on any status code you need
	      .on('success|fail|end', callback) // Well-known events
	      .header('Content-Type', 'application/json') // Any header is welcome
	      .get(); // Sends 'GET' request
     });
```

Send other types of requests:
```javascript
	pro.http.to('api/news')
		.post({ title: 'ProJS framework released!', text: 'Good news for all of you!' })
		//.put({ text: 'Frontend future is elegant with ProJS!' })
		//.delete({ text: 'Angular + React + VueJS' })
		//.out('%HTTP_VERB%', data); // - generic request
```

There are special `pro.http` object events: **'open'**, **'end'**, any **%status code%** (e.g. 403, 500) - to add some HTTP-interceptor:


```javascript
pro.http.on('open', function (request) {
  request.header('Authorization', 'Bearer ' + token); // Adds bearer token on each request
});

pro.http.on(401, function () {
  loginUnit.to('open');
});
```
---

### &lt;script src="pro.tree.js">&lt;/script> (depends on **pro.core.js**)
 - performs in depth DOM-tree traversal for DOM preprocessing:
 
 ```javascript
 //Initializes tree traversal
 pro.tree.depth(document.children);

 //In case you need to add some custom logic
 pro.tree.on('node', function (element) {
 	 //Your logic here;
 });
 ```
---

### &lt;script src="pro.load.js">&lt;/script> (depends on **pro.http.js** and **pro.tree.js**)
- subscribes on DOM-tree traversal and loads HTML markup content for elements with **'pro-load'** tags:

`<div pro-load="news-component.html"></div>`

Content for the element above will be downloaded from the specified url. In case your code unit depends on this markup, use `pro.load` object:

```javascript
pro.load.on('news-component.html', function (newsContainerDiv) {
  // Execute after markup loading

  parentUnit.unit('NewsList')
   .on('NewsStore')
   .out(function (newsStore) { ... });
});
```

To handle situations with html missing, subscribe on `pro.load` 404 status code:

```javascript
pro.load.on(404, function (elementInfo) {
	//console.log(elementInfo.url + ' was not loaded.');
	//elementInfo.element.innerHTML = 'Content is missing.';
});
```

Subscribe on success loading event to manipulate with DOM-element:

```javascript
pro.load.on(200, function (elementInfo) {
	//elementInfo.element
	//elementInfo.url
});
```
---

### &lt;script src="pro.data.js">&lt;/script> (depends on **pro.core.js**)

- introduces observable model:

``` javascript
var model = { topic: 'Sample', text: 'Observable model' },
    article = new pro.data(model);// or just empty observable: 'new pro.data();'

article();// returns model object: { topic: 'Sample', text: 'Observable model' }
article.topic();// returns topic string: 'Sample'

article.on(function (model) {
	// all article's model was changed
});
article({ topic: 'New article', text: '' });// triggers the callback above

article.topic.on(function (topic) {
	// only topic was changed
});//Subscribe on some property change
article.topic('New topic');// triggers the callback above

```

---

### &lt;script src="pro.time.js">&lt;/script>

- contains time-related helpers. Available via `pro.time` object.

---

### More features are coming soon...


## License

[MIT](http://opensource.org/licenses/MIT)