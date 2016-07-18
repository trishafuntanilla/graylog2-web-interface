/// <reference path="../../../declarations/jquery/jquery.d.ts" />

'use strict';

declare var $: any;
declare var jsRoutes: any;

import UserNotification = require("../../util/UserNotification");
import URLUtils = require("../../util/URLUtils");

interface LookupFilter{
    key: string;
    value: string;
}

var LookupFiltersStore = {

    loadLookupFilters(): String {
        var promise = $.getJSON(URLUtils.appPrefixed('/a/system/lookupfilters'));
        promise.fail((jqXHR, textStatus, errorThrown) => {
            UserNotification.error("Loading lookup filters information failed with status: " + errorThrown,
                "Could not load lookup filters information");
        });

        return promise;
    },

    deleteLookupFilter(filter: LookupFilter, callback: () => void) {
        var failCallback = (jqXHR, textStatus, errorThrown) => {
            UserNotification.error("Deleting filter failed with status: " + errorThrown,
                "Could not delete lookup filter.");
        };

        var url = URLUtils.appPrefixed('/a/system/lookupfilters/delete');
        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: url,
            data: JSON.stringify(filter)
        }).done(() => {
            callback();
            var message = "Filter was successfully deleted. NOTE: Lookup will not reflect the changes until the next auto sync up (every 4 hours). RESTART Graylog if you want your changes to be applied immediately.";
            UserNotification.success(message);
        }).fail(failCallback);
    }
}

export = LookupFiltersStore;