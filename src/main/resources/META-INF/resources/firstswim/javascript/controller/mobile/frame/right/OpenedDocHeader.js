/**
* @class OpenedDocHeader
*/
enyo.kind(
/** @lends OpenedDocHeader.prototype */
{

    name: 'OpenedDocHeader',
    kind: enyo.Control,
    classes: 'openedDocHeader',

    components: [
        { tag: 'div', classes: 'positiveMobileRateButton', style: 'display:none', ontap: 'positiveRate' },
        { tag: 'div', classes: 'negativeMobileRateButton', style: 'display:none', ontap: 'negativeRate' },
        { tag: 'div', classes: 'fullMobileViewButton', style: 'display:none', ontap: 'fullView' },
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

    /**
     * This function shows the rate popup with true (positive) parameter.
     */
    positiveRate: function(){
//        this.$.ratePopup.showPopup(true);
    },

    /**
     * This function shows the rate popup with false (negative) parameter.
     */
    negativeRate: function(){
//        this.$.ratePopup.showPopup(false);
    },

    /**
     * This function opens a document in full view.
     */
    fullView: function(){
//        alert('Full view function is coming soon...');
    }

});