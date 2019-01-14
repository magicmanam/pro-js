# ProJS

Simple and lightweight JS-framework for decomposing app into code- and html markup- *units* with fluent interface.
The framework is made of several `pro.*.js` files with total size *<3KB gzipped and <14KB uncompressed*.


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

### &lt;script src="pro.unit.js">&lt;/script>
 - introduces code unit with *states and event-based model*:

```javascript
 var app = new pro.Unit(); // Initializes a new application unit
```

```javascript
 app.unit('NewsStore') // Defines 'NewsStore' unit inside of the application unit
    .out(function () { // Initialization function. 'this' refers to the unit 
       var me = this;
       // Below is a sample of subscription on some event
       this.on('some-event', function (eventModel) {
         // Just imagine that 'retrieveNews' function somewhere exists
	 var newsModel = retrieveNews(eventModel);
	 // Notify all subscribers that news are loaded
         me.out('newsLoaded', newsModel);
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
---

### &lt;script src="pro.http.js">&lt;/script> (depends on **pro.unit.js**)
 - a sweet wrapper over _XMLHttpRequest_ object. Available via `pro.http` object:


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
	      .out('get'); // Sends 'GET' request
     });
```

There are special `pro.http` object events: *'open'*, *'end'*, any *%status code%* (e.g. 403, 500) - to add some HTTP-interceptor:


```javascript
pro.http.on('open', function (request) {
  request.header('Authorization', 'Bearer ' + token); // Adds bearer token on each request
});

pro.http.on(401, function () {
  loginUnit.to('open');
});
```
---

### &lt;script src="pro.html.js">&lt;/script> (depends on **pro.http.js**)
- loads HTML markup by *'pro-html'* tags:

`<div pro-html="news-component.html"></div>`

Content for the element above will be downloaded from the specified url. In case your code unit depends on this markup, use `pro.html` object:

```javascript
pro.html.on('news-component.html', function (newsContainerDiv) {
  // Execute after markup loading

  parentUnit.unit('NewsList')
   .on('NewsStore')
   .out(function (newsStore) { ... });
});
```

To handle situations with html missing, subscribe on `pro.html` 404 status code:

```javascript
pro.html.on(404, function (elementInfo) {
	//console.log(elementInfo.url + ' was not loaded.');
	//elementInfo.element.innerHTML = 'Content is missing.';
});
```

Subscribe on success loading event to manipulate with DOM-element:

```javascript
pro.html.on(200, function (elementInfo) {
	//elementInfo.element
	//elementInfo.url
});
```
---

### &lt;script src="pro.time.js">&lt;/script>

- contains time-related helpers. Available via `pro.time` object.

---

### More features are coming soon...


## License

[MIT](http://opensource.org/licenses/MIT)
