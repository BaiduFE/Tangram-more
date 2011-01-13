/***************************************************************
 *   Create By lion                                            *
 *   2009-12-31 14:37                                          *
 *   Copyright (C) 1998-2005 www.baidu.com All rights reserved.*
 *   Web: http://www.baidu.com                                 *
 *   Email: houjianxun@baidu.com                               *
 ***************************************************************/

/*
* your module name
* 
* path: ianPager.js
* author: 侯迦壹
* version: 1.1.0
* date: 2010/9/10
*/
// 预声明包
var baidu = baidu || {};
baidu.more = baidu.more || {};
baidu.more.IanPager = function(){return new ianPager();}; 

 /*
公用分页控件类

Example 1：
var pager = new ianPager();
pager.PageSize(15);
pager.Width("100%");
pager.SubmitButtonStyle("height:20;FONT-SIZE: 10px;");
pager.InputBoxStyle("width:20px;height:18;FONT-SIZE: 10px;");
pager.PagingButtonSpacing("10px");
pager.PrevPageText("上一页");
pager.NextPageText("下一页");
pager.FirstPageText("首页");
pager.LastPageText("尾页");
pager.ShowCustomInfoSection("Left");
pager.AlwaysShow(true);
pager.ShowPageIndex(false);
pager.ShowWriteButtonSpace(true);
pager.ShowInputBox("Always");
pager.TextBeforeInputBox("跳到&nbsp;");
pager.TextAfterInputBox("&nbsp;页&nbsp;&nbsp;");
pager.RecordCount(1000);
pager.CurrentPageIndex(5);
pager.CustomInfoText(pager.Format("&nbsp;&nbsp;页次: <span style=\"color:red;\">{0}</span> / <span style=\"color:red;\">{1}</span>页&nbsp;&nbsp;<span style=\"color:red;\">{2}</span>个内容/页&nbsp;&nbsp;共有&nbsp;<span style=\"color:red;\">{3}</span>&nbsp;个内容&nbsp;", pager.CurrentPageIndex(), pager.PageCount(), pager.PageSize(), pager.RecordCount()));
pager.UrlPageIndexName("page");
pager.Render();


Example 2：
var pager = new ianPager();
pager.PageSize(15);
pager.Width("100%");
pager.PrevPageText("<<");
pager.NextPageText(">>");
pager.FirstPageText("首页");
pager.LastPageText("尾页");
pager.ShowMoreButton(false);
pager.RecordCount(1000);
pager.CurrentPageIndex(13);
pager.TextBeforeInputBox("跳到&nbsp;");
pager.TextAfterInputBox("&nbsp;页&nbsp;&nbsp;");
pager.InputBoxStyle("width:20px;height:18;FONT-SIZE: 10px;");
pager.UrlPageIndexName("page");
pager.Render();


Example 3：
<div id="jspager"></div>
function createJsPager(pageIndex, pageSize)
{
    var pager = new ianPager();
    pager.PageSize(pageSize);
    pager.Width("100%");
    pager.PrevPageText("上一页");
    pager.NextPageText("下一页");
    pager.FirstPageText("首页");
    pager.LastPageText("尾页");
    pager.ShowInputBox("None");
    pager.ShowMoreButton(true);
    pager.RecordCount(1000);
    pager.CurrentPageIndex(pageIndex);
    pager.UrlPageIndexName(global_urlPageIndexName);
    pager.CustomJsPageFunction("createJsPager({0},"+ pageSize +")");
    document.getElementById("jspager").innerHTML = pager.Html();
}
createJsPager(global_CurrentPageIndex, global_pageSize);

*/
function ianPager() {
	this.ViewState = {}; 
	this.version = "1.0"; 
	//当前页的url分页信息
	this.currentUrl = "";
	//可用于标头、查询字符串和窗体数据
	this.urlParams = {};
	this.IsIE = /msie (\d+\.\d)/i.test(navigator.userAgent);
}


/*
获取或设置一个值，该值批示当鼠标指针悬停在导航按钮上时是否显示工具提示。
*/
ianPager.prototype.ShowNavigationToolTip = function() {
	if(arguments.length==0){var obj = this.ViewState["ShowNavigationToolTip"];return obj==null?true:obj;}
	else{this.ViewState["ShowNavigationToolTip"] = arguments[0];}
}


/*
获取或设置导航按钮工具提示文本的格式。
*/
ianPager.prototype.NavigationToolTipTextFormatString = function() {
	if(arguments.length==0){var obj = this.ViewState["NavigationToolTipTextFormatString"];return obj==null?"转到第{0}页":obj;}
	else{this.ViewState["NavigationToolTipTextFormatString"] = arguments[0];}
}


/*
获取或设置页索引数值导航按钮上文字的显示格式。
使用NumericButtonTextFormatString属性指定页索引数值按钮的显示格式，如未设置该值时索引按钮文本将会是：1 2 3 ...，设置该值将改变索引按钮文本的显示格式，如将该值设为“[{0}]”则索引文本会显示为：[1] [2] [3] ...，将该值设为“-{0}-”则会使索引文本变为：-1- -2- -3- ...。
*/
ianPager.prototype.NumericButtonTextFormatString = function() {
	if(arguments.length==0){var obj = this.ViewState["NumericButtonTextFormatString"];return obj==null?"":obj;}
	else{this.ViewState["NumericButtonTextFormatString"] = arguments[0];}
}

/*
获取或设置分页导航按钮的类型，即使用文字还是图片。
*/
/// <remarks>
/// 要使用图片按钮，您需要准备以下图片：从0到9的十个数值图片（当ShowPageIndex设为true时），第一页、上一页、下一页、最后一页及更多页（...）五个按钮图片（当ShowFirstLast及ShowPrevNext都设为true时），
/// 若需要使当前页索引的数值按钮不同于别的页索引数值按钮，则还需准备当前页索引的按钮图片；
/// 若需要使已禁用的第一页、上一页、下一页及最后一页按钮图片不同于正常的按钮图片，则还需准备这四个按钮在禁用状态下的图片；
/// <p><b>图片文件的命名规则如下：</b></p>
/// <p>从0到9十张数值按钮图片必须命名为“数值+ButtonImageNameExtension+ButtonImageExtension”，其中的ButtonImageNameExtension可以不用设置，
/// ButtonImageExtension是图片文件的后缀名，如 .gif或 .jpg等可以在浏览器中显示的任何图片文件类型。如页索引“1”的图片文件可命名为“1.gif”或“1.jpg”，
/// 当您有两套或更多套图片文件时，可以通过指定ButtonImageNameExtension属性值来区分不同套的图片，如第一套图片可以不用设ButtonImageNameExtension，则图片文件名类似于“1.gif”、“2.gif”等等，而第二套图片则设置ButtonImageNameExtension为“f”，图片文件名类似于“1f.gif”，“2f.gif”等等。</p>
/// <p>第一页按钮的图片文件名以“first”开头，上一页按钮图片名以“prev”开头，下一页按钮图片名以“next”开头，最后一页按钮图片名以“last”开头，更多页按钮图片名以“more”开头，是否使用ButtonImageNameExtension取决于数值按钮的设置及是否有更多套图片。</p>
/// </remarks>
ianPager.prototype.PagingButtonType = function() {
	if(arguments.length==0){var obj = this.ViewState["PagingButtonType"];return obj==null?"Text":obj;}
	else{this.ViewState["PagingButtonType"] = arguments[0];}
}

/*
指定当前页数字索引按钮在所有数字页索引按钮中的位置
@Beginning  当前页数字索引总是显示在所有数字页索引的最前面
@End    当前页数字索引总是显示在所有数字页索引的最后面
@Center 当前页数字索引总是显示在所有数字页索引的中间
@Fixed  默认值，当前页索引位置固定不变
*/
ianPager.prototype.PagingButtonPosition = function () {
    if (arguments.length == 0) { var obj = this.ViewState["PagingButtonPosition"]; return obj == null ? "Fixed" : obj; }
    else { this.ViewState["PagingButtonPosition"] = arguments[0]; }
}


/*
获取或设置页导航数值按钮的类型，该值仅当PagingButtonType设为Image时才有效。
当您将PagingButtonType设为Image当又不想让页索引数值按钮使用图片时，可以将该值设为Text，这会使页索引数据按钮使用文本而不是图片按钮。
*/
ianPager.prototype.NumericButtonType = function() {
	if(arguments.length==0){var obj = this.ViewState["NumericButtonType"];return obj==null?this.PagingButtonType:obj;}
	else{this.ViewState["NumericButtonType"] = arguments[0];}
}



/*
获取或设置第一页、上一页、下一页和最后一页按钮的类型，该值仅当PagingButtonType设为Image时才有效。
当您将PagingButtonType设为Image但又不想让第一页、下一页、下一页和最后一页按钮使用图片，则可以将该值设为Text，这会使前面的四个按钮使用文本而不是图片按钮。
*/
ianPager.prototype.NavigationButtonType = function() {
	if(arguments.length==0){var obj = this.ViewState["NavigationButtonType"];return obj==null?this.PagingButtonType:obj;}
	else{this.ViewState["NavigationButtonType"] = arguments[0];}
}

/*
获取或设置“更多页”（...）按钮的类型，该值仅当PagingButtonType设为Image时才有效。
当您将PagingButtonType设为Image但又不想让更多页（...）按钮使用图片时，可以将此值设为Text，这会使更多页按钮使用文本而不是图片按钮。
*/
ianPager.prototype.MoreButtonType = function() {
	if(arguments.length==0){var obj = this.ViewState["MoreButtonType"];return obj==null?this.PagingButtonType:obj;}
	else{this.ViewState["MoreButtonType"] = arguments[0];}
}

/*
获取或设置分页导航按钮之间的间距。
*/
ianPager.prototype.PagingButtonSpacing = function() {
	if(arguments.length==0){var obj = this.ViewState["PagingButtonSpacing"];return obj==null?"5px":obj;}
	else{this.ViewState["PagingButtonSpacing"] = arguments[0];}
}

/*
获取或设置应用于分页导航按钮之间的间距级联样式表类名。
*/
ianPager.prototype.PagingButtonSpacingCssClass = function() {
	if(arguments.length==0){var obj = this.ViewState["PagingButtonSpacingCssClass"];return obj==null?"":obj;}
	else{this.ViewState["PagingButtonSpacingCssClass"] = arguments[0];}
}

/*
获取或设置应用于分页导航按钮之间的间距CSS样式文本
*/
ianPager.prototype.PagingButtonSpacingStyle = function() {
	if(arguments.length==0){var obj = this.ViewState["PagingButtonSpacingStyle"];return obj==null?"":obj;}
	else{this.ViewState["PagingButtonSpacingStyle"] = arguments[0];}
}

/*
获取或设置一个值，该值指示是否在页导航元素中显示第一页和最后一页按钮。
*/
ianPager.prototype.ShowFirstLast = function() {
	if(arguments.length==0){var obj = this.ViewState["ShowFirstLast"];return obj==null?true:obj;}
	else{this.ViewState["ShowFirstLast"] = arguments[0];}
}

/*
获取或设置一个值，该值指示是否在页导航元素中显示上一页和下一页按钮。
*/
ianPager.prototype.ShowPrevNext = function() {
	if(arguments.length==0){var obj = this.ViewState["ShowPrevNext"];return obj==null?true:obj;}
	else{this.ViewState["ShowPrevNext"] = arguments[0];}
}


/*
获取或设置一个值，该值指示是否显示更多页。
*/
ianPager.prototype.ShowMoreButton = function() {
	if(arguments.length==0){var obj = this.ViewState["ShowMoreButton"];return obj==null?true:obj;}
	else{this.ViewState["ShowMoreButton"] = arguments[0];}
}

/*
获取或设置一个值，该值指示是否在分页导航元素间加入空格。
*/
ianPager.prototype.ShowWriteButtonSpace = function() {
	if(arguments.length==0){var obj = this.ViewState["ShowWriteButtonSpace"];return obj==null?false:obj;}
	else{this.ViewState["ShowWriteButtonSpace"] = arguments[0];}
}

/*
获取或设置一个值，该值指示是否在页导航元素中显示页索引数值按钮。
*/
ianPager.prototype.ShowPageIndex = function() {
	if(arguments.length==0){var obj = this.ViewState["ShowPageIndex"];return obj==null?true:obj;}
	else{this.ViewState["ShowPageIndex"] = arguments[0];}
}

/*
获取或设置为第一页按钮显示的文本。
*/
ianPager.prototype.FirstPageText = function() {
	if(arguments.length==0){var obj = this.ViewState["FirstPageText"];return obj==null?"<font face=\"webdings\">9</font>":obj;}
	else{this.ViewState["FirstPageText"] = arguments[0];}
}

/*
获取或设置为第一页按钮显示的文本样式风格。
*/
ianPager.prototype.FirstPageTextStyle = function() {
	if(arguments.length==0){var obj = this.ViewState["FirstPageTextStyle"];return obj==null?"padding:6px 0px 0px 0px;margin:0px;":obj;}
	else{this.ViewState["FirstPageTextStyle"] = arguments[0];}
}

/*
获取或设置为上一页按钮显示的文本。
*/
ianPager.prototype.PrevPageText = function() {
	if(arguments.length==0){var obj = this.ViewState["PrevPageText"];return obj==null?"<font face=\"webdings\">3</font>":obj;}
	else{this.ViewState["PrevPageText"] = arguments[0];}
}

/*
获取或设置为上一页按钮显示的文本样式风格。
*/
ianPager.prototype.PrevPageTextStyle = function() {
	if(arguments.length==0){var obj = this.ViewState["PrevPageTextStyle"];return obj==null?"padding:6px 0px 0px 0px;margin:0px;":obj;}
	else{this.ViewState["PrevPageTextStyle"] = arguments[0];}
}

/*
获取或设置为下一页按钮显示的文本。
*/
ianPager.prototype.NextPageText = function() {
	if(arguments.length==0){var obj = this.ViewState["NextPageText"];return obj==null?"<font face=\"webdings\">4</font>":obj;}
	else{this.ViewState["NextPageText"] = arguments[0];}
}

/*
获取或设置为下一页按钮显示的文本样式风格。
*/
ianPager.prototype.NextPageTextStyle = function() {
	if(arguments.length==0){var obj = this.ViewState["NextPageTextStyle"];return obj==null?"padding:6px 0px 0px 0px;margin:0px;":obj;}
	else{this.ViewState["NextPageTextStyle"] = arguments[0];}
}

/*
获取或设置为最后一页按钮显示的文本。
*/
ianPager.prototype.LastPageText = function() {
	if(arguments.length==0){var obj = this.ViewState["LastPageText"];return obj==null?"<font face=\"webdings\">:</font>":obj;}
	else{this.ViewState["LastPageText"] = arguments[0];}
}

/*
获取或设置为最后一页按钮显示的文本样式风格。
*/
ianPager.prototype.LastPageTextStyle = function() {
	if(arguments.length==0){var obj = this.ViewState["LastPageTextStyle"];return obj==null?"padding:6px 0px 0px 0px;margin:0px;":obj;}
	else{this.ViewState["LastPageTextStyle"] = arguments[0];}
}

/*
获取或设置在控件的页导航元素中同时显示的数值按钮的数目。
*/
ianPager.prototype.NumericButtonCount = function() {
	if(arguments.length==0){var obj = this.ViewState["NumericButtonCount"];return obj==null?10:obj;}
	else{this.ViewState["NumericButtonCount"] = arguments[0];}
}

/*
获取或设置一个值，该值指定是否显示已禁用的按钮。
该值用来指定是否显示已禁用的分页导航按钮，当当前页为第一页时，第一页和上一页按钮将被禁用，当当前页为最后一页时，下一页和最后一页按钮将被禁用，被禁用的按钮没有链接，在按钮上点击也不会有任何作用。
*/
ianPager.prototype.ShowDisabledButtons = function() {
	if(arguments.length==0){var obj = this.ViewState["ShowDisabledButtons"];return obj==null?true:obj;}
	else{this.ViewState["ShowDisabledButtons"] = arguments[0];}
}

/*
获取或设置当使用图片按钮时，图片文件的路径。
*/
ianPager.prototype.ImagePath = function() {
	if(arguments.length==0){var obj = this.ViewState["ImagePath"];return obj==null?"":obj;}
	else{
	    var imgPath = arguments[0];
	    this.ViewState["ImagePath"] = (imgPath.substr(imgPath.length-1)=="/")?imgPath:imgPath+"/";
	}
}

/*
获取或设置当使用图片按钮时，图片的类型，如gif或jpg，该值即图片文件的后缀名。
*/
ianPager.prototype.ButtonImageExtension = function() {
	if(arguments.length==0){var obj = this.ViewState["ButtonImageExtension"];return obj==null?".gif":obj;}
	else{
	    var ext = arguments[0];
	    this.ViewState["ButtonImageExtension"] = (ext.substr(0,1)=="."?ext:"."+ext);
	}
}

/*
获取或设置自定义图片文件名的后缀字符串，以区分不同类型的按钮图片。
/// <remarks><note>注意：</note>该值不是文件后缀名，而是为区分不同的图片文件而在图片名中加入的字符串，如：
/// 当前有两套按钮图片，其中一套中的“1”的图片名可为“1f.gif”，另一套中的“1”的图片名可起为“1n.gif”，其中的f和n即为ButtonImageNameExtension。</remarks>
*/
ianPager.prototype.ButtonImageNameExtension = function() {
	if(arguments.length==0){var obj = this.ViewState["ButtonImageNameExtension"];return obj==null?"":obj;}
	else{this.ViewState["ButtonImageNameExtension"] = arguments[0];}
}

/*
获取或设置当前页索引按钮的图片名后缀。
/// <remarks>
/// 当 <see cref="PagingButtonType"/> 设为 Image 时，该属性允许您设置当前页索引数值按钮使用的图片名后缀字符，因此可以使当前页索引按钮与其它页索引按钮使用不同的图片，若未设置该值，则默认值为<see cref="ButtonImageNameExtension"/>，即当前页索引按钮与其它页索引按钮使用相同的图片。
/// </remarks>
*/
ianPager.prototype.CpiButtonImageNameExtension = function() {
	if(arguments.length==0){var obj = this.ViewState["CpiButtonImageNameExtension"];return obj==null?this.ButtonImageNameExtension:obj;}
	else{this.ViewState["CpiButtonImageNameExtension"] = arguments[0];}
}

/*
获取或设置已禁用的页导航按钮图片名后缀字符串。
/// <remarks>
/// 当 <see cref="PagingButtonType"/> 设为 Image 时， 该值允许您设置已禁用（即没有链接，因而点击后无反应）的页导航按钮（包括第一页、上一页、下一页、最后一页四个按钮）的图片文件名后缀字符串，因此可以使已禁用的页导航按钮不同于正常的页导航按钮。若未设置该值，则默认值为<see cref="ButtonImageNameExtension"/>，即已禁用的页导航按钮与正常的页导航按钮使用相同的图片。
/// </remarks>
*/
ianPager.prototype.DisabledButtonImageNameExtension = function() {
	if(arguments.length==0){var obj = this.ViewState["DisabledButtonImageNameExtension"];return obj==null?this.ButtonImageNameExtension:obj;}
	else{this.ViewState["DisabledButtonImageNameExtension"] = arguments[0];}
}


/*
指定当使用图片按钮时，图片的对齐方式。
*/
ianPager.prototype.ButtonImageAlign = function() {
	if(arguments.length==0){var obj = this.ViewState["ButtonImageAlign"];return obj==null?"":obj;}
	else{this.ViewState["ButtonImageAlign"] = arguments[0];}
}

/*
获取或设置当启用Url分页方式时，在url中表示要传递的页索引的参数的名称。
/// <remarks>
/// 该属性允许您自定义通过Url传递页索引时表示要传递的页索引的参数的名称，以避免与现有的参数名重复。
/// <p>该属性的默认值是“page”，即通过Url分页时，显示在浏览器地址栏中的Url类似于：</p>http://idoall.org/ianpager/aaa.xhtml?page=2 
/// <p>如将该值改为“pageindex”，则上面的Url将变为：</p><p>http://idoall.org/ianpager/aaa.xhtml?pageindex=2 </p>
/// </remarks>
*/
ianPager.prototype.UrlPageIndexName = function() {
	if(arguments.length==0){var obj = this.ViewState["UrlPageIndexName"];return obj==null?"":obj;}
	else{this.ViewState["UrlPageIndexName"] = arguments[0];}
}

/*
获取或设置当前显示页的索引。
///<remarks>使用此属性来确定在 AspNetPager 控件中当前显示的页，当前显示的页的数字索引将以红色字体加粗显示。此属性还用于以编程的方式控制所显示的页。
///<p>　<b>注意：</b>不同于DataGrid控件的CurrentPageIndex，AspNetPager的CurrentPageIndex属性是从1开始的。</p></remarks>
*/
ianPager.prototype.CurrentPageIndex = function() {
	if(arguments.length==0){
	        var cpage = this.ViewState["CurrentPageIndex"];
	        var pindex = (cpage == null) ? 1 : cpage;
	        if (pindex > this.PageCount())
                return this.PageCount();
            else if (pindex < 1)
                return 1;
            return parseInt(pindex);
	}
	else
	{
	    var cpage = arguments[0];
	    if (cpage < 1)
            cpage = 1;
        else if (cpage > this.PageCount())
            cpage = this.PageCount();
	    this.ViewState["CurrentPageIndex"] = cpage;
	}
}



/*
当前索引页值的级联样式表类名。
*/
ianPager.prototype.CurrentPageIndexCss = function() {
	if(arguments.length==0){var obj = this.ViewState["CurrentPageIndexCss"];return obj==null?"":obj;}
	else{this.ViewState["CurrentPageIndexCss"] = arguments[0];}
}

/*
当前索引页值的文本样式风格。
*/
ianPager.prototype.CurrentPageIndexStyle = function() {
	if(arguments.length==0){var obj = this.ViewState["CurrentPageIndexStyle"];return obj==null?"":obj;}
	else{this.ViewState["CurrentPageIndexStyle"] = arguments[0];}
}

/*
当上一页、下一页没有时文字显示的颜色。
*/
ianPager.prototype.PrevFirstAndNestLastDisabledColor = function() {
	if(arguments.length==0){var obj = this.ViewState["PrevFirstAndNestLastDisabledColor"];return obj==null?"#E0E0E0":obj;}
	else{this.ViewState["PrevFirstAndNestLastDisabledColor"] = arguments[0];}
}



/*
获取或设置需要分页的所有记录的总数。
*/
ianPager.prototype.RecordCount = function() {
	if(arguments.length==0){var obj = this.ViewState["RecordCount"];return obj==null?0:parseInt(obj);}
	else{this.ViewState["RecordCount"] = parseInt(arguments[0]);}
}


/*
当上一页、下一页没有时文字显示的颜色。
*/
ianPager.prototype.PrevFirstAndNestLastDisabledColor = function() {
	if(arguments.length==0){var obj = this.ViewState["PrevFirstAndNestLastDisabledColor"];return obj==null?"#E0E0E0":obj;}
	else{this.ViewState["PrevFirstAndNestLastDisabledColor"] = arguments[0];}
}

/*
获取当前页之后未显示的页的总数。
*/
ianPager.prototype.PagesRemain = function() {
	return parseInt(this.PageCount() - this.CurrentPageIndex());
}

/*
获取在当前页之后还未显示的剩余记录的项数。
*/
ianPager.prototype.RecordsRemain = function() {
	if (this.CurrentPageIndex() < this.PageCount()){
        return this.RecordCount() - (this.CurrentPageIndex() * this.PageSize());
    }
    return 0;
}

/*
获取或设置每页显示的项数。
*/
ianPager.prototype.PageSize = function() {
	if(arguments.length==0){var obj = this.ViewState["PageSize"];return obj==null?10:parseInt(obj);}
	else{this.ViewState["PageSize"] = parseInt(arguments[0]);}
}

/*
获取所有要分页的记录需要的总页数。
*/
ianPager.prototype.PageCount = function() {
	 return Math.ceil(parseFloat(this.RecordCount()) / parseFloat(this.PageSize()));
}

/*
获取或设置文本框和翻页区域的样式风格。
*/
ianPager.prototype.TranslatePageAreaStyle = function() {
	if(arguments.length==0){var obj = this.ViewState["TranslatePageAreaStyle"];return obj==null?"text-align:right;word-wrap:break-word;width:50%;height:25px;padding:0px;margin:0px;":obj;}
	else{this.ViewState["TranslatePageAreaStyle"] = arguments[0];}
}

/*
获取或设置页索引文本框的显示方式。
*/
ianPager.prototype.ShowInputBox = function() {
	if(arguments.length==0){var obj = this.ViewState["ShowInputBox"];return obj==null?"Auto":obj;}
	else{this.ViewState["ShowInputBox"] = arguments[0];}
}

/*
获取或设置应用于页索引输入文本框的CSS类名。
*/
ianPager.prototype.InputBoxClass = function() {
	if(arguments.length==0){var obj = this.ViewState["InputBoxClass"];return obj==null?"":obj;}
	else{this.ViewState["InputBoxClass"] = arguments[0];}
}

/*
获取或设置页索引输入文本框的CSS样式文本。
*/
ianPager.prototype.InputBoxStyle = function() {
	if(arguments.length==0){var obj = this.ViewState["InputBoxStyle"];return obj==null?"":obj;}
	else{this.ViewState["InputBoxStyle"] = arguments[0];}
}

/*
获取或设置页索引页索引输入文本框前的文本字符串值。
*/
ianPager.prototype.TextBeforeInputBox = function() {
	if(arguments.length==0){var obj = this.ViewState["TextBeforeInputBox"];return obj==null?"":obj;}
	else{this.ViewState["TextBeforeInputBox"] = arguments[0];}
}

/*
获取或设置页索引文本输入框后的文本内容字符串值。
*/
ianPager.prototype.TextAfterInputBox = function() {
	if(arguments.length==0){var obj = this.ViewState["TextAfterInputBox"];return obj==null?"":obj;}
	else{this.ViewState["TextAfterInputBox"] = arguments[0];}
}

/*
获取或设置提交按钮上的文本。
*/
ianPager.prototype.SubmitButtonText = function() {
	if(arguments.length==0){var obj = this.ViewState["SubmitButtonText"];return obj==null?"go":obj;}
	else{this.ViewState["SubmitButtonText"] = arguments[0];}
}

/*
获取或设置应用于提交按钮的CSS类名。
*/
ianPager.prototype.SubmitButtonClass = function() {
	if(arguments.length==0){var obj = this.ViewState["SubmitButtonClass"];return obj==null?"":obj;}
	else{this.ViewState["SubmitButtonClass"] = arguments[0];}
}

/*
获取或设置应用于提交按钮的CSS样式。
*/
ianPager.prototype.SubmitButtonStyle = function() {
	if(arguments.length==0){var obj = this.ViewState["SubmitButtonStyle"];return obj==null?"":obj;}
	else{this.ViewState["SubmitButtonStyle"] = arguments[0];}
}

/*
获取或设置自动显示页索引输入文本框的最低起始页数。
/// <remarks>
/// 当 ShowInputBox 设为Auto（默认）并且要分页的数据的总页数达到该值时会自动显示页索引输入文本框，默认值为30。该选项当 ShowInputBox 设为Never或Always时没有任何作用。
/// </remarks>
*/
ianPager.prototype.ShowBoxThreshold = function() {
	if(arguments.length==0){var obj = this.ViewState["ShowBoxThreshold"];return obj==null?30:obj;}
	else{this.ViewState["ShowBoxThreshold"] = arguments[0];}
}

/*
获取或设置显示用户自定义信息区的方式。
/// <remarks>
/// 该属性值设为Left或Right时会在分页导航元素左边或右边划出一个专门的区域来显示有关用户自定义信息，设为Never时不显示。
/// </remarks>
*/
ianPager.prototype.ShowCustomInfoSection = function() {
	if(arguments.length==0){var obj = this.ViewState["ShowCustomInfoSection"];return obj==null?"Never":obj;}
	else{this.ViewState["ShowCustomInfoSection"] = arguments[0];}
}

/*
获取或设置用户自定义信息区文本的对齐方式
*/
ianPager.prototype.CustomInfoTextAlign = function() {
	if(arguments.length==0){var obj = this.ViewState["CustomInfoTextAlign"];return obj==null?"left":obj;}
	else{this.ViewState["CustomInfoTextAlign"] = arguments[0];}
}

/*
获取或设置用户自定义信息区的宽度
*/
ianPager.prototype.CustomInfoSectionWidth = function() {
	if(arguments.length==0){var obj = this.ViewState["CustomInfoSectionWidth"];return obj==null?"40%":obj;}
	else{this.ViewState["CustomInfoSectionWidth"] = arguments[0];}
}

/*
获取或设置用户自定义信息区的宽度
*/
ianPager.prototype.CustomInfoClass = function() {
	if(arguments.length==0){var obj = this.ViewState["CustomInfoClass"];return obj==null?this.CssClass():obj;}
	else{this.ViewState["CustomInfoClass"] = arguments[0];}
}

/*
获取或设置应用于用户自定义信息区的CSS样式文本
*/
ianPager.prototype.CustomInfoStyle = function() {
	if(arguments.length==0){var obj = this.ViewState["CustomInfoStyle"];return obj==null?"":obj;}
	else{this.ViewState["CustomInfoStyle"] = arguments[0];}
}

/*
获取或设置在显示在用户自定义信息区的用户自定义文本
*/
ianPager.prototype.CustomInfoText = function() {
	if(arguments.length==0){var obj = this.ViewState["CustomInfoText"];return obj==null?"":obj;}
	else{this.ViewState["CustomInfoText"] = arguments[0];}
}

/*
获取或设置一个值，该值指定是否总是显示分页按件，即使要分页的数据只有一页。

/// <remarks>
/// 默认情况下，当要分页的数据小于两页时，不会在页面上显示任何内容，将此属性值设为true时，即使总页数只有一页，也将显示分页导航元素。
/// </remarks>
*/
ianPager.prototype.AlwaysShow = function() {
	if(arguments.length==0){var obj = this.ViewState["AlwaysShow"];return obj==null?false:obj;}
	else{this.ViewState["AlwaysShow"] = arguments[0];}
}

/*
获取或设置一个值，该值指定是否总是显示分页按件，即使要分页的数据只有一页。
/// </summary>
/// <remarks>
/// 默认情况下，当要分页的数据小于两页时，不会在页面上显示任何内容，将此属性值设为true时，即使总页数只有一页，也将显示分页导航元素。
/// </remarks>
*/
ianPager.prototype.Version = function() {
	 return this.version;
}

/*
/// <summary>
/// 获取或设置一个值，该值指定当CustomPageHref不为空时，Url 是否需要移除特定的参数
/// </summary>
/// <remarks>
/// 该值必须是在 UrlPaging 为 True 时才可使用。<br />
/// 该值一般情况下不会使用，只有当 CustomPageHref不为空时,用来移除 Url 上的一些多余参数
/// </remarks>
*/
ianPager.prototype.CustomPageHrefRemoveParameter = function() {
	if(arguments.length==0){var obj = this.ViewState["CustomPageHrefRemoveParameter"];return obj==null?[]:obj;}
	else{this.ViewState["CustomPageHrefRemoveParameter"] = arguments[0];}
}

/*
/// <summary>
/// 获取或设置一个值，该值指定是否用特定的 Url 指向另一页
/// </summary>
/// <remarks>
/// 该值必须是在 UrlPaging 为 True 时才可使用。<br />
/// 该值一般情况下不会使用，只有当使用 HttpHanlder 自定义页面的时候用得到
/// </remarks>
*/
ianPager.prototype.CustomPageHref = function() {
	if(arguments.length==0){var obj = this.ViewState["CustomPageHref"];return obj==null?"":obj;}
	else{this.ViewState["CustomPageHref"] = arguments[0];}
}

/*
/// <summary>
/// 获取或设置一个值，该值指定是否用特定js函数来代替页面的Url，如果该值不为空，则其他和Url参数相关的一切设置都将失效
/// </summary>
*/
ianPager.prototype.CustomJsPageFunction = function() {
	if(arguments.length==0){var obj = this.ViewState["CustomJsPageFunction"];return obj==null?"":obj;}
	else{this.ViewState["CustomJsPageFunction"] = arguments[0];}
}

/*
获取或设置在客户端呈现的级联样式表 (CSS) 类。
*/
ianPager.prototype.CssClass = function() {
	if(arguments.length==0){var obj = this.ViewState["CssClass"];return obj==null?"":obj;}
	else{this.ViewState["CssClass"] = arguments[0];}
}

/*
获取或设置翻页控件宽度
*/
ianPager.prototype.Width = function() {
	if(arguments.length==0){var obj = this.ViewState["Width"];return obj==null?"":obj;}
	else{this.ViewState["Width"] = arguments[0];}
}

/*
获取或设置翻页控件高度
*/
ianPager.prototype.Height = function() {
	if(arguments.length==0){var obj = this.ViewState["Height"];return obj==null?"":obj;}
	else{this.ViewState["Height"] = arguments[0];}
}

/*
    格式化字符串
*/
ianPager.prototype.Format = function()
{		 
    var str = arguments[0];
    var len = arguments.length;
	for (var i=1; i<len; i++)
	{   
	    var arg = arguments[i];
	    if(arg)
	    {
		    str=str.replace(new RegExp("\\{"+(i-1)+"\\}","ig"),arg); 
		}
		else
		{
		    str=str.replace(new RegExp("\\{"+(i-1)+"\\}","ig"),""); 
		}
	}
	return str; 
}



/*
创建第一页、上一页、下一页及最后一页分页按钮。
*/
ianPager.prototype.CreateNavigationButton = function (btnname) {
    if (!this.ShowFirstLast() && (btnname == "first" || btnname == "last")) { return; }
    if (!this.ShowPrevNext() && (btnname == "prev" || btnname == "next")) { return; }

    var linktext = "", html = [];
    var disabled = false;
    var pageIndex = 0;
    var imgButton = (this.PagingButtonType() == "Image" && this.NavigationButtonType() == "Image");
    if (btnname == "prev" || btnname == "first") {
        disabled = (this.CurrentPageIndex() <= 1);
        if (!this.ShowDisabledButtons() && disabled) { return; }
        pageIndex = (btnname == "first" || this.CurrentPageIndex() == 1) ? 1 : (this.CurrentPageIndex() - 1);
        if (imgButton) {
            if (!disabled) {
                html.push("<a");
                html.push(this.AddToolTip(pageIndex));

				var urlcol = {};
                urlcol[this.UrlPageIndexName()] = pageIndex;


                if(this.CustomJsPageFunction()!="" && typeof(this.CustomJsPageFunction())=="string")
                {
                    html.push(" href=\"#\" onclick=\"" + this.Format(this.CustomJsPageFunction(),pageIndex) +";return false;\">");
                }
                else
                {
                    html.push(" href=\"" + this.BuildUrlString(urlcol) + "\">");
                }
                html.push("<img border=\"0\" align=\"" + this.ButtonImageAlign() + "\" src=\"" + this.ImagePath() + btnname + this.DisabledButtonImageNameExtension() + this.ButtonImageExtension() + "\" />");
                html.push("</a>");
            }
            else {
                html.push("<span><img border=\"0\" align=\"" + this.ButtonImageAlign() + "\" src=\"" + this.ImagePath() + btnname + this.ButtonImageNameExtension() + this.ButtonImageExtension() + "\" /></span>");
            }
        }
        else {
            var linktext = (btnname == "prev") ? this.PrevPageText() : this.FirstPageText();
            html.push(disabled ? "<span" : "<a");
            if (disabled) {
                html.push(" color=\"" + this.PrevFirstAndNestLastDisabledColor() + "\"");
            }
            else {
                if (this.CssClass() != "") { html.push(" class=\"" + this.CssClass() + "\""); }
                html.push(this.AddToolTip(pageIndex));

                if(this.CustomJsPageFunction()!="" && typeof(this.CustomJsPageFunction())=="string")
                {
                    html.push(" href=\"#\" onclick=\"" + this.Format(this.CustomJsPageFunction(),pageIndex) +";return false;\"");
                }
                else
                {
                    var urlcol = {};
                    urlcol[this.UrlPageIndexName()] = pageIndex;
                    html.push(" href=\"" + this.BuildUrlString(urlcol) + "\"");
                }

            }
            html.push(">");
            html.push(linktext)
            html.push(disabled ? "</span>" : "</a>");
       } 
    }
    else {
        disabled = (this.CurrentPageIndex() >= this.PageCount());
        if (!this.ShowDisabledButtons() && disabled) { return; };

        pageIndex = (btnname == "last") ? this.PageCount() : (this.CurrentPageIndex() + 1);

        if (imgButton) {
            if (!disabled) {
                html.push("<a");
                html.push(this.AddToolTip(pageIndex));

                var urlcol = {};
                urlcol[this.UrlPageIndexName()] = pageIndex;
                
                if(this.CustomJsPageFunction()!="" && typeof(this.CustomJsPageFunction())=="string")
                {
                    html.push(" href=\"#\" onclick=\"" + this.Format(this.CustomJsPageFunction(),pageIndex) +";return false;\">");
                }
                else
                {
                    html.push(" href=\"" + this.BuildUrlString(urlcol) + "\">");
                }

                html.push("<img border=\"0\" align=\"" + this.ButtonImageAlign() + "\" src=\"" + this.ImagePath() + btnname + this.DisabledButtonImageNameExtension() + this.ButtonImageExtension() + "\" />");
                html.push("</a>");
            }
            else {
                html.push("<span><img border=\"0\" align=\"" + this.ButtonImageAlign() + "\" src=\"" + this.ImagePath() + btnname + this.ButtonImageNameExtension() + this.ButtonImageExtension() + "\" /></span>");
            }
        }
        else {
            var linktext = (btnname == "next") ? this.NextPageText() : this.LastPageText();
            html.push(disabled ? "<span" : "<a");
            if (disabled) {
                html.push(" color=\"" + this.PrevFirstAndNestLastDisabledColor() + "\"");
            }
            else {
                if (this.CssClass() != "") {
                    html.push(" class=\"" + this.CssClass() + "\"");
                }
                html.push(this.AddToolTip(pageIndex));
                var urlcol = {};
                
                if(this.CustomJsPageFunction()!="" && typeof(this.CustomJsPageFunction())=="string")
                {
                    html.push(" href=\"#\" onclick=\"" + this.Format(this.CustomJsPageFunction(),pageIndex) +";return false;\"");
                }
                else
                {
                    urlcol[this.UrlPageIndexName()] = pageIndex;
                    html.push(" href=\"" + this.BuildUrlString(urlcol) + "\"");
                }
            }
            html.push(">");
            html.push(linktext)
            html.push(disabled ? "</span>" : "</a>");
        }
    }
    if (this.ShowWriteButtonSpace()) {
        html.push(this.WriteButtonSpace());
    }
    return html.join('');
}

/*
创建分页数值导航按钮。
@pageIndex 要创建按钮的页索引的值。
*/
ianPager.prototype.CreateNumericButton = function(pageIndex)
{
    var isCurrent = (pageIndex == this.CurrentPageIndex());
    var html = [];
    
    if (this.PagingButtonType() == "Image" && this.NumericButtonType() == "Image")
    {
        if (!isCurrent)
        {
            html.push("<a");
            html.push(this.AddToolTip(pageIndex));
            
            if(this.CustomJsPageFunction()!="" && typeof(this.CustomJsPageFunction())=="string")
            {
                html.push(" href=\"#\" onclick=\"" + this.Format(this.CustomJsPageFunction(),pageIndex) +";return false;\">");
            }
            else
            {
                var urlcol ={};
                urlcol[this.UrlPageIndexName()] = pageIndex;
                html.push(" href=\""+this.BuildUrlString(urlcol)+"\">");
            }
            html.push(this.CreateNumericImages(pageIndex, false));
            html.push("</a>");
        }
        else
        {
            html.push(this.CreateNumericImages(pageIndex, true));
        }
    }
    else
    {
        if (isCurrent)
        {
            html.push("<span");
            if(this.CurrentPageIndexCss()!="")
            {
                html.push(" class=\""+ this.CurrentPageIndexCss() +"\"");
            }
            if(this.CurrentPageIndexStyle()!="")
            {
                html.push(" style=\""+ this.CurrentPageIndexStyle() +"\"");
            }
            html.push(">");
            if (this.NumericButtonTextFormatString() != "") {
                html.push(this.Format(this.NumericButtonTextFormatString(), pageIndex));
            }
            else {
                html.push(pageIndex);
            }
            html.push("</span>");
        }
        else
        {
            html.push("<a");
            html.push(this.AddToolTip(pageIndex));
            
            if(this.CustomJsPageFunction()!="" && typeof(this.CustomJsPageFunction())=="string")
            {
                html.push(" href=\"#\" onclick=\"" + this.Format(this.CustomJsPageFunction(),pageIndex) +";return false;\">");
            }
            else
            {
                var urlcol ={};
                urlcol[this.UrlPageIndexName()] = pageIndex;
                html.push(" href=\""+this.BuildUrlString(urlcol)+"\">");
            }
			if(this.NumericButtonTextFormatString()!="")
			{
				html.push(this.Format(this.NumericButtonTextFormatString(),pageIndex));
			}
			else
			{
	            html.push(pageIndex);
			}
            html.push("</a>");
        }
    }
    if(this.ShowWriteButtonSpace())
    {
        html.push(this.WriteButtonSpace());
    }
    return html.join('');
}
/*
创建“更多页”（...）按钮。
@pageIndex 导航按钮对应的页索引。
*/
ianPager.prototype.CreateMoreButton = function(pageIndex)
{
    var html = [];
    html.push("<a");
    html.push(this.AddToolTip(pageIndex));
    
    if(this.CustomJsPageFunction()!="" && typeof(this.CustomJsPageFunction())=="string")
    {
        html.push(" href=\"#\" onclick=\"" + this.Format(this.CustomJsPageFunction(),pageIndex) +";return false;\"");
    }
    else
    {
        var urlcol ={};
        urlcol[this.UrlPageIndexName()] = pageIndex;
        html.push(" href=\""+this.BuildUrlString(urlcol)+"\"");
    }
    if (this.PagingButtonType() == "Image" && this.MoreButtonType() == "Image")
    {
        html.push(">");
        html.push("<img border=\"0\" align=\""+ this.ButtonImageAlign() +"\" src=\""+ this.ImagePath() + "more" + this.ButtonImageNameExtension() + this.ButtonImageExtension() +"\" />");
    }
    else
    {
        html.push(">");
        html.push("...");
    }
    html.push("</a>");
    if(this.ShowWriteButtonSpace())
    {
        html.push(this.WriteButtonSpace());
    }
    return html.join('');
}

/*
创建页索引图片按钮。
@index 页索引数值。
@isCurrent 是否是当前页索引。
*/
ianPager.prototype.CreateNumericImages = function (index, isCurrent) {
    var html = [];
    var str = new String(index);
    var len = str.length;
    for (var i = 0; i < len; i++) {
        html.push("<img border=\"0\" align=\"" + this.ButtonImageAlign() + "\" src=\"" + this.ImagePath() + str.substr(i,1) + ((isCurrent == true) ? this.CpiButtonImageNameExtension() : this.ButtonImageNameExtension()) + this.ButtonImageExtension() + "\" />");
    }
    return html.join('');
}

/*
在分页导航元素间加入空格。
*/
ianPager.prototype.WriteButtonSpace = function()
{
    var html = [];
    html.push("<span");
    if(this.PagingButtonSpacingCssClass()!="")
    {
        html.push(" class=\""+ this.PagingButtonSpacingCssClass() +"\"");
    }
    if(this.PagingButtonSpacingStyle()!="")
    {
        html.push(" style=\""+ this.PagingButtonSpacingStyle() +"\"");
    }
    html.push(" width=\""+ this.PagingButtonSpacing() +"\"");
    html.push("</span>");
    return html.join("");
}

/*
加入导航按钮提示文本。
@pageIndex 导航按钮对应的页索引。
*/
ianPager.prototype.AddToolTip = function(pageIndex)
{
    if(this.ShowNavigationToolTip())
    {
        return " title=\""+ this.Format(this.NavigationToolTipTextFormatString(), new String(pageIndex)) +"\"";
    }
}

/*
当使用Url分页方式时，在当前Url上加入分页参数，若该参数存在，则改变其值。
@col {{}} 要加入到新Url中的参数名和值的集合

分页导航按钮的超链接字符串，包括分页参数。
*/
ianPager.prototype.BuildUrlString = function(col) {
    if (!this.CustomPageHref().length == 0) {
        this.currentUrl = this.CustomPageHref();
    }
    var tempstr = "";

    if (this.urlParams == null) {
        for (var i in col) {
            tempstr += "&" + i + "=" + col[i];
        }
        return this.currentUrl + "?" + tempstr.substr(1);
    }

    var newCol = this.urlParams;
    for (var i in col) {

        newCol[i.toLocaleLowerCase()] = col[i];
    }

    if (this.CustomPageHref().length != 0) {
        var strParameter = this.CustomPageHrefRemoveParameter();
        for (var j in strParameter) {
            if (newCol[j] != null && newCol[j] != "") {
                delete newCol[j];
            }
        }
    }

    var sb = [];
    for (var i in newCol) {
        if (i != null && i != "") {
            sb.push("&" + i + "=" + newCol[i]);
        }
    }
    return this.currentUrl + "?" + sb.join('').substr(1);
}

/*
要在客户端呈现 HTML 内容的输出流
*/
ianPager.prototype.Render = function()
{
    document.write(this.Html());
}
/*
分页控件的 HTML 内容的输出流
*/
ianPager.prototype.Html = function () {
    //
    if (this.PageCount() <= 1 && !this.AlwaysShow()) {
        return;
    }

    var html = [];
    html.push(this.RenderBeginTag());

    if (this.ShowCustomInfoSection() == "Left") {
        html.push(this.CustomInfoText());
        html.push("</td>")
        html.push("<td");
        html.push(this.WriteCellAttributes(false));
        html.push(">");
    }

    var midpage = parseInt((this.CurrentPageIndex() - 1) / this.NumericButtonCount());
    var pageoffset = midpage * this.NumericButtonCount();

    if (this.PagingButtonPosition() != "Fixed" && this.PageCount() > this.NumericButtonCount()) {
        var pagePosition = this.PagingButtonPosition();
        switch (pagePosition) {
            case "End":
                if (this.CurrentPageIndex() > this.NumericButtonCount()) {
                    pageoffset = this.CurrentPageIndex() - this.NumericButtonCount();
                }
                break;
            case "Center":
                var startOffset = this.CurrentPageIndex() - parseInt(Math.ceil(this.NumericButtonCount() / 2));
                if (startOffset > 0) {
                    pageoffset = startOffset;
                    if (pageoffset > (this.PageCount() - this.NumericButtonCount())) {
                        pageoffset = this.PageCount() - this.NumericButtonCount();
                    }
                }
                break;
            case "Beginning":
                pageoffset = this.CurrentPageIndex() - 1;
                if (pageoffset + this.NumericButtonCount() > this.PageCount())
                    pageoffset = this.PageCount() - this.NumericButtonCount();
                break;
        }
    }

    

    var endpage = ((pageoffset + this.NumericButtonCount()) > this.PageCount()) ? this.PageCount() : (pageoffset + this.NumericButtonCount());

    html.push(this.CreateNavigationButton("first"));
    html.push(this.CreateNavigationButton("prev"));

    if (this.ShowPageIndex()) {
        if ((this.CurrentPageIndex() > this.NumericButtonCount()) && this.ShowMoreButton()) { html.push(this.CreateMoreButton(pageoffset)); };
        for (var i = pageoffset + 1; i <= endpage; i++) {
            html.push(this.CreateNumericButton(i));
        }
        if ((this.PageCount() > this.NumericButtonCount() && endpage < this.PageCount()) && this.ShowMoreButton()) {
            html.push(this.CreateMoreButton(endpage + 1));
        }
    }


    html.push(this.CreateNavigationButton("next"));
    html.push(this.CreateNavigationButton("last"));

    if ((this.ShowInputBox() == "Always") || (this.ShowInputBox() == "Auto" && this.PageCount() >= this.ShowBoxThreshold())) {
        html.push("&nbsp;&nbsp;&nbsp;&nbsp;");
        if (this.TextBeforeInputBox() != "") {
            html.push(this.TextBeforeInputBox());
        }
        html.push("<input");
        html.push(" type=\"text\"");
        if (this.InputBoxStyle() != "") {
            html.push(" style=\"" + this.InputBoxStyle() + "\"");
        }
        if (this.InputBoxClass() != "") {
            html.push(" class=\"" + this.InputBoxClass() + "\"");
        }
        if (this.PageCount() <= 1 && this.AlwaysShow()) {
            html.push(" readonly=\"readonly\"");
        }
        html.push(" name=\"" + this.UrlPageIndexName() + "\"");
        html.push(" id=\"ID_" + this.UrlPageIndexName() + "\"");
        var clickScript = "var el = document.getElementById('ID_" + this.UrlPageIndexName() + "');if(!isNaN(el.value)){if(el.value<1 || el.value>" + this.PageCount() + "){alert('页索引值必须介于1和" + this.PageCount() + "之间！');el.select();return false;}}else{alert('输入的页索引无效');el.select();return false;};var BuildUrlString = function(key,value){ var loc=window.location.search.substring(1); var params=loc.split('&'); if(params.length<=1||(params.length==2&&params[0].toLowerCase()==key)) return location.pathname+'?'+key+'='+value; var newparam=''; var flag=false; for(i=0;i<params.length;i++){ if(params[i].split('=')[0].toLowerCase()==key.toLowerCase()){ params[i]=key+'='+value; flag=true; break; } } for(i=0;i<params.length;i++){ newparam+=params[i]+'&'; } ;if(flag) newparam=newparam.substring(0,newparam.length-1); else newparam+=key+'='+value; return location.pathname+'?'+newparam; };location.href=BuildUrlString('" + this.UrlPageIndexName() + "',el.value);";
        html.push(" onkeydown=\"if(event.keyCode!=13){return ;}" + clickScript + "\"");
        html.push("/>");
        if (this.TextAfterInputBox() != "") {
            html.push(this.TextAfterInputBox());
        }

        html.push("<input");
        html.push(" type=\"button\"");
        html.push(" name=\"" + this.UrlPageIndexName() + "_btn\"");
        html.push(" id=\"ID_btn" + this.UrlPageIndexName() + "\"");
        html.push(" value=\"" + this.SubmitButtonText() + "\"");
        if (this.SubmitButtonClass() != "") {
            html.push(" class=\"" + this.SubmitButtonClass() + "\"");
        }
        if (this.SubmitButtonStyle() != "") {
            html.push(" style=\"" + this.SubmitButtonStyle() + "\"");
        }
        if (this.PageCount() <= 1 && this.AlwaysShow()) {
            html.push(" disabled=\"disabled\"");
        }
        html.push(" onclick=\"" + clickScript + "\"");
        html.push("/>");

        if (this.ShowCustomInfoSection() == "Right") {
            html.push("</td>");
            html.push("<td");
            html.push(this.WriteCellAttributes(false));
            html.push(">");
            html.push(this.CustomInfoText());
        }
    }

    html.push(this.RenderEndTag());
    return html.join('');
}


/*
要在客户端呈现 HTML 内容的输出流   之前
*/
ianPager.prototype.RenderBeginTag = function()
{
    var href = window.location.href;
    this.currentUrl = window.location.search!=""?href.substr(0, href.indexOf(window.location.search)):href;
    var params =  window.location.search.substring(1).split("&");

    
    for(var i=0;i<params.length;i++)
    {    
        var item = params[i];
        this.urlParams[item.split("=")[0]] = item.split("=")[1]
    }
    var index = 1;
    if(this.urlParams[this.UrlPageIndexName()]!=null){ index = parseInt(this.urlParams[this.UrlPageIndexName()]);};
    
    
    var showPager=(parseInt(this.PageCount())>1||(parseInt(this.PageCount())<=1&&this.AlwaysShow()));
    
    var html = [];
    html.push("<!--\r\n");
    html.push(this.Format("                           ianPager Start Version:{0}\r\n", this.Version()));
    html.push(" Copyright:2003-2010 Lion (lion.net@163.com , idoall.org , www.lionsky.net)\r\n");
    html.push("-->");
    
    if((this.ShowCustomInfoSection()=="Left"||this.ShowCustomInfoSection()=="Right")&&showPager)
    {       
        html.push("<table boder=\"0\" cellpadding=\"0\" cellspacing=\"0\" "+ ((this.Width()=="")?"":"width=\""+ this.Width() +"\" ") +""+ ((this.CssClass()=="")?"":"class=\""+ this.CssClass() +"\" ") +""+ ((this.Height()=="")?"":"width=\""+ this.Height() +"\" ") +">");
        html.push("<tr>");
        html.push("<td");
        html.push(this.WriteCellAttributes(true));
        html.push(">");
    }    
    return html.join("");
}

/*
要在客户端呈现 HTML 内容的输出流   之后
*/
ianPager.prototype.RenderEndTag = function()
{
    var html = [];
    if(this.ShowCustomInfoSection()=="Left"||this.ShowCustomInfoSection()=="Right")
    {     
        html.push("</td>");
        html.push("</tr>");
        html.push("</table>");
    }
    html.push("\r\n<!--\r\n");
    html.push(this.Format("                           ianPager End Version:{0}\r\n", this.Version()));    
    html.push("-->");
    return html.join("");
}

/*
为用户自定义信息区和页导航按钮区和td添加属性。
*/
ianPager.prototype.WriteCellAttributes = function(leftCell)
{
    var customUnit = this.CustomInfoSectionWidth();
    var html = [];
    if (this.ShowCustomInfoSection() == "Left" && leftCell || this.ShowCustomInfoSection() == "Right" && !leftCell)
    {
        html.push((this.CustomInfoClass()=="")?"":" class=\""+ this.CustomInfoClass() +"\"");
        html.push((this.CustomInfoStyle()=="")?"":" style=\""+ this.CustomInfoStyle() +"\"");
        html.push(" width=\""+ this.CustomInfoSectionWidth() +"\"");
        html.push(" align=\""+ this.CustomInfoTextAlign() +"\"");
    }   
    else
    {
        var width = this.CustomInfoSectionWidth();
        if(width.indexOf("%")!=-1)
        {
            var customUnit = 100 - parseInt(width.substr(0, width.indexOf("%")))
            html.push(" width=\""+ customUnit +"%\"");
        }
        html.push(" valign=\"bottom\"");
        html.push(" align=\"right\"");
    }   
    html.push(" nowrap=\"nowrap\"");
    return html.join('');  
}