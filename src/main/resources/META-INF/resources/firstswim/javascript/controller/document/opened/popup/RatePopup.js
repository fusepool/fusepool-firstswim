enyo.kind({

    kind: onyx.Popup,
    name: 'RatePopup',

    published: {
        positiveLabel: '',
        negativeLabel: ''
    },

    components: [
        { tag: 'div', name: 'rateContent', classes: 'rateContent' },
        { kind: 'onyx.InputDecorator', classes: 'searchLabel', components: [
            { kind: onyx.Input, name: 'categoryInput', placeholder: 'Category name...', onkeyup: 'categoryKeyUp' }
        ]},
        { kind: onyx.Button, classes: 'okRateButton', content: 'OK', ontap: 'sendRating' }
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
    }

});