( function() {

    'use strict';

    var currentPageUnits = 'inches';

    /**
     * [ description]
     * @return {[type]} [description]
     */
    var cache = ( function() {

        var storage = {};

        var _set = function( parent, node ) {

            if ( typeof storage[ parent ] === 'undefined' ) {
                storage[ parent ] = [];
            }
            storage[ parent ].push( node );
        };


        var _convert = function( parent, units ) {
            for ( var i = 0; i < storage[ parent ].length; i++ ) {
                var savedNode = storage[ parent ][ i ];
                savedNode.node.data = ( units === 'inches' ) ? savedNode.inches : savedNode.mm;
            }
        };

        var _hasData = function( parent ) {
            return !!storage[ parent ];
        };

        return {
            set: _set,
            convert: _convert,
            hasData: _hasData
        };

    }() );

    /**
     * This is just a getter and setter for saved value of units
     * @return {[type]} [description]
     */
    var selectedUnit = ( function() {

        var currentUnit;

        /**
         * Getter will used cached value when possible
         * @return {[type]} [description]
         */
        var _get = function() {

            if ( typeof currentUnit !== 'undefined' ) {
                return currentUnit;
            }

            currentUnit = 'inches';

            if ( typeof localStorage !== 'undefined' ) {

                var unit = localStorage.getItem( 'burlsource_units' );
                if ( unit !== null ) {
                    currentUnit = unit;
                }
            }

            return currentUnit;
        };

        /**
         * [ description]
         * @param  {[type]} value [description]
         * @return {[type]}       [description]
         */
        var _set = function( value ) {
            if ( typeof localStorage !== 'undefined' ) {
                localStorage.setItem( 'burlsource_units', value );
                currentUnit = value;
            }
        };

        return {
            get: _get,
            set: _set
        };

    }() );


    /**
     * Changing units
     * @param  {[type]} evt [description]
     * @return {[type]}     [description]
     */
    var triggerClicked = function( evt ) {

        if ( evt.target.value !== selectedUnit.get() ) {
            selectedUnit.set( evt.target.value );
            processURL();
        }
    };

    /**
     * Inserts units trigger and sets it's bindings
     * @param  {[type]} parentNode [description]
     * @return {[type]}            [description]
     */
    var insertUnitsTrigger = function( parentNode ) {

        if ( document.querySelector( '#burlsource_unitsTrigger' ) !== null || parentNode === null ) {
            return;
        }
        // console.log( 'ADDING insertUnitsTrigger', parentNode );

        var holder = document.createElement( 'div' );
        holder.setAttribute( 'id', 'burlsource_unitsTrigger' );
        holder.setAttribute( 'style', 'text-align:right' );

        holder.innerHTML = 'Units: \
        <input type="radio" style="margin-left: 15px" name="burlsource_units" id="burlsource_units_inches" value="inches" /><label style="display: inline" for="burlsource_units_inches">inches</label>\
        <input type="radio" style="margin-left: 15px" name="burlsource_units" id="burlsource_units_mm" value="mm"><label style="display: inline" for="burlsource_units_mm">mm</label>';

        parentNode.appendChild( holder );

        /**
         * switcher click event handler
         * @param  {[type]} evt [description]
         * @return {[type]}     [description]
         */
        var nodes = parentNode.querySelectorAll( 'input[name="burlsource_units"]' );
        for ( var i = 0; i < nodes.length; i++ ) {
            nodes[ i ].addEventListener( 'click', triggerClicked );
            if ( nodes[ i ].getAttribute( 'value' ) === selectedUnit.get() ) {
                nodes[ i ].setAttribute( 'checked', 'checked' );
            }
        }
    };

    /**
     * [findInchesInString description]
     * @param  {[type]} str [description]
     * @return {[type]}     [description]
     */
    var findInchesInString = function( str ) {

        var parts = str.split( '.' );
        var result;
        for ( var i = parts.length - 1; i >= 0; i-- ) {

            result = inchesToMm( parts[ i ] );

            if ( result !== '' && !/NaN/.test( result ) ) {
                parts[ i ] = result;
            }
        }

        return parts.join( '.' );
    };

    /**
     * [inchesToMm description]
     * @param  {[type]} dimensionsString [description]
     * @return {[type]}                  [description]
     */
    var inchesToMm = function( dimensionsString ) {


        if ( typeof dimensionsString === 'undefined' ) {
            return '';
        }

        var inc2mm = 0.039370;
        var dimens = dimensionsString.split( /\s|x/ );

        for ( var i = 0; i < dimens.length; i++ ) {

            if ( /\d+(?:&amp;\d+\/\d+)?"/.test( dimens[ i ] ) ) {

                var parts = dimens[ i ].replace( /\D+/g, 'x' ).split( /\D/ );
                parts.pop(); // we don't need last element

                var inchValue;

                switch ( parts.length ) {
                    case 1:

                        inchValue = parseInt( parts[ 0 ], 10 );
                        break;

                    case 2:

                        inchValue = parseInt( parts[ 0 ], 10 ) / parseInt( parts[ 1 ], 10 );
                        break;

                    default:

                        inchValue = ( parseInt( parts[ 0 ], 10 ) + ( parseInt( parts[ 1 ], 10 ) / parseInt( parts[ 2 ], 10 ) ) );
                        break;
                }

                inchValue = Math.floor( inchValue / inc2mm );
                dimensionsString = dimensionsString.replace( dimens[ i ], inchValue );
            }
        }

        return dimensionsString;

    };

    /**
     * [ description]
     * @return {[type]} [description]
     */
    var processURL = function() {

        var i;
        var textNode;
        var result;

        // console.log( 'requestedUnit = ' + selectedUnit.get() );
        if ( currentPageUnits === selectedUnit.get() ) {
            return;
        }

        // new site
        // products listing
        var listing = document.querySelector( '.productlist-page' );
        if ( listing !== null ) {

            if ( cache.hasData( listing ) ) {
                cache.convert( listing, selectedUnit.get() );
            } else {

                var descriptions = document.querySelectorAll( '.ProductDescription' );
                for ( i = 0; i < descriptions.length; i++ ) {

                    textNode = descriptions[ i ].firstChild;

                    if ( textNode.nodeType === 3 ) {

                        var cachedData = {
                            node: textNode,
                            inches: textNode.data,
                            mm: findInchesInString( textNode.data )
                        };

                        cache.set( listing, cachedData );
                        textNode.data = cachedData.mm;
                    }
                }
            }

            currentPageUnits = selectedUnit.get();
            return;
        }

        // product details
        var productDetails = document.querySelector( '#ProductDetails' );
        if ( productDetails !== null ) {

            if ( cache.hasData( listing ) ) {
                cache.convert( listing, selectedUnit.get() );
            } else {

                var node = document.querySelector( '.ProductDescriptionContainer' ).firstElementChild;

                for ( i = 0; i < node.children.length; i++ ) {

                    var cNode = node.children[ i ];
                    var content = cNode.firstChild;

                    if ( cNode.nodeType === 1 && content !== null ) {

                        result = inchesToMm( content.data );

                        if ( result !== '' && !/NaN/.test( result ) ) {
                            content.data = result;
                        }
                    }
                }
            }

            return;
        }

        // products comparison
        var compareContent = document.querySelector( 'table.ComparisonTable' );
        if ( compareContent !== null ) {
            var nodes = compareContent.querySelectorAll( 'tr:nth-child(7) .CompareLeft' );

            for ( i = 0; i < nodes.length; i++ ) {

                if ( nodes[ i ].nodeType === 1 ) {
                    result = findInchesInString( nodes[ i ].firstChild.data );
                    if ( result !== '' && !/NaN/.test( result ) ) {
                        nodes[ i ].firstChild.data = result;
                    }
                }
            }

            return;
        }

        // old website
        var oldWebsite = document.querySelector( '#stickyFooter' );
        if ( oldWebsite !== null ) {

            var blocks = document.querySelectorAll( '.panel-content td.item-cell td:nth-child(2) div:nth-child(2) span' );
            for ( i = 0; i < blocks.length; i++ ) {

                textNode = blocks[ i ].firstChild;
                if ( textNode.nodeType === 3 ) {
                    result = inchesToMm( textNode.data );

                    if ( result !== '' && !/NaN/.test( result ) ) {
                        textNode.data = result;
                    }
                }
            }
            return;
        }
    };

    insertUnitsTrigger( document.querySelector( '#CategoryHeading' ) );
    processURL();

}() );