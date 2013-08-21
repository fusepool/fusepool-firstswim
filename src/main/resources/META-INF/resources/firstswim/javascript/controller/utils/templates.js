/**
 * Register helper to show content of a rdf source
 */

Handlebars.registerHelper('getRDF', function(url) {
    var id = _.uniqueId('getrdf_');
    var request = new enyo.Ajax({
        method: 'GET',
        url: CONSTANTS.DETAILS_URL,
        handleAs: 'text',
        headers: { Accept: 'application/rdf+xml' },
    });
    request.go({ iri: url });
    answer = request.response(this, function(inSender, inResponse) {
        answer = inResponse;
        $("#"+id).html(answer)
        console.log(id + answer);
    });

    return "<p id=\""+id+"\">"+ " ... " +"</p>";
});

function createRdfObjectFromText (text){
        var parsedData = new DOMParser().parseFromString(text, 'text/xml' );
        var rdf = jQuery.rdf();
        rdf.load(parsedData, {});
        return rdf;
};

function getPropertyValue(rdf, propertyName){
        var result = '';
        rdf.where('?s <' + propertyName + '> ?p').each(function(){
            result = this.p.value + '';
        });
        return result;
};
