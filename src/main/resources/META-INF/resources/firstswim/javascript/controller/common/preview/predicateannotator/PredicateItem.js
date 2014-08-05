/**
* @class PredicateItem
*/
enyo.kind(
/** @lends PredicateItem.prototype */
{
    tag: 'div',
    name: 'PredicateItem',
    style: 'float: left',

    published: {
        predicateText: '',
		accepted: true,
        dismissFunction: '',
        acceptFunction: ''
    },

	/**
     * When the component is created, the proper state and label is being set.
	 * @method create
	 */
    create: function(){
        this.inherited(arguments);
        this.$.predicateText.setContent(this.predicateText);
		if(this.accepted) {
			this.setClasses('predicateItem acceptedPredicate');
			this.$.acceptPredicateButton.hide();
		}
		else {
			this.setClasses('predicateItem dismissedPredicate');
			this.$.dismissPredicateButton.hide();
		}
    },
	
    rendered: function(){
        this.inherited(arguments);
    },

    destroy: function() {
        this.inherited(arguments);
    },
	
    components: [
		{ tag: 'span', name: 'predicateText' },
		{ tag: 'span', name: 'acceptPredicateButton', onclick: 'acceptPredicate', content: '✔', classes: 'acceptPredicateButton' },
		{ tag: 'span', name: 'dismissPredicateButton', onclick: 'dismissPredicate', content: '✗', classes: 'dismissPredicateButton' }
    ],

	/**
	 * This function is called when the user clicks on the
	 * dismiss icon. It sets the visual state of the element 
	 * and calls the proper function of the parent object 
	 * which handles this action. 
	 * @method dismissPredicate
	 */
    dismissPredicate: function(){
        this.owner.owner[this.dismissFunction](this.predicateText);
		this.$.acceptPredicateButton.show();
		this.$.dismissPredicateButton.hide();
		this.setClasses('predicateItem dismissedPredicate');
    },
	
	/**
	 * This function is called when the user clicks on the
	 * accept icon. It sets the visual state of the element 
	 * and calls the proper function of the parent object 
	 * which handles this action. 
	 * @method acceptPredicate
	 */
	acceptPredicate: function(){
        this.owner.owner[this.acceptFunction](this.predicateText);
		this.$.acceptPredicateButton.hide();
		this.$.dismissPredicateButton.show();
		this.setClasses('predicateItem acceptedPredicate');
	}
});