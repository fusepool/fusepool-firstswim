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
        dismissFunction: '',
        acceptFunction: ''
    },

    create: function(){
        this.inherited(arguments);
        this.$.predicateText.setContent(this.predicateText);
		this.setClasses('predicateItem');
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

    dismissPredicate: function(){
        this.owner.owner[this.dismissFunction](this.predicateText);
		this.$.acceptPredicateButton.destroy();
		this.$.dismissPredicateButton.destroy();
		this.addClass('dismissedPredicate');
    },
	
	acceptPredicate: function(){
        this.owner.owner[this.acceptFunction](this.predicateText);
		this.$.acceptPredicateButton.destroy();
		this.$.dismissPredicateButton.destroy();
		this.addClass('acceptedPredicate');
	}
});