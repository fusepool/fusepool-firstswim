/**
* @class ClosablePopup
*/
enyo.kind(
/** @lends ClosablePopup.prototype */
{
    name: 'ClosablePopup',

    published: {
        popupClasses: '',
        closeButtonClasses: ''
    },

    create: function(){
        this.inherited(arguments);
        this.$.popup.setClasses(this.popupClasses);
        this.$.closeButton.setClasses(this.closeButtonClasses);
        this.close();
    },

    components: [
        { name: 'popup', kind: onyx.Popup, allowHtml: true, onHide: 'close' },
        { name: 'closeButton', ontap: 'close' }
    ],

    /**
     * This function sets the width of the popup window.
	 * @method updateWidth
     * @param {Number} newWidth the new width in pixels
     * @param {Number} margin left and right margin in pixels
     */
    updateWidth: function(newWidth, margin){
        this.applyStyle('width', newWidth + 'px');
        var popupWidth = newWidth - margin / 2;
        this.$.popup.applyStyle('width', popupWidth + 'px');
    },

    /**
     * This function returns the content in the popup window.
	 * @method getContent
     * @return {String} the content
     */
    getContent: function(){
        return this.$.popup.getContent();
    },

    /**
     * This function sets the content and opens the popup window.
	 * @method setContent
     * @param {String} content the popup's new content
     */
    setContent: function(content){
        this.$.popup.setContent(content);
        this.open();
    },

    /**
     * This function shows the popup and the close button.
	 * @method open
     */
    open: function(){
        this.$.popup.show();
        this.$.closeButton.show();
        this.show();
    },

    /**
     * This function runs when the user clicks out of the popup or on the close
     * button. It hides the popup window.
	 * @method close
     */
    close: function(){
        this.hide();
        this.$.closeButton.hide();
    }

});