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
     * The create function initializes the annotator panel.
     */
    create: function(){
        this.inherited(arguments);
		this.initPredicates();
		this.$.annotatorPanel.hide();
    },
	
	/**
	* This function initializes the predicate list based
	* on the predicates array.
	*/
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
	
	/**
	* This function sets the state of a predicate element
	* based on the given properties.
	* @param {String} predicateName label of the predicate
	* @param {Boolean} state desired state
	*/
	setPredicateState: function(predicateName, state) {
		for(var i=0;i<this.predicates.length;i++){
			if(this.predicates[i].text == predicateName) {
				this.predicates[i].accepted = state;
			}
		}
	},
	
    /**
     * This function is called when the user clicks on the 
	 * dismiss icon on a predicate element. It fires the proper
	 * functions.
	 * @param {String} predicateName label of the clicked element
     */
    dismissPredicate: function(predicateName){
		this.sendPredicateAnnotation(predicateName,-1);
		this.setPredicateState(predicateName,false);
        this.owner.owner.filterGraph(this.predicates);
    },
	
    /**
     * This function is called when the user clicks on the 
	 * accept icon on a predicate element. It fires the proper
	 * functions.
	 * @param {String} predicateName label of the clicked element
     */
    acceptPredicate: function(predicateName){
		this.sendPredicateAnnotation(predicateName,1);
		this.setPredicateState(predicateName,true);
        this.owner.owner.filterGraph(this.predicates);
    },
	
	/**
	* This function shows the annotator panel and hides the
	* 'Customize predicates' button.
	*/
	showPredicateAnnotator: function() {
		this.$.annotatorPanel.show();
		this.$.showPredicateAnnotator.hide();
	},
	
	/**
	* This function hides the annotator panel and shows the
	* 'Customize predicates' button.
	*/
	hidePredicateAnnotator: function() {
		this.$.annotatorPanel.hide();
		this.$.showPredicateAnnotator.show();
	},
	
	/**
	* This function creates the proper annotation string
	* and fires the annotation sender function.
	* @param {String} predicateName label of the clicked predicate element
	* @param {Number} action type of the click action (1 = accept; -1 = dismiss)
	*/
	sendPredicateAnnotation: function(predicateName, action) {
				
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
			annotationString +=	'<http://fusepool.eu/ontologies/annostore#acceptedPredicate> <'+predicateName+'> ] .';
		}
		else {
			annotationString +=	'<http://fusepool.eu/ontologies/annostore#dismissedPredicate> <'+predicateName+'> ] .';
		}

		// console.log(annotationString);
		sendAnnotation(annotationString);
	}
	
});