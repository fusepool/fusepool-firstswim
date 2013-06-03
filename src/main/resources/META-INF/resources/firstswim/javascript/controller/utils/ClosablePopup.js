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
     * This function set the popup's width
     * @param newWidth the new width in pixels
     * @param margin left and right margin in pixels
     */
    updateWidth: function(newWidth, margin){
        this.applyStyle('width', newWidth + 'px');
        var popupWidth = newWidth - margin / 2;
        this.$.popup.applyStyle('width', popupWidth + 'px');
    },

    /**
     * This function return the popup's content
     * @returns the content
     */
    getContent: function(){
        return this.$.popup.getContent();
    },

    /**
     * This function set the popup's content. It shows all about the popups.
     * @param content the popup's new content
     */
    setContent: function(content){
        this.$.popup.setContent(content);
        this.$.popup.show();
        this.$.closeButton.show();
        this.show();
    },

    /**
     * This function runs when the user click out of the popup or to the close
     * button. It hides all about the popup.
     */
    close: function(){
        this.hide();
        this.$.closeButton.hide();
    }

});