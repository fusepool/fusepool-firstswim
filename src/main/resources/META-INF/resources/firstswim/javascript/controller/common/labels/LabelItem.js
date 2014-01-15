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
        labelId: '',
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
		
		if(this.labelType=='prediction') {
			this.$.labelDeleteButton.destroy();
		}
		else {
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
		{ tag: 'span', name: 'labelDeleteButton', onclick: 'deleteLabel', content: 'x' },
		{ tag: 'span', name: 'labelAddButton', onclick: 'addPredictedLabel', content: '+' }	
    ],

    /**
     * This function deletes a label from the GUI and sends an annotation
	 * to the server about this action.
     */
    deleteLabel: function(){
        this.owner.owner[this.deleteFunction](this.labelId,this);
    },
	
	addPredictedLabel: function(){
        this.owner.owner[this.addFunction](this.labelId,this.labelText,this);
	}
});