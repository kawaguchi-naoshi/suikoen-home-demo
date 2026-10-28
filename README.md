# 翠紅苑 トップページ 静的コーディング（Design_home_01.pdf 準拠）

- `index.html` / `assets/css/style.css` / `assets/js/main.js` / `assets/img/`（WebP＋JPGフォールバック）
- ビルド不要。Cloudflare Pages 等にそのまま配置可能。
- モーション：assets/css/motion.css ＋ assets/js/motion.js（対象要素は motion.js 冒頭の MOTION で一括指定、ヒーローは対象外、OSの「視差効果を減らす」設定時は無効）
- PC：1920pxデザイン準拠（コンテンツ幅1200px）／ブレークポイント 1279・1023・767px

## 差し替え・確認が必要な箇所（HTML内にコメントあり）
- ヒーロー：動画完成後 `<video>` を追加（※TOPは動画予定）
- 予約バー：フォームの action / パラメータ（ヤドバンス）
- 言語切替：shutto翻訳のタグ
- 交通情報：WordPress化時は `traffic-info` カテゴリから出力
- 天気：気象庁JSON（220000）をブラウザから取得。気温は週間予報の地点「静岡」の値
- Instagram：フィード用プラグインに差し替え（現在は静止画）
- ストリートビュー：Googleマップの埋め込みiframeに差し替え（現在は静止画）
- 各リンク先URL（下層ページ・プラン詳細）
