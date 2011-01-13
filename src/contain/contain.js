(function () {
	/*

	 * 实现一个节点是否包含另一个节点，可以判断文本节点。

	 * 

	 * path: contain.js

	 * author: yupeng

	 * version: 1.1.0

	 * date: 2010/11/8

	 */
	 
	 //import baidu;
	/**
	 * 判断包含一个节点
	 *
	 * @param {string} id container - 包含元素或元素的id 
	 * @param {string} id contained - 被包含元素或元素的id或文本节点
	 * 
	 */


baidu.more = baidu.more||{};


baidu.more.contain = function(container,contained){
    
	var container = baidu.g(container)|| container;
	var contained = baidu.g(contained) || contained ; 
	while (contained && contained != container)  
		contained = contained.parentNode;  
		return (contained ==container);  
};

})();