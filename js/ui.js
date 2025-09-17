// ========== UI管理 ==========

// UI要素の管理と補助関数
const UI = {
    // タブ切り替え（ギャラリー）
    initGalleryTabs() {
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                // アクティブタブ切り替え
                tabs.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');

                // コンテンツ表示
                const tabType = e.target.dataset.tab;
                this.showGalleryTab(tabType);
            });
        });
    },

    showGalleryTab(tabType) {
        const content = document.getElementById('galleryContent');
        if (!content) return;

        content.innerHTML = '';

        switch (tabType) {
            case 'videos':
                content.innerHTML = '<div class="gallery-grid" id="videoGallery"></div>';
                window.gameMain?.updateGalleryContent();
                break;
            case 'cg':
                this.showCGGallery();
                break;
            case 'music':
                this.showMusicGallery();
                break;
        }
    },

    showCGGallery() {
        const content = document.getElementById('galleryContent');
        if (!content) return;

        const cgList = [
            { id: 'ami_smile', title: 'アミの笑顔', emoji: '🖼️' },
            { id: 'ami_angry', title: 'アミの怒り', emoji: '🖼️' },
            { id: 'ami_yandere', title: 'ヤンデレアミ', emoji: '🖼️' }
        ];

        const grid = document.createElement('div');
        grid.className = 'gallery-grid';

        cgList.forEach(cg => {
            const item = document.createElement('div');
            item.className = 'gallery-item';

            const isUnlocked = this.checkCGUnlocked(cg.id);
            if (!isUnlocked) {
                item.classList.add('locked');
            }

            item.innerHTML = `
                <div class="gallery-item-title">${isUnlocked ? cg.title : '???'}</div>
                <div class="gallery-item-preview">
                    ${isUnlocked ? cg.emoji : '🔒'}
                </div>
            `;

            grid.appendChild(item);
        });

        content.appendChild(grid);
    },

    showMusicGallery() {
        const content = document.getElementById('galleryContent');
        if (!content) return;

        const musicList = [
            { id: 'bgm_date', title: 'デートBGM', emoji: '🎵' },
            { id: 'bgm_tense', title: '緊張のBGM', emoji: '🎵' },
            { id: 'bgm_horror', title: 'ホラーBGM', emoji: '🎵' }
        ];

        const grid = document.createElement('div');
        grid.className = 'gallery-grid';

        musicList.forEach(music => {
            const item = document.createElement('div');
            item.className = 'gallery-item';

            const isUnlocked = this.checkMusicUnlocked(music.id);
            if (!isUnlocked) {
                item.classList.add('locked');
            }

            item.innerHTML = `
                <div class="gallery-item-title">${isUnlocked ? music.title : '???'}</div>
                <div class="gallery-item-preview">
                    ${isUnlocked ? music.emoji : '🔒'}
                </div>
            `;

            if (isUnlocked) {
                item.addEventListener('click', () => {
                    alert(`BGM「${music.title}」を再生します\n（音声ファイルは後で追加）`);
                });
            }

            grid.appendChild(item);
        });

        content.appendChild(grid);
    },

    checkCGUnlocked(cgId) {
        const save = window.gameMain?.GameState.saveData;
        if (!save) return false;
        return save.gallery.cgUnlocked && save.gallery.cgUnlocked.includes(cgId);
    },

    checkMusicUnlocked(musicId) {
        const save = window.gameMain?.GameState.saveData;
        if (!save) return false;
        // 最初から一部解放
        const defaultUnlocked = ['bgm_date'];
        return defaultUnlocked.includes(musicId) ||
               (save.gallery.bgmUnlocked && save.gallery.bgmUnlocked.includes(musicId));
    }
};

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    UI.initGalleryTabs();
});