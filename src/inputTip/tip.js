/*
 *
 {inputId:"",
 tipColor:"#838383",
 inputColor: "#000"
 }
 */
baidu.more = baidu.more ||
{};
baidu.more.inputTip = function(cfg){
    var tmp = (function(){
        var tipColor = cfg.tipColor;
        var inputColor = cfg.inputColor;
        var isSetTip = true;
        var srcValue = "";
        function blur(e){
                e = e || window.event;
            var obj = e.srcElement || e.target;
            if (baidu.string.trim(obj.value) != "") {
                        return;
            }
            else {
                        obj.value = srcValue;
                obj.style.color = tipColor;
                isSetTip = true;
            }
        }
        function focus(e){
                e = e || window.event;
            var obj = e.srcElement || e.target;
            if (isSetTip) {
                        srcValue = obj.value;
                obj.value = "";
                obj.style.color = inputColor;
                isSetTip = false;
            }
        }
        return {
            blur: blur,
            focus: focus
        }
    })();
    var tgt = baidu.g(cfg.inputId);
    baidu.event.on(tgt, "blur", tmp.blur);
    baidu.event.on(tgt, "focus", tmp.focus);
}
