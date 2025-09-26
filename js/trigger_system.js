// ========== トリガーシステム ==========
// テキストトリガーの監視と実行を管理

class TriggerSystem {
    constructor() {
        this.triggers = [];          // トリガー定義
        this.customTriggers = [];    // カスタムトリガー
        this.currentScene = null;    // 現在のシーン
        this.isInitialized = false;
    }

    /**
     * 初期化 - CSVからトリガー定義を読み込み
     */
    async initialize() {
        try {
            console.log('[TriggerSystem] 初期化開始');

            // scene_triggers.csv を読み込み
            this.triggers = await csvLoader.loadCSV('scene_triggers.csv');

            console.log(`[TriggerSystem] ${this.triggers.length}個のトリガーを読み込み`);
            this.isInitialized = true;

            // デバッグ用: トリガー一覧を表示
            if (window.DEBUG_MODE) {
                this.debugTriggers();
            }

        } catch (error) {
            console.error('[TriggerSystem] 初期化エラー:', error);
            // フォールバック: デフォルトトリガーを使用
            this.useDefaultTriggers();
        }
    }

    /**
     * トリガーチェック - 現在のテキストがトリガー条件に一致するか
     * @param {string} sceneId - 現在のシーンID
     * @param {number} dialogueIndex - ダイアログのインデックス
     * @param {string} text - 表示中のテキスト
     * @returns {Object|null} 発動するトリガーまたはnull
     */
    checkTrigger(sceneId, dialogueIndex, text) {
        if (!this.isInitialized) {
            console.warn('[TriggerSystem] 未初期化のため、トリガーチェックをスキップ');
            return null;
        }

        // 完全一致トリガーをチェック
        const exactTrigger = this.triggers.find(t =>
            t.scene_id === sceneId &&
            t.dialogue_index === dialogueIndex &&
            t.trigger_type === 'dialogue_end'
        );

        if (exactTrigger) {
            console.log(`[TriggerSystem] ダイアログ終了トリガー発動: ${exactTrigger.trigger_id}`);
            return exactTrigger;
        }

        // キーワードトリガーをチェック
        const keywordTrigger = this.triggers.find(t =>
            t.scene_id === sceneId &&
            t.trigger_type === 'keyword' &&
            text.includes(t.condition)
        );

        if (keywordTrigger) {
            console.log(`[TriggerSystem] キーワードトリガー発動: ${keywordTrigger.trigger_id} (${keywordTrigger.condition})`);
            return keywordTrigger;
        }

        // カスタムトリガーをチェック
        const customTrigger = this.checkCustomTriggers(sceneId, dialogueIndex, text);
        if (customTrigger) {
            return customTrigger;
        }

        return null;
    }

    /**
     * ゲームクリアトリガーチェック
     * @param {string} difficulty - クリアした難易度
     * @returns {Object|null} 発動するトリガーまたはnull
     */
    checkGameClearTrigger(difficulty) {
        const trigger = this.triggers.find(t =>
            t.trigger_type === 'game_clear' &&
            t.condition === difficulty
        );

        if (trigger) {
            console.log(`[TriggerSystem] ゲームクリアトリガー発動: ${trigger.trigger_id} (${difficulty})`);
            return trigger;
        }

        return null;
    }

    /**
     * ゲーム失敗トリガーチェック
     * @param {string} difficulty - 失敗した難易度
     * @returns {Object|null} 発動するトリガーまたはnull
     */
    checkGameFailTrigger(difficulty) {
        const trigger = this.triggers.find(t =>
            t.trigger_type === 'game_fail' &&
            t.condition === difficulty
        );

        if (trigger) {
            console.log(`[TriggerSystem] ゲーム失敗トリガー発動: ${trigger.trigger_id} (${difficulty})`);
            return trigger;
        }

        return null;
    }

    /**
     * トリガーを実行
     * @param {Object} trigger - 実行するトリガーオブジェクト
     */
    async executeTrigger(trigger) {
        if (!trigger) return;

        console.log(`[TriggerSystem] トリガー実行: ${trigger.trigger_id}`);
        console.log(`  アクション: ${trigger.next_action}`);
        console.log(`  パラメータ: ${trigger.action_params}`);

        try {
            switch (trigger.next_action) {
                case 'change_scene':
                    // シーン切り替え
                    this.executeSceneChange(trigger);
                    break;

                case 'play_video':
                    // 動画再生
                    this.executeVideoPlay(trigger);
                    break;

                case 'switch_video':
                    // 動画切り替え
                    this.executeVideoSwitch(trigger);
                    break;

                case 'start_game':
                    // ゲーム開始
                    this.executeGameStart(trigger);
                    break;

                case 'show_ending':
                    // エンディング表示
                    this.executeShowEnding(trigger);
                    break;

                case 'custom':
                    // カスタムアクション
                    this.executeCustomAction(trigger);
                    break;

                default:
                    console.warn(`[TriggerSystem] 未知のアクション: ${trigger.next_action}`);
            }

            // トランジション効果を適用
            if (trigger.transition) {
                this.applyTransition(trigger.transition);
            }

        } catch (error) {
            console.error('[TriggerSystem] トリガー実行エラー:', error);
        }
    }

    /**
     * シーン切り替えを実行
     */
    executeSceneChange(trigger) {
        if (typeof window.main !== 'undefined' && window.main.changeScene) {
            window.main.changeScene(trigger.action_params);
        } else {
            console.error('[TriggerSystem] main.changeScene が利用できません');
        }
    }

    /**
     * 動画再生を実行
     */
    executeVideoPlay(trigger) {
        if (typeof window.videoManager !== 'undefined' && window.videoManager.playVideo) {
            window.videoManager.playVideo(trigger.action_params);
        } else {
            console.error('[TriggerSystem] videoManager.playVideo が利用できません');
        }
    }

    /**
     * 動画切り替えを実行
     */
    executeVideoSwitch(trigger) {
        if (typeof window.videoManager !== 'undefined' && window.videoManager.switchVideo) {
            window.videoManager.switchVideo(trigger.action_params);
        } else {
            console.error('[TriggerSystem] videoManager.switchVideo が利用できません');
        }
    }

    /**
     * ゲーム開始を実行
     */
    executeGameStart(trigger) {
        const difficulty = trigger.action_params || 'easy';
        console.log(`[TriggerSystem] ゲーム開始: ${difficulty}`);

        // startMinesweeper関数を使用
        if (typeof window.startMinesweeper === 'function') {
            window.startMinesweeper(difficulty);
        } else if (window.minesweeperGame && window.minesweeperGame.init) {
            // minesweeperGameインスタンスを直接使用
            window.minesweeperGame.init(difficulty);
            if (window.main || window.gameMain) {
                (window.main || window.gameMain).showScene('game');
            }
        } else {
            console.error('[TriggerSystem] マインスイーパーシステムが見つかりません');
            console.log('[TriggerSystem] 利用可能なオブジェクト:', {
                startMinesweeper: typeof window.startMinesweeper,
                minesweeperGame: !!window.minesweeperGame,
                MinesweeperGame: typeof window.MinesweeperGame
            });
        }
    }

    /**
     * エンディング表示を実行
     */
    executeShowEnding(trigger) {
        const endingType = trigger.action_params || 'true_end';
        if (window.main && window.main.showEnding) {
            window.main.showEnding(endingType);
        } else {
            console.error('[TriggerSystem] main.showEnding が利用できません');
        }
    }

    /**
     * トランジション効果を適用
     */
    applyTransition(transition) {
        const overlay = document.querySelector('.scene-overlay') || this.createOverlay();

        // 既存のクラスをクリア
        overlay.className = 'scene-overlay';

        // トランジションクラスを追加
        switch (transition) {
            case 'fade':
                overlay.classList.add('fade-transition');
                break;
            case 'white_flash':
                overlay.classList.add('white-flash');
                break;
            case 'pink_flash':
                overlay.classList.add('pink-flash');
                break;
            case 'shake':
                document.body.classList.add('shake-effect');
                setTimeout(() => {
                    document.body.classList.remove('shake-effect');
                }, 500);
                break;
            case 'glitch':
                overlay.classList.add('glitch-effect');
                break;
        }

        // アニメーション終了後にクラスを削除
        setTimeout(() => {
            overlay.className = 'scene-overlay';
        }, 1000);
    }

    /**
     * オーバーレイ要素を作成
     */
    createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'scene-overlay';
        document.body.appendChild(overlay);
        return overlay;
    }

    /**
     * カスタムトリガーを登録
     * @param {Object} condition - トリガー条件
     * @param {Function} action - 実行するアクション
     */
    registerCustomTrigger(condition, action) {
        this.customTriggers.push({ condition, action });
        console.log('[TriggerSystem] カスタムトリガー登録:', condition);
    }

    /**
     * カスタムトリガーをチェック
     */
    checkCustomTriggers(sceneId, dialogueIndex, text) {
        for (let custom of this.customTriggers) {
            if (custom.condition({ sceneId, dialogueIndex, text })) {
                console.log('[TriggerSystem] カスタムトリガー発動');
                return {
                    trigger_id: 'custom_' + Date.now(),
                    next_action: 'custom',
                    custom_action: custom.action
                };
            }
        }
        return null;
    }

    /**
     * カスタムアクションを実行
     */
    executeCustomAction(trigger) {
        if (trigger.custom_action && typeof trigger.custom_action === 'function') {
            trigger.custom_action();
        }
    }

    /**
     * デフォルトトリガーを使用（フォールバック）
     */
    useDefaultTriggers() {
        console.log('[TriggerSystem] デフォルトトリガーを使用');
        this.triggers = [
            {
                trigger_id: 'default_easy_clear',
                scene_id: 'meeting_game',
                trigger_type: 'game_clear',
                condition: 'easy',
                next_action: 'change_scene',
                action_params: 'easy_reward',
                transition: 'white_flash'
            },
            {
                trigger_id: 'default_normal_clear',
                scene_id: 'dinner_game',
                trigger_type: 'game_clear',
                condition: 'normal',
                next_action: 'change_scene',
                action_params: 'normal_reward',
                transition: 'pink_flash'
            },
            {
                trigger_id: 'default_hard_clear',
                scene_id: 'home_game',
                trigger_type: 'game_clear',
                condition: 'hard',
                next_action: 'change_scene',
                action_params: 'hard_reward',
                transition: 'fade'
            }
        ];
        this.isInitialized = true;
    }

    /**
     * 現在のシーンを設定
     */
    setCurrentScene(sceneId) {
        this.currentScene = sceneId;
        console.log(`[TriggerSystem] 現在のシーン: ${sceneId}`);
    }

    /**
     * デバッグ用: トリガー一覧を表示
     */
    debugTriggers() {
        console.log('[TriggerSystem] トリガー一覧:');
        this.triggers.forEach(t => {
            console.log(`  ${t.trigger_id}: ${t.trigger_type} (${t.scene_id}) -> ${t.next_action}`);
        });
    }
}

// シングルトンインスタンスとしてエクスポート
const triggerSystem = new TriggerSystem();

// グローバルに公開
if (typeof window !== 'undefined') {
    window.triggerSystem = triggerSystem;
}