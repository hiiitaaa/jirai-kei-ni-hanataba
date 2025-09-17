const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// 開発モードかどうか
const isDev = process.env.NODE_ENV !== 'production';

// メインウィンドウ
let mainWindow;

// ウィンドウ作成
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 1024,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false // ローカルファイルアクセス許可
        },
        icon: path.join(__dirname, 'assets/icon.ico'),
        title: '地雷系に花束を',
        backgroundColor: '#000000',
        show: false
    });

    // index.htmlを読み込み
    mainWindow.loadFile('index.html');

    // 準備完了後に表示
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // 開発モードの場合はDevTools自動表示
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    // メニューバー設定
    const menu = Menu.buildFromTemplate([
        {
            label: 'ゲーム',
            submenu: [
                {
                    label: '新規ゲーム',
                    accelerator: 'Ctrl+N',
                    click: () => {
                        mainWindow.webContents.send('menu-new-game');
                    }
                },
                {
                    label: '続きから',
                    accelerator: 'Ctrl+L',
                    click: () => {
                        mainWindow.webContents.send('menu-continue');
                    }
                },
                { type: 'separator' },
                {
                    label: 'セーブ',
                    accelerator: 'Ctrl+S',
                    click: () => {
                        mainWindow.webContents.send('menu-save');
                    }
                },
                {
                    label: 'ロード',
                    accelerator: 'Ctrl+O',
                    click: () => {
                        mainWindow.webContents.send('menu-load');
                    }
                },
                { type: 'separator' },
                {
                    label: '終了',
                    accelerator: 'Alt+F4',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: '表示',
            submenu: [
                {
                    label: 'フルスクリーン',
                    accelerator: 'F11',
                    click: () => {
                        mainWindow.setFullScreen(!mainWindow.isFullScreen());
                    }
                },
                { type: 'separator' },
                {
                    label: '開発者ツール',
                    accelerator: 'F12',
                    click: () => {
                        mainWindow.webContents.toggleDevTools();
                    }
                }
            ]
        },
        {
            label: 'ヘルプ',
            submenu: [
                {
                    label: '操作方法',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: '操作方法',
                            message: '地雷系に花束を - 操作方法',
                            detail: '左クリック: マスを開く\n右クリック: フラッグを立てる\nスペース/クリック: 会話を進める\n\n彼女の地雷を踏まないように気をつけて！',
                            buttons: ['OK']
                        });
                    }
                },
                {
                    label: 'バージョン情報',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'バージョン情報',
                            message: '地雷系に花束を',
                            detail: 'Version 1.0.0\n\nマインスイーパー×ビジュアルノベル\n可愛い地雷系彼女とのデートゲーム',
                            buttons: ['OK']
                        });
                    }
                }
            ]
        }
    ]);

    Menu.setApplicationMenu(menu);

    // ウィンドウが閉じられた時
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Electronの準備完了
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// 全ウィンドウが閉じられた時
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// ========== IPC通信 ==========

// セーブデータ保存
ipcMain.handle('save-game-data', async (event, saveData) => {
    try {
        const userDataPath = app.getPath('userData');
        const savePath = path.join(userDataPath, 'save.json');

        // 暗号化（簡易的）
        const encrypted = Buffer.from(JSON.stringify(saveData)).toString('base64');

        fs.writeFileSync(savePath, encrypted, 'utf8');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// セーブデータ読み込み
ipcMain.handle('load-game-data', async (event) => {
    try {
        const userDataPath = app.getPath('userData');
        const savePath = path.join(userDataPath, 'save.json');

        if (!fs.existsSync(savePath)) {
            return { success: false, error: 'セーブデータが存在しません' };
        }

        const encrypted = fs.readFileSync(savePath, 'utf8');

        // 復号化
        const decrypted = Buffer.from(encrypted, 'base64').toString('utf8');
        const saveData = JSON.parse(decrypted);

        return { success: true, data: saveData };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// CSVファイル読み込み
ipcMain.handle('read-csv', async (event, fileName) => {
    try {
        const csvPath = path.join(__dirname, 'data', fileName);

        if (!fs.existsSync(csvPath)) {
            return { success: false, error: 'ファイルが存在しません' };
        }

        const csvContent = fs.readFileSync(csvPath, 'utf8');
        return { success: true, data: csvContent };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// ビデオファイルパス取得（ご褒美動画用）
ipcMain.handle('get-video-path', async (event, videoId) => {
    const videoPath = path.join(__dirname, 'assets', 'videos', `${videoId}.mp4`);

    // ファイル存在チェック
    if (!fs.existsSync(videoPath)) {
        // サンプル動画パスを返す（開発用）
        return path.join(__dirname, 'assets', 'videos', 'sample.mp4');
    }

    return videoPath;
});

// ゲーム設定保存
ipcMain.handle('save-settings', async (event, settings) => {
    try {
        const userDataPath = app.getPath('userData');
        const settingsPath = path.join(userDataPath, 'settings.json');

        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// ゲーム設定読み込み
ipcMain.handle('load-settings', async (event) => {
    try {
        const userDataPath = app.getPath('userData');
        const settingsPath = path.join(userDataPath, 'settings.json');

        if (!fs.existsSync(settingsPath)) {
            // デフォルト設定
            return {
                success: true,
                data: {
                    textSpeed: 50,
                    bgmVolume: 0.7,
                    seVolume: 0.8,
                    voiceVolume: 0.9,
                    autoSpeed: 2000
                }
            };
        }

        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        return { success: true, data: settings };
    } catch (error) {
        return { success: false, error: error.message };
    }
});