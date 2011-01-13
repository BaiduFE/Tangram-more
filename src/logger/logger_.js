/**
 * baidu.more.logger
 * 
 * path: logger_.js
 * author: hudamin
 * version: 1.0.0
 * date: 2010/8/18
 */

/**
 * require baidu.event.on
 * require baidu.browser
 * require baidu.string.format
 * require baidu.dom.getPosition
 * require baidu.string.encodeHTML
 */

//#include "./tangram_.js"

/**
 * 声明baidu.more包
 */
baidu.more = baidu.more || {};

baidu.more.logger = (function(){


// 若DEBUG，则引入Debug脚本

/*
* Author: Michael Hu
* Date: 2009-9-23
* Version: 
*/


var Observable = (function(){
    function _addObserver(observerObj){
        if(observerObj && typeof observerObj == 'object'
            && observerObj.handleMessage 
            && 'function' == typeof observerObj.handleMessage){
            this.observers.push(observerObj);
        }
    }

    function _notify(message){
        var obs = this.observers;
        for(var i=0; i<obs.length; i++){
            if('function' == typeof obs[i].handleMessage)
                obs[i].handleMessage(message);
        }
    }

    return {
        addObserver: _addObserver,
        notify: _notify
    };
})();
/*
* Author: Michael Hu
* Date: 2010/1/14
* Version: 
*/


function extend(objSrc, objDest){
    for(var i in objSrc){
        objDest[i] = objSrc[i];
    }
}
/*
* Author: Michael Hu
* Date: 2009-9-23
* Version: 
*/


/**
 * 阻止事件冒泡
 * @param {event object} e 事件对象
 */
function stopPropagation(e){
    if(window.attachEvent){
        e.cancelBubble = true;
    }
    else if(window.addEventListener){
        e.stopPropagation();
    }
}
/*
* Author: Michael Hu
* Date: 2010/5/3
* Version: 
*/

function preventDefault(e){
    var e = e || window.event;
    /*
    if(baidu.ie) e.returnValue =false;
    else e.preventDefault();
    */

    // 修改于2010/8/22
    if(e.preventDefault){
        e.preventDefault();
    }
    else{
        e.returnValue = false;
    }
}
/*
* Author: Michael Hu
* Date: 2010/5/3
* Version: 
*/

function getMousePos(e){
    var pt = {left:0, top:0}, 
        evt = e || window.event,
        docElement = document.documentElement, 
        body = document.body || { scrollLeft: 0, scrollTop: 0 };

    pt.left = evt.pageX 
        || (evt.clientX + (docElement.scrollLeft || body.scrollLeft) - (docElement.clientLeft || 0));
    pt.top = evt.pageY 
        || (evt.clientY + (docElement.scrollTop || body.scrollTop) - (docElement.clientTop || 0));
    return pt;
}
/*
* Author: Michael Hu
* Date: 2010/4/20
* Version: 
*/

/**
 * 添加样式规则
 * @param {string} selector css选择器
 * @param {string} rule 样式规则，不包含{和}，IE下不能为空字符串
 */
function addStyle(selector, rule){
    if(document.styleSheets.length == 0){
        var oStyle = document.createElement('STYLE');
        document.getElementsByTagName('HEAD')[0].appendChild(oStyle);
    }
    var styleSheet = document.styleSheets[document.styleSheets.length - 1];
    if (styleSheet.addRule) {
        styleSheet.addRule(selector, rule);
    }
    else if (styleSheet.insertRule) {
        styleSheet.insertRule(selector + " { " + rule + " }", styleSheet.cssRules.length);
    }
}


/*
* Author: Michael Hu
* Date: 2010/5/3
* Version: 
*/

/**
 * 自定义控件接口类
 * @
 * @
 */
function IMcControl(options){
}

IMcControl.prototype.init = function(){};

IMcControl.prototype.registerEvent = function(){};

IMcControl.prototype.handleMessage = function(){};

extend(Observable, IMcControl.prototype);


/*
* Author: Michael Hu
* Date: 2010/5/3
* Version: 
*/

function McControlTitleBar(options){
    if('undefined' == typeof options){
        options = {};
    }
    this.frame = null;
    this.iconImg = null;
    this.captionDiv = null;
    this.closeBtn = null;
    this.minimizeBtn = null;
    this.normalizeBtn = null;

    // http://tc-tstest01.tc.baidu.com:8888/img/mc_win_icon.png
    this.icon = options.icon || 'http://tc-tstest01.tc.baidu.com:8888/img/mc_win_icon.png';
    this.caption = options.caption || 'MC新建窗口';
    this.parent = null;
    this.observers = [];
}

// 实现IMcControl接口
McControlTitleBar.prototype = new IMcControl();
McControlTitleBar.prototype.constructor = McControlTitleBar;

McControlTitleBar.prototype.init = function(parent){
    this.frame = document.createElement('DIV');
    this.iconImg = document.createElement('IMG');
    this.captionDiv = document.createElement('DIV');
    this.closeBtn = document.createElement('DIV');
    this.minimizeBtn = document.createElement('DIV');
    this.normalizeBtn = document.createElement('DIV');

    //this.closeBtn.innerHTML = 'X';
    //this.minimizeBtn.innerHTML = '-';
    //this.normalizeBtn.innerHTML = '+';

    this.frame.className = 'mc_win_title_frame';
    this.iconImg.className = 'mc_win_title_icon';
    this.captionDiv.className = 'mc_win_title_caption';
    this.closeBtn.className = 'mc_win_title_close_btn';
    this.minimizeBtn.className = 'mc_win_title_minimize_btn';
    this.normalizeBtn.className = 'mc_win_title_normalize_btn';

    this.frame.appendChild(this.iconImg);
    this.frame.appendChild(this.captionDiv);
    this.frame.appendChild(this.closeBtn);
    this.frame.appendChild(this.normalizeBtn);
    this.frame.appendChild(this.minimizeBtn);

    this.iconImg.setAttribute('src', this.icon);
    this.captionDiv.innerHTML = baidu.encodeHTML(this.caption);

    this.parent = parent;
    this.registerEvent();
};

McControlTitleBar.prototype.registerEvent = function(){
    var me = this;

    // 开始拖动
    // todo: 解决safari下的拖动问题，以及文本选择问题
    baidu.on(this.frame, 'mousedown', function(e){
        e = e || window.event;
        var target = me.frame,
            mousePos = getMousePos(e),
            targetPos = baidu.dom.getPosition(target), offset;

        offset = {
            left: targetPos.left - mousePos.left,
            top: targetPos.top - mousePos.top
        };

        me.notify({type:'M_DRAG_START', param:{
            offset: offset,
            target: target
        }});

        stopPropagation(e);
        preventDefault(e);
    });

    baidu.on(this.closeBtn, 'mousedown', function(e){
        me.notify({type:'M_WIN_CLOSE', param:{}});
    });

    baidu.on(this.minimizeBtn, 'mousedown', function(e){
        me.notify({type:'M_WIN_MINIMIZE', param:{}});
    });

    baidu.on(this.normalizeBtn, 'mousedown', function(e){
        me.notify({type:'M_WIN_NORMALIZE', param:{}});
    });

    baidu.on(document, 'keyup', function(e){
        e = e || window.event;
		var code = 113; //F2 key
					
		if ( e && e.keyCode == code ) {
            me.notify({type:'M_WIN_NORMALIZE', param:{}});
		}
    });

};

McControlTitleBar.prototype.handleMessage = function(){};



/*
* Author: Michael Hu
* Date: 2010/5/3
* Version: 
*/

function McControlMenuBar(options){
    if('undefined' == typeof options) options = {};
    this.frame = null;

    this.parent = null;
    this.menu = options.menu || [
        {
        caption: '退出',
        id: 'ID_EXIT',
        extra: '',
        submenu: []
        },   
        {
        caption: '关于',
        id: 'ID_ABOUT',
        extra: '',
        submenu: []
        }   
    ];
    this.menuTpl = '<a prop="#{id}" extra="#{extra}" class="mc_win_menu_btn#{className}">#{caption}</a>';
    this.observers = [];
}

// 实现IMcControl接口
McControlMenuBar.prototype = new IMcControl();
McControlMenuBar.prototype.constructor = McControlMenuBar;

McControlMenuBar.prototype.hide = function(){
    this.frame && (this.frame.style.display = 'none');
};

McControlMenuBar.prototype.show = function(){
    this.frame && (this.frame.style.display = 'block');
};

McControlMenuBar.prototype.showMenu = function(){
    var arr = [];
    for(var i=0; i<this.menu.length; i++){
        arr.push(baidu.format(this.menuTpl, {
            id: this.menu[i].id,
            className: (this.menu[i].isCur?' mc_win_menu_btn_cur':''),
            caption: this.menu[i].caption,
            extra: this.menu[i].extra
        }));
    }

    this.frame.innerHTML = arr.join('');
};

McControlMenuBar.prototype.init = function(parent){
    this.frame = document.createElement('DIV');
    //this.frame.innerHTML = 'menu';
    //this.closeBtn.innerHTML = 'X';
    //this.minimizeBtn.innerHTML = '-';
    //this.normalizeBtn.innerHTML = '+';

    this.frame.className = 'mc_win_menu_frame';

    this.showMenu();
    this.registerEvent();

    this.parent = parent;
};

McControlMenuBar.prototype.registerEvent = function(){
    var me = this;
    baidu.on(this.frame, 'mousedown', function(e){
        e = e || window.event;
        var target = e.target || e.srcElement, curBtn = null;

        if(1 == target.nodeType && 'A' == target.tagName.toUpperCase()){
            var prop = target.getAttribute('prop'), btns = me.frame.getElementsByTagName('a');
            ;
            // 关闭当前按钮
            for(var i=0; i<btns.length; i++){
                if(/mc_win_menu_btn_cur/.test(btns[i].className)){
                    btns[i].className = 'mc_win_menu_btn';
                    curBtn = btns[i];
                }
            }
            me.notify({type:'M_MENU_COMMAND', param:{cmd:prop, target:target, curBtn:curBtn}});
        }
    });
};

McControlMenuBar.prototype.handleMessage = function(){};



/*
* Author: Michael Hu
* Date: 2010/5/3
* Version: 
*/

function McControlClientArea(options){
    this.frame = null;

    this.view = null;
    this.parent = null;
    this.observers = [];

    this.text = '';

    // setContent函数相关
    this.onsetcontent = null;
    this.data = null;

    if('undefined' == typeof options){
        return;
    }
    // 用户自定义处理函数
    this.onscroll = options.onscroll || function(e){};
}

// 实现IMcControl接口
McControlClientArea.prototype = new IMcControl();
McControlClientArea.prototype.constructor = McControlClientArea;

McControlClientArea.prototype.hide = function(){
    this.frame && (this.frame.style.display = 'none');
};

McControlClientArea.prototype.show = function(){
    this.frame && (this.frame.style.display = 'block');
};

McControlClientArea.prototype.setText = function(){
    this.view.innerHTML = this.text;
};

// 设置窗口内容，展现逻辑由调用者提供
McControlClientArea.prototype.setContent = function(){
    if(!this.onsetcontent){
        ;
        return;
    }

    if('function' != typeof this.onsetcontent){
        ;
        return;
    }

    if(!this.view){
        ;
        return;
    }

    ;
    this.onsetcontent(this.view, this.data);
};

/**
 * 设置垂直滚动条的位置
 * @
 * @
 */
McControlClientArea.prototype.vScroll = function(pos){
    switch(pos){
        case 'TOP':
            // 注意这些值后面没有px
            this.view.scrollTop = 0;
            break;
        case 'BOTTOM':
            ;
            // 可以设置一个大于scrollTop最大值的值，确保各浏览器能滚动至底部
            this.view.scrollTop = this.view.scrollHeight;
            break;
    }
};


McControlClientArea.prototype.init = function(parent){
    this.frame = document.createElement('DIV');
    this.view = document.createElement('DIV');
    this.frame.appendChild(this.view);

    this.frame.className = 'mc_win_clientarea_frame';
    this.view.className = 'mc_win_clientarea_view';

    this.parent = parent;

    this.registerEvent();
};

McControlClientArea.prototype.registerEvent = function(){
    var me = this;

    baidu.on(this.view, 'scroll', function(e){
        ;
        me.onscroll();
    });
};

McControlClientArea.prototype.handleMessage = function(message){
    switch(message.type){
        case 'M_SET_TEXT':
            ;
            this.text = message.param.text;
            this.setText();
            break;
        case 'M_SET_CONTENT':
            ;
            this.onsetcontent = message.param.handler;
            this.data = message.param.data;
            this.setContent();
            break;
        case 'M_VSCROLL':
            ;
            this.vScroll(message.param.pos);
            break;
    }
};



/*
* Author: Michael Hu
* Date: 2010/5/3
* Version: 
*/

function McControlWindow(options){
    if('undefined' == typeof options){
        options = {};
    }
    this.frame = null;
    this.titleBar = null;
    this.menuBar = null;
    this.clientArea = null;

    this.dragMoveHash = null;
    this.dragEndHash = null;

    this.lastHeight = 0;
    this.observers = [];

    this.options = options;

    // 窗口状态：NORMAL, MINIMIZED, MAXIMIZED, HIDE
    this.status = '';
}

// 实现IMcControl接口
McControlWindow.prototype = new IMcControl();
McControlWindow.prototype.constructor = McControlWindow;

// 最小化窗口，只保留标题栏
McControlWindow.prototype.minimize = function(){
    if('MINIMIZED' == this.status) return;
    // 隐藏客户区和菜单栏
    this.clientArea && this.clientArea.hide();
    this.menuBar && this.menuBar.hide();
    // 记录当前窗口的位置信息
    this.lastHeight = this.frame.offsetHeight;
    this.lastTop = parseInt(this.frame.style.top);
    this.lastLeft = parseInt(this.frame.style.left);

    ;
    ;
    ;

    if(this.frame){
        this.frame.style.height = this.titleBar.frame.offsetHeight + 'px';
        this.frame.style.top = 'auto';
        this.frame.style.bottom = '0px';
        this.frame.style.left = '0px';

    }
    else{
    
    }

    this.status = 'MINIMIZED';
};

// 窗口常态化，正常大小并展现
McControlWindow.prototype.normalize = function(){
    if('NORMAL' == this.status) return;
    // 展现客户区和菜单栏
    this.clientArea && this.clientArea.show();
    this.menuBar && this.menuBar.show();

    ;
    ;
    ;
    if(this.frame){
        this.frame.style.height = this.lastHeight + 'px';
        this.frame.style.top = this.lastTop + 'px';
        this.frame.style.left = this.lastLeft + 'px';
        this.frame.style.bottom = 'auto';
    }
    else{
    
    }

    //this.status = 'NORMAL';
    this.show();
};

McControlWindow.prototype.maximize = function(){};


McControlWindow.prototype.show = function(){
    this.frame && (this.frame.style.display = 'block');
    this.status = 'NORMAL';
};

McControlWindow.prototype.hide = function(){
    this.frame && (this.frame.style.display = 'none');
    this.status = 'HIDE';
};

/**
 * 设置用户区垂直滚动条的位置
 * @param {string} pos 位置参数，取值'TOP', 'BOTTOM'
 * @
 */
McControlWindow.prototype.vScroll = function(pos){
    if('undefined' == typeof pos){
        return;
    }
    if('TOP' != pos && 'BOTTOM' != pos){
        return;
    }

    this.notify({type:'M_VSCROLL', param:{pos:pos}});
};

McControlWindow.prototype.setText = function(text){
    this.notify({type:'M_SET_TEXT', param:{text: text}});
};

/**
 * 设置窗口内容
 * @param {function} handler 展现逻辑处理函数，接受两个参数，view和data
 * @param {json} data 需要展现的数据
 */
McControlWindow.prototype.setContent = function(handler, data){
    this.notify({type:'M_SET_CONTENT', param:{handler:handler, data:data}});
};

McControlWindow.prototype.getText = function(){
    //this.notify({type:'M_SET_TEXT', param:{text: text}});
    return this.clientArea.view.innerHTML;
};



McControlWindow.prototype.addStyle = function(){
    // http://tc-tstest01.tc.baidu.com:8888/resource/img/bg_mcdebug.gif
    addStyle('div.mc_win_frame', 'position:absolute; width:200px; height:200px; overflow:hidden; background:#fff;');
    addStyle('div.mc_win_title_frame', 'position:relative; height:22px; cursor:move; border:1px solid #89A0BC; background:#ddd url(http://tc-tstest01.tc.baidu.com:8888/resource/img/bg_mcdebug.gif) repeat-x 0 -31px;');
    addStyle('img.mc_win_title_icon', 'float:left; width:18px; height:18px; margin-left:3px; margin-top:2px; border:0;');
    addStyle('div.mc_win_title_caption', 'display:inline; float:left; height:18px; margin-left:5px; font:bold 12px/22px normal; color:#000;');
    addStyle('div.mc_win_title_close_btn', 'display:inline; float:right; width:32px; height:18px; margin-right:5px; margin-top:2px; overflow:hidden; cursor:pointer; background:url(http://tc-tstest01.tc.baidu.com:8888/resource/img/bg_mcdebug.gif) no-repeat -69px 0;');
    addStyle('div.mc_win_title_minimize_btn', 'display:inline; float:right; width:32px; height:18px; margin-right:5px; margin-top:2px; overflow:hidden; cursor:pointer; background:url(http://tc-tstest01.tc.baidu.com:8888/resource/img/bg_mcdebug.gif) no-repeat 1px 0;');
    addStyle('div.mc_win_title_normalize_btn', 'display:inline; float:right; width:32px; height:18px; margin-right:5px; margin-top:2px; overflow:hidden; cursor:pointer; background:url(http://tc-tstest01.tc.baidu.com:8888/resource/img/bg_mcdebug.gif) no-repeat -33px 0;');
    addStyle('div.mc_win_menu_frame', 'height:18px; overflow:hidden; border:1px solid #89A0BC; border-width:0 1px; background:#aaa;');
    addStyle('div.mc_win_menu_frame a.mc_win_menu_btn', 'float:left; margin-left:8px; padding:0 4px; cursor:pointer; color:#000; font:normal 12px/18px normal; text-decoration:none; background:transparent;');
    addStyle('div.mc_win_menu_frame a.mc_win_menu_btn:link', 'text-decoration:none;');
    addStyle('div.mc_win_menu_frame a.mc_win_menu_btn:visited', 'text-decoration:none;');
    // todo: IE6下hover事件无效
    addStyle('div.mc_win_menu_frame a.mc_win_menu_btn:hover', 'color:#fff; text-decoration:none; background:#666;');
    addStyle('div.mc_win_menu_frame a.mc_win_menu_btn_cur', 'color:#fff; text-decoration:none; background:#666;');
    addStyle('div.mc_win_menu_frame a.mc_win_menu_btn_cur:link', 'color:#fff; text-decoration:none; background:#666;');
    addStyle('div.mc_win_menu_frame a.mc_win_menu_btn_cur:visited', 'color:#fff; text-decoration:none; background:#666;');
    addStyle('div.mc_win_menu_frame a.mc_win_menu_btn_cur:hover', 'color:#fff; text-decoration:none; background:#666;');
    addStyle('div.mc_win_clientarea_frame', 'width:auto;');
    addStyle('div.mc_win_clientarea_view', 'overflow:auto; border:1px solid #89A0BC; border-width:0 1px 1px; padding:0 5px; color:#666; font:normal 12px/18px arial,sans-serif; background-color:#fff; height:' + (this.frame.offsetHeight - 46) + 'px');
    // 占位样式
    addStyle('div.spacer_rule_1', 'width:auto;');
    addStyle('div.spacer_rule_2', 'width:auto;');
};

McControlWindow.prototype.moveTo = function(){};

McControlWindow.prototype.resize = function(){};

McControlWindow.prototype.oncommand = function(param){
    if('undefined' == typeof param){
        ;
        return;
    }
    var cmd = param.cmd, target = param.target;

    if(this.customOnCommand(param)){
        return;
    }
    // 默认处理逻辑
    switch(cmd){
        case 'ID_EXIT':
        case 'ID_ABOUT':
            ;
            break;
    }
};

McControlWindow.prototype.registerEvent = function(){
    
};

/**
 * 窗口初始化函数
 * @param {json} options optional 窗口配置项，包含以下字段
 *    left: 左坐标
 *    top: 上坐标
 *    height: 高度
 *    width: 宽度
 *    zIndex: 层值
 *    status: 初始展现状态
 */
McControlWindow.prototype.init = function(options){
    options = options || {};
    var oBody = document.getElementsByTagName('BODY')[0];

    this.customOnCommand = options.oncommand || function(param){return false;};

    this.frame = document.createElement('DIV');
    this.titleBar = new McControlTitleBar(options);
    this.menuBar = new McControlMenuBar(options);
    this.clientArea = new McControlClientArea(options);

    this.titleBar.init();
    this.menuBar.init();
    this.clientArea.init();

    oBody.appendChild(this.frame);
    this.titleBar.frame && this.frame.appendChild(this.titleBar.frame);
    this.menuBar.frame && this.frame.appendChild(this.menuBar.frame);
    this.clientArea.frame && this.frame.appendChild(this.clientArea.frame);

    this.frame.className = 'mc_win_frame';
    // 这些值后面有px
    this.frame.style.left = (options.left || 20) + 'px';
    this.frame.style.top = (options.top || 30) + 'px';
    this.frame.style.height = (options.height || 200) + 'px';
    this.frame.style.width = (options.width || 200) + 'px';
    this.frame.style.zIndex = (options.zIndex || 2000);

    this.addStyle();

    if(options.status){
        switch(options.status){
            case 'NORMAL':
                this.normalize();
                break;
            case 'MINIMIZED':
                this.minimize();
                break;
            case 'MAXIMIZED':
                this.maximize();
                break;
            case 'HIDE':
                this.hide();
                break;
            default:
                this.normalize();
                break;
        }
    }
    else{
        this.normalize();
    }

    this.addObserver(this.titleBar);
    this.addObserver(this.menuBar);
    this.addObserver(this.clientArea);

    this.titleBar.addObserver(this);
    this.menuBar.addObserver(this);
    this.clientArea.addObserver(this);
};

/**
 * 窗口拖动开始函数
 * @param {dom object} target 主要用于IE系浏览器，标题栏对象
 * todo: 解决safari下的拖动和文本选择问题
 */
McControlWindow.prototype.dragStart = function(target){
    var me = this;

    this.dragMoveHash = Math.random();
    this.dragEndHash = Math.random();

    McControlWindow[this.dragMoveHash] = function(e){
        me.dragMove.call(me, e);
    };

    McControlWindow[this.dragEndHash] = function(e){
        me.dragEnd.call(me, e);
    };

    ;

    if(!baidu.ie){
        document.addEventListener('mousemove', McControlWindow[this.dragMoveHash], false);
        document.addEventListener('mouseup', McControlWindow[this.dragEndHash], false);
    }
    else{
        target.setCapture();
        target.attachEvent('onmousemove', McControlWindow[this.dragMoveHash]);
        target.attachEvent('onmouseup', McControlWindow[this.dragEndHash]);
        target.attachEvent('onlosecapture', McControlWindow[this.dragEndHash]);
    }
};

McControlWindow.prototype.dragMove = function(e){
    e = e || window.event;

    var mousePos = getMousePos(e),
        offset = this.mouseOffset, newTop, newLeft, sz;

    function documentSize(){
        var size = {width:0, height:0};

        if(document.documentElement && document.documentElement.scrollWidth){
            size.width = document.documentElement.scrollWidth;
            size.height = document.documentElement.scrollHeight;
        }
        else if(document.body.scrollWidth){
            size.width = document.body.scrollWidth;
            size.height = document.body.scrollHeight;
        }

        return size;
    }
    sz = documentSize();

    ;
    //;
    newTop = mousePos.top + offset.top;
    newLeft = mousePos.left + offset.left;

    if(0 > newTop){
        newTop = 0;
    }

    // webkit核心的浏览器需要特殊处理，其scrollHeight同其他浏览器不一样，
    // 只包含有内容的部分的高度，没有滚动条的情况下，小于window.innerHeight
    if(baidu.isWebkit){
        sz.height = Math.max(window.innerHeight, sz.height);
    }

    if(newTop + this.frame.offsetHeight > sz.height){
        newTop = sz.height - this.frame.offsetHeight;
    }

    if(0 > newLeft){
        newLeft = 0;
    }
    if(newLeft + this.frame.offsetWidth > sz.width){
        newLeft = sz.width - this.frame.offsetWidth;
    }

    this.frame.style.top = newTop + 'px';
    this.frame.style.left = newLeft + 'px';

    stopPropagation(e);
    preventDefault(e);
};

McControlWindow.prototype.dragEnd = function(e){
    e = e || window.event;

    var me = this,
        target = this.titleBar.frame;

    if(baidu.ie){
        ;
        target.detachEvent('onlosecapture', McControlWindow[this.dragEndHash]);
        target.detachEvent('onmouseup', McControlWindow[this.dragEndHash]);
        target.detachEvent('onmousemove', McControlWindow[this.dragMoveHash]);
        target.releaseCapture();
    }
    else{
        document.removeEventListener('mousemove', McControlWindow[this.dragMoveHash], false);
        document.removeEventListener('mouseup', McControlWindow[this.dragEndHash], false);
    }

    McControlWindow[this.dragMoveHash] = null;
    McControlWindow[this.dragEndHash] = null;
    this.dragMoveHash = this.dragEndHash = null;

    stopPropagation(e);
    preventDefault(e);
};

McControlWindow.prototype.handleMessage = function(message){
    switch(message.type){
        case 'M_DRAG_START':
            ;
            this.mouseOffset = message.param.offset;
            this.dragStart(message.param.target);
            ;
            break;

        case 'M_WIN_CLOSE':
            ;
            this.hide();
            break;

        case 'M_WIN_MINIMIZE':
            ;
            this.minimize();
            break;

        case 'M_WIN_NORMALIZE':
            this.normalize();
            break;

        case 'M_MENU_COMMAND':
            ;
            this.oncommand(message.param);
            break;
    }
};



/*
* Author: Michael Hu
* Date: 2010/5/3
* Version: 
*/

//提供JS编写过程中输出调试信息
var McDebug = (function(logLevel){
    // 日志内容缓存
    var cache = [];
    // 日志行号
    var ln = 0;
    // 日志窗口
    var oWin = new McControlWindow();
    // 日志级别
    var level = logLevel;
    // 日志类型标签
    var labels = {
        '0': '[ ABOUT ]',
        '1': '[ FATAL ] ',
        '2': '[ WARNING ] ',
        '4': '[ NOTICE ] ',
        '8': '[ TRACE ] ',
        '16': '[ DEBUG ] '
    };
    // 当前日志类型按钮
    var curBtn = null;

    // 记录调试信息窗是否已经添加到DOM Tree
    var bAppend = false;
    // 记录cache数组是否flush
    var bFlushed = false;
    // 关于信息
    var sAbout = 'FE Logger V2.0';

    // 注册onload事件，确保DOM Ready之后进行append，并且设置对应状态位
    baidu.on(window, 'load', function(){
        // 仅当DOM Ready才进行append，否则可能导致浏览器终止操作，特别是IE6
        addStyle('p.mc_debug_line', 'margin-top:5px; font:normal 12px/16px arial,sans-serif;');
        addStyle('p.mc_debug_panel', 'display:inline; float:left; margin-top:5px; padding-bottom:2px; font:normal 12px/16px arial,sans-serif; border-top:1px solid #888;');
        addStyle('span.mc_debug_index', 'font-weight:bold; color:#DB0D0F;');
        addStyle('span.mc_debug_info', 'margin-left:5px; color:#666;');
        addStyle('button.mc_debug_btn', 'float:left; margin:5px 0 0 20px; width:60px; height:20px;');
        addStyle('span.mc_debug_filter', 'float:left; margin:4px 0 0 10px;');
        addStyle('span.mc_debug_filter label', 'font-size:10px;');
        // 占位样式
        addStyle('div.spacer_rule_1', 'width:auto;');
        addStyle('div.spacer_rule_2', 'width:auto;');

        // 初始化调试窗口
        oWin.init({
            width: 400, 
            height: 400, 
            zIndex: 3000, 
            status: 'MINIMIZED',
            icon: '',
            caption: 'JS日志信息',
            menu: [
                {caption:'CLEAR', id:'ID_CLEAR', extra:'', submenu:[]}, 
                {caption:'DEBUG', id:'ID_DEBUG', extra:'16', submenu:[], isCur:(16==level?true:false)}, 
                {caption:'TRACE', id:'ID_TRACE', extra:'8', submenu:[], isCur:(8==level?true:false)}, 
                {caption:'NOTICE', id:'ID_NOTICE', extra:'4', submenu:[], isCur:(4==level?true:false)}, 
                {caption:'WARNING', id:'ID_WARNING', extra:'2', submenu:[], isCur:(2==level?true:false)}, 
                {caption:'FATAL', id:'ID_FATAL', extra:'1', submenu:[], isCur:(1==level?true:false)},
                {caption: 'ABOUT', id: 'ID_ABOUT', extra: '0', submenu: []}   
            ],
            oncommand: function(param){
                var cmd = param.cmd, target = param.target, curBtn = param.curBtn;

                ;

                // todo: 首次点击的按钮如果是Clear，会将当前日志级别的样式清除。[2010-08-16]解决
                switch(cmd){
                    case 'ID_ABOUT':
                        _clear();
                        if(curBtn){
                            curBtn.className = 'mc_win_menu_btn mc_win_menu_btn_cur';
                        }
                        _log(sAbout, 0);
                        break;
                    case 'ID_CLEAR':
                        _clear();
                        if(curBtn){
                            curBtn.className = 'mc_win_menu_btn mc_win_menu_btn_cur';
                        }
                        break;
                    case 'ID_DEBUG':
                    case 'ID_TRACE':
                    case 'ID_NOTICE':
                    case 'ID_WARNING':
                    case 'ID_FATAL':
                        var logLevel = target.getAttribute('extra');
                        if(isNaN(logLevel = parseInt(logLevel))){
                            ;
                            return false;
                        }
                        level = logLevel;
                        _reRender();
                        if(curBtn){
                            curBtn.className = 'mc_win_menu_btn';
                        }
                        target.className = 'mc_win_menu_btn mc_win_menu_btn_cur';
                        break;
                }
                return true;
            }
        });
        // 缓存内容尚未展现，先展现缓存内容
        if(!bFlushed){
            _flushCache();
            bFlushed = true;
        }
        // 设置append状态位
        bAppend = true;
    });

    function _c(tag){
        return document.createElement(tag);
    }

    // 添加一条新日志
    function _append(view, item){
        var p, span_1, span_2, label;

        // 显示不大于日志级别的日志项
        if(item.level > level) return;

        p = _c('P');
        span_1 = _c('SPAN');
        span_2 = _c('SPAN');

        if(!view){
            ;
            return;
        }

        view.appendChild(p);

        p.appendChild(span_1);
        p.appendChild(span_2);

        p.className = 'mc_debug_line';
        span_1.className = 'mc_debug_index';
        span_2.className = 'mc_debug_info';

        span_1.innerHTML = labels[item.level] +  item.time
            + ' [ ' + item.index + ' ]:';
        span_2.innerHTML = baidu.encodeHTML(item.data);

        oWin.vScroll('BOTTOM');
    }

    // 重新渲染日志内容
    function _reRender(){
        // 先清空调试窗口内容
        oWin.setText('');

        // 重新展现cache内容
        for(var i=0; i<cache.length; i++){
            oWin.setContent(_append, cache[i]);
        }
    }

    // 展现cache的内容
    function _flushCache(){
        for(var i=0; i<cache.length; i++){
            oWin.setContent(_append, cache[i]);
        }
    }

    // 清空调试窗口和cache
    function _clear(){
        oWin.setText('');

        cache = [];
    }

    // 显示调试信息，仅当append后才进行日志显示
    function _log(str, logLevel){
        var now = new Date(), time = '';

        time = now.getHours() + ':' + now.getMinutes() + ':'
            + now.getSeconds() + ':' + now.getMilliseconds();

        // DOM Ready，那么直接显示之
        if(bAppend){
            // 缓存内容尚未展现，先展现缓存内容
            if(!bFlushed){
                _flushCache();
                bFlushed = true;
            }
            oWin.setContent(_append, {
                time: time,
                level: logLevel,
                index: ln + 1,
                data: str
            });
        } 

        cache.push({
            time: time,
            level: logLevel,
            index: ++ln,
            data: str
        });
    }

    function _setLevel(logLevel){
        level = logLevel;
    }

    return {
        // 输出调试信息，后向兼容接口
        log: function(str){
            _log(str, 16);
        },
        // 致命错误
        f: function(str){
            _log(str, 1);
        },
        // 警告
        w: function(str){
            _log(str, 2);
        },
        // 引起注意
        n: function(str){
            _log(str, 4);
        },
        // 跟踪日志
        t: function(str){
            _log(str, 8);
        },
        // 调试日志
        d: function(str){
            _log(str, 16);
        },
        setLevel: _setLevel
    };
})(16);


/*
var oWin = new McControlWindow();
oWin.init({left:200, top:60, height:200});

var oWin_1 = new McControlWindow();
oWin_1.init({left:60, top:200, height:300});
*/

return McDebug;

})();


