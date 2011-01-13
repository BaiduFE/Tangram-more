/*
 * baidu.more.validator
 *
 * path: validator.js
 * author: wenyuxiang
 * version: 1.0.0
 * date: 2010/8/16
 */

baidu = {};
baidu.more = {};
baidu.more.validator = (function (){

    // utility
    function make_test_regexp(s){
        return new RegExp('^(?:' + s + ')$', '');
    }
    function $1(){ return RegExp.$1; }
    function True(){ return true; }

    // ip address
    var _IP_PART = '(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])';
    var IP_ADDRESS = _IP_PART + '(?:[.]' + _IP_PART + '){3}';

    var RE_IP_ADDRESS = make_test_regexp(IP_ADDRESS);
    // note: 是否应该提供ip段的验证
    /**
     * 验证目标字符串是否格式为ip
     * @param s {String}
     * @returns {boolean}
     */
    function test_ip_address(s){
        return s && RE_IP_ADDRESS.test(s);
    }

    // domain name
    var _DOMAIN_PART = '[A-Za-z0-9](?:[-A-Za-z0-9]{0,61}[A-Za-z0-9])?';
    var _TLD = '[A-Za-z](?:[-A-Za-z0-9]{0,61}[A-Za-z0-9])?';
    var DOMAIN_NAME = '(?:' + _DOMAIN_PART + '[.]){0,126}' + _TLD + '[.]?'; 

    var RE_DOMAIN = make_test_regexp(DOMAIN_NAME);

    /**
     * 验证目标字符串格式是否为域名
     * @param s {String}
     * @returns {boolean}
     */
    function test_domain_name(s){
        return s && s.length < 254 && RE_DOMAIN.test(s);
    }

    // host name
    var HOST_NAME = '(?:' + DOMAIN_NAME + '|' + IP_ADDRESS + ')';
/*
see: http://en.wikipedia.org/wiki/Email_address
 The local-part of the e-mail address may use any of these ASCII characters:

    * Uppercase and lowercase English letters (a–z, A–Z)
    * Digits 0 to 9
    * Characters ! # $ % & ' * + - / = ? ^ _ ` { | } ~
    * Character . (dot, period, full stop) provided that it is not the first or last character,
       and provided also that it does not appear two or more times consecutively (e.g. John..Doe@example.com).

 Hotmail, for example, incorrectly refuses to send mail to any address containing
  any of the following legitimate characters: ! # $ % * / ? ^ ` { | } ~
note:
 this point Hotmail accept + - _ ' = (not verified)
 */
    // email address
    var _LOCAL_PART = '(?:(?:[A-Za-z0-9_\'=+-]+(?:[.][A-Za-z0-9_\'=+-]+)?)|(?:".+?"))';
    var EMAIL_ADDRESS = _LOCAL_PART + '@(?:(' + DOMAIN_NAME + ')|' + '\\['+ IP_ADDRESS +'\\])'; // domain_name

    var RE_EMAIL_ADDRESS = make_test_regexp(EMAIL_ADDRESS);

    /**
     * 验证目标字符串格式是否为邮箱地址{local_part}@{host_name}
     * local_part可以为"Zhang San"这样的(包含双引号)
     * host_name可以为[127.0.0.1]这样的(包含方括号)
     * local_name支持这些符号' _ + - =
     * @param s {String}
     * @returns {boolean}
     */
    function test_email_address(s){
        return s && RE_EMAIL_ADDRESS.test(s) && (!$1() || $1().length < 254);
    }


    // id card number
    var DEAD_LINE = new Date('10/10/2030'/*<?php 建议从后台生成 ?>*/);
    var RE_ID_CARD_15 = /^[0-9]{6}([0-9]{2})(1[0-2]|0[1-9])([1-3][0-9]|0[1-9])[0-9]{3}/;
    var RE_ID_CARD_18 = /^[0-9]{6}([0-9]{4})(1[0-2]|0[1-9])([1-3][0-9]|0[1-9])[0-9]{4}/;
    /**
     * 验证目标字符串格式是否为中国身份证号码(15位和18位)
     * 主要对生日部分作了大致的范围限定
     * @param s {String}
     * @returns {boolean}
     */
    function test_id_card_number(s){
        var m;
        if (s != null) {
            if (s.length == 15 && (m = RE_ID_CARD_15.exec(s))) {
                // Date.parse在IE下直接返回time number而不是Date
                return new Date( m[2] + '/' + m[3] + '/'+ (m[1] < '40' ? '20' : '19' ) + m[1] ) < DEAD_LINE;
            } else if (s.length == 18 && (m = RE_ID_CARD_18.exec(s))) {
                return new Date( m[2] + '/' + m[3] + '/' + m[1] ) < DEAD_LINE;
            }
        }
        return false;
    }
    
    // url
/*
see: http://en.wikipedia.org/wiki/URI_scheme
 it's complex, so unnecessary to consider support all of it.
 */
    var _URL_CHAR = '[A-Za-z0-9_.!~*\'()-]';
    var _PROTOCOL = '(http[s]?|ftp):\\/{2}'; // protocol
    var _USER_INFO = '(?:(' + _URL_CHAR +'+:' + _URL_CHAR + '+)@)?'; //userinfo
    var _DOMAIN = '(' + DOMAIN_NAME + ')'; // domain
    var _PORT = '(?::([0-9]+))?'; // port
    // 考虑某些服务器会接受不符合常规的url
    var _PATH = '(\\/[^?]*)?'; // path
    var _QUERY = '([?].*)?'; // query
    var WEB_FILE_URL = _PROTOCOL + _USER_INFO + _DOMAIN + _PORT + _PATH + _QUERY;
    var RE_WEB_FILE_URL = make_test_regexp(WEB_FILE_URL);
    var _WEB_FILE_URL_TEST_OPT = {
        length: function (l){
            return l < 1024;
        },
        protocol: True,
        userinfo: True,
        domain: True,
        port: True,
        path: True,
        query: True
    };
    /**
     * 考虑到前端的实际使用情况，决定只支持http(s), ftp协议
     * @param s
     * @param opt {Object}
     * @config length {Function} 对长度进行验证
     * @config protocol {Function} 验证协议(不包括":")
     * @config userinfo {Function} 参数username, password
     * @config domain {Function} 验证域名
     * @config port {Function} 参数数字
     * @config path {Function} 验证path
     * @config query {Function} 验证query
     * @returns {Object}
     */
    function test_web_url(s, opt){
        s = s || '';
        opt = opt || {};
        // not valid reason
        var r = { length: s.length };
        var m = null;
        if ((m = RE_WEB_FILE_URL.exec(s)) != null) {
            r.protocol = m[1];
            r.userinfo = m[2];
            r.domain = m[3];
            r.port = Number(m[4]);
            r.path = m[5];
            r.query = m[6];
        }
        for (var k in _WEB_FILE_URL_TEST_OPT) {
            var fn = opt[k] || _WEB_FILE_URL_TEST_OPT[k];
            var v = r[k];
            var b = k == 'userinfo' ? fn.apply(null, v ? v.split(':') : []) : fn(v);
            if (!b) {
                opt.where = [k, v];
                return false;
            }
        }
        return true;
    }

    return {
        test_ip_address: test_ip_address,
        test_domain_name: test_domain_name,
        test_id_card_number: test_id_card_number,
        test_email_address: test_email_address,
        test_web_url: test_web_url
    };
})();
