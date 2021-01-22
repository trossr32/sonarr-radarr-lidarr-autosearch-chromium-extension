var settingsPort = browser.runtime.connect({ name: 'settings' }),
    entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };

var escapeHtml = function(string) {
    return String(string).replace(/[&<>"'`=\/]/g,
        function(s) {
            return entityMap[s];
        });
};

var title = function(str) {
    return str.replace(/(^|\s)\S/g, function(t) { return t.toUpperCase(); });
};

var initialiseBasicForm = function (settings) {
    var wrapper = $('<div></div>');

    $.each(settings.sites, function (i, site) {
        var formLabelImg = $('<img src="content/assets/images/' + site.id + '/' + title(site.id) + '48.png" style="width: 24px; margin-right: 10px;" />'),
            formLabelText = $('<label style="padding-top: 6px;">' + title(site.id) + ' protocol, domain and port</label>'),
            formLabel = $('<label for="' + site.id + 'Domain" class="col-sm-3 col-form-label"></label>'),
            input = $('<input type="text" class="form-control" id="' + site.id + 'Domain" placeholder="http://192.168.0.1:7357">')
                .val(site.domain),
            inputDiv = $('<div class="col-sm-7"></div>'),
            toggle = $('<input type="checkbox" id="toggle-' + site.id + '">')
                .prop('checked', site.enabled),
            toggleDiv = $('<div class="col-sm-2"></div>'),
            container = $('<div class="form-group row"></div>');

        wrapper
            .append(container
                .append(formLabel.append(formLabelImg).append(formLabelText))
                .append(inputDiv.append(input))
                .append(toggleDiv.append(toggle))
            );
    });

    $('#generalOptionsForm').prepend(wrapper);

    // enable toggles
    $('[id^="toggle-"]').each(function (i, e) {
        var el = $(e);

        el.bootstrapToggle({
            on: 'Enabled',
            off: 'Disabled',
            onstyle: 'success',
            offstyle: 'danger',
            width: '100%',
            size: 'small'
        });
    });
};

var initialiseAdvancedForm = function (settings) {
    var wrapper = $('<div></div>');

    $.each(settings.sites, function (i, site) {
        var section = $('<div style="margin-bottom: 80px;">'),
            header = $('<h3 style="margin-bottom: 40px;"></h3>'),
            headerImg = $('<img src="content/assets/images/' + site.id + '/' + title(site.id) + '48.png" style="margin: -5px 10px 0 0; width: 30px;" />'),
            headerText = title(site.id) + ' advanced settings';
            
        section.append(header.append(headerImg).append(headerText));

        // Append site-specific settings
        switch (site.id) {
            case 'sonarr':
                section.append($('<div class="alert alert-info" style="margin-top: -10px; margin-bottom: 40px;"></div>')
                    .append($('<h4 class="alert-heading">Version info</h4>'))
                    .append($('<p>The below settings are defaulted to v2.<i>n</i>. For v3.<i>n</i> (tested against 3.0.4.982) use:</p>'))
                    .append($('<p>Search path url: <strong>/add/new/</strong></p>'))
                    .append($('<p>Search field selector: <strong>input[name="seriesLookup"]</strong></p>'))
                )
                break;
                
            case 'radarr':
                section.append($('<div class="alert alert-info" style="margin-top: -10px; margin-bottom: 40px;"></div>')
                    .append($('<h4 class="alert-heading">Version info</h4>'))
                    .append($('<p>The below settings are defaulted to v0.<i>n</i>. For v3.<i>n</i> (tested against 3.0.0.3954) use:</p>'))
                    .append($('<p>Search path url: <strong>/add/new/</strong></p>'))
                    .append($('<p>Search field selector: <strong>input[name="movieLookup"]</strong></p>'))
                )
                break;
        
            case 'lidarr':
                section.append($('<div class="alert alert-info" style="margin-top: -10px; margin-bottom: 40px;"></div>')
                    .append($('<h4 class="alert-heading">Version info</h4>'))
                    .append($('<p>As of v0.8.0.1881 the below settings should be used. If this is a new install this should be the default, otherwise you may need to amend:</p>'))
                    .append($('<p>Search path url: <strong>/add/search/</strong></p>'))
                    .append($('<p>Search field selector: <strong>input[name="searchBox"]</strong></p>'))
                )
                break;
        }

        var {apiKeyDiv, getApiKey} = renderApiKey(site)
        section.append(apiKeyDiv)

        var {apiStatusDiv, registerApiStatusChangeListener, refreshApiStatus, getApiStatus} = renderApiStatus(site, getApiKey)
        section.append(apiStatusDiv)

        var {searchPathDiv, showFetchFromApiLink: showFetchSearchPathFromApiLink} = renderSearchPath(site, getApiStatus)
        section.append(searchPathDiv)
        
        var {selectorDiv, showFetchFromApiLink: showFetchSelectorFromApiLink} = renderSelector(site, getApiStatus)
        section.append(selectorDiv)

        wrapper.append(section);

        registerApiStatusChangeListener(function(apiStatus) {
            if (apiStatus.connected) {
                showFetchSearchPathFromApiLink(true);
                showFetchSelectorFromApiLink(true);  
            } else {
                showFetchSearchPathFromApiLink(false);
                showFetchSelectorFromApiLink(false);
            }
        })
        refreshApiStatus(silenceErrors = true);
    });

    $('#advancedOptionsForm').prepend(wrapper);
};

/** Creates a div for the API key setting */
function renderApiKey(site) {
    // UI
    var apiKeyDiv = $('<div class="form-group row"></div>'),
        apiKeyLabel = $('<label for="' + site.id + 'ApiKey" class="col-sm-3 col-form-label"></label>'),
        apiKeyLabelContent = $('<label style="padding-top: 6px;">API key</label>'),
        apiKeyInputDiv = $('<div class="col-sm-9"></div>'),
        apiKeyInput = $('<input type="text" class="form-control" id="' + site.id + 'ApiKey" aria-describedby="' + site.id + 'ApiKeyHelp">')
            .val(site.apiKey),
        apiKeyHelp = $('<div class="col-sm-offset-3"><small id="' + site.id + 'ApiKeyHelp" class="form-text" style="margin-left: 20px;">This is your ' + site.id + ' API key. If specified, will show detailed availability info</small></div>');

    apiKeyDiv
        .append(apiKeyLabel.append(apiKeyLabelContent))
        .append(apiKeyInputDiv.append(apiKeyInput))
        .append(apiKeyHelp)

    // Models
    function getApiKey() {
        return apiKeyInput.val()
    }

    return {apiKeyDiv, getApiKey}
}

/**
 * Creates a div for API status and maintains apiStatus state
 * 
 * @returns obj.apiStatusDiv {Element} - the div
 *          obj.getApiStatus {Function} - function that returns current API status
 *          obj.refreshApiStatus {Function} - function to trigger an API call + refresh of the div
 *          obj.registerApiStatusChangeListener {Function} - function for listening for API status changes
 */
function renderApiStatus(site, getApiKey) {
    // UI 
    var apiStatusDiv = $('<div class="form-group row"></div>'),
        apiStatusLabel = $('<label for="' + site.id + 'ApiStatus" class="col-sm-3 col-form-label"></label>'),
        apiStatusLabelContent = $('<label style="padding-top: 6px;">API status</label>'),
        apiStatusValueDiv = $('<div class="col-sm-9"></div>'),
        apiStatusRefreshLink = $('<a style="margin-left: 6px; cursor: pointer;">(Refresh)</a>'),
        apiStatusErrorCodeDiv = $('<div class="col-sm-offset-3"></div>');
    var apiStatusValue = $('<span></span>'),
        apiStatusErrorCode = $('<small id="' + site.id + 'ApiKeyHelp" class="form-text" style="margin-left: 20px;"></small>');

    apiStatusDiv
        .append(apiStatusLabel.append(apiStatusLabelContent))
        .append(apiStatusValueDiv.append(apiStatusValue).append(apiStatusRefreshLink))
        .append(apiStatusErrorCodeDiv.append(apiStatusErrorCode))

    function updateApiStatusElements(apiStatus, errorMessage) {
        if (apiStatus.connected) {
            apiStatusValue.html(`Connected ✅ ${site.id} version: ${apiStatus.systemStatus.version}`)
            apiStatusErrorCode.html('')
        } else {
            apiStatusValue.html('Not connected ❌')
            apiStatusErrorCode.html(errorMessage)
        }
    }

    apiStatusRefreshLink.click(e => refreshApiStatus())

    // Models 
    var apiStatus = {connected: false}
    function getApiStatus() {
        return apiStatus
    }

    var apiStatusChangeListeners = [];
    function registerApiStatusChangeListener(listener) {
        apiStatusChangeListeners.push(listener);
    }

    async function refreshApiStatus(silenceErrors) {
        try {
            var apiKey = getApiKey()
            var systemStatus = await ApiClient.getSystemStatus(site.domain, apiKey);
            apiStatus = {
                connected: true,
                systemStatus
            }
            apiStatusChangeListeners.forEach(listener => listener(apiStatus))
            updateApiStatusElements(apiStatus)
        } catch (e) {
            apiStatus = {
                connected: false
            }
            apiStatusChangeListeners.forEach(listener => listener(apiStatus))
            var errorMessage = silenceErrors ? '' : e.toString();
            updateApiStatusElements(apiStatus, errorMessage);
        }
    }

    return {
        apiStatusDiv,
        getApiStatus,
        refreshApiStatus,
        registerApiStatusChangeListener
    }
}

/** 
 * Creates a div for the search path setting
 * @returns obj.searchPathDiv {Element} - the div
 * @returns obj.showFetchFromApiLink {Function} - function for toggling the display of "Get from API" link
 */
function renderSearchPath(site, getApiStatus) {
    var searchPathDiv = $('<div class="form-group row"></div>'),
        searchPathLabel = $('<label for="' + site.id + 'SearchPath" class="col-sm-3 col-form-label"></label>'),
        searchPathLabelContent = $('<label style="padding-top: 6px;">Search path url</label>'),
        searchPathInputDiv = $('<div class="col-sm-9"></div>'),
        searchPathInput = $('<input type="text" class="form-control" id="' + site.id + 'SearchPath" placeholder="http' + '://192' + '.168.0.1:7357" aria-describedby="' + site.id + 'SearchPathHelp">')
            .val(site.searchPath),
        searchPathHelpDiv = $('<div class="col-sm-offset-3"></div>'),
        searchPathHelp = $('<small id="' + site.id + 'SearchPathHelp" class="form-text" style="margin-left: 20px;">This is the search path used to search for add new content in this instance, following your instance url/ip.&nbsp;</small>'),
        searchPathFetchFromApiLink = $('<a style="cursor:pointer">Fetch from API<a>')

    searchPathDiv
        .append(searchPathLabel.append(searchPathLabelContent))
        .append(searchPathInputDiv.append(searchPathInput))
        .append(searchPathHelpDiv.append(
            searchPathHelp.append(searchPathFetchFromApiLink)
        ))

    function showFetchFromApiLink(show) {
        if (show) {
            searchPathFetchFromApiLink.show();
        } else {
            searchPathFetchFromApiLink.hide();
        }
    }

    // Calculate search path and save to UI
    searchPathFetchFromApiLink.click(() => {
        var apiStatus = getApiStatus();
        if (apiStatus.systemStatus && apiStatus.systemStatus.version) {
            var searchPath = getSearchPath(site.id, apiStatus.systemStatus.version)
            searchPathInput.val(searchPath)
        }
    })
    
    return {searchPathDiv, showFetchFromApiLink}
}

/** 
 * Creates a div for the selector setting
 * @returns obj.selectorDiv {Element} - the div
 * @returns obj.showFetchFromApiLink {Function} - function for toggling the display of "Get from API" link
 */
function renderSelector(site, getApiStatus) {
    var selectorDiv = $('<div class="form-group row"></div>'),
        selectorLabel = $('<label for="' + site.id + 'SearchInputSelector" class="col-sm-3 col-form-label"></label>'),
        selectorLabelContent = $('<label style="padding-top: 6px;">Search field selector</label>'),
        selectorInputDiv = $('<div class="col-sm-9"></div>'),
        selectorInput = $('<input type="text" class="form-control" id="' + site.id + 'SearchInputSelector" placeholder=".class, #id" aria-describedby="' + site.id + 'SearchInputSelectorHelp">')
            .val(site.searchInputSelector),
        selectorHelpDiv = $('<div class="col-sm-offset-3"></div>'),
        selectorHelp = $('<small id="' + site.id + 'SearchInputSelectorHelp" class="form-text" style="margin-left: 20px;">This is the jquery selector used to find the search input form field for this instance.&nbsp;</small>'),
        selectorFetchFromApiLink = $('<a style="cursor:pointer">Fetch from API<a>');

    selectorDiv
        .append(selectorLabel.append(selectorLabelContent))
        .append(selectorInputDiv.append(selectorInput))
        .append(selectorHelpDiv.append(
            selectorHelp.append(selectorFetchFromApiLink)
        ))

    function showFetchFromApiLink(show) {
        if (show) {
            selectorFetchFromApiLink.show();
        } else {
            selectorFetchFromApiLink.hide();
        }
    }

    // Calculate selector and save to UI
    selectorFetchFromApiLink.click(() => {
        var apiStatus = getApiStatus();
        if (apiStatus.systemStatus && apiStatus.systemStatus.version) {
            var selector = getSiteSelector(site.id, apiStatus.systemStatus.version)
            selectorInput.val(selector)
        }
    })

    return {selectorDiv, showFetchFromApiLink}    
}

var initialiseIntegrationsForm = function (settings) {
    var wrapper = $('<div></div>');

    $.each(settings.integrations, function (i, integration) {
        var formLabelImg = $('<div style="float: left; width: 135px;"><img src="content/assets/images/integrations/' + integration.image + '" height="24px" style="height: 24px;" /></div>'),
            formLabelText = $('<div style="float: left; margin: 4px 0 0 40px;">' + integration.name + '</div>'),
            formLabel = $('<div class="col-sm-3"></label>'),
            toggle = $('<input type="checkbox" id="toggle-' + integration.name + '">')
                .prop('checked', integration.enabled),
            toggleDiv = $('<div class="col-sm-2"></div>'),
            container = $('<div class="form-group row"></div>');

        wrapper
            .append(container
                .append(formLabel.append(formLabelImg).append(formLabelText))
                .append(toggleDiv.append(toggle))
            );
    });

    $('#integrationsOptionsForm').prepend(wrapper);

    // enable toggles
    $('[id^="toggle-"]').each(function (i, e) {
        var el = $(e);

        el.bootstrapToggle({
            on: 'Enabled',
            off: 'Disabled',
            onstyle: 'success',
            offstyle: 'danger',
            width: '100%',
            size: 'small'
        });
    });
};

var initialiseDebugForm = function (settings) {
    var wrapper = $('<div></div>');

    var formLabel = $('<label for="toggle-debug" class="col-sm-3 col-form-label">Turn on console logging</label>'),
        toggle = $('<input type="checkbox" id="toggle-debug">')
            .prop('checked', settings.debug),
        toggleDiv = $('<div class="col-sm-2"></div>'),
        container = $('<div class="form-group row"></div>');

    wrapper
        .append(container
            .append(formLabel)
            .append(toggleDiv.append(toggle))
        );

    $('#debugOptionsForm').prepend(wrapper);

    // enable toggle
    $('#toggle-debug').bootstrapToggle({
        on: 'Enabled',
        off: 'Disabled',
        onstyle: 'success',
        offstyle: 'danger',
        width: '100%',
        size: 'small'
    });
};

var setSettingsPropertiesFromForm = function (settings) {
    for (var i = 0; i < settings.sites.length; i++) {
        settings.sites[i].domain = $('#' + settings.sites[i].id + 'Domain').val();
        settings.sites[i].enabled = $('#toggle-' + settings.sites[i].id).prop('checked');
    }
};

var setSettingsPropertiesFromAdvancedForm = function (settings) {
    for (var i = 0; i < settings.sites.length; i++) {
        settings.sites[i].searchPath = $('#' + settings.sites[i].id + 'SearchPath').val();
        settings.sites[i].searchInputSelector = $('#' + settings.sites[i].id + 'SearchInputSelector').val();
        settings.sites[i].apiKey = $('#' + settings.sites[i].id + 'ApiKey').val();
    }
};

var setSettingsPropertiesFromIntegrationsForm = function (settings) {
    for (var i = 0; i < settings.integrations.length; i++) {
        settings.integrations[i].enabled = $('#toggle-' + settings.integrations[i].name).prop('checked');
    }
};

var setSettingsPropertiesFromDebugForm = function (settings) {
    settings.debug = $('#toggle-debug').prop('checked');
};

settingsPort.onMessage.addListener(function (response) {
    var settings = response.settings;

    switch (response.request.caller) {
        case 'initPage':
            initialiseBasicForm(settings);
            initialiseAdvancedForm(settings);
            initialiseIntegrationsForm(settings);
            initialiseDebugForm(settings);
            break;

        case 'setFields':
            setSettingsPropertiesFromForm(settings);

            settingsPort.postMessage({ method: 'set', caller: '', settings: settings });
            break;

        case 'setAdvancedFields':
            setSettingsPropertiesFromAdvancedForm(settings);

            settingsPort.postMessage({ method: 'set', caller: '', settings: settings });
            break;

        case 'setIntegrationsFields':
            setSettingsPropertiesFromIntegrationsForm(settings);

            settingsPort.postMessage({ method: 'set', caller: '', settings: settings });
            break;

        case 'setDebugFields':
            setSettingsPropertiesFromDebugForm(settings);

            settingsPort.postMessage({ method: 'set', caller: '', settings: settings });
            break;
    }
});

/** API client for talking to Radarr/Sonarr/Lidarr APIs */
class ApiClient {
    static getSystemStatus(domain, apiKey) {
        return new Promise((resolve, reject) => {
            if (!apiKey) {
                reject(new Error('API key not provided'))
            }
            var url = `${domain}/api/v3/system/status?apikey=${apiKey}`
            $.get(url).then(data => {
                console.log(`GET ${url} - successful`, data)
                resolve(data)
            }).catch(err => {
                console.log(`GET ${url} - error`, err)
                reject(`${err.status} - ${err.responseText}`)
            });
        })
    }
}

function getSearchPath(siteId, version) {
    if (siteId === 'radarr') {
        if (version.match(/^3/)) {
            return '/add/new/'
        } else if (version.match(/^0/)) {
            return '/addmovies/'
        } else {
            console.warn('Unexpected radarr version:', version)
            return '';
        }
    } else if (siteId === 'sonarr') {
        if (version.match(/^3/)) {
            return '/add/new/'
        } else if (version.match(/^2/)) {
            return '/addseries/'
        } else {
            console.warn('Unexpected sonarr version:', version)
            return '';
        }
    } else if (siteId === 'lidarr') {
        return '/add/search/';
    }
}

function getSiteSelector(siteId, version) {
    if (siteId === 'radarr') {
        if (version.match(/^3/)) {
            return 'input[name="movieLookup"]'
        } else if (version.match(/^0/)) {
            return '.add-movies-search .x-movies-search'
        } else {
            console.warn('Unexpected radarr version:', version)
            return '';
        }
    } else if (siteId === 'sonarr') {
        if (version.match(/^3/)) {
            return 'input[name="seriesLookup"]'
        } else if (version.match(/^2/)) {
            return '.add-series-search .x-series-search'
        } else {
            console.warn('Unexpected sonarr version:', version)
            return '';
        }
    } else if (siteId === 'lidarr') {
        return 'input[name="searchBox"]';
    }
}


$(function () {
    // show first tab on load
    $('#settingsTabs a:first').tab('show');
    
    // initialise page on load
    settingsPort.postMessage({ method: 'get', caller: 'initPage' });

    // save settings/advanced/integrations button click events
    $.each(['', 'Advanced', 'Integrations', 'Debug'], function(i, v) {
        $('#save' + v + 'Options').click(function (e) {
            settingsPort.postMessage({ method: 'get', caller: 'set' + v + 'Fields' });
        });
    });
});