
function getNavString() {
    var navArr = new Array();
    navArr.push("<a href=\"index.html\">基本功能</a>")
    navArr.push(" | ")
    navArr.push("<a href=\"NavigationButtons.html\">分页按钮属性效果</a>")
    navArr.push(" | ")
    navArr.push("<a href=\"CustomInfoSection.html\">自定义信息区</a>")
    navArr.push(" | ")
    navArr.push("<a href=\"imgButtoms.html\">使用图片按钮</a>")
    navArr.push("<br />")
    navArr.push("<a href=\"buttonsformat.html\">自定义导航按钮</a>")
    navArr.push(" | ")
    navArr.push("<a href=\"ajax.html\">ajax支持</a>")
    navArr.push(" | ")
    navArr.push("<a href=\"CurrentPageButtonPositions.html\">当前页索引按钮位置</a>")
    return (navArr.join(''));
}

function getTopNavString() {
    var navArr = new Array();
    navArr.push("<li><a href=\"../index.html\">home</a></li>");
    navArr.push("<li><a href=\"_ianpager.rar\">download</a></li>");
    return (navArr.join(''));
}