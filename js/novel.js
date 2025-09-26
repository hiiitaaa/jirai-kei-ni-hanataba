// ========== ビジュアルノベルシステム（CSV対応版） ==========
// CSVローダーとトリガーシステムに完全対応した新システム

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
        this.isInitialized = false;

        // CSVデータ
        this.storyData = [];
        this.sceneDialogues = {};

        this.initialize();
    }

    /**
     * システム初期化
     */
    async initialize() {
        console.log('[NovelSystem] 初期化開始');

        try {
            // CSVデータを読み込み
            await this.loadStoryData();

            // トリガーシステムの初期化を待機
            if (window.triggerSystem && !window.triggerSystem.isInitialized) {
                await window.triggerSystem.initialize();
            }

            // イベントバインド
            this.bindEvents();

            this.isInitialized = true;
            console.log('[NovelSystem] 初期化完了');

        } catch (error) {
            console.error('[NovelSystem] 初期化エラー:', error);
            // フォールバック: 既存のハードコードデータを使用
            this.initFallbackScenarios();
            this.bindEvents();
            this.isInitialized = true;
        }
    }

    /**
     * CSVからストーリーデータを読み込み
     */
    async loadStoryData() {
        console.log('[NovelSystem] ストーリーデータ読み込み開始');

        // story_full.csv を読み込み
        this.storyData = await csvLoader.loadCSV('story_full.csv');

        // シーンごとにデータを整理
        this.organizeSceneDialogues();

        console.log(`[NovelSystem] ${this.storyData.length}行のストーリーデータを読み込み`);
        console.log(`[NovelSystem] ${Object.keys(this.sceneDialogues).length}シーンを構成`);
    }

    /**
     * シーンごとにダイアログを整理
     */
    organizeSceneDialogues() {
        this.sceneDialogues = {};

        this.storyData.forEach(row => {
            const sceneId = row.scene_id;

            if (!this.sceneDialogues[sceneId]) {
                this.sceneDialogues[sceneId] = [];
            }

            // ダイアログオブジェクトを作成
            const dialogue = {
                id: row.id,
                sequence: row.sequence,
                character: row.speaker || 'narration',
                text: row.text,
                emotion: row.emotion || 'normal',
                voiceFile: row.voice_file || '',
                isTrigger: row.is_trigger,
                triggerId: row.trigger_id
            };

            this.sceneDialogues[sceneId].push(dialogue);
        });

        // シーケンス順にソート
        Object.keys(this.sceneDialogues).forEach(sceneId => {
            this.sceneDialogues[sceneId].sort((a, b) => a.sequence - b.sequence);
        });
    }

    /**
     * 背景画像変更
     * @param {string} sceneName - シーン名
     */
    changeBackground(sceneName) {
        const backgroundEl = document.getElementById('novelBackground');
        if (!backgroundEl) return;

        // シーンごとの背景設定
        const backgrounds = {
            'prologue': 'street_evening.png',
            'meeting': 'street_evening.png',
            'easy_clear': 'restaurant.png',
            'dinner_scene': 'restaurant_table.png',
            'normal_clear': 'street_night.png',
            'home_scene': 'ami_room.png',
            'hard_clear': 'ami_bedroom.png',
            'true_end': 'ami_bedroom.png',
            'bad_end': 'dark_room.png',
            'bad_end_1': 'dark_room.png',
            'bad_end_2': 'dark_room.png',
            'bad_end_3': 'dark_room.png'
        };

        const bgImage = backgrounds[sceneName];
        if (bgImage) {
            const bgPath = `assets/backgrounds/${bgImage}`;
            backgroundEl.style.backgroundImage = `url('${bgPath}')`;
            backgroundEl.style.backgroundSize = 'cover';
            backgroundEl.style.backgroundPosition = 'center';
            console.log(`[NovelSystem] 背景変更: ${sceneName} -> ${bgPath}`);
        } else {
            // デフォルト背景
            backgroundEl.style.backgroundImage = '';
            backgroundEl.style.background = 'linear-gradient(180deg, #2a1a3a 0%, #1a0a2a 100%)';
            console.log(`[NovelSystem] デフォルト背景を使用: ${sceneName}`);
        }
    }

    /**
     * フォールバック: ハードコードシナリオ使用
     */
    initFallbackScenarios() {
        console.log('[NovelSystem] フォールバック: ハードコードデータを使用');

        this.sceneDialogues = {
            prologue: [
                { character: 'narration', text: 'アミと付き合って3ヶ月。', emotion: 'normal' },
                { character: 'narration', text: '毎日が幸せだ。', emotion: 'normal' },
                { character: 'narration', text: '...たぶん。', emotion: 'normal' }
            ],
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

    /**
     * イベント設定
     */
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
        const logBtn = document.getElementById('logBtn');
        const menuBtn = document.getElementById('menuBtn');

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

        if (logBtn) {
            logBtn.addEventListener('click', () => {
                this.showLog();
            });
        }

        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                this.showMenu();
            });
        }
    }

    /**
     * シーン開始
     * @param {string} sceneName - 開始するシーン名
     */
    async startScene(sceneName) {
        if (!this.isInitialized) {
            console.warn('[NovelSystem] 初期化されていません。初期化を待機...');
            await this.initialize();
        }

        console.log(`[NovelSystem] シーン開始: ${sceneName}`);

        this.currentScene = sceneName;
        this.dialogueIndex = 0;
        this.dialogueLog = [];

        // 背景画像を変更
        this.changeBackground(sceneName);

        // トリガーシステムに現在のシーンを通知
        if (window.triggerSystem) {
            window.triggerSystem.setCurrentScene(sceneName);
        }

        // シーンの最初のダイアログを表示
        this.showDialogue();
    }

    /**
     * 会話表示
     */
    showDialogue() {
        const dialogues = this.sceneDialogues[this.currentScene];
        if (!dialogues || this.dialogueIndex >= dialogues.length) {
            console.log('[NovelSystem] ダイアログ終了');
            return;
        }

        const dialogue = dialogues[this.dialogueIndex];

        console.log(`[NovelSystem] ダイアログ表示: ${this.currentScene}[${this.dialogueIndex}] "${dialogue.text}"`);

        // トリガーチェック（表示前）
        this.checkTriggers(dialogue);

        if (dialogue.character === 'system' || dialogue.character === 'narration') {
            // システムメッセージ・ナレーション
            this.showSystemMessage(dialogue);
        } else {
            // キャラクターセリフ
            this.showCharacterDialogue(dialogue);
        }

        // ログに追加
        this.dialogueLog.push(dialogue);
    }

    /**
     * キャラクターセリフ表示
     */
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

        // 音声再生（対応している場合）
        if (dialogue.voiceFile && window.audioManager) {
            window.audioManager.playVoice(dialogue.voiceFile);
        }
    }

    /**
     * システムメッセージ表示
     */
    showSystemMessage(dialogue) {
        const textEl = document.getElementById('dialogueText');
        const nameEl = document.getElementById('characterName');

        if (nameEl) {
            nameEl.textContent = dialogue.character === 'narration' ? '' : 'システム';
        }

        if (textEl) {
            textEl.textContent = dialogue.text;
        }

        // システムメッセージにアクションがある場合は実行
        if (dialogue.action) {
            setTimeout(() => {
                this.executeAction(dialogue.action);
            }, 2000);
        }
    }

    /**
     * トリガーチェック
     */
    checkTriggers(dialogue) {
        if (!window.triggerSystem) {
            return;
        }

        // ダイアログ終了トリガーをチェック
        const trigger = window.triggerSystem.checkTrigger(
            this.currentScene,
            this.dialogueIndex,
            dialogue.text
        );

        if (trigger) {
            // トリガーを実行（非同期）
            setTimeout(() => {
                window.triggerSystem.executeTrigger(trigger);
            }, 100);
        }

        // 特定のトリガーIDが設定されている場合の処理
        if (dialogue.isTrigger && dialogue.triggerId) {
            console.log(`[NovelSystem] 特定トリガーID検出: ${dialogue.triggerId}`);
            // カスタム処理をここに追加可能
        }
    }

    /**
     * タイプライター効果
     */
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

    /**
     * 次の会話へ
     */
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

        // トリガーチェック（ダイアログ終了時）
        if (window.triggerSystem) {
            const trigger = window.triggerSystem.checkTrigger(
                this.currentScene,
                this.dialogueIndex,
                'dialogue_end'
            );

            if (trigger) {
                window.triggerSystem.executeTrigger(trigger);
                return; // トリガーが実行された場合、通常の進行を停止
            }
        }

        this.dialogueIndex++;
        this.showDialogue();
    }

    /**
     * アクション実行（レガシー互換性）
     */
    executeAction(action) {
        console.log(`[NovelSystem] レガシーアクション実行: ${action}`);

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
            default:
                console.warn(`[NovelSystem] 未知のアクション: ${action}`);
        }
    }

    /**
     * マインスイーパー開始（レガシー）
     */
    startMineSweeper() {
        const difficultyMap = {
            'meeting': 'easy',
            'dinner_scene': 'normal',
            'home_scene': 'hard'
        };

        const difficulty = difficultyMap[this.currentScene] || 'easy';

        console.log(`[NovelSystem] マインスイーパー開始: ${difficulty}`);

        // minesweeperGameインスタンスを確認
        if (!window.minesweeperGame) {
            window.minesweeperGame = new MinesweeperGame();
        }

        // ゲーム初期化
        window.minesweeperGame.init(difficulty);

        // シーン切り替え
        if (window.gameMain) {
            window.gameMain.showScene('game');
        } else {
            // フォールバック：直接DOM操作
            const scenes = document.querySelectorAll('.scene');
            scenes.forEach(scene => {
                scene.style.display = 'none';
                scene.classList.remove('active');
            });
            const gameScene = document.getElementById('gameScene');
            if (gameScene) {
                gameScene.style.display = 'block';
                gameScene.classList.add('active');
            }
        }
    }

    /**
     * エンディング表示（レガシー）
     */
    showEnding() {
        if (this.currentScene === 'true_end') {
            if (window.minesweeperGame?.showTrueEnd) {
                window.minesweeperGame.showTrueEnd();
            } else if (window.main?.showEnding) {
                window.main.showEnding('true_end');
            }
        }
    }

    /**
     * 次のステージへ（レガシー）
     */
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

    /**
     * アミの表情更新
     */
    updateAmiEmotion(emotion) {
        console.log(`[NovelSystem] アミの表情更新: ${emotion}`);

        // アニメーションシステムが利用可能な場合
        if (window.characterAnimation) {
            window.characterAnimation.updateCharacterDisplay(emotion, 'css');
        } else {
            // フォールバック（絵文字表示）
            this.updateEmotionFallback(emotion);
        }
    }

    /**
     * 表情更新フォールバック
     */
    updateEmotionFallback(emotion) {
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
            relief: { emoji: '😌', bg: 'rgba(200,200,255,0.3)' },
            normal: { emoji: '😐', bg: 'rgba(200,200,200,0.3)' }
        };

        const emo = emotions[emotion] || emotions.normal;

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

    /**
     * 特定のダイアログにジャンプ
     * @param {string} sceneName - シーン名
     * @param {number} index - ダイアログインデックス
     */
    jumpToDialogue(sceneName, index = 0) {
        console.log(`[NovelSystem] ダイアログジャンプ: ${sceneName}[${index}]`);

        this.currentScene = sceneName;
        this.dialogueIndex = index;

        if (window.triggerSystem) {
            window.triggerSystem.setCurrentScene(sceneName);
        }

        this.showDialogue();
    }

    /**
     * スキップモード切り替え
     */
    toggleSkip() {
        this.skipMode = !this.skipMode;
        const btn = document.getElementById('skipBtn');
        if (btn) {
            btn.style.background = this.skipMode ? '#ff69b4' : 'rgba(255,255,255,0.1)';
        }
        console.log(`[NovelSystem] スキップモード: ${this.skipMode ? 'ON' : 'OFF'}`);
    }

    /**
     * オートモード切り替え
     */
    toggleAuto() {
        this.autoMode = !this.autoMode;
        const btn = document.getElementById('autoBtn');
        if (btn) {
            btn.style.background = this.autoMode ? '#ff69b4' : 'rgba(255,255,255,0.1)';
        }
        console.log(`[NovelSystem] オートモード: ${this.autoMode ? 'ON' : 'OFF'}`);

        // オートモード開始
        if (this.autoMode && !this.isTyping) {
            setTimeout(() => {
                if (this.autoMode) {
                    this.nextDialogue();
                }
            }, this.autoSpeed);
        }
    }

    /**
     * ログ表示
     */
    showLog() {
        console.log('[NovelSystem] ログ表示');

        // ログウィンドウを作成
        const existingLog = document.getElementById('dialogueLogWindow');
        if (existingLog) {
            existingLog.remove();
            return;
        }

        const logWindow = document.createElement('div');
        logWindow.id = 'dialogueLogWindow';
        logWindow.className = 'dialogue-log-window';
        logWindow.innerHTML = `
            <div class="log-header">
                <h3>会話ログ</h3>
                <button class="log-close-btn" onclick="document.getElementById('dialogueLogWindow').remove()">×</button>
            </div>
            <div class="log-content">
                ${this.dialogueLog.map(log => `
                    <div class="log-entry">
                        <div class="log-speaker">${log.character}</div>
                        <div class="log-text">${log.text}</div>
                    </div>
                `).join('')}
            </div>
        `;
        document.body.appendChild(logWindow);
    }

    /**
     * メニュー表示
     */
    showMenu() {
        console.log('[NovelSystem] メニュー表示');

        // メニューウィンドウを作成
        const existingMenu = document.getElementById('gameMenuWindow');
        if (existingMenu) {
            existingMenu.remove();
            return;
        }

        const menuWindow = document.createElement('div');
        menuWindow.id = 'gameMenuWindow';
        menuWindow.className = 'game-menu-window';
        menuWindow.innerHTML = `
            <div class="menu-overlay">
                <div class="menu-content">
                    <h2>メニュー</h2>
                    <button class="menu-item" onclick="window.gameMain?.saveGame(); alert('セーブしました')">セーブ</button>
                    <button class="menu-item" onclick="window.gameMain?.loadSaveData(); alert('ロードしました')">ロード</button>
                    <button class="menu-item" onclick="if(confirm('タイトルに戻りますか？')) { window.gameMain?.showScene('title'); document.getElementById('gameMenuWindow').remove(); }">タイトルへ</button>
                    <button class="menu-item" onclick="document.getElementById('gameMenuWindow').remove()">閉じる</button>
                </div>
            </div>
        `;
        document.body.appendChild(menuWindow);
    }

    /**
     * システム状態をデバッグ表示
     */
    debugStatus() {
        console.log('[NovelSystem] システム状態:');
        console.log(`  現在のシーン: ${this.currentScene}`);
        console.log(`  ダイアログインデックス: ${this.dialogueIndex}`);
        console.log(`  初期化状態: ${this.isInitialized}`);
        console.log(`  利用可能シーン: ${Object.keys(this.sceneDialogues).join(', ')}`);

        if (this.sceneDialogues[this.currentScene]) {
            console.log(`  現在シーンのダイアログ数: ${this.sceneDialogues[this.currentScene].length}`);
        }
    }

    /**
     * CSVデータをリロード（開発用）
     */
    async reloadStoryData() {
        console.log('[NovelSystem] ストーリーデータリロード');
        csvLoader.clearCache('story_full.csv');
        await this.loadStoryData();
        console.log('[NovelSystem] リロード完了');
    }
}

// システム初期化を自動実行
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[NovelSystem] DOM読み込み完了、初期化開始');
    window.novelSystem = new NovelSystem();

    // デバッグモード用のグローバル関数
    if (window.DEBUG_MODE) {
        window.debugNovelSystem = () => window.novelSystem.debugStatus();
        window.reloadStory = () => window.novelSystem.reloadStoryData();
    }
});