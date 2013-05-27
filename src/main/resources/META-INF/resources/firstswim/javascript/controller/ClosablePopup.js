enyo.kind({

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

    updateWidth: function(newWidth, margin){
        this.applyStyle('width', newWidth + 'px');
        var popupWidth = newWidth - margin / 2;
        this.$.popup.applyStyle('width', popupWidth + 'px');
    },

    getContent: function(){
        return this.$.popup.getContent();
    },

    setContent: function(content){
        this.$.popup.setContent(content);
        this.$.popup.show();
        this.$.closeButton.show();
        this.show();
    },

    close: function(){
        this.hide();
        this.$.closeButton.hide();
    }

});