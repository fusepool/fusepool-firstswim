/**
* @class StyleSettingsPopup
*/
enyo.kind(
/** @lends StyleSettingsPopup.prototype */
{
    kind: enyo.Control,
    name: 'StyleSettingsPopup',
    classes: 'styleSettingsPopup',

    published: {
    },

    create: function(){
        this.inherited(arguments);
        this.close();
    },
  
    components: [
        { name: 'popup', classes: 'styleSettingsPopupDiv', kind: onyx.Popup, onHide: 'close', components: [
            { tag: 'div', classes: 'styleSettingsButtons', components: [
				{ kind: 'onyx.RadioGroup', name: 'styleSettingsRadio', onActivate: 'setCss', components: [
					{ content: 'Default', name: 'firstswimBtn', classes: 'styleSettingsButton', value: 'firstswim' },
					{ content: 'High contrast', name: 'contrastBtn', classes: 'styleSettingsButton', value: 'contrast' },
					{ content: 'Orange', name: 'beerBtn', classes: 'styleSettingsButton', value: 'beer' }
				]},				
            ]}
        ]},
        { name: 'closeButton', ontap: 'close', classes: 'styleSettingsCloseButton' }
    ],
	
	setCss: function(inSender, inEvent) {
		if (inEvent.originator.getActive()) {
			 var cssName = inSender.getActive().value;
			$("#mainCss").attr("href", CONSTANTS.STYLE_PATH + cssName + ".css");
			createCookie('css', cssName, 30);
		}
	},
	
	setRadioActive: function(cssName) {
		switch(cssName) {
			case 'firstswim':
			case 'contrast':
			case 'beer':
				this.$[cssName+'Btn'].setActive(true);
			break;
			default:
				this.$.firstswimBtn.setActive(true);
		}
	},
	
    /**
     * This function shows the whole popup.
     */
    showStyleSettings: function(){
        this.$.popup.show();
        this.$.closeButton.show();
        this.show();
    },

    /**
     * This function runs when the user clicks out of the popup or to the close
     * button. It hides the whole popup.
     */
    close: function(){
        this.hide();
        // this.$.closeButton.hide();
    }    

});
