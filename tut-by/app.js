var app = new pro.Unit(); // Initializes a new application unit

pro.tree.depth(document.children);

app.unit('NewsStore') // Defines 'NewsStore' unit inside of the application
    .out(function () { // Initialization function. 'this' refers to the unit itself
        var me = this;

        this.on('some-event', function (eventModel) {
            pro.http.to('api/news') // Defines request to the endpoint
                .on(200, function (response) { // On HTTP 200 status code
                    me.out('newsLoaded', response);
                })
                .on(204, function () {
                    me.out('newsLoaded', null);
                }) // Subscribe on any HTTP status
                //.on('success|fail|end', callback) // Three well-known events
                .header('Content-Type', 'application/json') // Any header is welcome
                .get(); // Sends 'GET' request
        });
    });

pro.load.on('news-component.html', function (newsContainer) {
    app.unit('NewsList') // Defines 'NewsList' unit
        .on('NewsStore') // Optional method, lists unit's dependencies
        .out(function (newsStore) {
            var me = this,
                viewModel = pro.data({ newsList: [] });

            pro.mvvm.to(newsContainer, viewModel);

            newsStore.on('newsLoaded', function (data) {
                viewModel.newsList(data);
            });

            newsStore.out('some-event');
        });
});

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