'use strict';

var React = require('react/addons');
//noinspection JSUnusedGlobalSymbols
var BootstrapModal = require('../bootstrap/BootstrapModal');

var DeleteLookupFilterModal = React.createClass({
    getInitialState() {
        return {
            filter: this.props.filter
        };
    },
    render() {
        var header = <h2 className="modal-title">Delete Lookup Filter</h2>;
        var body = (
            <div>
                <div className="form-group" id="delete-form">
                    <label htmlFor="key-field">Name of existing field: </label>
                    <input className="form-control" id="key-field" name="key-field" type="text" value={this.props.keyfield} disabled="true" style={{background: '#CCC'}}/>
                    <span className="help-block"></span>
                    <label htmlFor="value-field">Name of new field(s): </label>
                    <input className="form-control" id="value-field" name="value-field" type="text" value={this.props.valuefield}  disabled="true" style={{background: '#CCC'}}/>
                    <span className="help-block"></span>
                </div>
            </div>
        );
        return (
            <span>
                <button className="btn btn-primary" onClick={this.openModal}>Delete</button>

                <BootstrapModal
                    ref="modal"
                    confirm="Delete"
                    onConfirm={this._delete}
                    onCancel={this._closeModal}
                    cancel="Cancel">
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
    },
    _delete() {
        var filter = this.state;
        this.props.deleteFilter(filter, this._closeModal);
    }
});

module.exports = DeleteLookupFilterModal;
