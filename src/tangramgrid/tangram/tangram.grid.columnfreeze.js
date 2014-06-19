/*!
 * Grid column freeze
 * @author yanghengfeng
 */
baidu.ui.Grid.register(function(g){
	if(g.freeze){
		
		g.addEventListener("initialized",function(e,data){
			if(g.fixColIndex!=-1){return ;}
			//header
			//BUG 没有考虑分组列头
			var  headertbl = baidu.dom.query("table", g.ref.gheader)[0].cloneNode(true);
			baidu.array.each(headertbl.rows,function(row){
				var cells = row.cells,l = cells.length;
				while (l--) {
					var cell= cells[l],
						colIndex = cell.getAttribute("refcol"),
						col= colIndex.indexOf("-")==-1?parseInt(colIndex):parseInt(colIndex.substr(0,colIndex.indexOf("-")));
					if (col >= g.freeze) {
						cell.parentNode.removeChild(cell);
					}
				}
			});
			baidu.dom.addClass(headertbl, "fixedheadertable");
			g.ref.gheader.appendChild(headertbl);
			
			g.addEventListener("afterload",function(){
				//body
				var bodytbl = baidu.dom.query(".fixedbodytable",g.ref.gbody);
				if(bodytbl.length){
					bodytbl[0].parentNode.removeChild(bodytbl[0]);
				}
				bodytbl = baidu.dom.query("table",g.ref.gbody)[0].cloneNode(true);
				baidu.dom.addClass(bodytbl, "fixedbodytable");
				bodytbl.style.width="auto";
				//realfreeze：实际冻结列数
				var rows = bodytbl.rows,row0= bodytbl.rows[0],realfreeze=g.freeze,row0cells= row0.cells;
				baidu.array.each(row0cells,function(cell,i){
					var colIndex = cell.getAttribute("refcol"),
						col= colIndex.indexOf("-")==-1?parseInt(colIndex):parseInt(colIndex.substr(0,colIndex.indexOf("-")));
						if(col==g.freeze){
							realfreeze= i;
							return false;
						}
				});
				for(var i=0,l=rows.length;i<l;i++){
					var cells = rows[i].cells,ll=cells.length;
					while (ll--) {
						if (ll >= realfreeze) {
							cells[ll].parentNode.removeChild(cells[ll]);
						}
					}
				}
				var headertbl = baidu.dom.query(".fixedheadertable",g.ref.gheader)[0];
				baidu.dom.setBorderBoxWidth(bodytbl,headertbl.offsetWidth);
				g.ref.gbody.appendChild(bodytbl);
			});
			function resizeheadertbl(){
				var bodytbl = baidu.dom.query(".fixedbodytable",g.ref.gbody);
				if (bodytbl.length) {
					var headertbl = baidu.dom.query(".fixedheadertable", g.ref.gheader)[0];
					baidu.dom.setBorderBoxWidth(bodytbl[0], headertbl.offsetWidth);
				}
			}
			g.addEventListener("hidecolumn",resizeheadertbl);
			g.addEventListener("showcolumn",resizeheadertbl);
			g.addEventListener("columnresize",resizeheadertbl);
			
		});
		
	}
	
});
