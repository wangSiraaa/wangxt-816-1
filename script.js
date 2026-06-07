const CITIES = [
    '北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安',
    '南京', '重庆', '天津', '苏州', '郑州', '长沙', '沈阳', '青岛',
    '厦门', '福州', '济南', '哈尔滨', '长春', '大连', '昆明', '南宁',
    '贵阳', '南昌', '合肥', '太原', '石家庄', '兰州', '乌鲁木齐', '呼和浩特'
];

const SHIFTS = ['morning', 'afternoon', 'night'];
const SLOTS_PER_SHIFT = 32;
const STORAGE_KEY = 'sorting_slots_data';
const MAX_CAPACITY = 100;

let currentShift = 'morning';
let currentSlotId = null;
let slotsData = {};
let compareSelectedSlots = [];
let compareCurrentShift = 'morning';

function generateSampleData() {
    const data = {};
    
    SHIFTS.forEach(shift => {
        data[shift] = [];
        for (let i = 0; i < SLOTS_PER_SHIFT; i++) {
            const pendingCount = Math.floor(Math.random() * 95) + 5;
            const isBlocked = Math.random() < 0.08;
            data[shift].push({
                id: `${shift}-${i + 1}`,
                slotNumber: i + 1,
                destination: CITIES[i],
                pendingCount: isBlocked ? Math.floor(Math.random() * 50) + 30 : pendingCount,
                isBlocked: isBlocked,
                shift: shift,
                lastUpdated: new Date().toISOString()
            });
        }
    });
    
    return data;
}

function loadData() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            slotsData = JSON.parse(stored);
        } else {
            slotsData = generateSampleData();
            saveData();
        }
    } catch (e) {
        console.error('加载数据失败:', e);
        slotsData = generateSampleData();
    }
}

function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(slotsData));
    } catch (e) {
        console.error('保存数据失败:', e);
        showToast('保存数据失败', 'error');
    }
}

function calculateLevel(slot) {
    if (slot.isBlocked) {
        return 'blocked';
    }
    const percent = (slot.pendingCount / MAX_CAPACITY) * 100;
    if (percent < 30) return 'normal';
    if (percent < 50) return 'medium';
    if (percent < 70) return 'warning';
    if (percent < 85) return 'high';
    return 'critical';
}

function getLevelText(level) {
    const texts = {
        'normal': '正常',
        'medium': '轻度',
        'warning': '预警',
        'high': '高压',
        'critical': '严重',
        'blocked': '堵塞'
    };
    return texts[level] || '未知';
}

function getShiftText(shift) {
    const texts = {
        'morning': '早班',
        'afternoon': '中班',
        'night': '晚班'
    };
    return texts[shift] || shift;
}

function updateStats() {
    const slots = slotsData[currentShift] || [];
    
    const total = slots.length;
    let normal = 0;
    let warning = 0;
    let blocked = 0;
    let totalPending = 0;
    
    slots.forEach(slot => {
        totalPending += slot.pendingCount;
        if (slot.isBlocked) {
            blocked++;
        } else {
            const level = calculateLevel(slot);
            if (level === 'normal' || level === 'medium') {
                normal++;
            } else {
                warning++;
            }
        }
    });
    
    document.getElementById('totalSlots').textContent = total;
    document.getElementById('normalSlots').textContent = normal;
    document.getElementById('warningSlots').textContent = warning;
    document.getElementById('blockedSlots').textContent = blocked;
    document.getElementById('totalPending').textContent = totalPending;
}

function renderGrid() {
    const container = document.getElementById('gridContainer');
    const slots = slotsData[currentShift] || [];
    
    container.innerHTML = '';
    
    slots.forEach(slot => {
        const level = calculateLevel(slot);
        const percent = Math.min(Math.round((slot.pendingCount / MAX_CAPACITY) * 100), 100);
        
        const card = document.createElement('div');
        card.className = `slot-card level-${level} ${slot.isBlocked ? 'blocked' : ''}`;
        card.onclick = () => showSlotDetail(slot.id);
        
        card.innerHTML = `
            <div>
                <div class="slot-number">格口 ${slot.slotNumber}</div>
                <div class="slot-destination">${slot.destination}</div>
            </div>
            <div class="slot-pressure">
                <div class="slot-count">${slot.pendingCount}</div>
                <div class="slot-percent">${percent}%</div>
            </div>
            <div class="slot-status">${slot.isBlocked ? '已堵塞' : getLevelText(level)}</div>
        `;
        
        container.appendChild(card);
    });
    
    updateStats();
}

function showSlotDetail(slotId) {
    currentSlotId = slotId;
    const slot = findSlot(slotId);
    if (!slot) return;
    
    const level = calculateLevel(slot);
    const percent = Math.min(Math.round((slot.pendingCount / MAX_CAPACITY) * 100), 100);
    
    document.getElementById('modalTitle').textContent = `格口 ${slot.slotNumber} - ${slot.destination}`;
    
    document.getElementById('modalContent').innerHTML = `
        <div class="detail-info">
            <div class="detail-item">
                <div class="detail-label">格口编号</div>
                <div class="detail-value">${slot.slotNumber}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">目的地</div>
                <div class="detail-value">${slot.destination}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">所属班次</div>
                <div class="detail-value">${getShiftText(slot.shift)}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">压力等级</div>
                <div class="detail-value level-${level}">${getLevelText(level)}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">待分拣数量</div>
                <div class="detail-value">${slot.pendingCount} 件</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">压力占比</div>
                <div class="detail-value">${percent}%</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">当前状态</div>
                <div class="detail-value ${slot.isBlocked ? 'blocked' : ''}">${slot.isBlocked ? '已堵塞' : '正常运行'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">最后更新</div>
                <div class="detail-value" style="font-size: 12px;">${new Date(slot.lastUpdated).toLocaleString('zh-CN')}</div>
            </div>
        </div>
    `;
    
    const markBlockedBtn = document.getElementById('markBlockedBtn');
    const unblockBtn = document.getElementById('unblockBtn');
    const deliverBtn = document.getElementById('deliverBtn');
    
    if (slot.isBlocked) {
        markBlockedBtn.style.display = 'none';
        unblockBtn.style.display = 'inline-flex';
        deliverBtn.disabled = true;
    } else {
        markBlockedBtn.style.display = 'inline-flex';
        unblockBtn.style.display = 'none';
        deliverBtn.disabled = false;
    }
    
    document.getElementById('detailModal').classList.add('show');
}

function findSlot(slotId) {
    for (const shift of SHIFTS) {
        const slot = (slotsData[shift] || []).find(s => s.id === slotId);
        if (slot) return slot;
    }
    return null;
}

function blockSlot() {
    if (!currentSlotId) return;
    
    const slot = findSlot(currentSlotId);
    if (slot) {
        slot.isBlocked = true;
        slot.lastUpdated = new Date().toISOString();
        saveData();
        renderGrid();
        showSlotDetail(currentSlotId);
        showToast(`格口 ${slot.slotNumber} 已标记为堵塞`, 'warning');
    }
}

function unblockSlot() {
    if (!currentSlotId) return;
    
    const slot = findSlot(currentSlotId);
    if (slot) {
        slot.isBlocked = false;
        slot.lastUpdated = new Date().toISOString();
        saveData();
        renderGrid();
        showSlotDetail(currentSlotId);
        showToast(`格口 ${slot.slotNumber} 已解除堵塞`, 'success');
    }
}

function deliverPackage() {
    if (!currentSlotId) return;
    
    const slot = findSlot(currentSlotId);
    if (!slot) return;
    
    if (slot.isBlocked) {
        showToast('堵塞状态下无法投递包裹', 'error');
        return;
    }
    
    if (slot.pendingCount > 0) {
        slot.pendingCount = Math.max(0, slot.pendingCount - 1);
        slot.lastUpdated = new Date().toISOString();
        saveData();
        renderGrid();
        showSlotDetail(currentSlotId);
        showToast(`成功投递 1 件包裹到 ${slot.destination}`, 'success');
    } else {
        showToast('该格口暂无待分拣包裹', 'warning');
    }
}

function changeShift(shift) {
    currentShift = shift;
    document.getElementById('shiftBadge').textContent = getShiftText(shift);
    document.getElementById('shiftSelect').value = shift;
    renderGrid();
    showToast(`已切换至${getShiftText(shift)}`, 'success');
}

function showRankModal() {
    const allSlots = [];
    
    SHIFTS.forEach(shift => {
        (slotsData[shift] || []).forEach(slot => {
            if (!slot.isBlocked) {
                allSlots.push({...slot});
            }
        });
    });
    
    allSlots.sort((a, b) => b.pendingCount - a.pendingCount);
    
    const top20 = allSlots.slice(0, 20);
    
    const tbody = document.getElementById('rankTableBody');
    tbody.innerHTML = '';
    
    top20.forEach((slot, index) => {
        const level = calculateLevel(slot);
        const percent = Math.min(Math.round((slot.pendingCount / MAX_CAPACITY) * 100), 100);
        const rankClass = index < 3 ? `rank-${index + 1}` : 'rank-other';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="rank-badge ${rankClass}">${index + 1}</span></td>
            <td>${slot.slotNumber}</td>
            <td>${slot.destination}</td>
            <td>
                <span class="status-badge status-${slot.isBlocked ? 'blocked' : 'normal'}">
                    ${getLevelText(level)} (${percent}%)
                </span>
            </td>
            <td>${slot.pendingCount} 件</td>
            <td>
                <span class="status-badge status-${slot.isBlocked ? 'blocked' : 'normal'}">
                    ${slot.isBlocked ? '已堵塞' : '正常'}
                </span>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    document.getElementById('rankModal').classList.add('show');
}

function toggleFullscreen() {
    const body = document.body;
    
    if (!document.fullscreenElement) {
        body.classList.add('fullscreen-mode');
        document.documentElement.requestFullscreen().catch(err => {
            console.log('全屏请求失败:', err);
            showToast('进入全屏模式', 'success');
        });
    } else {
        body.classList.remove('fullscreen-mode');
        document.exitFullscreen().catch(err => {
            console.log('退出全屏失败:', err);
        });
        showToast('退出全屏模式', 'success');
    }
}

function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.remove('show');
    currentSlotId = null;
}

function closeRankModal() {
    document.getElementById('rankModal').classList.remove('show');
}

function openCompareModal() {
    compareSelectedSlots = [];
    compareCurrentShift = 'morning';
    document.getElementById('selectedCount').textContent = '0';
    document.getElementById('doCompareBtn').disabled = true;
    document.getElementById('compareResult').innerHTML = '<div class="compare-empty"><p>请选择两个格口开始对比</p></div>';
    renderCompareGrid();
    updateCompareShiftTabs();
    document.getElementById('compareModal').classList.add('show');
}

function closeCompareModal() {
    document.getElementById('compareModal').classList.remove('show');
    compareSelectedSlots = [];
}

function updateCompareShiftTabs() {
    document.querySelectorAll('.compare-shift-tab').forEach(tab => {
        if (tab.dataset.shift === compareCurrentShift) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
}

function renderCompareGrid() {
    const container = document.getElementById('compareGridContainer');
    const slots = slotsData[compareCurrentShift] || [];
    
    container.innerHTML = '';
    
    slots.forEach(slot => {
        const level = calculateLevel(slot);
        const percent = Math.min(Math.round((slot.pendingCount / MAX_CAPACITY) * 100), 100);
        const isSelected = compareSelectedSlots.some(s => s.id === slot.id);
        
        const card = document.createElement('div');
        card.className = `compare-slot-card level-${level} ${slot.isBlocked ? 'blocked' : ''} ${isSelected ? 'selected' : ''}`;
        card.onclick = () => toggleCompareSlot(slot.id);
        
        card.innerHTML = `
            <div class="compare-slot-num">格口 ${slot.slotNumber}</div>
            <div class="compare-slot-dest">${slot.destination}</div>
            <div class="compare-slot-count">${slot.pendingCount} 件</div>
            <div class="compare-slot-status">${slot.isBlocked ? '已堵塞' : getLevelText(level)}</div>
        `;
        
        container.appendChild(card);
    });
}

function toggleCompareSlot(slotId) {
    const slot = findSlot(slotId);
    if (!slot) return;
    
    const index = compareSelectedSlots.findIndex(s => s.id === slotId);
    
    if (index > -1) {
        compareSelectedSlots.splice(index, 1);
    } else {
        if (compareSelectedSlots.length >= 2) {
            showToast('最多只能选择两个格口进行对比', 'warning');
            return;
        }
        compareSelectedSlots.push(slot);
    }
    
    document.getElementById('selectedCount').textContent = compareSelectedSlots.length;
    document.getElementById('doCompareBtn').disabled = compareSelectedSlots.length !== 2;
    renderCompareGrid();
}

function clearCompareSelection() {
    compareSelectedSlots = [];
    document.getElementById('selectedCount').textContent = '0';
    document.getElementById('doCompareBtn').disabled = true;
    document.getElementById('compareResult').innerHTML = '<div class="compare-empty"><p>请选择两个格口开始对比</p></div>';
    renderCompareGrid();
}

function analyzeComparison(slotA, slotB) {
    const result = {
        recommendations: [],
        warnings: [],
        slotAScore: 0,
        slotBScore: 0
    };
    
    const levelA = calculateLevel(slotA);
    const levelB = calculateLevel(slotB);
    const percentA = (slotA.pendingCount / MAX_CAPACITY) * 100;
    const percentB = (slotB.pendingCount / MAX_CAPACITY) * 100;
    const levelOrder = { 'normal': 0, 'medium': 1, 'warning': 2, 'high': 3, 'critical': 4, 'blocked': 5 };
    
    result.slotAScore = levelOrder[levelA] * 20 + percentA * 0.5;
    result.slotBScore = levelOrder[levelB] * 20 + percentB * 0.5;
    
    if (slotA.isBlocked && slotB.isBlocked) {
        result.warnings.push('两个格口均处于堵塞状态，无法进行投递调整');
    } else if (slotA.isBlocked) {
        result.warnings.push(`格口 ${slotA.slotNumber} 处于堵塞状态，锁定中，无法投递也无法解除锁定`);
    } else if (slotB.isBlocked) {
        result.warnings.push(`格口 ${slotB.slotNumber} 处于堵塞状态，锁定中，无法投递也无法解除锁定`);
    }
    
    if (slotA.destination === slotB.destination) {
        result.recommendations.push('两个格口目的地相同，建议合并分拣任务');
    }
    
    if (slotA.pendingCount > slotB.pendingCount * 1.5 && !slotA.isBlocked && !slotB.isBlocked) {
        result.recommendations.push(`建议将格口 ${slotA.slotNumber} 的部分待分拣件调整到格口 ${slotB.slotNumber}，平衡负载`);
    } else if (slotB.pendingCount > slotA.pendingCount * 1.5 && !slotA.isBlocked && !slotB.isBlocked) {
        result.recommendations.push(`建议将格口 ${slotB.slotNumber} 的部分待分拣件调整到格口 ${slotA.slotNumber}，平衡负载`);
    }
    
    if (slotA.shift !== slotB.shift) {
        result.warnings.push('两个格口属于不同班次，跨班次调整需谨慎');
    }
    
    if (result.recommendations.length === 0 && result.warnings.length === 0) {
        result.recommendations.push('两个格口状态均衡，无需特殊调整');
    }
    
    return result;
}

function doCompare() {
    if (compareSelectedSlots.length !== 2) return;
    
    const slotA = compareSelectedSlots[0];
    const slotB = compareSelectedSlots[1];
    
    const levelA = calculateLevel(slotA);
    const levelB = calculateLevel(slotB);
    const percentA = Math.min(Math.round((slotA.pendingCount / MAX_CAPACITY) * 100), 100);
    const percentB = Math.min(Math.round((slotB.pendingCount / MAX_CAPACITY) * 100), 100);
    
    const analysis = analyzeComparison(slotA, slotB);
    
    let warningsHtml = '';
    if (analysis.warnings.length > 0) {
        warningsHtml = '<div class="compare-warnings"><h4><span class="warning-icon">⚠️</span> 注意事项</h4><ul>';
        analysis.warnings.forEach(w => {
            warningsHtml += `<li>${w}</li>`;
        });
        warningsHtml += '</ul></div>';
    }
    
    let recsHtml = '<div class="compare-recommendations"><h4><span class="rec-icon">💡</span> 推荐调整方向</h4><ul>';
    analysis.recommendations.forEach(r => {
        recsHtml += `<li>${r}</li>`;
    });
    recsHtml += '</ul></div>';
    
    const resultHtml = `
        <div class="compare-table-container">
            <table class="compare-table">
                <thead>
                    <tr>
                        <th>对比项</th>
                        <th>格口 ${slotA.slotNumber}</th>
                        <th>格口 ${slotB.slotNumber}</th>
                        <th>对比结果</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>目的地</td>
                        <td>${slotA.destination}</td>
                        <td>${slotB.destination}</td>
                        <td>${slotA.destination === slotB.destination ? '<span class="compare-same">相同</span>' : '<span class="compare-diff">不同</span>'}</td>
                    </tr>
                    <tr>
                        <td>所属班次</td>
                        <td>${getShiftText(slotA.shift)}</td>
                        <td>${getShiftText(slotB.shift)}</td>
                        <td>${slotA.shift === slotB.shift ? '<span class="compare-same">相同</span>' : '<span class="compare-diff">不同</span>'}</td>
                    </tr>
                    <tr>
                        <td>待分拣量</td>
                        <td class="${slotA.pendingCount > slotB.pendingCount ? 'compare-highlight' : ''}">${slotA.pendingCount} 件</td>
                        <td class="${slotB.pendingCount > slotA.pendingCount ? 'compare-highlight' : ''}">${slotB.pendingCount} 件</td>
                        <td>相差 ${Math.abs(slotA.pendingCount - slotB.pendingCount)} 件</td>
                    </tr>
                    <tr>
                        <td>压力占比</td>
                        <td class="level-${levelA}">${percentA}%</td>
                        <td class="level-${levelB}">${percentB}%</td>
                        <td>相差 ${Math.abs(percentA - percentB)}%</td>
                    </tr>
                    <tr>
                        <td>压力等级</td>
                        <td class="level-${levelA}">${getLevelText(levelA)}</td>
                        <td class="level-${levelB}">${getLevelText(levelB)}</td>
                        <td>${levelA === levelB ? '<span class="compare-same">相同</span>' : '<span class="compare-diff">不同</span>'}</td>
                    </tr>
                    <tr>
                        <td>堵塞状态</td>
                        <td class="${slotA.isBlocked ? 'blocked' : ''}">${slotA.isBlocked ? '已堵塞（锁定）' : '正常'}</td>
                        <td class="${slotB.isBlocked ? 'blocked' : ''}">${slotB.isBlocked ? '已堵塞（锁定）' : '正常'}</td>
                        <td>${slotA.isBlocked === slotB.isBlocked ? '<span class="compare-same">相同</span>' : '<span class="compare-diff">不同</span>'}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        ${warningsHtml}
        ${recsHtml}
        <div class="compare-score">
            <div class="score-item">
                <div class="score-label">格口 ${slotA.slotNumber} 综合压力分</div>
                <div class="score-value">${analysis.slotAScore.toFixed(1)}</div>
            </div>
            <div class="score-item">
                <div class="score-label">格口 ${slotB.slotNumber} 综合压力分</div>
                <div class="score-value">${analysis.slotBScore.toFixed(1)}</div>
            </div>
        </div>
    `;
    
    document.getElementById('compareResult').innerHTML = resultHtml;
}

function initEventListeners() {
    document.getElementById('shiftSelect').addEventListener('change', (e) => {
        changeShift(e.target.value);
    });
    
    document.getElementById('rankBtn').addEventListener('click', showRankModal);
    document.getElementById('fullscreenBtn').addEventListener('click', toggleFullscreen);
    
    document.getElementById('markBlockedBtn').addEventListener('click', blockSlot);
    document.getElementById('unblockBtn').addEventListener('click', unblockSlot);
    document.getElementById('deliverBtn').addEventListener('click', deliverPackage);
    
    document.getElementById('closeDetailModal').addEventListener('click', closeDetailModal);
    document.getElementById('closeRankModal').addEventListener('click', closeRankModal);
    document.getElementById('compareBtn').addEventListener('click', openCompareModal);
    document.getElementById('closeCompareModal').addEventListener('click', closeCompareModal);
    document.getElementById('clearCompareBtn').addEventListener('click', clearCompareSelection);
    document.getElementById('doCompareBtn').addEventListener('click', doCompare);
    
    document.querySelectorAll('.compare-shift-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            compareCurrentShift = e.target.dataset.shift;
            updateCompareShiftTabs();
            renderCompareGrid();
        });
    });
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                if (modal.id === 'detailModal') {
                    currentSlotId = null;
                }
                if (modal.id === 'compareModal') {
                    compareSelectedSlots = [];
                }
            }
        });
    });
    
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            document.body.classList.remove('fullscreen-mode');
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeDetailModal();
            closeRankModal();
            closeCompareModal();
        }
    });
}

function init() {
    loadData();
    renderGrid();
    initEventListeners();
}

document.addEventListener('DOMContentLoaded', init);
