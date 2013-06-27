/**
* @class DictionaryList
*/
enyo.kind(
/** @lends DictionaryList.prototype */
{
    name: 'DictionaryList',
    kind: enyo.Control,

    published: {
        dictionaryTitle: '',
		scrollerClass: '',
        noContentLabel: '',
        entityFilterFunction: '',
		entityCheckboxClass: '',
        titleClass: '',
        searchWord: '',
        showDetailsFunction: '',
        uncheckedEntities: []
    },

    /**
     * When the component is created the program set the title's properties and
     * hides it.
     */
    create: function(){
        this.inherited(arguments);
        this.$.scroller.setClasses(this.scrollerClass);
        this.$.title.setContent(this.dictionaryTitle);
        this.$.title.setClasses(this.titleClass);
        this.$.title.hide();
    },
    
    components: [
		{ tag: 'div', name: 'title' },
		{ kind: 'enyo.Scroller', name: 'scroller', fit: true, touchOverscroll: false, components: [
			{ name: 'dictionaryListPanel', classes: 'dictionaryListPanel', components: [
				{ tag: 'div', name: 'list' }
			]}
		]}
    ],

    /**
     * This function update the dictionary list from a dictionary object. This
     * object contains a searchword, a dictionary array and the unchecked entites
     * from the past.
     * @param {Object} dictionaryObject the dictionary object
     */
    updateList: function(dictionaryObject){
        this.searchWord = dictionaryObject.searchWord;
        this.uncheckedEntities = dictionaryObject.uncheckedEntities;
        if(isEmpty(this.uncheckedEntities)){
            this.uncheckedEntities = [];
        }
        var dictionaries = dictionaryObject.dictionaries;
        this.$.list.destroyClientControls();
        if(dictionaries.length > 0){
            for(var i=0;i<dictionaries.length;++i){
                this.$.list.createComponent({
                    kind: 'Dictionary',
                    nameClass: 'dictionaryName',
					entityCheckboxClass: this.entityCheckboxClass,
                    dictionaryName: dictionaries[i].name,
                    entityList: dictionaries[i].entities,
                    uncheckedEntities: this.uncheckedEntities,
                    showDetailsFunction: 'updateDetails'
                });
            }
            this.$.list.render();
            if(this.uncheckedEntities.length > 0){
                this.filter();
            }
        } else {
            this.$.list.setContent(this.noContentLabel);
            this.$.list.render();
        }
        this.$.title.show();
    },

    /**
     * This function is called by a "child" dictionary, because the user would like
     * to see a details of an entity. This function call the parent's function,
     * which show the details.
     * @param {Object} details the details object
     */
    updateDetails: function(details){
        this.owner[this.showDetailsFunction](details);
    },

    /**
     * This function is called when the unchecked entity list is not empty in
     * the updateList function. It filters the document list.
     */
    filter: function(){
        var url = this.createFilterRequestURL();
        var request = new enyo.Ajax({
            method: 'GET',
            url: url,
            handleAs: 'text',
            headers: { Accept: 'application/rdf+xml' }
        });
        request.go();
        request.response(this, function(inSender, inResponse) {
            this.responseFilter(inResponse);
        });
    },

    /**
     * This function create a request URL for the filtering from the searchword
     * and the unchecked entities.
     * @return {String} the created request URL
     */
    createFilterRequestURL: function(){
        if(!isEmpty(this.searchWord)){
            var url = 'http://platform.fusepool.info/ecs/?search=' + this.searchWord;
            var entities = this.uncheckedEntities;
            for(var i=0;i<entities.length;i++){
                url += '&subject=http://dbpedia.org/resource/' + entities[i];
            }
            url += '&xPropObj=http://www.w3.org/1999/02/22-rdf-syntax-ns#first';
            url = replaceAll(url, ' ', '_');
            return url;
        } else {
            return '';
        }
    },

    /**
     * This function is called when the response of the filter request is arrived.
     * It calls the parent function to update the user interface.
     * @param {String} data the response data
     */
    responseFilter: function(data){
        this.owner[this.entityFilterFunction](data);
    }

});
