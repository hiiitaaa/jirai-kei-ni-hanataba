// ========== メインゲーム管理（CSV統合版） ==========

// ゲーム状態管理
const GameState = {
    currentScene: 'title',
    currentStage: 'easy',
    difficulty: 'easy',
    affection: 70,
    saveData: null,
    settings: {
        textSpeed: 50,
        bgmVolume: 0.7,
        seVolume: 0.8,
        voiceVolume: 0.9,
        autoSpeed: 2000
    },
    isInitialized: false
};

// セーブデータ構造
const SaveData = {
    progress: {
        currentScene: '',
        clearedStages: [],
        unlockedEndings: [],
        totalPlaytime: 0,
        checkpoint: ''
    },
    statistics: {
        minesHit: 0,
        perfectClears: 0,
        badEndsSeen: 0,
        trueEndAchieved: false
    },
    gallery: {
        cgUnlocked: [],
        videosUnlocked: [],
        endingsUnlocked: [],
        fullClearBonus: false
    },
    settings: {}
};

// デバッグモード
window.DEBUG_MODE = true;

// 初期化
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[Main] ゲーム初期化開始');

    // MinesweeperGameインスタンスを作成（ここで一元管理）
    if (window.MinesweeperGame) {
        window.minesweeperGame = new MinesweeperGame();
        console.log('[Main] MinesweeperGameインスタンスを作成しました');
    } else {
        console.error('[Main] MinesweeperGameクラスが見つかりません');
    }

    // システム初期化を順番に実行
    await initializeAllSystems();

    // メニューイベントバインド
    bindMenuEvents();

    // セーブデータ読み込み
    loadSaveData();

    // 初期化完了
    GameState.isInitialized = true;
    console.log('[Main] ゲーム初期化完了');
});

// 全システム初期化
async function initializeAllSystems() {
    // ローディング画面は一旦スキップして直接タイトルを表示
    console.log('[Main] サブシステム初期化開始');

    try {
        // 1. CSVローダー初期化（csvLoader は自動初期化）
        if (window.csvLoader) {
            console.log('[Main] CSVローダー準備完了');

            // 必要なCSVファイルを事前読み込み
            const csvFiles = [
                'story_full.csv',
                'scene_triggers.csv'
                // 'animations.csv', // 将来実装
                // 'sounds.csv'      // 将来実装
            ];

            // 非同期で読み込み（エラーがあっても続行）
            window.csvLoader.preloadAllData(csvFiles).catch(err => {
                console.warn('[Main] CSV読み込みエラー（続行）:', err);
            });
        }

        // 2. トリガーシステム初期化
        if (window.triggerSystem) {
            window.triggerSystem.initialize().catch(err => {
                console.warn('[Main] トリガー初期化エラー（続行）:', err);
            });
            console.log('[Main] トリガーシステム初期化開始');
        }

        // 3. ノベルシステムは自動初期化されるが、確認
        if (window.novelSystem) {
            console.log('[Main] ノベルシステム準備完了');
        }

        // 4. ビデオマネージャー確認
        if (window.videoManager) {
            console.log('[Main] ビデオマネージャー準備完了');
        }

        // 5. マインスイーパー確認
        if (window.minesweeper || window.minesweeperGame) {
            console.log('[Main] マインスイーパー準備完了');
        }

    } catch (error) {
        console.error('[Main] システム初期化エラー:', error);
        // アラートは出さずにコンソールログのみ
    }

    // 初期シーン設定（すぐにタイトル画面を表示）
    showScene('title');
}

// メニューイベント設定
function bindMenuEvents() {
    // タイトル画面のボタン
    const startBtn = document.getElementById('startBtn');
    const continueBtn = document.getElementById('continueBtn');
    const galleryBtn = document.getElementById('galleryBtn');
    const settingsBtn = document.getElementById('settingsBtn');

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            startNewGame();
        });
    }

    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            continueGame();
        });
    }

    if (galleryBtn) {
        galleryBtn.addEventListener('click', () => {
            showGallery();
        });
    }

    // ギャラリーの戻るボタン
    const galleryBackBtn = document.getElementById('galleryBackBtn');
    if (galleryBackBtn) {
        galleryBackBtn.addEventListener('click', () => {
            showScene('title');
        });
    }

    // エンディングのタイトルへボタン
    const returnTitleBtn = document.getElementById('returnTitleBtn');
    if (returnTitleBtn) {
        returnTitleBtn.addEventListener('click', () => {
            showScene('title');
        });
    }
}

// 新規ゲーム開始
async function startNewGame() {
    if (!GameState.isInitialized) {
        console.warn('[Main] システムが初期化されていません');
        return;
    }

    console.log('[Main] 新規ゲーム開始');
    showLoading(true);

    // ゲーム状態初期化
    GameState.currentStage = 'prologue';
    GameState.difficulty = 'easy';
    GameState.affection = 70;

    // セーブデータ初期化
    GameState.saveData = JSON.parse(JSON.stringify(SaveData));

    setTimeout(async () => {
        showLoading(false);

        // ノベルパートから開始
        if (window.novelSystem) {
            await window.novelSystem.startScene('prologue');
            showScene('novel');
        } else {
            console.error('[Main] ノベルシステムが利用できません');
        }
    }, 500);
}

// 続きから
function continueGame() {
    if (!GameState.saveData || !GameState.saveData.progress.checkpoint) {
        alert('セーブデータがありません');
        return;
    }

    showLoading(true);

    // セーブデータから復元
    const checkpoint = GameState.saveData.progress.checkpoint;
    console.log(`[Main] チェックポイント「${checkpoint}」から再開`);

    setTimeout(() => {
        showLoading(false);

        // チェックポイントに応じて再開
        if (checkpoint.includes('clear')) {
            // クリア後のシーンから
            const nextStage = getNextStage(checkpoint);
            if (nextStage) {
                window.novelSystem?.startScene(nextStage);
                showScene('novel');
            }
        } else {
            // ゲーム中から
            GameState.difficulty = checkpoint;
            startMinesweeper(checkpoint);
        }
    }, 500);
}

// 次のステージ取得
function getNextStage(checkpoint) {
    const stageFlow = {
        'easy_clear': 'dinner_scene',
        'normal_clear': 'home_scene',
        'hard_clear': 'true_end'
    };
    return stageFlow[checkpoint];
}

// ギャラリー表示
function showGallery() {
    showScene('gallery');
    updateGalleryContent();
}

// ギャラリー内容更新
function updateGalleryContent() {
    const videoGallery = document.getElementById('videoGallery');
    if (!videoGallery) return;

    videoGallery.innerHTML = '';

    // ビデオギャラリーアイテム
    const videos = [
        { id: 'easy_reward_intro', title: '待ち合わせ編クリア', emoji: '🎬', stage: 'easy' },
        { id: 'normal_reward_intro', title: '食事編クリア', emoji: '🎬', stage: 'normal' },
        { id: 'hard_reward_intro', title: '自宅編クリア', emoji: '🎬', stage: 'hard' },
        { id: 'true_ending_special', title: 'TRUE END達成', emoji: '🏆', stage: 'true_end' },
        { id: 'hidden', title: '???', emoji: '❓', stage: 'hidden' }
    ];

    videos.forEach(video => {
        const item = createGalleryItem(video);
        videoGallery.appendChild(item);
    });
}

// ギャラリーアイテム作成
function createGalleryItem(video) {
    const div = document.createElement('div');
    div.className = 'gallery-item';

    const isUnlocked = checkVideoUnlocked(video.stage);
    if (!isUnlocked) {
        div.classList.add('locked');
    }

    div.innerHTML = `
        <div class="gallery-item-title">${isUnlocked ? video.title : '???'}</div>
        <div class="gallery-item-preview">
            ${isUnlocked ? video.emoji : '🔒'}
        </div>
    `;

    if (isUnlocked) {
        div.addEventListener('click', () => {
            playRewardVideo(video.id);
        });
    }

    return div;
}

// ビデオ解放チェック
function checkVideoUnlocked(stage) {
    if (!GameState.saveData) return false;

    const clearedStages = GameState.saveData.progress.clearedStages || [];

    switch(stage) {
        case 'easy':
            return clearedStages.includes('easy');
        case 'normal':
            return clearedStages.includes('normal');
        case 'hard':
            return clearedStages.includes('hard');
        case 'true_end':
            return GameState.saveData.statistics.trueEndAchieved;
        case 'hidden':
            return GameState.saveData.gallery.fullClearBonus;
        default:
            return false;
    }
}

// ご褒美動画再生
function playRewardVideo(videoId) {
    console.log(`[Main] ご褒美動画再生: ${videoId}`);

    if (window.videoManager) {
        // VideoManagerを使用して動画再生
        window.videoManager.playVideo(videoId, {
            volume: GameState.settings.bgmVolume
        });
    } else {
        // フォールバック
        alert(`ご褒美動画「${videoId}」を再生します\n（動画システムが準備できていません）`);
    }
}

// メニューボタン更新
function updateMenuButtons() {
    const continueBtn = document.getElementById('continueBtn');
    if (continueBtn) {
        continueBtn.disabled = !GameState.saveData || !GameState.saveData.progress.checkpoint;
        continueBtn.style.opacity = continueBtn.disabled ? '0.5' : '1';
    }
}

// シーン切り替え
function showScene(sceneName) {
    console.log(`[Main] シーン切り替え: ${sceneName}`);

    const scenes = document.querySelectorAll('.scene');
    scenes.forEach(scene => {
        scene.classList.remove('active');
        scene.style.display = 'none';  // 明示的に非表示
    });

    const targetScene = document.getElementById(sceneName + 'Scene');
    if (targetScene) {
        targetScene.style.display = 'block';  // 明示的に表示
        targetScene.classList.add('active');
        GameState.currentScene = sceneName;

        console.log(`[Main] ${sceneName}シーンを表示しました`);

        // トリガーシステムに通知
        if (window.triggerSystem && sceneName !== 'title') {
            window.triggerSystem.setCurrentScene(sceneName);
        }
    } else {
        console.error(`[Main] シーン「${sceneName}Scene」が見つかりません`);
    }
}

// シーン変更（トリガーシステム用）
function changeScene(sceneId) {
    console.log(`[Main] シーン変更要求: ${sceneId}`);

    // 特殊なシーンIDの処理
    switch(sceneId) {
        case 'restaurant':
        case 'dinner_scene':
            if (window.novelSystem) {
                window.novelSystem.startScene('dinner_scene');
                showScene('novel');
            }
            break;

        case 'home_scene':
            if (window.novelSystem) {
                window.novelSystem.startScene('home_scene');
                showScene('novel');
            }
            break;

        case 'true_end':
            showTrueEnd();
            break;

        case 'bad_end':
        case 'bad_end_1':
            showBadEnd();
            break;

        default:
            // 通常のシーン変更
            if (window.novelSystem) {
                window.novelSystem.startScene(sceneId);
                showScene('novel');
            }
    }
}

// ローディング画面
function showLoading(show) {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        if (show) {
            loadingScreen.classList.add('active');
        } else {
            loadingScreen.classList.remove('active');
        }
    }
}

// セーブデータ保存
function saveGame() {
    if (GameState.saveData) {
        GameState.saveData.settings = GameState.settings;

        // 暗号化（簡易）
        const saveString = JSON.stringify(GameState.saveData);
        const encoded = btoa(encodeURIComponent(saveString));

        localStorage.setItem('jirai_save', encoded);
        console.log('[Main] ゲーム保存完了');
    }
}

// セーブデータ読み込み
function loadSaveData() {
    const saved = localStorage.getItem('jirai_save');
    if (saved) {
        try {
            // 復号化
            const decoded = decodeURIComponent(atob(saved));
            GameState.saveData = JSON.parse(decoded);

            if (GameState.saveData.settings) {
                GameState.settings = GameState.saveData.settings;
            }

            updateMenuButtons();
            console.log('[Main] セーブデータ読み込み完了');

        } catch (e) {
            // 旧形式のセーブデータの場合
            try {
                GameState.saveData = JSON.parse(saved);
                updateMenuButtons();
            } catch (e2) {
                console.error('[Main] セーブデータの読み込みに失敗しました');
            }
        }
    }
}

// ステージクリア時の処理
function onStageClear(stage) {
    console.log(`[Main] ステージクリア: ${stage}`);

    if (!GameState.saveData) {
        GameState.saveData = JSON.parse(JSON.stringify(SaveData));
    }

    // クリア済みステージに追加
    if (!GameState.saveData.progress.clearedStages.includes(stage)) {
        GameState.saveData.progress.clearedStages.push(stage);
    }

    // チェックポイント更新
    GameState.saveData.progress.checkpoint = stage + '_clear';

    // 動画解放
    const videoId = stage + '_reward_intro';
    if (!GameState.saveData.gallery.videosUnlocked.includes(videoId)) {
        GameState.saveData.gallery.videosUnlocked.push(videoId);
    }

    // セーブ
    saveGame();

    // トリガーシステムでクリアトリガーをチェック
    if (window.triggerSystem) {
        const clearTrigger = window.triggerSystem.checkGameClearTrigger(stage);
        if (clearTrigger) {
            window.triggerSystem.executeTrigger(clearTrigger);
        }
    }
}

// エンディング表示
function showEnding(type) {
    console.log(`[Main] エンディング表示: ${type}`);

    if (type === 'true_end') {
        showTrueEnd();
    } else {
        showBadEnd(type);
    }
}

// TRUE END表示
function showTrueEnd() {
    console.log('[Main] TRUE END表示');

    // 達成記録
    if (GameState.saveData) {
        GameState.saveData.statistics.trueEndAchieved = true;
        GameState.saveData.gallery.fullClearBonus = true;
        saveGame();
    }

    // エンディングシーン表示
    showScene('ending');

    const endingTitle = document.getElementById('endingTitle');
    const endingText = document.getElementById('endingText');

    if (endingTitle) {
        endingTitle.textContent = 'TRUE END';
        endingTitle.className = 'ending-title true';
    }

    if (endingText) {
        endingText.innerHTML = `
            <p>アミ「おはよう♪ 昨日は楽しかったね」</p>
            <p>アミ「これからもずっと一緒だよ...ね？」</p>
            <br>
            <p>無事に朝を迎えることができた。</p>
            <br>
            <p class="unlock-message">🎉 全てのご褒美動画が解放されました！</p>
        `;
    }

    // 特別動画を再生
    if (window.videoManager) {
        setTimeout(() => {
            window.videoManager.playVideo('true_ending_special');
        }, 3000);
    }
}

// BAD END表示
function showBadEnd(type = 'default') {
    console.log(`[Main] BAD END表示: ${type}`);

    // 記録
    if (GameState.saveData) {
        GameState.saveData.statistics.badEndsSeen++;
        saveGame();
    }

    // エンディングシーン表示
    showScene('ending');

    const endingTitle = document.getElementById('endingTitle');
    const endingText = document.getElementById('endingText');

    if (endingTitle) {
        endingTitle.textContent = 'BAD END';
        endingTitle.className = 'ending-title bad';
    }

    if (endingText) {
        endingText.innerHTML = `
            <p>アミ「もう逃がさない」</p>
            <p>アミ「ずっと、ずーっと、ここにいて」</p>
            <p>アミ「私だけのものになって...」</p>
            <br>
            <p>あなたは二度と外に出ることはなかった。</p>
        `;
    }
}

// 動画から復帰
function resumeFromVideo() {
    console.log('[Main] 動画から復帰');

    // 現在のシーンに応じて処理
    const currentStage = GameState.currentStage;

    // 次のシーンへ進む
    if (currentStage === 'easy_clear') {
        changeScene('dinner_scene');
    } else if (currentStage === 'normal_clear') {
        changeScene('home_scene');
    } else if (currentStage === 'hard_clear') {
        showTrueEnd();
    }
}

// startMinesweeper関数はgame.jsで定義されているものを使用
// ここでは定義しない（重複を避ける）

// デバッグ用グローバル関数
if (window.DEBUG_MODE) {
    window.debugMain = function() {
        console.log('[Main] ゲーム状態:');
        console.log('  GameState:', GameState);
        console.log('  SaveData:', GameState.saveData);
        console.log('  Systems:');
        console.log('    CSVLoader:', !!window.csvLoader);
        console.log('    TriggerSystem:', !!window.triggerSystem);
        console.log('    NovelSystem:', !!window.novelSystem);
        console.log('    VideoManager:', !!window.videoManager);
        console.log('    Minesweeper:', !!(window.minesweeper || window.minesweeperGame));
    };

    window.resetGame = function() {
        if (confirm('セーブデータを削除してゲームをリセットしますか？')) {
            localStorage.removeItem('jirai_save');
            location.reload();
        }
    };
}

// エクスポート
window.gameMain = {
    showScene,
    changeScene,
    saveGame,
    loadSaveData,
    onStageClear,
    showLoading,
    showEnding,
    resumeFromVideo,
    GameState
};

window.main = window.gameMain; // エイリアス