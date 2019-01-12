# ProJS

ProJS is a simple and lightweight JS-framework which decomposes your app into a set of code units and html markups with DI support.
It is a modular itself, so can be embedded partially - just select any features you need.


## Features

### `<script src="pro.js"></script>`
 - defines a set of short aliases for often DOM-methods:


```javascript
pro.id('element-id'); // gets element by id
pro.class('class-name'); // gets elements by class name
pro.tag('tag-name'); // gets elements by tag name

element.in('attribute', optionalValue); // adds attribute with optional value to element (like "element.in('hidden')")
element.out('attribute'); // removes attribute from element (like "element.out('disabled')")
element.is('attribute'); // checks that element has specified attribute
element.inClass('class-name'); // adds css-class to element's class list
element.outClass('class-name'); // removes css-class from element's class list
element.on('event', listener); // adds an event listener to element
element.no('event', listener); // removes an event listener from element

element.proId('sub-element-id');
element.proClass('class-name'); // gets sub elements by class name
element.proSelector('css-selector'); // gets elements for specified selector
element.proTag('tag-name'); // gets sub elements by tag name

document.on('some-event', fn); // adds an event listener
document.no('some-event', fn); // removes an event listener
...
```

### `<script src="pro.unit.js"></script>`
 - core component of the framework. Defines some application unit and operates with state- and event-concepts:


```javascript
parentUnit.unit('NewsList') // Defines a new unit based on some parent
   .on('NewsStore') // Optional list of dependencies
   .out(function(newsStore) { // Unit function which is applied upon unit creation ('this' refers to an unit itselft)
     var me = this;
     
     me.state('no-news') // Defines an optional state for this unit (optional)
             .in(function () { // Defines callback to be executed on entering into this state
                proId('blank-text').out('hidden'); // Show blank text element (removes 'hidden' attribute)
             })
             .out(function () { // Optinal callback to be executed on leaving this state
                proId('blank-text').in('hidden'); // Hide blank text element (adds 'hidden' attribute)
             })
          .state('news')
              .in(function (news) {
              })
              .out
       
       me.in('no-news'); // Go to this state as default
       
       newsStore.on('loaded', function (newsList) { // Subscribe on load of fresh news
          if (newsList && newsList.length > 0) {
            me.in('news', newsList);
          }
          else
          {
            me.out('empty'); // Notify 'NewsList' unit subscribers that news control is emplty
          }
       });      
    }
```

### `<script src="pro.http.js"></script>`
 - a sweet wrapper over XMLHttpRequest object. Available via `pro.http` object:

```javascript
pro.http
      .in('/api/news') // Defines request in the specified endpoint
      .on(200, function (response) { newsStore.out('loaded', response); }) 
      .on(204, function () { newsStore.out('loaded', null); }) // Just subscribe on any status code you need
      .on('success|fail|end', callback) // Well-known events
      .header('Content-Type', 'application/json')
      .out('get'); // Finally sends 'GET' request
```

In case you need to add some HTTP interceptor, just subscribe on particular event of `pro.http` object (supported 'open', 'end', %status code% events):
```javascript
pro.http.on('open', function (request) {
  request.header('Authorization', 'Bearer ' + token); // Adds bearer token on each request
});

pro.http.on(401, function () {
  loginUnit.in('open');
});
```

### `<script src="pro.html.js"></script>`
- loads HTML markup by 'pro-html' tags with markup source url:

`<div pro-html="news-component.html"></div>`

In case your unit depends on this markup, just use `pro.html` object:

```javascript
pro.html.on('news-component.html', function (newsComponentElement) { // Perform markup loading
  parentUnit.unit('NewsList')
   .on('NewsStore')
   .out(function(newsStore) { ... });
});
```
   
### <script src="pro.time.js"></script>
Right now contains `Countdown` function available via `pro.time` object

### More feature will be included soon...
   
## License

[MIT](http://opensource.org/licenses/MIT)
