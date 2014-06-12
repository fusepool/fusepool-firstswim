/**
* @class PredicateAnnotator
*/
enyo.kind(
/** @lends PredicateAnnotator.prototype */
{
    name: 'PredicateAnnotator',
    kind: enyo.Control,
	classes: 'predicateAnnotatorPanel',

    published: {
		documentURL: '',
		predicates: []
    },

    components: [
		{ tag: 'div', name: 'predicateAnnotatorName', classes: 'predicateAnnotatorName', content: 'You can configure whether you\'re interested in a specific preditace or not:' },
        { classes: 'clear' },
        { tag: 'div', name: 'predicateList' },
		{ classes: 'clear' }
    ],

    /**
     * The create function sets the content of the label list based on the doc URI
     */
    create: function(){
        this.inherited(arguments);
		this.initPredicates();
    },
	
	initPredicates: function() {
		for(var i=0;i<this.predicates.length;i++){
			this.$.predicateList.createComponent({
				kind: 'PredicateItem',
				name: this.predicates[i],
				predicateText: this.predicates[i],
				dismissFunction: 'dismissPredicate',
				acceptFunction: 'acceptPredicate'
			});
			this.$.predicateList.render();
		}
	},
	
    /**
     * This function deletes a label from the GUI and sends an annotation
	 * to the server about this action.
     */
    dismissPredicate: function(predicate){
		this.sendPredicateAnnotation(predicate,-1);
    },
	
    acceptPredicate: function(predicate){
		this.sendPredicateAnnotation(predicate,1);
    },
	
	sendPredicateAnnotation: function(predicate,action) {
				
		var currentDate = new Date().toISOString();
		var userURI =  'http://fusepool.info/users/'+GLOBAL.currentUser;

		var annotationString =	'@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> . ' + 
								'@prefix oa: <http://www.w3.org/ns/oa#> . ' +
								'[] ' + 
								'a oa:Annotation ; ' +
								'oa:annotatedAt "'+currentDate+'" ; ' +
								'oa:annotatedBy <'+userURI+'> ; ' +
								'oa:hasTarget <'+this.documentURL+'> ; ' + 
								'oa:hasBody [ ' +
								'	a <http://fusepool.eu/ontologies/annostore#RecipeAnnotation> ; ';
								
		if(action==1) {
			annotationString +=	'<http://fusepool.eu/ontologies/annostore#acceptedPredicate> <'+predicate+'> ] .';
		}
		else {
			annotationString +=	'<http://fusepool.eu/ontologies/annostore#dismissedPredicate> <'+predicate+'> ] .';
		}

		sendAnnotation(annotationString);
	}
	
});