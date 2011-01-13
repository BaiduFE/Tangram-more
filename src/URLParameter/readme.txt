% baidu.more.URLParameter
% yanjunyi
 
  
## baidu.more.URLParameter
yanjunyi: yanjunyi@baidu.com
 
  
### 功能介绍：URLParameter可以干嘛？
 
URLParameter类提供了对URL中的参数部分管理的功能，使用该类型的实例可以方便的管理一个参数串中的各个部分，并在需要时转化为字符串，转化过程中的参数值编码提供了接口，可使用任意的编码函数，默认不编码。

特性：设置参数的多种方法，同名多参数支持，编码/解码接口支持，链式调用

### 实现原理：URLParameter怎么实现的？

对于任意一个实例，都内建了一个Object来存放参数的各个key，考虑到同名多参数的情况（如多个checkbox的值），每个key对应一个数组，数组中存放参数的值。
  
### 接口：

#### 静态方法：
URLParameter.parseJSON(param [, decoder]) 将一个形如“a=1&b=2&c=c1&c=c2”的字符串解析成JSON类型，所有参数都解析成key-[value1,value2,...,valuen]形式。如上例将解析为：{'a': [1], 'b': [2], 'c': ['c1', 'c2']}的JSON形式。decoder为非必选项，解析时对参数默认不解码，如需解码，可在调用时传入相应的decoder函数，如URLParameter.parseJSON(param, decodeURIComponent)。

#### 实例方法： 

initialize(p [, value]) 初始化实例，会在new一个对象时自动调用。接口与setParameter方法同，区别是调用init时会清空原有参数。

set(p [, value]) 设置参数。该方法提供了多种参数的调用方式，支持输入URLParameter对象，JSON对象，字符串键值对。如输入的一个键值是null，则在参数中删除该键。支持链式调用，调用结束时返回实例。详细使用方法见示例。

get([key]) 获取参数的值或整个参数对象。key为需要获取的参数名，如参数名存在，则返回该名下的值数组

toString([encoder]) 输出参数字符串，encoder为非必选项，生成时默认不对参数进行编码，如需编码，可在调用toString时传入相应的encoder函数，如param.toString(encodeURIComponent)。
  
### 示例

//创建对象
var param = new URLParameter(); // {}

//设置参数
param.set('a', 1); // {'a': [1]}

//设置参数
param.set('b', ['b1', 'b2']); // {'a': [1], 'b': ['b1', 'b2']}

//链式设置参数
param.set({'c': 3}).set({'a': null}); // {'c': [3], 'b': ['b1', 'b2']}

//获取参数
param.get('c'); // 3

//获取参数
param.get('b'); // ['b1', 'b2']

//获取参数对象
param.get(); // {'c': [3], 'b': ['b1', 'b2']}

//转化为字符串
param.toString(); // c=3&b=b1&b=b2

//重置后转化为字符串
param.initialize('d': '中文').toString(encodeURIComponent) // d=%E4%B8%AD%E6%96%87

### 注意
 
该类仅提供URL参数部分形如“a=1&b=2&c=c1&c=c2”字符串的处理方法，输入的字符串必须保证符合该格式，该类不提供输入格式检查。

关于收录，如有收录意向，建议放置在baidu.url包下