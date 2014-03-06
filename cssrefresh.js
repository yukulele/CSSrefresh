/*	
 *	CSSrefresh v3.0.0
 *	
 *	Copyright (c) 2012 Fred Heusschen
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
						var css = this.responseText;
						css = css.replace(/url\(\s*?((?:"|')?)(.+?)\1\s*?\)/gi, function($0, quote, url) {
							if(/^([a-z]{3,10}:|#)/i.test(url)) { // Absolute & or hash-relative
								url = $0;
							}
							else if(/^\/\//.test(url)) { // Scheme-relative
								// May contain sequences like /../ and /./ but those DO work
								url = 'url("' + link.base_scheme + url + '")';
							}
							else if(/^\//.test(url)) { // Domain-relative
								url = 'url("' + link.base_domain + url + '")';
							}
							else if(/^\?/.test(url)) { // Query-relative
								url = 'url("' + link.base_query + url + '")';
							}
							else {
								// Path-relative
								url = 'url("' + link.base + url + '")';
							}
							return url;
						});
						
						link.elem.innerHTML = PrefixFree.prefixCSS(css);
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
			var link;
			for ( a = 0, l = styles.length; a < l; a++ )
			{
				elem = styles[ a ];
				href = elem.getAttribute( 'data-href' );
				if ( typeof href === 'string' )
				{
					link = {
						type : 'PrefixFree',
						elem : elem,
						href : href,
						last : false
					};
					var url = link.href;
					link.base = url.replace(/[^\/]+$/, '');
					link.base_scheme = (/^[a-z]{3,10}:/.exec(link.base) || [''])[0];
					link.base_domain = (/^[a-z]{3,10}:\/\/[^\/]+/.exec(link.base) || [''])[0];
					link.base_query = /^([^?]*)\??/.exec(link.href)[1];
					links.push(link);
				}
			}
		}
		
		this.reloadFile( links );
	};
	
	cssRefresh();
})();
