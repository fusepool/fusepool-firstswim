enyo.kind({
    name: 'SearchBox',
    kind: enyo.Control,
    tag: 'div',
    classes: 'searchBox',

    components: [
        { kind: 'onyx.InputDecorator', classes: 'categoryLabel', components: [
            { kind: 'onyx.Input', placeholder: 'Search in documents', onkeyup: 'searchKeyUp' },
            { tag: 'div', classes: 'searchImage' }
        ]},
        { kind: onyx.Button, classes: 'searchButton', content: 'OK', ontap: 'search' }
    ],

    searchKeyUp: function(inSender, inEvent){
        if(inEvent.keyCode === 13){
            this.search();
        }
    },

    search: function(){
        this.owner.updateUI();
    }
});