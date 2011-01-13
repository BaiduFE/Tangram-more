/* Copyright (c) 2010 Baidu */
var baidu=baidu||{version:"1-2-0"};baidu.guid="$BAIDU$";window[baidu.guid]=window[baidu.guid]||{};baidu.lang=baidu.lang||{};
baidu.lang.guid=function(){return"TANGRAM__"+(window[baidu.guid]._counter++).toString(36)};window[baidu.guid]._counter=window[baidu.guid]._counter||1;
baidu.ajax=baidu.ajax||{};baidu.ajax.request=function(d,o){function j(){if(n.readyState==4){try{var q=n.status}catch(p){e("failure");
return}e(q);if((q>=200&&q<300)||q==304||q==1223){e("success")}else{e("failure")}window.setTimeout(function(){n.onreadystatechange=new Function();
if(g){n=null}},0)}}function c(){if(window.ActiveXObject){try{return new ActiveXObject("Msxml2.XMLHTTP")}catch(p){try{return new ActiveXObject("Microsoft.XMLHTTP")
}catch(p){}}}if(window.XMLHttpRequest){return new XMLHttpRequest()}}function e(q){q="on"+q;var p=b[q],r=baidu.ajax[q];if(p){if(q!="onsuccess"){p(n)
}else{p(n,n.responseText)}}else{if(r){if(q=="onsuccess"){return}r(n)}}}o=o||{};var i=o.data||"",g=!(o.async===false),h=o.username||"",m=o.password||"",a=(o.method||"GET").toUpperCase(),f=o.headers||{},b={},l,n;
for(l in o){b[l]=o[l]}f["X-Request-By"]="baidu.ajax";try{n=c();if(a=="GET"){d+=(d.indexOf("?")>=0?"&":"?");if(i){d+=i+"&";
i=null}if(o.noCache){d+="b"+(new Date()).getTime()+"=1"}}if(h){n.open(a,d,g,h,m)}else{n.open(a,d,g)}if(g){n.onreadystatechange=j
}if(a=="POST"){n.setRequestHeader("Content-Type","application/x-www-form-urlencoded")}for(l in f){if(f.hasOwnProperty(l)){n.setRequestHeader(l,f[l])
}}e("beforerequest");n.send(i);if(!g){j()}}catch(k){e("failure")}return n};baidu.browser=baidu.browser||{};if((/(\d+\.\d)(\.\d)?\s+safari/i.test(navigator.userAgent)&&!/chrome/i.test(navigator.userAgent))){baidu.browser.safari=parseFloat(RegExp["\x241"])
}if(/msie (\d+\.\d)/i.test(navigator.userAgent)){baidu.ie=baidu.browser.ie=parseFloat(RegExp["\x241"])}if(/opera\/(\d+\.\d)/i.test(navigator.userAgent)){baidu.browser.opera=parseFloat(RegExp["\x241"])
}baidu.dom=baidu.dom||{};baidu.dom.ready=function(){var c=false,e=false,d=[];function a(){if(!c){c=true;for(var g=0,f=d.length;g<f;g++){d[g]()}}}function b(){if(e){return
}e=true;var i=document,g=window,f=baidu.browser.opera;if(i.addEventListener&&!f){i.addEventListener("DOMContentLoaded",f?function(){if(c){return
}for(var j=0;j<i.styleSheets.length;j++){if(i.styleSheets[j].disabled){setTimeout(arguments.callee,0);return}}a()}:a,false)
}else{if(baidu.browser.ie&&g==top){(function(){if(c){return}try{i.documentElement.doScroll("left")}catch(j){setTimeout(arguments.callee,0);
return}a()})()}else{if(baidu.browser.safari){var h;(function(){if(c){return}if(i.readyState!="loaded"&&i.readyState!="complete"){setTimeout(arguments.callee,0);
return}if(h===undefined){h=0;var n=i.getElementsByTagName("style");var l=i.getElementsByTagName("link");if(n){h+=n.length
}if(l){for(var m=0,k=l.length;m<k;m++){if(l[m].getAttribute("rel")=="stylesheet"){h++}}}}if(i.styleSheets.length!=h){setTimeout(arguments.callee,0);
return}a()})()}}}g.attachEvent?g.attachEvent("onload",a):g.addEventListener("load",a,false)}return function(f){b();c?f():(d[d.length]=f)
}}();baidu.json=baidu.json||{};baidu.json.parse=function(a){if(!/^[\],:{}\s]*$/.test(a.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){return null
}return window.JSON&&window.JSON.parse?window.JSON.parse(a):(new Function("return "+a))()};baidu.event=baidu.event||{};baidu.event._unload=function(){var c=baidu.event._listeners,a=c.length,b=!!window.removeEventListener,e,d;
while(a--){e=c[a];if(e[1]=="unload"){continue}d=e[0];if(d.removeEventListener){d.removeEventListener(e[1],e[3],false)}else{if(d.detachEvent){d.detachEvent("on"+e[1],e[3])
}}}if(b){window.removeEventListener("unload",baidu.event._unload,false)}else{window.detachEvent("onunload",baidu.event._unload)
}};if(window.attachEvent){window.attachEvent("onunload",baidu.event._unload)}else{window.addEventListener("unload",baidu.event._unload,false)
}baidu.event._listeners=baidu.event._listeners||[];baidu.event.on=function(b,d,e){d=d.replace(/^on/i,"");if("string"==typeof b){b=baidu.dom.g(b)
}var c=function(f){e.call(b,f)},a=baidu.event._listeners;a[a.length]=[b,d,e,c];if(b.addEventListener){b.addEventListener(d,c,false)
}else{if(b.attachEvent){b.attachEvent("on"+d,c)}}return b};baidu.on=baidu.event.on;baidu.json.stringify=(function(){var b={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"};
function a(f){if(/["\\\x00-\x1f]/.test(f)){f=f.replace(/["\\\x00-\x1f]/g,function(g){var h=b[g];if(h){return h}h=g.charCodeAt();
return"\\u00"+Math.floor(h/16).toString(16)+(h%16).toString(16)})}return'"'+f+'"'}function d(m){var g=["["],h=m.length,f,j,k;
for(j=0;j<h;j++){k=m[j];switch(typeof k){case"undefined":case"function":case"unknown":break;default:if(f){g.push(",")}g.push(baidu.json.stringify(k));
f=1}}g.push("]");return g.join("")}function c(f){return f<10?"0"+f:f}function e(f){return'"'+f.getFullYear()+"-"+c(f.getMonth()+1)+"-"+c(f.getDate())+"T"+c(f.getHours())+":"+c(f.getMinutes())+":"+c(f.getSeconds())+'"'
}return function(j){switch(typeof j){case"undefined":return"undefined";case"number":return isFinite(j)?String(j):"null";case"string":return a(j);
case"boolean":return String(j);default:if(j===null){return"null"}else{if(j instanceof Array){return d(j)}else{if(j instanceof Date){return e(j)
}else{var g=["{"],i=baidu.json.stringify,f,h;for(key in j){if(j.hasOwnProperty(key)){h=j[key];switch(typeof h){case"undefined":case"unknown":case"function":break;
default:if(f){g.push(",")}f=1;g.push(i(key)+":"+i(h))}}}g.push("}");return g.join("")}}}}}})();