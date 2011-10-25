/*!
 * Grid,based on Tangram lib
 * Tangram Grid is the Grid you need!
 * @author yanghengfeng
 * @param	{Object}	options选项
 * @config	{String}	element ID或者DOM
 * @config	{Number}	height 控件的高度
 * @config	{Boolean}	autoHeight 自动高度 默认为false，如果autoHeight==true 内容<=height 高度设置为height。内容>height 使用内容height
 * @config	{String}	docktop 表格上部固定内容，计算表格高度会加上该元素的高度
 * @config	{Array}		columns 列模型 格时形如 [｛field:'NAME',header:"姓名",width:300,fix:true,type:'checkbox'/function｝]
 * @config	{Function}	onRowClick 行点击事件 参数为 ｛rowIndex:rowIndex,row:rowdata｝
 * @config	{Function}	onRowDblClick 行双击点击事件 参数为 ｛rowIndex:rowIndex,row:rowdata｝
 * @config	{Function}	onCellClick 单元格点击 参数为  ｛columnIndex:columnIndex,refIndex:refIndex,rowIndex:rowIndex,resizable:true,sortable:true｝
 * @config	{Function}	onSelect 单元格选择触发 参数为｛rowIndex:rowIndex,row:rowdata｝
 * @config	{Function}	onUnSelect 单元格取消选择触发 参数为｛rowIndex:rowIndex,row:rowdata｝
 * @config	{Number}	selectMode 行选择模式:0 不选择,1 单行选择,2 多行选择，默认为0
 * @config	{String|Function}	selectBy 初始选中是否选中字段或者判断函数，如果是字段名，则判断该字段是否为true/1，如果是函数，函数接收参数{rowdata:rowdata,rowIndex:rowIndex}
 * @config	{Boolean}	strip 隔行变色效果 默认为true
 * @config	{Boolean}	hoverhighlight hover是否高亮行，默认是true
 * @config	{Boolean|Object|String}	page===false：不分页，否则为分页参数 分页参数默认为｛perPage:10,pagenumbers:[10,20,50,100],curPage:1,pages:0,from:0,to:0,total:0,tools:"自定义分页中间的工具html"} 如果page是字符串，则作为自定分页控件的容器
 * @config	{String}	url	ajax请求url
 * @config	{Object}	ajaxOption	ajax请求参数
 * @config	{Function}	onBeforeRequest ajax请求前执行方法
 * @config	{Function}	onBeforeLoad 数据加载前执行方法(ajax请求回调)
 * @config	{Function}	onAfterLoad 数据加载后执行方法
 * @config	{String}	orderBy 初始排序字段
 * @config	{String}	order 初始排序类型desc /asc
 * @config	{Function}	onBeforeSort排序前执行方法参数为｛orderBy:"字段",order:"asc/desc"｝
 * @config	{Boolean}	loadMask，ajax请求是否显示遮罩
 * @config	{String}	loadMessage，遮罩时提示文本,默认为"正在加载..."
 */
baidu.ui.Grid = baidu.ui.createUI(function(opt){
	opt.autoRender=true;
	this.element= baidu.g(opt.element);
}).extend({
	uiType: "grid",
	
	/**
	 * 设置宽度和高度
	 * @param {Object} o ｛width:w,height:h} w可以是数字和"auto" h 只能是数字 
	 */
	setSize:function(o){
		if (o && o.width) { 
			if(isNaN(o.width)){
				baidu.dom.setStyle(this.element,"width",o.width);
			}else{
				baidu.dom.setStyle(this.element,"width",o.width);
			}
		}
		if (o && o.height) { 
			this._setHeight(o.height);
		}else{
			this._setHeight(this.height);
		}
		this._fixColWidth();
		this._sizeScroller();
		this.dispatchEvent("resize",{});
	},
	/**
	 * 调整grid的大小
	 */
	resize:function(){
		this.setSize();
	},
	/**
	 * 计算自适应列的宽度
	 */
	_fixColWidth:function(){
		var g= this,fixColIndex=g.fixColIndex,
			t=baidu.dom.query(".gridtable",g.ref.gbody),
			y=parseInt(baidu.dom.getStyle(g.ref.gbody.parentNode,"height"),10)||g.ref.gbody.parentNode.clientHeight,
			s=g.ref.gheader.style,fixcol=null,
			hdContentWidth = g.ref.gheader.parentNode.offsetWidth-parseInt(baidu.dom.getStyle(g.ref.gheader,"border-left-width"),10)-parseInt(baidu.dom.getStyle(g.ref.gheader,"border-right-width"),10),
		w=hdContentWidth;
		if(fixColIndex!=-1){
			var t = baidu.dom.query(".gridtable",g.ref.gbody);
			for (i = 0, l = g.ref.ghcells.length; i < l; i++) {
				var c=g.ref.ghcells[i],refcol=c.getAttribute("refcol"); 
				if ((!g.columns[refcol].fix) || (!refcol)) {
					w -= c.offsetWidth;
				}else{
					fixcol= c;
				}
			}
			if (fixcol && w>20) {
				w= w- parseInt(baidu.dom.getStyle(fixcol,"border-left-width"),10)- parseInt(baidu.dom.getStyle(fixcol,"border-right-width"),10);
				if (t.length > 0 && t[0].offsetHeight > y && (!g.autoHeight)) {
					w=w-17;
				}
				baidu.dom.setBorderBoxWidth(fixcol,w);
				g.columns[g.fixColIndex].width = w;
				if(g.ref.gbody){
					var fixbodycell = baidu.dom.query("[refcol="+g.fixColIndex+"]",g.ref.gbody);
					baidu.array.each(fixbodycell,function (c){
						baidu.dom.setBorderBoxWidth(fixbodycell[0],w);
					});
				}
			}
		}
		g._webkit();
	},
	/**
	 * webkit bug fix 
	 */
	_webkit:function(mode){
		var g = this;
		if(baidu.browser.isWebkit){
			baidu.array.each(baidu.dom.query("table",g.ref.gbody),function(t){
				if(t.rows[0]){
					baidu.array.each(t.rows[0].cells,function(c,i){
						var colIndex = c.getAttribute("refcol"),col= g._getCol(colIndex);
						if(g.fixColIndex==colIndex){
							if(mode){
								c.style.width=((col.width+1)+"px");
							}else{
								c.style.width=(col.width+"px");
							}
							if(mode===false ){
								c.style.width=((col.width+1)+"px");
							}
							
						}else if(i!=0 ){
							c.style.width=((col.width+1)+"px");
						}
					});
				}
			});
		}
	},
	/**
	 * 根据表格数据内容计算横向/纵向滚动条的位置和大小
	 */
	_sizeScroller:function(){
		var g =this,t=baidu.dom.query(".gridtable",g.ref.gbody);
		//set the top of yscroller
		g.ref.yscroller.style.top=g.ref.gheader.offsetHeight+"px";
		if(t.length>0 && g.ref.gbody){
			t[0].style.width=g.ref.gheader.childNodes[0].clientWidth+"px";
			var t=t[0],tHeight=t.offsetHeight,tWidth=t.offsetWidth,bodySibings = g.ref.gbody.parentNode.childNodes,
			y=parseInt(baidu.dom.getStyle(g.ref.gbody.parentNode,"height"),10)||g.ref.gbody.parentNode.clientHeight,
			s=g.ref.gheader.style,
			x=g.ref.gheader.parentNode.offsetWidth-parseInt(baidu.dom.getStyle(g.ref.gheader,"border-left-width"),10)-parseInt(baidu.dom.getStyle(g.ref.gheader,"border-right-width"),10);
			for(var i = 0,l=bodySibings.length;i<l;i++){
				if( (baidu.dom.getStyle(bodySibings[i],"position")=="static" || baidu.dom.getStyle(bodySibings[i],"position")=="relative") && bodySibings[i]!=g.ref.gbody){
					y-=bodySibings[i].offsetHeight;
				}
			}
			var xOverFlow=x<tWidth,
			yOverFlow=y<tHeight;
			
			g.ref.xscroller.style.display=(xOverFlow?"block":"none");
			g.ref.yscroller.style.display=(yOverFlow?"block":"none");
			g.ref.rbcorner.style.display=((xOverFlow && yOverFlow)?"block":"none");
			
			baidu.dom.setStyle(g.ref.xscroller,"width",(yOverFlow?(x-17):x));
			baidu.dom.setStyle(g.ref.xstrecher,"width",tWidth);
			
			baidu.dom.setStyle(g.ref.yscroller,"height",(xOverFlow?(y-17):y));
			baidu.dom.setStyle(g.ref.ystrecher,"height",tHeight);
			
			baidu.dom.setStyle(g.ref.gbody,"width",(yOverFlow?(x-17):x));
			baidu.dom.setStyle(g.ref.gbody,"height",(xOverFlow?(y-17):y));
			
			g.ref.xscroller.scrollLeft=0;
			g.ref.yscroller.scrollTop=0;
			if(g.ref.gbody.childNodes.length>0)g.ref.gbody.childNodes[0].style.marginLeft="0px";
			g.ref.gheader.childNodes[0].style.marginLeft="0px";
			t.style.marginBottom="0px";
			if(g.autoHeight){
				var gridcontainer = baidu.dom.query("> .tangramgridcontainer",g.element);
				//如果autoHeight==true 内容<=height 高度设置为height。内容>height 使用内容height
				if(yOverFlow){
					g.ref.xscroller.style.display=(xOverFlow?"block":"none");
					g.ref.yscroller.style.display="none";
					g.ref.rbcorner.style.display="none";
					
					baidu.dom.setStyle(g.ref.xscroller,"width",x);
					baidu.dom.setStyle(g.ref.xstrecher,"width",tWidth);
					
					
					baidu.dom.setStyle(g.ref.gbody,"width",x);
					baidu.dom.setStyle(g.ref.gbody,"height","auto");
					
					if(gridcontainer.length) baidu.dom.setStyle(gridcontainer[0],"height","auto");
					
					
				}
				if(xOverFlow){
					t.style.marginBottom="17px";
					baidu.dom.setStyle(g.ref.gbody,"height","auto");
				}
				var h =0,nodes = g.element.childNodes;
				for(var i = 0,l=nodes.length;i<l;i++){
					if( (baidu.dom.getStyle(nodes[i],"position")=="static" || baidu.dom.getStyle(nodes[i],"position")=="relative")){
						h+=nodes[i].offsetHeight;
					}
				}
				baidu.dom.setStyle(g.element,"height",h);
			}
		}
	},
	/**
	 * 绑定滚动条事件
	 */
	_bindScroller:function(){
		var g=this;
		function scrolllX(){
			var l = this.scrollLeft;
			g.ref.gbody.childNodes[0].style.marginLeft="-"+l+"px";
			g.ref.gheader.childNodes[0].style.marginLeft="-"+l+"px";
		}
		function scrollY(){
			var t = this.scrollTop;
			g.ref.gbody.scrollTop=t;
		}
		baidu.event.on(g.ref.xscroller,"scroll",scrolllX);
		baidu.event.on(g.ref.yscroller,"scroll",scrollY);
		//scroll when mouse wheel
		function wheel(ev){
			var delta = ev.wheelDelta ? (ev.wheelDelta / 120) : (- ev.detail / 3); 
			g.ref.yscroller.scrollTop= g.ref.yscroller.scrollTop-(delta*20);
			g.ref.gbody.scrollTop=g.ref.yscroller.scrollTop;
		}
		if(!baidu.browser.isGecko){
			baidu.event.on(g.ref.gbody,"mousewheel",wheel);
		}else{//FireFox 
			baidu.event.on(g.ref.gbody,"DOMMouseScroll",wheel);
		}
	},
	/**
	 * 设置高度
	 * @param {Number} h 高度
	 */
	_setHeight:function(h){
		var g = this;
		g.height=h;
		g.element.style.height=h+"px";
		var boxes= g.element.childNodes,
			gridcontainer = baidu.dom.query(".tangramgridcontainer",g.element)[0],
			nodes = gridcontainer.childNodes;
		for (var i = 0, l = boxes.length; i < l; i++) {
			if (boxes[i] != gridcontainer && (baidu.dom.getStyle(boxes[i], "position") == "static" || baidu.dom.getStyle(boxes[i], "position") == "relative")) {
				h -= boxes[i].offsetHeight;
			}
		}
		baidu.dom.setBorderBoxHeight(gridcontainer,h);
		for (var i = 0, l = nodes.length; i < l; i++) {
			if ( (baidu.dom.getStyle(nodes[i], "position") == "static" || baidu.dom.getStyle(nodes[i], "position") == "relative") && nodes[i] != g.ref.gbody) {
				h -= nodes[i].offsetHeight;
			}
		}
		baidu.dom.setBorderBoxHeight(g.ref.gbody,h);
		
	},
	/**
	 * 显示遮罩层
	 */
	showMask:function(){
		var g=this, mask= baidu.dom.query("> .gridloadmask",g.element),maskmessage=  baidu.dom.query("> .gridloadmessge",g.element);
		if (mask.length) {
			mask[0].style.height=g.element.clientHeight+"px";
			mask[0].style.display = "block";
		}
		if(maskmessage.length) maskmessage[0].style.display="block";
		
	},
	/**
	 * 隐藏遮罩层
	 */
	hideMask:function(){
		var g=this, mask= baidu.dom.query("> .gridloadmask",g.element),maskmessage=  baidu.dom.query("> .gridloadmessge",g.element);
		if (mask.length)  mask[0].style.display="none";
		if(maskmessage.length) maskmessage[0].style.display="none";
	},
	/**
	 * ajax加载加载数据
	 * @param {Object} param 传递的额外参数可以是string 也可以是｛key:value}
	 */
	request:function(param){
		var g=this,opt= g.ajaxOption||{},data=opt.data||"",param= param||{},orderBy=g.orderBy||"",ordercol=g._getCol(orderBy);
		if(baidu.lang.isString(param)) param = baidu.url.queryToJson(param);
		data = baidu.url.queryToJson(data);
		//grid param
		data.curPage = g.page.curPage;
		data.perPage = g.page.perPage;
		(ordercol && ordercol.field) && (data.orderBy =ordercol.field);
		data.order=g.order||"";
		
		data=baidu.object.extend(data,param);
		opt.onsuccess=function(xhr,result){
			if(g.loadMask){
				g.hideMask();
			}
			var ajaxResult = baidu.json.parse(result);
			g.dispatchEvent("datafilter",ajaxResult);//datafilter
			g.loadData(ajaxResult);
		}
		if(g.page===false){
			delete data.curPage;
			delete data.perPage;
		}
		opt.data=data;
		//function onBeforeRequest can change request option
		if(!g.dispatchEvent("beforerequest",opt)){return ;}
		if(typeof(g.onBeforeRequest)=="function"  && g.onBeforeRequest({},opt)===false ) {return;}
		
		opt.data = baidu.url.jsonToQuery(opt.data);
		g.ajaxOption=opt;//remember the ajaxOption.data
		g.page.curPage = data.curPage;//remember current page
		//g.orderBy=data.orderBy;
		//g.order=data.order;
		
		if(g.loadMask){
			g.showMask();
		}
		if(g.url)baidu.ajax.request(g.url,opt);
	},
	/**
	 * 加载数据
	 * @param {Object} data
	 */
	loadData:function(data){
		var g=this;
		if(!g.dispatchEvent("beforeload",data)){return ;}
		if(typeof(g.onBeforeLoad)=="function") g.onBeforeLoad({},data);
		var rows=data.data.list||[],arr=[" border='0' cellspacing='0' cellpadding='0' ><tbody>"],cols = g.columns,realColumnsLength=0;
		g.data=data;
		g.selectedRows=[];//clear selections
				
		
		arr.push("<tr>");
		for(var j=0,ll=cols.length;j<ll;j++){
			var col= cols[j],w=col.width;
			if (!col.columns) {
				arr.push("<td refcol='" + j + "' style='width:" + w + "px;height:0px; border-bottom-width:0px;" + (col.hide ? "display:none;" : "") + "' ></td>");
				realColumnsLength++;
			}else{
				for(var subi=0,subl=col.columns.length;subi<subl;subi++){
					realColumnsLength++;
					var subcol = col.columns[subi],w=subcol.width;
					arr.push("<td refcol='" + j+"-"+subi + "' style='width:" + w + "px;height:0px; border-bottom-width:0px;" + (subcol.hide ? "display:none;" : "") + "' ></td>");
				}
			}
		}
		arr.push("</tr>");
		for(var i=0,l=rows.length;i<l;i++){
			var row=rows[i],select=((!!g.selectMode) && (!!g.selectBy));//是否选中
			if(select){
				if(baidu.lang.isString(g.selectBy)){
					select = (row[g.selectBy]=="1" || row[g.selectBy]==true);
				}
				if(baidu.lang.isFunction(g.selectBy)){
					select  = g.selectBy({rowdata:row,rowIndex:i});
					select = (select=="1" || select==true);
				}
			}
			if(select){
				if (g.selectedRows.length >= 1 && g.selectMode == 1) {//单选
					select = false;
				}else {
					g.selectedRows.push(i);
				}
			}
			//beginrowjoin and the performance????
			g.dispatchEvent("beginrowjoin",{realColumnsLength:realColumnsLength,rowdata:row,rowIndex:i,joinedArray:arr});
			arr.push("<tr rowindex="+i+"   class=' gridrow "+(g.strip===false?"":(i%2?"even":"odd"))+" "+(select?"selected":"")+" '>");
			for(var j=0,ll=cols.length;j<ll;j++){
				var col= cols[j];
				if (!col.columns) {
					arr.push("<td class='gridcell' nowrap='nowrap' style='" + (col.hide ? "display:none;" : "") + "'><span class='cellcontent' style='text-align:" + (col.align || "left") + ";' > " + g._getCellContent(col,i,{select:select}) + "</span></td>");
				}else{
					for(var subi=0,subl=col.columns.length;subi<subl;subi++){
						var subcol = col.columns[subi];
						arr.push("<td class='gridcell' nowrap='nowrap' style='" + (subcol.hide ? "display:none;" : "") + "'><span class='cellcontent' style='text-align:" + (subcol.align || "left") + ";' > " + g._getCellContent(subcol,i,{select:select}) + "</span></td>");
					}
				}
			}
			arr.push("</tr>");
			//endrowjoin and the performance????
			g.dispatchEvent("endrowjoin",{realColumnsLength:realColumnsLength,rowdata:row,rowIndex:i,joinedArray:arr});
		}
		g.dispatchEvent("endrowsjoin",{joinedArray:arr});
		arr.push("</tbody></table></div>");
		arr.unshift("<div class='grid-tablecontainer'><table class='gridtable' style='width:"+g.ref.gheader.childNodes[0].clientWidth+"px' ");
		g.ref.gbody.innerHTML=arr.join("");
		this.setSize();
		//pager
		if(g.page && g._useDefaultPager){
			if(!data.data.page)data.data.page={};
			data.data.page.total=parseInt(data.data.page.total,10);//parse into number
			g.page.total= parseInt(data.data.page.total||Math.max(rows.length,g.page.total,10));//如果server端没有返回total，尝试是否有缓存(在翻页时可以缓存总记录条数)
			var p  = g.ref.pager,c= g.page.curPage,
			pages= parseInt((data.data.page.total-1)/g.page.perPage,10)+1,
			from = Math.max((g.page.curPage-1)*g.page.perPage+1,1),
			to= Math.min((g.page.curPage)*g.page.perPage,data.data.page.total);
			p.first.disabled = (c<=1 || pages<=1);
			p.prev.disabled = (c<=1 || pages<=1);
			p.curPage.value =c;
			p.pages.innerHTML =pages;
			p.next.disabled = (c>=pages || pages<=1);
			p.last.disabled = (c>=pages || pages<=1);
			p.from.innerHTML =from;
			p.to.innerHTML =to;
			p.total.innerHTML =data.data.page.total;
		
			//remember the data 
			g.page.pages=pages;
			g.page.from=from;
			g.page.to=to;
			g.page.total=data.data.page.total;
			
		}
		g._webkit();
		g.dispatchEvent("afterload",data);
		if(typeof(g.onAfterLoad)=="function") g.onAfterLoad({},data);
	},
	/**
	 * 根据单元格配置属性获取单元格内容html
	 * @param {Object} col 
	 * @param {Number} rowIndex 行序号
	 * @param {Object} extraParam 添加的额外参数可空
	 * @return {String} 内容html
	 */
	_getCellContent:function(col,rowIndex,extraParam){
		var g=this,row= g.getData().data.list[rowIndex]||{},
		celltext=row[(col.field||"")],
		celltext=(celltext=="0"?celltext:(celltext||"")),
		coltype = baidu.ui.Grid.ext.coltype[col.renderer||""],
		param = {cellvalue:celltext,colopts:col,rowdata:row,rowIndex:rowIndex};
		if(baidu.lang.isObject(extraParam)){baidu.object.extend(param,extraParam)};
		if (baidu.lang.isObject(coltype) && coltype && baidu.lang.isFunction(coltype.format)) {
			celltext = coltype.format.call(g, param) || "";
		}
		if (baidu.lang.isFunction(col.renderer)) {
			celltext = col.renderer.call(g, param) || "";
		}
		return celltext;
	},
	/**
	 * 获取表格数据
	 */
	getData:function(){
		return this.data;
	},
	/**
	 * 选中
	 * @param {Object} rowIndex 行序号 从0开始
	 * @param {Object} e event对象，可选参数
	 * @param {Object} data 事件传递参数，可选参数
	 */
	selectRow:function(rowIndex,e,data){
		var g =this,rowIndex = parseInt(rowIndex,10),isSelected  = (baidu.array.indexOf(g.selectedRows,rowIndex) != -1);
		if(!data) data ={rowIndex:rowIndex,row:g.data.data.list[rowIndex]};
		//select
		if (g.selectMode) {
			if (g.selectMode == 1) {
				//清除选中
				baidu.array.each(g.selectedRows, function(i){
					/*var row = baidu.dom.query("[rowindex=" + i + "]", g.gbody)[0];
					baidu.dom.removeClass(row, "selected");*/
					baidu.array.each(baidu.dom.query("[rowindex=" + i + "]", g.ref.gbody),function(row){
						baidu.dom.removeClass(row, "selected");
					});
					var removedata={rowIndex:i,row:g.data.data.list[i]};
					g.dispatchEvent("unselect",removedata);
					if(typeof(g.onUnSelect)=="function") g.onUnSelect(e,removedata);
				});
				g.selectedRows = [];
			}
			
			/*if (!g.dispatchEvent("beforeselect", data)) { return; }
			if (typeof(g.onBeforeSelect) == "function" && (!g.onBeforeSelect(e, data))) { return;}*/
			/*var newrow = baidu.dom.query("[rowindex=" + rowIndex + "]", g.gbody)[0];
			baidu.dom.addClass(newrow, "selected");*/
			if(g.selectMode==2 && isSelected) return true;//多选，已经选中，直接返回
			baidu.array.each(baidu.dom.query("[rowindex=" + rowIndex + "]", g.ref.gbody),function(row){
				baidu.dom.addClass(row, "selected");
			});
			g.selectedRows.push(rowIndex);
			g.selectedRows.sort();
			g.dispatchEvent("select",data);
			if(typeof(g.onSelect)=="function") g.onSelect(e,data);
		}
		return true;
	},
	/**
	 * 选中
	 * @param {Object} rowIndex 行序号 从0开始
	 * @param {Object} e event对象，可选参数
	 * @param {Object} data 事件传递参数，可选参数
	 */
	unSelectRow:function(rowIndex,e,data){
		
		var g =this,rowIndex = parseInt(rowIndex,10),isSelected  = (baidu.array.indexOf(g.selectedRows, rowIndex) != -1);
		if(!data) data ={rowIndex:rowIndex,row:g.data.data.list[rowIndex]};
		if(isSelected){
			/*if (!g.dispatchEvent("beforeunselect", data)) {return false;}
			if (typeof(g.onBeforeUnSelect) == "function" && (!g.onBeforeUnSelect(e, data))) {return false;}*/
				
			/*var row = baidu.dom.query("[rowindex=" + rowIndex + "]", g.gbody)[0];
			baidu.dom.removeClass(row,"selected");*/
			baidu.array.each(baidu.dom.query("[rowindex=" +rowIndex + "]", g.ref.gbody),function(row){
				baidu.dom.removeClass(row, "selected");
			});
			baidu.array.remove(g.selectedRows,rowIndex);//splice 
			
			g.dispatchEvent("unselect",data);
			if(typeof(g.onUnSelect)=="function") g.onUnSelect(e,data);
		}
		
	},
	/**
	 * 选中/不选中
	 * @param {Object} rowIndex 行序号 从0开始
	 * @param {Object} e event对象，可选参数
	 * @param {Object} data 事件传递参数，可选参数
	 */
	toggleSelectRow:function(rowIndex,e,data){
		var g =this,rowIndex = parseInt(rowIndex,10),isSelected  = (baidu.array.indexOf(g.selectedRows,rowIndex) != -1);
		if(!data) data ={rowIndex:rowIndex,row:g.data.data.list[rowIndex]};
		if(isSelected){
			g.unSelectRow(rowIndex,e,data);
		}else{
			g.selectRow(rowIndex,e,data);
		}
		
	},
	/**
	 * 获取选中行数据(只返回一行数据)
	 * @param fields {String|Array}指定列名称
	 */
	getSelected:function(fields){
		var selections = this.getSelections();
		if(selections.length>0){
			return selections[0];
		}else{
			return null;
		}
	},
	/**
	 * 获取选中行(多行)
	 */
	getSelections:function(fields){
		var result=[],g=this;
		baidu.array.each(g.selectedRows,function (i){
			var row = {},datarow = g.data.data.list[i];
			if(baidu.lang.isString(fields)){
				row[fields]= datarow[fields];
			}else if(baidu.lang.isArray(fields)){
				baidu.array.each(fields,function(f){
					row[f]= datarow[f];
				});
			}else{
				row =  datarow;
			}
			result.push(row);
			//result.push(field?g.data.data.list[i][field]:g.data.data.list[i]);
		});
		return result;
	},
	/**
	 * 按照字段排序 
	 * @param {Object} colIndex 排序字段序号
	 * @param {Object} order 排序类型 desc / asc
	 * @param {Object} e  event对象，可空 e如果为空，默认找到字段的第一个列排序
	 */
	reOrder: function(colIndex,order,e){
		var g =this,s=g._getSrc(e),col=g._getCol(colIndex),
			data={orderBy:col.field,order:order,curPage:1,colIndex:colIndex},
			isdesc=(order=="asc"),
			cell=s.cell?[s.cell]:[];
		if(col.sortable===false || col.columns ){return ;}
		if(!cell.length){
			cell= baidu.dom.query("[refcol="+colIndex.toString()+"]",g.ref.gheader);
		}
		if(cell.length==0) {return ;}
		if(!g.dispatchEvent("beforesort",data)){return ;}
		if(typeof(g.onBeforeSort)=="function" && g.onBeforeSort(e,data)===false) {return ;}
		
		//remember order status
		g.order=order;
		g.orderBy=colIndex;
		
		//reset all sorted field
		//<span class='sorter sort-asc' style='font-family:Arial'>▲</span> //▼
		baidu.array.each(baidu.dom.query(".sorter",g.ref.gheader),function(o){
			baidu.dom.remove(o);
		});
		
		var sorter= baidu.dom.create("span",{
			"className": "sorter " + (isdesc ? "sort-asc" : "sort-desc")
		});
		sorter.innerHTML = (isdesc?"▲":"▼");
		baidu.array.each(cell,function(c){
			c.childNodes[0].appendChild(sorter);
		});
		delete data.colIndex;
		g.request(data);
	},
	/**
	 * 隐藏列
	 * @param {Object} colIndex 列序号。从0开始
	 */
	hideColumn:function(colIndex){
		var g=this,colIndex=colIndex.toString(),nodes = baidu.dom.query(".gridtable",g.ref.gbody),col=g._getCol(colIndex);
		col.hide=true;
		if (colIndex.indexOf("-") != -1) {//show parent
			var parentColIndex = colIndex.substr(0, colIndex.indexOf("-")), parentCol = g._getCol(parentColIndex),allhidden=true;
			for (var i = parentCol.columns.length - 1; i >= 0; i--){
				if(!parentCol.columns[i].hide) allhidden=false;
			};
			parentCol.hide= allhidden;
		}else if(col.columns){
			for (var i = col.columns.length - 1; i >= 0; i--){
				col.columns[i].hide= true;
			};
		}
		
		g.render(g.element);
		g.dispatchEvent("hidecolumn",{colIndex:colIndex});
	},
	/**
	 * 显示列
	 * @param {Object} colIndex 列序号
	 */
	showColumn:function(colIndex){
		var g=this,nodes = baidu.dom.query(".gridtable",g.ref.gbody),colIndex=colIndex.toString(),col=g._getCol(colIndex);
		col.hide=false;
		if (colIndex.indexOf("-") != -1) {//show parent
			var parentColIndex = colIndex.substr(0, colIndex.indexOf("-")), parentCol = g._getCol(parentColIndex);
			parentCol.hide = false;
		}if(col.columns){
			for (var i = col.columns.length - 1; i >= 0; i--){
				col.columns[i].hide= false;
			};
		}
		g.render(g.element);
		g.dispatchEvent("showcolumn",{colIndex:colIndex});
	},
	/**
	 * 新增行
	 * @param {Object} row 行数据
	 * @param {Number} rowIndex  在第rowIndex行后新增，rowIndex如果不指定，行数据追加到表格最后。rowIndex从1开始，rowIndex如果为0，则在最上方添加行
	 */
	addRow:function(row,rowIndex){
		if(typeof(rowIndex)=="undefined") rowIndex = this.data.data.list.length;
		this.data.data.list.splice(rowIndex,0,row);
		if(this.data.data.page && typeof(this.data.data.page.total)!="undefined") this.data.data.page.total++;
		this.loadData(this.data);
		this.dispatchEvent("addrow",{row:row,rowIndex:rowIndex});
	},
	/**
	 * 更新行
	 * @param {Object} row 行数据
	 * @param {Number} rowIndex 替换行的下标，从0开始
	 */
	updateRow:function(row,rowIndex){
		this.data.data.list[rowIndex]=row;
		this.loadData(this.data);
		this.dispatchEvent("updaterow",{row:row,rowIndex:rowIndex});
	},
	/**
	 * 删除行
	 * @param {Number} rowIndex 删除下标为rowIndex行后的行
	 */
	deleteRow:function(rowIndex){
		baidu.array.remove(this.selectedRows,rowIndex);
		this.data.data.list.splice(rowIndex,1);
		if(this.data.data.page && typeof(this.data.data.page.total)!="undefined") this.data.data.page.total--;
		this.loadData(this.data);
		this.dispatchEvent("deleterow",{rowIndex:rowIndex});
	},
	/**
	 * 添加行
	 * @param {Object} rowdata 行数据
	 * @param {Object} rowIndex 在rowIndex行后添加
	 * @return {Number} 返回新增行的rowIndex
	 */
	addDOMRow:function(rowdata,rowIndex){
		var g=this,tables = baidu.dom.query(".gridtable",g.ref.gbody);
		if(typeof(rowIndex)=="undefined") rowIndex = g.getData().data.list.length;
		g.getData().data.list.push(rowdata);
		var newRowIndex = g.getData().data.list.length - 1;
		baidu.array.each(tables,function(t){
			var row0= t.rows[0],
				cells= row0.cells,
				rows=baidu.dom.query(".gridrow[rowindex="+rowIndex+"]",t),
				row =rows.length>0?rows[0]:baidu.dom.query("tr:last",t)[0],
				rowNextSibling = rows.length>0?row:row.nextSibling;
			if(!row){return true;}	
			var newRow = document.createElement("tr");
			newRow.className="gridrow";
			newRow.setAttribute("rowindex",newRowIndex);
			for(var i=0,l=cells.length;i<l;i++){
				var c = cells[i],refcol= c.getAttribute("refcol"),col= g._getCol(refcol);
				var td = document.createElement("td");
				td.className="gridcell";
				td.setAttribute("nowrap","nowrap");
				td.setAttribute("noWrap","noWrap");
				if(col.hide) td.style.display="none";
				td.innerHTML="<span class='cellcontent' style='text-align:" + (col.align || "left") + ";' >" + g._getCellContent(col,newRowIndex) + "</span>";
				newRow.appendChild(td);
			}
			if(rowNextSibling){
				rowNextSibling.parentNode.insertBefore(newRow,rowNextSibling);
			}else{
				row.parentNode.appendChild(newRow);
			}
		});
		g.resize();
		this.dispatchEvent("addomrow",{rowIndex:rowIndex,newRowIndex:newRowIndex,rowdata:rowdata});
		return newRowIndex;
	},
	/**
	 * 更新行
	 * @param {Object} rowdata 行数据
	 * @param {Object} rowIndex 行号
	 */
	updateDOMRow:function(rowdata,rowIndex){
		var g=this,tables = baidu.dom.query(".gridtable",g.ref.gbody);
		g.getData().data.list[rowIndex]=rowdata;//update model;
		baidu.array.each(tables,function(t){
			var row0= t.rows[0],
				cells= row0.cells,
				row = (baidu.dom.query(".gridrow[rowindex="+rowIndex+"]",t)[0]);
			if(!row){return true;}	
			var newRow = document.createElement("tr");
			newRow.className="gridrow";
			newRow.setAttribute("rowindex",rowIndex);
			for(var i=0,l=cells.length;i<l;i++){
				var c = cells[i],refcol= c.getAttribute("refcol"),col= g._getCol(refcol);
				var td = document.createElement("td");
				td.className="gridcell";
				td.setAttribute("nowrap","nowrap");
				td.setAttribute("noWrap","noWrap");
				if(col.hide) td.style.display="none";
				td.innerHTML="<span class='cellcontent' style='text-align:" + (col.align || "left") + ";' >" + g._getCellContent(col,rowIndex) + "</span>";
				newRow.appendChild(td);
			}
			row.parentNode.replaceChild(newRow,row);
		});
		g.resize();
		this.dispatchEvent("updatedomrow",{rowIndex:rowIndex,rowdata:rowdata});
	},
	/**
	 * 删除行
	 * @param {Object} rowIndex 行号
	 */
	deleteDOMRow:function(rowIndex){
		var g=this,tables = baidu.dom.query(".gridtable",g.ref.gbody);
		baidu.array.remove(g.selectedRows,rowIndex);
		//删除DOM row。不删除model数据
		//g.getData().data.list.splice(rowIndex,1);
		baidu.array.each(tables,function(t){
			var row = (baidu.dom.query(".gridrow[rowindex="+rowIndex+"]",t)[0]);
			if(!row){return true;}	
			row.parentNode.removeChild(row);
		});
		g.resize();
		this.dispatchEvent("deletedomrow",{rowIndex:rowIndex});
	},
	/**
	 * 单元格遍历函数
	 * @param fn {Function} 遍历函数，如果该方法返回false,遍历结束,函数接收参数｛column:colopts,cell:cell,row:row,colIndex:refcol,rowIndex:rowIndex,rowdata:g.getData().data.list[rowIndex]}
	 */
	cellIterator:function(fn){
		var g = this,tables = baidu.dom.query("table",g.ref.gbody);
		for(var ti=0,tl=tables.length;ti<tl;ti++){
			var table = tables[ti],rows= table.rows,row0cells=rows[0].cells;
			for(var i=1,l=rows.length;i<l;i++){//skip the first row
				var row = rows[i],rowIndex  = row.getAttribute("rowindex");
				if(typeof(rowIndex)=="undefined" || (!baidu.dom.hasClass(row,"gridrow"))) {continue;}
				rowIndex= parseInt(rowIndex,10);
				for(var ii=0,ll=row0cells.length;ii<ll;ii++){
					var cell= row.cells[ii],
						refcol=row0cells[ii].getAttribute("refcol"),
						col= g._getCol(refcol),
						cellvalue= g.getData().data.list[rowIndex][col.field||""];
						param={column:col,cell:cell,row:row,colIndex:refcol,rowIndex:rowIndex,rowdata:g.getData().data.list[rowIndex]};
						cellvalue = (cellvalue=="0"?cellvalue:(cellvalue||""));
						param.cellvalue=cellvalue;
						if (col) {
							var fnReusult = fn.call(g, param);
							if (fnReusult === false) 
								return;
						}
				}
			}
				
		}
	},
	_getSrc:function(e){
		if(!e){return {};}
		var g=this,src=e.srcElement||e.target,cell=null,row=null,table=null,o = src,rowIndex=-1;
		while(o.parentNode && o!=g.element){
			if(baidu.dom.hasClass(o,"gridcell")){cell=o;}
			if(o.className.indexOf("gridrow")!=-1){
				row=o;
				rowIndex=o.getAttribute("rowindex");
				if(typeof(rowIndex)!="undefined") rowIndex = parseInt(rowIndex,10);
			}
			if(o.className.indexOf("gridtable")!=-1){table=o;}
			if(cell && row  && table ){break;}
			o=o.parentNode;
		}
		return {cell:cell,row:row,table:table,rowIndex:rowIndex,src:src};
	},
	_getCol:function(colIndex){
		if(!this._originColumns) {
			this._originColumns  = baidu.object.clone(this.columns);
		}
		colIndex=colIndex.toString();
		if(colIndex.indexOf("-")==-1){
			return this.columns[colIndex];
		}else{
			return this.columns[colIndex.substr(0,colIndex.indexOf("-"))].columns[colIndex.substr(colIndex.indexOf("-")+1)];
		}
	},
	/**
	 * 绑定事件,统一使用冒泡事件
	 */
	_bindEvents:function(){
		var g = this;
		
		function gbodyClick(e,data){
			var s=g._getSrc(e);
			if(s.cell){//cell clicked
				//columnIndex 在table中是第几列 从0开始
				//refIndex 在grid.optoins.columns中的下标
				var columnIndex =-1,siblings=s.cell.parentNode.childNodes,refIndex=-1;
				for(var i=0,l=siblings.length;i<l;i++){
					if(siblings[i]==s.cell) {columnIndex=i;break;}
				}
				refIndex= parseInt(s.table.rows[0].cells[columnIndex].getAttribute("refcol"),10);
				var data ={columnIndex:columnIndex,refIndex:refIndex,rowIndex:s.rowIndex,ref:s,column:g._getCol(refIndex)};
				
				//约定先dispatchEvent然后执行onxxx选项事件
				g.dispatchEvent("cellclick",data);
				if(typeof(g.onCellClick)=="function") g.onCellClick(e,data);
				
			}
			if(s.row){//row clicked
				var data = {rowIndex:s.rowIndex,row:g.data.data.list[s.rowIndex],ref:s};
				g.dispatchEvent("rowclick",data);
				if(typeof(g.onRowClick)=="function") g.onRowClick(e,data);
				if(g.clickToSelect!==false)g.toggleSelectRow(s.rowIndex,e);
				g._webkit();
			}
			
		}
		baidu.event.on(g.ref.gbody,"click",gbodyClick);
		
		function gbodyDblClick(e,data){
			var s=g._getSrc(e);
			if(s.row){//row double clicked
				var data = {rowIndex:s.rowIndex,row:g.data.data.list[s.rowIndex],ref:s};
				g.dispatchEvent("dblrowclick",data);
				if(typeof(g.onRowDblClick)=="function") g.onRowDblClick(e,data);
			}
			
		}
		baidu.event.on(g.ref.gbody,"dblclick",gbodyDblClick);
		
		function gbodyHover(e){
			var s  = g._getSrc(e);
			if(s.row){
				gbodyOut();
				baidu.array.each(baidu.dom.query("[rowindex="+s.rowIndex+"]",g.ref.gbody),function(row){
					baidu.dom.addClass(row,"hover");
				});
				g.highLightedRow=s.rowIndex;
			}
		}
		function gbodyOut(){
			baidu.array.each(baidu.dom.query(".hover",g.ref.gbody),function(row){
				baidu.dom.removeClass(row,"hover");
			});
			g.highLightedRow=-1;
		}
		if (g.hoverhighlight!==false) {
			baidu.event.on(g.ref.gbody, "mousemove", gbodyHover);
			baidu.event.on(g.ref.gbody, "mouseout", gbodyOut);
		}
		
		function headerClick(e,data){
			var s=g._getSrc(e),cell = s.cell;
			if(cell){
				if (baidu.dom.hasClass(cell,"header-sortable-col") && baidu.dom.hasClass(s.src,"headercoltext") ) {//点击字段排序
					var refcol = cell.getAttribute("refcol"), col = g._getCol(refcol), field = col.field, 
					isdesc = (baidu.dom.query(".sort-desc", cell).length > 0 || baidu.dom.query(".sorter", cell).length == 0),//当前状态是否是降序
 					order = isdesc ? "asc" : "desc";
					g.reOrder(refcol,order,e);
				}
				g.dispatchEvent("headercellclick",{ref:s});
			}
		}
		baidu.event.on(g.ref.gheader,"click",headerClick);
		
		//column resizable
		var headerLeft= baidu.dom.getPosition(g.ref.gheader).left,isResizing=false,cell=null,l=0;
		function resizing(e){
			if(isResizing){
				var x = baidu.event.getPageX(e);
				g.ref.resizerproxy.style.left=(x-headerLeft)+"px";
			}
		}
		function stopResizing(e){
			if (isResizing) {
				var x = baidu.event.getPageX(e),l = baidu.dom.getPosition(cell).left,colWidth = (x-l),
					refcol=cell.getAttribute("refcol"),
					column=g._getCol(refcol),
					bodycell= baidu.dom.query("[refcol="+refcol+"]",g.ref.gbody),
					t= baidu.dom.query(".gridtable",g.ref.gbody),
					offset = g._getCol(refcol).width-colWidth;
				
				cell.style.width= colWidth+"px";
				
				baidu.array.each(baidu.dom.query("[refcol="+refcol+"]",g.ref.gheader),function(c){
					c.style.width=colWidth+"px";
				});
				
				column.width=colWidth;
				
				baidu.array.each(bodycell,function(cell){
					cell.style.width=colWidth+"px";
				});
				baidu.array.each(t,function(table){
					var tWidth = parseInt(baidu.dom.getStyle(table, "width"), 10);
					table.style.width = (tWidth - offset) + "px";
				});
				g.ref.resizerproxy.style.display="none";
				g._sizeScroller();
				g.dispatchEvent("columnresize",{column:column});
			}
			isResizing=false;
			cell==null;
			g._webkit(refcol!=g.fixColIndex);
		}
		function startResize(e){
			var s = g._getSrc(e),src= s.src,e=baidu.event.get(e);
			headerLeft= baidu.dom.getPosition(g.ref.gheader).left;
			if (baidu.dom.hasClass(src,"header-col-resizer")) {
				cell = s.cell;
				l = baidu.dom.getPosition(cell).left;
				var x = baidu.event.getPageX(e);
				g.ref.resizerproxy.style.left = (x - headerLeft) + "px";
				g.ref.resizerproxy.style.height = g.element.clientHeight+"px";
				g.ref.resizerproxy.style.display = "block";
				isResizing = true;
				g.clearSelection();
				e.stopPropagation();
			}
		}
		baidu.event.on(g.ref.gheader,"mousedown",startResize);
		baidu.event.on(g.ref.gheader,"mousemove",resizing);
		baidu.event.on(g.element,"mouseup",stopResizing);
		
		
	},
	tplFrame:'#{loadmask}#{docktop}<div class="tangramgridcontainer"><div class="gridheader" id="#{element}-gridheader"><table border="0" cellspacing="0" cellpadding="0" class="gridtable"><tbody>#{hcols}</tbody></table></div><div class="gridbody"  id="#{element}-gridbody"><div class="grid-tablecontainer"></div></div><div class="grid-yscroller"><div class="grid-y-strecher" ></div></div><div class="grid-xscroller"><div class="grid-x-strecher"></div></div><div class="grid-rb-corner"></div><div class="grid-resizer-proxy"></div></div>#{dockbottom}',
	tplPager:"<div class='tgpager'><span class='tgpager-info'><span class='tgpager-from'>#{from}</span>-<span class='tgpager-to'>#{to}</span> of <span class='tgpager-total'>#{total}</span></span><select class='tgpager-pagenumbers'>#{pnoptions}</select><button class='tgpager-first' disabled='disabled'>|◄</button><button class='tgpager-prev'  disabled='disabled'>◄</button><span class='tgpager-sep'></span><input type='text' class='tgpager-curPage' value='#{curPage}' />/<span class='tgpager-pages'>#{pages}</span><span class='tgpager-sep'></span><button class='tgpager-next'  disabled='disabled'>►</button><button class='tgpager-last'  disabled='disabled'>►|</button>#{tools}</div>",
	/**
	 * 初始化grid
	 * @param {Object} target
	 */
	render:function(target){
		if(!baidu.g(target)){return ;}
		this.fixColIndex=-1;// the index of  column  to fix width
		var g = this,
		frameHtml=baidu.format(g.tplFrame,{
			element:g.element.id,
			dockbottom:(function(){
				if(g.page===false){ return "";}//不分页
				if(g.page===true) g.page={};//分页&默认配置
				if (baidu.lang.isString(g.page)) {//自定义分页
					g._useDefaultPager = false;
					return g.page;
				}else {
					g._useDefaultPager = true;
					g.page = baidu.object.merge(g.page || {}, {
						perPage: 10,
						pagenumbers: [10, 20, 50, 100],
						curPage: 1,
						pages: 0,
						from: 0,
						to: 0,
						total: 0
					});
					return baidu.format(g.tplPager, baidu.object.extend(g.page, {
						pnoptions: (function(){
							var arr = [];
							baidu.array.each(g.page.pagenumbers, function(o){
								arr.push("<option value='" + o + "' " + (o == g.page.perPage ? " selected='selected' " : "") + ">" + o + "</option>");
							});
							return arr.join("");
						})()
					}));
				}
			})(),
			docktop:g.docktop||"",
			loadmask:'<div class="gridloadmask"></div><div class="gridloadmessge">'+(g.loadMessage||"正在加载...")+'</div>',
			hcols:(function(){
				var arr=["<tr class='gridrow'>"],grouped =false,arr2=["<tr class='gridrow'>"];
				for (i = 0, l = g.columns.length; i < l; i++) {
					if (g.columns[i].columns && g.columns[i].columns.length) {
						grouped = true;
						break;
					}
				}
				g.grouped = grouped;
				for(i=0,l=g.columns.length;i<l;i++){
					var w = isNaN(parseInt(g.columns[i].width,10))?"200px":(parseInt(g.columns[i].width,10)+"px"),col= g.columns[i];
					if(col.fix && (!col.columns)) g.fixColIndex=i;
					if(col.columns) w="auto";
					//没有指定宽度的列默认取200
					if(!col.width)col.width=200;
					
					var header= (col.header||"");
					var coltype=baidu.ui.Grid.ext.coltype[col.renderer||""];//读取扩展属性
					if(baidu.lang.isObject(coltype) && coltype){
						if(baidu.lang.isFunction(coltype.headerformat)){
							header= coltype.headerformat.call(g,header,col,i)||"";
						}
						if(baidu.lang.isFunction(coltype.init)){
							coltype.init.call(g,col);
						}
					}
					var sort =((g.orderBy==i && (!col.columns))?"<span class='sorter sort-"+g.order+"'>"+(g.order=="desc"?"▼":"▲")+"</span>":"");
					if(g.orderBy==i)g.orderBy=i;
					var resizer = (( (col.resizable!==false) && (!col.columns))?"<span class='header-col-resizer'></span>":"");
					var colspan = (col.columns?(" colspan='"+col.columns.length+"' "):"");
					arr.push('<td valign="middle" '+((grouped && (!col.columns) ) ?" rowspan='2' ":"")+colspan+'  class="headercol gridcell '+((col.sortable!==false && (!col.columns))?" header-sortable-col ":"")+((grouped && (!col.columns))?" header-rowspan2 ":"")+(col.columns?" header-colspan ":"")+'" unselectable="on" onselectstart="return false;" refcol="'+i+'"  style="width:'+w+';'+(col.hide?"display:none;":"")+'" ><div class="header-col"><span class="headercoltext">'+header+'</span>'+sort+resizer+'</div></td>');
					if(baidu.lang.isArray(col.columns)){
						for(var j = 0,ll=col.columns.length;j<ll;j++){
							var subcol = col.columns[j];
							if(!subcol.width)subcol.width=200;
							var w = isNaN(parseInt(subcol.width,10))?"200px":(parseInt(subcol.width,10)+"px");
							
							var header= (subcol.header||"");
							var coltype=baidu.ui.Grid.ext.coltype[subcol.renderer||""];//读取扩展属性
							if(baidu.lang.isObject(coltype) && coltype){
								if(baidu.lang.isFunction(coltype.headerformat)){
									header= coltype.headerformat.call(g,header,subcol,i)||"";
								}
								if(baidu.lang.isFunction(coltype.init)){
									coltype.init.call(g,subcol);
								}
							}
							var resizer = ((subcol.resizable!==false )?"<span class='header-col-resizer'></span>":"");
							var sort =((g.orderBy==(i+"-"+j))?"<span class='sorter sort-"+g.order+"'>"+(g.order=="desc"?"▼":"▲")+"</span>":"");
							if(g.orderBy==(i+"-"+j))g.orderBy=(i+"-"+j);
							arr2.push('<td   class="headercol gridcell '+( (subcol.sortable!==false)?" header-sortable-col ":"")+'" unselectable="on" onselectstart="return false;" refcol="'+(i+"-"+j)+'"  style="width:'+w+';'+(subcol.hide?"display:none;":"")+'" ><div class="header-col"><span class="headercoltext">'+header+'</span>'+sort+resizer+'</div></td>');
							
						}
					}
				}
				arr.push("</tr>");
				arr2.push("</tr>");
				return arr.join("")+(grouped?arr2.join(""):"");
			})()
		});
		g._clearBindings();
		baidu.dom.addClass(g.element,"tangramgrid");
		g.renderMain(target);
		g.element.innerHTML= frameHtml;
		//cache grid's element references
		g.ref={};
		g.selectedRows=[];//the row index of selected rows
		g.highLightedRow=-1;//current highlighted row index
		g.grouped=false;
		g.ref.gheader= baidu.g(this.element.id+"-gridheader");
		g.ref.gbody= baidu.g(this.element.id+"-gridbody");
		g.ref.ghcells  = baidu.dom.query("table tr:eq(0) td",g.ref.gheader);
		g.ref.yscroller=baidu.dom.query(".grid-yscroller",g.element)[0];
		g.ref.ystrecher=baidu.dom.query(".grid-y-strecher",g.element)[0];
		g.ref.xscroller=baidu.dom.query(".grid-xscroller",g.element)[0];
		g.ref.xstrecher=baidu.dom.query(".grid-x-strecher",g.element)[0];
		g.ref.rbcorner=baidu.dom.query(".grid-rb-corner",g.element)[0];
		g.ref.resizerproxy=baidu.dom.query(".grid-resizer-proxy",g.element)[0];
		
		//g.page
		if(g.page && g._useDefaultPager){
			g.ref.pager={
				pagenumbers:baidu.dom.query(".tgpager-pagenumbers",g.element)[0],
				first:baidu.dom.query(".tgpager-first",g.element)[0],
				prev:baidu.dom.query(".tgpager-prev",g.element)[0],
				curPage:baidu.dom.query(".tgpager-curPage",g.element)[0],
				pages:baidu.dom.query(".tgpager-pages",g.element)[0],
				next:baidu.dom.query(".tgpager-next",g.element)[0],
				last:baidu.dom.query(".tgpager-last",g.element)[0],
				from:baidu.dom.query(".tgpager-from",g.element)[0],
				to:baidu.dom.query(".tgpager-to",g.element)[0],
				total:baidu.dom.query(".tgpager-total",g.element)[0]
			};
			//bind pager events
			var p = g.ref.pager,h =baidu.fn.bind(g._handlePager,g);//bind saved me !
			baidu.event.on(p.pagenumbers, "change", h);
			baidu.event.on(p.first, "click", h);
			baidu.event.on(p.prev, "click", h);
			baidu.event.on(p.curPage, "keydown", h);
			baidu.event.on(p.curPage, "blur",h);
			baidu.event.on(p.next, "click",h);
			baidu.event.on(p.last, "click",h);
		}
		
		this._fixColWidth();
		this._setHeight(g.height);
		this._bindScroller();
		this._bindEvents();
		//notify I am initialized 
		this.dispatchEvent("initialized",{});
		
		//load data if exist
		if(this.data) this.loadData(this.getData());
	},
	_handlePager:function(e){
		var g= this,p = g.ref.pager,e=baidu.event.get(e),
		perPage=p.pagenumbers.options[p.pagenumbers.selectedIndex].value,
		curPage=g.page.curPage,s = e.target,prevent=false;
		if(s==p.first || s==p.pagenumbers){
			curPage=1;
		}
		if(s==p.prev){
			curPage=Math.max(1,curPage-1);
		}
		if(s==p.next){
			curPage=Math.min(g.page.pages,curPage+1);
		}
		if(s==p.last){
			curPage=g.page.pages;
		}
		if(s==p.curPage){
			var v = p.curPage.value;
			if(e.type=="keydown"){
				var keyCode = baidu.event.getKeyCode(e);
				if(keyCode==13){
					if (isNaN(v)) {
						prevent=true;
					}else{
						curPage  = ~~v;
						if (curPage < 1) {
							curPage = 1;
							prevent=true;
						}
						if (curPage > g.page.pages) {
							curPage = g.page.pages;
							prevent=true;
						}
					}
					p.curPage.value=curPage;
				}else{
					return true;
				}
			}
			if(e.type=="blur"){
				if (isNaN(v)) {
						p.curPage.value=curPage;
						prevent=true;
					}else{
						curPage  = ~~v;
					}
			}
		}
		if(prevent){
			e.preventDefault();
			return false;
		}else{
			g.page.curPage  =curPage;
			g.page.perPage=perPage;
			g.request({
				curPage:curPage,
				perPage:perPage
			});
		}
	},
	clearSelection:function(){
		if (window.getSelection) {
		  	if (window.getSelection().empty) {  // Chrome
		    	window.getSelection().empty();
		  	} else if (window.getSelection().removeAllRanges) {  // Firefox
		    	window.getSelection().removeAllRanges();
		  	}
		} else if (document.selection) {  // IE?
		  	document.selection.empty();
		}
	},
	/**
	 * 清除事件绑定，删除ref引用，防止内存泄漏
	 * 由于grid内的DOM经常读写，事件绑定后没有解除绑定。_clearBindings专用于回收该部分内存
	 */
	_clearBindings:function(){
		var g = this;
		if(!g.ref) return ;
		var events=["click","dblclick","mousemove","mousedown","change","keydown","blur","dommousescroll","mouseup","mouseout","scroll"];
		g.ref.element = g.element;
		for(var refkey in g.ref){
			var obj = g.ref[refkey];
			if(obj.nodeType){
				baidu.array.each(events,function(eventName){
					baidu.event.un(obj,eventName);
				});
			}else{
				for (var k  in obj) {
					if(obj[k].nodeType){//eg: g.ref.pager.next
						baidu.array.each(events,function(eventName){
							baidu.event.un(obj[k],eventName);
						});
					}
				}
			}
		}
		delete g.ref;
	},
	dispose : function(){
		baidu.dom.remove(g.getBody());
		baidu.lang.Class.prototype.dispose.call(g);
	}
});
/*baidu.ui.Grid扩展*/
baidu.ui.Grid.ext={coltype:{}};
baidu.ui.Grid.ext.coltype.checkbox={
	headerformat:function (header,colopt,colIndex){
		//this为grid对象
		colopt.resizable=false;
		colopt.sortable=false;
		return (this.selectMode==2)?"<input type='checkbox' class='tg-cball' />":"&nbsp;";
	},
	format:function(data){
		if(!this.selectMode){return "";}
		//{cellvalue:celltext,colopts:col,rowdata:row,rowIndex:i}
		var f = data.colopts.field||"",v = data.rowdata[f],v= (v=="0"?v:(v||""));
		//是否禁用checkbox
		var d=((typeof(data.colopts.disableBy)=="function") && data.colopts.disableBy(data)===false)?" disabled='disabled' ":"";
		return "<input type='checkbox' class='tg-cb' name='"+f+"' value='"+v+"' "+(data.select?" checked='checked' ":"")+" "+d+" />";
	},
	init:function(){//初始话行为(在Grid初始化时执行)
		var g= this;
		g.addEventListener("select",function(e,data){
			var cbs = baidu.dom.query("[rowindex="+data.rowIndex+"] .tg-cb",g.ref.gbody);
			baidu.array.each(cbs,function(cb){
				cb.checked=true;
			});
		});
		g.addEventListener("unselect",function(e,data){
			var cbs = baidu.dom.query("[rowindex="+data.rowIndex+"] .tg-cb",g.ref.gbody);
			baidu.array.each(cbs,function(cb){
				cb.checked=false;
			});
		});
		g.addEventListener("headercellclick",function(e,data){
			var g=this,s = data.ref.src;
			if(s && baidu.dom.hasClass(s,"tg-cball")){
				var rows = baidu.dom.query("[rowindex]",g.ref.gbody);
				if(s.checked){//check all
					baidu.array.each(rows,function(row){
						var rowIndex = parseInt(row.getAttribute("rowindex"),10);
						g.selectRow(rowIndex,e);
					});
					
				}else{//uncheckall
					baidu.array.each(rows,function(row){
						var rowIndex = parseInt(row.getAttribute("rowindex"),10);
						g.unSelectRow(rowIndex,e);
					});
				}
			}
		});
		if (g.clickToSelect===false) {
			g.addEventListener("cellclick", function(e, data){
				var g = this,e=baidu.event.get(e);
				if (baidu.dom.hasClass(data.ref.src, "tg-cb")) {//checkbox is clicked
					if (data.ref.row) {
						g.toggleSelectRow(data.ref.row.getAttribute("rowindex"));
					}
					e.stopPropagation();
				}
			});
		}
	}
};