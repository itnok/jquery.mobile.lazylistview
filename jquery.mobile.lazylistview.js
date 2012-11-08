( function( $ ) {
	/**
	 *  Namespace: the namespace the plugin is located under (eg .mobile)
	 *  pluginName: the name of the plugin (eg .listview)
	 */

	var extensionOptions = {

		 lazy     : false,
		 indolence:  0.2,
		 lazyurl  : '',
		 lazychunk: 20
    };

    $.extend( true, $.mobile.listview.prototype.options, extensionOptions );

	var extensionMethods = {

        //
        //	Load a bunch of new items to add to the ListView
        //
        lazyLoad: function() {
        	var $self     = $( this.element ),
        		_this     = this,
        		_selector = '';

        	//
        	//	Find a suitable selector to precisely identify our ListView
        	//
        	//	This selector is going to be used to identify the correct
        	//	content to extract from the HTML Ajax response
        	//
        	if( typeof $self.attr( 'id' ) !== 'undefined' ) {
	        	_selector = '#' + $self.attr( 'id' );
        	} else if( $( 'ul.ui-listview[data-lazy="true"],ol.ui-listview[data-lazy="true"]' ).length == 1 ) {
	        	_selector = 'ul.ui-listview[data-lazy="true"],ol.ui-listview[data-lazy="true"]';
        	} else {
	        	_selector = 'ul:first,ol:first';
        	}

			$self.data(
    			'lazyLoader',
    			$.ajax( {
    				url     : _this.options.lazyurl,
    				type    : 'GET',	//	GET is faster than POST
    				data    : {
	    					start: Math.max( 0, $self.children( 'li.ui-li' ).not( '.ui-li-divider' ).length ),
	    					chunk: _this.options.lazychunk
    					},
    				dataType: 'html',
    				success : function( data, status, jqXHR ) {
	    				
	    				var rscript      = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
	    					_htmlContent = $( '<div>' )
							//
    						//	inject the contents of the document in, removing the scripts
    						//	to avoid any 'Permission Denied' errors in IE
    						//
    						.append( data.replace( rscript, '' ) )
    						.find( _selector )
    					
    					$self.append( _htmlContent.children( 'li' ) );
    					$self.data( 'lazyLoader', false );
    					//	Stop loading animation here!

    					//	Refresh ListView
    					_this.refresh();

    				}
    			} )
    		);
        },

        //
        //	Verify whether the ListView is lazy or not
        //
        isLazy: function() {
        	//
        	//	Let's make it works with both boolean and string
        	//	(case insensitive! ;-) )
        	//
	        if( typeof this.options.lazy === 'string' ) {
		        return this.options.lazy.toLowerCase() == 'true';
		    }
		    
		    return !! this.options.lazy;
        },

        //
        //	Verify whether new contents for the ListView are currently lazy loading or not
        //
        isLazyLoading: function() {
		    return !! $( this.element ).data( 'lazyLoader' );
        },

        //
        //	Verify if we are at bottom of the ListView
        //	( "indolence" included! ) ;-)
        //
        isAtBottom: function() {
	        var
//	        	listItems      = $( this.element ).children( 'li.ui-li' ).not( '.ui-li-divider' ),
//	            elementsHeight = listItems.length * $( listItems[ 0 ] ).outerHeight(),
	        	totalHeight    = $( 'body' ).height(),
	            currentScroll  = $( document ).scrollTop(),
	            pageHeight     = $( this.parentPage ).height();
	        
//	        console.log(
//	        	'total height : '  + totalHeight    + ' ' +
//	        	'currentScroll: '  + currentScroll  + ' ' +
//	        	'elementsHeight: ' + elementsHeight + ' '
//	        );
//	        console.log(
//	        	'ui-page height: '      + $( '#emissione' ).height() + ' ' +
//	        	'ui-header height: '    + $( '.ui-header' ).height() + ' ' +
//	        	'ui-content height: '   + $( '.ui-content' ).height() + ' '
//	        );
	        
	        return ( pageHeight - currentScroll - totalHeight * (1 + this.options.indolence ) <= 1 );
        }

     };

//
//	EXAMPLE
//  $.extend( true, $[ Namespace ][ pluginname ].prototype, extensionMethods );
//
    $.extend( true, $.mobile.listview.prototype, extensionMethods );


} )( jQuery );

$( function() {

	$( 'ul.ui-listview,ol.ui-listview' ).each( function( idx, obj ) {
		if( $( obj ).listview( 'isLazy' ) ) {
			$( obj ).data( 'lazyLoader', false );
		}
	} );
	
	$( window ).bind( 'scrollstart', function() {        

		$( 'ul.ui-listview,ol.ui-listview' ).each( function( idx, obj ) {
			if( $( obj ).listview( 'isLazy' ) ) {
//				$( '.ui-body-a' ).css( 'background', 'green' );
				if( $( obj ).listview( 'isAtBottom' ) &&
				  ! $( obj ).listview( 'isLazyLoading' ) ) {
					$( obj ).listview( 'lazyLoad' );
				}
			}			
		} );

	} );
	
	$( window ).bind( 'scrollstop', function() {        

		$( 'ul.ui-listview,ol.ui-listview' ).each( function( idx, obj ) {
			if( $( obj ).listview( 'isLazy' ) ) {
//				$( '.ui-body-a' ).css( 'background', 'red' );
				if( $( obj ).listview( 'isAtBottom' ) &&
				  ! $( obj ).listview( 'isLazyLoading' ) ) {
					$( obj ).listview( 'lazyLoad' );
				}
			}			
		} );

	} );
    
} );
