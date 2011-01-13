(function () {

/*

 * 指定高度与宽度，实现图片等比例缩放(不失真)

 * 

 * path: scaleImage.js

 * author: yangxinming

 * version: 1.1.0

 * date: 2010/02/25

 */

///import baidu;

baidu.more = baidu.more || {};

/**
 * 根据指定参数实现图片等比例缩放(不失真)
 * 
 * @param {HTMLElement} imgD 需要被缩放的图片DOM元素
 * @param {number||null} iwidth 指定缩放后图片宽度
 * @return {number|null} iheight 指定缩放后图片高度
 */
baidu.more.scaleImage = function(imgD,iwidth,iheight){
    var image=new Image();
    image.onload=function(){
        if(this.width>0 && this.height>0){
            if(this.width/this.height>= iwidth/iheight){
                if(this.width>iwidth){  
                    imgD.width=iwidth;
                    imgD.height=(this.height*iwidth)/this.width;
                }else{
                    imgD.width=this.width;  
                    imgD.height=this.height;
                };
            }
            else{
                if(this.height>iheight){  
                    imgD.height=iheight;
                    imgD.width=(this.width*iheight)/this.height;        
                }else{
                    imgD.width=this.width;  
                    imgD.height=this.height;
                };
            };
        };
    };
    image.src=imgD.src;
};

})();
