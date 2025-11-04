# Waste Collection Scheduler

Googleスプレッドシートから自治体のごみ収集スケジュールを読み込む、シンプルかつ汎用的なWebアプリです。フロントエンドのみで構成されているため、静的ホスティングや自治体内のファイルサーバーなど、どこでも簡単に運用できます。

## 特長

- **スプレッドシートで運用**: Googleスプレッドシートを更新するだけで最新のデータが即座に反映されます。社内の担当者がExcel感覚で扱えます。
- **複数自治体に対応**: 自治体ID・地区IDを組み合わせることで、異なる自治体・地区のスケジュールを1つのアプリで管理できます。ソースコードを他自治体に共有し、スプレッドシートだけ差し替えれば運用可能です。
- **柔軟な検索・フィルター**: 品目フィルター、キーワード検索、iCalendarファイル出力、URL共有に対応しています。
- **インストール不要**: HTML/CSS/JavaScriptのみで構成。ローカルでもサーバーでも配置するだけで動作します。

## ディレクトリ構成

```
.
├── app.js                  # アプリ本体のロジック
├── index.html              # UIの骨組み
├── styles.css              # ビジュアルデザイン
└── data
    ├── areas.csv           # フォールバック用の地区一覧サンプル
    ├── categories.csv      # フォールバック用の品目カテゴリ設定
    ├── collection_schedule.csv # フォールバック用の収集スケジュール
    └── municipalities.csv  # フォールバック用の自治体情報
```

## Googleスプレッドシートの構成

スプレッドシートには以下の4つのシートを作成し、1行目にヘッダー、2行目以降にデータを入力します。列構成はサンプルCSVと同一です。

### municipalities シート
| 列名 | 説明 |
| --- | --- |
| `municipality_id` | 自治体を一意に識別する英数字。URL等で使用します。 |
| `municipality_name` | 表示用の自治体名。 |
| `timezone` | `Asia/Tokyo` などのIANAタイムゾーン。 |
| `contact_url` | ごみ分別の公式案内ページなど。 |
| `notes` | 補足情報。UI上では説明文に活用できます。 |

### areas シート
| 列名 | 説明 |
| --- | --- |
| `municipality_id` | municipalitiesシートで定義した自治体ID。 |
| `area_id` | 地区を一意に識別する英数字。 |
| `area_name` | 表示用の地区名。 |
| `area_notes` | 地区の補足情報。 |

### categories シート
| 列名 | 説明 |
| --- | --- |
| `category_id` | 品目カテゴリを識別する英数字。 |
| `category_name` | 表示用のカテゴリ名。 |
| `color_hex` | 凡例やカードに使用されるカラーコード (例: `#ff7043`)。 |
| `description` | 品目の補足説明。 |

### collection_schedule シート
| 列名 | 説明 |
| --- | --- |
| `municipality_id` | 自治体ID。 |
| `area_id` | 地区ID。 |
| `date` | 収集日。`YYYY-MM-DD` 形式。 |
| `category_id` | categoriesシートで定義したカテゴリID。 |
| `note` | 注意事項や分別ルール。 |

> 💡 サンプルCSVと同じヘッダーであれば、そのままコピー＆ペーストでスプレッドシートに貼り付けられます。

## フォールバック用CSV

アプリはGoogleスプレッドシートの取得に失敗した場合、自動的に `data/` 以下のCSVを読み込みます。ローカル検証やネットワーク遮断時の保険として保持しています。

### municipalities.csv
| 列名 | 説明 |
| --- | --- |
| `municipality_id` | 自治体を一意に識別する英数字。URL等で使用します。 |
| `municipality_name` | 表示用の自治体名。 |
| `timezone` | `Asia/Tokyo` などのIANAタイムゾーン。 |
| `contact_url` | ごみ分別の公式案内ページなど。 |
| `notes` | 補足情報。UI上では説明文に活用できます。 |

### areas.csv
| 列名 | 説明 |
| --- | --- |
| `municipality_id` | municipalities.csvで定義した自治体ID。 |
| `area_id` | 地区を一意に識別する英数字。 |
| `area_name` | 表示用の地区名。 |
| `area_notes` | 地区の補足情報。 |

### categories.csv
| 列名 | 説明 |
| --- | --- |
| `category_id` | 品目カテゴリを識別する英数字。 |
| `category_name` | 表示用のカテゴリ名。 |
| `color_hex` | 凡例やカードに使用されるカラーコード (例: `#ff7043`)。 |
| `description` | 品目の補足説明。 |

### collection_schedule.csv
| 列名 | 説明 |
| --- | --- |
| `municipality_id` | 自治体ID。 |
| `area_id` | 地区ID。 |
| `date` | 収集日。`YYYY-MM-DD` 形式。 |
| `category_id` | categories.csv で定義したカテゴリID。 |
| `note` | 注意事項や分別ルール。 |

## 使い方

1. Googleスプレッドシートを複製し、前述の4シートを作成します。
2. 各シートに自治体IDや地区、収集日を登録します。
3. スプレッドシートの共有設定を「リンクを知っている全員が閲覧可」にします。
4. スプレッドシートのURLからID（`https://docs.google.com/spreadsheets/d/<ID>/edit` の `<ID>` 部分）を取得し、`app.js` の `CONFIG.googleSheets.spreadsheetId` に設定します。
5. ファイル一式をWebサーバーまたはファイル共有サーバーに配置します。
6. ブラウザーで `index.html` を開くと、自動的に最新データが読み込まれます。
7. URLにクエリパラメータ (`?municipality=...&area=...`) を付与することで、特定自治体・地区の状態を共有できます。

## 開発者向けメモ

- 追加の品目カテゴリを増やす際はスプレッドシートの `categories` シートを更新するだけでUIの凡例・フィルターに自動反映されます。
- 予定のエクスポート機能はICS形式に対応しています。自治体の公式カレンダーへの掲載にも活用できます。
- `styles.css` は純粋なCSSで記述しているため、必要に応じてSassなどのプリプロセッサに移行することも容易です。

## ライセンス

このリポジトリのコードはMIT Licenseの下で提供されます。自治体や地域コミュニティで自由にご利用ください。
