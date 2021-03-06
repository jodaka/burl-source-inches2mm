function inchesToMm( dimensionsString ) {

    'use strict';

    if ( typeof  dimensionsString  === 'undefined' ) {
        return '';
    }

    var inc2mm = 0.039370;
    var dimens =  dimensionsString .split(/\s|x/);

    for (var i = 0; i < dimens.length; i++) {

        if ( /\d+(?:&amp;\d+\/\d+)?"/.test(dimens[i])) {

            var parts = dimens[i].replace(/\D+/g, 'x').split(/\D/);
                parts.pop(); // we don't need last element

            var inchValue;

            switch (parts.length) {
                case 1:

                    inchValue = parseInt(parts[0], 10);
                    break;

                case 2:

                    inchValue = parseInt(parts[0], 10) / parseInt(parts[1], 10);
                    break;

                default:

                    inchValue = ( parseInt(parts[0], 10) + (parseInt(parts[1], 10) / parseInt(parts[2], 10) ) )
                    break;
            }

            inchValue = Math.floor( inchValue / inc2mm );
            dimensionsString = dimensionsString.replace( dimens[i], inchValue );
        }
    }

    return dimensionsString;

}

var blocks = document.querySelectorAll('.panel-content td.item-cell td:nth-child(2) div:nth-child(2) span');
for (var i = 0; i < blocks.length; i++ ) {

    var textNode = blocks[i].firstChild;
    if ( textNode.nodeType === 3 ) {
        var result = inchesToMm(textNode.data);

        if (result !== '' && !/NaN/.test(result)) {
            textNode.data = result;
        }
    }
}