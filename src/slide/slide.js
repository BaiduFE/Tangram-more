/* 
 * slide 
 *  
 * path: slide.js 
 * author: zhangmingzhu 
 * version: 1.0.0 
 * date: 2010/04/08 
 */

/** 
 * 图片左右滑动（有缓动效果，可自动滚动）
 * 需要baidu.G、baidu.on
 * 
 * @param {HTMLElement|string} element  目标元素的id 
 * @param {HTMLElement|string} element  目标元素的id 
 * @param {HTMLElement|string} element  目标元素的id 
 * @param {HTMLElement|string} element  目标元素的id，左箭头
 * @param {HTMLElement|string} element  目标元素的id，右箭头 
 * @param {option|object}      json     自定义设置（width: 每次滚动的宽，可以缺省，默认值为100;speed: 速度，可以缺省，默认值为10;auto: 是否自动滚动，可以缺省，默认值为true;） 
 */

baidu.more = baidu.more||{};

baidu.more.slide = (function(){
	this.config = {
		width : 100,
		speed : 10,
		auto : true
	};
	var step = 10;
	var leftSpace = 0;
	var holderWidth = 0;
	var bLock = false;
	var moveT = null;
	var autoMoveT = null;
	var direction = "right";
	var SlideBox, Holder1, Holder2, ArrLeft, ArrRight;
	var moveWidth, speed, step, auto;
	
	function init(options){
		var options = options || {};
		moveWidth = options.width || config.width;
		speed = options.speed || config.speed;
		if(options.auto === false){
			auto = false;
		}else{
			auto = config.auto;
		}
		holderWidth = Holder1.offsetWidth;
		if(holderWidth >= SlideBox.offsetWidth){
			Holder2.innerHTML = Holder1.innerHTML;
		}
	}
	
	function play(objSlide, objHolder1, objHolder2, objArrLeft, objArrRight, options){
		if(objSlide != "" && baidu.G(objSlide)){
			SlideBox = baidu.G(objSlide);
		}else{
			return;
		}
		if(objHolder1 != "" && baidu.G(objHolder1)){
			Holder1 = baidu.G(objHolder1);
		}else{
			return;
		}
		if(objHolder2 != "" && baidu.G(objHolder2)){
			Holder2 = baidu.G(objHolder2);
		}else{
			return;
		}
		if(objArrLeft != "" && baidu.G(objArrLeft)){
			ArrLeft = baidu.G(objArrLeft);
		}else{
			return;
		}
		if(objArrRight != "" && baidu.G(objArrRight)){
			ArrRight = baidu.G(objArrRight);
		}else{
			return;
		}
		init(options);
		if(holderWidth >= SlideBox.offsetWidth){
			baidu.on(ArrLeft, "mousedown", moveUp);
			baidu.on(ArrLeft, "mouseup", moveUpStop);
			baidu.on(ArrLeft, "mouseout", moveUpStop);
			baidu.on(ArrRight, "mousedown", moveDown);
			baidu.on(ArrRight, "mouseup", moveDownStop);
			baidu.on(ArrRight, "mouseout", moveDownStop);
			if(auto){
				SlideBox.onmouseover = function(){clearInterval(autoMoveT)}
				SlideBox.onmouseout = autoPlay;
				autoPlay();
			}
		}
	}
	
	function moveUp(){
		clearInterval(moveT);
		if(bLock){return;}
		if(auto){clearInterval(autoMoveT);}
		bLock = true;
		direction = "left";
		moveT = setInterval(moveUpStart,speed)
	}
	
	function moveUpStart(){
		if(SlideBox.scrollLeft <= 0){
			SlideBox.scrollLeft = holderWidth;
		}
		SlideBox.scrollLeft -= step;
	}
	
	function moveUpStop(){
		if(direction == "right"){return};
		clearInterval(moveT);
		if(SlideBox.scrollLeft % moveWidth != 0){
			leftSpace = -(SlideBox.scrollLeft % moveWidth);
			moveSpace();
		} else {
			bLock = false;
		}
		if(auto){
			autoPlay();
		}
	}
	
	function moveDown(){
		clearInterval(moveT);
		if(bLock){return;}
		if(auto){clearInterval(autoMoveT);}
		bLock = true;
		direction = "right";
		moveDownStart();
		moveT = setInterval(moveDownStart,speed);
	}
	
	function moveDownStart(){
		if(SlideBox.scrollLeft >= holderWidth){
			SlideBox.scrollLeft = 0;
		}
		SlideBox.scrollLeft += step;
	}
	
	function moveDownStop(){
		if(direction == "left"){return;}
		clearInterval(moveT);
		if(SlideBox.scrollLeft % moveWidth != 0){
			leftSpace = moveWidth - SlideBox.scrollLeft % moveWidth;
			moveSpace();
		} else {
			bLock = false;
		}
		if(auto){
			autoPlay();
		}
	}
	
	function autoPlay(){
		clearInterval(autoMoveT);
		autoMoveT = setInterval(function(){moveDown();moveDownStop()},3000);
	}
	
	function moveSpace(){
		if(leftSpace == 0){
			bLock = false;
			return;
		}
		var num, tempStep = step;
		if(Math.abs(leftSpace) < moveWidth/2){
			tempStep = Math.round(Math.abs(leftSpace/step));
			if(tempStep < 1){tempStep = 1}
		}
		if(leftSpace < 0){
			if(leftSpace <- tempStep){
				leftSpace += tempStep;
				num = tempStep;
			} else {
				num =- leftSpace;
				leftSpace = 0;
			}
			SlideBox.scrollLeft -= num;
			setTimeout(moveSpace,speed);
		} else {
			if(leftSpace > tempStep){
				leftSpace -= tempStep;
				num = tempStep;
			} else {
				num = leftSpace;
				leftSpace = 0;
			}
			SlideBox.scrollLeft += num;
			setTimeout(moveSpace,speed);
		}
	}
	return{
		play : play,
		autoPlay : autoPlay,
		moveUp : moveUp,
		moveUpStop : moveUpStop,
		moveUpStop : moveUpStop,
		moveDown : moveDown,
		moveDownStop : moveDownStop,
		moveDownStop : moveDownStop
	}
})();
