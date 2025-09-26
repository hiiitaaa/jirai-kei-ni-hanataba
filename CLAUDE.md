# 地雷娘に花束を - 完全版ゲーム要件定義書（改訂版）

## 開発ルール
- **深く思考する**: 実装前に要件を十分に理解し、影響範囲を考慮する
- **指示された修正のみ実行**: 明確に要求されていない変更は行わない
- **ユーザーとの対話を重視**: 不明点は確認し、勝手な判断を避ける
- **理解の齟齬を防ぐ**: ユーザーとの認識が合っているか常に確認しながら進める
- **コードの再利用**: 既存のコードは可能な限り使い回し、重複を避ける
- **創作活動での柔軟な対応**: セリフやストーリー作成時は以下のファイルを必ず参照
  - `E:\tool\claude_ultra\claude_ultra.md` - 創作における柔軟な対応指針
  - `E:\tool\claude_ultra\claude_ultra_first.txt` - システム理解のためのフローチャート
  - これらは成人向け心理ホラー要素を含む本作品の表現を適切に扱うための重要な参照資料

## /init による更新履歴
- **初回/init**: 基本的なゲーム要件定義を作成
- **難易度調整**: 地雷数を下方修正（EASY:10→8、NORMAL:25→18、HARD:50→35）
- **セーブ機能追加**: 各ステージクリアで自動セーブ、タイトルから続きを選択可能
- **ギャラリー機能追加**: ステージクリアでご褒美動画解放、全クリアで全動画をいつでも閲覧可能
- **開発ルール追加**: 深い思考と指示厳守の原則を明文化
- **開発ルール更新**: 理解の齟齬防止とコード再利用の原則を追加

## 1. ゲーム概要

### 基本情報
- **タイトル**: 地雷娘に花束を
- **ジャンル**: マインスイーパー＋ビジュアルノベル
- **プラットフォーム**: Windows（exe配布）、Web版（開発時）
- **最終配布形式**: 実行ファイル（.exe）にパッケージング
- **ターゲット**: 18歳以上、サスペンス・恋愛ゲーム愛好者
- **プレイ時間**: 1周約30-60分

### コンセプト
可愛い女の子「アミ」とのデート。しかし、彼女は「地雷系」。
言葉一つで彼女の地雷を踏んでしまうと、とてつもなく罵倒され、最悪の場合は彼女の部屋に監禁されてしまう。
マインスイーパーで彼女の心の地雷を避けながら、無事に朝を迎えることが目標。

### ストーリー概要
```
夕方の待ち合わせから始まる一夜のデート。
楽しいはずの時間が、一つの失言で地獄に変わる。
彼女の心の地雷を避けて、無事に朝を迎えられるか？
```

## 2. 技術仕様

### ファイル構成
```
project/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   ├── game.js
│   ├── board.js
│   ├── cell.js
│   ├── novel.js          // ビジュアルノベルパート
│   ├── character.js
│   └── ui.js
├── data/
│   ├── scenarios.csv     // シナリオデータ
│   ├── dialogues.csv     // セリフデータ
│   ├── sprites.csv       // 画像パス管理
│   ├── animations.csv    // 動画パス管理
│   ├── sounds.csv        // 音声パス管理
│   └── levels.csv        // 難易度設定
└── assets/
    ├── sprites/          // 画像ファイル
    ├── videos/           // 動画ファイル
    └── sounds/           // 音声ファイル
```

### CSVデータ構造

#### scenarios.csv（シナリオ進行）
```csv
id,scene_name,background,bgm,next_scene,condition
1,meeting,street_evening.png,bgm_date.mp3,easy_game,none
2,easy_clear,restaurant.png,bgm_restaurant.mp3,dinner_scene,clear_easy
3,dinner_scene,restaurant_table.png,bgm_dinner.mp3,normal_game,none
4,normal_clear,street_night.png,bgm_night.mp3,home_scene,clear_normal
5,home_scene,ami_room.png,bgm_room.mp3,hard_game,none
6,hard_clear,ami_bedroom.png,bgm_morning.mp3,true_end,clear_hard
7,bad_end,dark_room.png,bgm_horror.mp3,game_over,fail_game
```

#### dialogues.csv（セリフデータ）
```csv
id,character,scene,emotion,text,voice_file,trigger
1,ami,meeting,smile,"遅い！もう、待ちくたびれちゃった♪",ami_meeting_01.mp3,start
2,ami,meeting,angry,"...なんで5分も遅れるの？私のこと、どうでもいいの？",ami_angry_01.mp3,late
3,ami,easy_game,irritated,"ねえ、私の話ちゃんと聞いてる？",ami_irritated_01.mp3,game_start
4,ami,easy_clear,happy,"よかった♪ちゃんと私のこと見てくれてるんだね！",ami_happy_01.mp3,clear
5,ami,dinner_scene,smile,"このお店、前から来たかったの！",ami_dinner_01.mp3,start
6,ami,normal_game,dark,"...さっきから他の女の子ばっかり見てない？",ami_dark_01.mp3,game_start
7,ami,normal_clear,relief,"ごめんね、私の勘違いだった...",ami_relief_01.mp3,clear
8,ami,home_scene,sweet,"私の部屋、初めてでしょ？緊張する？",ami_home_01.mp3,start
9,ami,hard_game,yandere,"ねえ...私だけを見てよ。他の誰も見ないで。",ami_yandere_01.mp3,game_start
10,ami,hard_clear,love,"大好き...ずっと一緒にいようね♪",ami_love_01.mp3,clear
11,ami,bad_end,crazy,"もう逃がさない。ずっとここにいて。私だけのものになって。",ami_crazy_01.mp3,bad_end
```

#### sprites.csv（画像管理）
```csv
id,sprite_name,file_path,width,height,category,encryption
spr_ami_smile,アミ笑顔,ami_smile.png,512,768,character,true
spr_ami_angry,アミ怒り,ami_angry.png,512,768,character,true
spr_ami_dark,アミ闇,ami_dark.png,512,768,character,true
spr_ami_yandere,アミヤンデレ,ami_yandere.png,512,768,character,true
spr_ami_crazy,アミ狂気,ami_crazy.png,512,768,character,true
bg_street_evening,夕方の街,street_evening.png,1280,720,background,true
bg_restaurant,レストラン,restaurant.png,1280,720,background,true
bg_ami_room,アミの部屋,ami_room.png,1280,720,background,true
bg_dark_room,監禁部屋,dark_room.png,1280,720,background,true
```

## 3. ゲームシステム

### 難易度設定

#### levels.csv
```csv
difficulty,grid_size,mine_count,time_limit,description,clear_requirement
easy,9x9,8,180,待ち合わせ編：不機嫌なアミの地雷を避けろ,全マス-地雷マス開放
normal,12x12,18,240,食事編：急変するアミの感情に対処せよ,全マス-地雷マス開放
hard,16x16,35,300,自宅編：ヤンデレ化したアミから生き延びろ,全マス-地雷マス開放
```

### ゲームフロー
```
1. タイトル画面
   ↓
2. プロローグ（会話シーン）
   - 夕方の待ち合わせ
   - アミが不機嫌になる
   ↓
3. EASY - 待ち合わせ編
   - マインスイーパー（9×9、地雷8個）
   - クリア → 食事シーンへ
   - 失敗 → BAD END（罵倒→監禁）
   ↓
4. 食事シーン（会話）
   - 楽しく食事
   - アミが急に不機嫌に
   ↓
5. NORMAL - 食事編
   - マインスイーパー（12×12、地雷18個）
   - クリア → 自宅シーンへ
   - 失敗 → BAD END
   ↓
6. 自宅シーン（会話）
   - アミの部屋で会話
   - アミがヤンデレ化
   ↓
7. HARD - 自宅編
   - マインスイーパー（16×16、地雷35個）
   - クリア → TRUE END（仲良く朝を迎える）
   - 失敗 → BAD END（監禁）
```

### 会話シーンシステム
```javascript
const NOVEL_SYSTEM = {
    // テキスト表示
    textSpeed: 50,           // 文字表示速度（ms）
    autoMode: false,         // オートモード
    skipMode: false,         // スキップモード
    
    // 選択肢
    choices: [
        {
            scene: "meeting",
            options: [
                { text: "ごめん、仕事が長引いて...", result: "angry" },
                { text: "待たせてごめん！すぐ行こう！", result: "normal" },
                { text: "かわいいから許して♪", result: "irritated" }
            ]
        }
    ],
    
    // 好感度（隠しパラメータ）
    affection: {
        initial: 50,
        max: 100,
        min: 0,
        gameOverThreshold: 20
    }
};
```

### マインスイーパー部分
```javascript
const MINESWEEPER_CONFIG = {
    // 地雷を踏んだ時のペナルティ
    penalty: {
        easy: "好感度-10、警告メッセージ",
        normal: "好感度-20、アミの表情が怖くなる",
        hard: "即BAD END"
    },
    
    // 特殊マス
    specialTiles: {
        heart: {
            probability: 0.05,
            effect: "好感度+5",
            sprite: "heart_tile.png"
        },
        flower: {
            probability: 0.03,
            effect: "地雷1個ヒント",
            sprite: "flower_tile.png"
        }
    },
    
    // ビジュアル
    theme: {
        easy: "pink",      // 可愛いピンク系
        normal: "purple",  // 不穏な紫系
        hard: "red"        // 危険な赤系
    }
};
```

## 4. キャラクター設定

### アミ（唯一のヒロイン）
```javascript
const AMI = {
    name: "アミ",
    age: 20,
    personality: ["可愛い", "地雷系", "ヤンデレ", "独占欲強い"],
    
    // 感情状態
    emotions: {
        happy: { sprite: "ami_smile.png", bgm: "bgm_happy.mp3" },
        normal: { sprite: "ami_normal.png", bgm: "bgm_date.mp3" },
        irritated: { sprite: "ami_irritated.png", bgm: "bgm_tense.mp3" },
        angry: { sprite: "ami_angry.png", bgm: "bgm_danger.mp3" },
        dark: { sprite: "ami_dark.png", bgm: "bgm_horror.mp3" },
        yandere: { sprite: "ami_yandere.png", bgm: "bgm_yandere.mp3" },
        crazy: { sprite: "ami_crazy.png", bgm: "bgm_badend.mp3" }
    },
    
    // 地雷ワード（マインスイーパーの地雷配置に影響）
    triggerWords: [
        "他の女",
        "仕事",
        "友達",
        "一人の時間",
        "明日早い"
    ]
};
```

## 5. UI/UX

### 会話シーン画面
```
[背景画像：シーンに応じた背景]

┌─────────────────────────────────────┐
│                                     │
│         [アミの立ち絵]              │
│                                     │
│                                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ アミ                                │
│「遅い！もう、待ちくたびれちゃった♪」│
│                                     │
│ ▼                                   │
└─────────────────────────────────────┘

[SKIP] [AUTO] [LOG] [MENU]
```

### マインスイーパー画面
```
[上部]
地雷を避けろ！ TIME: 02:45 | 残り地雷: 10

[中央 - ゲームボード]
┌─────────────────────────┐
│  マインスイーパー       │
│  (感情に応じた色調)     │
└─────────────────────────┘

[右側 - アミの状態]
┌──────────────┐
│              │
│   アミの顔   │
│   (リアル    │
│    タイム    │
│    反応)     │
│              │
├──────────────┤
│ 好感度ゲージ │
│ ████████░░   │
└──────────────┘

[下部]
💭「私の地雷、踏まないでね...」
```

### エンディング画面

#### TRUE END
```
[明るい朝の寝室]

アミ「おはよう♪ 昨日は楽しかったね」
アミ「これからもずっと一緒だよ...ね？」

[HAPPY END]
```

#### BAD END
```
[真っ暗な部屋]

アミ「もう逃がさない」
アミ「ずっと、ずーっと、ここにいて」
アミ「私だけのものになって...」

[BAD END - 監禁]
```

## 6. 演出仕様

### 感情変化演出
```javascript
const EMOTION_EFFECTS = {
    // 通常→不機嫌
    toIrritated: {
        bgm: "フェードアウト→不穏なBGM",
        visual: "画面が少し暗くなる",
        sprite: "笑顔→真顔→不機嫌"
    },
    
    // 不機嫌→激怒
    toAngry: {
        bgm: "急激に音量上昇、不協和音",
        visual: "画面が赤く染まる",
        sprite: "目が見開かれる",
        effect: "画面振動"
    },
    
    // 激怒→狂気
    toCrazy: {
        bgm: "ホラー調のBGM",
        visual: "画面にノイズ、歪み",
        sprite: "狂気の笑顔",
        effect: "画面が徐々に暗転"
    }
};
```

### 地雷を踏んだ時の演出
```javascript
const MINE_HIT_EFFECTS = {
    easy: {
        screen: "赤いフラッシュ",
        sound: "ガラスが割れる音",
        ami: "怒り顔に変化",
        dialogue: "...今、なんて言った？"
    },
    
    normal: {
        screen: "画面が割れるエフェクト",
        sound: "心臓の鼓動＋不協和音",
        ami: "闇落ち顔",
        dialogue: "許さない...絶対に許さない..."
    },
    
    hard: {
        screen: "画面が真っ暗に",
        sound: "絶叫＋ホラーSE",
        ami: "狂気の表情",
        dialogue: "あははははは！もう終わりだよ！",
        result: "即BAD END"
    }
};
```

## 7. セーブシステム

### ステージセーブ機能
各ステージクリア時に自動セーブ。タイトル画面から続きを選択可能。

### 暗号化セーブデータ
```javascript
const SAVE_DATA = {
    progress: {
        current_scene: "dinner_scene",
        cleared_stages: ["easy", "normal"],  // クリア済みステージ
        unlocked_endings: [],
        total_playtime: 1800,
        checkpoint: "normal_clear"  // 再開ポイント
    },

    statistics: {
        mines_hit: 15,
        perfect_clears: 2,
        bad_ends_seen: 3,
        true_end_achieved: false
    },

    gallery: {
        cg_unlocked: ["ami_smile", "ami_angry"],
        bgm_unlocked: ["bgm_date", "bgm_horror"],
        endings_unlocked: ["bad_end_1"],
        full_clear_bonus: false  // 全クリア特典解放フラグ
    },

    settings: {
        text_speed: 50,
        bgm_volume: 0.7,
        se_volume: 0.8,
        voice_volume: 0.9
    }
};
```

### 全クリア特典
TRUE END到達後に解放される要素：

```javascript
const FULL_CLEAR_CONTENT = {
    reward_gallery: {
        stage1_clear: "reward_video_1.mp4",  // EASY クリアのご褒美動画
        stage2_clear: "reward_video_2.mp4",  // NORMAL クリアのご褒美動画
        stage3_clear: "reward_video_3.mp4",  // HARD クリアのご褒美動画
        true_end_special: "reward_video_special.mp4",  // TRUE END特別動画
        all_videos_unlocked: true  // 全動画解放・いつでも閲覧可能
    },

    gallery_mode: {
        all_cg: true,           // 全CG閲覧可能
        all_scenes: true,       // 全シーン回想
        all_rewards: true,      // 全ご褒美動画再生
        all_voices: true        // ボイス再生
    },

    extra_content: {
        free_play: true,        // 好きなステージを自由にプレイ
        bonus_scenarios: true,   // 追加シナリオ
        hidden_videos: true      // 隠しご褒美動画
    }
};

// ギャラリー画面での動画管理
const VIDEO_GALLERY = {
    videos: [
        { id: "reward_1", title: "待ち合わせ編クリア", unlocked: false, path: "assets/videos/reward_1.mp4" },
        { id: "reward_2", title: "食事編クリア", unlocked: false, path: "assets/videos/reward_2.mp4" },
        { id: "reward_3", title: "自宅編クリア", unlocked: false, path: "assets/videos/reward_3.mp4" },
        { id: "special", title: "TRUE END達成", unlocked: false, path: "assets/videos/special.mp4" },
        { id: "hidden_1", title: "???", unlocked: false, path: "assets/videos/hidden_1.mp4" }
    ]
};
```

## 8. 動作確認用サンプルコード

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>地雷娘に花束を</title>
    <style>
        body {
            margin: 0;
            background: #000;
            color: #fff;
            font-family: 'Yu Gothic', sans-serif;
            overflow: hidden;
            user-select: none;
        }
        
        /* 会話シーン */
        #novelScene {
            position: absolute;
            width: 100%;
            height: 100%;
            display: none;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720"><rect fill="%23654321" width="1280" height="720"/></svg>');
            background-size: cover;
        }
        
        #novelScene.active {
            display: block;
        }
        
        .character-sprite {
            position: absolute;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            width: 400px;
            height: 600px;
            background: rgba(255,182,193,0.3);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 200px;
            transition: all 0.3s;
        }
        
        .character-sprite.angry {
            filter: hue-rotate(-20deg) brightness(0.8);
            background: rgba(255,0,0,0.3);
        }
        
        .dialogue-box {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            max-width: 800px;
            background: rgba(0,0,0,0.9);
            border: 2px solid #ff69b4;
            border-radius: 10px;
            padding: 20px;
        }
        
        .character-name {
            color: #ff69b4;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .dialogue-text {
            font-size: 18px;
            line-height: 1.8;
            min-height: 60px;
        }
        
        .continue-indicator {
            position: absolute;
            bottom: 10px;
            right: 20px;
            animation: blink 1s infinite;
        }
        
        @keyframes blink {
            50% { opacity: 0; }
        }
        
        /* マインスイーパーシーン */
        #gameScene {
            position: absolute;
            width: 100%;
            height: 100%;
            display: none;
            background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
        }
        
        #gameScene.active {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 50px;
        }
        
        .game-header {
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            text-align: center;
        }
        
        .game-title {
            font-size: 24px;
            color: #ff69b4;
            margin-bottom: 10px;
        }
        
        .game-info {
            display: flex;
            gap: 30px;
            justify-content: center;
            font-size: 18px;
        }
        
        #gameBoard {
            display: grid;
            gap: 2px;
            background: #000;
            padding: 10px;
            border: 3px solid #ff69b4;
            border-radius: 10px;
        }
        
        #gameBoard.easy {
            grid-template-columns: repeat(9, 35px);
        }
        
        #gameBoard.normal {
            grid-template-columns: repeat(12, 35px);
            border-color: #9b59b6;
        }
        
        #gameBoard.hard {
            grid-template-columns: repeat(16, 35px);
            border-color: #e74c3c;
        }
        
        .cell {
            width: 35px;
            height: 35px;
            background: #444;
            border: 1px solid #666;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.2s;
        }
        
        .cell:hover:not(.revealed) {
            background: #555;
            transform: scale(1.1);
        }
        
        .cell.revealed {
            background: #222;
            cursor: default;
        }
        
        .cell.mine {
            background: #e74c3c;
            animation: explode 0.5s;
        }
        
        @keyframes explode {
            0% { transform: scale(1); }
            50% { transform: scale(1.3); background: #ff0000; }
            100% { transform: scale(1); }
        }
        
        .cell.flagged {
            background: #f39c12;
        }
        
        .ami-status {
            width: 250px;
            text-align: center;
        }
        
        .ami-face {
            width: 200px;
            height: 200px;
            background: rgba(255,182,193,0.2);
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 100px;
            border: 3px solid #ff69b4;
            transition: all 0.3s;
        }
        
        .ami-face.angry {
            background: rgba(255,0,0,0.3);
            border-color: #e74c3c;
        }
        
        .affection-bar {
            width: 100%;
            height: 30px;
            background: #333;
            border-radius: 15px;
            overflow: hidden;
            margin-bottom: 20px;
        }
        
        .affection-fill {
            height: 100%;
            background: linear-gradient(90deg, #ff69b4, #ff1493);
            width: 70%;
            transition: width 0.5s;
        }
        
        .ami-thought {
            background: rgba(0,0,0,0.7);
            padding: 10px;
            border-radius: 10px;
            font-size: 14px;
            color: #ff69b4;
        }
        
        /* エンディング画面 */
        #endingScene {
            position: absolute;
            width: 100%;
            height: 100%;
            display: none;
            background: #000;
            color: #fff;
            text-align: center;
            justify-content: center;
            align-items: center;
            flex-direction: column;
        }
        
        #endingScene.active {
            display: flex;
        }
        
        .ending-title {
            font-size: 48px;
            margin-bottom: 30px;
        }
        
        .ending-title.true {
            color: #ff69b4;
        }
        
        .ending-title.bad {
            color: #e74c3c;
        }
        
        .controls-info {
            position: absolute;
            bottom: 10px;
            left: 10px;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <!-- 会話シーン -->
    <div id="novelScene" class="active">
        <div class="character-sprite" id="amiSprite">
            💕
        </div>
        <div class="dialogue-box">
            <div class="character-name">アミ</div>
            <div class="dialogue-text" id="dialogueText">
                遅い！もう、待ちくたびれちゃった♪
            </div>
            <div class="continue-indicator">▼</div>
        </div>
    </div>
    
    <!-- マインスイーパーシーン -->
    <div id="gameScene">
        <div class="game-header">
            <div class="game-title">地雷を避けろ！</div>
            <div class="game-info">
                <span>TIME: <span id="timer">00:00</span></span>
                <span>残り地雷: <span id="mineCount">10</span></span>
            </div>
        </div>
        
        <div id="gameBoard" class="easy"></div>
        
        <div class="ami-status">
            <div class="ami-face" id="amiFace">
                😊
            </div>
            <div class="affection-bar">
                <div class="affection-fill" id="affectionBar"></div>
            </div>
            <div class="ami-thought" id="amiThought">
                私の地雷、踏まないでね...
            </div>
        </div>
    </div>
    
    <!-- エンディング画面 -->
    <div id="endingScene">
        <div class="ending-title" id="endingTitle">TRUE END</div>
        <div id="endingText"></div>
    </div>
    
    <div class="controls-info">
        左クリック: 選択 | 右クリック: フラッグ | スペース: 次へ
    </div>

    <script>
        // ゲーム状態管理
        const gameState = {
            currentScene: 'novel',
            currentStage: 'meeting',
            difficulty: 'easy',
            affection: 70,
            dialogueIndex: 0
        };
        
        // シナリオデータ（CSV管理をシミュレート）
        const SCENARIO_DATA = {
            meeting: [
                { character: 'アミ', text: '遅い！もう、待ちくたびれちゃった♪', emotion: 'smile' },
                { character: 'アミ', text: '...なんで5分も遅れるの？', emotion: 'irritated' },
                { character: 'アミ', text: '私のこと、どうでもいいの？', emotion: 'angry' },
                { character: 'system', text: '[アミが不機嫌になった！地雷を避けて機嫌を直そう！]', action: 'start_game' }
            ],
            easy_clear: [
                { character: 'アミ', text: 'よかった♪ちゃんと私のこと見てくれてるんだね！', emotion: 'happy' },
                { character: 'アミ', text: 'お腹すいちゃった。ご飯食べに行こ？', emotion: 'smile' },
                { character: 'system', text: '[食事編へ進む]', action: 'next_stage' }
            ]
        };
        
        // 会話シーン制御
        function showDialogue() {
            const scene = gameState.currentStage;
            const dialogues = SCENARIO_DATA[scene];
            
            if (gameState.dialogueIndex < dialogues.length) {
                const dialogue = dialogues[gameState.dialogueIndex];
                
                if (dialogue.character === 'アミ') {
                    document.getElementById('dialogueText').textContent = dialogue.text;
                    updateAmiEmotion(dialogue.emotion);
                } else if (dialogue.character === 'system') {
                    document.getElementById('dialogueText').textContent = dialogue.text;
                    
                    if (dialogue.action === 'start_game') {
                        setTimeout(() => {
                            startMinesweeper();
                        }, 2000);
                    }
                }
                
                gameState.dialogueIndex++;
            }
        }
        
        // アミの感情更新
        function updateAmiEmotion(emotion) {
            const sprite = document.getElementById('amiSprite');
            const face = document.getElementById('amiFace');
            
            const emotions = {
                smile: { emoji: '💕', class: '' },
                irritated: { emoji: '😒', class: '' },
                angry: { emoji: '😠', class: 'angry' },
                happy: { emoji: '😊', class: '' },
                dark: { emoji: '👿', class: 'angry' }
            };
            
            const emo = emotions[emotion] || emotions.smile;
            
            if (sprite) {
                sprite.textContent = emo.emoji;
                sprite.className = 'character-sprite ' + emo.class;
            }
            
            if (face) {
                face.textContent = emo.emoji;
                face.className = 'ami-face ' + emo.class;
            }
        }
        
        // マインスイーパー開始
        function startMinesweeper() {
            document.getElementById('novelScene').classList.remove('active');
            document.getElementById('gameScene').classList.add('active');
            
            initBoard();
        }
        
        // マインスイーパー初期化
        let board = [];
        let revealed = [];
        let flagged = [];
        let mines = [];
        let gameTimer = 0;
        let timerInterval;
        
        function initBoard() {
            const sizes = {
                easy: { size: 9, mines: 8 },
                normal: { size: 12, mines: 18 },
                hard: { size: 16, mines: 35 }
            };
            
            const config = sizes[gameState.difficulty];
            const boardEl = document.getElementById('gameBoard');
            boardEl.className = gameState.difficulty;
            boardEl.innerHTML = '';
            
            const totalCells = config.size * config.size;
            board = Array(totalCells).fill(0);
            revealed = Array(totalCells).fill(false);
            flagged = Array(totalCells).fill(false);
            mines = [];
            
            // 地雷配置
            while (mines.length < config.mines) {
                const pos = Math.floor(Math.random() * totalCells);
                if (!mines.includes(pos)) {
                    mines.push(pos);
                    board[pos] = -1;
                    
                    // 周囲の数字を増やす
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            const nx = (pos % config.size) + dx;
                            const ny = Math.floor(pos / config.size) + dy;
                            if (nx >= 0 && nx < config.size && ny >= 0 && ny < config.size) {
                                const npos = ny * config.size + nx;
                                if (board[npos] !== -1) {
                                    board[npos]++;
                                }
                            }
                        }
                    }
                }
            }
            
            // セル生成
            for (let i = 0; i < totalCells; i++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.index = i;
                
                cell.addEventListener('click', () => revealCell(i, config.size));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    toggleFlag(i);
                });
                
                boardEl.appendChild(cell);
            }
            
            document.getElementById('mineCount').textContent = config.mines;
            startTimer();
        }
        
        // セルを開く
        function revealCell(index, gridSize) {
            if (revealed[index] || flagged[index]) return;
            
            revealed[index] = true;
            const cell = document.querySelector(`[data-index="${index}"]`);
            cell.classList.add('revealed');
            
            if (board[index] === -1) {
                // 地雷
                cell.classList.add('mine');
                cell.textContent = '💣';
                hitMine();
            } else {
                if (board[index] > 0) {
                    cell.textContent = board[index];
                    cell.style.color = ['', '#0099ff', '#00ff00', '#ff9900', '#ff00ff', '#ff0099', '#00ffff', '#ffffff', '#808080'][board[index]];
                } else {
                    // 空白マスは周囲も開く
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            const nx = (index % gridSize) + dx;
                            const ny = Math.floor(index / gridSize) + dy;
                            if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
                                revealCell(ny * gridSize + nx, gridSize);
                            }
                        }
                    }
                }
                
                checkWin();
            }
        }
        
        // フラッグ切り替え
        function toggleFlag(index) {
            if (revealed[index]) return;
            
            flagged[index] = !flagged[index];
            const cell = document.querySelector(`[data-index="${index}"]`);
            
            if (flagged[index]) {
                cell.classList.add('flagged');
                cell.textContent = '🚩';
            } else {
                cell.classList.remove('flagged');
                cell.textContent = '';
            }
            
            const flagCount = flagged.filter(f => f).length;
            const mineCount = mines.length - flagCount;
            document.getElementById('mineCount').textContent = Math.max(0, mineCount);
        }
        
        // 地雷を踏んだ
        function hitMine() {
            gameState.affection -= 20;
            updateAffectionBar();
            
            document.getElementById('amiFace').textContent = '😡';
            document.getElementById('amiThought').textContent = '最低...なんで私の気持ちわかってくれないの？';
            
            if (gameState.affection <= 20 || gameState.difficulty === 'hard') {
                setTimeout(() => {
                    showBadEnd();
                }, 1500);
            } else {
                setTimeout(() => {
                    alert('アミの好感度が下がった！\nもう一度挑戦...');
                    initBoard();
                }, 1500);
            }
        }
        
        // クリア判定
        function checkWin() {
            let allRevealed = true;
            for (let i = 0; i < board.length; i++) {
                if (board[i] !== -1 && !revealed[i]) {
                    allRevealed = false;
                    break;
                }
            }
            
            if (allRevealed) {
                clearInterval(timerInterval);
                document.getElementById('amiFace').textContent = '😍';
                document.getElementById('amiThought').textContent = '嬉しい！ちゃんと私のこと理解してくれてる♪';
                
                setTimeout(() => {
                    if (gameState.difficulty === 'hard') {
                        showTrueEnd();
                    } else {
                        alert('ステージクリア！次へ進みます');
                        // 次のステージへ
                        nextStage();
                    }
                }, 1500);
            }
        }
        
        // 次のステージ
        function nextStage() {
            const stages = ['easy', 'normal', 'hard'];
            const currentIndex = stages.indexOf(gameState.difficulty);
            
            if (currentIndex < stages.length - 1) {
                gameState.difficulty = stages[currentIndex + 1];
                gameState.dialogueIndex = 0;
                gameState.currentStage = gameState.difficulty + '_clear';
                
                document.getElementById('gameScene').classList.remove('active');
                document.getElementById('novelScene').classList.add('active');
                
                // 次のシーンのダイアログを表示
                showDialogue();
            }
        }
        
        // 好感度バー更新
        function updateAffectionBar() {
            const bar = document.getElementById('affectionBar');
            if (bar) {
                bar.style.width = gameState.affection + '%';
            }
        }
        
        // タイマー
        function startTimer() {
            gameTimer = 0;
            clearInterval(timerInterval);
            
            timerInterval = setInterval(() => {
                gameTimer++;
                const minutes = Math.floor(gameTimer / 60);
                const seconds = gameTimer % 60;
                document.getElementById('timer').textContent = 
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }, 1000);
        }
        
        // TRUE END
        function showTrueEnd() {
            document.getElementById('gameScene').classList.remove('active');
            document.getElementById('endingScene').classList.add('active');
            document.getElementById('endingTitle').textContent = 'TRUE END';
            document.getElementById('endingTitle').className = 'ending-title true';
            document.getElementById('endingText').innerHTML = 
                'アミ「おはよう♪ 昨日は楽しかったね」<br>' +
                'アミ「これからもずっと一緒だよ...ね？」<br><br>' +
                '無事に朝を迎えることができた。';
        }
        
        // BAD END
        function showBadEnd() {
            document.getElementById('gameScene').classList.remove('active');
            document.getElementById('endingScene').classList.add('active');
            document.getElementById('endingTitle').textContent = 'BAD END';
            document.getElementById('endingTitle').className = 'ending-title bad';
            document.getElementById('endingText').innerHTML = 
                'アミ「もう逃がさない」<br>' +
                'アミ「ずっと、ずーっと、ここにいて」<br>' +
                'アミ「私だけのものになって...」<br><br>' +
                'あなたは二度と外に出ることはなかった。';
        }
        
        // キー操作
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && gameState.currentScene === 'novel') {
                showDialogue();
            }
        });
        
        // 初期化
        updateAffectionBar();
        
        console.log('地雷娘に花束を - サンプル版');
        console.log('スペースキーで会話を進める');
        console.log('左クリック: マスを開く | 右クリック: フラッグ');
    </script>
</body>
</html>
```

---

## 改訂のポイント

1. **ゲーム構成**
   - キャラクターは「アミ」1人のみ
   - 3段階の難易度（EASY/NORMAL/HARD）
   - 会話シーン→マインスイーパー→会話シーンの流れ

2. **ストーリー進行**
   - EASY: 待ち合わせ（不機嫌）→クリアで食事へ
   - NORMAL: 食事中（急に不機嫌）→クリアで自宅へ  
   - HARD: 自宅（ヤンデレ化）→クリアで朝を迎える

3. **失敗時のペナルティ**
   - 地雷を踏むと罵倒される
   - 好感度が下がりすぎるかHARDで失敗→監禁END

4. **データ管理**
   - セリフ、画像、音声は全てCSV管理
   - 配布時はexe化してデータ保護

---

*この要件定義書に基づいてClaude Codeで実装を進めてください。*