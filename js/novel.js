// ========== ビジュアルノベルシステム ==========

class NovelSystem {
    constructor() {
        this.currentScene = '';
        this.dialogueIndex = 0;
        this.textSpeed = 50;
        this.autoMode = false;
        this.skipMode = false;
        this.autoSpeed = 2000;
        this.isTyping = false;
        this.currentText = '';
        this.dialogueLog = [];

        this.initScenarios();
        this.bindEvents();
    }

    // シナリオデータ（CSV管理を想定した構造）
    initScenarios() {
        this.scenarios = {
            meeting: [
                { character: 'アミ', text: '遅い！もう、待ちくたびれちゃった♪', emotion: 'smile' },
                { character: 'アミ', text: '...なんで5分も遅れるの？', emotion: 'irritated' },
                { character: 'アミ', text: '私のこと、どうでもいいの？', emotion: 'angry' },
                { character: 'system', text: 'アミが不機嫌になった！地雷を避けて機嫌を直そう！', action: 'start_game' }
            ],
            dinner_scene: [
                { character: 'アミ', text: 'よかった♪ちゃんと私のこと見てくれてるんだね！', emotion: 'happy' },
                { character: 'アミ', text: 'このお店、前から来たかったの！', emotion: 'smile' },
                { character: 'アミ', text: '...さっきから他の女の子ばっかり見てない？', emotion: 'dark' },
                { character: 'system', text: '急にアミの様子が変わった！', action: 'start_game' }
            ],
            home_scene: [
                { character: 'アミ', text: 'ごめんね、私の勘違いだった...', emotion: 'relief' },
                { character: 'アミ', text: '私の部屋、初めてでしょ？緊張する？', emotion: 'sweet' },
                { character: 'アミ', text: 'ねえ...私だけを見てよ。他の誰も見ないで。', emotion: 'yandere' },
                { character: 'system', text: 'アミがヤンデレ化した！最後の試練だ！', action: 'start_game' }
            ],
            true_end: [
                { character: 'アミ', text: '大好き...ずっと一緒にいようね♪', emotion: 'love' },
                { character: 'アミ', text: 'おはよう♪昨日は楽しかったね', emotion: 'happy' },
                { character: 'アミ', text: 'これからもずっと一緒だよ...ね？', emotion: 'sweet' },
                { character: 'system', text: 'TRUE END - 無事に朝を迎えた', action: 'show_ending' }
            ]
        };
    }

    // イベント設定
    bindEvents() {
        // 会話進行（クリックまたはスペースキー）
        document.addEventListener('click', (e) => {
            if (window.gameMain?.GameState.currentScene === 'novel' &&
                !e.target.closest('.control-btn')) {
                this.nextDialogue();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (window.gameMain?.GameState.currentScene === 'novel') {
                if (e.code === 'Space') {
                    e.preventDefault();
                    this.nextDialogue();
                } else if (e.code === 'Enter') {
                    e.preventDefault();
                    this.nextDialogue();
                }
            }
        });

        // コントロールボタン
        const skipBtn = document.getElementById('skipBtn');
        const autoBtn = document.getElementById('autoBtn');

        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                this.toggleSkip();
            });
        }

        if (autoBtn) {
            autoBtn.addEventListener('click', () => {
                this.toggleAuto();
            });
        }
    }

    // シーン開始
    startScene(sceneName) {
        this.currentScene = sceneName;
        this.dialogueIndex = 0;
        this.dialogueLog = [];

        if (this.scenarios[sceneName]) {
            this.showDialogue();
        }
    }

    // 会話表示
    showDialogue() {
        const dialogues = this.scenarios[this.currentScene];
        if (!dialogues || this.dialogueIndex >= dialogues.length) {
            return;
        }

        const dialogue = dialogues[this.dialogueIndex];

        if (dialogue.character === 'system') {
            // システムメッセージ
            this.showSystemMessage(dialogue);
        } else {
            // キャラクターセリフ
            this.showCharacterDialogue(dialogue);
        }

        // ログに追加
        this.dialogueLog.push(dialogue);
    }

    // キャラクターセリフ表示
    showCharacterDialogue(dialogue) {
        const nameEl = document.getElementById('characterName');
        const textEl = document.getElementById('dialogueText');
        const indicator = document.getElementById('continueIndicator');

        if (nameEl) {
            nameEl.textContent = dialogue.character;
        }

        if (textEl) {
            if (this.skipMode) {
                // スキップモード
                textEl.textContent = dialogue.text;
                if (indicator) indicator.style.display = 'block';
            } else {
                // タイプライター効果
                this.typewriterEffect(textEl, dialogue.text, () => {
                    if (indicator) indicator.style.display = 'block';

                    // オートモード
                    if (this.autoMode) {
                        setTimeout(() => {
                            this.nextDialogue();
                        }, this.autoSpeed);
                    }
                });
            }
        }

        // キャラクター表情更新
        if (dialogue.character === 'アミ') {
            this.updateAmiEmotion(dialogue.emotion);
        }
    }

    // システムメッセージ表示
    showSystemMessage(dialogue) {
        const textEl = document.getElementById('dialogueText');
        const nameEl = document.getElementById('characterName');

        if (nameEl) {
            nameEl.textContent = '';
        }

        if (textEl) {
            textEl.textContent = dialogue.text;
        }

        // アクション実行
        setTimeout(() => {
            this.executeAction(dialogue.action);
        }, 2000);
    }

    // タイプライター効果
    typewriterEffect(element, text, callback) {
        if (this.isTyping) {
            // 既にタイピング中なら完了させる
            element.textContent = this.currentText;
            this.isTyping = false;
            return;
        }

        this.isTyping = true;
        this.currentText = text;
        element.textContent = '';

        const indicator = document.getElementById('continueIndicator');
        if (indicator) indicator.style.display = 'none';

        let index = 0;
        const typeInterval = setInterval(() => {
            if (index < text.length && this.isTyping) {
                element.textContent += text[index];
                index++;
            } else {
                clearInterval(typeInterval);
                this.isTyping = false;
                if (callback) callback();
            }
        }, this.textSpeed);
    }

    // 次の会話へ
    nextDialogue() {
        if (this.isTyping) {
            // タイピング中なら完了させる
            const textEl = document.getElementById('dialogueText');
            if (textEl) {
                textEl.textContent = this.currentText;
            }
            this.isTyping = false;
            return;
        }

        this.dialogueIndex++;
        this.showDialogue();
    }

    // アクション実行
    executeAction(action) {
        switch (action) {
            case 'start_game':
                this.startMineSweeper();
                break;
            case 'show_ending':
                this.showEnding();
                break;
            case 'next_stage':
                this.nextStage();
                break;
        }
    }

    // マインスイーパー開始
    startMineSweeper() {
        const difficultyMap = {
            'meeting': 'easy',
            'dinner_scene': 'normal',
            'home_scene': 'hard'
        };

        const difficulty = difficultyMap[this.currentScene] || 'easy';
        window.startMinesweeper(difficulty);
    }

    // エンディング表示
    showEnding() {
        if (this.currentScene === 'true_end') {
            window.minesweeperGame?.showTrueEnd();
        }
    }

    // 次のステージへ
    nextStage() {
        const nextMap = {
            'meeting': 'dinner_scene',
            'dinner_scene': 'home_scene',
            'home_scene': 'true_end'
        };

        const next = nextMap[this.currentScene];
        if (next) {
            this.startScene(next);
        }
    }

    // アミの表情更新
    updateAmiEmotion(emotion) {
        // アニメーションシステムが利用可能な場合
        if (window.characterAnimation) {
            // アニメーションタイプを選択（gif, webm, spriteSheet, css）
            window.characterAnimation.updateCharacterDisplay(emotion, 'css');
        } else {
            // フォールバック（絵文字表示）
            const sprite = document.getElementById('amiSprite');
            if (!sprite) return;

            const emotions = {
                smile: { emoji: '💕', bg: 'rgba(255,182,193,0.3)' },
                happy: { emoji: '😊', bg: 'rgba(255,182,193,0.3)' },
                irritated: { emoji: '😒', bg: 'rgba(255,200,150,0.3)' },
                angry: { emoji: '😠', bg: 'rgba(255,100,100,0.3)' },
                dark: { emoji: '👿', bg: 'rgba(100,0,100,0.3)' },
                yandere: { emoji: '🔪', bg: 'rgba(139,0,0,0.3)' },
                sweet: { emoji: '💖', bg: 'rgba(255,182,193,0.3)' },
                love: { emoji: '💝', bg: 'rgba(255,105,180,0.3)' },
                relief: { emoji: '😌', bg: 'rgba(200,200,255,0.3)' }
            };

            const emo = emotions[emotion] || emotions.smile;

            sprite.innerHTML = `
                <div class="character-placeholder" style="background: linear-gradient(180deg, ${emo.bg}, rgba(255,105,180,0.3));">
                    ${emo.emoji}
                </div>
            `;

            // アニメーション
            sprite.style.transform = 'scale(1.1)';
            setTimeout(() => {
                sprite.style.transform = 'scale(1)';
            }, 300);
        }
    }

    // スキップモード切り替え
    toggleSkip() {
        this.skipMode = !this.skipMode;
        const btn = document.getElementById('skipBtn');
        if (btn) {
            btn.style.background = this.skipMode ? '#ff69b4' : 'rgba(255,255,255,0.1)';
        }
    }

    // オートモード切り替え
    toggleAuto() {
        this.autoMode = !this.autoMode;
        const btn = document.getElementById('autoBtn');
        if (btn) {
            btn.style.background = this.autoMode ? '#ff69b4' : 'rgba(255,255,255,0.1)';
        }
    }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    window.novelSystem = new NovelSystem();
});