var app = new pro.Unit(); // Initializes a new application unit

app.unit('NewsStore') // Defines 'NewsStore' unit inside of the application
    .out(function () { // Initialization function. 'this' refers to the unit itself
        var me = this;

        this
            .on('load-news', function (eventModel, callback) {
                pro.http.to('api/news') // Defines request to the endpoint
                    .on(200, function (response) { // On HTTP 200 status code
                        response = JSON.parse(response.data);
                        me.out('news-loaded', response);
                        callback();
                    })
                    //.on('success|fail|end', callback) // Three well-known events
                    .header('Content-Type', 'application/json') // Any header is welcome
                    .get(); // Sends 'GET' request
            })
            .on('load-many-news', function (eventModel, callback) {
                var i, news = [];

                for (i = 1; i <= 100; i++) {
                    news.unshift({ topic: 'Topic ' + i, content: 'Content of some text ' + i });
                }

                me.out('news-loaded', news);
                callback();
            })
            .on('load-no-news', function (eventModel, callback) {
                pro.http.to('api/no-news') // Defines request to the endpoint
                    .on(200, function (response) { // On HTTP 200 status code
                        response = JSON.parse(response.data);
                        me.out('news-loaded', response);
                        callback();
                    })
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
                pro.id('no-news-link')
                    .no(loadNoNews)
                    .out('href');
            })
            .out(function () {
                pro.id('no-news-link')
                    .on('click', loadNoNews)
                    .to('href', 'javascript:void(0)');
            });

        this.state('news')
            .to(function () {
                pro.id('some-news-link')
                    .no('click', loadSomeNews)
                    .out('href');
            })
            .out(function () {
                pro.id('some-news-link')
                    .on('click', loadSomeNews)
                    .to('href', 'javascript:void(0)');
            });

        this.state('many-news')
            .to(function () {
                pro.id('many-news-link')
                    .no('click', loadSomeNews)
                    .out('href');
            })
            .out(function () {
                pro.id('many-news-link')
                    .on('click', loadManyNews)
                    .to('href', 'javascript:void(0)');
            });

        pro.id('no-news-link')
            .on('click', loadNoNews);
        pro.id('many-news-link')
            .on('click', loadManyNews);
        pro.id('some-news-link')
            .on('click', loadSomeNews);


        function loadSomeNews() {
            newsStore.out('load-news', null, function () {
                me.to('news');
            });
        }

        function loadManyNews() {
            newsStore.out('load-many-news', null, function () {
                me.to('many-news');
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
    });
});

pro.tree.document();