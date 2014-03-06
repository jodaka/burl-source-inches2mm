function inchesToMm( dimensionsString ) {

    'use strict';

    if ( typeof  dimensionsString  === 'undefined' ) {
        return;
    }

    var inc2mm = 0.039370;
    var result = [];
    var dimens =  dimensionsString .split(/\s|x/);

    for (var i = 0; i < dimens.length; i++) {

        if ( /\d+(?:&amp;\d+\/\d+)?"/.test(dimens[i])) {

            var parts = dimens[i].replace(/\D+/g, 'x').split(/\D/);

            var inchValue = ( parts.length == 2 )
                ? parseInt(parts[0], 10)
                : ( parseInt(parts[0], 10) + (parseInt(parts[1], 10) / parseInt(parts[2], 10) ) );

            inchValue = Math.floor( inchValue / inc2mm );

            if ( ! /"$/.test(dimens[i])) {
                inchValue += '' + dimens[i].replace(/.*"/, '' );
            }

            dimensionsString = dimensionsString.replace( dimens[i], inchValue );
        }
    }

    return dimensionsString;

}

var blocks = document.querySelectorAll('.panel-content td.item-cell td:nth-child(2) div:nth-child(2) span');
for (var i = 0; i < blocks.length; i++ ) {
    var result = inchesToMm(blocks[i].innerHTML);
    if (result && result !== '' && !/NaN/.test(result)) {
        blocks[i].innerHTML = result;
    }
}