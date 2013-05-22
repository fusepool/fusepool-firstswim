enyo.kind({

    name: 'OpenedDocHeader',
    kind: enyo.Control,
    classes: 'openedDocHeader',

    components: [
        { tag: 'div', classes: 'positiveMobileRateButton', ontap: 'positiveRate' },
        { tag: 'div', classes: 'negativeMobileRateButton', ontap: 'negativeRate' },
        { tag: 'div', classes: 'fullMobileViewButton', ontap: 'fullView' },
        {
            kind: 'RatePopup',
            name: 'ratePopup',
            classes: 'ratePopup',
            positiveLabel: 'Rate to positive',
            negativeLabel: 'Rate to negative',
            placeholderText: 'Category name...',
            rateContentClass: 'rateContent',
            inputFrameClass: 'searchLabel',
            okButtonClass: 'okRateButton'
        }
    ],

    positiveRate: function(){
        this.$.ratePopup.showPopup(true);
    },

    negativeRate: function(){
        this.$.ratePopup.showPopup(false);
    },

    fullView: function(){
        alert('Full view function is coming soon...');
    }

});