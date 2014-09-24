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
	"use strict";
	
	var origin = window.location.origin;
	
	var cssRefresh = function() {
		
		var obj = {};
		obj.reloadFile = function( links )
		{
			for ( var a = 0, l = links.length; a < l; a++ )
			{
				var link = links[ a ];
				var newTime = obj.filemtime( obj.getRandom( link.href ), function(){
					//	has been checked before
					if ( link.last )
					{
						//	has been changed
						if ( link.last != newTime )
						{
							//	reload
							if( link.type === 'PrefixFree')
							{
								obj.reloadPrefixFree(link);
							}
							else
							{
								link.elem.setAttribute( 'href', obj.getRandom( link.href ) );
							}
						}
					}

					//	set last time checked
					link.last = newTime;
				});

			}
			setTimeout( function()
			{
				obj.reloadFile( links );
			}, 1000 );
		};
		
		obj.filemtime = function( url, callback )
		{
			var req = window.ActiveXObject ? new ActiveXObject( 'Microsoft.XMLHTTP' ) : new XMLHttpRequest();
			if ( !req )
			{
				throw new Error('XMLHttpRequest not supported.');
			}

			try
			{
				req.open( 'HEAD', url );
				req.onreadystatechange = function(e){
					if(this.readyState !== this.DONE)
						return;
					if ( req.readyState < 3 )
					{
						return false;
					}
					var headers = req.getAllResponseHeaders();
					var match = headers.match( /^Last-Modified:(.*)$/m );
					if(match === null)
						return false;
					callback( Date.parse( match[1] ) );
				};
				req.send( null );
			}
			catch ( err )
			{
				return false;
			}
		};

		obj.reloadPrefixFree = function( link )
		{
			var request = new XMLHttpRequest();
			request.open('GET', obj.getRandom( link.href ), true);
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
		
		obj.getHref = function( f )
		{
			return f.getAttribute( 'href' );
		};
		
		obj.getRandom = function( f )
		{
			var sep = ( f.indexOf( '?' ) > -1 ? '&' : '?' );
			return f + sep + 'cssRefresh=' + Math.random();
		};

		var files = document.getElementsByTagName( 'link' ),
			links = [], href, elem, a, l, rel;
		
		for ( a = 0, l = files.length; a < l; a++ )
		{
			elem = files[ a ];
			rel = elem.rel;
			if ( typeof rel !== 'string' || rel.length === 0 || rel === 'stylesheet' )
			{
				href = obj.getHref( elem );
				if( href.indexOf(':') != -1 && href.indexOf( origin ) )
					continue;
				
				links.push({
					type : 'link',
					elem : elem,
					href : href,
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
		
		obj.reloadFile( links );
	};
	
	cssRefresh();
})();
