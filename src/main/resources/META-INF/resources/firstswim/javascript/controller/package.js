var platform = '';
//platform = navigator.platform;
if(/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(platform)) {
    enyo.depends(
    // -- Document / frame -- //
        'frame/main-mobile.js'
    );
} else {
    enyo.depends(
    // -- Utils -- //
        'utils.js',
    // -- Autosuggest -- //
        '../autosuggest/autosuggest.js',
    // -- Dictionaries -- //
        'dictionary/DictionaryEntity.js',
        'dictionary/Dictionary.js',
        'dictionary/DictionaryList.js',
    // -- Document / list -- //
        'document/list/DocumentList.js',
        'document/list/ShortDocument.js',
    // -- Document / opened -- //
        'document/opened/DocumentBox.js',
        'document/opened/DynamicMenu.js',
        'document/opened/DocumentInOpen.js',
    // -- Document / opened / popup -- //
        'document/opened/popup/AddEntityPopup.js',
        'document/opened/popup/MoveEntityPopup.js',
        'document/opened/popup/RemoveEntityPopup.js',
        'document/opened/popup/RatePopup.js',
    // -- Document / frame -- //
        'frame/SearchBox.js',
        'frame/Bookmark.js',
        'frame/main.js'
    );
}