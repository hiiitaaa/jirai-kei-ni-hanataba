// ========== 動画管理システム ==========
// ご褒美動画、トランジション、アニメーションを統合管理

class VideoManager {
    constructor() {
        this.currentVideo = null;
        this.videoElement = null;
        this.videoContainer = null;
        this.isPlaying = false;
        this.isFullscreen = false;
        this.volume = 0.8;

        // 動画カタログ（CSVから読み込み予定）
        this.videoCatalog = {};
        this.videoSequences = {};

        // プレイリスト（シーン別動画管理）
        this.playlists = {};

        // 状態管理
        this.isInitialized = false;
        this.isElectron = typeof window !== 'undefined' && window.electron;

        this.initialize();
    }

    /**
     * システム初期化
     */
    async initialize() {
        console.log('[VideoManager] 初期化開始');

        try {
            // 動画コンテナを作成
            this.createVideoContainer();

            // 動画データを読み込み（将来的にCSV対応）
            await this.loadVideoData();

            // イベントリスナーを設定
            this.bindEvents();

            this.isInitialized = true;
            console.log('[VideoManager] 初期化完了');

        } catch (error) {
            console.error('[VideoManager] 初期化エラー:', error);
            // フォールバック: デフォルト設定を使用
            this.initFallbackData();
            this.createVideoContainer();
            this.bindEvents();
            this.isInitialized = true;
        }
    }

    /**
     * 動画データを読み込み
     */
    async loadVideoData() {
        console.log('[VideoManager] 動画データ読み込み開始');

        try {
            // animations.csvを読み込み（将来実装）
            if (window.csvLoader) {
                // this.videoCatalog = await csvLoader.loadCSV('animations.csv');
                // this.organizeVideoData();
            }
        } catch (error) {
            console.warn('[VideoManager] CSV読み込み失敗、フォールバックデータを使用');
        }

        // フォールバックデータを使用
        this.initFallbackData();
    }

    /**
     * フォールバックデータ初期化
     */
    initFallbackData() {
        console.log('[VideoManager] フォールバック動画データを使用');

        // 動画カタログ
        this.videoCatalog = {
            // Easy段階のご褒美動画シーケンス
            easy_reward_intro: {
                id: 'easy_reward_intro',
                title: 'Easy段階 - イントロ',
                path: 'assets/videos/easy_intro.mp4',
                duration: 10,
                nextVideo: 'easy_reward_main',
                category: 'reward',
                adult_content: true
            },
            easy_reward_main: {
                id: 'easy_reward_main',
                title: 'Easy段階 - メイン',
                path: 'assets/videos/easy_main.mp4',
                duration: 30,
                nextVideo: 'easy_reward_climax',
                category: 'reward',
                adult_content: true
            },
            easy_reward_climax: {
                id: 'easy_reward_climax',
                title: 'Easy段階 - クライマックス',
                path: 'assets/videos/easy_climax.mp4',
                duration: 15,
                nextVideo: 'easy_reward_after',
                category: 'reward',
                adult_content: true
            },
            easy_reward_after: {
                id: 'easy_reward_after',
                title: 'Easy段階 - アフター',
                path: 'assets/videos/easy_after.mp4',
                duration: 20,
                nextVideo: null,
                category: 'reward',
                adult_content: true
            },

            // Normal段階のご褒美動画シーケンス
            normal_reward_intro: {
                id: 'normal_reward_intro',
                title: 'Normal段階 - イントロ',
                path: 'assets/videos/normal_intro.mp4',
                duration: 12,
                nextVideo: 'normal_reward_main',
                category: 'reward',
                adult_content: true
            },
            normal_reward_main: {
                id: 'normal_reward_main',
                title: 'Normal段階 - メイン',
                path: 'assets/videos/normal_main.mp4',
                duration: 35,
                nextVideo: 'normal_reward_climax',
                category: 'reward',
                adult_content: true
            },

            // Hard段階のご褒美動画シーケンス
            hard_reward_intro: {
                id: 'hard_reward_intro',
                title: 'Hard段階 - イントロ',
                path: 'assets/videos/hard_intro.mp4',
                duration: 15,
                nextVideo: 'hard_reward_main',
                category: 'reward',
                adult_content: true
            },

            // 特別動画
            true_ending_special: {
                id: 'true_ending_special',
                title: 'TRUE END 特別動画',
                path: 'assets/videos/true_end_special.mp4',
                duration: 60,
                nextVideo: null,
                category: 'special',
                adult_content: true
            }
        };

        // シーケンス定義
        this.videoSequences = {
            easy_sequence: ['easy_reward_intro', 'easy_reward_main', 'easy_reward_climax', 'easy_reward_after'],
            normal_sequence: ['normal_reward_intro', 'normal_reward_main', 'normal_reward_climax', 'normal_reward_after'],
            hard_sequence: ['hard_reward_intro', 'hard_reward_main', 'hard_reward_climax', 'hard_reward_after']
        };
    }

    /**
     * 動画コンテナを作成
     */
    createVideoContainer() {
        // 既存のコンテナがあれば削除
        const existing = document.getElementById('videoContainer');
        if (existing) {
            existing.remove();
        }

        // 新しいコンテナを作成
        this.videoContainer = document.createElement('div');
        this.videoContainer.id = 'videoContainer';
        this.videoContainer.className = 'video-container hidden';

        this.videoContainer.innerHTML = `
            <div class="video-overlay">
                <div class="video-content">
                    <video id="rewardVideo" class="reward-video" muted>
                        <source src="" type="video/mp4">
                        お使いのブラウザは動画をサポートしていません。
                    </video>

                    <div class="video-controls">
                        <div class="video-info">
                            <h3 id="videoTitle">動画タイトル</h3>
                            <div class="video-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" id="progressFill"></div>
                                </div>
                                <span class="time-display">
                                    <span id="currentTime">00:00</span> /
                                    <span id="totalTime">00:00</span>
                                </span>
                            </div>
                        </div>

                        <div class="control-buttons">
                            <button id="playPauseBtn" class="control-btn">
                                <span class="play-icon">▶</span>
                                <span class="pause-icon hidden">⏸</span>
                            </button>
                            <button id="volumeBtn" class="control-btn">🔊</button>
                            <button id="fullscreenBtn" class="control-btn">⛶</button>
                            <button id="closeVideoBtn" class="control-btn close-btn">✕</button>
                        </div>

                        <div class="scene-navigation">
                            <button id="prevSceneBtn" class="nav-btn">◀ 前のシーン</button>
                            <button id="nextSceneBtn" class="nav-btn">次のシーン ▶</button>
                            <button id="skipVideoBtn" class="nav-btn skip-btn">スキップ</button>
                        </div>
                    </div>

                    <!-- 年齢確認オーバーレイ -->
                    <div id="ageVerificationOverlay" class="age-verification hidden">
                        <div class="verification-content">
                            <h2>⚠ 年齢確認</h2>
                            <p>この動画には成人向けの内容が含まれています。<br>
                               18歳以上ですか？</p>
                            <div class="verification-buttons">
                                <button id="ageConfirmBtn" class="confirm-btn">はい（18歳以上）</button>
                                <button id="ageDenyBtn" class="deny-btn">いいえ</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.videoContainer);

        // ビデオエレメントの参照を取得
        this.videoElement = document.getElementById('rewardVideo');
    }

    /**
     * イベントリスナーを設定
     */
    bindEvents() {
        if (!this.videoElement) return;

        // 動画再生イベント
        this.videoElement.addEventListener('loadedmetadata', () => {
            this.updateTimeDisplay();
        });

        this.videoElement.addEventListener('timeupdate', () => {
            this.updateProgress();
        });

        this.videoElement.addEventListener('ended', () => {
            this.onVideoEnded();
        });

        this.videoElement.addEventListener('error', (e) => {
            console.error('[VideoManager] 動画読み込みエラー:', e);
            this.showErrorMessage('動画の読み込みに失敗しました。');
        });

        // コントロールボタン
        const playPauseBtn = document.getElementById('playPauseBtn');
        const volumeBtn = document.getElementById('volumeBtn');
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        const closeBtn = document.getElementById('closeVideoBtn');
        const nextSceneBtn = document.getElementById('nextSceneBtn');
        const prevSceneBtn = document.getElementById('prevSceneBtn');
        const skipBtn = document.getElementById('skipVideoBtn');

        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        }

        if (volumeBtn) {
            volumeBtn.addEventListener('click', () => this.toggleMute());
        }

        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeVideo());
        }

        if (nextSceneBtn) {
            nextSceneBtn.addEventListener('click', () => this.nextScene());
        }

        if (prevSceneBtn) {
            prevSceneBtn.addEventListener('click', () => this.previousScene());
        }

        if (skipBtn) {
            skipBtn.addEventListener('click', () => this.skipVideo());
        }

        // 年齢確認
        const ageConfirmBtn = document.getElementById('ageConfirmBtn');
        const ageDenyBtn = document.getElementById('ageDenyBtn');

        if (ageConfirmBtn) {
            ageConfirmBtn.addEventListener('click', () => this.confirmAge());
        }

        if (ageDenyBtn) {
            ageDenyBtn.addEventListener('click', () => this.denyAge());
        }

        // キーボードショートカット
        document.addEventListener('keydown', (e) => {
            if (this.isPlaying) {
                switch (e.code) {
                    case 'Space':
                        e.preventDefault();
                        this.togglePlayPause();
                        break;
                    case 'Escape':
                        this.closeVideo();
                        break;
                    case 'ArrowRight':
                        this.skipForward(10);
                        break;
                    case 'ArrowLeft':
                        this.skipBackward(10);
                        break;
                }
            }
        });
    }

    /**
     * 動画を再生
     * @param {string} videoId - 再生する動画のID
     * @param {Object} options - 再生オプション
     */
    async playVideo(videoId, options = {}) {
        if (!this.isInitialized) {
            console.warn('[VideoManager] 初期化されていません。初期化を待機...');
            await this.initialize();
        }

        console.log(`[VideoManager] 動画再生開始: ${videoId}`);

        const videoData = this.videoCatalog[videoId];
        if (!videoData) {
            console.error(`[VideoManager] 動画が見つかりません: ${videoId}`);
            return;
        }

        this.currentVideo = videoData;

        // 年齢確認が必要な場合
        if (videoData.adult_content && !this.hasAgeConfirmation()) {
            this.showAgeVerification(videoId, options);
            return;
        }

        // 動画を実際に再生
        this.startVideoPlayback(videoId, options);
    }

    /**
     * 動画再生を実際に開始
     */
    async startVideoPlayback(videoId, options = {}) {
        const videoData = this.videoCatalog[videoId];

        // UI更新
        this.showVideoContainer();
        this.updateVideoInfo(videoData);

        // 動画ソースを設定
        const source = this.videoElement.querySelector('source');
        source.src = videoData.path;
        this.videoElement.load();

        // オプション適用
        if (options.startTime) {
            this.videoElement.currentTime = options.startTime;
        }

        if (options.volume !== undefined) {
            this.videoElement.volume = options.volume;
        } else {
            this.videoElement.volume = this.volume;
        }

        // 再生開始
        try {
            await this.videoElement.play();
            this.isPlaying = true;
            this.updatePlayPauseButton();

            console.log(`[VideoManager] 動画再生開始: ${videoData.title}`);
        } catch (error) {
            console.error('[VideoManager] 動画再生エラー:', error);
            this.showErrorMessage('動画の再生に失敗しました。');
        }
    }

    /**
     * 動画を切り替え（同一シーケンス内）
     * @param {string} videoId - 切り替える動画のID
     */
    switchVideo(videoId) {
        console.log(`[VideoManager] 動画切り替え: ${videoId}`);

        // 現在の再生位置を記録
        const currentTime = this.videoElement ? this.videoElement.currentTime : 0;

        // 新しい動画を再生
        this.playVideo(videoId, {
            startTime: 0,
            volume: this.volume
        });
    }

    /**
     * 次のシーン（動画）へ
     */
    nextScene() {
        if (!this.currentVideo || !this.currentVideo.nextVideo) {
            console.log('[VideoManager] 次の動画がありません');
            this.closeVideo();
            return;
        }

        const nextVideoId = this.currentVideo.nextVideo;
        console.log(`[VideoManager] 次の動画へ: ${nextVideoId}`);
        this.switchVideo(nextVideoId);
    }

    /**
     * 前のシーンへ（将来実装）
     */
    previousScene() {
        console.log('[VideoManager] 前のシーンへの移動（未実装）');
        // 実装予定：シーケンス内での前の動画への移動
    }

    /**
     * 動画をスキップ
     */
    skipVideo() {
        console.log('[VideoManager] 動画スキップ');

        // 次の動画があればそれを再生、なければ閉じる
        if (this.currentVideo && this.currentVideo.nextVideo) {
            this.nextScene();
        } else {
            this.closeVideo();

            // トリガーシステムに通知（スキップ完了）
            if (window.triggerSystem) {
                const skipTrigger = window.triggerSystem.checkTrigger(
                    'video_skip',
                    0,
                    'video_skipped'
                );
                if (skipTrigger) {
                    window.triggerSystem.executeTrigger(skipTrigger);
                }
            }
        }
    }

    /**
     * 動画を閉じる
     */
    closeVideo() {
        console.log('[VideoManager] 動画を閉じる');

        if (this.videoElement) {
            this.videoElement.pause();
            this.videoElement.src = '';
        }

        this.hideVideoContainer();
        this.isPlaying = false;
        this.currentVideo = null;

        // ゲームに復帰
        if (window.main && window.main.resumeFromVideo) {
            window.main.resumeFromVideo();
        }
    }

    /**
     * 再生/停止切り替え
     */
    togglePlayPause() {
        if (!this.videoElement) return;

        if (this.videoElement.paused) {
            this.videoElement.play();
            this.isPlaying = true;
        } else {
            this.videoElement.pause();
            this.isPlaying = false;
        }

        this.updatePlayPauseButton();
    }

    /**
     * ミュート切り替え
     */
    toggleMute() {
        if (!this.videoElement) return;

        this.videoElement.muted = !this.videoElement.muted;
        this.updateVolumeButton();
    }

    /**
     * フルスクリーン切り替え
     */
    toggleFullscreen() {
        if (!this.videoContainer) return;

        if (!this.isFullscreen) {
            if (this.videoContainer.requestFullscreen) {
                this.videoContainer.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    /**
     * 年齢確認表示
     */
    showAgeVerification(videoId, options) {
        const overlay = document.getElementById('ageVerificationOverlay');
        if (overlay) {
            overlay.classList.remove('hidden');

            // 確認後の処理を保存
            this.pendingVideo = { videoId, options };
        }
    }

    /**
     * 年齢確認OK
     */
    confirmAge() {
        console.log('[VideoManager] 年齢確認OK');

        // セッションストレージに記録
        sessionStorage.setItem('age_confirmed', 'true');

        // オーバーレイを隠す
        const overlay = document.getElementById('ageVerificationOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }

        // 保留中の動画を再生
        if (this.pendingVideo) {
            this.startVideoPlayback(this.pendingVideo.videoId, this.pendingVideo.options);
            this.pendingVideo = null;
        }
    }

    /**
     * 年齢確認NG
     */
    denyAge() {
        console.log('[VideoManager] 年齢確認NG');

        const overlay = document.getElementById('ageVerificationOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }

        this.closeVideo();
        this.pendingVideo = null;

        // 代替コンテンツを表示
        this.showAlternativeContent();
    }

    /**
     * 年齢確認済みかチェック
     */
    hasAgeConfirmation() {
        return sessionStorage.getItem('age_confirmed') === 'true';
    }

    /**
     * 代替コンテンツ表示
     */
    showAlternativeContent() {
        console.log('[VideoManager] 代替コンテンツ表示');
        // 実装予定：全年齢対応の代替コンテンツ
        alert('ご褒美シーンをスキップして、ストーリーを続行します。');

        if (window.novelSystem) {
            // ストーリーの続きを開始
            window.novelSystem.startScene('dinner_scene');
        }
    }

    /**
     * UI更新系メソッド群
     */
    showVideoContainer() {
        if (this.videoContainer) {
            this.videoContainer.classList.remove('hidden');
            document.body.classList.add('video-playing');
        }
    }

    hideVideoContainer() {
        if (this.videoContainer) {
            this.videoContainer.classList.add('hidden');
            document.body.classList.remove('video-playing');
        }
    }

    updateVideoInfo(videoData) {
        const title = document.getElementById('videoTitle');
        if (title) {
            title.textContent = videoData.title || '動画';
        }
    }

    updatePlayPauseButton() {
        const btn = document.getElementById('playPauseBtn');
        const playIcon = btn?.querySelector('.play-icon');
        const pauseIcon = btn?.querySelector('.pause-icon');

        if (this.isPlaying) {
            playIcon?.classList.add('hidden');
            pauseIcon?.classList.remove('hidden');
        } else {
            playIcon?.classList.remove('hidden');
            pauseIcon?.classList.add('hidden');
        }
    }

    updateVolumeButton() {
        const btn = document.getElementById('volumeBtn');
        if (btn) {
            btn.textContent = this.videoElement.muted ? '🔇' : '🔊';
        }
    }

    updateProgress() {
        if (!this.videoElement) return;

        const progressFill = document.getElementById('progressFill');
        const currentTimeEl = document.getElementById('currentTime');

        const progress = (this.videoElement.currentTime / this.videoElement.duration) * 100;

        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }

        if (currentTimeEl) {
            currentTimeEl.textContent = this.formatTime(this.videoElement.currentTime);
        }
    }

    updateTimeDisplay() {
        if (!this.videoElement) return;

        const totalTimeEl = document.getElementById('totalTime');
        if (totalTimeEl) {
            totalTimeEl.textContent = this.formatTime(this.videoElement.duration);
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * 動画終了時の処理
     */
    onVideoEnded() {
        console.log('[VideoManager] 動画終了');

        // 次の動画があるかチェック
        if (this.currentVideo && this.currentVideo.nextVideo) {
            // 自動的に次の動画を再生
            setTimeout(() => {
                this.nextScene();
            }, 1000);
        } else {
            // シーケンス終了
            setTimeout(() => {
                this.closeVideo();

                // ストーリー続行をトリガーシステムに通知
                if (window.triggerSystem) {
                    const endTrigger = window.triggerSystem.checkTrigger(
                        'video_end',
                        0,
                        'sequence_completed'
                    );
                    if (endTrigger) {
                        window.triggerSystem.executeTrigger(endTrigger);
                    }
                }
            }, 2000);
        }
    }

    /**
     * スキップ操作
     */
    skipForward(seconds) {
        if (this.videoElement) {
            this.videoElement.currentTime += seconds;
        }
    }

    skipBackward(seconds) {
        if (this.videoElement) {
            this.videoElement.currentTime = Math.max(0, this.videoElement.currentTime - seconds);
        }
    }

    /**
     * エラーメッセージ表示
     */
    showErrorMessage(message) {
        console.error(`[VideoManager] エラー: ${message}`);
        alert(message); // 将来的にはより洗練されたUI
    }

    /**
     * デバッグ用メソッド
     */
    debugStatus() {
        console.log('[VideoManager] システム状態:');
        console.log(`  初期化状態: ${this.isInitialized}`);
        console.log(`  再生中: ${this.isPlaying}`);
        console.log(`  現在の動画: ${this.currentVideo?.title || 'なし'}`);
        console.log(`  利用可能動画: ${Object.keys(this.videoCatalog).length}本`);
    }
}

// システム初期化
document.addEventListener('DOMContentLoaded', () => {
    console.log('[VideoManager] DOM読み込み完了、初期化開始');
    window.videoManager = new VideoManager();

    // デバッグモード用のグローバル関数
    if (window.DEBUG_MODE) {
        window.debugVideoManager = () => window.videoManager.debugStatus();
    }
});

// グローバル公開
if (typeof window !== 'undefined') {
    // 空のオブジェクトとして初期化（実際のインスタンスはDOMContentLoadedで作成）
    window.videoManager = window.videoManager || {};
}