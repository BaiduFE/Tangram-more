function ContentSlide(cfg){
    var me = this;
    msgObserver(this);
    /*
     * 注册对象属性的方法
     */
    var msgCfg = ContentSlide.msgCfg;
    for (var msg in msgCfg) {
        for (var i = 0; i < msgCfg[msg].length; i++) {
                me.regMsgHandller(msg, msgCfg[msg][i]);
        }
    }
    /*
     *对象的数据结构
     */
    this.cfg = cfg;
    this.firstNum = 0;
    this.isBrsing = false;//是否正在浏览
    this.isSerBrs = false;//是否连续浏览
    this.stopBrs = false;
    /*
     * 对象的事件处理方法
     */
    this.beforeBrowsePre = function(){
        var msg = {
            name: "beforeBrowsePre",
            target: me
        }
        me.fireMsg(msg);
    };
    this.browsePre = function(){
        var msg = {
            name: "browsePre",
            target: me
        }
        me.fireMsg(msg);
    };
    this.afterBrowsePre = function(){
        var msg = {
            name: "afterBrowsePre",
            target: me
        }
        me.fireMsg(msg);
    };
    this.beforeBrowseNext = function(){
        var msg = {
            name: "beforeBrowseNext",
            target: me
        }
        me.fireMsg(msg);
    };
    this.browseNext = function(){
        var msg = {
            name: "browseNext",
            target: me
        }
        me.fireMsg(msg);
    };
    this.afterBrowseNext = function(){
        var msg = {
            name: "afterBrowseNext",
            target: me
        }
        me.fireMsg(msg);
    };
    
    this.init = function(){
        var msg = {
            name: "init",
            target: me
        }
        me.fireMsg(msg);
    };
}

/**
 * 内容滑动的配置文件
 ContentSlideCfg = {
 sldCt: "slideInner",
 displayNum: 4,
 stepNum: 4
 }
 */
/*
 * initCfg:{
 renderTpl:'<div class="elm">#{num}</div>'
 }
 初始化消息处理
 ContentSlideCfg.initCfg = {
 tpl: '<div class="elm">#{num}</div>',
 baseTop: "-480px"
 };
 */
function init(msg){
    var obj = msg.target;
    var cfg = obj.cfg;
    var res = "";
    for (var i = 0; i < cfg.displayNum * 3; i++) {
        res += baidu.format(cfg.initCfg.tpl, {
            num: i
        });
    }
    var contentObj = G(obj.cfg.sldCt);
    contentObj.innerHTML = res;
    var ctChildren = baidu.dom.children(contentObj);
    for (var i = 0; i < cfg.displayNum; i++) {
        ctChildren[cfg.displayNum + i].innerHTML = baidu.format(cfg.viewCfg.tpl, cfg.modelCfg.data[i]);
    }
}

/*
 * modelCfg
 ContentSlideCfg.modelCfg = {
 perDistance: 115,
 perTime: 40,
 perSize: 15,
 position: 480,
 dataNum:20
 }
 */
var slideModel = {
    next: function(msg){
        var tgt = msg.target;
        tgt.beforeBrowseNext();
        if (tgt.stopBrs) {
                return
        }
        tgt.isBrsing = true;
        var cfg = tgt.cfg;
        var ctObj = G(cfg.sldCt);
        var nextNum;
        if (tgt.firstNum + cfg.displayNum + cfg.stepNum < cfg.modelCfg.dataNum) {
                nextNum = cfg.stepNum;
        }
        else {
                nextNum = cfg.modelCfg.dataNum - (tgt.firstNum + cfg.displayNum);
        }
        var mvSize = cfg.modelCfg.perDistance * nextNum;
        var perSize = cfg.modelCfg.perSize;
        var position = cfg.modelCfg.position;
        var nowSize = 0;
        nowSize += perSize;
        ctObj.style.left = "-" + (nowSize + position) + "px";
        var tpInt = window.setInterval(function(){
                if (mvSize - nowSize > perSize) {
                        nowSize += perSize;
                
                ctObj.style.left = "-" + (nowSize + position) + "px";
            }
            else {
                        ctObj.style.left = "-" + (mvSize + position) + "px";
                var ctChildren = baidu.dom.children(ctObj);
                for (var i = 0; i < nextNum; i++) {
                                var ctChildren = baidu.dom.children(ctObj);
                    var tmpNode = ctChildren[0];
                    ctObj.removeChild(tmpNode);
                    ctObj.appendChild(tmpNode);
                }
                ctObj.style.left = "-" + position + "px";
                clearInterval(tpInt);
                tgt.isBrsing = false;
                tgt.firstNum += nextNum;
                tgt.afterBrowseNext();
                if (tgt.isSerBrs) {
                                tgt.browseNext();
                }
                
            }
        }, cfg.modelCfg.perTime)
    },
    pre: function(msg){
        var tgt = msg.target;
        tgt.beforeBrowsePre();
        if (tgt.stopBrs) {
                return
        }
        tgt.isBrsing = true;
        var cfg = tgt.cfg;
        var preNum;
        if (tgt.firstNum - cfg.stepNum > 0) {
                preNum = cfg.stepNum;
        }
        else {
                preNum = tgt.firstNum;
        }
        var ctObj = G(cfg.sldCt);
        var mvSize = cfg.modelCfg.perDistance * preNum;
        var perSize = cfg.modelCfg.perSize;
        var position = cfg.modelCfg.position;
        var nowSize = 0;
        ctObj.style.left = "-" + (position - nowSize) + "px";
        var tpInt = window.setInterval(function(){
                if (mvSize - nowSize > perSize) {
                        nowSize += perSize;
                ctObj.style.left = "-" + (position - nowSize) + "px";
            }
            else {
                        ctObj.style.left = "0px";
                var ctChildren = baidu.dom.children(ctObj);
                for (var i = 0; i < preNum; i++) {
                                var ctChildren = baidu.dom.children(ctObj);
                    var tmpNode = ctChildren[ctChildren.length - 1];
                    var firstNode = ctChildren[0];
                    ctObj.removeChild(tmpNode);
                    ctObj.insertBefore(tmpNode, firstNode);
                }
                ctObj.style.left = "-" + position + "px";
                clearInterval(tpInt);
                tgt.isBrsing = false;
                tgt.firstNum -= preNum;
                tgt.afterBrowsePre();
                if (tgt.isSerBrs) {
                                tgt.browsePre();
                }
            }
        }, cfg.modelCfg.perTime)
    },
    preLogic: function(msg){
        var tgt = msg.target;
        var cfg = tgt.cfg;
        if (tgt.firstNum <= 0 || tgt.isBrsing == true) {
                tgt.stopBrs = true;
        }
        else {
                tgt.stopBrs = false;
        }
    },
    nextLogic: function(msg){
        var tgt = msg.target;
        var cfg = tgt.cfg;
        if (tgt.firstNum + cfg.displayNum < cfg.modelCfg.dataNum && tgt.isBrsing == false) {
                tgt.stopBrs = false;
        }
        else {
                tgt.stopBrs = true;
        }
    }
}

/*
 * 滑动展现模块逻辑
 
 viewCfg = {
 tpl: '<a href="#{link}"><img style="width:100px;height:200px;" src="#{img}"></a>'
 }
 */
var slideView = {
    preRender: function(msg){
        var tgt = msg.target;
        var cfg = tgt.cfg;
        var data = cfg.modelCfg.data;
        var lfNum = cfg.stepNum;
        var contentObj = G(cfg.sldCt);
        var ctChildren = baidu.dom.children(contentObj);
        var preNum;
        if (tgt.firstNum <= 0) {
                return;
        }
        if (tgt.firstNum - cfg.stepNum > 0) {
                preNum = cfg.stepNum;
        }
        else {
                preNum = tgt.firstNum;
        }
        for (var i = 0, j = cfg.displayNum - 1; i < preNum; i++, j--) {
                ctChildren[j].innerHTML = baidu.format(cfg.viewCfg.tpl, cfg.modelCfg.data[tgt.firstNum - i - 1]);
        }
    },
    nextRender: function(msg){
        var tgt = msg.target;
        var cfg = tgt.cfg;
        var data = cfg.modelCfg.data;
        var lfNum = cfg.stepNum;
        var contentObj = G(cfg.sldCt);
        var ctChildren = baidu.dom.children(contentObj);
        var nextNum;
        if (tgt.firstNum + cfg.displayNum >= cfg.modelCfg.dataNum) {
                return;
        }
        if (tgt.firstNum + cfg.displayNum + cfg.stepNum < cfg.modelCfg.dataNum) {
                nextNum = cfg.stepNum;
        }
        else {
                nextNum = cfg.modelCfg.dataNum - (tgt.firstNum + cfg.displayNum);
        }
        for (var i = 0, j = cfg.displayNum * 2; i < nextNum; i++, j++) {
                ctChildren[j].innerHTML = baidu.format(cfg.viewCfg.tpl, cfg.modelCfg.data[tgt.firstNum + cfg.displayNum + i]);
        }
    }
};


ContentSlide.msgCfg = {
    "beforeBrowseNext": [slideModel.nextLogic, slideView.nextRender],
    "browseNext": [slideModel.next],
    "afterBrowseNext": [],
    "beforeBrowsePre": [slideModel.preLogic, slideView.preRender],
    "browsePre": [slideModel.pre],
    "afterBrowsePre": [],
    "init": [init]
};
/*
 * 配置文件
 */
ContentSlideCfg = {
    sldCt: "slideInner",//滑动栏外面的id
    displayNum: 4,//显示单元的数量
    stepNum: 3//每次滑动的个数
}

ContentSlideCfg.initCfg = {
    tpl: '<div class="elm">#{num}</div>' //初始化时的单元模板
};

ContentSlideCfg.modelCfg = {
    perDistance: 115,
    perTime: 40,
    perSize: 15,
    position: 480,
    dataNum: 15,
    data: [{
        img: "http://list.video.baidu.com/mvzt/11.jpg",
        link: "http://list.video.baidu.com/mvzt/11.jpg",
        num: 0
    }, {
        img: "http://list.video.baidu.com/mvzt/12.jpg",
        link: "http://list.video.baidu.com/mvzt/11.jpg",
        num: 1
    }, {
        img: "http://list.video.baidu.com/mvzt/13.jpg",
        link: "http://list.video.baidu.com/mvzt/11.jpg",
        num: 2
    }, {
        img: "http://list.video.baidu.com/mvzt/14.jpg",
        link: "http://list.video.baidu.com/mvzt/11.jpg",
        num: 3
    }, {
        img: "http://list.video.baidu.com/mvzt/15.jpg",
        link: "http://list.video.baidu.com/mvzt/11.jpg",
        num: 4
    }, {
        img: "http://list.video.baidu.com/mvzt/16.jpg",
        link: "http://list.video.baidu.com/mvzt/11.jpg",
        num: 5
    }, {
        img: "http://list.video.baidu.com/mvzt/17.jpg",
        link: "http://list.video.baidu.com/mvzt/11.jpg",
        num: 6
    }, {
        img: "http://list.video.baidu.com/mvzt/18.jpg",
        link: "http://list.video.baidu.com/mvzt/11.jpg",
        num: 7
    }, {
        img: "http://list.video.baidu.com/mvzt/19.jpg",
        link: "http://list.video.baidu.com/mvzt/11.jpg",
        num: 8
    }, {
        img: "http://list.video.baidu.com/mvzt/20.jpg",
        link: "http://list.video.baidu.com/mvzt/11.jpg",
        num: 9
    }, {
        img: "http://list.video.baidu.com/mvzt/21.jpg",
        link: "http://list.video.baidu.com/mvzt/11.jpg",
        num: 10
    }, {
        img: "http://list.video.baidu.com/mvzt/22.jpg",
        link: "http://list.video.baidu.com/mvzt/11.jpg",
        num: 11
    }, {
        img: "http://list.video.baidu.com/mvzt/23.jpg",
        link: "http://list.video.baidu.com/mvzt/11.jpg",
        num: 12
    }, {
        img: "http://list.video.baidu.com/mvzt/24.jpg",
        link: "http://list.video.baidu.com/mvzt/11.jpg",
        num: 13
    }, {
        img: "http://list.video.baidu.com/mvzt/25.jpg",
        link: "http://list.video.baidu.com/mvzt/11.jpg",
        num: 14
    }]
}

ContentSlideCfg.viewCfg = {
    tpl: '<a href="#{link}" target="_blank"><img style="width:64px;height:48px;"  src="#{img}"><br>#{num}</a>'
}

