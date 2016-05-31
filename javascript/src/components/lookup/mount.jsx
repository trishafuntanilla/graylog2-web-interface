'use strict';

var React = require('react');
var LookupFilter = require('./LookupFilter');

var lookupFilter = document.getElementById('react-lookup-filter');
if (lookupFilter) {
    React.render(<LookupFilter />, lookupFilter);
}
