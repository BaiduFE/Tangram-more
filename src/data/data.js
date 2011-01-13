/*
 * baidu.more.data
 * 
 * path: data.js
 * author: stayalive
 * version: 1.0.0
 * date: 2010/9/9
 */
baidu.more = baidu.more||{};
/**
 * 获取或设定元素上储存的相应名字的数据
 *
 * @param {HTMLElement|element|window} elem	目标对象,DOM节点或window,可选如没有指定则为window
 * @param {string} name 数据名称 必选
 * @param {string|number|element|array} data	数据值 可选，存储在元素上面对应name的值，如果没有指定则为获取name对应的值
 * @return {string|number|element|array} 返回值 设定的数据,如果没有返回null
 */
baidu.more.data=function(elem, name, data){
	windowData=window.windowData=window.windowData||{};
	var expando=baidu.more.data.expando;
	if(elem.nodeName && baidu.more.data.noData[elem.nodeName.toLowerCase()]){
		return;
	}
	//如果没有指定elem，则为window对象
	if(typeof elem === "string"){
		data=name;
		name=elem;
		elem=window;
	}
	elem=elem==window?windowData:elem;
	var id=elem[expando], cache=baidu.more.data.cache, thisCache;
	
	if ( !id && typeof name === "string" && data === undefined ) {
		return null;
	}
	
	
	if ( !id ) { 
		id = ++baidu.more.data.guid;
	}
	
	
	if ( typeof name === "object" ) {
		elem[ expando ] = id;
		thisCache = cache[ id ] = baidu.object.extend({},name);

	} else if ( !cache[ id ] ) {
		elem[ expando ] = id;
		cache[ id ] = {};
	}
	thisCache = cache[ id ];
	
	if ( data !== undefined ) {
		thisCache[ name ] = data;
	}

	return typeof name === "string" ? thisCache[ name ] : thisCache;
};
/**
 * 移除元素上储存的数据
 *
 * @param {HTMLElement|element|window} elem	目标对象,DOM节点或window,可选如没有指定则为window
 * @param {string} name	数据名称 必选值
 */
baidu.more.data.remove=function( elem, name ){
	windowData=window.windowData=window.windowData||{};
	var expando=baidu.more.data.expando;
	if(elem.nodeName && baidu.more.data.noData[elem.nodeName.toLowerCase()]){
		return;
	}
	if(typeof elem === "string"){
		name=elem;
		elem=window;
	}
	elem=elem==window?windowData:elem;

	var id = elem[ expando ], cache = cache=baidu.more.data.cache, thisCache = cache[ id ];
	if ( name ) {
		if ( thisCache ) {
			delete thisCache[ name ];
			if ( baidu.more.data.isEmptyObject(thisCache) ) {
				baidu.more.data.remove( elem );
			}
		}
	} else {
		if ( baidu.more.data.deleteExpando ) {
			try{
				delete elem[ expando ];
			}catch(e){
				baidu.more.data.deleteExpando=false;
				if(elem.removeAttribute){
					elem.removeAttribute( expando );
				}
			}
		} else if ( elem.removeAttribute ) {
			elem.removeAttribute( expando );
		}

		delete cache[ id ];
	}
};
/**
 * 判断对象是否为空对象
 *
 * @param  {element} elem	对象
 * @return {bool} 返回值 true:空对象;false:不为空对象
 */
baidu.more.data.isEmptyObject=function(obj){
	for ( var name in obj ) {
		return false;
	}
	return true;
};
baidu.more.data.now=function(){return (new Date).getTime();};
//不可设定值的nodeName
baidu.more.data.noData={"embed": true,"object": true,"applet": true};
baidu.more.data.expando='bddata'+baidu.more.data.now();
baidu.more.data.deleteExpando=true;
baidu.more.data.cache={};
baidu.more.data.guid=0;