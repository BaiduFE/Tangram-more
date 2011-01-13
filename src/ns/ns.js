/**
 *  创建名称空间
 *  使用：
 *      baidu.more.ns("bk.lemma");
 *      //会自动做判断，如果bk.lemma不存在，就自己创建一个bk.lemma={};
 *
 */
baidu.more = baidu.more||{};
baidu.more.ns= function(namespace){ 
    var names = namespace.split(".");
    var owner = window;

    for(var i =0,len=names.length;i<len;i++){
        var  packageName = names[i];
        owner[packageName] = (owner[packageName]||{});    
        owner = owner[packageName];
    }
};
