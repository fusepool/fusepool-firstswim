/**
 * Check the data is empty
 * @param data
 * @returns true, if data is empty, false, if data is not empty
 */
function isEmpty(data){
    if(typeof data == 'undefined' || data == '' || data == null){
            return true;
    }
    return false;
}


function textLengthBetween(text, min, max){
    if(isEmpty(text)){
        return false;
    }
    if(text.length >= min && text.length <= max){
        return true;
    }
    return false;
}