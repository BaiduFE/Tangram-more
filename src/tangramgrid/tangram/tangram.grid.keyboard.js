/**
 * @author yanghengfeng
 * grid key event addon
 */
baidu.ui.Grid.register(function(g){
	if(!g.keyboard) return ;
	//↓ 40 ↑38 ←37 → 39  PgDn 34 PgUp 33 tab 9
	if(!g.keysrc) g.keysrc= document;
	//focus
	baidu.on(g.element,"click",function(e){
		e= baidu.event.get(e);
		if(!baidu.dom.hasClass(g.element,"tangram-focused")){
			g.focus();
			e.stopPropagation();
		}
	});
	//blur
	baidu.on(document.body,"click",function(e){
		var s = baidu.event.getTarget(e);
		if (!baidu.dom.contains(g.element, s)) {
			g.blur();
		}
	});
	//keyboard handler
	baidu.on(g.keysrc,"keydown",function(e){
		e = baidu.event.get(e);
		var handled= false;
		if(!baidu.dom.hasClass(g.element,"tangram-focused")){return true;}
		
		//↓ 40 ↑38 单选时触发行点击
		if(e.keyCode==40 && g.selectMode==1){
			var rowIndex=-1,nextrow=null;
			if(g.selectedRows.length==0){
				rowIndex = g.getData().data.list.length>0?0:-1;
			}else{
				var selrow = baidu.dom.query(".gridrow[rowindex="+g.selectedRows[0]+"]",g.ref.gbody)[0];
				nextrow=selrow.nextSibling;
				while(nextrow &&  ( (!nextrow.getAttribute("rowindex")) || (nextrow.style.display=="none") || (!baidu.dom.hasClass(nextrow,"gridrow"))) ){
					nextrow= nextrow.nextSibling;
				}
				nextrow && (rowIndex = parseInt(nextrow.getAttribute("rowindex"),10));
				
			}
			if(rowIndex!=-1){
				g.selectRow(rowIndex);
				if(nextrow) {
					nextrow.scrollIntoView();
					g.ref.yscroller.scrollTop=g.ref.gbody.scrollTop;
				}
				handled=true;
			}
		}
		if(e.keyCode==38 && g.selectMode==1){
			var rowIndex=-1,prevrow=null;
			if(g.selectedRows.length==0){
				rowIndex = g.getData().data.list.length>0?0:-1;
			}else{
				var selrow = baidu.dom.query(".gridrow[rowindex="+g.selectedRows[0]+"]",g.ref.gbody)[0];
				prevrow=selrow.previousSibling;
				while(prevrow && ( (!prevrow.getAttribute("rowindex")) || (prevrow.style.display=="none")  ||  (!baidu.dom.hasClass(prevrow,"gridrow")) ) ){
					prevrow= prevrow.previousSibling;
				}
				prevrow && (rowIndex = parseInt(prevrow.getAttribute("rowindex"),10));
			}
			if(rowIndex!=-1){
				g.selectRow(rowIndex);
				if (prevrow) {
					prevrow.scrollIntoView();
					g.ref.yscroller.scrollTop = g.ref.gbody.scrollTop;
				}
				handled=true;
			}
		}
		//<CR> 触发dblclick
		if(e.keyCode==13 && g.selectMode==1 && g.selectedRows.length>0){
			var selrow = baidu.dom.query(".gridrow[rowindex="+g.selectedRows[0]+"]",g.ref.gbody)[0];
			baidu.event.fire(selrow, "dblclick", {});
			handled=true;
		}
		// PgDn 34 PgUp 33 翻页 (非treegrid 可用 ←37 → 39 )
		if(e.keyCode==33 || ((!g.treeoption) && e.keyCode==37 )){
			if (!e.ctrlKey) {
				if (g.ref.pager && g.ref.pager.prev && (!g.ref.pager.prev.disabled)) {
					baidu.event.fire(g.ref.pager.prev, "click", {});
					handled=true;
				}
			}else{
				if (g.ref.pager && g.ref.pager.first && (!g.ref.pager.first.disabled)) {
					baidu.event.fire(g.ref.pager.first, "click", {});
					handled=true;
				}
				
			}
			
		}
		if(e.keyCode==34 || ((!g.treeoption) && e.keyCode==39 )){
			if (!e.ctrlKey) {
				if(g.ref.pager && g.ref.pager.next && (!g.ref.pager.next.disabled)){
					baidu.event.fire(g.ref.pager.next,"click",{});
					handled=true;
				}
			}else{
				if (g.ref.pager && g.ref.pager.last && (!g.ref.pager.last.disabled)) {
					baidu.event.fire(g.ref.pager.last, "click", {});
					handled=true;
				}
			}
		}
		//←37 → 39  TreeGrid节点收缩/展开
		if(e.keyCode==39 && g.treeoption && g.selectMode=="1" && g.selectedRows.length>0){
			var refidv=null,expander = baidu.dom.query("[rowindex="+g.selectedRows[0]+"] .expander[refidv]",g.ref.gbody);
			if(expander.length>0)refidv = expander[0].getAttribute("refidv");
			if (null != refidv) {
				g.expandNode(refidv);
				handled=true;
			}
			
		}
		if(e.keyCode==37 && g.treeoption && g.selectMode=="1" && g.selectedRows.length>0){
			var refidv=null,expander = baidu.dom.query("[rowindex="+g.selectedRows[0]+"] .expander[refidv]",g.ref.gbody);
			if(expander.length>0)refidv = expander[0].getAttribute("refidv");
			if (null != refidv) {
				g.unExpandNode(refidv);
				handled=true;
			}
			
		}
		//可编辑表格 单元格编辑  tab切换单元格
		if(e.keyCode==9){
			if(g.editMode==3){
				if (!e.shiftKey) {
					var nextcell = null, currentcell = null;
					g.cellIterator(function(c){
						if (c.row.style.display == "none" || (!c.column.editable)) {//skip hidden row  and uneditable cell
							return true;
						}
						if (null != currentcell) {
							nextcell = c.cell;
							return false;
						}
						if (baidu.dom.hasClass(c.cell, "editingcell"))  currentcell = c.cell;
						if (null == nextcell)  nextcell = c.cell;
					});
					if (null != nextcell) {
						baidu.event.fire(nextcell.childNodes[0], "click", {});
						handled = true;
					}
				}else{//shift+tab 
					var prevcell=null; currentcell=null;
					g.cellIterator(function(c){
						if (c.row.style.display == "none" || (!c.column.editable)) {//skip hidden row  and uneditable cell
							return true;
						}
						if (baidu.dom.hasClass(c.cell, "editingcell")) {
							return false;
						}
						prevcell = c.cell;
					});
					if (null != prevcell) {
						baidu.event.fire(prevcell.childNodes[0], "click", {});
						handled = true;
					}
				}
			}else{//tab to blur
				g.blur();
				handled=true;
			}
		}
		
		if(handled){
			e.preventDefault();
			e.stopPropagation();
		}
	});
});
baidu.ui.Grid.extend({
	focus:function(){
		baidu.dom.addClass(this.element,"tangram-focused");
		try{this.element.focus();}catch(e){}
	},
	blur:function(){
		baidu.dom.removeClass(this.element,"tangram-focused");
		try{this.element.blur();}catch(e){}
	}
});
