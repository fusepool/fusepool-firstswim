/**
* @class LocationViewer
*/
enyo.kind(
/** @lends LocationViewer.prototype */
{
    name: 'LocationViewer',
    kind: enyo.Control,

    published: { 
        offset: 0,
        searchWord: '',
        titleClass: '',
        titleContent: '',
        noDataLabel: '',
        loaderClass: ''
	},

    /**
     * When the component is created the program sets the title's properties and
     * hides the loader.
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
		{ tag: 'div', name: 'mapDiv', published: { id: 'mapDiv'}, classes: 'mapDiv' }
    ],
	
	search: function(searchWord) {
		console.log(searchWord);
	}
		
});
