// Copyright (c) 2009, Baidu Inc. All rights reserved.
// 
// Licensed under the BSD License
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//      http:// tangram.baidu.com/license.html
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
/* UI BASE: baidu/ui/createUI.js */
/* BASE: baidu/object/merge.js */

/* BASE: baidu/page/getViewWidth.js */
/* BASE: baidu/page/getViewHeight.js */
/* BASE: baidu/page/getScrollLeft.js */
/* BASE: baidu/page/getScrollTop.js */

/* BASE: baidu/event/on.js */
/* BASE: baidu/object/extend.js */


/* BASE: baidu/dom/g.js */
/* BASE: baidu/dom/setStyles.js */
/* BASE: baidu/dom/_styleFilter/px.js */
/* BASE: baidu/dom/insertHTML.js */
/* BASE: baidu/dom/remove.js */

/* BASE: baidu/string/format.js */

/*
 * popup基类，建立一个popup实例，这个类原则上不对外暴露
 * reference: http://docs.jquery.com/UI/Popup (Popup in jquery)
 */

 /**
 * popup基类，建立一个popup实例
 * @class
 * @param     {Object}             options               选项
 * @config    {DOMElement}         content               要放到popup中的元素，如果传此参数时同时传contentText，则忽略contentText。
 * @config    {String}             contentText           popup中的内容
 * @config    {String|Number}      width                 内容区域的宽度。注意，这里的内容区域指getContent()得到元素的区域，不包含title和footer。
 * @config    {String|Number}      height                内容区域的高度
 * @config    {String|Number}      top                   popup距离页面上方的距离
 * @config    {String|Number}      left                  popup距离页面左方的距离
 * @config    {String}             classPrefix           popup样式的前缀
 * @config    {Number}             zIndex                popup的zIndex值
 * @config    {Function}           onopen                popup打开时触发
 * @config    {Function}           onclose               popup关闭时触发
 * @config    {Function}           onbeforeclose         popup关闭前触发，如果此函数返回false，则组织popup关闭。
 * @config    {Function}           onupdate              popup更新内容时触发
 * @config    {Boolean}            closeOnEscape         keyboardSupport模块提供支持，当esc键按下时关闭popup
 * @config    {String}             closeText             closeButton模块提供支持，关闭按钮上的文字
 * @config    {Boolean}            modal                 modal模块支持，是否显示遮罩
 * @config    {String}             modalColor            modal模块支持，遮罩的颜色
 * @config    {Number}             modalOpacity          modal模块支持，遮罩的透明度
 * @config    {Number}             modalZIndex           modal模块支持，遮罩的zIndex值
 * @config    {Boolean}            draggable             draggable模块支持，是否支持拖拽
 * @config    {Function}           ondragstart           draggable模块支持，当拖拽开始时触发
 * @config    {Function}           ondrag                draggable模块支持，拖拽过程中触发
 * @config    {Function}           ondragend             draggable模块支持，拖拽结束时触发
 * @plugin    smartCover                                 智能遮罩
 * @remark
 * @return {baidu.ui.Popup}                                    Popup类
 */

baidu.ui.Popup = baidu.ui.createUI(function (options){
}).extend(
    /**
     *  @lends baidu.ui.Popup.prototype
     */
{
    //ui控件的类型，传入给UIBase **必须**
    uiType            : "popup",
   //ui控件的class样式前缀 可选
    //classPrefix     : "tangram-popup-",

    width           : '',
    height          : '',

    top             : 'auto',
    left            : 'auto',
    zIndex          : 1200,//没有做层管理
    //content         : null,//dom节点
    contentText     : '',

    //onopen          : function(){},
    /**
     * @private
     */
    onbeforeclose   : function(){ return true},
    //onclose         : function(){},
    //onupdate        : function(){},


    tplBody          : "<div id='#{id}' class='#{class}' style='position:relative; top:0px; left:0px;'></div>",

    /**
     * 查询当前窗口是否处于显示状态
     * @public
     * @return    {Boolean}       是否处于显示状态
     */
    isShown : function(){
        return baidu.ui.Popup.instances[this.guid] == 'show';
    },

    /**
     * @private
     */
    getString : function(){
        var me = this;
        return baidu.format(
                me.tplBody, {
                    id      : me.getId(),
                    "class" : me.getClass()
                }
            );
    },

    /**
     * render popup到DOM树
     * @private
     */
    render : function(){
        var me = this,
            main;

        //避免重复render
        if(me.getMain()){
            return ;
        }

        main = me.renderMain();
        
        main.innerHTML = me.getString();

        me._update(me);

        baidu.dom.setStyles(me.getMain(), {
            position    : "absolute",
            zIndex      : me.zIndex,
            marginLeft  : "-100000px"
        });
        
        me.dispatchEvent("onload");

        return main;
    },

    /**
     * 显示当前popup
     * @public
     * @param  {Object}             options               选项参数
     * @config {DOMElement}         content               要放到popup中的元素，如果传此参数时同时传contentText，则忽略contentText。
     * @config {String}             contentText           popup中的内容
     * @config {String|Number}      width                 内容区域的宽度。注意，这里的内容区域指getContent()得到元素的区域，不包含title和footer。
     * @config {String|Number}      height                内容区域的高度
     * @config {String|Number}      top                   popup距离页面上方的距离
     * @config {String|Number}      left                  popup距离页面左方的距离
     * @config {String}             classPrefix           popup样式的前缀
     * @config {Number}             zIndex                popup的zIndex值
     * @config {Function}           onopen                popup打开时触发
     * @config {Function}           onclose               popup关闭时触发
     * @config {Function}           onbeforeclose         popup关闭前触发，如果此函数返回false，则组织popup关闭。
     * @config {Function}           onupdate              popup更新内容时触发
     * @config {Boolean}            closeOnEscape         keyboardSupport模块提供支持，当esc键按下时关闭popup
     * @config {String}             closeText             closeButton模块提供支持，关闭按钮上的文字
     * @config {Boolean}            modal                 modal模块支持，是否显示遮罩
     * @config {String}             modalColor            modal模块支持，遮罩的颜色
     * @config {Number}             modalOpacity          modal模块支持，遮罩的透明度
     * @config {Number}             modalZIndex           modal模块支持，遮罩的zIndex值
     * @config {Boolean}            draggable             draggable模块支持，是否支持拖拽
     * @config {Function}           ondragstart           draggable模块支持，当拖拽开始时触发
     * @config {Function}           ondrag                draggable模块支持，拖拽过程中触发
     * @config {Function}           ondragend             draggable模块支持，拖拽结束时触发
     */
    open : function(options){
        var me = this;

        me._update(options);

        me.getMain().style.marginLeft = "auto";
        
        baidu.ui.Popup.instances[me.guid] = "show";

        me.dispatchEvent("onopen");
    },

    /**
     * 隐藏当前popup
     * @public
     */
    close : function(){
        var me = this;
        if(me.dispatchEvent("onbeforeclose")){
            me.getMain().style.marginLeft = "-100000px";
            baidu.ui.Popup.instances[me.guid] = "hide";
            me.dispatchEvent("onclose");
        }
    },
    
    /**
     * 更新popup状态 
     * @public
     * @param  {Object}             options               选项参数
     * @config {DOMElement}         content               要放到popup中的元素，如果传此参数时同时传contentText，则忽略contentText。
     * @config {String}             contentText           popup中的内容
     * @config {String|Number}      width                 内容区域的宽度。注意，这里的内容区域指getContent()得到元素的区域，不包含title和footer。
     * @config {String|Number}      height                内容区域的高度
     * @config {String|Number}      top                   popup距离页面上方的距离
     * @config {String|Number}      left                  popup距离页面左方的距离
     * @config {String}             classPrefix           popup样式的前缀
     * @config {Number}             zIndex                popup的zIndex值
     * @config {Function}           onopen                popup打开时触发
     * @config {Function}           onclose               popup关闭时触发
     * @config {Function}           onbeforeclose         popup关闭前触发，如果此函数返回false，则组织popup关闭。
     * @config {Function}           onupdate              popup更新内容时触发
     * @config {Boolean}            closeOnEscape         keyboardSupport模块提供支持，当esc键按下时关闭popup
     * @config {String}             closeText             closeButton模块提供支持，关闭按钮上的文字
     * @config {Boolean}            modal                 modal模块支持，是否显示遮罩
     * @config {String}             modalColor            modal模块支持，遮罩的颜色
     * @config {Number}             modalOpacity          modal模块支持，遮罩的透明度
     * @config {Number}             modalZIndex           modal模块支持，遮罩的zIndex值
     * @config {Boolean}            draggable             draggable模块支持，是否支持拖拽
     * @config {Function}           ondragstart           draggable模块支持，当拖拽开始时触发
     * @config {Function}           ondrag                draggable模块支持，拖拽过程中触发
     * @config {Function}           ondragend             draggable模块支持，拖拽结束时触发
     *
     */
    update : function(options){
        var me = this;
        me._update(options);
        me.dispatchEvent("onupdate");
    },
   
    _update: function(options){
         options = options || {};                                                                                                                          
         var me = this, contentWrapper = me.getBody();                                                                                                     
                                                                                                                                                           
         //扩展options属性                                                                                                                                 
         baidu.object.extend(me, options);                                                                                                                 
                                                                                                                                                           
         //更新内容                                                                                                                                        
         if(options.content){                                                                                                                              
             //content优先                                                                                                                                 
             if(contentWrapper.firstChild != options.content){                                                                                             
                 contentWrapper.innerHTML = "";                                                                                                            
                 contentWrapper.appendChild(options.content);                                                                                              
             }                                                                                                                                             
         }else if(options.contentText){                                                                                                                    
             //建议popup不要支持text                                                                                                                       
             contentWrapper.innerHTML = options.contentText;                                                                                               
         }                                                                                                                                                 
         me._updateSize();                                                                                                                                 
         me._updatePosition();                                                                                                                             
    },

    /**
     * 更新大小,子类可以通过同名方法覆盖;
     * 默认实现为使用参数的width和height赋值
     */
    //[Interface]
    _updateSize : function(){
        var me = this;
        baidu.dom.setStyles(me.getMain(), { width : me.width, height : me.height});
    },
    /**
     * 更新位置,子类可以通过同名方法覆盖;
     * 默认实现为使用参数的top和left赋值
     */
    //[Interface]
    _updatePosition : function(){
        var me = this;
        baidu.dom.setStyles(me.getMain(), { top : me.top, left : me.left});
    },
    /**
     * 销毁控件
     * @public
     */
    dispose : function(){
        var me = this;
        me.dispatchEvent("ondispose");
        baidu.dom.remove(me.getMain());
        baidu.lang.Class.prototype.dispose.call(me);
    }
});

baidu.ui.Popup.instances = baidu.ui.Popup.instances || [];


/**
 * Tangram UI
 * Copyright 2009 Baidu Inc. All rights reserved.
 */

/* BASE: baidu.js */
/** @namespace */
baidu.ui = baidu.ui || { version: '1.3.9' };

/**
 * 定义名字空间
 */

 /**
 * 为各个控件增加装饰器。
 * @class Behavior类
 */
baidu.ui.behavior = baidu.ui.behavior || {};

/* BASE: baidu/dom/children.js */
/* BASE: baidu/dom/insertBefore.js */
/* BASE: baidu/dom/setStyle.js */


/* BASE: baidu/dom/setBorderBoxSize.js */

(function(){
    var Coverable = baidu.ui.behavior.coverable = function() {};
    
    Coverable.Coverable_isShowing = false;
    Coverable.Coverable_iframe;
    Coverable.Coverable_container;
    Coverable.Coverable_iframeContainer;

    /**
     * 显示遮罩，当遮罩不存在时创建遮罩
     * @public
     * @return {NULL}
     */
    Coverable.Coverable_show = function(){
        var me = this;
        if(me.Coverable_iframe){
            me.Coverable_update();
            baidu.setStyle(me.Coverable_iframe, 'display', 'block'); 
            return;
        }
        
        var opt = me.coverableOptions || {},
            container = me.Coverable_container = opt.container || me.getMain(),
            opacity = opt.opacity || '0',
            color = opt.color || '',
            iframe = me.Coverable_iframe = document.createElement('iframe'),
            iframeContainer = me.Coverable_iframeContainer = document.createElement('div');

        //append iframe container
        baidu.dom.children(container).length > 0 ?
            baidu.dom.insertBefore(iframeContainer, container.firstChild):
            container.appendChild(iframeContainer);
       
        //setup iframeContainer styles
        baidu.setStyles(iframeContainer, {
            position: 'absolute',
            top: '0px',
            left: '0px'
        });
        baidu.dom.setBorderBoxSize(iframeContainer,{
            width: container.offsetWidth,
            height: container.offsetHeight
        });

        baidu.dom.setBorderBoxSize(iframe,{
            width: iframeContainer.offsetWidth
        });

        baidu.dom.setStyles(iframe,{
            zIndex  : -1,
            display  : "block",
            border: 0,
            backgroundColor: color,
            filter : 'progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=' + opacity + ')'
        });
        iframeContainer.appendChild(iframe);
        
        iframe.src = "javascript:void(0)";
        iframe.frameBorder = '0';
        iframe.scrolling = 'no';
        iframe.height = '97%';
        me.Coverable_isShowing = true;
    };

    /**
     * 隐藏遮罩
     * @public
     * @return {NULL}
     */
    Coverable.Coverable_hide = function(){
        var me = this,
            iframe = me.Coverable_iframe;
        
        if(!me.Coverable_isShowing){
            return;
        }
        
        baidu.setStyle(iframe, 'display', 'none');
        me.Coverable_isShowing = false;
    };

    /**
     * 更新遮罩
     * @public
     * @param {Object} options
     * @config {Number|String} opacity 透明度
     * @config {String} backgroundColor 背景色
     */
    Coverable.Coverable_update = function(options){
        var me = this,
            options = options || {},
            container = me.Coverable_container,
            iframeContainer = me.Coverable_iframeContainer,
            iframe = me.Coverable_iframe;
  
        baidu.dom.setBorderBoxSize(iframeContainer,{
            width: container.offsetWidth,
            height: container.offsetHeight
        });

        baidu.dom.setBorderBoxSize(iframe,baidu.extend({
            width: baidu.getStyle(iframeContainer, 'width')
        },options));
    };
})();

/* BASE: baidu/lang/Class/addEventListeners.js */

baidu.extend(baidu.ui.Popup.prototype,{
    coverable: true,
    coverableOptions: {}
});

baidu.ui.Popup.register(function(me){

    if(me.coverable){

        me.addEventListener("onopen", function(){
            me.Coverable_show();
        });
        me.addEventListener("onload", function(){
            me.Coverable_show();
        });

        me.addEventListener("onclose", function(){
            me.Coverable_hide();
        });

        me.addEventListener("onupdate",function(){
            me.Coverable_update();
        });
    }
});



/**
 * Tangram UI
 * Copyright 2009 Baidu Inc. All rights reserved.
 *
 * path: ui/behavior/statable.js
 * author: berg, lingyu
 * version: 1.0.0
 * date: 2010/09/04
 */

/* BASE: baidu/dom/addClass.js */
/* BASE: baidu/dom/removeClass.js */
/* BASE: baidu/dom/hasClass.js */
/* BASE: baidu/event/getTarget.js */

/* BASE: baidu/event/un.js */
/* BASE: baidu/array/each.js */
/* BASE: baidu/object/each.js */
/* BASE: baidu/fn/bind.js */


/**
 * 为ui控件添加状态管理行为
 */
(function() {
    var Statable = baidu.ui.behavior.statable = function() {
        var me = this;

        me.addEventListener('ondisable', function(event,options) {
            var element, group;
            options = options || {};
            elementId = (options.element || me.getMain()).id;
            group = options.group;

            if (event.type == 'ondisable' && !me.getState(elementId, group)['disabled']) {
        	    me.removeState('press', elementId, group);
        	    me.removeState('hover', elementId, group);
        	    me.setState('disabled', elementId, group);
            }else if (event.type == 'onenable' && me.getState(elementId, group)['disabled']) {
                me.removeState('disabled', elementId, group);
        	}
        });

        me.addEventListener('onenable', function(event,options) {
            var element, group;
            options = options || {};
            elementId = (options.element || me.getMain()).id;
            group = options.group;

            if (event.type == 'ondisable' && !me.getState(elementId, group)['disabled']) {
        	    me.removeState('press', elementId, group);
        	    me.removeState('hover', elementId, group);
        	    me.setState('disabled', elementId, group);
            }else if (event.type == 'onenable' && me.getState(elementId, group)['disabled']) {
                me.removeState('disabled', elementId, group);
        	}
        });
    };

    //保存实例中所有的状态，格式：group+elementId : {stateA : 1, stateB : 1}
    Statable._states = {};
    //所有可用的状态，调用者通过addState添加
    Statable._allStates = ['hover', 'press', 'disabled'];
    Statable._allEventsName = ['mouseover', 'mouseout', 'mousedown', 'mouseup'];
    Statable._eventsHandler = {
        'mouseover' : function(id, group) {
            var me = this;
            if (!me.getState(id, group)['disabled']) {
                me.setState('hover', id, group);
                return true;
            }
        },
        'mouseout' : function(id, group) {
            var me = this;
            if (!me.getState(id, group)['disabled']) {
                me.removeState('hover', id, group);
                me.removeState('press', id, group);
                return true;
            }
        },
        'mousedown' : function(id, group) {
            var me = this;
            if (!me.getState(id, group)['disabled']) {
                me.setState('press', id, group);
                return true;
            }
        },
        'mouseup' : function(id, group) {
            var me = this;
            if (!me.getState(id, group)['disabled']) {
                me.removeState('press', id, group);
                return true;
            }
        }
    };

    /**
     * 获得状态管理方法的字符串，用于插入元素的HTML字符串的属性部分
     *
     * @param {string} group optional    状态分组，同一组的相同状态会被加上相同的css.
     * @param {string} key optional 索引，在同一类中的索引.
     *
     * @return {string} 元素属性字符串.
     */
    Statable._getStateHandlerString = function(group, key) {
        var me = this,
            i = 0,
            len = me._allEventsName.length,
            ret = [],
            eventType;
        if (typeof group == 'undefined') {
            group = key = '';
        }
        for (; i < len; i++) {
            eventType = me._allEventsName[i];
            ret[i] = 'on' + eventType + '=\"' + me.getCallRef() + "._fireEvent('" + eventType + "', '" + group + "', '" + key + "', event)\"";
        }

        return ret.join(' ');
    };

    /**
     * 触发指定类型的事件
     * @param {string} eventType  事件类型.
     * @param {string} group optional    状态分组，同一组的相同状态会被加上相同的css.
     * @param {string} key 索引，在同一类中的索引.
     * @param {DOMEvent} e DOM原始事件.
     */
    Statable._fireEvent = function(eventType, group, key, e) {
        var me = this,
        	id = me.getId(group + key);
        if (me._eventsHandler[eventType].call(me, id, group)) {
            me.dispatchEvent(eventType, {
                element: id,
                group: group,
                key: key,
                DOMEvent: e
            });
        }
    };

    /**
     * 添加一个可用的状态
     * @param {string} state 要添加的状态.
     * @param {string} eventNam optional DOM事件名称.
     * @param {string} eventHandler optional DOM事件处理函数.
     */
    Statable.addState = function(state, eventName, eventHandler) {
        var me = this;
        me._allStates.push(state);
        if (eventName) {
            me._allEventsName.push(eventName);
            if (!eventHandler) {
                eventHandler = function() {return true;};
            }
            me._eventsHandler[eventName] = eventHandler;
        }
    };

    /**
     * 获得指定索引的元素的状态
     * @param {string} elementId 元素id，默认是main元素id.
     * @param {string} group optional    状态分组，同一组的相同状态会被加上相同的css.
     */
    Statable.getState = function(elementId, group) {
        var me = this,
            _states;
        group = group ? group + '-' : '';
        elementId = elementId ? elementId : me.getId();
        _states = me._states[group + elementId];
        return _states ? _states : {};
    };

    /**
     * 设置指定索的元素的状态
     * @param {string} state 枚举量 in ui._allStates.
     * @param {string} elementId optional 元素id，默认是main元素id.
     * @param {string} group optional    状态分组，同一组的相同状态会被加上相同的css.
     */
    Statable.setState = function(state, elementId, group) {
        var me = this,
            stateId,
            currentState;

        group = group ? group + '-' : '';
        elementId = elementId ? elementId : me.getId();
        stateId = group + elementId;

        me._states[stateId] = me._states[stateId] || {};
        currentState = me._states[stateId][state];
        if (!currentState) {
            me._states[stateId][state] = 1;
            baidu.addClass(elementId, me.getClass(group + state));
        }
    };

    /**
     * 移除指定索引的元素的状态
     * @param {string} state 枚举量 in ui._allStates.
     * @param {string} element optional 元素id，默认是main元素id.
     * @param {string} group optional    状态分组，同一组的相同状态会被加上相同的css.
     */
    Statable.removeState = function(state, elementId, group) {
        var me = this,
            stateId;

        group = group ? group + '-' : '';
        elementId = elementId ? elementId : me.getId();
        stateId = group + elementId;

        if (me._states[stateId]) {
            me._states[stateId][state] = 0;
            baidu.removeClass(elementId, me.getClass(group + state));
        }
    };
})();



//依赖包

/* UI BASE: baidu/ui/Base/setParent.js */
/* UI BASE: baidu/ui/Base/getParent.js */







//声明包


/**
 * button基类，创建一个button实例
 * @class button类
 * @param {Object} [options] 选项
 * @config {String}             content     按钮文本信息
 * @config {Boolean}            disabled    按钮是否有效，默认为false（有效）。
 * @config {Function}           onmouseover 鼠标悬停在按钮上时触发
 * @config {Function}           onmousedown 鼠标按下按钮时触发
 * @config {Function}           onmouseup   按钮弹起时触发
 * @config {Function}           onmouseout  鼠标移出按钮时触发
 * @config {Function}           onclick		鼠标点击按钮时触发
 * @config {Function}           onupdate	更新按钮时触发
 * @config {Function}           onload		页面加载时触发
 * @config {Function}           ondisable   当调用button的实例方法disable，使得按钮失效时触发。
 * @config {Function}           onenable    当调用button的实例方法enable，使得按钮有效时触发。
 * @returns {Button}                        Button类
 * @plugin statable             状态行为，为button组件添加事件和样式。
 * @remark  创建按钮控件时，会自动为控件加上四种状态的style class，分别为正常情况(tangram-button)、鼠标悬停在按钮上(tangram-button-hover)、鼠标按下按钮时(tangram-button-press)、按钮失效时(tangram-button-disable)，用户可自定义样式。
 */
baidu.ui.Button = baidu.ui.createUI(new Function).extend(
    /**
     *  @lends baidu.ui.Button.prototype
     */
    {
       
    //ui控件的类型，传入给UIBase **必须**
    uiType: 'button',
    //ui控件的class样式前缀 可选
    //classPrefix     : "tangram-button-",
    tplBody: '<div id="#{id}" #{statable} class="#{class}">#{content}</div>',
    disabled: false,
    statable: true,

    /**
     *  获得button的HTML字符串
     *  @private
     *  @return {String} 拼接的字符串
     */
    _getString: function() {
        var me = this;
        return baidu.format(me.tplBody, {
            id: me.getId(),
            statable: me._getStateHandlerString(),
            'class' : me.getClass(),
            content: me.content
        });
    },

    /**
     *  将button绘制到DOM树中。
     *  @public
     *  @param {HTMLElement|String} target  需要渲染到的元素
     */	
    render: function(target) {
        var me = this,
            body;
        me.addState('click', 'click');
        baidu.dom.insertHTML(me.renderMain(target), 'beforeEnd', me._getString());

        body = baidu.g(target).lastChild;
        if (me.title) {
            body.title = me.title;
        }

        me.disabled && me.setState('disabled');
        me.dispatchEvent('onload');
    },

    /**
     *  判断按钮是否处于失效状态。
     *  @public
     *  @return {Boolean} 是否失效的状态
     */
    isDisabled: function() {
        var me = this,
        	id = me.getId();
        return me.getState()['disabled'];
    },

    /**
     *  销毁实例。
     *  @public
     */
	dispose : function(){
		var me = this,
            body = me.getBody();
        me.dispatchEvent('dispose');
       //删除当前实例上的方法
        baidu.each(me._allEventsName, function(item,index) {
            body['on' + item] = null;
        });
        baidu.dom.remove(body);
		
        me.dispatchEvent('ondispose');
        baidu.lang.Class.prototype.dispose.call(me);
	},

    /**
     * 设置disabled属性
     * @pubic
     * 
	 */
    disable: function() {
        var me = this,
        body = me.getBody();
        me.dispatchEvent('ondisable', {element: body});
    },

    /**
     * 删除disabled属性
     * @pubic
     * 
	 */
    enable: function() {
        var me = this;
        body = me.getBody();
        me.dispatchEvent('onenable', {element: body});
    },

    /**
     * 触发button事件
     * @public
     * @param {String} eventName   要触发的事件名称
     * @param {Object} e           事件event
     */
    fire: function(eventType,e) {
        var me = this, eventType = eventType.toLowerCase();
        if (me.getState()['disabled']) {
            return;
        }
        me._fireEvent(eventType, null, null, e);
    },

    /**
     * 更新button的属性
	 * @public
     * @param {Object}              options     更新button的属性
	 * @config {String}             content     按钮文本信息
	 * @config {Boolean}            disabled    按钮是否有效，默认为false（有效）。
	 * @config {Function}           onmouseover 鼠标悬停在按钮上时触发
	 * @config {Function}           onmousedown 鼠标按下按钮时触发
	 * @config {Function}           onmouseup   按钮弹起时触发
	 * @config {Function}           onmouseout  鼠标移出按钮时触发
	 * @config {Function}           onclick		鼠标点击按钮时触发
	 * @config {Function}           onupdate	更新按钮时触发
	 * @config {Function}           onload		页面加载时触发
	 * @config {Function}           ondisable   当调用button的实例方法disable，使得按钮失效时触发。
	 * @config {Function}           onenable    当调用button的实例方法enable，使得按钮有效时触发。
     * 
     */
    update: function(options) {
        var me = this;
        baidu.extend(me, options);
        options.content && (me.getBody().innerHTML = options.content);

        me.dispatchEvent('onupdate');
    }
});

/* BASE: baidu/lang/isBoolean.js */
/**
 * 使按钮支持poll轮询，实现在按钮上点击并保持鼠标按着状态时连续激活事件侦听器
 * @param   {Object}    options config参数.
 * @config  {Object}    poll 当为true时表示需要使按钮是一个poll的按钮，如果是一个json的描述，可以有两个可选参数：
 *                      {interval: 100, time: 4}，interval表示轮询的时间间隔，time表示第一次执行和第二执行之间的时间间隔是time*interval毫秒 
 * @author linlingyu
 */
baidu.ui.Button.register(function(me) {
    if (!me.poll) {return;}
    baidu.lang.isBoolean(me.poll) && (me.poll = {});
    me.addEventListener('mousedown', function(evt) {
        var pollIdent = 0,
            interval = me.poll.interval || 100,
            timer = me.poll.time || 0;
        (function() {
            if (me.getState()['press']) {
                pollIdent++ > timer && me.onmousedown && me.onmousedown();
                me.poll.timeOut = setTimeout(arguments.callee, interval);
            }
        })();
    });
    me.addEventListener('dispose', function(){
        if(me.poll.timeOut){
            me.disable();
            window.clearTimeout(me.poll.timeOut);
        }
    });
});

/* BASE: baidu/date/format.js */
/* BASE: baidu/lang/guid.js */

/* BASE: baidu/array/indexOf.js */
/* BASE: baidu/array/some.js */
/* BASE: baidu/lang/isDate.js */




/* BASE: baidu/lang/isNumber.js */

baidu.i18n = baidu.i18n || {};
baidu.i18n.cultures = baidu.i18n.cultures || {};


baidu.i18n.cultures['zh-CN'] = baidu.object.extend(baidu.i18n.cultures['zh-CN'] || {}, {
    calendar: {
        dateFormat: 'yyyy-MM-dd',
        titleNames: '#{yyyy}年&nbsp;#{MM}月',
        monthNames: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'],
        dayNames: {mon: '一', tue: '二', wed: '三', thu: '四', fri: '五', sat: '六', sun: '日'}
    },
    
    timeZone: 8,
    whitespace: new RegExp("(^[\\s\\t\\xa0\\u3000]+)|([\\u3000\\xa0\\s\\t]+\x24)", "g"),
    
    number: {
        group: ",",
        groupLength: 3,
        decimal: ".",
        positive: "",
        negative: "-",

        _format: function(number, isNegative){
            return baidu.i18n.number._format(number, {
                group: this.group,
                groupLength: this.groupLength,
                decimal: this.decimal,
                symbol: isNegative ? this.negative : this.positive 
            });
        }
    },

    currency: {
        symbol: '￥'  
    },

    language: {
        ok: '确定',
        cancel: '取消',
        signin: '注册',
        signup: '登录'
    }
});

baidu.i18n.currentLocale = baidu.i18n.currentLocale || 'zh-CN';

baidu.i18n.date = baidu.i18n.date || {

    /**
     * 获取某年某个月的天数
     * @public
     * @param {Number} year 年份.
     * @param {Number} month 月份.
     * @return {Number}
     */
    getDaysInMonth: function(year, month) {
        var days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        if (month == 1 && baidu.i18n.date.isLeapYear(year)) {
            return 29;
        }
        return days[month];
    },

    /**
     * 判断传入年份是否时润年
     * @param {Number} year 年份.
     * @return {Boolean}
     */
    isLeapYear: function(year) {
        return !(year % 400) || (!(year % 4) && !!(year % 100));
    },

    /**
     * 将传入的date对象转换成指定地区的date对象
     * @public
     * @param {Date} dateObject
     * @param {String} sLocale dateObject 的地区标识，可选参数，传则以dateObject中获取的为准
     * @param {String} tLocale 地区名称简写字符.
     * @return {Date}
     */
    toLocaleDate: function(dateObject, sLocale, tLocale) {
        return this._basicDate(dateObject, sLocale, tLocale || baidu.i18n.currentLocale);
    },

    /**
     * 本地日历和格力高利公历相互转换的基础函数
     * @private
     * @param {Date} dateObject 需要转换的日期函数.
     * @param {String} sLocale dateObject 的地区标识，可选参数，否则以dateObject中获取的为准
     * @param {string} tlocale 传入date的地区名称简写字符，不传入则从date中计算得出.
     */
    _basicDate: function(dateObject, sLocale, tLocale) {
        var tTimeZone = baidu.i18n.cultures[tLocale || baidu.i18n.currentLocale].timeZone,
            tTimeOffset = tTimeZone * 60,
            sTimeZone,sTimeOffset,
            millisecond = dateObject.getTime();

        if(sLocale){
            sTimeZone = baidu.i18n.cultures[sLocale].timeZone;
            sTimeOffset = sTimeZone * 60;
        }else{
            sTimeOffset = -1 * dateObject.getTimezoneOffset();
            sTimeZone = sTimeZone / 60;
        }

        return new Date(sTimeZone != tTimeZone ? (millisecond  + (tTimeOffset - sTimeOffset) * 60000) : millisecond);
    }
};


/**
 * 创建一个简单的日历对象
 * @name baidu.ui.Calendar
 * @class
 * @param {Object} options config参数
 * @config {String} weekStart 定义周的第一天，取值:'Mon'|'Tue'|'Web'|'Thu'|'Fri'|'Sat'|'Sun'，默认值'Sun'
 * @config {Date} initDate 以某个本地日期打开日历，默认值是当前日期
 * @config {Array} highlightDates 设定需要高亮显示的某几个日期或日期区间，格式:[date, {start:date, end:date}, date, date...]
 * @config {Array} disableDates 设定不可使用的某几个日期或日期区间，格式:[date, {start:date, end:date}, date, date...]
 * @config {Object} flipContent 设置翻转月份按钮的内容，格式{prev: '', next: ''}
 * @config {string} language 日历显示的语言，默认为中文 
 * @config {function} onclickdate 当点击某个日期的某天时触发该事件
 * @author linlingyu
 */
baidu.ui.Calendar = baidu.ui.createUI(function(options){
    var me = this;
    me.flipContent = baidu.object.extend({prev: '&lt;', next: '&gt;'},
        me.flipContent);
    me.addEventListener('mouseup', function(evt){
        var ele = evt.element,
            date = me._dates[ele],
            beforeElement = baidu.dom.g(me._currElementId);
        //移除之前的样子
        beforeElement && baidu.dom.removeClass(beforeElement, me.getClass('date-current'));
        me._currElementId = ele;
        me._initDate = date;
        //添加现在的样式
        baidu.dom.addClass(baidu.dom.g(ele), me.getClass('date-current'));
        me.dispatchEvent('clickdate', {date: date});
    });
}).extend(
/**
 *  @lends baidu.ui.Calendar.prototype
 */
{
    uiType: 'calendar',
    weekStart: 'Sun',//定义周的第一天
    statable: true,
    language: 'zh-CN',
    
    tplDOM: '<div id="#{id}" class="#{class}">#{content}</div>',
    tplTable: '<table border="0" cellpadding="0" cellspacing="1" class="#{class}"><thead class="#{headClass}">#{head}</thead><tbody class="#{bodyClass}">#{body}</tbody></table>',
    tplDateCell: '<td id="#{id}" class="#{class}" #{handler}>#{content}</td>',
    tplTitle: '<div id="#{id}" class="#{class}"><div id="#{labelId}" class="#{labelClass}">#{text}</div><div id="#{prevId}" class="#{prevClass}"></div><div id="#{nextId}" class="#{nextClass}"></div></div>',
    
    /**
     * 对initDate, highlight, disableDates, weekStart等参数进行初始化为本地时间
     * @private
     */
    _initialize: function(){
        var me = this;
        function initDate(array){
            var arr = [];
            //格式:[date, {start:date, end:date}, date, date...]
            baidu.array.each(array, function(item){
                arr.push(baidu.lang.isDate(item) ? me._toLocalDate(item)
                    : {start: me._toLocalDate(item.start), end: me._toLocalDate(item.end)});
            });
            return arr;
        }
        me._highlightDates = initDate(me.highlightDates || []);
        me._disableDates = initDate(me.disableDates || []);
        me._initDate = me._toLocalDate(me.initDate || new Date());//这个就是css中的current
        me._currDate = new Date(me._initDate.getTime());//这个是用于随时跳转的决定页面显示什么日历的重要date
        me.weekStart = me.weekStart.toLowerCase();
    },
    
    /**
     * 根据参数取得单个日子的json
     * @param {Date} date 一个日期对象
     * @return 返回格式{id:'', 'class': '', handler:'', date: '', disable:''}
     * @private
     */
    _getDateJson: function(date){
        var me = this,
            guid = baidu.lang.guid(),
            curr = me._currDate,
            css = [],
            disabled;
        function compare(srcDate, compDate){//比较是否同一天
            //不能用毫秒数除以一天毫秒数来比较(2011/1/1 0:0:0 2011/1/1 23:59:59)
            //不能用compDate - srcDate和一天的毫秒数来比较(2011/1/1 12:0:0 2011/1/2/ 0:0:0)
            return srcDate.getDate() == compDate.getDate()
                && Math.abs(srcDate.getTime() - compDate.getTime()) < 24 * 60 * 60 * 1000;
        }
        function contains(array, date){
            var time = date.getTime();
            return baidu.array.some(array, function(item){
                if(baidu.lang.isDate(item)){
                    return compare(item, date);
                }else{
                    return compare(item.start, date)
                        || time > item.start.getTime()
                        && time <= item.end.getTime();
                }
            });
        }
        //设置非本月的日期的css
        date.getMonth() != curr.getMonth() && css.push(me.getClass('date-other'));
        //设置highlight的css
        contains(me._highlightDates, date) && css.push(me.getClass('date-highlight'));
        //设置初始化日期的css
        if(compare(me._initDate, date)){
            css.push(me.getClass('date-current'));
            me._currElementId = me.getId(guid);
        }
        //设置当天的css
        compare(me._toLocalDate(new Date()), date) && css.push(me.getClass('date-today'));
        //设置disabled disabled优先级最高，出现disable将清除上面所有的css运算
        disabled = contains(me._disableDates, date) && (css = []);
        return {
            id: me.getId(guid),
            'class': css.join('\x20'),//\x20－space
            handler: me._getStateHandlerString('', guid),
            date: date,
            disabled: disabled
        };
    },
    
    /**
     * 取得参数日期对象所对月份的天数
     * @param {Number} year 年份
     * @param {Number} month 月份
     * @private
     */
    _getMonthCount: function(year, month){
        var invoke = baidu.i18n.date.getDaysInMonth,
            monthArr = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
            count;
        invoke && (count = invoke(year, month));
        if(!baidu.lang.isNumber(count)){
            count = 1 == month && (year % 4)
                && (year % 100 != 0 || year % 400 == 0) ? 29 : monthArr[month];
        }
        return count;
    },
    
    /**
     * 生成日期表格的字符串用于渲染日期表
     * @private
     */
    _getDateTableString: function(){
        var me = this,
            calendar = baidu.i18n.cultures[me.language].calendar,
            dayArr = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],//day index
//            curr = me._currLocalDate,//_currentLocalDate
            curr = me._currDate,
            year = curr.getFullYear(),
            month = curr.getMonth(),
            day = new Date(year, month, 1).getDay(),//取得当前第一天用来计算第一天是星期几，这里不需要转化为本地时间
            weekIndex = 0,//记录wekStart在day数组中的索引
            headArr = [],
            bodyArr = [],
            weekArray = [],
            disabledIds = me._disabledIds = [],
            i = 0,
            j = 0,
            len = dayArr.length,
            count,
            date;
        
        //运算星期标题
        for(; i < len; i++){
            dayArr[i] == me.weekStart && (weekIndex = i);
            (weekIndex > 0 ? headArr : weekArray).push('<td>', calendar.dayNames[dayArr[i]], '</td>');
        }
        headArr = headArr.concat(weekArray);
        headArr.unshift('<tr>');
        headArr.push('</tr>');
        //运算日期
        day = (day < weekIndex ? day + 7 : day) - weekIndex;//当月月初的填补天数
        count = Math.ceil((me._getMonthCount(year, month) + day) / len);
        me._dates = {};//用来存入td对象和date的对应关系在click时通过id取出date对象
        for(i = 0; i < count; i++){
            bodyArr.push('<tr>');
            for(j = 0; j < len; j++){
                date = me._getDateJson(new Date(year, month, i * len + j + 1 - day));//这里也不需要转化为本地时间
                //把被列为disable的日期先存到me._disabledIds中是为了在渲染后调用setState来管理
                me._dates[date.id] = date.date;
                date.disabled && disabledIds.push(date['id']);
                bodyArr.push(baidu.string.format(me.tplDateCell, {
                    id: date['id'],
                    'class': date['class'],
                    handler: date['handler'],
                    content: date['date'].getDate()
                }));
            }
            bodyArr.push('</tr>');
        }
        return baidu.string.format(me.tplTable, {
            'class': me.getClass('table'),
            headClass: me.getClass('week'),
            bodyClass: me.getClass('date'),
            head: headArr.join(''),
            body: bodyArr.join('')
        });
    },
    
    /**
     * 生成日期容器的字符串
     * @private
     */
    getString: function(){
        var me = this;
        return baidu.string.format(me.tplDOM, {
            id: me.getId(),
            'class': me.getClass(),
            content: baidu.string.format(me.tplDOM, {
                id: me.getId('content'),
                'class': me.getClass('content')
            })
        });
    },
    
    /**
     * 将一个非本地化的日期转化为本地化的日期对象
     * @param {Date} date 一个非本地化的日期对象
     * @private
     */
    _toLocalDate: function(date){//很多地方都需要使用到转化，为避免总是需要写一长串i18n特地做成方法吧
        return date ? baidu.i18n.date.toLocaleDate(date, null, this.language)
            : date;
    },
    
    /**
     * 渲染日期表到容器中
     * @private
     */
    _renderDate: function(){
        var me = this;
        baidu.dom.g(me.getId('content')).innerHTML = me._getDateTableString();
        //渲染后对disabled的日期进行setState管理
        baidu.array.each(me._disabledIds, function(item){
            me.setState('disabled', item);
        });
    },
    
    /**
     * 左右翻页跳转月份的基础函数
     * @param {String} pos 方向 prev || next
     * @private
     */
    _basicFlipMonth: function(pos){
        var me = this,
            curr = me._currDate,
            month = curr.getMonth() + (pos == 'prev' ? -1 : 1),
            year = curr.getFullYear() + (month < 0 ? -1 : (month > 11 ? 1 : 0));
        month = month < 0 ? 12 : (month > 11 ? 0 : month);
        curr.setYear(year);
        me.gotoMonth(month);
        me.dispatchEvent(pos + 'month', {date: new Date(curr.getTime())});
    },
    
    /**
     * 渲染日历表的标题说明，如果对标题说明有特列要求，可以覆盖方法来实现
     */
    renderTitle: function(){
        var me = this, prev, next,
            curr = me._currDate,
            calendar = baidu.i18n.cultures[me.language].calendar,
            ele = baidu.dom.g(me.getId('label')),
            txt = baidu.string.format(calendar.titleNames, {
                yyyy: curr.getFullYear(),
                MM: calendar.monthNames[curr.getMonth()],
                dd: curr.getDate()
            });
        if(ele){
            ele.innerHTML = txt;
            return;
        }
        baidu.dom.insertHTML(me.getBody(),
            'afterBegin',
            baidu.string.format(me.tplTitle, {
                id: me.getId('title'),
                'class': me.getClass('title'),
                labelId: me.getId('label'),
                labelClass: me.getClass('label'),
                text: txt,
                prevId: me.getId('prev'),
                prevClass: me.getClass('prev'),
                nextId: me.getId('next'),
                nextClass: me.getClass('next')
            })
        );
        function getOptions(pos){
            return {
                classPrefix: me.classPrefix + '-' + pos + 'btn',
                skin: me.skin ? me.skin + '-' + pos : '',
                content: me.flipContent[pos],
                poll: {time: 4},
                element: me.getId(pos),
                autoRender: true,
                onmousedown: function(){
                    me._basicFlipMonth(pos);
                }
            };
        }
        prev = new baidu.ui.Button(getOptions('prev'));
        next = new baidu.ui.Button(getOptions('next'));
        me.addEventListener('ondispose', function(){
            prev.dispose();
            next.dispose();
        });
    },
    
    /**
     * 渲染日期组件到参数指定的容器中
     * @param {HTMLElement} target 一个用来存放组件的容器对象
     */
    render: function(target){
        var me = this,
            skin = me.skin;
        if(!target || me.getMain()){return;}
        baidu.dom.insertHTML(me.renderMain(target), 'beforeEnd', me.getString());
        me._initialize();
        me.renderTitle();
        me._renderDate();
        baidu.dom.g(me.getId('content')).style.height = 
            (me.getBody().clientHeight || me.getBody().offsetHeight)
            - baidu.dom.g(me.getId('title')).offsetHeight + 'px';
        me.dispatchEvent('onload');
    },
    
    /**
     * 更新日期的参数
     * @param {Object} options 参数，具体请参照构造中的options
     */
    update: function(options){
        var me = this;
        baidu.object.extend(me, options || {});
        me._initialize();
        me.renderTitle();
        me._renderDate();
        me.dispatchEvent('onupdate');
    },
    
    /**
     * 跳转到某一天
     * @param {Date} date 一个非本地化的日期对象
     */
    gotoDate: function(date){
        var me = this;
        me._currDate = me._toLocalDate(date);
        me._initDate = me._toLocalDate(date);
        me.renderTitle();
        me._renderDate();
        me.dispatchEvent('ongotodate');
    },
    
    /**
     * 跳转到某一年
     * @param {Number} year 年份
     */
    gotoYear: function(year){
        var me = this,
            curr = me._currDate,
            month = curr.getMonth(),
            date = curr.getDate(),
            count;
        if(1 == month){//如果是二月份
            count = me._getMonthCount(year, month);
            date > count && curr.setDate(count);
        }
        curr.setFullYear(year);
        me.renderTitle();
        me._renderDate();
        me.dispatchEvent('ongotoyear');
    },
    
    /**
     * 跳转到当前年份的某个月份
     * @param {Number} month 月份，取值(0, 11)
     */
    gotoMonth: function(month){
        var me = this,
            curr = me._currDate,
            month = Math.min(Math.max(month, 0), 11),
            date = curr.getDate(),
            count = me._getMonthCount(curr.getFullYear(), month);
        date > count && curr.setDate(count);
        curr.setMonth(month);
        me.renderTitle();
        me._renderDate();
        me.dispatchEvent('ongotomonth');
    },
    
    /**
     * 取得一个本地化的当天的日期
     * @return {Date} 返回一个本地当天的时间
     */
    getToday: function(){
        return me._toLocalDate(new Date());
    },
    
    /**
     * 返回一个当前选中的当地日期对象
     * @return {Date} 返回一个本地日期对象
     */
    getDate: function(){
        return new Date(this._initDate.getTime());
    },
    
    /**
     * 用一个本地化的日期设置当前的显示日期
     * @param {Date} date 一个当地的日期对象
     */
    setDate: function(date){
        if(baidu.lang.isDate(date)){
            var me = this;
            me._initDate = date;
            me._currDate = date;
        }
    },
    
    /**
     * 翻页到上一个月份，当在年初时会翻到上一年的最后一个月份
     */
    prevMonth: function(){
        this._basicFlipMonth('prev');
    },
    
    /**
     * 翻页到下一个月份，当在年末时会翻到下一年的第一个月份
     */
    nextMonth: function(){
        this._basicFlipMonth('next');
    },
        
    /**
     * 析构函数
     */
    dispose: function(){
        var me = this;
        me.dispatchEvent('dispose');
        baidu.dom.remove(me.getMain());
        baidu.lang.Class.prototype.dispose.call(me);
    }
});




/* BASE: baidu/dom/contains.js */



/* BASE: baidu/dom/getPosition.js */
/* BASE: baidu/browser/isStrict.js */




/**
 * 创建一个日历对象绑定于一个input输入域
 * @name baidu.ui.DatePicker
 * @class
 * @param {Object} options config参数
 * @config {Number} width 日历组件的宽度
 * @config {Number} height 日历组件的高度
 * @config {String} format 日历组件格式化日历的格式，默认：yyyy-MM-dd
 * @config {Object} popupOptions Picker组件的浮动层由Popup组件渲染，该参数用来设置Popup的属性，具体参考Popup
 * @config {Object} calendarOptions Picker组件的日历由Calendar组件渲染，该参数来用设置Calendar的属性，具体参考Calendar
 * @config {Function} onpick 当选中某个日期时的触发事件
 * @config {String} language 当前语言，默认为中文
 */
baidu.ui.DatePicker = baidu.ui.createUI(function(options){
    var me = this;
    me.format = me.format || baidu.i18n.cultures[me.language].calendar.dateFormat || 'yyyy-MM-dd';
    me.popupOptions = baidu.object.merge(me.popupOptions || {},
        options,
        {overwrite: true, whiteList: ['width', 'height']});
    me.calendarOptions = baidu.object.merge(me.calendarOptions || {},
        options,
        {overwrite: true, whiteList: ['weekStart']});
    me._popup = new baidu.ui.Popup(me.popupOptions);
    me._calendar = new baidu.ui.Calendar(me.calendarOptions);
    me._calendar.addEventListener('clickdate', function(evt){
        me.pick(evt.date);
    });
}).extend(
/**
 *  @lends baidu.ui.DatePicker.prototype
 */
{
    uiType: 'datePicker',

    language: 'zh-CN',
    
    /**
     * 取得从input到得字符按format分析得到的日期对象
     * @private
     */
    _getInputDate: function(){
        var me = this,
            patrn = [/yyyy|yy/, /M{1,2}/, /d{1,2}/],//只支持到年月日的格式化，需要时分秒的请扩展此数组
            key = [],
            val = {},
            count = patrn.length,
            i = 0,
            regExp;
        for(; i < count; i++){
            regExp = patrn[i].exec(me.format);
            key[i] = regExp ? regExp.index : null;
        }
        me.input.value.replace(/\d{1,4}/g, function(mc, index){
            val[index] = mc;
        });
        for(i = 0; i < key.length; i++){
            key[i] = val[key[i]];
            if(!key[i]){return;}
        }
        return new Date(key[0], key[1] - 1, key[2]);//需要时分秒的则扩展参数
    },
    
    /**
     * 鼠标点击的事件侦听器，主要用来隐藏日历
     * @private
     */
    _onMouseDown: function(evt){
        var me = this,
            popup = me._popup,
            target = baidu.event.getTarget(evt);
        if(target.id != me.input.id
            && !baidu.dom.contains(popup.getBody(), target)){
            me.hide();
        }
    },
    
    /**
     * 渲染日期组件到body中并绑定input
     * @param {HTMLElement} target 一个input对象，该input和组件绑定
     */
    render: function(target){
        var me = this,
            focusHandler = baidu.fn.bind('show', me),
            mouseHandler = baidu.fn.bind('_onMouseDown', me),
            keyHandler = baidu.fn.bind('hide', me),
            input = me.input = baidu.dom.g(target),
            popup = me._popup;
        if(me.getMain() || !input){
            return;
        }
        popup.render();
        me._calendar.render(popup.getBody());
        me.on(input, 'focus', focusHandler);
        me.on(input, 'keyup', keyHandler);
        me.on(document, 'click', mouseHandler);
    },
    
    /**
     * 当点击某个日期时执行pick方法来向input写入日期
     * @param {Date} date 将日期写到input中
     */
    pick: function(date){
        var me = this;
        me.input.value = baidu.date.format(date, me.format);
        me.hide();
        me.dispatchEvent('pick');
    },
    
    /**
     * 显示日历
     */
    show: function(){
        var me = this,
            pos = me.input && baidu.dom.getPosition(me.input),
            popup = me._popup,
            calendar = me._calendar,
            doc = document[baidu.browser.isStrict ? 'documentElement' : 'body'],
            inputHeight = me.input.offsetHeight,
            popupHeight = me._popup.getBody().offsetHeight;
        me._calendar.setDate(me._getInputDate() || calendar._toLocalDate(new Date()));
        me._calendar.renderTitle();
        me._calendar._renderDate();
//        me._calendar.update({initDate: me._getInputDate() || calendar._toLocalDate(new Date())});
        pos.top += (pos.top + inputHeight + popupHeight - doc.scrollTop > doc.clientHeight) ? -popupHeight
            : inputHeight;
        me._popup.open(pos);
    },
    
    /**
     * 隐藏日历
     */
    hide: function(){
        this._popup.close();
    },
    
    /*
     * 析构函数
     */
    dispose: function(){
        var me = this;
        me.dispatchEvent('dispose');
        me._calendar.dispose();
        me._popup.dispose();
        baidu.lang.Class.prototype.dispose.call(me);
    }
});


