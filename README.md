# CSSrefresh

Based http://cssrefresh.frebsite.nl/ with <a href="http://leaverou.github.io/prefixfree/">PrefixFree</a> support.

## Usage

Put <strong>cssrefresh.js</strong> in your <strong>js</strong> directory and add this in `<head>`:

```html
<script>
window.onload = function(){
	var script = document.createElement('script');
	script.src = "js/cssrefresh.js";
	document.getElementsByTagName('head').appendChild(script);
};
</script>
```

## Bookmarklet

Copy and past in new bookmark URL:

```javascript
javascript:(function(script){script.setAttribute('src','https://rawgithub.com/yukulele/CSSrefresh/master/cssrefresh.js');var head=document.getElementsByTagName('head').appendChild(script);})(document.createElement('script'));
```
