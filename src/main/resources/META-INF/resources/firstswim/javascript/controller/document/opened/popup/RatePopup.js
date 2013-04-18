enyo.kind({

    kind: onyx.Popup,
    name: 'RatePopup',
    components: [
        { tag: 'div', name: 'rateContent', classes: 'rateContent' },
        { kind: 'onyx.InputDecorator', classes: 'searchLabel', components: [
            { kind: onyx.Input, name: 'categoryInput', placeholder: 'Category name...', onkeyup: 'categoryKeyUp' }
        ]},
        { kind: onyx.Button, classes: 'okRateButton', content: 'OK', ontap: 'sendRating' }
    ],

    showPopup: function(isPositive, content){
        this.$.rateContent.setContent(content);
        this.show();
    },

    sendRating: function(){
        this.$.categoryInput.setValue('');
        this.hide();
    }

});