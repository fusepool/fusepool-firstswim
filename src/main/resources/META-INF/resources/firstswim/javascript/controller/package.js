if(/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.platform)){
    enyo.depends(
        // -- Utils -- //
            'utils.js',
        // -- Autosuggest -- //
            '../autosuggest/autosuggest.js',
        // -- Left panel -- //
            'frame/left/LeftHeader.js',
            'frame/left/Bookmark.js',
            'frame/left/DetailsBox.js',
            'frame/left/dictionary/DictionaryEntity.js',
            'frame/left/dictionary/Dictionary.js',
            'frame/left/dictionary/DictionaryList.js',
            'frame/left/LeftPanel.js',
        // -- Middle -- //
            'frame/middle/SearchBox.js',
            'frame/middle/documents/DocumentList.js',
            'frame/middle/documents/ShortDocument.js',
            'frame/middle/MiddlePanel.js',
        // -- Right -- //
            'frame/right/OpenedDocHeader.js',
            'frame/right/OpenedDoc.js',
            'frame/right/popup/AddEntityPopup.js',
            'frame/right/popup/MoveEntityPopup.js',
            'frame/right/popup/RemoveEntityPopup.js',
            'frame/right/popup/RatePopup.js',
            'frame/right/RightPanel.js',
        // -- Controller -- //
            'MobileApp.js'
    );
} else {
    enyo.depends(
        // -- Utils -- //
            'utils.js',
        // -- Autosuggest -- //
            '../autosuggest/autosuggest.js',
        // -- Left panel -- //
            'frame/left/Bookmark.js',
            'frame/left/DetailsBox.js',
            'frame/left/dictionary/DictionaryEntity.js',
            'frame/left/dictionary/Dictionary.js',
            'frame/left/dictionary/DictionaryList.js',
        // -- Middle -- //
            'frame/middle/SearchBox.js',
            'frame/middle/documents/DocumentList.js',
            'frame/middle/documents/ShortDocument.js',
        // -- Right -- //
            'frame/right/OpenedDocHeader.js',
            'frame/right/OpenedDoc.js',
            'frame/right/popup/AddEntityPopup.js',
            'frame/right/popup/MoveEntityPopup.js',
            'frame/right/popup/RemoveEntityPopup.js',
            'frame/right/popup/RatePopup.js',
        // -- Controller -- //
            'DesktopApp.js'
    );
}