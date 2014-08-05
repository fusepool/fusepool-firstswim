/**
* @class Landscape
*/
enyo.kind(
/** @lends Landscape.prototype */
{
    name: 'Landscape',
    kind: enyo.Control,

    published: {
        titleClass: '',
        titleContent: '',
        loaderClass: '',
        searchWord: ''
    },

    /**
     * When the component is created the program sets the title's properties and
     * hides the loader.
	 * @method create
     */
    create: function(){
        this.inherited(arguments);
        this.$.loader.hide();
        this.$.title.setContent(this.titleContent);
        this.$.title.setClasses(this.titleClass);
        this.$.loader.setClasses(this.loaderClass);
    },

    components: [
        { tag: 'div', name: 'title' },
		{ name: 'loader' },
		{ tag: 'div', name: 'landscapeDiv', classes: 'landscapeDiv', content: 'Initializing...' }
    ],
	
    /**
     * This function runs, when the user starts a search.
	 * Currently does nothing.
	 * @method startLoading
     */
    startLoading: function(){ },
	
	/**
	 * After the elements have been rendered, the Landscape
	 * module is being initialized.
	 * @method rendered
	 */
	rendered: function() {
		this.inherited(arguments); // important! must call the inherited method
		if (this.hasNode()) {
			this.$.landscapeDiv.setContent('');
			if (window['FusePool'] === undefined ||
				FusePool['Landscaping'] === undefined) {
				this.$.landscapeDiv.setContent('Landscape currently unavailable.');
			}
			else {
				FusePool.Landscaping.initialize('.landscapeDiv', this);
			}
		}
	}	
});
