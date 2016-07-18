'use strict';

var React = require('react/addons');
//noinspection JSUnusedGlobalSymbols
var BootstrapModal = require('../bootstrap/BootstrapModal');
var URLUtils = require("../../util/URLUtils");

var NewLookupFilterModal = React.createClass({
    getInitialState() {
        return {};
    },
    render() {
        var header = <h2 className="modal-title">New Lookup Filter</h2>;
        var sampleJSON = '{\n    "key" : "value",\n    "..." : "..."\n}';
        var body = (
            <div>
            <div className="alert alert-warning">
              <strong>NOTE:</strong> Lookup will not reflect the changes until the next auto sync up (every 4 hours). RESTART Graylog if you want your changes to be applied immediately.
            </div>
            <br/>
                <div className="form-group">
                    <label htmlFor="existing-field">Name of existing field: </label>
                    <input className="form-control" id="existing-field" name="existing-field" type="text" required/>
                    <span className="help-block">The name of the existing field that has values available for look up (ex. <i>id</i>).</span>
                    <label htmlFor="new-field">Name of new field(s): </label>
                    <input className="form-control" id="new-field" name="new-field" type="text" required/>
                    <span className="help-block">Enter the name(s) of the new field(s) to be added (ex. <i>url,hostname</i>). Separate multiple fields with commas.</span>
                    <label htmlFor="json-file">JSON file (Optional)</label>
                    <input id="json-file" name="mappings" type="file" accept=".json"/>
                    <span className="help-block">Import a JSON file containing the mappings. If not provided, an empty lookup data map is created. See expected format below; incorrect JSON may result in an empty data map.</span>
                    <pre id="sample-json" style={{fontSize: 10}}>{{sampleJSON}}</pre>
                </div>
            </div>
        );
        return (
            <span>
                <button className="btn btn-info" style={{marginRight: 5}} onClick={this.openModal}>Create new lookup filter</button>

                <BootstrapModal
                    ref="modal"
                    confirm="Save"
                    onCancel={this._closeModal}
                    cancel="Cancel"
                    method="POST"
                    encType="multipart/form-data"
                    action={URLUtils.appPrefixed('/system/lookupfilter/create')}>
                   {header}
                   {body}
                </BootstrapModal>
            </span>
        );
    },
    _closeModal() {
        this.refs.modal.close();
    },
    openModal() {
        this.refs.modal.open();
    }
});

module.exports = NewLookupFilterModal;
