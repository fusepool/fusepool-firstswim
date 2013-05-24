enyo.kind({

    name: 'ClosablePopup',

    create: function(){
        this.inherited(arguments);
        this.hide();
    },

    components: [
        { name: 'popup', kind: onyx.Popup, allowHtml: true, onHide: 'close' },
        { name: 'closeButton', classes: 'popupCloseButton', ontap: 'close' }
    ],

    getContent: function(){
        return this.$.popup.getContent();
    },

    setContent: function(content){
        this.$.popup.setContent(content);
        this.$.popup.show();
        this.show();
    },

    close: function(){
        this.hide();
    }

});