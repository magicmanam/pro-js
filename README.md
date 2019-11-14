<span id="top"></span>
<strong>Basics: </strong> <a href="#core">Core</a> | <a href="#unit">Unit</a> | <a href="#load">Load</a> | <a href="#data">Data</a> | <a href="#view">View</a> | <a href="#mvvm">MVVM</a> | <a href="tut-by">Example</a> >> *[Advanced](advanced.md#top)* | *[FAQs](FAQs.md#top)*


### **Simple start**
There are no dependencies, just reference one JavaScript file:

```html
<script src="pro.all.min.js"></script><!--  <3 KB -->
<!-- Or -->
<script src="pro.all.js"></script>   <!-- <23 KB -->
```
---

### **Intro**
The framework defines short aliases for popular DOM-methods:

 ```javascript
pro.id('element-id'); // Gets element by id
pro.class('class-name'); // Gets elements by class name
pro.tag('tag-name'); // Gets elements by tag name
document.on('some-event', fn); // Adds an event listener
document.no('some-event', fn); // Removes an event listener
let element = pro.element('div|span|a|...'); // Creates a new element of specified tag

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

### **pro.core** <span id="core"></span> | <a href="#top">To top >></a>
Provides **sync** event-based programming model with fluent `on/once/no/out` interface. **Sync** model means that when any component triggers some event, all it's listeners are executed immediately.
Use `pro.core` constructor-function to create complex ProJS-like components:

```javascript
var unit = new pro.core();

/* Subscribe on event. If event was already triggered, listener is executed
immediately with last event object. To override this pass the third 'skipLast' argument as true. */ 
unit.on('event', function (eventData /*, function callback() { 'I am optional'; } */) {
               console.log('Event was triggered: ' + eventData);
             }/*, true */);

// Triggers event. Optional the third callback can be executed after all listeners (* bug here *)
unit.out('event', 23 /*, function () { console.log('Well done!'); } */);
//  Event was triggered: 23
//  Well done!

// The same as this short alias:
unit.event(23 /*, function () { ... } */);
```
---

### **pro.unit** <span id="unit"> |  </span><a href="#top">To top >></a>
Introduces app-unit with *states* concept and own DI:

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
  .on('NewsStore') // Optional list of unit dependencies
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


In case you have to violate **SOLID** world, consider `Service Locator` sin: 

```javascript
// Somewhere you can not define unit with injected dependency
// and have access only to your application instance
app.on('auth-unit', function (authUnit) {
    authUnit.to('login');
});
```

---

### **pro.load** <span id="load"> |  </span><a href="#top">To top >></a>
Subscribes on [DOM-tree traversal](advanced.md#tree) and loads HTML content for elements with **'pro-load'** tags:

`<div pro-load="news-component.html"></div>`

Content for the element above will be downloaded from the specified url. **Nested** 'pro-load'-elements are supported, content for them will be loaded immediately.

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
  // After markup loading and all pro.load.on(200, ...) listeners
  app.unit('NewsList')
     .on('NewsStore')
     .out(function (newsStore) { ... });
});
```
---

### **pro.data** <span id="data"> |  </span><a href="#top">To top >></a>
Introduces observable wrapper over JS-objects and arrays:

```javascript
var sampleModel = { topic: 'Sample', text: 'Observable model' },
    news = pro.data(sampleModel); // Or define empty observable: 'pro.data();'

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

Observable arrays:

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

function onChange(list) {
    // On news list change
}
newsList.on(onChange); // See the line below which triggers this listener
// As well as two listeners above
newsList([]); // * Here I have a bug - only the last listener was executed

// Read current value:
var value = newsList(); // Evaluated into an empty array
```

Use `no` method to unsubscribe listener from data changed event

```javascript
newsList.no(onChange);
```

> Initial object is changed with observable as well.

---

### **pro.view** <span id="view"> |  </span><a href="#top">To top >></a>
Introduces UI-view which can be binded to model. Sample with markup loaded via `pro-load`:

```html
    ...
    <article pro-load="news-template.html" hidden></article>
</body>
```

`news-template.html` markup:

```html
<h2 pro="text(topic)"></h2>
<p pro="text(content)"></p>
```

> `pro` tag will be explained in the next section.

```javascript
pro.load.once('news-template.html', function (view) {
  'use strict';
  // Define view named 'news-view'
  pro.view.name('news-view')(function () {
      return view.cloneNode(true);
      // Or create new element
	  // Or get element by css-class / id 
    }) // It was markup-factory function
    .on(function (model) { // Executed on model binding
      this.out('hidden');
    });
});
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

### **pro.mvvm** <span id="mvvm"> |  </span><a href="#top">To top >></a>
Implements **Model-View-ViewModel** pattern. ViewModel here is an observable `pro.data` object binded to HTML-element as following:

```javascript
var model = {
        newsList: [],
        nextPageUrl: '/next',
        styles: { display: 'none' },
        placeholder: 'Your placeholder',
        modelValue: 'Default value'
    },
    viewModel = pro.data(model);

pro.mvvm.to(proId('news-container'), viewModel);
```

> After that you need change only view model - markup will be updated on the fly!

Here is how markup looks like:

```html
<div id="news-container" pro="css(styles)">
    <input pro="place(placeholder); value(modelValue)" />
    <div pro="show(newsList.length === 0)">There are no news to read.</div>
    <div pro="each(newsList, view('news-view'))">
        <!-- Here will be inserted list of news view -->
    </div>
    <div pro="hide(newsList.length === 0)">Happy reading!</div>
    <a pro="href(nextPageUrl)">Next</a>
</div>
```

`pro`-attributes in markup contain valid JS-expressions with predefined list of hacks: `show`, `hide`, `each`, `view`, `text`, `html`, `href`, `value`, `css`, `place` - for DOM-manipulation with element.
Markup is reevaluated on every model change. Extension point for custom hacks will be added later.

```javascript
viewModel.newsList([{ topic: '...', text: '...' }]);
// The html above will be immediately updated
```
---
**Continue** on [advanced level](advanced.md#top)


## [MIT license](http://opensource.org/licenses/MIT)