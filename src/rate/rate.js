/*
 * @desc : rate ui component for tangram
 * @author xiaoqiang
 * @mail zhengqianglong@baidu.com
 * @ctime 2010-04-22
 * @version 1.0.0
 */

/*
 * Usage:
 * baidu.more.rate.show(ele,options);
 * 
 * @param ele  元素id的引用或者字符串形式
 * @param options = {
 * 		"total" : 5,	// 总共需要多少个星星【可选，默认显示5个】
 * 		"current" : 3,	// 亮着的星星数【可选，默认无】
 * 		"leave" : function () {} // 鼠标移出焦点区域触发函数【可选】
 * 		"hover" : function (num) {}  // 鼠标经过的触发功能函数【可选】
 * 		"click" : function (num) {} // 点击的触发功能函数【可选】
 * }
 */

(function(){

		baidu.more = baidu.more || {};
		baidu.more.rate = {};

		// 默认参数配置
		var config = {
			'total' : 5,
			'current' : 0
		};

		// 默认样式名称
		var classon = 'tangram-rate-star-on';
		var classoff = 'tangram-rate-star-off';

		baidu.more.rate.build = function (options) {
			var total = options['total'], cur = options['current'], html = '';
			for (var i=0; i<cur; i++) {
				html += '<span class="tangram-rate-star-on"></span>';
			}
			for (var i=cur; i<total; i++) {
				html += '<span class="tangram-rate-star-off"></span>';
			}
			return html;
		}

		baidu.more.rate.show = function (ele, options) {
			configMerge(options);
			baidu.g(ele).innerHTML = baidu.more.rate.build(config);
			// bind events
			var spans = baidu.g(ele).getElementsByTagName('span');
			for (var i=0,len=spans.length; i<len; i++) {
				baidu.on(spans[i], 'mouseover', function(num){
						return function() {
							render(num+1,ele);
							callback('hover',num+1);
						};
					}(i));
				baidu.on(spans[i], 'click', function(num){
						return function() {
							callback('click',num+1);
						};
					}(i))
			}
			baidu.on(ele, 'mouseout', function(){
					render (config['current'], this);
					callback('leave',null);
				});
		}

		// 参数合并
		function configMerge (options) {
			if (options && baidu.isObject(options)) {
				baidu.extend(config, options);
			} 
		}

		// callback
		function callback (type,arg) {
			if (typeof config[type] == "function") {
				config[type](arg);
			}
		}

		// render star (current num, total num, ele)
		function render (c,ele) {
			var spans = baidu.g(ele).getElementsByTagName('span');
			for (var i=1,len=spans.length; i<=len; i++) {
				if (c == 0) {
					spans[i-1].className = classoff;
				} else if (i <= c) {
					if (spans[i-1].className != classon) {
						spans[i-1].className = classon;
					}
				} else {
					if (spans[i-1].className != classoff) {
						spans[i-1].className = classoff;
					}
				}
			}
			spans = null;
		}

	})();

