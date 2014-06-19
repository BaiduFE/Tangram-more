/*!
 * Tree Grid  addon
 * @author yanghengfeng
 */
baidu.ui.Grid.register(function(g){
	g.addEventListener("beforeload",function(griddata){
		var list = griddata.data.list,treelist=[],expandNodes=[];
		if (g.treeoption) {
			g.treedata = {root:{children:[],rendered:true,expand:true,deep:0}};//一级节点默认展开
			g._originlist = list.slice();//copy list as _originlist
			//解析树形数据：http://www.blogjava.net/Hafeyang/archive/2011/01/13/how_to_parse_flat_tree_data_to_hierarchy.html
			var o = g.treeoption,d= g.treedata;
			for (var i = 0, l = list.length; i < l; i++) {
				var row = list[i],idv=row[o.idfield],parentv=row[o.parentfield];
				if (!parentv) {
					d.root.children.push(i);
				}else {
					if (!d[parentv]) {//父节点不存在，新建父节点
						d[parentv] = {children: [],rendered: false,expand: false};
					}
					d[parentv].children.push(i);
				}
				if(!d[idv]){
					d[idv]={children: [],rendered: false,expand: false,rowIndex:i};
				}else{
					d[idv].rowIndex=i;
				}
				d[idv].parent=parentv;
				//expandBy
				if(typeof(o.treecol.expandBy)=="function" && o.treecol.expandBy.call(g,{cellvalue:row[o.treecol.field],rowdata:row})===true){
					d[idv].expand=true;
					expandNodes.push(idv);
				}
			}
			//节点展开，父节点也需要展开
			for (var i = 0, l = expandNodes.length; i < l; i++) {
				var n = expandNodes[i],c=n;
				while(c){
					d[c].expand=true;
					c= d[c].parent;
				}
			}
			function traversal(node){
				if(typeof(node.rowIndex)!="undefined"){
					treelist.push(g._originlist[node.rowIndex]);
				}
				if (node.expand) {
					for (var i = 0, l = node.children.length; i < l; i++) {
						var subNodeRowIndex = node.children[i], subNodeRow = g._originlist[subNodeRowIndex], subNode = d[subNodeRow[o.idfield]];
						traversal(subNode);
					}
					node.rendered = true;//rendered:子节点是否都呈现
				}
			}
			traversal(d.root);
			griddata.data.list = treelist;
			
		}
	});
});
baidu.ui.Grid.extend({
	/**
	 * 获取原始数据行
	 */
	getOriginList:function(){
		return this.getData().data._originlist;
	},
	/**
	 * 获取节点的深度
	 * @param {Object} idvalue id字段值
	 */
	getNodeDeep:function(idvalue){
		var g =this,d= g.treedata,deep=0,c=idvalue;
		if(!d[idvalue]){return deep;}
		if (typeof(d[idvalue].deep) == "undefined") {
			while (c) {
				deep++;
				c = d[c].parent;
			}
			d[idvalue].deep=deep; //cache
		}
		return d[idvalue].deep;
	},
	/**
	 * 展开/收缩节点
	 * @param {Object} idvalue id字段值
	 */
	toggleNode:function(idvalue){
		var g= this,d= g.treedata;
		if(d[idvalue].expand){
			g.unExpandNode(idvalue);
		}else{
			g.expandNode(idvalue);
		}
	},
	/**
	 * 呈现节点未呈现的子节点，默认的子节点处于性能考虑不呈现。确保该节点已经呈现
	 * @param {Object} idvalue 节点的id字段值
	 * @return 如果该节点已经呈现所有的子节点，返回该节点的rowIndex,否则返回该节点的最后一个子节点的rowIndex
	 */
	_renderChildren:function(idvalue){
		var g= this,d= g.treedata,subNodes= d[idvalue].children;
		if (!d[idvalue].expand) {
			if (!d[idvalue].rendered) {//render sub rows/nodes
				var row=baidu.dom.query("table:eq(0) .gridrow:has([refidv=" + idvalue + "])", g.ref.gbody),
					 rowIndex = (row.length>0 && row[0].nextSibling)?parseInt(row[0].nextSibling.getAttribute("rowindex")):undefined;
				//if(rowIndex==-1) return ;
				for (var ni = 0, nl = subNodes.length; ni < nl; ni++) {
					var rowdata = g._originlist[subNodes[ni]];
					rowIndex = g.addDOMRow(rowdata, rowIndex);
				}
				d[idvalue].rendered = true;
			}
			//change expander status
			var expanders = baidu.dom.query(".expander[refidv=" + idvalue + "]", g.ref.gbody);
			baidu.array.each(expanders, function(expander){
				baidu.dom.addClass(expander, "expanded");
				expander.innerHTML = "－";
			});
			d[idvalue].expand = true;
		}
		return rowIndex;
	},
	/**
	 * 展开节点
	 * @param {Object} idvalue id字段值
	 * @param {Object} recursive 是否展开所有的子节点,默认为false
	 */
	expandNode:function(idvalue,recursive){
		var g= this,d= g.treedata,subNodes= d[idvalue].children;
		//rowIndex= parseInt(baidu.dom.query("table:eq(0) .gridrow:has([refidv="+idvalue+"])",g.ref.gbody)[0].getAttribute("rowindex"));
		if(!d[idvalue]) return false;
		//可能节点的父节点还没有展开，所以先展开父节点
		var c=idvalue,nodesToExpand=[];
		while(c){
			c= d[c].parent;
			if(c && d[c] && (!d[c].expand)){
				nodesToExpand.unshift(c);
			}
		}
		for(var i=0,l=nodesToExpand.length;i<l;i++){
			g.expandNode(nodesToExpand[i]);
		}
		
		g._renderChildren(idvalue);//呈现当前节点的子节点 
		//show rows/nodes
		for (var ni = 0, nl = subNodes.length; ni < nl; ni++) {
			var rowdata = g._originlist[subNodes[ni]],rowIdValue = rowdata[g.treeoption.idfield];
			var rows = baidu.dom.query(".gridrow:has([refidv="+rowIdValue+"])",g.ref.gbody);
			baidu.array.each(rows,function(r){
				baidu.dom.show(r);
			});
			if(recursive){
				//递归展现所有子节点
				g.expandNode(rowIdValue,true);
			}
		}
		
		g.resize();
	},
	/**
	 * 收缩节点
	 * @param {Object} idvalue id字段值
	 */
	unExpandNode:function(idvalue){
		var g= this,d= g.treedata,subNodes= d[idvalue].children;
		if(!d[idvalue]) return false;
		//change expander status
		var expanders= baidu.dom.query(".expander[refidv="+idvalue+"]",g.ref.gbody);
		baidu.array.each(expanders,function(expander){
			baidu.dom.removeClass(expander,"expanded");
			expander.innerHTML="＋";
		});
		d[idvalue].expand=false;
		for (var ni = 0, nl = subNodes.length; ni < nl; ni++) {
			var subIdValue =g._originlist[subNodes[ni]][g.treeoption.idfield];
			var rows = baidu.dom.query(".gridrow:has([refidv="+subIdValue+"])",g.ref.gbody);
			baidu.array.each(rows,function(r){
				baidu.dom.hide(r);
			});
			g.unExpandNode(subIdValue);
		}
	},
	/**
	 * 添加节点
	 * @param {Object|Array} rows 如果是Object ，当作添加数据，如果是数组，视为节点数据数组,如果是节点数据，要求数据按照深度遍历结果排序(保证父节点出现子节点前)
	 */
	addNode:function(nodes){
		var g = this,d= g.treedata,o= g.treeoption;
		if(baidu.lang.isArray(nodes)){
			for(var i=0,l=nodes.length;i<l;i++){
				g.addNode(nodes[i]);
			}
		}else{//add single node
			var parentIdValue  =nodes[o.parentfield],idValue =  nodes[o.idfield],parent = d[parentIdValue],olist = g._originlist;
			if(!parent) return false;
			g.expandNode(parentIdValue);//展开节点
			var newOriginRowIndex = olist.length;
			olist.push(nodes);
			parent.children.push(newOriginRowIndex);
			d[idValue]={children: [],rendered: false,expand: false,rowIndex:newOriginRowIndex,parent:parentIdValue};
			
			var pp=d[parent.parent||"root"],
				row =baidu.dom.query("table:eq(0) .gridrow:has([refidv="+parentIdValue+"])",g.ref.gbody)[0],
				rowIndex = null;
			if(row.nextSibling){
				rowIndex= parseInt(row.nextSibling.getAttribute("rowindex"),10);
			}
			g.addDOMRow(nodes,rowIndex);
			//update parent row
			var parentrow= baidu.dom.query("table:eq(0) .gridrow:has([refidv="+parentIdValue+"])",g.ref.gbody),
				parentRowIndex = parentrow.length>0?parseInt(parentrow[0].getAttribute("rowindex")):-1;
			if(parentRowIndex!=-1) g.updateDOMRow(olist[parent.rowIndex],parentRowIndex);
			
		}
	},
	/**
	 * 删除节点,删除节点将递归删除所有的子节点
	 */
	deleteNode:function(idvalue){
		var g = this,d= g.treedata,o= g.treeoption,node = d[idvalue],olist = g._originlist;
		if(!node) return ;
		//删除子节点
		var l = node.children.length;
		while(l--){
			var subIdValue=olist[node.children[l]][o.idfield];
			g.deleteNode(subIdValue);
		}
		//删除单独节点
		var parentIdValue = node.parent||"root",parent= d[parentIdValue],nodeOriginRowIndex = node.rowIndex,
			row= baidu.dom.query("table:eq(0) .gridrow:has([refidv="+idvalue+"])",g.ref.gbody),
			rowIndex = row.length>0?parseInt(row[0].getAttribute("rowindex")):-1;
		if (rowIndex != -1) {
			g.deleteDOMRow(rowIndex);
		}
		baidu.array.remove(parent.children,nodeOriginRowIndex);//从父节点的子节点移除
		delete node;
		//更新父节点行显示 
		var parentRow=baidu.dom.query("table:eq(0) .gridrow:has([refidv="+parentIdValue+"])",g.ref.gbody),
			 parentRowIndex = parentRow.length>0?parseInt(parentRow[0].getAttribute("rowindex")):-1;
		if (parentRowIndex != -1) {
			g.updateDOMRow(olist[parent.rowIndex], parentRowIndex);
		}
	}
});
baidu.ui.Grid.ext.coltype.tree={
	headerformat:function (header,colopt,colIndex){
		return header;
	},
	format:function(data){
		var g=this,t = [],idv = data.rowdata[g.treeoption.idfield],node = g.treedata[idv],deep=g.getNodeDeep(idv);
		for(var i=0;i<deep;i++){
			t.push("<span class='spacing'></span>");
		}
		if(node.children.length>0){
			var expander="<span class=' expander "+(node.expand?"expaneded":"")+"' refidv='"+idv+"'>"+(node.expand?"－":"＋")+"</span>";
			t[t.length-1]= expander;
		}
		t.push("<span class='nodecontent'  refidv='"+idv+"'>"+data.cellvalue+"</span>");
		return t.join("");
	},
	init:function(col){
		var g = this;
		if (col.idfield && col.parentfield) {
			g.treeoption = {
				idfield: col.idfield,
				parentfield: col.parentfield,
				treecol:col
			}
		}
		g.addEventListener("cellclick",function(e,data){
			var s = data.ref.src;
			if(baidu.dom.hasClass(s,"expander")){//expander 
				g.toggleNode(s.getAttribute("refidv"));
			}
		});
	}
};