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
     * When the component is created this function iterates through the menu items
	 * and fires the addMenuItem function of them.
	 * @method create
     */
    create: function(){
        this.inherited(arguments);
        enyo.forEach(this.menuItems, this.addMenuItem, this);
    },

    /**
     * This function creates an Enyo component using a menuItem object.
	 * @method addMenuItem
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
     * This function is called when the user clicks on a menu item.
	 * @method tapMenu
     * @param {Object} inSender the clicked menu item
     */
    tapMenu: function(inSender){
        this.owner[inSender.functionName]();
    },

    /**
     * This function returns a child element by index.
	 * @method getChildrenById
     * @param {Number} index the index of the child
     * @return {Object} the child object
     */
    getChildrenById: function(index){
        return this.children[index];
    }

});