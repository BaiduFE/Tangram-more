 
/*
 * FormVaildControl
 * path: FormVaildControl.js
 * author: 侯迦壹
 * version: 1.0
 * date: 2010/03/18
 */

      
/**
通用验证控件类
*/
function _VaildControl()
{
    this.VaildTipElemArray=[];
}

/**
public function
初始化方法默认获得焦点的Html元素
@arguments {int}	隐藏参数,获取焦点的HTML元素索引值。可以不输入,默认为按顺序添加的第一个Html验证元素获得焦点。0为起始值。
*/
_VaildControl.prototype.InitFocus = function() {
	var arr = this.VaildControlArray;
	if(arr.length!=0){ arr[arguments.length==0?0:arguments[0]].focus();};
}
 
/**
public function
进行内部验证，如果有一个不通过返回false
*/
_VaildControl.prototype.Vaild = function() {
    var arr = this.VaildControlArray;
    var flag = true;
    for (var i = 0; i < arr.length; i++) {
        var obj = document.getElementById(arr[i].id);
        if (obj) {
            obj.focus(); obj.blur();
        };
    };
	
    arr = this.VaildTipElemArray;
    for (var i = 0; i < arr.length; i++) {
        if (document.getElementById(arr[i].id).style.display == "") { flag = false; break; };
    }

    return flag;
}


/**
private function
向数组添加不重复元素
@arr    {Array}     一个数组
@object {Object}    要向数组添加的元素
*/
_VaildControl.prototype.addAryay = function(arr, object) {
    var index = -1;
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == object) {
            index = i;
        };
    };
    if (index == -1) { arr[arr.length] = object; };
}


/**
public function
添加不能为空验证
@obj     {Object}       要验证的对象
@maxlen  {int}          允许最大输入的长度
@message {string}       出错时提示的消息
---------------
ex:
if (!window.VaildControl) {
    window.VaildControl = new _VaildControl();
}
VaildControl.AddEmptyVaild(G("ID_Name"), 40, "请输入物品名称");
*/
_VaildControl.prototype.AddEmptyVaild = function(obj, maxlen, message) {
    //
    var elem = this.CreateTipElem(obj, maxlen, message);
	
    var me = this;
    this.addAryay(this.VaildControlArray, obj);
    this.addAryay(this.VaildTipElemArray, elem);
   // me.AttachEvent(obj, "onfocus", function() { });
    me.AttachEvent(obj, "onblur", function() { if (obj.value == "") {elem.innerHTML = message; elem.style.display = ""; } else {if(!me.IsIE){ elem.style.display = "none";}; }; });
} 
  
     
/**
private function
用于保存验证元素与提示元素的数组
*/
 _VaildControl.prototype.IsIE = /msie (\d+\.\d)/i.test(navigator.userAgent);
 _VaildControl.prototype.VaildTipElemArray = [];
 _VaildControl.prototype.VaildControlArray = [];   
 
 
/**
public function
添加不能为空验证(方法重载)
@obj        {Object}       要验证的对象
@maxlen     {int}          允许最大输入的长度
@message    {string}       出错时提示的消息
@validFun   {function}     当有其他验证条件时，传递的判断匿名函数
---------------
ex:
if (!window.VaildControl) {
    window.VaildControl = new _VaildControl();
}
VaildControl.AddEmptyVaildCus(G("ID_BetRate"), 4, "请输入中奖概率",function(){return G("ID_IsBet").checked;});
*/
 _VaildControl.prototype.AddEmptyVaildCus = function(obj, maxlen, message, validFun) {
     //
     var elem = this.CreateTipElem(obj, maxlen, message);
     var me = this;
     this.addAryay(this.VaildControlArray, obj);
     this.addAryay(this.VaildTipElemArray, elem);
     //me.AttachEvent(obj, "onfocus", function() { });
     me.AttachEvent(obj, "onblur", function() { if (obj.value == "" && validFun()) { elem.innerHTML = message; elem.style.display=""; } else { if(!me.IsIE){ elem.style.display = "none";}; } });
 }
 
 
/**
public function
 添加正则验证
 @obj       {Object}       要验证的对象
 @strRegex  {regx}         自定义的正则验证
 @message   {string}       出错时提示的消息
---------------
ex:
if (!window._VaildControl) {
    window._VaildControl = new VaildControl();
}
_VaildControl.AddRegxVaild(G("ID_Name"), /^.{1,40}$/, "名称过长,最长为40个字符");
*/
 _VaildControl.prototype.AddRegxVaild = function(obj, strRegex, message) {
     var elem = this.CreateTipElem(obj, 0, message);
     var me = this;
     this.addAryay(this.VaildControlArray, obj);
     this.addAryay(this.VaildTipElemArray, elem);

     // me.AttachEvent(obj, "onfocus", function() { });
     me.AttachEvent(obj, "onblur", function() { var re = new RegExp(strRegex); if (obj.value != "" && !re.test(obj.value)) { elem.innerHTML = message; elem.style.display=""; } else {if(me.IsIE){ elem.style.display = "none";}; } });
 }
 
 
/**
public function
 添加正则验证(方法重载)
 @obj       {object}        要验证的对象
 @maxlen    {int}           允许最大输入的长度
 @message   {string}        出错时提示的消息
 @validFun  {function}      当有其他验证条件时，传递的判断匿名函数
---------------
ex:
if (!window._VaildControl) {
    window._VaildControl = new VaildControl();
}
_VaildControl.AddRegxVaildCus(G("ID_BetRate"), /^[0-9]{1,4}$/, "最长4个字符长度的正整数",function(){return G("ID_IsBet").checked;});
*/
 _VaildControl.prototype.AddRegxVaildCus = function(obj, strRegex, message, validFun) {
     var elem = this.CreateTipElem(obj, 0, message);
     var me = this;
     this.addAryay(this.VaildControlArray, obj);
     this.addAryay(this.VaildTipElemArray, elem);
     //me.AttachEvent(obj, "onfocus", function() { });
     me.AttachEvent(obj, "onblur", function() { var re = new RegExp(strRegex); if (obj.value != "" && !re.test(obj.value) && validFun()) { elem.innerHTML = message; elem.style.display=""; } else { if(me.IsIE){ elem.style.display = "none";};} });
 }
 
 
/**
public function
 清除添加过的Html控件对象
 ---------------
ex:
if (!window._VaildControl) {
      window._VaildControl = new VaildControl();
}
 if(_VaildControl){ _VaildControl.Clear();}
*/
 _VaildControl.prototype.Clear = function()
 {
    var len = this.VaildTipElemArray.length;
    for(var i=0;i<len;i++)
    {
        var emement = this.VaildTipElemArray[i];
        if(emement && emement.parentNode)
        {
            emement.parentNode.removeChild(emement);
        };
        
    };
    for(var i=(len-1);i<=0;i--){ this.VaildTipElemArray[i]=null;};
}    
 
      
/**
 private function
 创建提示区
 @obj       {Object}    要验证的对象
 @maxlen    {int}       允许最大输入的长度
 @message   {string}    出错时提示的消息
*/
 _VaildControl.prototype.CreateTipElem = function(obj, maxlen,message)
 {
    var elem = document.getElementById(obj.id + "_Vaild");
    if(!elem)
    {
         elem = document.createElement("SPAN")
         elem.className = "prompt";
         elem.innerHTML = message;
         elem.id = obj.id + "_Vaild";
         elem.style.display = "none";
         obj.setAttribute("isvaild", "1");
         if(maxlen!=0)
         {
            obj.maxLength = maxlen;
         };
         obj.parentNode.appendChild(elem);
     };
     return elem;
}  
 
  
/**
private function
附加事件(内部使用)
针对IE8的疑问
在向一个元素Attach事件的时候，除IE8外的浏览器　是按附加的顺序执行，而IE8是从最后一个向前执行
*/      
 _VaildControl.prototype.AttachEvent = function(object,eventName,Function,cancelBubble)
{
    var cb = cancelBubble?true:false;
    eventName = eventName.toLowerCase();
    if(document.attachEvent){ object.attachEvent(eventName,Function);}
    else{ object.addEventListener(eventName.substr(2), Function, cb);};
}


// 预声明包
var baidu = baidu || {};
baidu.more = baidu.more || {};
baidu.more.vaildControl = new _VaildControl();   