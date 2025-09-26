// ========== ゲーム修正案 ==========

// 解決策1: ご褒美動画の再生を追加
function onGameClear_fixed() {
    this.updateAmiReaction('happy');

    // ステージクリア処理
    window.gameMain?.onStageClear(this.difficulty);

    setTimeout(() => {
        // トリガーシステムでクリアトリガーを確認
        if (window.triggerSystem) {
            const clearTrigger = window.triggerSystem.checkGameClearTrigger(this.difficulty);
            if (clearTrigger) {
                // 動画再生トリガーが発火
                window.triggerSystem.executeTrigger(clearTrigger);
                return;
            }
        }

        // フォールバック処理
        if (this.difficulty === 'hard') {
            this.showTrueEnd();
        } else {
            const nextStage = this.getNextStage();
            if (nextStage) {
                window.novelSystem?.startScene(nextStage);
                window.gameMain?.showScene('novel');
            }
        }
    }, 1500);
}

// 解決策2: 動的セルサイズ計算
function calculateCellSize(difficulty) {
    const maxBoardWidth = window.innerWidth * 0.5;  // 画面幅の50%まで
    const maxBoardHeight = window.innerHeight * 0.7; // 画面高さの70%まで

    const sizes = {
        easy: { count: 9, minCell: 35, maxCell: 45 },
        normal: { count: 12, minCell: 28, maxCell: 35 },
        hard: { count: 16, minCell: 22, maxCell: 28 }
    };

    const config = sizes[difficulty];
    const maxCellWidth = Math.floor(maxBoardWidth / config.count) - 2;  // gap分を引く
    const maxCellHeight = Math.floor(maxBoardHeight / config.count) - 2;
    const cellSize = Math.min(maxCellWidth, maxCellHeight, config.maxCell);

    return Math.max(cellSize, config.minCell);
}

// 解決策3: CSSクラスを動的に生成
function updateBoardStyles(difficulty) {
    const cellSize = calculateCellSize(difficulty);
    const styleId = 'dynamic-board-styles';

    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
    }

    const sizes = {
        easy: 9,
        normal: 12,
        hard: 16
    };

    const gridSize = sizes[difficulty];

    styleEl.textContent = `
        .game-board.${difficulty} {
            grid-template-columns: repeat(${gridSize}, ${cellSize}px);
            grid-template-rows: repeat(${gridSize}, ${cellSize}px);
        }

        .game-board.${difficulty} .cell {
            width: ${cellSize}px;
            height: ${cellSize}px;
            font-size: ${Math.max(12, cellSize * 0.4)}px;
        }
    `;
}