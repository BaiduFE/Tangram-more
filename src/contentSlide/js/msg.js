/**
 * @author shenzhou
 */
function msgObserver(target){
    target._$msg = {};
    target.regMsgHandller = function(msgName, handler){
        if (this._$msg[msgName]) {
                this._$msg[msgName].push(handler);
        }
        else {
                this._$msg[msgName] = [];
            this._$msg[msgName].push(handler)
        }
    };
    /*
     * msg:json对象{name:"",target:""};其中name为必选项
     * 另外可以额外根据需求添加自定义的项
     */
    target.fireMsg = function(msg){
        if (!this._$msg[msg.name]) 
            return;
        var handler = this._$msg[msg.name];
        for (var i = 0, l = handler.length; i < l; i++) {
                handler[i](msg);
        }
    }
}
