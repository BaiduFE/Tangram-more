/*

 * your module name

 * 

 * path: localStorage.js

 * author: heliang  yangdong

 * version: 1.1.0

 * date: 2010/12/21

 */

///import baidu;

baidu.more = baidu.more || {};



baidu.more.LocalStorage = function(op){
	this._contentID = op.contentID;
	this._flashURL = op.flashURL;
	this._flashID = op.flashID;
    this._timeout = op.timeout;
	this._callback = op.callback;
}
baidu.more.LocalStorage.prototype={

    /**
     * 加载flash 
     * @author liang
     */ 
	render : function () {
		var that = this;
        var vars = {};
        if(that._timeout){
            vars.timeout = that._timeout;
        }
        if(that._callback){
            vars.callback = that._callback;
        }
        if(baidu.G(that._contentID)){
            return
        }
        baidu.insertHTML(document.body, "beforeEnd", '<div id='+that._contentID+' style="height:0;overflow:hidden;"></div>'); 
		baidu.swf.create({
			'id'       		: that._flashID,
			'width'    		: "215",
			'height'   		: "138",
			'ver'      		: "9.0.28",
			'errorMessage'	: "Please download the newest flash player.",
			'url'      		: that._flashURL,
			'bgColor'		: "#FFFFFF",
			'wmode'			: "window",
			'vars'			: vars
		},that._contentID);
	},

    /**
     * 取flash id 暂时没有用
     * @author liang
     */ 
	getFlashID : function(){
		return this._flashID;
	},

    /**
     * 存数据
     * @param {string} obj : flash对象的名称
     * @param {string} key : 对象的 key
     * @param {string,object,num,array} value : 对象的 value 可以是任意类型
     * @author liang
     */ 
	setValue : function(obj,key,value){	 //存数据
		var that  = this;
		baidu.swf.getMovie(that._flashID).write(obj, key,value);
	},

    /**
     * 取value
     * @param {string} obj : flash对象的名称
     * @param {string} key : 对象的 key
     * @author liang
     */ 
	getValue : function(obj,key){	//获取数据
		var that  = this;
		return(baidu.swf.getMovie(that._flashID).read(obj, key));
	},

	/**
	 * 获取key列表
	 * @param {type} obj : flash对象的名称
	 * @returns {array} : 所有key的数组 
	 * @author liang
	 */ 
	getKeyList : function(obj){	 
		var that  = this;
		return (baidu.swf.getMovie(that._flashID).getKeyList(obj));
	},


	/**
	 * 清除obj下面的所有数据
	 * @param {string} obj : flash对象的名称
	 * @author liang
	 */ 
	clear:function(obj){
		 var that  = this;
		baidu.swf.getMovie(that._flashID).clear(obj);
	},


    /**
	 * 清除obj下面的某一个key
	 * @param {string} obj : flash对象的名称
	 * @param {string} key : 对象的 key
	 * @author liang
	 */ 
    removeItem:function(obj,key){
		var that = this;
		baidu.swf.getMovie(that._flashID).remove(obj,key);
	}
}