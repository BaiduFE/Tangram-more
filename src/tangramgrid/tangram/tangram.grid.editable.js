/*!
 * Grid editable
 * @author yanghengfeng
 */
baidu.ui.Grid.register(function(g){
	var columns = g.columns;
	if(g.editMode==2){//全部编辑直接将c.renderer= c.editOption.editRenderer;
	
		baidu.dom.addClass(g.element,"tangramgrid-editable");
		
		baidu.array.each(columns,function(c,colIndex){
			c.sortable=false;
			if(c.editable && c.editOption && baidu.lang.isFunction(c.editOption.editRenderer)){
				c.renderer= c.editOption.editRenderer;
				c.resizable=false;
			}
			if(c.columns){
				baidu.array.each(c.columns,function(subc){
					subc.sortable=false;
					if(subc.editable && subc.editOption && baidu.lang.isFunction(subc.editOption.editRenderer)){
						subc.renderer= subc.editOption.editRenderer;
						subc.resizable=false;
					}
				});
			}
		});
		
		//trigger onBeginEdit when data loaded
		g.addEventListener("afterload",function(e,griddata){
			g.cellIterator(function(param){
				if(!baidu.dom.hasClass(param.row,"editing"))baidu.dom.addClass(param.row,"editing")
				if(param.column.editable && param.column.editOption && baidu.lang.isFunction(param.column.editOption.onBeginEdit)){
					param.column.editOption.onBeginEdit.call(g,param);
				}
			});
		});
	}
	if(g.editMode=="3"){//按单元格编辑
		g.addEventListener("cellclick",function(e,data){
			if(baidu.dom.hasClass(data.ref.cell,"editingcell")) return ;
			var cell = data.ref.cell,editingcell = baidu.dom.query(".editingcell",g.ref.gbody);
			editingcell= editingcell.length>0?editingcell[0]:null;
			if(editingcell){//end editing cell
				var columnIndex =-1,refIndex=-1,
					row= editingcell.parentNode,
					siblings=row.childNodes,
					rowIndex = parseInt(row.getAttribute("rowindex"),10);
				for(var i=0,l=siblings.length;i<l;i++){
					if(siblings[i]==editingcell) {columnIndex=i;break;}
				}
				refIndex= data.ref.table.rows[0].cells[columnIndex].getAttribute("refcol");
				var column= g._getCol(refIndex),fieldValue = g._getCellFieldValue(editingcell,column.field);
				g.getData().data.list[rowIndex][column.field]= fieldValue;
				var endeditparam ={columnIndex:columnIndex,refIndex:refIndex,rowIndex:rowIndex,column:g._getCol(refIndex),cell:editingcell,fieldValue:fieldValue};
				if(!g.dispatchEvent("endedit",endeditparam)){return ;}
				if(typeof(g.onEndEdit)=="function"  && g.onEndEdit(e,endeditparam)===false ) {return;}
				editingcell.childNodes[0].innerHTML = g._getCellContent(column,rowIndex);
				baidu.dom.removeClass(editingcell,"editingcell");
			}
			if(data.column && data.column.editable  && data.column.editOption ){
				if(baidu.lang.isFunction(data.column.editOption.editRenderer)){
					//data还少参数
					data.rowdata= g.getData().data.list[data.rowIndex];
					data.cellvalue = data.rowdata[data.column.field];
					data.colopts= data.column;
					data.select= baidu.array.contains(g.selectedRows,rowIndex);
					//{column:col,cell:cell,row:row,colIndex:refcol,rowIndex:rowIndex,rowdata:g.getData().data.list[rowIndex]};
					data.cell = data.ref.cell;
					data.row= data.ref.row;
					data.colIndex = data.refIndex;
					var cellContent = data.column.editOption.editRenderer.call(g,data)||"";
					data.ref.cell.childNodes[0].innerHTML = cellContent;
				}
				baidu.dom.addClass(data.ref.cell,"editingcell");
				if(baidu.lang.isFunction(data.column.editOption.onBeginEdit)){
					data.column.editOption.onBeginEdit.call(g,data);
				}
			}
			g.resize();
		});
	}
});
baidu.ui.Grid.extend({
	/**
	 * 获取最近一次校验错误信息
	 * @return {Array} [｛“错误信息1"},｛“错误信息2"}...]
	 */
	getValidateErrors:function(){
		return this._validateErrors;
	},
	_getCellFieldValue:function(cell,field){
		var elements  = baidu.dom.query("[name="+field+"]",cell),arr=[];
		baidu.array.each(elements,function(el){
			if(el.tagName.toLowerCase()=="input" || el.tagName.toLowerCase()=="textarea"){
				if (el.type == "radio" || el.type=="checkbox") {
					if(el.checked)arr.push(el.value);
				}else{
					arr.push(el.value);
				}
			}
			if(el.tagName.toLowerCase()=="select"){
				arr.push(el.options[el.selectedIndex].value);
			}
		});
		return arr.join(",");
	},
	/**
	 * 校验,逐行逐字段校验，如果校验通过返回true
	 * @param {Number|Array} rowIndex  校验指定行如果为空，所有行都校验，如果是数字，则校验该行，如果是数据，校验数组中行数据
	 * @return {Boolean} 是否校验通过
	 */
	validate:function(rowIndex){
		var g = this,error=false;
		if(!g._validateErrors) g._validateErrors=[];
		g._validateErrors.length=0;//clear errors
		g.cellIterator(function(param){
			if(typeof(rowIndex)=="number" && param.rowIndex!=rowIndex){return true;}
			if(baidu.lang.isArray(rowIndex) && (!baidu.array.contains(parseInt(rowIndex,10),param.rowIndex))){return true;}
			if(g.editMode=="2" && (!baidu.dom.hasClass(param.row,"editing"))){return true;}
			if(g.editMode=="3" && (!baidu.dom.hasClass(param.cell,"editingcell"))){return true;}
			var col = param.column;
			if(col.editable && col.editOption){
				if(baidu.lang.isFunction(col.editOption.getFieldValue)){//自定义获取字段值
					param.fieldValue= col.editOption.getFieldValue.call(g,param);
				}else{//没有定义，去单元格里面找name=[field]的字段值
					param.fieldValue= g._getCellFieldValue(param.cell,col.field);
				}
			}
			if(col.editable && col.editOption && baidu.lang.isFunction(col.editOption.validate)){
				var validateResult = col.editOption.validate.call(g,param);
				if(validateResult===false){//返回false，整个校验结束
					error=true;
					return false;
				}
				if(baidu.lang.isString(validateResult)){//如果返回是字符串，认为是返回错误信息
					g._validateErrors.push(validateResult);
				}
			}
		});
		return g._validateErrors.length==0 && (!error);
	},
	/**
	 * 获取当前编辑数据
	 * @param {Array|String} fields 需要获取的字段，如果为空，获取全部字段
	 * @param {Array|Number} rowIndex 获取数据的行，可以是数字，数字数组，用于提取相应行，若空，获取所有行
	 */
	getCurrentData:function(fields,rowIndex){
		var g=this,result=[],o={},list =g.getData().data.list.slice();
		for (var i = list.length-1; i >=0; i--) {
			var row = g.getData().data.list[i];
			if (typeof(rowIndex) == "number" && i != rowIndex) { continue;}
			if (baidu.lang.isArray(rowIndex) && (!baidu.array.contains(rowIndex, i))) { continue;}
			if (!fields) {result.push(row);}
			if (baidu.lang.isString(fields)) {
				var nrow = {};
				nrow[fields] = row[fields] == "0" ? "0" : (row[fields] || "");
				result.push(nrow);
			}
			if (baidu.lang.isArray(fields)) {
				var nrow = {};
				baidu.array.each(fields, function(f){
					nrow[f] = row[f] == "0" ? "0" : (row[f] || "");
				});
				result.push(nrow);
			}
			//删除行不获取
			if ((g._deletedRowIndexes && baidu.array.contains(g._deletedRowIndexes, i))) {
				list.splice(i,1);
			}else {
				o[i] = result.length - 1;
			}
		}
		g.cellIterator(function(param){
			if(typeof(o[param.rowIndex])=="undefined") return true;//跳过不需要获取的行
			var row = param.row,col= param.column,resultrow = result[o[param.rowIndex]],field=col.field;
			if(baidu.dom.hasClass(row,"editing") &&  col.editable && (typeof(resultrow[field])!="undefined")){
				var newValue=null;
				if(col.editOption && baidu.lang.isFunction(col.editOption.getFieldValue)){//自定义获取字段值
					newValue= col.editOption.getFieldValue.call(g,param);
				}else{//没有定义，去单元格里面找name=[field]的字段值
					newValue= g._getCellFieldValue(param.cell,col.field);
				}
				resultrow[field]=newValue;
			}
		});
		return result;
	},
	/**
	 * 获取正在编辑的行下标数组
	 * @return {Array} 格式形如[rowIndex1,rowIndex2,...]
	 */
	getEditingRowIndexes:function(){
		var g= this,editingRows = baidu.dom.query("table:eq(0) .editing",g.ref.gbody),result=[];
		if(g.editMode!="1") return result;
		baidu.array.each(editingRows,function (row){
			result.push(parseInt(row.getAttribute("rowindex"),10));
		});
		return result;
	},
	/**
	 * 开始编辑行
	 * @param {Number|Array} rowIndexes 需要激活编辑的行序号，数字，激活一行，数组，激活多行,为空的话，不激活任何行
	 */
	beginEditRow:function(rowIndexes){
		if(typeof(rowIndexes)=="undefined") return ;
		if(typeof(rowIndexes)=="number") rowIndexes=[rowIndexes];
		if(typeof(rowIndexes)=="string" && (!isNaN(rowIndexes))) rowIndexes=[parseInt(rowIndexes,10)];
		if(!rowIndexes.length) return ;
		var g = this;
		if(g.editMode!="1") return ;
		g.cellIterator(function(param){
			var row = param.row,col= param.column;
			if( col.editable  && col.editOption  && baidu.array.contains(rowIndexes,param.rowIndex) ){
				if(!baidu.dom.hasClass(row,"editing")){baidu.dom.addClass(row,"editing");}
				if(baidu.lang.isFunction(col.editOption.editRenderer)){
					var cellContent = col.editOption.editRenderer.call(g,param)||"";
					param.cell.childNodes[0].innerHTML = cellContent;
				}
				if(baidu.lang.isFunction(col.editOption.onBeginEdit)){
					col.editOption.onBeginEdit.call(g,param);
				}
				
			}
		});
		g.resize();
	},
	/**
	 * 结束编辑行
	 * @param {Number|Array} rowIndexes 需要结束编辑的行序号，数字，激活一行，数组，激活多行,为空的话，不结束编辑任何行
	 */
	endEditRow:function(rowIndexes){
		if(typeof(rowIndexes)=="undefined") return ;
		if(typeof(rowIndexes)=="number") rowIndexes=[rowIndexes];
		if(typeof(rowIndexes)=="string" && (!isNaN(rowIndexes))) rowIndexes=[parseInt(rowIndexes,10)];
		if(!rowIndexes.length) return ;
		var g = this;
		if(g.editMode!="1") return ;
		g.cellIterator(function(param){
			var row = param.row,col= param.column;
			if( col.editable  && col.editOption  && baidu.array.contains(rowIndexes,param.rowIndex) ){
				if(baidu.dom.hasClass(row,"editing")){baidu.dom.removeClass(row,"editing");}
				param.cell.childNodes[0].innerHTML = g._getCellContent(col,param.rowIndex);
			}
		});
		g.resize();
	},
	/**
	 * 添加编辑行
	 * @param {Object} row 行数据
	 * @param {Object} rowIndex 在行序号为rowIndex之后添加行，如果为空，在最后一行追加
	 */
	/*addEditRow: function(row, rowIndex){
		var g = this, editingRows = g.getEditingRowIndexes(), currentData = g.getCurrentData();
		if(g.editMode!="1") return -1;
		if (typeof(rowIndex) == "undefined") 
			rowIndex = currentData.length;
		currentData.splice(rowIndex, 0, row);
		g.getData().data.list = currentData;
		g.loadData(g.getData());
		for (var i = 0, l = editingRows.length; i < l; i++) {
			if (editingRows[i] >= rowIndex) {
				editingRows[i]++;
			}
		}
		editingRows.push(rowIndex);
		g.beginEditRow(editingRows);
	},*/
	/**
	 * 删除编辑行
	 */
	deleteEditRow:function(rowIndex){
		var g= this;
		if(g.editMode!="1") return ;
		if(baidu.dom.query("[rowindex=" + rowIndex + "]", g.ref.gbody).length==0 || isNaN(rowIndex)) return ;
		window.setTimeout(function(){
			g.deleteDOMRow(rowIndex);
			if(!g._deletedRowIndexes) g._deletedRowIndexes=[];
			g._deletedRowIndexes.push(parseInt(rowIndex,10));
		},50);
	}
});
