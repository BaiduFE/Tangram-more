/*
 * baidu.more.pagenav
 * 
 * path: pagenav.js
 * author: conzi 
 * version: 0.1.0
 * date: 2010/3/18
 */

///import baidu;

baidu.more = baidu.more||{};


/*
    @return html代码
    @params curPage <number> 当前页码。1 - n
    @params allPage <number> 总页数 1 - n
    @params pageFun <string> 回调函数名 
    @params conf <object> 配置项，可以修改的内容见：baidu.more.pagenav.C;
*/

baidu.more.pagenav = function(curPage,allPage,pageFun,conf){
    if(allPage<=1)return "";
    baidu.more.pagenav.visit(curPage);
    if(conf){baidu.more.pagenav.conf(conf);}
        var str = "";
        var lastPage = curPage-1;
        var nextPage = curPage+1;
        var from =1;
        var C = baidu.more.pagenav.C;
        function getStyle(pn){
            return  "style=\'color:"+(baidu.more.pagenav.pagesFlag[pn]?C.colorLink:C.colorVisited) +"\'"; 
        }
        function buildLink(pn,text){
        return  [" <a href='#' onclick='",pageFun,"(",pn,");return false;' ",getStyle(pn),">"
                        ,C.textLeft,text,C.textRight
                ,"</a> "].join("");
        }

        if(curPage - C.left > 1)
            from = curPage- C.left;
        if(from + C.total > allPage)
            from = allPage - C.total;
        if(from < 1)from = 1;

        var to = from + C.total;

        if(curPage - C.left > 1){
            str += buildLink(1,C.textFirest);
        }
        if(curPage > 1){
            str += buildLink(lastPage,C.textPre);
        }
        var nowLoop=from;
        for(; nowLoop<=to;nowLoop++){
            if(nowLoop>allPage)
                break;
            if(nowLoop != curPage){
                str += buildLink(nowLoop,nowLoop);
            } else{
                str += " "+nowLoop+" ";
            }
        }


        if(curPage < allPage){
           str += buildLink(nextPage,C.textNext);
        }
        if(nowLoop < allPage){
           str += buildLink(allPage,C.textLast);
        }
        return str;
}
baidu.more.pagenav.pagesFlag =  new Array(32);//记录已访问过的页面，模拟点击过的效果
baidu.more.pagenav.C = {  //默认的配置
        left:4
         ,total:9        //要显示的总页数，1..9
         ,textLeft:"["
         ,textRight:"]"
         ,textPre:"上一页"
         ,textNext:"下一页"
         ,textFirest:"首页"
         ,textLast:"尾页"
         ,colorLink:"#800080"
         ,colorVisited:"#261CDC"
}; //end C


baidu.more.pagenav.visit = function(pn){ //第n页链接被点击
    baidu.more.pagenav.pagesFlag[pn] =1;
}

baidu.more.pagenav.config = function(obj){ //传递配置，覆盖默认的,为json对象
    for(var key in obj){
        baidu.more.pagenav.C[key] = obj[key];
    }
}

