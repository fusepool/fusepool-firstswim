/**
* @class LabelItem
*/
enyo.kind(
/** @lends LabelItem.prototype */
{
    tag: 'div',
    name: 'LabelItem',
    style: 'float: left',

    published: {
        labelText: '',
        labelType: '',
        labelClass: '',
        labelTextClass: '',
        labelDeleteClass: '',
        labelAddClass: '',
        deleteFunction: '',
        addFunction: ''
    },

    create: function(){
        this.inherited(arguments);
        this.$.labelText.setContent(this.labelText);
        this.$.labelText.setClasses(this.labelTextClass);
        this.$.labelDeleteButton.setClasses(this.labelDeleteClass);
        this.$.labelAddButton.setClasses(this.labelAddClass);
		this.setClasses(this.labelClass);
		
		if(this.labelType!='prediction') {
			this.$.labelAddButton.destroy();
		}
    },
	
    rendered: function(){
        this.inherited(arguments);
    },

    destroy: function() {
        this.inherited(arguments);
    },
	
    components: [
		{ tag: 'span', name: 'labelText' },
		{ tag: 'span', name: 'labelAddButton', onclick: 'addPredictedLabel', content: '✔' },
		{ tag: 'span', name: 'labelDeleteButton', onclick: 'deleteLabel', content: '✗' }
    ],

    deleteLabel: function(){
        this.owner.owner[this.deleteFunction](this.labelText,this);
    },
	
	addPredictedLabel: function(){
        this.owner.owner[this.addFunction](this.labelText,this);
	}
});