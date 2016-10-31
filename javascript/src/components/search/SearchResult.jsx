'use strict';

var $ = require('jquery');

var React = require('react');
var SearchSidebar = require('./SearchSidebar');
var ResultTable = require('./ResultTable');
var LegacyHistogram = require('./LegacyHistogram');
var FieldGraphs = require('./FieldGraphs');
var FieldQuickValues = require('./FieldQuickValues');
var FieldStatistics = require('./FieldStatistics');
var ModalTrigger = require('react-bootstrap').ModalTrigger;
var ShowQueryModal = require('./ShowQueryModal');
var AddToDashboardMenu = require('../dashboard/AddToDashboardMenu');
var Widget = require('../widgets/Widget');
var Immutable = require('immutable');

var DashboardStore = require('../../stores/dashboard/DashboardStore');
var SearchStore = require('../../stores/search/SearchStore');

var DocumentationLink = require('../support/DocumentationLink');
var DocsHelper = require('../../util/DocsHelper');

var resizeMutex;

var SearchResult = React.createClass({
    getInitialState() {
        var initialFields = SearchStore.fields;
        return {
            selectedFields: this.sortFields(initialFields),
            sortField: SearchStore.sortField,
            sortOrder: SearchStore.sortOrder,
            showAllFields: false,
            currentSidebarWidth: null,
            shouldHighlight: true,
            currentPage: SearchStore.page
        };
    },

    predefinedFieldSelection(setName) {
        if (setName === "none") {
            this.updateSelectedFields(Immutable.Set());
        } else if (setName === "all") {
            this.updateSelectedFields(Immutable.Set(this._fields().map((f) => f.name)));
        } else if (setName === "default") {
            this.updateSelectedFields(Immutable.Set(['message', 'source']));
        }
    },

    updateSelectedFields(fieldSelection) {
        var selectedFields = this.sortFields(fieldSelection);
        SearchStore.fields = selectedFields;
        this.setState({selectedFields: selectedFields});
    },
    _fields() {
        return this.props.result[this.state.showAllFields ? 'all_fields' : 'page_fields'];
    },

    onFieldToggled(fieldName) {
        var currentFields = this.state.selectedFields;
        var newFieldSet;
        if (currentFields.contains(fieldName)) {
            newFieldSet = currentFields.delete(fieldName);
        } else {
            newFieldSet = currentFields.add(fieldName);
        }
        this.updateSelectedFields(newFieldSet);
    },
    togglePageFields() {
        this.setState({showAllFields: !this.state.showAllFields});
    },

    sortFields(fieldSet) {
        var sortedFields = Immutable.OrderedSet();
        if (fieldSet.contains('source')) {
            sortedFields = sortedFields.add('source');
        }
        fieldSet = fieldSet.delete('source');
        var remainingFieldsSorted = fieldSet.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        return sortedFields.concat(remainingFieldsSorted);
    },

    addFieldGraph(field) {
        this.refs.fieldGraphsComponent.addFieldGraph(field);
    },
    addFieldQuickValues(field) {
        this.refs.fieldQuickValuesComponent.addFieldQuickValues(field);
    },
    addFieldStatistics(field) {
        this.refs.fieldStatisticsComponent.addFieldStatistics(field);
    },

    componentDidMount() {
        this._updateWidth();
        this._initializeAffix();
        DashboardStore.updateWritableDashboards();
        $(window).on('resize', this._resizeCallback);
    },
    componentWillUnmount() {
        $(window).off("resize", this._resizeCallback);
    },
    _initializeAffix() {
        $(React.findDOMNode(this.refs.oma)).affix({
            offset: { top: 111 }
        });
    },
    _resizeCallback() {
        // Call resizedWindow() only at end of resize event so we do not trigger all the time while resizing.
        clearTimeout(resizeMutex);
        resizeMutex = setTimeout(() => this._updateWidth(), 100);
    },
    _updateWidth() {
        var node = React.findDOMNode(this.refs.opa);
        this.setState({currentSidebarWidth: $(node).width()});
    },

    render() {
        var style = {};
        if (this.state.currentSidebarWidth) {
            style = {width: this.state.currentSidebarWidth};
        }
        var anyHighlightRanges = Immutable.fromJS(this.props.result.messages).some(message => message.get('highlight_ranges') !== null);

        // short circuit if the result turned up empty
        if (this.props.result['total_result_count'] === 0) {
            var streamDescription = null;
            if (this.props.searchInStream) {
                streamDescription = "in stream " + this.props.searchInStream.title;
            }
            return (
                <div>
                    <div className="row content content-head">
                        <div className="col-md-12">
                            <h1>
                                <span className="pull-right">
                                    <AddToDashboardMenu title="Add count to dashboard"
                                                        pullRight
                                                        widgetType={this.props.searchInStream ? Widget.Type.STREAM_SEARCH_RESULT_COUNT : Widget.Type.SEARCH_RESULT_COUNT}
                                                        permissions={this.props.permissions}/>
                                </span>

                                <span>Nothing found {streamDescription}</span>
                            </h1>

                            <p className="description">
                                Your search returned no results.&nbsp;
                                <ModalTrigger key="debugQuery" modal={<ShowQueryModal builtQuery={this.props.builtQuery} />}>
                                    <a href="#" onClick={(e) => e.preventDefault()}>Show the Elasticsearch query.</a>
                                </ModalTrigger>
                            </p>
                        </div>
                    </div>
                </div>);
        }
        return (
            <div id='main-content-search' className='row'>
                <div ref="opa" className="col-md-3 col-sm-12" id="sidebar">
                    <div ref="oma" id="sidebar-affix" style={style}>
                        <SearchSidebar result={this.props.result}
                                       builtQuery={this.props.builtQuery}
                                       selectedFields={this.state.selectedFields}
                                       fields={this._fields()}
                                       showAllFields={this.state.showAllFields}
                                       togglePageFields={this.togglePageFields}
                                       onFieldToggled={this.onFieldToggled}
                                       onFieldSelectedForGraph={this.addFieldGraph}
                                       onFieldSelectedForQuickValues={this.addFieldQuickValues}
                                       onFieldSelectedForStats={this.addFieldStatistics}
                                       predefinedFieldSelection={this.predefinedFieldSelection}
                                       showHighlightToggle={anyHighlightRanges}
                                       shouldHighlight={this.state.shouldHighlight}
                                       toggleShouldHighlight={(event) => this.setState({shouldHighlight: !this.state.shouldHighlight})}
                                       currentSavedSearch={SearchStore.savedSearch}
                                       searchInStream={this.props.searchInStream}
                                       permissions={this.props.permissions}
                            />
                    </div>
                </div>
                <div className="col-md-9 col-sm-12" id="main-content-sidebar">
                    <FieldStatistics ref='fieldStatisticsComponent'
                                     permissions={this.props.permissions}/>

                    <FieldQuickValues ref='fieldQuickValuesComponent'
                                      permissions={this.props.permissions}/>

                    <LegacyHistogram formattedHistogram={this.props.formattedHistogram}
                                     histogram={this.props.histogram}
                                     permissions={this.props.permissions}
                                     isStreamSearch={this.props.searchInStream !== null}/>

                    <FieldGraphs ref='fieldGraphsComponent'
                                 resolution={this.props.histogram['interval']}
                                 from={this.props.histogram['histogram_boundaries'].from}
                                 to={this.props.histogram['histogram_boundaries'].to}
                                 permissions={this.props.permissions}
                                 searchInStream={this.props.searchInStream}/>

                    <ResultTable messages={this.props.result.messages}
                                 page={this.state.currentPage}
                                 selectedFields={this.state.selectedFields}
                                 sortField={this.state.sortField}
                                 sortOrder={this.state.sortOrder}
                                 resultCount={this.props.result['total_result_count']}
                                 inputs={this.props.inputs}
                                 streams={this.props.streams}
                                 nodes={this.props.nodes}
                                 highlight={this.state.shouldHighlight}
                        />

                </div>
            </div>);
    }
});

module.exports = SearchResult;