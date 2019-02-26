var app = new pro.Unit(); // Initializes a new application unit

pro.tree.depth(document.children);

app.unit('NewsStore') // Defines 'NewsStore' unit inside of the application
    .out(function () { // Initialization function. 'this' refers to the unit itself
        var me = this;

        this.on('load-news', function (eventModel) {
            pro.http.to('api/news') // Defines request to the endpoint
                .on(200, pro.JSON(function (response) { // On HTTP 200 status code
                    me.out('news-loaded', response);
                }))
                //.on('success|fail|end', callback) // Three well-known events
                .header('Content-Type', 'application/json') // Any header is welcome
                .get(); // Sends 'GET' request
        });

        this.on('load-no-news', function (eventModel) {
            pro.http.to('api/no-news') // Defines request to the endpoint
                .on(200, pro.JSON(function (response) { // On HTTP 200 status code
                    me.out('news-loaded', response);
                }))
                .header('Content-Type', 'application/json') // Any header is welcome
                .get();
        });
    });

pro.load.on('news-component.html', function (newsContainer) {
    app.unit('NewsList') // Defines 'NewsList' unit
        .on('NewsStore') // Optional method, lists unit's dependencies
        .out(function (newsStore) {
            var me = this,
                viewModel = pro.data({ newsList: [] });

            pro.mvvm.to(newsContainer, viewModel);

            newsStore.on('news-loaded', function (data) {
                viewModel.newsList(data);
            });
        });
});

app.unit('Toolbar')
    .on('NewsStore')
    .out(function (newsStore) {
        pro.id('no-news-link').on('click', function () {
                newsStore.out('load-no-news');
            });

        pro.id('some-news-link').on('click', function () {
                newsStore.out('load-news');
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