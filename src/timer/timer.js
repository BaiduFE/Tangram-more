/*
 * Timer
 * 
 * path: timer.js
 * author: qiaogang
 * version: 1.0.0
 * date: 2010/08/17
 */
// 预声明包
var baidu = baidu || { };
baidu.more = baidu.more || { };
/**
 * 计时器
 * 可以创建新的 Timer 对象，以便按指定的时间顺序运行代码。 使用 start() 方法来启动计时器。
 * 通过addEventListener添加定时处理句柄。
 * 可以开始、暂停、终止一个计时器
 */
baidu.more.Timer = (function(window){
	var EVENT_TIMER = "timer";
	var EVENT_COMPLETE = "onComplete";
	var EVENT_ONSTART = "onStart";
	var EVENT_ONPAUSE = "onPause";
	var EVENT_ONSTOP = "onStop";
	var EVENT_ONRESET = "onReset";
	/**
	 * 构造函数 
	 * @param {Number} delay 时器事件间的延迟 单位:毫秒(ms) 注意：间隔在0-15ms时可能计算不准确。
	 * @param {Number} repeatCount 设置的计时器运行总次数。如果重复计数设置为0，则计时器将持续不断运行，直至调用了 stop()/reset() 方法或程序停止。
	 */
	var timer = function(delay, repeatCount){
		this._timer = function(){};
		this._listener = function(){};
		this._timerComplete = function(){};
		this._startListener = function(){};
		this._pauseListener = function(){};
		this._stopListener = function(){};
		this._resetListener = function(){};
		this._timerID = null;
		this._delay = this._remain = delay;
		this._repeatCount = repeatCount || 0 ;
		this._currentCount = 0;
		this._isRunning = false;
		this._startTime = this._endTime = 0;
	};
	
	timer.prototype = {
		
		/**
		 * 创建一个setInterval或setTimeout的实例，用于计时
		 * @method _createTimer
		 * @param {Number} dalay 含义同构造函数
		 * @param {Number} count 含义同构造函数
		 * @private
		 */
		_createTimer : function(delay, repeatCount){
			var _this = this;
			if (repeatCount == 1) {
				return function(){
					return window.setTimeout(function(){
							_this._listener(_this._delay, repeatCount);
							_this.reset();
							_this._timerComplete();
					}, delay);
				}
			} else {
				return function(){
					return window.setInterval(function(){
						if (repeatCount !=0 && _this._currentCount >= repeatCount) {
							_this.reset();
							_this._timerComplete();
						} else {
							_this._currentCount++;
							_this._listener(delay, _this._currentCount);
						}
					}, delay);
				}
			}
		},

		/**
		 * 添加事件侦听器
		 * 监听类型: 
		 * "timer" 每当 Timer 对象达到根据 Timer.delay 属性指定的间隔时调度。
		 * "onComplete" 每当它完成 Timer.repeatCount 设置的请求数后调度。
		 * @method addEventListener
		 * @param {String} type 监听事件类型 
		 * @param {Function} listener 事件侦听器，其中 listener接收两个参数(delay, currentCount),delay为设定的时间间隔，currentCount为当前的运行次数。
		 */
		addEventListener : function(type, listener){
			switch (type) {
				case EVENT_TIMER:
					this._listener = listener;
					this._timer = this._createTimer(this._delay, this._repeatCount);
					break;
				case EVENT_COMPLETE:
					this._timerComplete = listener;
					break;
				case EVENT_ONSTART:
					this._startListener = listener;
					break;
				case EVENT_ONPAUSE:
					this._pauseListener = listener;
					break;
				case EVENT_ONSTOP:
					this._stopListener = listener;
					break;
				case EVENT_ONRESET:
					this._resetListener = listener;
					break;
			}
		},
		
		/**
		 * 如果计时器正在运行，则停止计时器，并将 _currentCount 属性设回为 0，这类似于秒表的重置按钮。
		 * @method reset
		 */
		reset : function(){
			this.stop();
			if (this._repeatCount == 1) {
				this._timer = null;
				this._timer = this._createTimer(this._delay, this._repeatCount);
			}
			this._currentCount = 0;
			this._startTime = this._endTime = 0;
			this._remain = this._dalay;
			this._resetListener();
		},
		
		/**
		 * 如果计时器尚未运行，则启动计时器。
		 * 对于暂停的计数器，可以恢复计时。
		 * @method start
		 */
		start : function(){
			if (!this._timerID) {
				this._timerID = this._timer();
				if (this._repeatCount == 1) {
					this._startTime = new Date().getTime();
				}
				this._isRunning = true;
				this._startListener();
			}
		},

		/**
		 * 停止计时器。 如果在调用 stop() 后调用 start()，则将继续运行计时器实例，运行次数为剩余的 重复次数（由 repeatCount 属性设置）。 
		 */
		stop : function(){
			if (this._timerID) {
				if (this._repeatCount == 1) {
					window.clearTimeout(this._timerID);
				} else {
					window.clearInterval(this._timerID);
				}
				this._timerID = null;
				this._isRunning = false;
				this._stopListener();
			}
		},
		
		/**
		 * 暂停计时器。
		 * 调用时暂停计时器计时，start()后，从上次暂停时的时间开始继续计时。
		 * 例如：一个20秒的计时器，在第5秒处暂停，当再次start()后，计时器将从第6秒开始，完成剩余的时间。
		 * 注意：目前只支持repeatCount = 1的情况。其他情况调用等同于stop()。
		 */
		pause : function(){
			if (this._repeatCount == 1) {
				if (this._timerID) {
					this.stop();

					this._endTime = new Date().getTime();
					this._remain = this._remain - (this._endTime - this._startTime);
					if (this._remain > 0) {
						this._timer = this._createTimer(this._remain, 1);
					} else {
						this.reset();
					}
					this._pauseListener();
				}
			} else {
				this.stop();
			}
		},
		
		/**
		 * 获得计时器从 0 开始后触发的总次数。
		 * @method getCurrentCount
		 * @return {Number} 
		 */
		getCurrentCount : function(){
			return this._currentCount;
		},
		
		/**
		 * 判断计时器是否在运行
		 * @method isRunning
		 * @return {Boolean}
		 */
		isRunning : function(){
			return this._isRunning;
		}
	};

	return timer;
})(window);
