'use strict';

var React = require('react');
var NewLookupFilterModal = require('./NewLookupFilterModal');
var ViewLookupFilterMappingsModal = require('./ViewLookupFilterMappingsModal');
var DeleteLookupFilterModal = require('./DeleteLookupFilterModal');
var LookupFiltersStore = require('../../stores/lookup-filters/LookupFiltersStore');


var LookupFilter = React.createClass({
    getInitialState() {
        return {
            lookupFilters: []
            // keys: [],
            // values: [],
            // mappings:[]
        };
    },
    componentDidMount() {
        this.loadData();
    },
    loadData() {
        var thisObj = this;
        var promise = LookupFiltersStore.loadLookupFilters();
        promise.done(function(data) {
            var parsed = JSON.parse(data);
            if (parsed.filters !== undefined) {
                // var k = [], v = [], m = [];
                // for (var i = 0; i < parsed.filters.length; i++) {
                //     //console.log(parsed.filters[i].key);
                //     k[i] = parsed.filters[i].key;
                //     v[i] = parsed.filters[i].value;
                //     m[i] = parsed.filters[i].mappings[0];
                // }
                if (thisObj.isMounted()) {
                    thisObj.setState({
                       lookupFilters: parsed.filters
                       // keys: k,
                       // values: v,
                       // mappings: m
                    });
                    // console.log(thisObj.state.lookupFilters);
                    // console.log(thisObj.state.keys);
                    // console.log(thisObj.state.values);
                }
            } 
        });
 

    },
    deleteFilter(filter, callback) {
         LookupFiltersStore.deleteLookupFilter(filter, () => {
            callback();
            this.loadData();
        });
    },
	render() {
        var deleteFilterFunc = this.deleteFilter;
        var fieldName = {
            fontSize: 20,
        };
        return (
            <div>
                <div className="row content content-head">
                    <div className="col-md-12">
                        <div className="pull-right actions">
                            <NewLookupFilterModal />
                        </div>
                        
                        <h1>Lookup Filter</h1>

                        <p className="description">
                            Transform messages via a lookup data map.
                        </p>
                    </div>
                </div>

                <div className="row content">
                    <div className="col-md-12">
                        <div>
                            {this.state.lookupFilters.map(function(filter, index){
                                return <div>
                                        <span><label className="control-label">Existing Field: </label> <span className="text-info" style={fieldName}>{filter.key}</span></span><br/>
                                        <span><label className="control-label">New Field(s): </label> <span className="text-success" style={fieldName}>{filter.value}</span></span>
                                        <span className="pull-right"><DeleteLookupFilterModal keyfield={filter.key} valuefield={filter.value} filter={filter} deleteFilter={deleteFilterFunc}/></span>
                                        <span className="pull-right" style={{marginRight: 5}}><ViewLookupFilterMappingsModal filter={filter} /></span>
                                        <hr/></div>;
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
	}
});

module.exports = LookupFilter;
