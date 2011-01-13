!function(b){
	/*

	 * 按字节截取字符串实现变态版本，效率比原有方法要高不少。

	 * 

	 * path: substrByByte.js

	 * author: lichengyin

	 * version: 1.1.0

	 * date: 2010/03/8

	 */

	//import baidu;
	
	b.more = b.more || {};
	
	/**
	 * 按字节截取字符串
	 
	 
	 * 如果不能刚好截取的话，则多截取一个字节。如：“ab好啊cd” 要截取3个字节，则结果为“ab好”。
	 * 如果你想少个字节的话，使用如下的代码：
	 * return (source+'').substr(0,length).replace(/([^\x00-\xff])/g,' $1').substr(0,length).replace(/ ([^\x00-\xff])/g,'$1');
	 * 
	 * @param {string} source 需要被截取的字符串
	 * @param {number} length 需要截取的宽度
	 * @return {string} 返回截取结果
	 */

	b.more.substrByByte = function(source, length){
		return (source+'').substr(0,length).replace(/([^\x00-\xff])/g,'$1 ').substr(0,length).replace(/([^\x00-\xff]) /g,'$1');
	}
}(baidu)