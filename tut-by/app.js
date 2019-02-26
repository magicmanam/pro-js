var app = new pro.Unit(); // Initializes a new application unit

pro.tree.depth(document.children);

app.unit('NewsStore') // Defines 'NewsStore' unit inside of the application
    .out(function () { // Initialization function. 'this' refers to the unit itself
        var me = this;

        this.on('load-news', function (eventModel, callback) {
            pro.http.to('api/news') // Defines request to the endpoint
                .on(200, pro.JSON(function (response) { // On HTTP 200 status code
                    me.out('news-loaded', response);
                    callback();
                }))
                //.on('success|fail|end', callback) // Three well-known events
                .header('Content-Type', 'application/json') // Any header is welcome
                .get(); // Sends 'GET' request
        });

        this.on('load-no-news', function (eventModel, callback) {
            pro.http.to('api/no-news') // Defines request to the endpoint
                .on(200, pro.JSON(function (response) { // On HTTP 200 status code
                    me.out('news-loaded', response);
                    callback();
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
        var me = this;

        this.state('no-news')
            .to(function () {
                pro.id('some-news-link')
                    .on('click', loadSomeNews)
                    .to('href', 'javascript:void(0)');

                pro.id('no-news-link')
                    .no(loadNoNews)
                    .out('href');
            });
        this.state('news')
                .to(function () {
                    pro.id('some-news-link')
                        .no('click', loadSomeNews)
                        .out('href');

                    pro.id('no-news-link')
                        .on('click', loadNoNews)
                        .to('href', 'javascript:void(0)');
            });

        function loadSomeNews() {
            newsStore.out('load-news', null, function () {
                me.to('news');
            });
        }

        function loadNoNews() {
            newsStore.out('load-no-news', null, function () {
                me.to('no-news');
            });
        }

        this.to('no-news');
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