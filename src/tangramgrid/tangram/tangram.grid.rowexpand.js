/*!
 * Grid row expand addon
 * columns:[
			{
				field:'id',
				width:30,
				align:"center",
				renderer:"rowexpand",//列类型rowexpand
				title:"点击查看/收起详细信息",// +/-提示信息
				onExpand:function(param){
					//param: {expandedrow:expandedrow,expandedcell:expandedcell,data:cellclickdata}
					param.expandedcell.innerHTML=baidu.string.format("<div style='height:50px;padding:30px;'>机器#{name}详细信息</div>",this.getData().data.list[param.data.rowIndex]);
				},
				onUnExpand:function(param){
					//param: {expandedrow:expandedrow,expandedcell:expandedcell,data:cellclickdata}
					console.log("onunexpand");
				}
			},
			//...
 * @author yanghengfeng
 */
baidu.ui.Grid.ext.coltype.rowexpand={
	headerformat:function (header,colopt,colIndex){
		colopt.resizable=false;
		colopt.sortable=false;
		return "&nbsp;";
	},
	format:function(data){
		//{cellvalue:celltext,colopts:col,rowdata:row,rowIndex:i}
		var title =data.colopts.title?(" title="+data.colopts.title):"";
		return "<b class='grid-expand unexpanded'"+title+">＋</b>";
	},
	init:function(){
		var g=this;
		g.addEventListener("cellclick",function(e,data){
			if(baidu.dom.hasClass(data.ref.src,"grid-expand")){//点击+/-
				var row = data.ref.row,col= g._getCol(data.refIndex),expander=data.ref.src ;
				if(row.nextSibling && baidu.dom.hasClass(row.nextSibling,"grid-expandedrow")){//已经展开 收缩
					var expandedrow = row.nextSibling;
					if(baidu.lang.isFunction(col.onUnExpand)){
						col.onUnExpand.call(g,{expandedcell:expandedrow.childNodes[0],expandedrow:expandedrow,data:data});
					}
					expandedrow.parentNode.removeChild(expandedrow);
					expander.innerHTML="＋";
					expander.className="grid-expand";
					baidu.dom.removeClass(data.ref.cell,"grid-expandedcell");
					g.resize();
				}else{//展开
					var expandedrow = document.createElement("tr");
					expandedrow.className="grid-expandedrow";
					var expandedcell  = document.createElement("td");
					expandedcell.setAttribute("colspan",row.cells.length);
					//expandedcell.innerHTML="haha";//TODO
					if(baidu.lang.isFunction(col.onExpand)){
						col.onExpand.call(g,{expandedcell:expandedcell,expandedrow:expandedrow,data:data});
					}
					expandedrow.appendChild(expandedcell);
					if (row.nextSibling) {
						row.parentNode.insertBefore(expandedrow, row.nextSibling);
					}else{
						row.parentNode.appendChild(expandedrow);
					}
					expander.innerHTML="－";
					expander.className="grid-expand expanded";
					baidu.dom.addClass(data.ref.cell,"grid-expandedcell");
					g.resize();
				}
			}
		});
	}
};