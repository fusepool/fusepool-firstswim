/**
 * @class DynamicMenu
 */
enyo.kind(
/** @lends DynamicMenu.prototype */
{
    tag: 'div',
    name: 'DynamicMenu',

    published: {
        menuItemClass: '',
        menuItems: null
    },

    /**
     * When the component is created, this function iterate the menuItems list
     * and call the addMenuItem function for every element.
     */
    create: function(){
        this.inherited(arguments);
        enyo.forEach(this.menuItems, this.addMenuItem, this);
    },

    /**
     * This function create an enyo component from an menuItem object, with a
     * parent function name, which means that this function will be called when
     * the user push the menuitem.
     * @param {Object} menuItem the object which contains data about a menu item
     */
    addMenuItem: function(menuItem){
        this.createComponent({
            tag: 'div',
            classes: this.menuItemClass,
            functionName: menuItem.functionName,
            content: menuItem.label,
            ontap: 'tapMenu'
        });
    },

    /**
     * This function called when the user push any menu item. It has to exist
     * the menuitem's function name.
     * @param {Object} inSender the pushed menu item
     */
    tapMenu: function(inSender){
        this.owner[inSender.functionName]();
    }
});