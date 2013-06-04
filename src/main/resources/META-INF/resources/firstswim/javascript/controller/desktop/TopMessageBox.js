/**
* @class TopMessageBox
*/
enyo.kind(
/** @lends TopMessageBox.prototype */
{
    kind: enyo.Control,
    name: 'TopMessageBox',

    /**
     * In the beginning this messagebox is not visible.
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
     * This function update the message box's content.
     * @param {String} newMessage the box's new content
     */
    updateMessage: function(newMessage){
        this.$.message.setContent(newMessage);
        this.showMessage();
    },

    /**
     * This function close the top message box.
     */
    close: function(){
        this.hide();
    }

});