# ProJS

Simple and lightweight JS-framework for decomposing your app into code- and html markup- units with fluent interface.


## Features

### `<script src="pro.js"></script>`
 - defines a set of short aliases for often DOM-methods:


```javascript
element.to('attribute', value); // adds attribute with optional value, e.g. element.to('hidden')
element.out('attribute'); // removes attribute from element, e.g. element.out('disabled')
element.is('attribute'); // checks that element has specified attribute
element.toClass('class-name'); // adds css-class to element's class list
element.outClass('class-name'); // removes css-class from element's class list
element.on('event', listener); // adds an event listener
element.no('event', listener); // removes an event listener

element.proId('sub-element-id'); // gets sub element by id
element.proClass('class-name'); // gets sub elements by class name
element.proSelector('css-selector'); // gets elements for specified selector
element.proTag('tag-name'); // gets sub elements by tag name

pro.id('element-id'); // gets element by id
pro.class('class-name'); // gets elements by class name
pro.tag('tag-name'); // gets elements by tag name
document.on('some-event', fn); // adds an event listener
document.no('some-event', fn); // removes an event listener
...
```

### `<script src="pro.unit.js"></script>`
 - core of the framework. Introduces code unit with state- and event-concepts support:


```javascript
parentUnit.unit('NewsList') // Defines a new unit
   .on('NewsStore') // Optional method, points to pro-dependencies (similar units)
   .out(function(newsStore) { // Will be executed upon unit creation ('this' scopes to an unit itself)
     var me = this;
     
     me.state('no-news') // Defines an optional state
             .to(function () { // Will be executed on entering into this state
                proId('blank-text').out('hidden'); // Removes 'hidden' attribute from blank text element
             })
             .out(function () { // Optinal callback to be executed on leaving this state
                proId('blank-text').to('hidden'); // Adds 'hidden' attribute to blank text element
             })
          .state('news')
              .to(function (news) {
                 ...
              });
       
       me.to('no-news'); // Go to initial state
       
       newsStore.on('loaded', function (newsList) { // Subscribes on fresh news
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

### `<script src="pro.http.js"></script>`
 - a sweet wrapper over XMLHttpRequest object (depends on `pro.unit.js`). Available via `pro.http` object:


```javascript
pro.http.to('/api/news') // Defines request to the endpoint
      .on(200, function (response) { 
                  newsStore.out('loaded', response);
               }) 
      .on(204, function () { 
                  newsStore.out('loaded', null);
               }) // Just subscribe on any status code you need
      .on('success|fail|end', callback) // Well-known events
      .header('Content-Type', 'application/json') // Any header is welcome
      .out('get'); // Sends 'GET' request
```

In case you need to add some HTTP interceptor, subscribe on particular event of `pro.http` object ('open', 'end' or %status code% events):


```javascript
pro.http.on('open', function (request) {
  request.header('Authorization', 'Bearer ' + token); // Adds bearer token on each request
});

pro.http.on(401, function () {
  loginUnit.to('open');
});
```

### `<script src="pro.html.js"></script>`
- loads HTML markup by 'pro-html' tags (depends on `pro.http.js`). Sample:

`<div pro-html="news-component.html"></div>`

Content for the element above will be downloaded from the specified url. In case your code unit depends on this markup, use `pro.html` object:

```javascript
pro.html.on('news-component.html', function (newsComponentContainerDiv) { // Execute after markup loading
  
  parentUnit.unit('NewsList')
   .on('NewsStore')
   .out(function(newsStore) { ... });
});
```
   
### <script src="pro.time.js"></script>
Right now contains `Countdown` function. Available via `pro.time` object.

### More features will be included soon...
   
## License

[MIT](http://opensource.org/licenses/MIT)