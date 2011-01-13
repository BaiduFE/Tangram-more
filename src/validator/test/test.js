(function (){
    var validator = baidu.more.validator;
    module('test ip address');
    test('correct', function (){
        expect(3);
        ok(validator.test_ip_address('192.168.11.101'), '192.168.11.101');
        ok(validator.test_ip_address('0.0.0.0'), '0.0.0.0');
        ok(validator.test_ip_address('255.255.255.255'), '255.255.255.255');
    });
    test('incorrect', function (){
        expect(5);
        ok(!validator.test_ip_address('192.168.11..'), '192.168.11..');
        ok(!validator.test_ip_address('192.168.11.1111'), '192.168.11.1111');
        ok(!validator.test_ip_address('192.168.11.025'), '192.168.11.025');
        ok(!validator.test_ip_address('192.168.11.111.'), '192.168.11.111.');
        ok(!validator.test_ip_address('192.168.11.-111'), '192.168.11.-111');
    });
    test('range', function (){
        expect(4);
        ok(validator.test_ip_address('192.168.0.111'), '192.168.0.111');
        ok(validator.test_ip_address('192.168.11.254'), '192.168.11.254');
        ok(validator.test_ip_address('192.168.11.255'), '192.168.11.255');
        ok(!validator.test_ip_address('192.168.11.256'), '192.168.11.256');
    });

    module('test domain name');
    test('correct', function (){
        expect(6);
        ok(validator.test_domain_name('www.china-pub.com'), 'www.china-pub.com');
        ok(validator.test_domain_name('www.china--pub.com'), 'www.china--pub.com');
        ok(validator.test_domain_name('baidu.com.'), 'baidu.com.');
        ok(validator.test_domain_name('111111111111111111111111111111111111111111111111111111111111111.baidu.com'),
                '111111111111111111111111111111111111111111111111111111111111111.baidu.com');
        ok(validator.test_domain_name('unknowdomain'), 'unknowdomain');
        ok(validator.test_domain_name('1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.c'),
                '1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.c');
    });
    test('incorrect', function (){
        expect(9);
        ok(!validator.test_domain_name('127.0.0.1'), '127.0.0.1');
        ok(!validator.test_domain_name('mp3..baidu.com'), 'mp3..baidu.com');
        ok(!validator.test_domain_name('.baidu.com'), '.baidu.com');
        ok(!validator.test_domain_name('-baidu.com'), '-baidu.com');
        ok(!validator.test_domain_name('bai.-du.com'), 'bai.-du.com');
        ok(!validator.test_domain_name('bai-.du.com'), 'bai-.du.com');
        ok(!validator.test_domain_name('bai@du.com'), 'bai@du.com');
        ok(!validator.test_domain_name('1111111111111111111111111111111111111111111111111111111111111111.baidu.com'),
                '1111111111111111111111111111111111111111111111111111111111111111.baidu.com');
        ok(!validator.test_domain_name('1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.c'),
                '1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.c');
    });

    module('test email address');
    test('correct', function (){
        expect(6);
        ok(validator.test_email_address('zhangsan@global.com'), 'zhangsan@global.com');
        ok(validator.test_email_address('zhang_san@person.com'), 'zhang_san@person.com');
        ok(validator.test_email_address("zhangsan'.person@global"), "zhangsan'.person@global");
        ok(validator.test_email_address('zhang-san@person.com.cn'), 'zhang-san@person.com.cn');
        ok(validator.test_email_address('zhang+san@global.com.'), 'zhang+san@global.com.');
        ok(validator.test_email_address('""zhang san"@[10.10.10.10]'), '"zhang san"@[10.10.10.10]');
    });
    test('incorrect', function (){
        expect(3);
        ok(!validator.test_email_address('zhangsan#@global.com'), 'zhangsan#@global.com');
        ok(!validator.test_email_address('zhang san@global.com'), 'zhang san@global.com');
        ok(!validator.test_email_address('zhangsan@127.0.0.1'), 'zhangsan@127.0.0.1');
    });

    module('test id card number');
    test('correct', function (){
        expect(2);
        ok(validator.test_id_card_number('123456990202123'), '123456990202123');
        ok(validator.test_id_card_number('123456199902021234'), '123456199902021234');
    });
    test('incorrect', function (){
        expect(2);
        ok(!validator.test_id_card_number('123456992202123'), '123456992202123, 错误的月份');
        ok(!validator.test_id_card_number('123456205202021234'), '123456205202021234, 2052年的身份证谁有？');
    });

    module('test web file url');
    test('correct', function (){
        expect(2);
        ok(validator.test_web_url('ftp://127.0.0.1'), 'ftp://127.0.0.1');
        ok(validator.test_web_url('https://username:password@ftp.upload.com/files.asp?folder=home'),
                'https://username:password@ftp.upload.com/files.asp?folder=home');
    });
    test('incorrect', function (){
        expect(1);
        ok(validator.test_web_url('file:\\\\\\D:\\README.TEXT'), 'file:\\\\\\D:\\README.TEXT');

    });
    test('functions', function (){
        var r = validator.test_web_url('https://username:password@ftp.upload.com/files.asp?folder=home', {
            protocol: function (p){
                return p == 'https';
            },
            userinfo: function (u, p){
                return u == 'username' && p == 'password';
            },
            domain: function (d){
                return d == 'ftp.upload.com';
            },
            path: function (p){
                return p == '/files.asp';
            },
            query: function (q){
                return q == '?folder=home';
            }
        });
        ok(r, 'https://username:password@ftp.upload.com/files.asp?folder=home');
    });
})();