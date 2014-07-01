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
		searchWord: '',
		documentURL: '',
		predicates: []
    },

    components: [
		{ tag: 'div', name: 'predicateAnnotatorName', classes: 'predicateAnnotatorName', content: 'You can configure whether you\'re interested in a specific predicate in this preview or not:' },
		{ classes: 'clear' },
		{ tag: 'div', name: 'showPredicateAnnotator', content: 'Customize predicates', classes: 'showPredicateAnnotator', ontap: 'showPredicateAnnotator' },
		{ classes: 'clear' },
		{  tag: 'div', name: 'annotatorPanel', components: [
			{ tag: 'div', name: 'predicateList' },
			{ classes: 'clear' },
			{ tag: 'div', name: 'hidePredicateAnnotator', content: 'Close', classes: 'hidePredicateAnnotator enyo-unselectable', ontap: 'hidePredicateAnnotator' }
		]}
    ],

    /**
     * The create function sets the content of the label list based on the doc URI
     */
    create: function(){
        this.inherited(arguments);
		this.initPredicates();
		this.$.annotatorPanel.hide();
    },
	
	initPredicates: function() {
		for(var i=0;i<this.predicates.length;i++){
			this.$.predicateList.createComponent({
				kind: 'PredicateItem',
				name: this.predicates[i].text,
				predicateText: this.predicates[i].text,
				accepted: this.predicates[i].accepted,
				dismissFunction: 'dismissPredicate',
				acceptFunction: 'acceptPredicate'
			});
			this.$.predicateList.render();
		}
	},
	
	setPredicateState: function(predicateName, state) {
		for(var i=0;i<this.predicates.length;i++){
			if(this.predicates[i].text == predicateName) {
				this.predicates[i].accepted = state;
			}
		}
	},
	
    /**
     * This function deletes a label from the GUI and sends an annotation
	 * to the server about this action.
     */
    dismissPredicate: function(predicateName){
		this.sendPredicateAnnotation(predicateName,-1);
		this.setPredicateState(predicateName,false);
        this.owner.owner.filterGraph(this.predicates);
    },
	
    acceptPredicate: function(predicateName){
		this.sendPredicateAnnotation(predicateName,1);
		this.setPredicateState(predicateName,true);
        this.owner.owner.filterGraph(this.predicates);
    },
	
	showPredicateAnnotator: function() {
		this.$.annotatorPanel.show();
		this.$.showPredicateAnnotator.hide();
	},
	
	hidePredicateAnnotator: function() {
		this.$.annotatorPanel.hide();
		this.$.showPredicateAnnotator.show();
	},
	
	sendPredicateAnnotation: function(predicate,action) {
				
		var currentDate = new Date().toISOString();
		var userURI =  'http://fusepool.info/users/'+readCookie('currentUser');

		var annotationString =	'@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> . ' + 
								'@prefix oa: <http://www.w3.org/ns/oa#> . ' +
								'[] ' + 
								'a oa:Annotation ; ' +
								'a <http://fusepool.eu/ontologies/annostore#AdaptiveLayoutAnnotation> ; ' +
								'oa:annotatedAt "'+currentDate+'" ; ' +
								'oa:annotatedBy <'+userURI+'> ; ' +
								'oa:hasTarget <'+this.documentURL+'> ; ' + 
								'<http://fusepool.eu/ontologies/annostore#hasQuery> "' + readCookie('lastSearch') + '" ; ' + 
								'oa:hasBody [ ' +
								'	a <http://fusepool.eu/ontologies/annostore#RecipeAnnotation> ; ';
								
		if(action==1) {
			annotationString +=	'<http://fusepool.eu/ontologies/annostore#acceptedPredicate> <'+predicate+'> ] .';
		}
		else {
			annotationString +=	'<http://fusepool.eu/ontologies/annostore#dismissedPredicate> <'+predicate+'> ] .';
		}

		// console.log(annotationString);
		sendAnnotation(annotationString);
	}
	
});