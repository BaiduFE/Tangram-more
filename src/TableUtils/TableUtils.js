/*
 * baidu.more.TableUtils
 *
 * path: TableUtils.js
 * author: wenyuxiang
 * version: 1.0.0
 * date: 2011/3/31
 */

function TableUtils(table){
    this.$table = table;
    this.update();
}
/**
 * 更新数据
 * 当表格的结构被TableUtils外部修改, TableUtils里的索引等数据会失效, 此时需要手动调用此方法
 * @param {Element?} table
 */
TableUtils.prototype.update = function (table){
    // todo: 增量更新
    this.$table = table = (table || this.$table);
    var cells;
    var numRows = table.rows.length;
    var numCols = 0;

    // 利用第一行的cells来计算numCols值
    if (numRows) {
        cells = table.rows[0].cells;
        var k = cells.length;
        if (k) while (k --) {
            numCols += (cells[k].colSpan || 1);
        }
    }
    this.numRows = numRows;
    this.numCols = numCols;

    // 初始化网格信息索引表, 二维表格
    var infoGrid = new Array(numRows);
    var rowIndex, cellIndex;
    for (rowIndex=0; rowIndex<numRows; rowIndex++) {
        infoGrid[rowIndex] = new Array(numCols);
    }
    // todo：是否需要对本身有问题的表格（比如说某一行少一个td）进行检测和补齐？
    this._infoGrid = infoGrid;
    // 逐行逐Cell的填充索引表
    for (rowIndex=0; rowIndex<numRows; rowIndex++) {
        cells = table.rows[rowIndex].cells;
        var infoRow = infoGrid[rowIndex];
        var numCells = cells.length;
        for (cellIndex=0; cellIndex<numCells; cellIndex++) {
            // 取得实际的Cell元素可能是TD或TH
            var cell = cells[cellIndex];
            var colIndex = cellIndex;
            var rowSpan = cell.rowSpan || 1;
            var colSpan = cell.colSpan || 1;
            // 如果目标位置已经被占用, 则记录到此行的下一个可用位置
            // 如上一行rowSpan下来的, 或者左边的cell的colSpan过来的
            while (infoRow[colIndex]) colIndex++;
            // 记录Cell的必要信息
            var cellInfo = {
                rowIndex: rowIndex, // 行号
                cellIndex: cellIndex,
                colIndex: colIndex, // 列号, 大于或等于cellIndex
                rowSpan: rowSpan, // 跨行数
                colSpan: colSpan // 跨列数
            };
            for (var i=0; i<rowSpan; i++) {
                for (var j=0; j<colSpan; j++) {
                    infoGrid[rowIndex + i][colIndex + j] = cellInfo;
                }
            }
        }
    }
};
/**
 * 获取Cell所在行的行号
 * @param {Element} cell
 * @returns {Number}
 */
TableUtils.prototype.getCellRowIndex = function (cell){
    var table = this.$table;
    var cellIndex = cell.cellIndex;
    var rows = table.rows;
    var k = rows.length;
    if (k) while (k --) {
        if (rows[k].cells[cellIndex] == cell) {
            return k;
        }
    }
    return -1;
};
/**
 * 获取Cell的描述信息
 * 包含rowIndex,colIndex,cellIndex,rowSpan,colSpan五个属性
 * @param {Element} cell
 * @returns {Object}
 */
TableUtils.prototype.getCellInfo = function (cell){
    var cellIndex = cell.cellIndex;
    var rowIndex = this.getCellRowIndex(cell);
    // 从cellIndex往右遍历
    var infoRow = this._infoGrid[rowIndex];
    var numCols = this.numCols;
    var colIndex;
    for (colIndex=cellIndex; colIndex<numCols; colIndex++) {
        var cellInfo = infoRow[colIndex];
        if (cellInfo.rowIndex == rowIndex && cellInfo.cellIndex == cellIndex) {
            return cellInfo;
        }
    }
    return null;
};
/**
 * 根据行号和cellIndex取到Cell元素
 * @param {Number} rowIndex
 * @param {Number} cellIndex
 * @returns {Element}
 */
TableUtils.prototype.getCell = function (rowIndex, cellIndex){
    return rowIndex < this.numRows && this.$table.rows[rowIndex].cells[cellIndex] || null;
};
/**
 * 判断一个Cell是否能向右合并一个Cell
 * @param {Element} cell
 */
TableUtils.prototype.canMergeRight = function (cell){
    if (!cell) {
        return false;
    }
    var cellInfo = this.getCellInfo(cell);
    // 找到位于右方的那个Cell
    var rightColIndex = cellInfo.colIndex + cellInfo.colSpan;
    if (rightColIndex >= this.numCols) {
        // 如果处于最右边则不能向右合并
        return false;
    }
    var rightCellInfo = this._infoGrid[cellInfo.rowIndex][rightColIndex];
    // 当且仅当两个Cell的开始行号和结束行号一致时能进行合并
    return (rightCellInfo.rowIndex == cellInfo.rowIndex
        && rightCellInfo.rowSpan == cellInfo.rowSpan);
};
/**
 * 判断一个Cell是否能向下合并一个Cell
 * @param {Element} cell
 * @returns {Boolean}
 */
TableUtils.prototype.canMergeDown = function (cell){
    if (!cell) {
        return false;
    }
    var cellInfo = this.getCellInfo(cell);
    // 找到位于下方的那个Cell
    var downRowIndex = cellInfo.rowIndex + cellInfo.rowSpan;
    if (downRowIndex >= this.numRows) {
        // 如果处于最下边则不能向右合并
        return false;
    }
    var downCellInfo = this._infoGrid[downRowIndex][cellInfo.colIndex];
    // 当且仅当两个Cell的开始列号和结束列号一致时能进行合并
    return (downCellInfo.colIndex == cellInfo.colIndex
        && downCellInfo.colSpan == cellInfo.colSpan);
};
/**
 * 取出Node的所有子节点到一个DocumentFragment
 * @param {Node} node
 * @returns {DocumentFragment}
 */
TableUtils.prototype._extractContent = function (node){
    var fragment = node.ownerDocument.createDocumentFragment();
    while (node.firstChild) {
        fragment.appendChild(node.firstChild);
    }
    return fragment;
};
/**
 * 将B中的内容移动到A的末尾, 中间以br分隔
 * @param {Element} cellA
 * @param {Element} cellB
 */
TableUtils.prototype._moveContent = function (cellA, cellB){
    var cellBContent = this._extractContent(cellB);
    if (cellBContent.hasChildNodes()) {
        cellA.appendChild(cellA.ownerDocument.createElement('br'));
        cellA.appendChild(cellBContent);
    }
};
/**
 * 合并指定Cell和它右侧的Cell
 * @param {Element} cell
 */
TableUtils.prototype.mergeRight = function (cell){
    var cellInfo = this.getCellInfo(cell);
    // 找到位于右方的那个Cell
    var rightColIndex = cellInfo.colIndex + cellInfo.colSpan;
    var rightCellInfo = this._infoGrid[cellInfo.rowIndex][rightColIndex];
    var rightCell = this.getCell(rightCellInfo.rowIndex, rightCellInfo.cellIndex);
    // 合并
    cell.colSpan = cellInfo.colSpan + rightCellInfo.colSpan;
    this._moveContent(cell, rightCell);
    // 删掉被合并的Cell
    this._deleteCell(rightCell, rightCellInfo.rowIndex);
    this.update();
};
/**
 * 合并指定Cell和它下方的Cell
 * @param {Element} cell
 */
TableUtils.prototype.mergeDown = function (cell){
    var cellInfo = this.getCellInfo(cell);
    // 找到位于下方的那个Cell
    var downRowIndex = cellInfo.rowIndex + cellInfo.rowSpan;
    var downCellInfo = this._infoGrid[downRowIndex][cellInfo.colIndex];
    var downCell = this.getCell(downCellInfo.rowIndex, downCellInfo.cellIndex);
    // 合并
    cell.rowSpan = cellInfo.rowSpan + downCellInfo.rowSpan;
    this._moveContent(cell, downCell);
    // 删掉被合并的Cell
    this._deleteCell(downCell, downCellInfo.rowIndex);
    this.update();
};
/**
 * 判断一个Cell是否能被拆分
 * @param {Element} cell
 */
TableUtils.prototype.canSplitCell = function (cell){
    return cell && (cell.rowSpan > 1 || cell.colSpan > 1);
};
/**
 * 将跨行列的Cell拆分单位1的Cells
 * @param {Element} cell
 */
TableUtils.prototype.splitCell = function (cell){
    var infoGrid = this._infoGrid;
    var cellInfo = this.getCellInfo(cell);
    var cellRowIndex = cellInfo.rowIndex;
    var cellColIndex = cellInfo.colIndex;

    var colSpan = cellInfo.colSpan;
    var k = cellInfo.rowSpan;

    // 修改Cell的rowSpan和colSpan
    cell.rowSpan = 1;
    cell.colSpan = 1;

    // 在之前colSpan和rowSpan的范围内插入单位1的Cell
    while (k --) {
        var rowIndex = cellRowIndex + k;
        var infoRow = infoGrid[rowIndex];
        // 计算各行的Cell的插入位置
        var leftColIndex = cellColIndex;
        var leftCellIndex = -1;
        if (leftColIndex) while (leftColIndex --) {
            var leftCellInfo = infoRow[leftColIndex];
            if (leftCellInfo.rowIndex == rowIndex) {
                leftCellIndex = leftCellInfo.cellIndex;
                break;
            }
        }
        // 插入拆分出来的小Cell
        var tableRow = this.$table.rows[rowIndex];
        var j = colSpan;
        while (j --) {
            if (k || j) {
                // 左上角的Cell保留原Cell, 不需要插入
                tableRow.insertCell(leftCellIndex + (!k ? 2 : 1));
            }
        }
    }
    this.update();
};
/**
 * 删除指定行
 * @param {Number} rowIndex
 */
TableUtils.prototype.deleteRow = function (rowIndex){
    var infoRow = this._infoGrid[rowIndex];
    var numCols = this.numCols;
    var lastCellInfo;
    var droppedCount = 0;
    for (var colIndex=0; colIndex<numCols; colIndex++) {
        var cellInfo = infoRow[colIndex];
        // 跳过已经处理过的Cell
        if (lastCellInfo && lastCellInfo === cellInfo) {
            continue;
        }
        lastCellInfo = cellInfo;
        var cell = this.getCell(cellInfo.rowIndex, cellInfo.cellIndex - droppedCount);
        // 如果Cell的rowSpan大于1, 表明它是从别的行rowSpan过来的, 修改它的rowSpan
        if (cell.rowSpan > 1) {
            cell.rowSpan = -- cellInfo.rowSpan;
            // 如果是Cell所在行，需要将其搬到下一行
            if (cellInfo.rowIndex == rowIndex) {
                var nextRowIndex = rowIndex + 1;
                var nextRowLeftCellIndex = colIndex == 0 ? 0 : this._infoGrid[nextRowIndex][colIndex - 1].cellIndex;
                var nextRowLeftCell = this.getCell(nextRowIndex, nextRowLeftCellIndex + droppedCount);
                droppedCount ++;
                numCols --;
                this.$table.rows[nextRowIndex].insertBefore(cell, nextRowLeftCell.nextSibling);
            }
        }
    }
    this.$table.deleteRow(rowIndex);
    if(!this._preventUpdate) {
        this.update(this.$table);
    }
};
/**
 * 删除指定列
 * @param {Number} colIndex
 */
TableUtils.prototype.deleteCol = function (colIndex){
    var infoGrid = this._infoGrid;
    var tableRows = this.$table.rows;
    var numRows = this.numRows;
    var lastCellInfo;
    for (var rowIndex=0; rowIndex<numRows; rowIndex++) {
        var infoRow = infoGrid[rowIndex];
        var cellInfo = infoRow[colIndex];
        // 跳过已经处理过的Cell
        if (lastCellInfo && lastCellInfo === cellInfo) {
            continue;
        }
        lastCellInfo = cellInfo;
        var cell = this.getCell(cellInfo.rowIndex, cellInfo.cellIndex);
        // 如果Cell的colSpan大于1, 就修改colSpan, 否则就删掉这个Cell
        if (cell.colSpan > 1) {
            cell.colSpan --;
        } else {
            tableRows[rowIndex].deleteCell(cellInfo.cellIndex);
        }
    }
    if (!this._preventUpdate) {
        this.update(this.$table);
    }
};
/**
 * 删除多行
 * @param {Number} rowIndex
 * @param {Number} rowSpan
 */
TableUtils.prototype.deleteRows = function (rowIndex, rowSpan){
    rowSpan = rowSpan || 1;
    this._preventUpdate = true;
    while (rowSpan --) {
        this.deleteRow(rowIndex + rowSpan);
    }
    this._preventUpdate = false;
    this.update();
};
/**
 * 删除多列
 * @param {Number} colIndex
 * @param {Number} colSpan
 */
TableUtils.prototype.deleteCols = function (colIndex, colSpan){
    colSpan = colSpan || 1;
    this._preventUpdate = true;
    while (colSpan --) {
        this.deleteCol(colIndex + colSpan);
    }
    this._preventUpdate = false;
    this.update();
};
TableUtils.prototype.insertRow = function (rowIndex){
    var colIndex = 0;
    var numCols = this.numCols;
    var tableRow = this.$table.insertRow(rowIndex);
    if (rowIndex == 0 || rowIndex == this.numRows) {
        for (; colIndex < numCols; colIndex ++) {
            tableRow.insertCell(colIndex);
        }
    } else {
        var cellIndex = 0;
        var infoRow = this._infoGrid[rowIndex];
        for (; colIndex < numCols; colIndex ++) {
            var cellInfo = infoRow[colIndex];
            if (cellInfo.rowIndex < rowIndex) {
                var cell = this.getCell(cellInfo.rowIndex, cellInfo.cellIndex);
                cell.rowSpan = cellInfo.rowSpan + 1;
            } else {
                tableRow.insertCell(cellIndex ++);
            }
        }
    }
    this.update();
};
TableUtils.prototype.insertCol = function (colIndex){
    var infoGrid = this._infoGrid;
    var numRows = this.numRows;
    var rowIndex = 0;
    var tableRow;
    if (colIndex == 0) {
        for (; rowIndex < numRows; rowIndex ++) {
            tableRow = this.$table.rows[rowIndex];
            tableRow.insertCell(0);
        }
    } else if (colIndex == this.numCols) {
        for (; rowIndex < numRows; rowIndex ++) {
            tableRow = this.$table.rows[rowIndex];
            tableRow.insertCell(tableRow.cells.length);
        }
    } else {
        for (; rowIndex < numRows; rowIndex ++) {
            var cellInfo = infoGrid[rowIndex][colIndex];
            if (cellInfo.colIndex < colIndex) {
                var cell = this.getCell(cellInfo.rowIndex, cellInfo.cellIndex);
                cell.colSpan = cellInfo.colSpan + 1;
            } else {
                tableRow = this.$table.rows[rowIndex];
                tableRow.insertCell(cellInfo.cellIndex);
            }
        }
    }
    this.update();
};
/**
 * 获取一个TableRange包含的Cells
 * @param {Object} range
 */
TableUtils.prototype.getRangeCells = function (range){
    var infoGrid = this._infoGrid;
    var beginRowIndex = range.beginRowIndex;
    var beginColIndex = range.beginColIndex;
    var endRowIndex = range.endRowIndex;
    var endColIndex = range.endColIndex;
    var hash = {};
    var cells = [];

    // 遍历TableRange中的每个Tile
    for (var rowIndex = beginRowIndex; rowIndex < endRowIndex; rowIndex ++) {
        for (var colIndex = beginColIndex; colIndex < endColIndex; colIndex ++) {
            var cellInfo = infoGrid[rowIndex][colIndex];
            var cellRowIndex = cellInfo.rowIndex;
            var cellColIndex = cellInfo.colIndex;
            // 如果Cells里已经包含了此Cell则跳过
            var key = cellRowIndex + '|' + cellColIndex;
            if (hash[key]) continue;

            if (cellRowIndex < rowIndex || cellColIndex < colIndex
                || cellRowIndex + cellInfo.rowSpan > endRowIndex
                || cellColIndex + cellInfo.colSpan > endColIndex) {
                // 如果有Cell跨越了TableRange边界的情况, 则返回空
                return null;
            }

            hash[key] = 1;
            cells.push(this.getCell(cellRowIndex, cellInfo.cellIndex));
        }
    }
    return cells;
};
/**
 * 根据两个cell获取TableRange
 * @param {Element} cellA
 * @param {Element} cellB
 * @param {Boolean} autoExtend
 * @returns {Object}
 */
TableUtils.prototype.getRange = function (cellA, cellB, autoExtend){
    var cellAInfo = this.getCellInfo(cellA);
    if (cellA === cellB) {
        return {
            beginRowIndex: cellAInfo.rowIndex,
            beginColIndex: cellAInfo.colIndex,
            endRowIndex: cellAInfo.rowIndex + cellAInfo.rowSpan,
            endColIndex: cellAInfo.colIndex + cellAInfo.colSpan
        };
    }
    var infoGrid = this._infoGrid;
    var cellBInfo = this.getCellInfo(cellB);

    // 计算TableRange的四个边
    var beginRowIndex = Math.min(cellAInfo.rowIndex, cellBInfo.rowIndex);
    var beginColIndex = Math.min(cellAInfo.colIndex, cellBInfo.colIndex);
    var endRowIndex = Math.max(cellAInfo.rowIndex + cellAInfo.rowSpan,
        cellBInfo.rowIndex + cellBInfo.rowSpan);
    var endColIndex = Math.max(cellAInfo.colIndex + cellAInfo.colSpan,
        cellBInfo.colIndex + cellBInfo.colSpan);
    
    var numRows = this.numRows;
    var numCols = this.numCols;

    //todo 优化一下逻辑
    function checkRange(beginRowIndex, beginColIndex, endRowIndex, endColIndex){
        var overflowRowIndex = beginRowIndex;
        var overflowColIndex = beginColIndex;
        var overflowEndRowIndex = endRowIndex;
        var overflowEndColIndex = endColIndex;
        var rowIndex, colIndex;

        // 检查是否有超出TableRange左边界的情况
        if (beginColIndex > 0) {
            for (rowIndex=beginRowIndex; rowIndex<endRowIndex; rowIndex++) {
                var leftCellInfo = infoGrid[rowIndex][beginColIndex];
                var leftColIndex = leftCellInfo.colIndex;
                if (leftColIndex < beginColIndex) {
                    if (!autoExtend) return null;
                    overflowColIndex = Math.min(leftCellInfo.colIndex, overflowColIndex);
                }
            }
        }
        // 检查是否有超出TableRange右边界的情况
        if (endColIndex < numCols) {
            for (rowIndex=beginRowIndex; rowIndex<endRowIndex; rowIndex++) {
                var rightCellInfo = infoGrid[rowIndex][endColIndex - 1];
                var rightColIndex = rightCellInfo.colIndex + rightCellInfo.colSpan;
                if (rightColIndex > endColIndex) {
                    if (!autoExtend) return null;
                    overflowEndColIndex = Math.max(rightColIndex, overflowEndColIndex);
                }
            }
        }
        // 检查是否有超出TableRange上边界的情况
        if (beginRowIndex > 0) {
            for (colIndex=beginColIndex; colIndex<endColIndex; colIndex++) {
                var upCellInfo = infoGrid[beginRowIndex][colIndex];
                var upRowIndex = upCellInfo.rowIndex;
                if (upRowIndex < beginRowIndex) {
                    if (!autoExtend) return null;
                    overflowRowIndex = Math.min(upRowIndex, overflowRowIndex);
                }
            }
        }
        // 检查是否有超出TableRange下边界的情况
        if (endRowIndex < numRows) {
            for (colIndex=beginColIndex; colIndex<endColIndex; colIndex++) {
                var downCellInfo = infoGrid[endRowIndex - 1][colIndex];
                var downRowIndex = downCellInfo.rowIndex + downCellInfo.rowSpan;
                if (downRowIndex > endRowIndex) {
                    if (!autoExtend) return null;
                    overflowEndRowIndex = Math.max(downRowIndex, overflowEndRowIndex);
                }
            }
        }
        if (autoExtend) {
            if (overflowRowIndex == 0 &&
                overflowColIndex == 0 &&
                overflowEndRowIndex == numRows &&
                overflowEndRowIndex == numCols) {
                // 如果TableRange需要扩展到整个Table
                return {
                    beginRowIndex: 0,
                    beginColIndex: 0,
                    endRowIndex: numRows,
                    endColIndex: numCols
                };
            } else if (overflowRowIndex != beginRowIndex ||
                overflowColIndex != beginColIndex ||
                overflowEndRowIndex != endRowIndex ||
                overflowEndColIndex != endColIndex) {
                // 如果需要扩展TableRange
                return checkRange(overflowRowIndex,
                    overflowColIndex,
                    overflowEndRowIndex,
                    overflowEndColIndex);
            }
        }
        // 不需要扩展TableRange的情况
        return {
            beginRowIndex: beginRowIndex,
            beginColIndex: beginColIndex,
            endRowIndex: endRowIndex,
            endColIndex: endColIndex
        };
    }
    return checkRange(beginRowIndex, beginColIndex, endRowIndex, endColIndex);
};
/**
 * 删除Cell
 * @param {Element} cell
 * @param {Number?} rowIndex
 * @private
 */
TableUtils.prototype._deleteCell = function (cell, rowIndex){
    rowIndex = typeof rowIndex == 'number' ? rowIndex : this.getCellRowIndex(cell);
    var tableRow = this.$table.rows[rowIndex];
    tableRow.deleteCell(cell.cellIndex);
};
/**
 * 合并TableRange为一个Cell
 * @param {Object} range
 */
TableUtils.prototype.mergeRange = function (range){
    var infoGrid = this._infoGrid;
    // 拿到左上角的那个Cell
    var leftTopCell = this.getCell(range.beginRowIndex,
        infoGrid[range.beginRowIndex][range.beginColIndex].cellIndex);
    // 删除剩余的Cells
    var cells = this.getRangeCells(range);
    var k = cells.length;
    while (k --) {
        var cell = cells[k];
        if (cell !== leftTopCell) {
            this._moveContent(leftTopCell, cell);
            this._deleteCell(cell);
        }
    }
    // 修改左上角Cell的rowSpan和colSpan
    leftTopCell.rowSpan = range.endRowIndex - range.beginRowIndex;
    leftTopCell.colSpan = range.endColIndex - range.beginColIndex;
    this.update();
};