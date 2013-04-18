enyo.kind({
    tag: 'div',
    name: 'EntityMenu',
    classes: 'entityMenu',
    components: [
        { tag: 'div', classes: 'entityMenuItem', content: 'Add entity', ontap: 'addEntity' },
        { tag: 'div', classes: 'entityMenuItem', content: 'Remove entity', ontap: 'removeEntity' },
        { tag: 'div', classes: 'entityMenuItem', content: 'Move entity', ontap: 'moveEntity' }
    ],
    
    addEntity: function(){
        this.hide();
        this.owner.addEntity();
    },

    removeEntity: function(){
        this.hide();
        this.owner.removeEntity();
    },

    moveEntity: function(){
        this.hide();
        this.owner.moveEntity();
    }
});
