var settingsPort = chrome.runtime.connect({ name: 'settings' }),
    base64Icons = [
        {
            id: 'sonarr',
            base64: 'data:image/png;base64,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'
        }, {
            id: 'radarr',
            base64: 'data:image/png;base64,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'
        }, {
            id: 'lidarr',
            base64: 'data:image/png;base64,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'
        }
    ],
    integrations = [
        {
            id: 'imdb',
            rules: [
                {
                    siteId: 'sonarr',
                    match: {
                        term: 'tv series',
                        operator: 'eq'
                    }
                },
                {
                    siteId: 'sonarr',
                    match: {
                        term: 'tv mini-series',
                        operator: 'eq'
                    }
                },
                {
                    siteId: 'radarr',
                    match: {
                        term: 'tv series',
                        operator: 'ne'
                    }
                }
            ],
            search: {
                containerSelector: '.title_wrapper h1',
                remove: null
            },
            match: {
                term: 'imdb.com',
                containerSelector: '.title_wrapper',
                attribute: 'text',
            },
            icon: {
                containerSelector: '.title_wrapper h1',
                locator: 'prepend',
                imgStyles: 'width: 25px; margin: -8px 10px 0 0;'
            }
        },
        {
            id: 'tmdb',
            rules: [
                {
                    siteId: 'sonarr',
                    match: {
                        term: 'themoviedb.org/tv/',
                        operator: 'eq'
                    }
                },
                {
                    siteId: 'radarr',
                    match: {
                        term: 'themoviedb.org/movie/',
                        operator: 'eq'
                    }
                }
            ],
            search: {
                containerSelector: '.header .title h2 a',
                attribute: 'text',
                remove: null
            },
            match: {
                term: 'themoviedb.org',
                containerSelector: 'link[rel="canonical"]',
                attribute: 'href'
            },
            icon: {
                containerSelector: '.header .title h2',
                locator: 'prepend',
                imgStyles: 'width: 25px; margin: -8px 10px 0 0;'
            }
        },
        {
            id: 'tmdb',
            rules: [
                {
                    siteId: 'sonarr',
                    match: {
                        term: 'themoviedb.org/tv',
                        operator: 'eq'
                    }
                },
                {
                    siteId: 'radarr',
                    match: {
                        term: 'themoviedb.org/movie',
                        operator: 'eq'
                    }
                }
            ],
            search: {
                containerSelector: '.card.style_1 .image .wrapper .image',
                attribute: 'title',
                remove: null
            },
            match: {
                term: 'themoviedb.org',
                containerSelector: 'link[rel="canonical"]',
                attribute: 'href'
            },
            icon: {
                containerSelector: '.card.style_1 .content',
                locator: 'prepend',
                customMarkUp: '<div class="consensus tight" style="right: 10px !important; left: auto;"><div style="position: relative;"><a href="[#SEARCH_URL#]" target="_blank" tooltip="[#MENU_TEXT#]" title="[#MENU_TEXT#]"><img src="[#BASE64#]" style="width: 36px;"></a></div></div>'
            }
        },
        {
            id: 'tvdb',
            defaultSite: 'sonarr',
            search: {
                containerSelector: '#series_title',
                attribute: 'text',
                remove: null
            },
            match: {
                term: 'thetvdb.com/series',
                containerSelector: '#series_basic_info',
                attribute: 'text'
            },
            icon: {
                containerSelector: '#series_title',
                locator: 'prepend',
                imgStyles: 'width: 25px; margin: -8px 10px 0 0;'
            }
        },
        {
            id: 'tvdb',
            defaultSite: 'radarr',
            search: {
                containerSelector: '#series_title',
                attribute: 'text',
                remove: null
            },
            match: {
                term: 'thetvdb.com/movies',
                containerSelector: '#series_basic_info',
                attribute: 'text'
            },
            icon: {
                containerSelector: '#series_title',
                locator: 'prepend',
                imgStyles: 'width: 25px; margin: -8px 10px 0 0;'
            }
        },
        {
            id: 'tvdb',
            rules: [
                {
                    siteId: 'sonarr',
                    match: {
                        term: '/series/',
                        operator: 'eq'
                    }
                },
                {
                    siteId: 'radarr',
                    match: {
                        term: '/movies/',
                        operator: 'eq'
                    }
                }
            ],
            search: {
                containerSelector: 'h3.mt-0 a',
                attribute: 'text',
                remove: null
            },
            match: {
                term: 'thetvdb.com/lists',
                containerSelector: 'div.col-xs-12.col-sm-3.mt-2 > a',
                attribute: 'href'
            },
            icon: {
                containerSelector: 'h3.mt-0',
                locator: 'prepend',
                imgStyles: 'width: 25px; margin: -8px 10px 0 0;'
            }
        },
        {
            id: 'trakt',
            rules: [
                {
                    siteId: 'sonarr',
                    match: {
                        term: 'tv',
                        operator: 'eq'
                    }
                },
                {
                    siteId: 'radarr',
                    match: {
                        term: 'movies',
                        operator: 'eq'
                    }
                }
            ],
            search: {
                containerSelector: 'title',
                attribute: 'text',
                remove: ' - trakt.tv'
            },
            match: {
                term: 'trakt.tv',
                containerSelector: '#main-nav ul li a.selected',
                attribute: 'text'
            },
            icon: {
                containerSelector: 'h1',
                locator: 'prepend',
                imgStyles: 'width: 25px; margin: -8px 10px 0 0;'
            }
        },
        {
            id: 'tvmaze',
            defaultSite: 'sonarr',
            search: {
                containerSelector: 'h1.show-for-medium',
                attribute: 'text',
                remove: null
            },
            match: {
                term: 'tvmaze.com/shows/'
            },
            icon: {
                containerSelector: 'h1.show-for-medium',
                locator: 'prepend',
                imgStyles: 'width: 32px; margin: -8px 10px 0 0;'
            }
        },
        {
            id: 'tvmaze',
            defaultSite: 'sonarr',
            search: {
                containerSelector: 'div.show-name',
                attribute: 'text',
                remove: null
            },
            match: {
                term: 'tvmaze.com/countdown'
            },
            icon: {
                containerSelector: 'div.show-name',
                locator: 'prepend',
                imgStyles: 'width: 24px; margin: -8px 10px 0 0;'
            }
        }
    ];

settingsPort.onMessage.addListener(function(response) {
    init(response.settings);
});

var getSite = function(integration, settings) {
    var matchContainer = $(integration.match.containerSelector),
        site = null;

    if (integration.hasOwnProperty('defaultSite')) {
        site = settings.sites
            .filter(s => { return s.enabled })
            .find(s => s.id == integration.defaultSite);
    } else {
        $.each(integration.rules, 
            function (ir, r) {
                var hasMatch;
                
                switch (integration.match.attribute) {
                    case 'text':
                        hasMatch = matchContainer.text().toLowerCase().includes(r.match.term);
                        break;
                        
                    default:
                        console.log('matchContainer.attr(integration.match.attribute)', matchContainer.attr(integration.match.attribute), 'r.match.term', r.match.term)
                        hasMatch = matchContainer.attr(integration.match.attribute).toLowerCase().includes(r.match.term)
                        break;                                
                }

                console.log('hasMatch', hasMatch, 'r.siteId', r.siteId);

                if (((r.match.operator == 'eq') && hasMatch) ||
                    ((r.match.operator == 'ne') && !hasMatch)) {
                        site = settings.sites
                            .filter(s => { return s.enabled })
                            .find(s => s.id == r.siteId);

                        return false;
                    }
            });
    }

    return site;
}

var init = function (settings) {
    if (!settings.enabled) {
        return;
    }

    $.each(settings.sites,
        function (i, site) {
            if (window.location.href.includes(site.domain)) {
                var search = window.location.href.replace(/(.+\/)/g, '');

                var sdef = site.searchPath.replace(/(\/)/g, '');
                search = search.replace(sdef, '');

                if (search.trim() !== '') {
                    // use jquery selector and then retrieve the DOM element
                    var searchInput = $(site.searchInputSelector)[0];

                    if (searchInput) {
                        // jquery can't be used to trigger the input event here so rely on vanilla js for event triggering
                        searchInput.value = decodeURIComponent(search.trim());

                        var event = document.createEvent('Event');
                        event.initEvent('input', true, true);

                        searchInput.dispatchEvent(event);
                    }
                }
            }
        });

    /* iterate all integrations that are enabled in the settings */
    $.each(settings.integrations.filter(integration => { return integration.enabled }), 
        function (i, settingsIntegration) {
            /* iterate all integrations that match the current setting integration */
            $.each(integrations.filter(_i => { return _i.id == settingsIntegration.id }),
                function (ii, integration) {
                    /* test the integration should be used by matching against the url */
                    if (window.location.href.includes(integration.match.term)) {
                        /* iterate all the containers */
                        $.each($(integration.search.containerSelector), function(i_el, container) {
                            var searchTerm = '';

                            switch (integration.search.attribute) {
                                case 'text':
                                    searchTerm = integration.search.remove == null
                                        ? $(container).text().trim()
                                        : $(container).text().toLowerCase().replace(integration.search.remove, '').trim();
                                    break;
                                    
                                default:
                                    searchTerm = integration.search.remove == null
                                        ? $(container).attr(integration.search.attribute).trim()
                                        : $(container).attr(integration.search.attribute).toLowerCase().replace(integration.search.remove, '').trim();
                                    break;                                
                            }

                            if (searchTerm === '') {
                                return;
                            }
                            
                            var site = getSite(integration, settings);

                            console.log('site', site, 'integration', integration);

                        if (site == null) {
                            return;
                        }

                        var searchUrl = site.domain.replace(/\/$/, '') + site.searchPath + encodeURIComponent(searchTerm).replace(/\./g, ' ');
                            var icon = base64Icons.find(i => i.id == site.id)

                            var el = integration.icon.hasOwnProperty('customMarkUp')
                                ? $(integration.icon.customMarkUp.replace(/\[#SEARCH_URL#\]/g, searchUrl).replace(/\[#MENU_TEXT#\]/g, site.menuText,).replace(/\[#BASE64#\]/g, icon.base64))
                                : $('<a href="' + searchUrl + '" target="_blank" tooltip="' + site.menuText + '" title="' + site.menuText + '"></a>')
                                    .append($('<img src="' + icon.base64 + '" style="' + integration.icon.imgStyles + '">'));

                            if ($(integration.icon.containerSelector).eq(i_el).html().indexOf(searchUrl) === -1) {
                                if (integration.icon.locator == "append") {
                                    $(integration.icon.containerSelector).eq(i_el).append(el);
                                } else {
                                    $(integration.icon.containerSelector).eq(i_el).prepend(el);
                                }
                            }
                        });
                    }
                });            
        });
};

settingsPort.postMessage({ method: 'get' });