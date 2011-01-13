(function () {

/*

 * XML文件的解析、转换成json格式

 * 

 * path: XML.js

 * author: yangxinming

 * version: 1.1.0

 * date: 2010/03/24

 */

///import baidu;

baidu.more = baidu.more || {};
baidu.more.xml = {};

/**
*
* 将指定的字符串解析为 XML 文本并返回 DOM 表示。如果浏览器不支持本地 XML 解析，则会返回空 DIV 元素的 DOM 节点。
*
* @param {String} xml文件url地址
* @return {Node} xml文档节点
*/
baidu.more.xml.parse = function(xmltext){
    var doc;
    if(window.ActiveXObject){
        doc = new ActiveXObject("Microsoft.XMLDOM");
        doc.async = "false";
        doc.loadXML(xmltext);
    }else{
        var parser = new DOMParser();
        doc = parser.parseFromString(xmltext, "text/xml");
    };
    return doc;
};

/**
*
* 返回以 DOM 表示的 XML 文档片段的文本值（即仅纯文本内容）。
*
* @param {Node} xml文档节点
* @return {XmlNode} xml文档节点文本值
*/
baidu.more.xml.value = function(xmlnode){
    var text = "";
    function getString(node) {
        if (node) {
            if (node.childNodes&&node.childNodes.length > 0) {
            for (var i = 0; i < node.childNodes.length; i++)
                getString(node.childNodes[i]);
            }
            else 
            text += node.nodeValue;
        };
    };
    getString(xmlnode);
    return text;
};

/**
*
* 将XML文档转换成json对象字符串。
*
* @param {Node} xml文档节点
* @param {tab}  缩进”\t“制表符，格式化json
* @return {XmlNode} xml文档节点文本值
*/

baidu.more.xml.xml2json=function(xml,tab){
   var X = {
      toObj: function(xml) {
         var o = {};
         if (xml.nodeType==1) { 
            if (xml.attributes.length)
               for (var i=0; i<xml.attributes.length; i++)
                  o[xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue||"").toString();
            if (xml.firstChild) {
               var textChild=0, cdataChild=0, hasElementChild=false;
               for (var n=xml.firstChild; n; n=n.nextSibling) {
                  if (n.nodeType==1) hasElementChild = true;
                  else if (n.nodeType==3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++;
                  else if (n.nodeType==4) cdataChild++; 
               }
               if (hasElementChild) {
                  if (textChild < 2 && cdataChild < 2) {
                     X.removeWhite(xml);
                     for (var n=xml.firstChild; n; n=n.nextSibling) {
                        if (n.nodeType == 3)
                           o["#text"] = X.escape(n.nodeValue);
                        else if (n.nodeType == 4) 
                           o["#cdata"] = X.escape(n.nodeValue);
                        else if (o[n.nodeName]) { 
                           if (o[n.nodeName] instanceof Array)
                              o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                           else
                              o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                        }
                        else 
                           o[n.nodeName] = X.toObj(n);
                     }
                  }
                  else { 
                     if (!xml.attributes.length)
                        o = X.escape(X.innerXml(xml));
                     else
                        o["#text"] = X.escape(X.innerXml(xml));
                  }
               }
               else if (textChild) { 
                  if (!xml.attributes.length)
                     o = X.escape(X.innerXml(xml));
                  else
                     o["#text"] = X.escape(X.innerXml(xml));
               }
               else if (cdataChild) {
                  if (cdataChild > 1)
                     o = X.escape(X.innerXml(xml));
                  else
                     for (var n=xml.firstChild; n; n=n.nextSibling)
                        o["#cdata"] = X.escape(n.nodeValue);
               }
            }
            if (!xml.attributes.length && !xml.firstChild) o = null;
         }
         else if (xml.nodeType==9) { // document.node
            o = X.toObj(xml.documentElement);
         }
         else
            alert("unhandled node type: " + xml.nodeType);
         return o;
      },
      toJson: function(o, name, ind) {
         var json = name ? ("\""+name+"\"") : "";
         if (o instanceof Array) {
            for (var i=0,n=o.length; i<n; i++)
               o[i] = X.toJson(o[i], "", ind+"\t");
            json += (name?":[":"[") + (o.length > 1 ? ("\n"+ind+"\t"+o.join(",\n"+ind+"\t")+"\n"+ind) : o.join("")) + "]";
         }
         else if (o == null)
            json += (name&&":") + "null";
         else if (typeof(o) == "object") {
            var arr = [];
            for (var m in o)
               arr[arr.length] = X.toJson(o[m], m, ind+"\t");
            json += (name?":{":"{") + (arr.length > 1 ? ("\n"+ind+"\t"+arr.join(",\n"+ind+"\t")+"\n"+ind) : arr.join("")) + "}";
         }
         else if (typeof(o) == "string")
            json += (name&&":") + "\"" + o.toString() + "\"";
         else
            json += (name&&":") + o.toString();
         return json;
      },
      innerXml: function(node) {
         var s = ""
         if ("innerHTML" in node)
            s = node.innerHTML;
         else {
            var asXml = function(n) {
               var s = "";
               if (n.nodeType == 1) {
                  s += "<" + n.nodeName;
                  for (var i=0; i<n.attributes.length;i++)
                     s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue||"").toString() + "\"";
                  if (n.firstChild) {
                     s += ">";
                     for (var c=n.firstChild; c; c=c.nextSibling)
                        s += asXml(c);
                     s += "</"+n.nodeName+">";
                  }
                  else
                     s += "/>";
               }
               else if (n.nodeType == 3)
                  s += n.nodeValue;
               else if (n.nodeType == 4)
                  s += "<![CDATA[" + n.nodeValue + "]]>";
               return s;
            };
            for (var c=node.firstChild; c; c=c.nextSibling)
               s += asXml(c);
         }
         return s;
      },
      escape: function(txt) {
         return txt.replace(/[\\]/g, "\\\\")
                   .replace(/[\"]/g, '\\"')
                   .replace(/[\n]/g, '\\n')
                   .replace(/[\r]/g, '\\r');
      },
      removeWhite: function(e) {
         e.normalize();
         for (var n = e.firstChild; n; ) {
            if (n.nodeType == 3) {  // text node
               if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) {
                  var nxt = n.nextSibling;
                  e.removeChild(n);
                  n = nxt;
               }
               else
                  n = n.nextSibling;
            }
            else if (n.nodeType == 1) {  // element node
               X.removeWhite(n);
               n = n.nextSibling;
            }
            else                      // any other node
               n = n.nextSibling;
         }
         return e;
      }
   };
   if (xml.nodeType == 9) // document node
      xml = xml.documentElement;
   var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
   return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
}

})();
