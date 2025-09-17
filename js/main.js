// ========== メインゲーム管理 ==========

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
    }
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

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    bindMenuEvents();
    loadSaveData();
});

// ゲーム初期化
function initializeGame() {
    // ローディング画面を表示
    showLoading(false);

    // 初期シーン設定
    showScene('title');

    // セーブデータ読み込み
    const saved = localStorage.getItem('jirai_save');
    if (saved) {
        try {
            GameState.saveData = JSON.parse(saved);
            updateMenuButtons();
        } catch (e) {
            console.log('セーブデータの読み込みに失敗しました');
        }
    }
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
function startNewGame() {
    showLoading(true);

    // ゲーム状態初期化
    GameState.currentStage = 'meeting';
    GameState.difficulty = 'easy';
    GameState.affection = 70;

    // セーブデータ初期化
    GameState.saveData = JSON.parse(JSON.stringify(SaveData));

    setTimeout(() => {
        showLoading(false);
        // ノベルパートから開始
        window.novelSystem?.startScene('meeting');
        showScene('novel');
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
        { id: 'reward_1', title: '待ち合わせ編クリア', emoji: '🎬', stage: 'easy' },
        { id: 'reward_2', title: '食事編クリア', emoji: '🎬', stage: 'normal' },
        { id: 'reward_3', title: '自宅編クリア', emoji: '🎬', stage: 'hard' },
        { id: 'special', title: 'TRUE END達成', emoji: '🏆', stage: 'true_end' },
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

// ご褒美動画再生（仮実装）
function playRewardVideo(videoId) {
    alert(`ご褒美動画「${videoId}」を再生します\n（実際の動画ファイルは後で追加）`);
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
    const scenes = document.querySelectorAll('.scene');
    scenes.forEach(scene => {
        scene.classList.remove('active');
    });

    const targetScene = document.getElementById(sceneName + 'Scene');
    if (targetScene) {
        targetScene.classList.add('active');
        GameState.currentScene = sceneName;
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
        localStorage.setItem('jirai_save', JSON.stringify(GameState.saveData));
    }
}

// セーブデータ読み込み
function loadSaveData() {
    const saved = localStorage.getItem('jirai_save');
    if (saved) {
        try {
            GameState.saveData = JSON.parse(saved);
            if (GameState.saveData.settings) {
                GameState.settings = GameState.saveData.settings;
            }
        } catch (e) {
            console.error('Failed to load save data');
        }
    }
}

// ステージクリア時の処理
function onStageClear(stage) {
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
    if (!GameState.saveData.gallery.videosUnlocked.includes('reward_' + stage)) {
        GameState.saveData.gallery.videosUnlocked.push('reward_' + stage);
    }

    // セーブ
    saveGame();

    // ご褒美動画表示（仮）
    alert(`ステージクリア！\nご褒美動画が解放されました`);
}

// エクスポート
window.gameMain = {
    showScene,
    saveGame,
    loadSaveData,
    onStageClear,
    showLoading,
    GameState
};