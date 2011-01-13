/*
 * Tangram
 * Copyright 2010 Baidu Inc. All right reserved.
 * 
 * path: baidu/dom/fixable.js
 * author: lixiapeng
 * version: 1.0.0
 * date: 2010/08/03
 **/

//baidu.more
baidu.more = baidu.more || {};

/**
 * 使目标元素拥有可进行与页面可见区域相对位置保持不变的移动的能力
 * 
 * @param	{HTMLElement|string}	element	目标元素或目标元素的id
 * @param	{JSON}					options	fix配置项
 * 			{vertival,horizontal,offset,onload,onbeforemove,onmove,onaftermove,ondispose}
 * 			vertival取值  :top或buttom,默认top
 * 			horizontal取值:left和right,默认为left
 * @return  new fix();
 **/
baidu.more.fixable = function(element,options){
	if(!baidu.dom.g(element)) return false;
	
	var guid = baidu.getAttr(element,"data-fixable");
	if(guid !== null){
		return window[baidu.guid]._instances[guid];
	}else{
		var fix = baidu.lang.createClass(function(){
			var thisPtr = this;
			thisPtr.isIE6 = baidu.browser.ie && baidu.browser.ie <= 6 ? true : false;
			thisPtr.isIE7 = baidu.browser.ie == 7? true:false;

			thisPtr._handleOnMove = thisPtr._getHandleOnMove();
			thisPtr.target = baidu.dom.g(element);
			thisPtr.isRender = false;
			thisPtr.origPos = thisPtr._getOriginalStyle();

			//更新默认值	
			//baidu.extend(options,{
			//	offset:{y:thisPtr.origPos.top,x:thisPtr.origPos.left}
			//});
			var offset = {y:thisPtr.origPos.top,x:thisPtr.origPos.left};
			if(typeof options.offset !== "undefined")
				baidu.extend(offset,options.offset);

			baidu.extend(options,{offset:offset});

			if(thisPtr.isIE6) baidu.extend(options,{onmove:thisPtr._handleOnMove});
			baidu.extend(thisPtr,options);

			thisPtr._start = thisPtr._getStartHandle();

			baidu.setAttr(thisPtr.target,"data-fixable",thisPtr.guid);
			thisPtr.render();
		}).extend({
	
			//默认属性	
			vertival:"top",
			horizontal:"left",
			//v_value:0,
			//h_value:0,
			offset:{x:0,y:0},
			
			//默认事件
			onload:function(){},
			onbeforemove:function(){},
			onmove:function(){},
			onaftermove:function(){},
			ondispose:function(){},
			
			/**
 			 * 将位置值都转化为针对页面top和left的值
			 * @param	{JSON}	d 页面参数
			 * @return	{JSON}	相对页面top和left的值
			 **/
			_convert:function(d){
				var thisPtr = this;
				return {
					top : thisPtr.vertival == "top" ? thisPtr.offset.y : baidu.page.getViewHeight() - thisPtr.offset.y - thisPtr.origPos.height,
					left: thisPtr.horizontal == "left" ? thisPtr.offset.x : baidu.page.getViewWidth() - thisPtr.offset.x - thisPtr.origPos.width
				};
			},

			/**
			 *  默认移动函数
			 *  @return void
			 * */
			_getHandleOnMove:function(){
				var thisPtr = this;
				return function(){
					var p = thisPtr._convert();
					thisPtr.target.style.setExpression("left","eval((document.body.scrollLeft || document.documentElement.scrollLeft) + " + p.left + ") + 'px'");
					thisPtr.target.style.setExpression("top", "eval((document.body.scrollTop || document.documentElement.scrollTop) + " + p.top + ") + 'px'"); 	
				};
			},

			/**
 			 * 当浏览器触发scroll或resize事件时触发函数
 			 * @return	void
 			 * */
			_getStartHandle:function(){
				var thisPtr = this;

				return function(){
					thisPtr.dispatchEvent("onbeforemove");
					thisPtr.dispatchEvent("onmove");
					thisPtr.dispatchEvent("onaftermove");
				};
			},

			/**
 			 * 获取target初始位置参数
 			 * */
			_getOriginalStyle:function(){
				var thisPtr = this;
				var result = {
					position	:	baidu.dom.getStyle(thisPtr.target,"position"),
					height		:	function (){
										var h = baidu.getStyle(thisPtr.target,"height");
										return (h != "auto") ? (/\d+/.exec(h)[0]) : thisPtr.target.offsetHeight;
									}(),
					width		:	function (){			
										var w = baidu.getStyle(thisPtr.target,"width");
										return (w != "auto") ? (/\d+/.exec(w)[0]) : thisPtr.target.offsetWidth;
									}()
				};
				
				result.top = (thisPtr.isIE6 || thisPtr.isIE7) ? (result.position == "static" ? baidu.dom.getPosition(thisPtr.target).top :  baidu.dom.getPosition(thisPtr.target).top - baidu.dom.getPosition(thisPtr.target.parentNode).top) : thisPtr.target.offsetTop;
				result.left = (thisPtr.isIE6 || thisPtr.isIE7) ? (result.position == "static" ? baidu.dom.getPosition(thisPtr.target).left :  baidu.dom.getPosition(thisPtr.target).left - baidu.dom.getPosition(thisPtr.target.parentNode).left) : thisPtr.target.offsetLeft;

				return result;
			},

			/**
 			 * 激活对象
 			 * @return void
 			 */
			render:function(){
				var thisPtr = this;
				if(thisPtr.isRender) return;

				baidu.setStyles(thisPtr.target,{top:"",left:"",right:"",bottom:""});

				if(!thisPtr.isIE6){
					var style = {position:"fixed"};
					style[thisPtr.vertival == "top" ? "top" : "bottom"] = thisPtr.offset.y + "px";
					style[thisPtr.horizontal == "left" ? "left" : "right"] = thisPtr.offset.x + "px";

					baidu.setStyles(thisPtr.target,style);
				}else{
					baidu.setStyle(thisPtr.target,"position","absolute");
					thisPtr.onmove();
				}

				//事件绑定
				baidu.on(window,"scroll",thisPtr._start);
				baidu.on(window,"resize",thisPtr._start);
	
				//发送onLoad事件
				thisPtr.dispatchEvent("onload");
	
				thisPtr.isRender = true;
			},

			/**
 			 * 释放对象
 			 * @return void
 			 */
			release:function(){
				var thisPtr = this;
				if(!thisPtr.isRender) return;
	
				var style = {
					position:thisPtr.origPos.position,
					left:thisPtr.origPos.left + "px",
					top:thisPtr.origPos.top + "px"
				};
	
				if(thisPtr.isIE6){
					thisPtr.target.style.removeExpression("left");
					thisPtr.target.style.removeExpression("top");
				}
				baidu.setStyles(thisPtr.target,style);

				//解除事件绑定	
				baidu.un(window,"scroll",thisPtr._start);
				baidu.un(window,"resize",thisPtr._start);
				
				//发送onDispose事件
				thisPtr.dispatchEvent("ondispose");

				thisPtr.isRender = false;
			},

			/**
 			 * 更新对象参数
 			 * */
			update:function(options){
				if(typeof(options) == "undefined") return;
				var thisPtr = this;
				baidu.object.extend(thisPtr,options);
				//thisPtr.release();
				//thisPtr.render();
			},

			getTarget:function(){
				return this.target;
			}
		});

		return new fix();
	}
};
