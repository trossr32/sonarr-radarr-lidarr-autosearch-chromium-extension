browser.runtime.onConnect.addListener(function(port) {
    switch (port.name) {
        case 'init':
            port.onMessage.addListener(function (request) {
                getSettings(function (settings) {
                    
                    setIcon(settings);

                    browser.tabs.executeScript({ file: 'content/js/content_script.js' });
                });
            });
            break;

        case 'settings':
            port.onMessage.addListener(function(request) {
                switch (request.method) {
                    case 'get':
                        getSettings(function(settings) { 
                            port.postMessage({ request: request, settings: settings }); 
                        });
                        break;
                    case 'set':
                        setSettings(request.settings, function (settings) {
                            buildMenus(settings);

                            port.postMessage({ request: request, success: true });
                        });
                        break;
                }
            });
            break;

        case 'icon':
            port.onMessage.addListener(function (request) {
                getSettings(function (settings) {
                    setIcon(settings);
                });
            });
            break;
    }
});

function buildMenus(settings) {
    browser.contextMenus.removeAll(function () {
        // if extension is disabled gtfo
        if (!settings.enabled) {
            return;
        }

        var enabledSites = settings.sites.filter(site => { return site.enabled; });

        // if no sites are enabled gtfo
        if (enabledSites.length === 0) {
            return;
        }

        // create parent menu
        browser.contextMenus.create({ "title": "Search Sonarr/Radarr/Lidarr", "id": "sonarrRadarrLidarr", "contexts": ["selection"] });

        // create child menus from enabled sites array
        for (var i = 0; i < enabledSites.length; i++) {
            browser.contextMenus.create({ "title": enabledSites[i].menuText, "parentId": "sonarrRadarrLidarr", "id": enabledSites[i].id + "Menu", "contexts": ["selection"] });
        }
    });
}

function onClickHandler(info, tab) {
    getSettings(function (settings) {
        for (var i = 0; i < settings.sites.length; i++) {
            if (info.menuItemId == (settings.sites[i].id + 'Menu')) {
                browser.tabs.create({
                    'url': settings.sites[i].domain.replace(/\/$/, '') + settings.sites[i].searchPath + encodeURIComponent(info.selectionText).replace(/\./g, ' ')
                });
            }
        }
    });
};

browser.contextMenus.onClicked.addListener(onClickHandler);

// set up context menu tree at install time.
browser.runtime.onInstalled.addListener(function () {
    getSettings(function(settings) {
        buildMenus(settings);
    });
});

var sessionId,
    defaultSettings = {
        sites: [
            {
                id: 'sonarr',
                domain: 'http://my.sonarrurl.domain',
                enabled: true,
                searchPath: '/addseries/',
                searchInputSelector: '.add-series-search .x-series-search',
                menuText: 'Search Sonarr for tv',
                apiKey: ''
            }, {
                id: 'radarr',
                domain: 'http://my.radarrurl.domain',
                enabled: true,
                searchPath: '/addmovies/',
                searchInputSelector: '.add-movies-search .x-movies-search',
                menuText: 'Search Radarr for movie',
                apiKey: ''
            }, {
                id: 'lidarr',
                domain: 'http://my.lidarrurl.domain',
                enabled: false,
                searchPath: '/add/search/',
                searchInputSelector: 'input[name="searchBox"]',
                menuText: 'Search Lidarr for artist',
                apiKey: ''
            }
        ],
        integrations: [
            {
                id: 'imdb',
                name: 'IMDb',
                image: 'imdb.png',
                enabled: true
            },
            {
                id: 'tmdb',
                name: 'TMDb',
                image: 'tmdb.svg',
                enabled: true
            },
            {
                id: 'tvdb',
                name: 'tvdb',
                image: 'tvdb.png',
                enabled: true
            },
            {
                id: 'trakt',
                name: 'Trakt',
                image: 'trakt.png',
                enabled: true
            },
            {
                id: 'tvmaze',
                name: 'TVmaze',
                image: 'tvmaze.png',
                enabled: true
            },
            {
                id: 'musicbrainz',
                name: 'MusicBrainz',
                image: 'musicbrainz.svg',
                enabled: true
            },
            {
                id: 'letterboxd',
                name: 'Letterboxd',
                image: 'letterboxd.svg',
                enabled: true
            }
        ],
        enabled: true,
        debug: false
    };

var setIcon = function(settings) {
    browser.tabs.getCurrent(function(tab) {
        var img = 'content/assets/images/SonarrRadarrLidarr' + (settings.enabled ? '' : '-faded') + '16.png';

        browser.browserAction.setIcon({ path: img });
    });
};

var getSettings = function(callback) {
    let s = browser.storage.sync.get({ 'sonarrRadarrLidarrAutosearchSettings': defaultSettings });
    
    s.then((data) => {
        if (!data.sonarrRadarrLidarrAutosearchSettings.hasOwnProperty('enabled')) {
            data.sonarrRadarrLidarrAutosearchSettings.enabled = true;
        }

        if (!data.sonarrRadarrLidarrAutosearchSettings.hasOwnProperty('debug')) {
            data.sonarrRadarrLidarrAutosearchSettings.debug = false;
        }

        if (!data.sonarrRadarrLidarrAutosearchSettings.hasOwnProperty('integrations')) {
            data.sonarrRadarrLidarrAutosearchSettings.integrations = defaultSettings.integrations;
        }

            // check integrations array
            for (let i = 0; i < defaultSettings.integrations.length; i++) {
                var integrationFound = false;

                for (let j = 0; j < data.sonarrRadarrLidarrAutosearchSettings.integrations.length; j++) {
                    if (data.sonarrRadarrLidarrAutosearchSettings.integrations[j].id == defaultSettings.integrations[i].id) {
                        integrationFound = true;
                    }  
                }

                if (!integrationFound) {
                    data.sonarrRadarrLidarrAutosearchSettings.integrations.push(defaultSettings.integrations[i]);
                }
            }
        
        callback(data.sonarrRadarrLidarrAutosearchSettings);
    });
};

var setSettings = function (data, callback) {
    if (!data.hasOwnProperty('enabled')) {
        data.enabled = true;
    }

    if (!data.hasOwnProperty('debug')) {
        data.enabled = false;
    }

    if (!data.hasOwnProperty('integrations')) {
        data.integrations = defaultSettings.integrations;
    }

    var obj = {};
    obj['sonarrRadarrLidarrAutosearchSettings'] = data;

    browser.storage.sync.set(obj)
       .then(() => {
            if (typeof callback === "function") {
                callback(data);
            }
    });
};