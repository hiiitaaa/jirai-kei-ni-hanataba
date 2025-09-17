// ========== キャラクターアニメーションシステム ==========

class CharacterAnimation {
    constructor() {
        this.currentAnimation = null;
        this.animationFrame = null;
        this.breathingAnimation = null;
    }

    // アニメーションタイプ
    animationTypes = {
        // 1. GIFアニメーション（最も簡単）
        gif: {
            example: 'ami_idle.gif',
            usage: '<img src="assets/sprites/ami_idle.gif" alt="アミ">'
        },

        // 2. WebMビデオループ（高品質）
        webm: {
            example: 'ami_idle.webm',
            usage: '<video autoplay loop muted><source src="assets/sprites/ami_idle.webm" type="video/webm"></video>'
        },

        // 3. スプライトシートアニメーション（ゲーム的）
        spriteSheet: {
            example: 'ami_spritesheet.png',
            frames: 8,
            frameRate: 12
        },

        // 4. CSSアニメーション（軽量）
        css: {
            breathing: true,
            floating: true,
            blinking: true
        }
    };

    // キャラクター表示更新（アニメーション対応）
    updateCharacterDisplay(emotion, animationType = 'css') {
        const sprite = document.getElementById('amiSprite');
        if (!sprite) return;

        // 既存のアニメーションをクリア
        this.clearAnimations();

        switch(animationType) {
            case 'gif':
                this.displayGifAnimation(sprite, emotion);
                break;
            case 'webm':
                this.displayWebmAnimation(sprite, emotion);
                break;
            case 'spriteSheet':
                this.displaySpriteSheetAnimation(sprite, emotion);
                break;
            case 'css':
            default:
                this.displayCssAnimation(sprite, emotion);
                break;
        }
    }

    // 1. GIFアニメーション表示
    displayGifAnimation(container, emotion) {
        container.innerHTML = `
            <img src="assets/sprites/ami_${emotion}.gif"
                 alt="アミ"
                 class="character-animation"
                 style="width: 100%; height: 100%; object-fit: contain;">
        `;
    }

    // 2. WebMビデオアニメーション表示
    displayWebmAnimation(container, emotion) {
        container.innerHTML = `
            <video autoplay loop muted playsinline class="character-animation"
                   style="width: 100%; height: 100%; object-fit: contain;">
                <source src="assets/sprites/ami_${emotion}.webm" type="video/webm">
                <source src="assets/sprites/ami_${emotion}.mp4" type="video/mp4">
                <!-- フォールバック -->
                <img src="assets/sprites/ami_${emotion}.png" alt="アミ">
            </video>
        `;
    }

    // 3. スプライトシートアニメーション
    displaySpriteSheetAnimation(container, emotion) {
        const frameCount = 8;
        const frameRate = 100; // ミリ秒

        container.innerHTML = `
            <div class="sprite-animation"
                 style="width: 400px; height: 600px;
                        background: url('assets/sprites/ami_${emotion}_sheet.png');
                        background-size: ${frameCount * 100}% 100%;">
            </div>
        `;

        const spriteDiv = container.querySelector('.sprite-animation');
        let currentFrame = 0;

        // フレームアニメーション
        this.animationFrame = setInterval(() => {
            currentFrame = (currentFrame + 1) % frameCount;
            spriteDiv.style.backgroundPosition = `-${currentFrame * 400}px 0`;
        }, frameRate);
    }

    // 4. CSSアニメーション（呼吸・瞬き・揺れ）
    displayCssAnimation(container, emotion) {
        // 静止画 + CSSアニメーション
        container.innerHTML = `
            <div class="character-container">
                <img src="assets/sprites/ami_${emotion}.png"
                     alt="アミ"
                     class="character-base"
                     onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22600%22><rect fill=%22%23ff69b4%22 width=%22400%22 height=%22600%22 rx=%2220%22/><text x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22white%22 font-size=%2248%22>アミ</text></svg>'">

                <!-- オーバーレイ効果（瞬き） -->
                <div class="character-eyes"></div>

                <!-- 感情エフェクト -->
                <div class="emotion-effect ${emotion}"></div>
            </div>
        `;

        // CSSアニメーションを追加
        this.addBreathingAnimation(container);
        this.addBlinkingAnimation(container);
        this.addFloatingAnimation(container);

        // 感情に応じた特殊エフェクト
        this.addEmotionEffects(container, emotion);
    }

    // 呼吸アニメーション
    addBreathingAnimation(container) {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes breathing {
                0%, 100% { transform: scale(1) translateY(0); }
                50% { transform: scale(1.02) translateY(-5px); }
            }
            .character-base {
                animation: breathing 3s ease-in-out infinite;
            }
        `;
        container.appendChild(style);
    }

    // 瞬きアニメーション
    addBlinkingAnimation(container) {
        const eyes = container.querySelector('.character-eyes');
        if (!eyes) return;

        setInterval(() => {
            eyes.style.animation = 'blink 0.15s ease-in-out';
            setTimeout(() => {
                eyes.style.animation = '';
            }, 150);
        }, 3000 + Math.random() * 2000);

        const style = document.createElement('style');
        style.textContent = `
            @keyframes blink {
                0%, 100% { opacity: 0; }
                50% { opacity: 1; }
            }
            .character-eyes {
                position: absolute;
                top: 30%;
                left: 0;
                width: 100%;
                height: 10%;
                background: linear-gradient(180deg,
                    transparent 40%,
                    rgba(0,0,0,0.8) 50%,
                    transparent 60%);
                opacity: 0;
                pointer-events: none;
            }
        `;
        container.appendChild(style);
    }

    // 浮遊アニメーション
    addFloatingAnimation(container) {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes floating {
                0%, 100% { transform: translateX(0) rotate(0deg); }
                33% { transform: translateX(-10px) rotate(-1deg); }
                66% { transform: translateX(10px) rotate(1deg); }
            }
            .character-container {
                animation: floating 4s ease-in-out infinite;
            }
        `;
        container.appendChild(style);
    }

    // 感情エフェクト
    addEmotionEffects(container, emotion) {
        const effectsMap = {
            happy: { particles: '✨', color: '#ffeb3b' },
            angry: { particles: '💢', color: '#f44336' },
            love: { particles: '💕', color: '#ff69b4' },
            dark: { particles: '👁️', color: '#4a148c' },
            yandere: { particles: '🔪', color: '#b71c1c' }
        };

        const effect = effectsMap[emotion];
        if (!effect) return;

        // パーティクルエフェクト
        setInterval(() => {
            this.createParticle(container, effect.particles, effect.color);
        }, 1500);
    }

    // パーティクル作成
    createParticle(container, symbol, color) {
        const particle = document.createElement('div');
        particle.className = 'emotion-particle';
        particle.textContent = symbol;
        particle.style.cssText = `
            position: absolute;
            left: ${Math.random() * 80 + 10}%;
            top: ${Math.random() * 30 + 10}%;
            font-size: 24px;
            color: ${color};
            animation: particle-float 3s ease-out forwards;
            pointer-events: none;
        `;

        container.appendChild(particle);

        // アニメーション後に削除
        setTimeout(() => particle.remove(), 3000);

        // アニメーションCSS
        if (!document.getElementById('particle-style')) {
            const style = document.createElement('style');
            style.id = 'particle-style';
            style.textContent = `
                @keyframes particle-float {
                    0% {
                        opacity: 0;
                        transform: translateY(0) scale(0);
                    }
                    20% {
                        opacity: 1;
                        transform: translateY(-20px) scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: translateY(-100px) scale(0.5);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Live2Dスタイルの簡易実装
    addLive2DLikeAnimation(container, emotion) {
        // マウス追従
        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            const character = container.querySelector('.character-base');
            if (character) {
                character.style.transform = `
                    perspective(1000px)
                    rotateY(${x * 10}deg)
                    rotateX(${-y * 10}deg)
                    scale(1.05)
                `;
            }
        });

        container.addEventListener('mouseleave', () => {
            const character = container.querySelector('.character-base');
            if (character) {
                character.style.transform = '';
            }
        });
    }

    // アニメーションクリア
    clearAnimations() {
        if (this.animationFrame) {
            clearInterval(this.animationFrame);
            this.animationFrame = null;
        }
        if (this.breathingAnimation) {
            clearInterval(this.breathingAnimation);
            this.breathingAnimation = null;
        }
    }
}

// エクスポート
window.characterAnimation = new CharacterAnimation();