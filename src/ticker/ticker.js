(function () {
	/*
	 * 滚动文字效果
	 * 
	 * path: ticker.js
	 * author: lizhouquan
	 * version: 1.1.0
	 * date: 2010/10/19
	 */
	
	/**
	 * 滚动文字效果
	 *
	 * @param {string} id 需要展现滚动的区域id
	 * @param {string} content 滚动内容(支持字符串格式，如果是数组请拼接成字符串)
	 * @param options = {
	 *     tWidth : '300px',      //滚动区域的宽度
	 *     tHeight : '25px',      //滚动区域的高度
	 *     tColor : '',           //文字颜色，空表示不设置颜色
	 *     moStop : true,         //鼠标放上去的时候是否停止
	 *     tSpeed : 2             //滚动速度由慢到快可设置 1-5(整数类型)。
     * }
	 */


baidu.more = baidu.more||{};


baidu.more.ticker = function(id,content,options){
    
	options = baidu.extend({
		tWidth : '300px',  //滚动区域的宽度
		tHeight : '25px',  //滚动区域的高度
		tColor : '',       //文字颜色，空表示不设置颜色
		moStop : true,     //鼠标放上去的时候是否停止
		tSpeed : 3         //滚动速度由慢到快可设置 1-5(整数类型)。
	},options);

	
	//获得对滚动区域节点的引用
	var tkArea = baidu.g(id);
	
	//创建第一层控制div, 并获得对其的引用
	tkArea.innerHTML = '<div style="position:absolute;left:0px;top:0px;white-space:nowrap;"><\/div>';
	var tkGenDiv = tkArea.firstChild; 
	
	//创建第二层控制span, 并获得对其的引用
	tkGenDiv.innerHTML='<span>'+content+'<\/span>'; 
	var tkGenSpan = tkGenDiv.firstChild; 
	

	//做一些基本设置
	tkArea.style.position = "relative";
	tkArea.style.width = options.tWidth;
	tkArea.style.height = options.tHeight;
	tkArea.style.overflow = "hidden";
	
	tkGenDiv.style.width=options.tWidth;
	if(options.tColor!=""){
		tkGenSpan.style.color=options.tColor;
	}

	var currentSpd = options.tSpeed; 
	if(options.moStop){
		baidu.on(tkArea, "mouseover", function(e){
			currentSpd=0;
	    });
		baidu.on(tkArea, "mouseout", function(e){
			currentSpd=options.tSpeed;
		});
	}
	//开始滚动 
	setInterval(function(){
		tkGenDiv.style.left = (parseInt(tkGenDiv.style.left)>(-10 - tkGenSpan.offsetWidth))?parseInt(tkGenDiv.style.left)-currentSpd+"px" : parseInt(options.tWidth)+10+"px";
	},50);

};

})();