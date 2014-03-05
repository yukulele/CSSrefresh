/*	
 *	CSSrefresh v2.0.1
 *	
 *	Copyright (c) 2012 Fred Heusschen
 *	
 *	www.frebsite.nl
 *
 *	Dual licensed under the MIT and GPL licenses.
 *	http://en.wikipedia.org/wiki/MIT_License
 *	http://en.wikipedia.org/wiki/GNU_General_Public_License
 */

(function() {

	var cssRefresh = function() {

		this.reloadFile = function( links )
		{
			for ( var a = 0, l = links.length; a < l; a++ )
			{
				var link = links[ a ],
					newTime = this.filemtime( this.getRandom( link.href ) );

				//	has been checked before
				if ( link.last )
				{
					//	has been changed
					if ( link.last != newTime )
					{
						//	reload
						if( link.type === 'PrefixFree')
						{
							this.reloadPrefixFree(link);
						}
						else
						{
							link.elem.setAttribute( 'href', this.getRandom( link.href ) );
						}
					}
				}

				//	set last time checked
				link.last = newTime;
			}
			setTimeout( function()
			{
				this.reloadFile( links );
			}, 1000 );
		};
		
		this.filemtime = function( url )
		{
			var req = window.ActiveXObject ? new ActiveXObject( 'Microsoft.XMLHTTP' ) : new XMLHttpRequest();
			if ( !req )
			{
				throw new Error('XMLHttpRequest not supported.');
			}

			try
			{
				req.open( 'HEAD', url, false );
				req.send( null );
				if ( req.readyState < 3 )
				{
					return false;
				}
				var headers = req.getAllResponseHeaders();
				var match = headers.match(/^Last-Modified:(.*)$/m);
				if(match === null)
					return false;
				return Date.parse( match[1] );
			}
			catch ( err )
			{
				return false;
			}
		};

		this.reloadPrefixFree = function( link )
		{
			request = new XMLHttpRequest();
			request.open('GET', this.getRandom( link.href ), true);

			request.onreadystatechange = function()
			{
				if (this.readyState === 4)
				{
					if (this.status >= 200 && this.status < 400)
					{
						link.elem.innerHTML = PrefixFree.prefixCSS(this.responseText);
					}
				}
			};

			request.send();
			request = null;
		};
		
		this.getHref = function( f )
		{
			return f.getAttribute( 'href' );
		};
		
		this.getRandom = function( f )
		{
			var sep = ( f.indexOf( '?' ) > -1 ? '&' : '?' );
			return f + sep + 'cssRefresh=' + Math.random();
		};

		var files = document.getElementsByTagName( 'link' ),
			links = [], elem, a;
		
		for ( a = 0, l = files.length; a < l; a++ )
		{
			elem = files[ a ];
			rel = elem.rel;
			if ( typeof rel !== 'string' || rel.length === 0 || rel === 'stylesheet' )
			{
				links.push({
					type : 'link',
					elem : elem,
					href : this.getHref( elem ),
					last : false
				});
			}
		}
		
		if(window.PrefixFree){
			var styles = document.getElementsByTagName( 'style' );
			
			for ( a = 0, l = styles.length; a < l; a++ )
			{
				elem = styles[ a ];
				href = elem.getAttribute('data-href');
				if ( typeof href === 'string')
				{
					links.push({
						type : 'PrefixFree',
						elem : elem,
						href : href,
						last : false
					});
				}
			}
		}
		this.reloadFile( links );
	};


	cssRefresh();

})();
