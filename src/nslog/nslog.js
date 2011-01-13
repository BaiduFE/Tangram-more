/*
 * baidu.more.nslog
 * 
 * path: nslog.js
 * author: conzi 
 * version: 1.0.0
 * date: 2010/3/18
 */





baidu.more = baidu.more||{};

/*
    提供一个简单的方法来向nsclick服务器发统计请求
*/
baidu.more.nslog=function(url,type,other){//nslog统计
    var t=(new Date()).getTime();
    // nslog统计参数约定
    //   @pid、@url、@type三个数是必须的，并且位置固定。pid=130代表活动类统计。type为统计类型
    //   @url: 被点击链接的url ，如果是展现的统计，则为当前页的url
    //   @type 详细内容，知道见：fe.baidu.com/doc/iknow/train/nslog.html，其他产品线请自己维护，避免冲突
    //   @other: {}扩展参数，object类型

    var params= [
            "http://nsclick.baidu.com/v.gif?pid="+baidu.more.nslog.pid,
            "url="+encodeURIComponent(url),
            "type="+type,
            "t="+t
            ];
    for(var k in other){
        params.push(k+"="+other[k]);
    }
    for(var k in baidu.more.nslog.globalParams){
        params.push(k+"="+baidu.more.nslog.globalParams[k]);
    }
   
    //发送请求
    baidu.more.nslog.imageReq( params.join("&"));
}
baidu.more.nslog.pid = 130; //默认设置为知道百科的活动产品线。其他产品调用时请在最开始覆盖一次。
baidu.more.nslog.globalParams={}; //全局的统计参数
baidu.more.nslog.set = function(key,val){  //设置全局统计参数
        baidu.more.nslog.globalParams[key] = val;
}
baidu.more.nslog.imageReq = function(url){
    //图片请求函数，用于统计 
    var n="iknowlog_"+(new Date()).getTime();
    var c=window[n]=new Image();//将image对象赋给全局变量，防止被当做垃圾回收，造成请求失败。
    c.onload=c.onerror=function(){
        window[n]=null; //垃圾回收
    };
    c.src=url;
    c=null;//垃圾回收
} 
