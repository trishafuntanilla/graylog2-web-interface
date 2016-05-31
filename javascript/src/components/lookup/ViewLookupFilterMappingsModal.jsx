'use strict';

var React = require('react/addons');
//noinspection JSUnusedGlobalSymbols
var BootstrapModal = require('../bootstrap/BootstrapModal');

var ViewLookupFilterMappingsModal = React.createClass({
    getInitialState() {
        return {
            filter: this.props.filter
        };
    },
    render() {
        var mappings = JSON.stringify(this.state.filter.mappings, null, 2);
        var preStyle = {
            maxHeight: 400,
            overflowY: scroll,
        }
        var header = <h2 className="modal-title">Mappings</h2>;
        var body = (
            <div>
                <pre style={preStyle}>{mappings}</pre>
            </div>
        );
        return (
            <span>
                <button className="btn btn-success" onClick={this.openModal}>View Mappings</button>

                <BootstrapModal
                    ref="modal"
                    onCancel={this._closeModal}
                    cancel="Close">
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

module.exports = ViewLookupFilterMappingsModal;
