/**
 * @author yanghengfeng
 * grid page sort
 */
baidu.ui.Grid.register(function(g){
	if(g.page==false){
		g.addEventListener("beforesort",function(e,data){
			var col=g._getCol(data.colIndex),order= data.order;
			if(col.sortable!==false && col.field && (!g.url)){
				var list = g.getData().data.list;
				list.sort(function(a,b){
					if(isNaN(a[col.field]) && isNaN(b[col.field])){//都不是数字，做字符串比较
						return order=="asc"?
							a[col.field].toString().localeCompare(b[col.field].toString()):
							b[col.field].toString().localeCompare(a[col.field].toString());
					}else{//数字比较
						return order=="asc"? a[col.field]-b[col.field]: b[col.field]-a[col.field];
					}
				});
				g.loadData(g.getData());
			}
		});
	}
});
