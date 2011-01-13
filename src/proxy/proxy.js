/*
 * baidu.more.proxy
 * 
 * path: proxy.js
 * author: conzi 
 * version: 1.0.0
 * date: 2010/3/18
 */

///import baidu;




baidu.more = baidu.more||{};

/*
 * 在不影响函数运行环境的情况下，增加一个参数绑定的功能。
   用法 ： var x =baidu.proxy(function(a){alert(a)},1);
            x(); //效果等同于：alert(1),但不需要传递参数了。
   用途： 事件传递时，可以用这个来绑定参数。
          如： baidu.on(ele,"click",baidu.more.proxy(fn,a,b,c));
          当 a,b,c为动态内容时很好用。
   
*/
baidu.more.proxy= function(fn,arg){
   var args = Array.prototype.slice.call(arguments, 1);
    return function(){
        fn.apply(null, args);
    };
}
