#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os

base_dir = '/Users/mingyuan/workspace/sihuo/wangxtw3/816'

index_html = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>分拣格口压力图看板</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="dashboard">
        <header class="header">
            <div class="header-left">
                <h1 class="title">分拣格口压力图看板</h1>
                <span class="shift-badge" id="shiftBadge">早班</span>
            </div>
            <div class="header-right">
                <div class="shift-selector">
                    <label for="shiftSelect">班次切换：</label>
                    <select id="shiftSelect">
                        <option value="morning">早班</option>
                        <option value="afternoon">中班</option>
                        <option value="night">晚班</option>
                    </select>
                </div>
                <button id="rankBtn" class="btn btn-secondary">压力排行</button>
                <button id="fullscreenBtn" class="btn btn-primary">全屏看板</button>
            </div>
        </header>

        <section class="stats-bar">
            <div class="stat-card">
                <div class="stat-label">总格口数</div>
                <div class="stat-value" id="totalSlots">0</div>
            </div>
            <div class="stat-card stat-normal">
                <div class="stat-label">正常格口</div>
                <div class="stat-value" id="normalSlots">0</div>
            </div>
            <div class="stat-card stat-warning">
                <div class="stat-label">预警格口</div>
                <div class="stat-value" id="warningSlots">0</div>
            </div>
            <div class="stat-card stat-danger">
                <div class="stat-label">堵塞格口</div>
                <div class="stat-value" id="blockedSlots">0</div>
            </div>
            <div class="stat-card stat-total">
                <div class="stat-label">待分拣总量</div>
                <div class="stat-value" id="totalPending">0</div>
            </div>
        </section>

        <section class="grid-section">
            <div id="gridContainer" class="grid-container">
            </div>
        </section>
    </div>

    <div id="detailModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="modalTitle">格口详情</h2>
                <span class="close" id="closeDetailModal">&times;</span>
            </div>
            <div class="modal-body" id="modalContent">
            </div>
            <div class="modal-footer">
                <button id="markBlockedBtn" class="btn btn-danger">标记堵塞</button>
                <button id="unblockBtn" class="btn btn-success">解除堵塞</button>
                <button id="deliverBtn" class="btn btn-primary">投递包裹</button>
            </div>
        </div>
    </div>

    <div id="rankModal" class="modal">
        <div class="modal-content modal-large">
            <div class="modal-header">
                <h2>压力排行榜 TOP20</h2>
                <span class="close" id="closeRankModal">&times;</span>
            </div>
            <div class="modal-body">
                <table class="rank-table">
                    <thead>
                        <tr>
                            <th>排名</th>
                            <th>格口编号</th>
                            <th>目的地</th>
                            <th>压力等级</th>
                            <th>待分拣数</th>
                            <th>状态</th>
                        </tr>
                    </thead>
                    <tbody id="rankTableBody">
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div id="toast" class="toast"></div>

    <script src="script.js"></script>
</body>
</html>
'''

with open(os.path.join(base_dir, 'index.html'), 'w', encoding='utf-8') as f:
    f.write(index_html)
print('index.html 写入完成')
