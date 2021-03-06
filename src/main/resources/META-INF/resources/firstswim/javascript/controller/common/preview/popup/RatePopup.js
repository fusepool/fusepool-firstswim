enyo.kind({

    kind: onyx.Popup,
    name: 'RatePopup',

    published: {
        // -- labels
        positiveLabel: '',
        negativeLabel: '',
        okButtonLabel: 'OK',
        cancelButtonLabel: 'Cancel',
        placeholderText: '',
        // -- classes
        rateContentClass: '',
        inputFrameClass: '',
        okButtonClass: ''     
    },

    create: function(){
        this.inherited(arguments);
        this.$.okButton.setContent(this.okButtonLabel);
        this.$.cancelButton.setContent(this.cancelButtonLabel);
        this.$.okButton.setClasses(this.okButtonClass);
        this.$.rateContent.setClasses(this.rateContentClass);
        this.$.inputFrame.setClasses(this.inputFrameClass);
        this.$.categoryInput.setPlaceholder(this.placeholderText);
    },

    components: [
        { tag: 'div', name: 'rateContent' },
        { kind: 'onyx.InputDecorator', name: 'inputFrame', components: [
            { kind: onyx.Input, name: 'categoryInput', onkeyup: 'categoryKeyUp' }
        ]},
        { kind: onyx.Button, name: 'okButton', ontap: 'sendRating' },
        { kind: onyx.Button, name: 'cancelButton', ontap: 'cancelRate' }
    ],

    showPopup: function(isPositive){
        if(isPositive){
            this.$.rateContent.setContent(this.positiveLabel);
        } else {
            this.$.rateContent.setContent(this.negativeLabel);
        }
        this.show();
    },

    categoryKeyUp: function(inSender, inEvent){
        if(inEvent.keyCode === 13){
            this.sendRating();
        }
    },

    sendRating: function(){
        this.$.categoryInput.setValue('');
        this.hide();
    },

    cancelRate: function(){
        this.$.categoryInput.setValue('');
        this.hide();
    }

});