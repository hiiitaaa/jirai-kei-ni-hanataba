# 地雷娘に花束を - システムアーキテクチャ設計書

## 1. システム全体図

```
┌─────────────────────────────────────────────────────────┐
│                     ユーザーインターフェース                 │
│                         (index.html)                       │
└─────────────────────────────────────────────────────────┘
                              ↑
┌─────────────────────────────────────────────────────────┐
│                      メインコントローラー                    │
│                         (main.js)                          │
│  ・全体のシーン管理                                         │
│  ・各システムの初期化                                       │
│  ・セーブ/ロード管理                                        │
└─────────────────────────────────────────────────────────┘
        ↑               ↑               ↑               ↑
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  Novel    │   │   Game    │   │  Video   │   │ Trigger  │
│  System   │   │  System   │   │ Manager  │   │  System  │
│(novel.js) │   │(game.js)  │   │(video.js)│   │(trigger.js)│
└──────────┘   └──────────┘   └──────────┘   └──────────┘
        ↑               ↑               ↑               ↑
┌─────────────────────────────────────────────────────────┐
│                      CSVローダー                           │
│                     (csv_loader.js)                        │
└─────────────────────────────────────────────────────────┘
                              ↑
┌─────────────────────────────────────────────────────────┐
│                      CSVファイル群                          │
│  ・story_full.csv      - 完全なストーリーテキスト           │
│  ・video_scenes.csv    - 動画シーン定義                    │
│  ・scene_triggers.csv  - トリガー定義                      │
│  ・reward_scenes.csv   - ご褒美シーン                      │
└─────────────────────────────────────────────────────────┘
```

## 2. データフロー

### 2.1 ゲーム起動時
```
1. main.js が起動
2. csv_loader.js が全CSVファイルを読み込み
3. 各システムにデータを配布
4. タイトル画面表示
```

### 2.2 ゲームプレイ中
```
1. ユーザーがテキストをクリック
   ↓
2. trigger_system.js がトリガーチェック
   ↓
3-A. トリガーなし → novel.js が次のテキスト表示
3-B. トリガーあり →
     - 動画トリガー → video_manager.js が動画再生
     - シーントリガー → main.js がシーン切り替え
     - ゲームトリガー → game.js がマインスイーパー開始
```

## 3. 各モジュールの責任範囲

### 3.1 main.js（メインコントローラー）
**責任：**
- ゲーム全体の状態管理
- シーン遷移の制御
- セーブ/ロード機能
- 各システムの初期化と連携

**提供する関数：**
```javascript
- initializeGame()        // ゲーム初期化
- changeScene(sceneId)    // シーン切り替え
- saveGame()              // セーブ
- loadGame()              // ロード
- getCurrentScene()       // 現在のシーン取得
```

### 3.2 csv_loader.js（CSVローダー）
**責任：**
- CSVファイルの読み込み
- データのパースとオブジェクト化
- データのキャッシュ管理

**提供する関数：**
```javascript
- loadCSV(filename)           // CSV読み込み
- parseCSV(csvText)          // CSVパース
- getDataByKey(file, key)   // キーでデータ取得
- preloadAllData()           // 全データ事前読み込み
```

### 3.3 trigger_system.js（トリガーシステム）
**責任：**
- テキストトリガーの監視
- トリガー条件の判定
- 次のアクションの決定

**提供する関数：**
```javascript
- checkTrigger(sceneId, textIndex, text)  // トリガーチェック
- executeTrigger(triggerId)               // トリガー実行
- registerCustomTrigger(condition, action) // カスタムトリガー登録
```

### 3.4 novel.js（ノベルシステム）
**責任：**
- テキストの表示
- キャラクター表情の管理
- テキスト送り制御
- 背景画像の管理

**提供する関数：**
```javascript
- showDialogue(dialogueData)    // ダイアログ表示
- nextDialogue()                // 次のダイアログ
- setTextSpeed(speed)           // テキスト速度設定
- showCharacter(name, emotion)  // キャラクター表示
- changeBackground(sceneName)   // 背景画像変更
- updateAmiEmotion(emotion)     // アミの表情更新
```

### 3.5 video_manager.js（動画管理）
**責任：**
- 動画の再生制御
- 動画とテキストの同期
- 動画切り替えエフェクト

**提供する関数：**
```javascript
- playVideo(videoId)            // 動画再生
- switchVideo(nextVideoId)      // 動画切り替え
- syncDialogue(time, text)      // テキスト同期
- applyTransition(effect)       // 切り替えエフェクト
```

### 3.6 game.js（既存・マインスイーパー）
**責任：**
- マインスイーパーゲームロジック
- ゲームクリア/失敗判定

**既存の関数：**
```javascript
- init(difficulty)              // ゲーム初期化
- revealCell(index)            // セル開示
- checkWin()                   // クリア判定
```

## 4. CSVファイル仕様

### 4.1 story_full.csv
```csv
id,scene_id,sequence,speaker,text,emotion,voice_file,is_trigger,trigger_id
1,prologue_1,1,narration,"3ヶ月前――",,,,
2,prologue_1,2,narration,"図書館で本を落とした。",,,,
3,prologue_1,3,ami,"これ、あなたのでしょ？",smile,ami_001.mp3,,
4,prologue_1,4,narration,"一瞬で、堕ちた。",,,true,trg_prologue_end
```

### 4.2 scene_triggers.csv
```csv
trigger_id,trigger_type,condition,next_action,action_params,transition
trg_prologue_end,text_end,,change_scene,meeting_1,fade
trg_easy_clear,game_clear,easy,play_video,reward_1_intro,white_flash
trg_climax_1,keyword,"イク",switch_video,reward_1_climax,none
```

### 4.3 video_scenes.csv
```csv
video_id,file_path,duration,loop,category,next_video
reward_1_intro,assets/videos/reward_1_intro.mp4,10,false,reward,reward_1_main
reward_1_main,assets/videos/reward_1_main.mp4,60,true,reward,
reward_1_climax,assets/videos/reward_1_climax.mp4,15,false,reward,reward_1_after
```

### 4.4 reward_scenes.csv
```csv
scene_id,stage,video_sequence,dialogue_sync
easy_reward,easy,"reward_1_intro,reward_1_main,reward_1_climax,reward_1_after",true
normal_reward,normal,"reward_2_intro,reward_2_main,reward_2_climax",true
hard_reward,hard,"reward_3_intro,reward_3_main,reward_3_climax,reward_3_repeat",true
```

## 5. インターフェース定義

### 5.1 システム間の通信
```javascript
// Novel → Trigger
novel.onDialogueShow = (dialogueId) => {
    const trigger = triggerSystem.checkTrigger(dialogueId);
    if (trigger) {
        main.executeTrigger(trigger);
    }
};

// Trigger → Video
triggerSystem.onVideoTrigger = (videoId) => {
    videoManager.playVideo(videoId);
};

// Game → Main
game.onGameClear = (difficulty) => {
    main.handleGameClear(difficulty);
};

// Video → Novel
videoManager.onDialogueSync = (text) => {
    novel.showSyncedDialogue(text);
};
```

## 6. 実装順序

### Phase 1: 基盤構築（1週目）
1. csv_loader.js の実装
2. trigger_system.js の実装
3. 単体テストの作成

### Phase 2: 既存改修（2週目）
1. novel.js のCSV対応改修
2. main.js への統合処理追加
3. 結合テスト

### Phase 3: 新機能（3週目）
1. video_manager.js の実装
2. ご褒美シーン統合
3. 動作確認

### Phase 4: データ作成（4週目）
1. CSVファイルの作成
2. 動画ファイルの配置
3. 最終テスト

## 7. エラーハンドリング

### 7.1 CSV読み込みエラー
```javascript
try {
    await csvLoader.loadCSV('story_full.csv');
} catch (error) {
    console.error('CSV読み込みエラー:', error);
    // フォールバック: ハードコードされたデータを使用
    novel.useDefaultScenarios();
}
```

### 7.2 動画再生エラー
```javascript
video.onerror = () => {
    console.error('動画再生エラー');
    // スキップして次のシーンへ
    triggerSystem.skipToNextScene();
};
```

### 7.3 トリガー不整合
```javascript
if (!trigger.next_action) {
    console.warn('トリガーアクション未定義:', trigger.trigger_id);
    // デフォルトアクション: 次のテキストへ
    novel.nextDialogue();
}
```

## 8. テスト戦略

### 8.1 単体テスト
- 各モジュールの関数を個別にテスト
- モックデータを使用

### 8.2 結合テスト
- シーン遷移の流れをテスト
- トリガー発動を確認

### 8.3 E2Eテスト
- ゲーム開始から終了まで通しでテスト
- 各エンディングへの到達確認

## 9. パフォーマンス考慮

### 9.1 CSVキャッシュ
- 一度読み込んだデータはメモリに保持
- 必要に応じて解放

### 9.2 動画プリロード
- 次の動画を事前に読み込み
- スムーズな切り替え

### 9.3 メモリ管理
- 使用済み動画の解放
- 大量のテキストデータの分割読み込み

## 10. アセット管理

### 10.1 画像ファイル構成
```
assets/
├── backgrounds/     # 背景画像
│   ├── street_evening.png    # 夕方の街（待ち合わせ）
│   ├── restaurant.png         # レストラン外観
│   ├── restaurant_table.png   # レストラン内席
│   ├── street_night.png       # 夜の街
│   ├── ami_room.png          # アミの部屋
│   ├── ami_bedroom.png       # アミの寝室
│   └── dark_room.png         # 監禁部屋（BAD END）
│
├── sprites/        # キャラクター立ち絵
│   ├── ami_smile.png         # アミ - 笑顔
│   ├── ami_normal.png        # アミ - 通常
│   ├── ami_irritated.png    # アミ - イライラ
│   ├── ami_angry.png         # アミ - 怒り
│   ├── ami_dark.png          # アミ - 闇堕ち
│   ├── ami_yandere.png       # アミ - ヤンデレ
│   └── ami_crazy.png         # アミ - 狂気
│
└── videos/         # 動画ファイル
    ├── reward_1.mp4          # EASY クリア報酬
    ├── reward_2.mp4          # NORMAL クリア報酬
    ├── reward_3.mp4          # HARD クリア報酬
    └── special.mp4           # TRUE END 特別動画
```

### 10.2 レイヤー構成（奥から手前）
1. **背景レイヤー** - 1280×720px推奨
2. **キャラクターレイヤー** - 400×600px推奨（透過PNG）
3. **ダイアログボックスレイヤー** - 最前面

### 10.3 画像の動的追加
- 新しい表情や背景は、対応するファイルを配置してコードに1行追加するだけで対応可能
- 拡張性を考慮した設計

## 11. 更新履歴

### 2024-12-26
- 背景画像切り替えシステムを実装
- `changeBackground()`メソッドを追加
- シーン遷移時に自動的に背景が変更される機能を実装
- 背景とキャラクターを別レイヤーで管理する構造を確立

---

この設計書に基づいて実装を進めます。
変更が必要な場合は、この文書を更新してから実装に反映させます。