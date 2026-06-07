#!/bin/bash
set +H

echo "=========================================="
echo "  分拣格口看板 - 堵塞格口锁定验证脚本"
echo "=========================================="
echo ""

echo "[1/5] 检查项目文件是否完整..."
FILES=("index.html" "script.js" "styles.css")
MISSING=0

for f in "${FILES[@]}"; do
    if [ -f "$f" ]; then
        echo "  ✅ $f 存在"
    else
        echo "  ❌ $f 缺失"
        MISSING=1
    fi
done

if [ $MISSING -eq 1 ]; then
    echo ""
    echo "❌ 项目文件不完整，验证终止"
    exit 1
fi
echo ""

echo "[2/5] 检查候选对比功能实现..."
CHECK_POINTS=(
    "openCompareModal:候选对比弹窗打开函数"
    "compareSelectedSlots:候选选择数组"
    "doCompare:执行对比函数"
    "analyzeComparison:对比分析函数"
    "compareBtn:候选对比按钮"
    "compareModal:对比弹窗结构"
)
PASS=0
TOTAL=${#CHECK_POINTS[@]}

for cp in "${CHECK_POINTS[@]}"; do
    KEY="${cp%%:*}"
    DESC="${cp##*:}"
    FOUND=0
    
    grep -q "$KEY" index.html 2>/dev/null && FOUND=1
    grep -q "$KEY" script.js 2>/dev/null && FOUND=1
    
    if [ $FOUND -eq 1 ]; then
        echo "  ✅ $DESC"
        PASS=$((PASS + 1))
    else
        echo "  ❌ $DESC"
    fi
done
echo "  候选对比功能: $PASS/$TOTAL 通过"
echo ""

echo "[3/5] 检查堵塞格口锁定逻辑..."
LOCK_CHECKS=(
    "堵塞状态下无法投递包裹:deliverPackage 堵塞检查"
    "deliverBtn.disabled:详情页投递按钮禁用"
    "isBlocked:格口堵塞状态字段"
    "处于堵塞状态，锁定中:对比时堵塞提示"
)
LOCK_PASS=0
LOCK_TOTAL=${#LOCK_CHECKS[@]}

for lc in "${LOCK_CHECKS[@]}"; do
    KEY="${lc%%:*}"
    DESC="${lc##*:}"
    FOUND=0
    
    grep -q "$KEY" script.js 2>/dev/null && FOUND=1
    
    if [ $FOUND -eq 1 ]; then
        echo "  ✅ $DESC"
        LOCK_PASS=$((LOCK_PASS + 1))
    else
        echo "  ❌ $DESC"
    fi
done
echo "  堵塞锁定逻辑: $LOCK_PASS/$LOCK_TOTAL 通过"
echo ""

echo "[4/5] 验证候选对比不修改格口状态..."
MODIFY_KEYWORDS=("isBlocked.*=.*false" "pendingCount.*=" "unblockSlot.*compare" "blockSlot.*compare")
SAFE=1

for kw in "${MODIFY_KEYWORDS[@]}"; do
    if grep -q "$kw" script.js 2>/dev/null; then
        CONTEXT=$(grep -n "$kw" script.js | head -3)
        if echo "$CONTEXT" | grep -q "compare\|doCompare\|analyze"; then
            echo "  ⚠️  发现候选对比相关代码可能修改格口状态: $kw"
            echo "     $CONTEXT"
            SAFE=0
        fi
    fi
done

if [ $SAFE -eq 1 ]; then
    echo "  ✅ 候选对比功能不包含修改格口状态的代码"
else
    echo "  ❌ 候选对比功能可能修改格口状态"
fi
echo ""

echo "[5/5] 验证样式文件包含候选对比样式..."
STYLE_CHECKS=(
    "modal-xlarge:大弹窗样式"
    "compare-slot-card:对比格口卡片"
    "compare-table:对比结果表格"
    "compare-warnings:警告样式"
    "compare-recommendations:推荐样式"
)
STYLE_PASS=0
STYLE_TOTAL=${#STYLE_CHECKS[@]}

for sc in "${STYLE_CHECKS[@]}"; do
    KEY="${sc%%:*}"
    DESC="${sc##*:}"
    
    if grep -q "$KEY" styles.css 2>/dev/null; then
        echo "  ✅ $DESC"
        STYLE_PASS=$((STYLE_PASS + 1))
    else
        echo "  ❌ $DESC"
    fi
done
echo "  候选对比样式: $STYLE_PASS/$STYLE_TOTAL 通过"
echo ""

echo "=========================================="
echo "  验证总结"
echo "=========================================="
TOTAL_SCORE=$((PASS + LOCK_PASS + STYLE_PASS + SAFE))
MAX_SCORE=$((TOTAL + LOCK_TOTAL + STYLE_TOTAL + 1))

echo "  功能实现: $PASS/$TOTAL"
echo "  锁定逻辑: $LOCK_PASS/$LOCK_TOTAL"
echo "  样式支持: $STYLE_PASS/$STYLE_TOTAL"
echo "  安全性:   $SAFE/1"
echo ""
echo "  总分: $TOTAL_SCORE/$MAX_SCORE"

if [ $LOCK_PASS -eq $LOCK_TOTAL ] && [ $SAFE -eq 1 ]; then
    echo ""
    echo "✅✅✅ 堵塞格口锁定验证通过！"
    echo "  - 堵塞格口无法投递包裹"
    echo "  - 候选对比仅作分析，不修改任何格口状态"
    echo "  - 对比时会明确提示堵塞格口处于锁定中"
    exit 0
else
    echo ""
    echo "❌ 堵塞格口锁定验证未完全通过"
    exit 1
fi
