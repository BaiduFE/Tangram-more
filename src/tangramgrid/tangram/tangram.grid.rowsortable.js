/*!
 * Grid row sortable addon
 * add config option rowsortable,if rowsortable=true grid rows are sortable
 * add a method serializeRows return current rows data in grid
 * add events:"rowsortable-dragstart","rowsortable-draggging","rowsortable-dragend"
 * @author yanghengfeng
 */
baidu.ui.Grid.register(function(g){
	if(!g.rowsortable) return ;
	//加载时间前解除事件绑定
	g.addEventListener("beforeload",function(e,data){
		var table = baidu.dom.query(".gridtable",g.ref.gbody);
		if(table.length){
			table= table[0];
			baidu.event.un(table,"mousedown");
		}
	});
	g.addEventListener("afterload",function(e,data){
		var y =0,table = baidu.dom.query(".gridtable",g.ref.gbody)[0],_isdragging=false,_y=0,_row=null;
		
		function dragstart(e){
			var s = g._getSrc(e);
			g._rs={y:e.clientY,row:s.row,table:table};
			baidu.dom.addClass(s.row,"row-dragging");
			g.dispatchEvent("rowsortable-dragstart");
		}
		baidu.event.on(table,"mousedown",dragstart);
		
		if(!g._rs_draggging_bind) g._rs_draggging_bind= baidu.fn.bind(g._rs_draggging,g);
		if(!g._rs_dragend_bind) g._rs_dragend_bind= baidu.fn.bind(g._rs_dragend,g);
		
		baidu.event.un(document,"mousemove",g._rs_draggging_bind);
		baidu.event.on(document,"mousemove",g._rs_draggging_bind);
		baidu.event.un(document,"mouseup",g._rs_dragend_bind);
		baidu.event.on(document,"mouseup",g._rs_dragend_bind);
		
	});
});
baidu.ui.Grid.extend({
	/**
	 * 获取当前数据排序数组
	 * @return {Array} 格式形如 [｛当前第一行数据,rowIndex:原行序号},｛当前第二行数据,rowIndex:原行序号}...]
	 */
	serializeRows:function(){
		var g = this,rows= baidu.dom.query("[rowindex]",g.ref.gbody),result=[];
		baidu.array.each(rows,function(row){
			var rowIndex = row.getAttribute("rowindex");
			result.push(g.data.data.list[rowIndex]);
			result[result.length-1].rowIndex = rowIndex;
		});
		return result;
	},
	/**
	 * 获取当前选中的行排序数组
	 * @return {Array} 格式形如 [｛当前选中第一行数据,rowIndex:原行序号},｛当前选中第二行数据,rowIndex:原行序号}...]
	 */
	getSerializedSelections:function(){
		var g = this,rows= baidu.dom.query("[rowindex]",g.ref.gbody),result=[];
		baidu.array.each(rows,function(row){
			var rowIndex = row.getAttribute("rowindex");
			if(baidu.array.indexOf(g.selectedRows,parseInt(rowIndex,10))!=-1){
				result.push(g.data.data.list[rowIndex]);
				result[result.length-1].rowIndex = rowIndex;
			}
		});
		return result;
	},
	_rs_draggging:function(e){
		var g = this;
		if(g._rs){
			var y = e.clientY,x= e.clientX,down=y>g._rs.y,row= document.elementFromPoint(x,y);
			if (row && baidu.dom.contains(g._rs.table,row)) {
				while (!baidu.dom.hasClass(row, "gridrow") && row!=g._rs.table) {
					row = row.parentNode;
				}
			}
			if(null==row || (!baidu.dom.hasClass(row, "gridrow"))){
				dragend();
				return ;
			}
			g.clearSelection();
			if(row!=g._rs.row){
				row.parentNode.insertBefore(g._rs.row, (down ? row.nextSibling : row));
			}
			g._rs.y=y;
			g.dispatchEvent("rowsortable-draggging");
		}
	},
	_rs_dragend:function(e){
		var g = this;
		if(g._rs){
			if(g._rs.row)baidu.dom.removeClass(g._rs.row,"row-dragging");
			delete g._rs;
			g.dispatchEvent("rowsortable-dragend");
			g._webkit();
		}
	}
});
