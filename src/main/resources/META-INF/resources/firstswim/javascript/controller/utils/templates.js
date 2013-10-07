/**
 * Register helper to show content of a rdf source
 * @param {String} url the url of template details
 */
Handlebars.registerHelper('getRDF', function(url) {
    var id = _.uniqueId('getrdf_');
    var requestURL = CONSTANTS.DETAILS_URL + '?iri=' + url;
    var store = rdfstore.create();
    store.load('remote', requestURL, function(success) {
        if(success){
            var answer = getRDFPropertyValue(store, 'http://www.w3.org/2000/01/rdf-schema#label');
            $("#"+id).html(answer);
            return "<p id=\""+id+"\">"+ " ... " +"</p>";
        }
    });

});