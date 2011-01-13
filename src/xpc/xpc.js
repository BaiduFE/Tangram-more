/*

 * 支持跨大域通信的ajax方法

 * 

 * path : xpc.js

 * author : wukexin, zhangyunlong

 * version: 1.0.0

 * date: 2010/07/09
 
 */

///import baidu.json.parse;
///import baidu.json.stringify;
///import baidu.dom.ready;
///import baidu.lang.guid;
///import baidu.event.on;
///import baidu.ajax.request;

(function(){
	baidu.more = baidu.more || {};
	
	var codebase = {};
	var xpcList = {};
	
	function createIframe(url, target, fn){
		var ifrm = document.createElement('IFRAME');
		var style = ifrm.style;
		ifrm.src = 'about:blank';
		style.position = 'absolute';
		style.left = '-10000px';
		style.top = '-10000px';
		style.width = '10px';
		style.height = '10px';
		ifrm.frameBorder = 0;
		ifrm.id = target.guid;
		ifrm.name = target.guid;
		document.body.appendChild(ifrm);
		ifrm.src = url;		//ff cache bug;
		baidu.on(ifrm, 'load', function(){
			fn.call(target);
		});
		return ifrm.contentWindow;
	}
	
	/**
	 * XPC跨域类，利用IE6、IE7的opener漏洞和HTML5的postMessage方法来进行跨域通信，该方法不会暴露给外部。
	 *
	 * @param {string} url  要跨的域下的xpc.html文件所在路径。
	 */
	var XPC = function(url){
		this.url = url;
		this.guid = baidu.lang.guid();
		this.isReady = false;
		this.readyList = [];
		this.domain = (function(){
			var a = document.createElement('A');
			a.href = url;
			var domain =
				a.protocol.replace(':','') +
				'://' + a.hostname.replace(/\:\d+/, '') +
				(a.port === '' || a.port == 0 || (parseInt(a.port) == 80) ? '' : ':' + a.port);
			return domain;
		})();
		var that = this;
		this.opener = {
			XPC : {
				parentReceiveHandler : function(evt){
					that.onMessage(evt);
				}
			}
		};
		if(document.body) {
			this.win = createIframe(this.url, this, this.init);
			window.frames[this.guid].opener = this.opener;
		} else {
			var that = this;
			baidu.dom.ready(function(){
				that.win = createIframe(that.url, that, that.init);
				window.frames[that.guid].opener = that.opener;
			});
		}
	}
	
	XPC.prototype = {
		constructor : XPC,
	
		/**
		 * init方法是XPC内部调用的，在xpc所需的iframe载入完毕后会调用该方法。
		 */
		init : function(){
			this.isReady = true;
			var that = this;
			if(window.postMessage) {
				baidu.on(window, 'message', function(evt){
					that.onMessage(evt);
				});
			}
			that.ready();
		},
	
		/**
		 * ready方法用于注册函数，使之在xpc初始化完毕可以进行通信时调用。
		 *
		 * @param {function} fn  xpc初始化完毕后调用的方法，可以注册多个方法。
		 */
		ready : function(fn){
			var len = this.readyList.length;
			if(typeof fn === 'function')
				this.readyList[len++] = fn;
			if(this.isReady) {
				while(len--){
					this.readyList.shift()();
				}
			}
		},
	
		/**
		 * 发送一个跨域信息，并注册回调函数。
		 *
		 * @param {string} msg  跨域发送一个信息。
		 * @param {function} fn  发送信息被跨域xpc.html接收后返回信息时调用。
		 */
		request : function(msg, fn){
			var _url = this.guid + msg;
			codebase[_url] = codebase[_url] || { sending : false, fn : [] };
			if(fn) codebase[_url].fn.push(fn);
			if(!codebase[_url].sending) {
				codebase[_url].sending = true;
				this.send(msg, this);
			}
		},
	
		/**
		 * 发送一个跨域信息。
		 *
		 * @param {string} str  跨域发送一个信息。
		 */
		send : (window.postMessage) ? function(str){
			this.win.postMessage(str, this.domain);
		} : function(str){
			var o = {
				data : str,
				origin : this.domain
			};
			this.opener.XPC.childReceiveHandler(o);
		},
	
		/**
		 * 从跨域xpc.html中返回信息时的回调函数。
		 *
		 * @param {Object} evt  返回的信息对象，根据postMessage的相关定义封装了两个重要属性：
		 *     {string} origin携带了所跨域的域信息，
		 *     {string} data属性携带了返回的信息内容。
		 */
		onMessage : function (evt){
			evt = evt || window.event;
			function getIndex(str){
				var len = str.length;
				var i = 0;
				var c = str[i];
				var count = 0;
				do {
					if(str.substr(i, 1) === '{') count++;
					if(str.substr(i, 1) === '}') count--;
					i++;
				} while (count != 0 && i < len)
				return i;
			}
			if(evt.origin === this.domain){
				var i = getIndex(evt.data);
				var s = evt.data.substr(i, 1);
				var url = this.guid + evt.data.substring(0, i)
				var data = evt.data.substring(i + 1);
				this.exec(url, data, s);
			}
		},
		exec : function (url, data, s){
			var o = codebase[url];
			if(!o) return;
			var fn = o.fn;
			o.sending = false;
			var len = fn.length;
			while(len--)
				fn.shift()(data, s);
		}
	};
	/**
	 * 发送一个同域或者跨域的ajax请求
	 *
	 * @param {string} url  发送请求的url 
	 * @param {object} options 发送请求的选项参数，若该参数有xpc属性，则发送相应的跨域请求
	 */
	baidu.more.xpc = function(url, options){
		
		options.headers = options.headers || {};
		if(options.method && options.method.toUpperCase() === 'POST') {
			if(options.headers && options.headers['Content-Type']) {
				var arr = options.headers['Content-Type'].split(/\;\s*/);
				arr.push('application/x-www-form-urlencoded');
				options.headers['Content-Type'] = arr.join('; ');
			} else {
				options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
			}
		}
		
		if(options.xpc){
			var xpc = xpcList[options.xpc] || new XPC(options.xpc);
			xpcList[options.xpc] = xpc;
			options.url = url;
			var os = baidu.json.stringify(options);
			xpc.ready(function(){
				if(options.onbeforerequest) options.onbeforerequest();
				xpc.request(os,function(data, s){
					switch(s + ''){
						case '0':
							if(options.onfailure) options.onfailure(data);
							break;
						case '1':
							if(options.onsuccess) options.onsuccess(data);
							break;
					}
				});
			});
		} else {
			//如果继承了baidu.ajax则可以变为同域ajax
			if(baidu.ajax.request) baidu.ajax.request(url, options);
		}
	}
	
})();
