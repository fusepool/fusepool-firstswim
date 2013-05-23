enyo.kind({
    tag: 'div',
    name: 'DynamicMenu',

    published: {
        menuItemClass: '',
        menuItems: null
    },

    create: function(){
        this.inherited(arguments);
        enyo.forEach(this.menuItems, this.addMenuItem, this);
    },

    addMenuItem: function(menuItem){
        this.createComponent({
            tag: 'div',
            classes: this.menuItemClass,
            functionName: menuItem.functionName,
            content: menuItem.label,
            ontap: 'tapMenu'
        });
    },

    tapMenu: function(inSender, inEvent){
        this.owner[inSender.functionName]();
    }
});