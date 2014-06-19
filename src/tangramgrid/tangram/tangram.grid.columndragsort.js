/**
 * @author yanghengfeng
 * column drag sortable addon
 */
baidu.ui.Grid.register(function(g){
	if(g.columndraggable){
		g.addEventListener("initialized",function(){
			if(!g.ref.columndragproxy){
				var columndragproxy = document.createElement("div");
				columndragproxy.className="columndragproxy";
				g.ref.gheader.appendChild(columndragproxy);
				columndragproxy.innerHTML="<span class='headercoltext'></span>";
				g.ref.columndragproxy= columndragproxy;
				
			}
			if(!g._cds_dragstart_bind) g._cds_dragstart_bind = baidu.fn.bind(g._cds_dragstart,g);
			baidu.event.on(g.ref.gheader,"mousedown",g._cds_dragstart_bind);
			
			if(!g._cds_dragging_bind) g._cds_dragging_bind = baidu.fn.bind(g._cds_dragging,g);
			baidu.event.on(g.ref.gheader,"mousemove",g._cds_dragging_bind);
			
			if(!g._cds_dragend_bind) g._cds_dragend_bind = baidu.fn.bind(g._cds_dragend,g);
			baidu.event.un(document.body,"mouseup",g._cds_dragend_bind);
			baidu.event.on(document.body,"mouseup",g._cds_dragend_bind);
			
		});
	}
});
baidu.ui.Grid.extend({
	//cds = column drag sortable
	_cds_dragstart:function(e){
		var g =this,s = g._getSrc(e),e= baidu.event.get(e);
		if(s.cell && (baidu.dom.hasClass(s.src,"headercol") || baidu.dom.hasClass(s.src,"header-col")) ){
			var colIndex =s.cell.getAttribute("refcol"),col= g._getCol(colIndex);
			g.ref.columndragproxy.innerHTML ="<span class='headercoltext'>"+(col.header||"")+"</span>";
			baidu.dom.setStyles(g.ref.columndragproxy,{
				"display":"block",
				top:(colIndex.indexOf("-")==-1?"-1px":((s.cell.offsetHeight-1)+"px")),
				left:(s.cell.offsetLeft-1+"px"),
				width:(s.cell.clientWidth+"px"),
				height:(s.cell.clientHeight+"px")
			});
			g._cd={dragx:e.clientX,dragy:e.clientY,originleft:s.cell.offsetLeft-1,colIndex:colIndex,originwidth:s.cell.clientWidth};
			e.stopPropagation();
			g.clearSelection();
		}
	},
	_cds_dragging:function(e){
		var g= this,cd=g._cd;
		if(cd){
			var newLeft =cd.originleft+(e.clientX-cd.dragx),zIndex =g.ref.columndragproxy.style.zIndex ;
			g.ref.columndragproxy.style.zIndex ="-1";
			var  elem = document.elementFromPoint(e.clientX,e.clientY),targetcell=elem;
			while((!baidu.dom.hasClass(targetcell,"headercol")) && targetcell!=g.element){
				targetcell=targetcell.parentNode;
			}
			g.ref.columndragproxy.style.zIndex =zIndex;
			var targetColIndex = targetcell.getAttribute("refcol");
			if(targetColIndex!=null){
				
				//列拖放规则：
				// 1.父列只能在父列之前排序
				// 2.子列可以在兄弟列中拖放，还可以拖放在父列相邻列的靠进该列侧(并直接转换成子列兄弟节点的拖放)
				// 所有列够不能拖放在自己周围 源单元格周围的| 不显示(不合法的拖放位置)
				
				//源单元格为父列，目标列不关心子列，将目标列设置为父列 这样第一条拖放规则就可以避免违反
				if(cd.colIndex.toString().indexOf("-")==-1 && targetColIndex.indexOf("-")!=-1){
					targetColIndex = targetColIndex.replace(/\-\d{1,}$/gi,"");
					targetcell = baidu.dom.query("[refcol="+targetColIndex+"]",g.ref.gheader)[0];
				}
				
				var targetCol= g._getCol(targetColIndex),
					l=baidu.dom.getPosition(targetcell).left,
					w=targetcell.offsetWidth,
					isleft = (e.clientX<=(l+w/2)),//当前鼠标位置是在目标单元格的左边，右边?
					proxyleft =isleft?(targetcell.offsetLeft-1):(targetcell.offsetLeft+targetcell.clientWidth),
					proxydisplay="block";//block表示合法的拖放位置，none为不合法的位置
				//源单元格为子列
				if(cd.colIndex.toString().indexOf("-")!=-1){
					//子列到父列(只有相邻才合法)
					var colIndex1=parseInt(cd.colIndex.replace(/\-\d{1,}$/gi,""),10),
						colIndex2= parseInt(cd.colIndex.replace(/^\d{1,}\-/gi,""),10),
						columnscount=(g._getCol(colIndex1).columns||[]).length,
						targetIsParent = targetColIndex.indexOf("-")==-1,//目标列是否为父列
						targetCol1= parseInt(targetColIndex.replace(/\-\d{1,}$/gi,""),10),
						targetCol2=parseInt(targetColIndex.replace(/^\d{1,}\-/gi,""),10),
						targetcolumnscount = (g._getCol(targetCol1).columns||[]).count,
						isrightsibing= (targetCol1==colIndex1+1) && (targetIsParent?isleft:(targetCol2=="0" && isleft )),//是否是右相邻
						isleftsibling = (targetCol1==colIndex1-1) && (targetIsParent?(!isleft):(targetCol2==targetcolumnscount-1 && (!isleft) ));//是否是左相邻
					if(colIndex1!=targetCol1 && (!isrightsibing) && (!isleftsibling) ){//非子列兄弟列 && 不相邻
						proxydisplay="none";
					}
					//如果是左相邻,右相邻，可以等效
					if(isleftsibling){
						isleft = true;
						targetColIndex = colIndex1+"-0";
					}
					if(isrightsibing){
						isleft = false;
						targetColIndex = colIndex1+"-"+targetCol2; 
					}
				}else{//源单元格是父列
					
				}
				
				//所有列够不能拖放在自己周围 源单元格周围的| 不显示(不合法的拖放位置)
				if(Math.abs(proxyleft- cd.originleft)<=1 || Math.abs(cd.originleft+cd.originwidth -proxyleft)<=1){
					proxydisplay = "none";
				}
				
				if(proxydisplay=="none"){
					delete cd.isleft;
					delete cd.targetColIndex;
				}else{
					cd.isleft=isleft;
					cd.targetColIndex=targetColIndex;
				}
				
				
				baidu.dom.setStyles(g.ref.resizerproxy,{
					"display":proxydisplay,
					"height":(g.element.clientHeight+"px"),
					"top":g.ref.columndragproxy.style.top,
					"left":(proxyleft+"px")
				});
			}
			g.ref.columndragproxy.style.left=(newLeft+"px");
			
		}
	},
	_cds_dragend:function(){
		var g =this,cd=g._cd;
		if (cd) {
			g.ref.columndragproxy.style.display="none";
			g.ref.resizerproxy.style.display="none";
			//console.log(cd.colIndex+" "+cd.targetColIndex+" "+ cd.isleft);
			if(typeof(cd.targetColIndex)!="undefined"){
				
				//记住之前的排序字段
				var orderCol= g._getCol(g.orderBy);
				if(orderCol) orderCol._ordered =true;
				
				//copy source column
				var copySource = baidu.object.clone(g._getCol(cd.colIndex));
				//case1: 父列之间的排序
				if(cd.targetColIndex.toString().indexOf("-")==-1 && cd.colIndex.toString().indexOf("-")==-1){
					if(!cd.isleft){
						cd.targetColIndex++;
					}
					if (cd.targetColIndex > cd.colIndex) {
						g.columns.splice(cd.targetColIndex, 0, copySource);
						g.columns.splice(cd.colIndex,1);
					}else{
						g.columns.splice(cd.targetColIndex, 0, copySource);
						g.columns.splice(++cd.colIndex,1);
					}
				}else{//case2 子列之间的排序
					var colIndex1=parseInt(cd.colIndex.toString().replace(/\-\d{1,}$/gi,""),10),
						targetColIndex2= parseInt(cd.targetColIndex.toString().replace(/^\d{1,}\-/gi,""),10),
						colIndex2 = parseInt(cd.colIndex.toString().replace(/^\d{1,}\-/gi,""),10);
					if(!cd.isleft){
						targetColIndex2++;
					}
					if (targetColIndex2 > colIndex2) {
						g.columns[colIndex1].columns.splice(targetColIndex2, 0, copySource);
						g.columns[colIndex1].columns.splice(colIndex2,1);
					}else{
						g.columns[colIndex1].columns.splice(targetColIndex2, 0, copySource);
						g.columns[colIndex1].columns.splice(++colIndex2,1);
					}
				}
			}
			delete g._cd;
			//更新orderBy
			for(i=0,l=g.columns.length;i<l;i++){
				var col= g.columns[i];
				if(col._ordered){
					g.orderBy=i;
					delete col._ordered;
					break;
				}
				if(baidu.lang.isArray(col.columns)){
					for(var j = 0,ll=col.columns.length;j<ll;j++){
						var subcol = col.columns[j];
						if(subcol._ordered){
							g.orderBy=i+"-"+j;
							delete subcol._ordered;
							break;
						}
					}
				}
			}
			g.render(g.element);
		}
	},
	getOriginColumns:function(){return this._originColumns;}
});
