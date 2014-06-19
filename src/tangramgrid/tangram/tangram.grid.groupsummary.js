/*!
 * Grid  group & summary
 * @author yanghengfeng
 */
baidu.ui.Grid.ext.summarytype={
	/**
	 * 计数方法统计
	 * @param {Object} previousvalue 上一次调用该方法的返回值
	 * @param {Object} v 此次调用方法的字段值
	 * @param {Object} seqIndex 统计数据组当前行序号
	 * @param {groupdata} sequencelength 需统计数据组长度
	 */
	count:function(previousvalue,v,seqIndex,sequencelength){
		return seqIndex+1;
	},
	sum:function(previousvalue,v,seqIndex){
		if(seqIndex==0){
			return parseFloat(v);
		}else{
			return (previousvalue+parseFloat(v));
		}
	},
	avg:function(previousvalue,v,seqIndex,sequencelength){
		var g=this,result ={};
		//remember iterator times and sumarry value when it is not the last time 
		if(seqIndex==0){
			result= {times:1,value:v};
		}else{
			result= {times:(previousvalue.times+1),value:(previousvalue.value+v)};
		}
		if(result.times==sequencelength){//final average value
			result = (result.value/result.times);
		}
		return result;
	},
	max:function(previousvalue,v,seqIndex){
		if(seqIndex==0) return v;
		if(v>previousvalue){
			return v;
		}else{
			return previousvalue;
		}
	},
	min:function(previousvalue,v,seqIndex){
		if(seqIndex==0) return v;
		if(v<previousvalue){
			return v;
		}else{
			return previousvalue;
		}
	},
	maxnumber:function(previousvalue,v,seqIndex){
		if(seqIndex==0) return v;
		previousvalue=parseFloat(previousvalue);
		v= parseFloat(v);
		if(v>previousvalue){
			return v;
		}else{
			return previousvalue;
		}
	},
	minnumber:function(previousvalue,v,seqIndex){
		if(seqIndex==0) return v;
		previousvalue=parseFloat(previousvalue);
		v= parseFloat(v);
		if(v<previousvalue){
			return v;
		}else{
			return previousvalue;
		}
	}

};
baidu.ui.Grid.register(function(g){
	//if(!g.groupBy) return ;
	g.addEventListener("beforeload",function(e,griddata){
		var g=this,list = griddata.data.list,groupedlist=[],groupedValueSort=[],cols= g.columns;
		g.groupdata = {};//{groupFieldValue:{rows:[],summary:{}}}
		g.summarydata={};//每个字段的总统计值
		var groupdata= g.groupdata;//short reference
		for(var i=0,l=list.length;i<l;i++){
			var row  = list[i],groupFieldValue = row[g.groupBy];
			if (!groupdata[groupFieldValue]) {
				groupdata[groupFieldValue] = {rows:[],summary:{}};
				groupedValueSort.push(groupFieldValue);
			}
			groupdata[groupFieldValue].rows.push(i);
			
			if (g.summary) {
				for (var j = 0, ll = cols.length; j < ll; j++) {
					var col = cols[j], f = col.field;
					if (!col.columns) {
						if (col.summay && typeof(baidu.ui.Grid.ext.summarytype[col.summay]) == "function") {
							g.summarydata[f] = baidu.ui.Grid.ext.summarytype[col.summay](g.summarydata[f], row[f], i, l);
						}
					}
					else {
						for (var subi = 0, subl = col.columns.length; subi < subl; subi++) {
							var subcol = col.columns[subi];
							if (subcol.summay && typeof(baidu.ui.Grid.ext.summarytype[subcol.summay]) == "function") {
								g.summarydata[f] = baidu.ui.Grid.ext.summarytype[subcol.summay](g.summarydata[f], row[f], i, l);
							}
						}
					}
				}
			}
		}
		for (var i = 0, l = groupedValueSort.length; i < l; i++) {
			var groupFieldValue=groupedValueSort[i],data =groupdata[ groupFieldValue ],cols= g.columns ;
			for (var ii = 0, ll = data.rows.length; ii < ll; ii++) {
				
				var listrow = list[data.rows[ii]];
				if(!listrow){
				}
				groupedlist.push(listrow);
				
				if (g.groupSummary) {
					for (var j = 0, cll = cols.length; j < cll; j++) {
						var col = cols[j], f = col.field;
						if (!col.columns) {
							if (col.groupSummary && typeof(baidu.ui.Grid.ext.summarytype[col.groupSummary]) == "function") {
								data.summary[f] = baidu.ui.Grid.ext.summarytype[col.groupSummary](data.summary[f], listrow[f], ii, ll);
							}
						}else {
							for (var subi = 0, subl = col.columns.length; subi < subl; subi++) {
								var subcol = col.columns[subi];
								if (subcol.groupSummary && typeof(baidu.ui.Grid.ext.summarytype[subcol.groupSummary]) == "function") {
									data.summary[f] = baidu.ui.Grid.ext.summarytype[subcol.groupSummary](data.summary[f], listrow[f], ii, ll);
								}
							}
						}
					}
				}
			}
		}
		griddata.data.list=groupedlist;//调整为分组后的顺序
	});
	
	var _lastGroupValue=null;
	g.addEventListener("beginrowjoin",function(e,param){
		//{realColumnsLength:realColumnsLength,rowdata:row,rowIndex:i,joinedArray:arr}
		var groupValue = param.rowdata[g.groupBy],cellValue=groupValue,arr=param.joinedArray,cols=g.columns;
		if(typeof(g.groupHeader)=="function"){
			cellValue= g.groupHeader({groupValue:groupValue,groupData:g.groupdata})||"";
		}
		if(_lastGroupValue!= groupValue){
			if (_lastGroupValue != null && g.groupSummary) {
				arr.push("<tr class='groupsummaryrow' groupfieldvalue='"+groupValue+"'>");
				for (var j = 0, cll = cols.length; j < cll; j++) {
					var col = cols[j];
					if (!col.columns) {
						var  f = col.field||"",groupSummaryValue= g.groupdata[_lastGroupValue].summary[f];
						groupSummaryValue= (groupSummaryValue=="0"?0:(groupSummaryValue||""));
						var cellText = typeof(col.groupSummaryFormat)=="string"?baidu.string.format(col.groupSummaryFormat,{groupSummaryValue:groupSummaryValue}):groupSummaryValue;
						if(typeof(col.groupSummaryFormat)=="function"){
							cellText= col.groupSummaryFormat.call(g,{groupSummaryValue:groupSummaryValue});
						}
						arr.push("<td  nowrap='nowrap' style='" + (col.hide ? "display:none;" : "") + "'><span class='cellcontent' style='text-align:" + (col.align || "left") + ";' > " +cellText + "</span></td>");
						
					}else {
						for (var subi = 0, subl = col.columns.length; subi < subl; subi++) {
							var  subcol= col.columns[subi],f = subcol.field||"",groupSummaryValue= g.groupdata[_lastGroupValue].summary[f];
							groupSummaryValue= (groupSummaryValue=="0"?0:(groupSummaryValue||""));
							var cellText = typeof(subcol.groupSummaryFormat)=="string"?baidu.string.format(subcol.groupSummaryFormat,{groupSummaryValue:groupSummaryValue}):groupSummaryValue;
							if(typeof(subcol.groupSummaryFormat)=="function"){
								cellText= subcol.groupSummaryFormat.call(g,{groupSummaryValue:groupSummaryValue});
							}
							arr.push("<td  nowrap='nowrap' style='" + (subcol.hide ? "display:none;" : "") + "'><span class='cellcontent' style='text-align:" + (subcol.align || "left") + ";' > " +cellText + "</span></td>");
						}
					}
				}
				arr.push("</tr>");
			}
			
			param.joinedArray.push("<tr class='groupheaderrow' groupfieldvalue='"+groupValue+"'><td colspan='"+param.realColumnsLength+"' class='gridcell'><span class='groupheadertoggler expanded '>－</span>"+cellValue+"</td></tr>");
		}
		_lastGroupValue= groupValue;
	});
	
	g.addEventListener("endrowjoin",function(e,param){
		if(param.rowIndex +1==g.getData().data.list.length){
			var groupdata = g.groupdata,arr= param.joinedArray,groupValue = param.rowdata[g.groupBy],cols= g.columns;
			//补齐最后一行的分组合计
			if(groupValue && g.groupSummary && groupdata[groupValue]){
				arr.push("<tr class='groupsummaryrow' groupfieldvalue='"+groupValue+"'>");
				for (var j = 0, cll = cols.length; j < cll; j++) {
					var col = cols[j];
					if (!col.columns) {
						var  f = col.field||"",groupSummaryValue= g.groupdata[groupValue].summary[f];
						groupSummaryValue= (groupSummaryValue=="0"?0:(groupSummaryValue||""));
						var cellText = typeof(col.groupSummaryFormat)=="string"?baidu.string.format(col.groupSummaryFormat,{groupSummaryValue:groupSummaryValue}):groupSummaryValue;
						if(typeof(col.groupSummaryFormat)=="function"){
							cellText= col.groupSummaryFormat.call(g,{groupSummaryValue:groupSummaryValue});
						}
						arr.push("<td  nowrap='nowrap' style='" + (col.hide ? "display:none;" : "") + "'><span class='cellcontent' style='text-align:" + (col.align || "left") + ";' > " +cellText + "</span></td>");
						
					}else {
						for (var subi = 0, subl = col.columns.length; subi < subl; subi++) {
							var  subcol= col.columns[subi],f = subcol.field||"",groupSummaryValue= g.groupdata[groupValue].summary[f];
							groupSummaryValue= (groupSummaryValue=="0"?0:(groupSummaryValue||""));
							var cellText = typeof(subcol.groupSummaryFormat)=="string"?baidu.string.format(subcol.groupSummaryFormat,{groupSummaryValue:groupSummaryValue}):groupSummaryValue;
							if(typeof(subcol.groupSummaryFormat)=="function"){
								cellText= subcol.groupSummaryFormat.call(g,{groupSummaryValue:groupSummaryValue});
							}
							arr.push("<td  nowrap='nowrap' style='" + (subcol.hide ? "display:none;" : "") + "'><span class='cellcontent' style='text-align:" + (subcol.align || "left") + ";' > " +cellText + "</span></td>");
						}
					}
				}
				arr.push("</tr>");
			}
			
		}
	});
	
	g.addEventListener("endrowsjoin",function(e,param){
		var groupdata = g.groupdata,arr= param.joinedArray,cols= g.columns;
		//总计
		if(g.summary){
			arr.push("<tr class='summaryrow'>");
			for (var j = 0, cll = cols.length; j < cll; j++) {
				var col = cols[j];
				if (!col.columns) {
					var  f = col.field||"",summaryValue= g.summarydata[f];
					summaryValue= (summaryValue=="0"?0:(summaryValue||""));
					var cellText = typeof(col.summaryFormat)=="string"?baidu.string.format(col.summaryFormat,{summaryValue:summaryValue}):summaryValue;
					if(typeof(col.summaryFormat)=="function"){
						cellText= col.summaryFormat.call(g,{summaryValue:summaryValue});
					}
					arr.push("<td  nowrap='nowrap' style='" + (col.hide ? "display:none;" : "") + "'><span class='cellcontent' style='text-align:" + (col.align || "left") + ";' > " +cellText + "</span></td>");
					
				}else {
					for (var subi = 0, subl = col.columns.length; subi < subl; subi++) {
						var  subcol= col.columns[subi],f = subcol.field||"",summaryValue= g.summarydata[f];
						summaryValue= (summaryValue=="0"?0:(summaryValue||""));
						var cellText = typeof(subcol.summaryFormat)=="string"?baidu.string.format(subcol.summaryFormat,{summaryValue:summaryValue}):summaryValue;
							if(typeof(subcol.summaryFormat)=="function"){
							cellText= subcol.summaryFormat.call(g,{summaryValue:summaryValue});
						}
						arr.push("<td  nowrap='nowrap' style='" + (subcol.hide ? "display:none;" : "") + "'><span class='cellcontent' style='text-align:" + (subcol.align || "left") + ";' > " +cellText + "</span></td>");
					}
				}
			}
			arr.push("</tr>");
		}
	});
	
	g.addEventListener("cellclick",function(e,data){
		var cell = data.ref.cell,row= cell.parentNode;
		if(baidu.dom.hasClass(row,"groupheaderrow")){// click groupheaderrow to toggle sub rows
			var groupfieldvalue=row.getAttribute("groupfieldvalue"),
				rowIndexes=g.groupdata[groupfieldvalue].rows,
				expander = baidu.dom.query(".groupheadertoggler",cell)[0],
				toUnExpand=baidu.dom.hasClass(expander,"expanded") ;
				if(toUnExpand){
					expander.innerHTML="＋";
					baidu.dom.removeClass(expander,"expanded");
				}else{
					expander.innerHTML="－";
					baidu.dom.addClass(expander,"expanded");
				}
				var crow = row.nextSibling;
				while(crow && crow.getAttribute("rowindex")){
					crow.style.display=(toUnExpand?"none":"");
					crow=  crow.nextSibling;
				}
		}
		
	});
});
