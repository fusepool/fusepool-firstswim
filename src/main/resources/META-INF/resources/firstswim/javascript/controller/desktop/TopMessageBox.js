/**
* @class TopMessageBox
*/
enyo.kind(
/** @lends TopMessageBox.prototype */
{
    kind: enyo.Control,
    name: 'TopMessageBox',

    /**
     * In the beginning this message box is not visible.
	 * @method create
     */
    create: function(){
        this.inherited(arguments);
        this.hide();
    },

    components: [
        { name: 'message', content: 'This is a message.' },
        { content: 'Close message', ontap: 'close', classes: 'topMsgCloseBtn' }
    ],

    /**
     * This function updates the content in the message box.
	 * @method updateMessage
     * @param {String} newMessage the box's new content
     */
    updateMessage: function(newMessage){
        this.$.message.setContent(newMessage);
        this.showMessage();
    },

    /**
     * This function closes the top message box.
	 * @method close
     */
    close: function(){
        this.hide();
    }

});