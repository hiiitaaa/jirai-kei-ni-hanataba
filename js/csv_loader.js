// ========== CSVローダー ==========
// 全てのCSVファイルの読み込みとデータ管理を担当

class CSVLoader {
    constructor() {
        this.cache = {};  // 読み込み済みデータのキャッシュ
        this.isElectron = typeof window !== 'undefined' && window.electron;
    }

    /**
     * CSVファイルを読み込んでオブジェクトの配列に変換
     * @param {string} filename - CSVファイル名（dataフォルダからの相対パス）
     * @returns {Promise<Array>} パースされたデータの配列
     */
    async loadCSV(filename) {
        // キャッシュチェック
        if (this.cache[filename]) {
            console.log(`[CSVLoader] キャッシュから読み込み: ${filename}`);
            return this.cache[filename];
        }

        try {
            console.log(`[CSVLoader] ファイル読み込み開始: ${filename}`);

            let csvText;

            // Electron環境とWeb環境で読み込み方法を切り替え
            if (this.isElectron && window.electron?.readCSV) {
                // Electron環境
                const result = await window.electron.readCSV(filename);
                if (!result.success) {
                    throw new Error(result.error);
                }
                csvText = result.data;
            } else {
                // Web環境（開発時）
                const response = await fetch(`data/${filename}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                csvText = await response.text();
            }

            // CSVをパース
            const data = this.parseCSV(csvText);

            // キャッシュに保存
            this.cache[filename] = data;

            console.log(`[CSVLoader] 読み込み完了: ${filename} (${data.length}行)`);
            return data;

        } catch (error) {
            console.error(`[CSVLoader] 読み込みエラー: ${filename}`, error);
            throw error;
        }
    }

    /**
     * CSV文字列をオブジェクトの配列にパース
     * @param {string} csvText - CSV形式の文字列
     * @returns {Array} パースされたデータの配列
     */
    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        if (lines.length < 2) {
            return [];
        }

        // ヘッダー行を取得
        const headers = this.parseCSVLine(lines[0]);

        // データ行をパース
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length === headers.length) {
                const obj = {};
                headers.forEach((header, index) => {
                    obj[header] = this.convertValue(values[index]);
                });
                data.push(obj);
            }
        }

        return data;
    }

    /**
     * CSV行をパース（ダブルクォート対応）
     * @param {string} line - CSV行
     * @returns {Array} パースされた値の配列
     */
    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    // エスケープされたダブルクォート
                    current += '"';
                    i++;
                } else {
                    // クォートの開始/終了
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                // フィールドの区切り
                values.push(current);
                current = '';
            } else {
                current += char;
            }
        }

        // 最後のフィールドを追加
        values.push(current);

        return values;
    }

    /**
     * 値を適切な型に変換
     * @param {string} value - 変換する値
     * @returns {*} 変換後の値
     */
    convertValue(value) {
        // 空文字列はそのまま返す
        if (value === '') return '';

        // trueとfalse
        if (value.toLowerCase() === 'true') return true;
        if (value.toLowerCase() === 'false') return false;

        // 数値
        if (!isNaN(value) && value !== '') {
            return Number(value);
        }

        // それ以外は文字列として返す
        return value;
    }

    /**
     * 特定のキーでデータを取得
     * @param {string} filename - CSVファイル名
     * @param {string} key - 検索キー（カラム名）
     * @param {*} value - 検索値
     * @returns {Promise<Object|null>} 見つかったデータまたはnull
     */
    async getDataByKey(filename, key, value) {
        const data = await this.loadCSV(filename);
        return data.find(row => row[key] === value) || null;
    }

    /**
     * 条件に一致する複数のデータを取得
     * @param {string} filename - CSVファイル名
     * @param {Function} predicate - フィルター関数
     * @returns {Promise<Array>} 条件に一致するデータの配列
     */
    async filterData(filename, predicate) {
        const data = await this.loadCSV(filename);
        return data.filter(predicate);
    }

    /**
     * 全てのCSVファイルを事前読み込み
     * @param {Array<string>} filenames - 読み込むファイル名の配列
     * @returns {Promise<Object>} ファイル名をキーとしたデータのオブジェクト
     */
    async preloadAllData(filenames) {
        console.log('[CSVLoader] 全データの事前読み込み開始');

        const results = {};
        const promises = filenames.map(async (filename) => {
            try {
                results[filename] = await this.loadCSV(filename);
                return { filename, success: true };
            } catch (error) {
                console.error(`[CSVLoader] ${filename} の読み込み失敗:`, error);
                return { filename, success: false, error };
            }
        });

        const loadResults = await Promise.all(promises);

        // 読み込み結果をログ出力
        const successCount = loadResults.filter(r => r.success).length;
        const failCount = loadResults.filter(r => !r.success).length;
        console.log(`[CSVLoader] 事前読み込み完了: 成功 ${successCount}, 失敗 ${failCount}`);

        if (failCount > 0) {
            console.warn('[CSVLoader] 失敗したファイル:',
                loadResults.filter(r => !r.success).map(r => r.filename));
        }

        return results;
    }

    /**
     * キャッシュをクリア
     * @param {string} filename - クリアするファイル名（省略時は全てクリア）
     */
    clearCache(filename = null) {
        if (filename) {
            delete this.cache[filename];
            console.log(`[CSVLoader] キャッシュクリア: ${filename}`);
        } else {
            this.cache = {};
            console.log('[CSVLoader] 全キャッシュクリア');
        }
    }

    /**
     * デバッグ用: キャッシュ状況を表示
     */
    debugCache() {
        console.log('[CSVLoader] キャッシュ状況:');
        Object.keys(this.cache).forEach(filename => {
            console.log(`  ${filename}: ${this.cache[filename].length}行`);
        });
    }
}

// シングルトンインスタンスとしてエクスポート
const csvLoader = new CSVLoader();

// グローバルに公開（他のファイルから使えるように）
if (typeof window !== 'undefined') {
    window.csvLoader = csvLoader;
}