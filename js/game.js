// ========== マインスイーパーゲームロジック ==========

class MinesweeperGame {
    constructor() {
        this.board = [];
        this.revealed = [];
        this.flagged = [];
        this.mines = [];
        this.gameOver = false;
        this.gameWon = false;
        this.firstClick = true;
        this.timer = 0;
        this.timerInterval = null;

        // 難易度設定
        this.difficulties = {
            easy: { size: 9, mines: 8, time: 180 },
            normal: { size: 12, mines: 18, time: 240 },
            hard: { size: 16, mines: 35, time: 300 }
        };
    }

    // ゲーム初期化
    init(difficulty) {
        this.difficulty = difficulty;
        const config = this.difficulties[difficulty];

        this.size = config.size;
        this.mineCount = config.mines;
        this.timeLimit = config.time;

        // ボード初期化
        const totalCells = this.size * this.size;
        this.board = Array(totalCells).fill(0);
        this.revealed = Array(totalCells).fill(false);
        this.flagged = Array(totalCells).fill(false);
        this.mines = [];
        this.gameOver = false;
        this.gameWon = false;
        this.firstClick = true;
        this.timer = 0;

        // UI更新
        this.renderBoard();
        this.updateMineCount();
        this.startTimer();
    }

    // ボード描画
    renderBoard() {
        const boardEl = document.getElementById('gameBoard');
        if (!boardEl) return;

        boardEl.innerHTML = '';
        boardEl.className = `game-board ${this.difficulty}`;

        for (let i = 0; i < this.size * this.size; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = i;

            cell.addEventListener('click', () => this.handleCellClick(i));
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.handleRightClick(i);
            });

            boardEl.appendChild(cell);
        }
    }

    // 地雷配置
    placeMines(excludeIndex) {
        this.mines = [];
        const totalCells = this.size * this.size;

        // 除外する範囲（クリックしたセルとその周囲）
        const excludedCells = this.getSurroundingCells(excludeIndex);
        excludedCells.push(excludeIndex);

        while (this.mines.length < this.mineCount) {
            const pos = Math.floor(Math.random() * totalCells);

            if (!this.mines.includes(pos) && !excludedCells.includes(pos)) {
                this.mines.push(pos);
                this.board[pos] = -1;

                // 周囲の数字を増やす
                const surrounding = this.getSurroundingCells(pos);
                surrounding.forEach(idx => {
                    if (this.board[idx] !== -1) {
                        this.board[idx]++;
                    }
                });
            }
        }
    }

    // 周囲のセル取得
    getSurroundingCells(index) {
        const cells = [];
        const x = index % this.size;
        const y = Math.floor(index / this.size);

        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;

                const nx = x + dx;
                const ny = y + dy;

                if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size) {
                    cells.push(ny * this.size + nx);
                }
            }
        }

        return cells;
    }

    // セルクリック処理
    handleCellClick(index) {
        if (this.gameOver || this.gameWon) return;
        if (this.flagged[index]) return;
        if (this.revealed[index]) return;

        // 最初のクリック
        if (this.firstClick) {
            this.placeMines(index);
            this.firstClick = false;
        }

        this.revealCell(index);

        // ゲーム状態チェック
        if (this.board[index] === -1) {
            this.onMineHit(index);
        } else {
            this.checkWin();
        }
    }

    // 右クリック処理（フラッグ）
    handleRightClick(index) {
        if (this.gameOver || this.gameWon) return;
        if (this.revealed[index]) return;

        this.flagged[index] = !this.flagged[index];
        this.updateCell(index);
        this.updateMineCount();
    }

    // セルを開く
    revealCell(index) {
        if (this.revealed[index] || this.flagged[index]) return;

        this.revealed[index] = true;
        this.updateCell(index);

        // 空白セルの場合、周囲も開く
        if (this.board[index] === 0) {
            const surrounding = this.getSurroundingCells(index);
            surrounding.forEach(idx => this.revealCell(idx));
        }
    }

    // セル表示更新
    updateCell(index) {
        const cell = document.querySelector(`[data-index="${index}"]`);
        if (!cell) return;

        cell.className = 'cell';

        if (this.flagged[index]) {
            cell.classList.add('flagged');
            cell.textContent = '🚩';
        } else if (this.revealed[index]) {
            cell.classList.add('revealed');

            if (this.board[index] === -1) {
                cell.classList.add('mine');
                cell.textContent = '💣';
            } else if (this.board[index] > 0) {
                cell.classList.add(`number-${this.board[index]}`);
                cell.textContent = this.board[index];
            } else {
                cell.textContent = '';
            }
        } else {
            cell.textContent = '';
        }
    }

    // 地雷を踏んだ時
    onMineHit(index) {
        this.gameOver = true;
        this.stopTimer();

        // 地雷を全て表示
        this.mines.forEach(idx => {
            this.revealed[idx] = true;
            this.updateCell(idx);
        });

        // アミの反応
        this.updateAmiReaction('angry');

        // 好感度減少
        const currentAffection = window.gameMain?.GameState.affection || 70;
        const newAffection = Math.max(0, currentAffection - 20);
        window.gameMain.GameState.affection = newAffection;
        this.updateAffectionBar(newAffection);

        // 難易度に応じた処理
        setTimeout(() => {
            if (this.difficulty === 'hard' || newAffection <= 20) {
                this.showBadEnd();
            } else {
                alert('地雷を踏んでしまった...\nもう一度挑戦してください');
                this.init(this.difficulty);
            }
        }, 1500);
    }

    // 勝利判定
    checkWin() {
        let allRevealed = true;
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] !== -1 && !this.revealed[i]) {
                allRevealed = false;
                break;
            }
        }

        if (allRevealed) {
            this.gameWon = true;
            this.stopTimer();
            this.onGameClear();
        }
    }

    // ゲームクリア
    onGameClear() {
        this.updateAmiReaction('happy');

        // ステージクリア処理
        window.gameMain?.onStageClear(this.difficulty);

        setTimeout(() => {
            if (this.difficulty === 'hard') {
                this.showTrueEnd();
            } else {
                // 次のステージへ
                const nextStage = this.getNextStage();
                if (nextStage) {
                    alert('ステージクリア！\n次のシーンへ進みます');
                    window.novelSystem?.startScene(nextStage);
                    window.gameMain?.showScene('novel');
                }
            }
        }, 1500);
    }

    // 次のステージ取得
    getNextStage() {
        const flow = {
            'easy': 'dinner_scene',
            'normal': 'home_scene',
            'hard': 'true_end'
        };
        return flow[this.difficulty];
    }

    // BAD END表示
    showBadEnd() {
        window.gameMain?.showScene('ending');

        const titleEl = document.getElementById('endingTitle');
        const textEl = document.getElementById('endingText');

        if (titleEl) {
            titleEl.textContent = 'BAD END';
            titleEl.className = 'ending-title bad';
        }

        if (textEl) {
            textEl.innerHTML = `
                アミ「もう逃がさない」<br>
                アミ「ずっと、ずーっと、ここにいて」<br>
                アミ「私だけのものになって...」<br><br>
                あなたは二度と外に出ることはなかった。
            `;
        }
    }

    // TRUE END表示
    showTrueEnd() {
        window.gameMain?.showScene('ending');

        const titleEl = document.getElementById('endingTitle');
        const textEl = document.getElementById('endingText');

        if (titleEl) {
            titleEl.textContent = 'TRUE END';
            titleEl.className = 'ending-title true';
        }

        if (textEl) {
            textEl.innerHTML = `
                アミ「おはよう♪ 昨日は楽しかったね」<br>
                アミ「これからもずっと一緒だよ...ね？」<br><br>
                無事に朝を迎えることができた。
            `;
        }

        // TRUE END達成フラグ
        if (window.gameMain?.GameState.saveData) {
            window.gameMain.GameState.saveData.statistics.trueEndAchieved = true;
            window.gameMain.saveGame();
        }
    }

    // アミの反応更新
    updateAmiReaction(emotion) {
        const face = document.getElementById('amiFace');
        const thought = document.getElementById('amiThought');
        const indicator = document.getElementById('emotionIndicator');

        const reactions = {
            normal: { emoji: '😊', thought: '私の地雷、踏まないでね...', class: '' },
            happy: { emoji: '😍', thought: '嬉しい！ちゃんと私のこと理解してくれてる♪', class: '' },
            angry: { emoji: '😡', thought: '最低...なんで私の気持ちわかってくれないの？', class: 'angry' },
            dark: { emoji: '👿', thought: 'ねえ...私だけを見てよ...', class: 'danger' }
        };

        const reaction = reactions[emotion] || reactions.normal;

        if (face) {
            face.innerHTML = `<div class="face-placeholder">${reaction.emoji}</div>`;
            face.className = 'ami-face ' + reaction.class;
        }

        if (thought) {
            thought.textContent = reaction.thought;
        }

        if (indicator) {
            indicator.className = 'emotion-indicator ' + (reaction.class || '');
        }
    }

    // 好感度バー更新
    updateAffectionBar(value) {
        const bar = document.getElementById('affectionBar');
        if (bar) {
            bar.style.width = value + '%';
        }
    }

    // 地雷数更新
    updateMineCount() {
        const countEl = document.getElementById('mineCount');
        if (countEl) {
            const flagCount = this.flagged.filter(f => f).length;
            countEl.textContent = Math.max(0, this.mineCount - flagCount);
        }
    }

    // タイマー開始
    startTimer() {
        this.stopTimer();
        this.timer = 0;

        this.timerInterval = setInterval(() => {
            this.timer++;
            const minutes = Math.floor(this.timer / 60);
            const seconds = this.timer % 60;
            const timerEl = document.getElementById('timer');
            if (timerEl) {
                timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }

            // タイムリミット
            if (this.timer >= this.timeLimit) {
                this.onTimeOver();
            }
        }, 1000);
    }

    // タイマー停止
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    // タイムオーバー
    onTimeOver() {
        this.gameOver = true;
        this.stopTimer();
        alert('時間切れ...\nアミが怒ってしまった！');
        this.onMineHit(0);
    }
}

// マインスイーパー開始
function startMinesweeper(difficulty) {
    window.gameMain?.showScene('game');

    // ステージタイトル更新
    const titles = {
        easy: '待ち合わせ編',
        normal: '食事編',
        hard: '自宅編'
    };
    const titleEl = document.getElementById('stageTitle');
    if (titleEl) {
        titleEl.textContent = titles[difficulty] || '';
    }

    // ゲーム初期化
    if (!window.minesweeperGame) {
        window.minesweeperGame = new MinesweeperGame();
    }
    window.minesweeperGame.init(difficulty);
}

// エクスポート
window.startMinesweeper = startMinesweeper;