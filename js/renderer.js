// ========== Electron Renderer Process ==========
// ElectronのIPCを使ってメインプロセスと通信

// Electron環境かどうかチェック
let ipcRenderer = null;
let parse = null;

if (typeof require !== 'undefined') {
    try {
        const electron = require('electron');
        ipcRenderer = electron.ipcRenderer;
        const csvParse = require('csv-parse/sync');
        parse = csvParse.parse;
    } catch (e) {
        console.log('Running in non-Electron environment');
    }
}

// CSV管理クラス
class CSVManager {
    constructor() {
        this.cache = {};
    }

    // CSVファイル読み込み
    async loadCSV(fileName) {
        if (this.cache[fileName]) {
            return this.cache[fileName];
        }

        // Electron環境でない場合はダミーデータを返す
        if (!ipcRenderer || !parse) {
            console.log(`Returning dummy data for ${fileName}`);
            return [];
        }

        try {
            const result = await ipcRenderer.invoke('read-csv', fileName);
            if (result.success) {
                const records = parse(result.data, {
                    columns: true,
                    skip_empty_lines: true,
                    trim: true
                });
                this.cache[fileName] = records;
                return records;
            }
        } catch (error) {
            console.error(`Failed to load ${fileName}:`, error);
        }
        return [];
    }

    // シナリオデータ読み込み
    async loadScenarios() {
        return await this.loadCSV('scenarios.csv');
    }

    // 会話データ読み込み
    async loadDialogues() {
        return await this.loadCSV('dialogues.csv');
    }

    // レベルデータ読み込み
    async loadLevels() {
        return await this.loadCSV('levels.csv');
    }
}

// セーブデータ管理
class SaveManager {
    // セーブ
    async save(saveData) {
        if (!ipcRenderer) {
            // Electron環境でない場合はlocalStorageを使用
            try {
                localStorage.setItem('jirai_save', JSON.stringify(saveData));
                this.showMessage('セーブしました');
                return true;
            } catch (error) {
                console.error('LocalStorage save failed:', error);
                return false;
            }
        }

        try {
            const result = await ipcRenderer.invoke('save-game-data', saveData);
            if (result.success) {
                this.showMessage('セーブしました');
                return true;
            }
        } catch (error) {
            console.error('Save failed:', error);
        }
        return false;
    }

    // ロード
    async load() {
        if (!ipcRenderer) {
            // Electron環境でない場合はlocalStorageを使用
            try {
                const saved = localStorage.getItem('jirai_save');
                if (saved) {
                    return JSON.parse(saved);
                }
            } catch (error) {
                console.error('LocalStorage load failed:', error);
            }
            return null;
        }

        try {
            const result = await ipcRenderer.invoke('load-game-data');
            if (result.success) {
                return result.data;
            }
        } catch (error) {
            console.error('Load failed:', error);
        }
        return null;
    }

    // 設定保存
    async saveSettings(settings) {
        if (!ipcRenderer) {
            try {
                localStorage.setItem('jirai_settings', JSON.stringify(settings));
                return true;
            } catch (error) {
                console.error('LocalStorage settings save failed:', error);
                return false;
            }
        }

        try {
            const result = await ipcRenderer.invoke('save-settings', settings);
            return result.success;
        } catch (error) {
            console.error('Settings save failed:', error);
        }
        return false;
    }

    // 設定読み込み
    async loadSettings() {
        if (!ipcRenderer) {
            try {
                const saved = localStorage.getItem('jirai_settings');
                if (saved) {
                    return JSON.parse(saved);
                }
            } catch (error) {
                console.error('LocalStorage settings load failed:', error);
            }
            return {
                textSpeed: 50,
                bgmVolume: 0.7,
                seVolume: 0.8,
                voiceVolume: 0.9,
                autoSpeed: 2000
            };
        }

        try {
            const result = await ipcRenderer.invoke('load-settings');
            if (result.success) {
                return result.data;
            }
        } catch (error) {
            console.error('Settings load failed:', error);
        }
        return null;
    }

    // メッセージ表示
    showMessage(text) {
        const msg = document.createElement('div');
        msg.className = 'save-message';
        msg.textContent = text;
        msg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 105, 180, 0.9);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-size: 16px;
            z-index: 10000;
            animation: fadeInOut 2s ease;
        `;

        // アニメーション追加
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateY(-20px); }
                20% { opacity: 1; transform: translateY(0); }
                80% { opacity: 1; transform: translateY(0); }
                100% { opacity: 0; transform: translateY(-20px); }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 2000);
    }
}

// ビデオ再生管理
class VideoManager {
    // ご褒美動画再生
    async playRewardVideo(videoId) {
        if (!ipcRenderer) {
            alert(`ご褒美動画「${videoId}」を再生します\n（Electron環境でのみ動作）`);
            return;
        }

        try {
            const videoPath = await ipcRenderer.invoke('get-video-path', videoId);

            // ビデオプレーヤー作成
            const player = document.createElement('div');
            player.className = 'video-player';
            player.innerHTML = `
                <div class="video-overlay">
                    <video controls autoplay>
                        <source src="file://${videoPath}" type="video/mp4">
                        お使いのブラウザは動画再生に対応していません。
                    </video>
                    <button class="close-video">閉じる</button>
                </div>
            `;

            player.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 20000;
            `;

            const overlay = player.querySelector('.video-overlay');
            overlay.style.cssText = `
                position: relative;
                max-width: 90%;
                max-height: 90%;
            `;

            const video = player.querySelector('video');
            video.style.cssText = `
                width: 100%;
                height: auto;
                max-width: 1280px;
            `;

            const closeBtn = player.querySelector('.close-video');
            closeBtn.style.cssText = `
                position: absolute;
                top: -40px;
                right: 0;
                background: #ff69b4;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
            `;

            closeBtn.addEventListener('click', () => {
                video.pause();
                player.remove();
            });

            document.body.appendChild(player);

        } catch (error) {
            console.error('Video play failed:', error);
            alert('動画の再生に失敗しました');
        }
    }
}

// メニューイベント受信（Electron環境のみ）
if (ipcRenderer) {
    ipcRenderer.on('menu-new-game', () => {
        if (window.gameMain) {
            window.gameMain.showScene('title');
            document.getElementById('startBtn')?.click();
        }
    });

    ipcRenderer.on('menu-continue', () => {
        if (window.gameMain) {
            window.gameMain.showScene('title');
            document.getElementById('continueBtn')?.click();
        }
    });

    ipcRenderer.on('menu-save', async () => {
        if (window.gameMain && window.gameMain.GameState.saveData) {
            const saved = await window.saveManager.save(window.gameMain.GameState.saveData);
            if (saved) {
                window.gameMain.saveGame();
            }
        }
    });

    ipcRenderer.on('menu-load', async () => {
        const saveData = await window.saveManager.load();
        if (saveData && window.gameMain) {
            window.gameMain.GameState.saveData = saveData;
            window.saveManager.showMessage('ロードしました');
            window.gameMain.continueGame();
        }
    });
}

// 初期化
document.addEventListener('DOMContentLoaded', async () => {
    // マネージャー初期化
    window.csvManager = new CSVManager();
    window.saveManager = new SaveManager();
    window.videoManager = new VideoManager();

    // 設定読み込み
    const settings = await window.saveManager.loadSettings();
    if (settings && window.gameMain) {
        window.gameMain.GameState.settings = settings;
    }

    // CSVデータ読み込み
    const scenarios = await window.csvManager.loadScenarios();
    const dialogues = await window.csvManager.loadDialogues();
    const levels = await window.csvManager.loadLevels();

    console.log('Game data loaded:', {
        scenarios: scenarios.length,
        dialogues: dialogues.length,
        levels: levels.length
    });

    // ノベルシステムにデータ設定
    if (window.novelSystem) {
        window.novelSystem.csvData = {
            scenarios,
            dialogues,
            levels
        };
    }
});

// ウィンドウ終了時に設定保存
window.addEventListener('beforeunload', () => {
    if (window.gameMain && window.gameMain.GameState.settings) {
        window.saveManager.saveSettings(window.gameMain.GameState.settings);
    }
});