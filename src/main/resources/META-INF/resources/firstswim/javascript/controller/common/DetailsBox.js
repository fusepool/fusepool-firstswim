/**
* @class DetailsBox
*/
enyo.kind(
/** @lends DetailsBox.prototype */
{

    name: 'DetailsBox',
    kind: enyo.Control,

    published: {
        scrollerClass: '',
        titleClass: '',
        detailsMainTitle: '',
        mainTitleClass: '',
        touchScroll: true
    },

    /**
     * When this component is created it sets the scroller's, the title's,
     * the image's and the content's properties.
     */
    create: function(){
        this.inherited(arguments);
        this.$.scroller.setClasses(this.scrollerClass);
        this.$.detailsMainTitle.setContent(this.detailsMainTitle);
        this.$.detailsMainTitle.setClasses(this.mainTitleClass);
        this.hide();
    },

    components: [
        { name: 'detailsMainTitle' },
        { kind: 'enyo.Scroller', name: 'scroller', fit: true, touchOverscroll: false, components: [
            { name: 'detailsPanel', classes: 'detailsPanel' }
        ]}
    ],
	
	/**
     * This function updates the content of the details
	 * @param {Object} rdf rdf with the metadata of the entity
	 */
	displayDetails: function(rdf) {
        this.scrollToTop();
        $("#" + this.$.detailsPanel.getId()).append(uduvudu.process(rdf));
        this.show();
	},
	
    /**
     * This function cleans the content.
     */
    clean: function(){
		this.$.detailsPanel.setContent('');
    },

    /**
     * This functions returns the country code from a URL
     * @param {String} countryURL the url
     * @returns {String} the country code
     */
    getCountryCode: function(countryURL){
        return countryURL.substring(countryURL.lastIndexOf('/')+1);
    },

    /**
     * This function scrolls the scrollbar to the top.
     */
    scrollToTop: function(){
        this.$.scroller.render();
        this.$.scroller.top = 0;
        this.$.scroller.setScrollTop(0);
        this.$.scroller.scrollTo(0,0);
    }

});