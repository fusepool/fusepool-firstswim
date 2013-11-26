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
        labelClass: '',
        labelTextClass: '',
        labelDeleteClass: '',
        deleteFunction: ''
    },

    create: function(){
        this.inherited(arguments);
        this.$.labelText.setContent(this.labelText);
        this.$.labelText.setClasses(this.labelTextClass);
        this.$.labelDeleteButton.setClasses(this.labelDeleteClass);
		this.setClasses(this.labelClass);
    },

    rendered: function(){
        this.inherited(arguments);
    },
	
    destroy: function() {
        this.inherited(arguments);
    },

    components: [
		{ tag: 'span', name: 'labelText' },
		{ tag: 'span', name: 'labelDeleteButton', onclick: 'deleteLabel', content: 'X', style: 'cursor: pointer;color: red' }	
    ],

    /**
     * This function deletes a label from the GUI and sends an annotation
	 * to the server about this action.
     */
    deleteLabel: function(){
        this.owner.owner[this.deleteFunction](this.labelId);
		this.destroy();
    }
});