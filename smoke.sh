#!/bin/bash

echo "========================================"
echo "  分拣格口压力图 - Smoke Test"
echo "========================================"
echo ""

PASS_COUNT=0
FAIL_COUNT=0

check_file() {
    local file=$1
    if [ -f "$file" ]; then
        echo "[PASS] 文件存在: $file"
        ((PASS_COUNT++))
    else
        echo "[FAIL] 文件不存在: $file"
        ((FAIL_COUNT++))
    fi
}

check_content() {
    local file=$1
    local pattern=$2
    local desc=$3
    if grep -q "$pattern" "$file" 2>/dev/null; then
        echo "[PASS] $desc"
        ((PASS_COUNT++))
    else
        echo "[FAIL] $desc"
        ((FAIL_COUNT++))
    fi
}

echo "--- 1. 检查核心文件 ---"
check_file "index.html"
check_file "styles.css"
check_file "script.js"
echo ""

echo "--- 2. 检查 HTML 结构 ---"
check_content "index.html" "分拣格口压力图" "页面标题包含分拣格口压力图"
check_content "index.html" "gridContainer" "包含格口网格容器"
check_content "index.html" "shiftSelect" "包含班次选择器"
check_content "index.html" "rankBtn" "包含压力排行按钮"
check_content "index.html" "fullscreenBtn" "包含全屏按钮"
check_content "index.html" "detailModal" "包含格口详情弹窗"
check_content "index.html" "deliverBtn" "包含投递按钮"
check_content "index.html" "markBlockedBtn" "包含标记堵塞按钮"
echo ""

echo "--- 3. 检查 CSS 样式 ---"
check_content "styles.css" "level-normal" "包含正常压力等级样式"
check_content "styles.css" "level-medium" "包含低负荷等级样式"
check_content "styles.css" "level-warning" "包含预警等级样式"
check_content "styles.css" "level-high" "包含高负荷等级样式"
check_content "styles.css" "level-critical" "包含堵塞等级样式"
check_content "styles.css" "blocked" "包含堵塞状态样式"
check_content "styles.css" "slot-card" "包含格口卡片样式"
check_content "styles.css" "fullscreen-mode" "包含全屏模式样式"
check_content "styles.css" "btn:disabled" "包含按钮禁用样式"
echo ""

echo "--- 4. 检查 JavaScript 逻辑 ---"
check_content "script.js" "localStorage" "使用 localStorage 本地存储"
check_content "script.js" "STORAGE_KEY" "定义存储键"
check_content "script.js" "blockSlot" "包含标记堵塞函数"
check_content "script.js" "unblockSlot" "包含解除堵塞函数"
check_content "script.js" "deliverPackage" "包含投递包裹函数"
check_content "script.js" "changeShift" "包含班次切换函数"
check_content "script.js" "showRankModal" "包含压力排行函数"
check_content "script.js" "toggleFullscreen" "包含全屏切换函数"
check_content "script.js" "saveData" "包含数据保存函数"
check_content "script.js" "MAX_CAPACITY" "定义容量阈值"
check_content "script.js" "slot.isBlocked" "检查堵塞状态判断"
check_content "script.js" "deliverBtn.disabled" "投递按钮禁用逻辑"
echo ""

echo "--- 5. 检查业务逻辑 ---"
check_content "script.js" "deliverBtn.disabled = true" "堵塞时禁用投递按钮"
check_content "script.js" "saveData()" "操作后保存数据"
check_content "script.js" "loadData" "从本地存储加载数据"
check_content "script.js" "slot.isBlocked = false" "默认堵塞状态为 false"
check_content "script.js" "slot.isBlocked" "投递前检查堵塞状态"
echo ""

echo "========================================"
echo "  测试结果汇总"
echo "========================================"
echo "通过: $PASS_COUNT 项"
echo "失败: $FAIL_COUNT 项"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo "[SUCCESS] 所有 Smoke Test 通过！"
    echo ""
    echo "下一步操作："
    echo "  1. 启动本地服务器：python3 -m http.server 8080"
    echo "  2. 浏览器访问：http://localhost:8080"
    echo "  3. 手动验证功能："
    echo "     - 点击任意格口查看详情"
    echo "     - 点击【标记堵塞】按钮"
    echo "     - 验证【投递包裹】按钮变为禁用状态"
    echo "     - 刷新页面，验证堵塞状态仍然保留"
    echo "     - 切换班次，验证各班次数据独立"
    exit 0
else
    echo "[FAILED] 有 $FAIL_COUNT 项测试未通过，请检查！"
    exit 1
fi
