# Peta ikon: SF Symbols (Figma) → Lucide (kode)

Di Figma, ikon adalah glyph SF Symbols di komponen `Icon`. SF Symbols tidak boleh dipakai di web non-Apple,
jadi di kode dipakai `lucide-react` (keputusan sementara; boleh diganti Phosphor bila Jeff memilihnya).

Aturan: buat satu komponen `components/ui/Icon.tsx` dengan prop `name` memakai **nama semantik** di kolom
pertama, supaya set ikon bisa diganti di satu tempat. Ukuran mengikuti komponen Figma `11:554` (kotak / tinggi glyph):
Small 18 / 13, Medium 24 / 17, Large 31 / 22, XLarge 39 / 28 px — gambar ikon Lucide setinggi kira-kira glyph-nya,
di tengah kotak. Tebal garis 1.75–2 agar mendekati SF Symbols Regular.

**Verifikasi nama Lucide terhadap versi yang terpasang** — nama ikon Lucide pernah berganti (alias lama biasanya
masih ada). Kolom Lucide di bawah adalah usulan, belum diuji terhadap paketnya.

| Nama semantik | SF Symbol (Figma) | Codepoint | Lucide (usulan) |
| --- | --- | --- | --- |
| add | plus | U+10017C | Plus |
| close | xmark | U+100184 | X |
| check | checkmark | U+100185 | Check |
| chevron-right | chevron.right | U+10018A | ChevronRight |
| chevron-left | chevron.left | U+100189 | ChevronLeft |
| chevron-down | chevron.down | U+100188 | ChevronDown |
| checkbox-off | circle | U+100000 | Circle |
| checkbox-on | checkmark.circle.fill | U+100063 | CircleCheck (isi penuh) |
| add-circle | plus.circle.fill | U+10004D | CirclePlus (isi penuh) |
| search | magnifyingglass | U+1002AB | Search |
| nav-inbox | tray | U+100223 | Inbox |
| nav-today | sun.max | U+1001AB | Sun |
| nav-tasks | checklist | U+1002FA | ListChecks |
| nav-finance | creditcard | U+10036F | CreditCard |
| pocket | wallet.pass / .fill | U+10035D / 5E | Wallet |
| nav-notes | doc.text | U+10023F | FileText |
| nav-recap | chart.bar | U+10043E | ChartColumn |
| chart-pie | chart.pie | U+100440 | ChartPie |
| chart-line | chart.line.uptrend | U+100441 | TrendingUp |
| calendar | calendar | U+100249 | Calendar |
| clock | clock | U+10042B | Clock |
| notifications | bell | U+1002D9 | Bell |
| notifications-off | bell.slash.fill | U+1002DE | BellOff |
| nav-settings | gearshape | U+1008CB | Settings |
| filter | slider.horizontal.3 | U+100306 | SlidersHorizontal |
| edit | square.and.pencil | U+10020E | SquarePen |
| delete | trash | U+100211 | Trash2 |
| folder | folder | U+100215 | Folder |
| tag | tag | U+1002E1 | Tag |
| priority | flag / flag.fill | U+1002C9 / CA | Flag |
| pin | pin | U+1003A6 | Pin |
| undo | arrow.uturn.backward | U+100138 | Undo2 |
| retry | arrow.clockwise | U+100148 | RotateCw |
| not-synced | icloud.slash | U+10030F | CloudOff |
| warning | exclamationmark.triangle | U+1001FE | TriangleAlert |
| transfer | arrow.left.arrow.right | U+10012D | ArrowLeftRight |
| expense | arrow.up | U+100128 | ArrowUp |
| income | arrow.down | U+100129 | ArrowDown |
| export | square.and.arrow.up | U+100202 | Share |
| more | ellipsis | U+100360 | Ellipsis |
| more-circle | ellipsis.circle | U+100361 | CircleEllipsis |
| home | house | U+10039E | House |
| sidebar | sidebar.left | U+1003DA | PanelLeft |
| person | person | U+100269 | User |
| list | list.bullet | U+1002F1 | List |
| cat-food | fork.knife | U+100E29 | Utensils |
| cat-coffee | cup.and.saucer | U+100E18 | Coffee |
| cat-transport | car | U+100F5B | Car |
| cat-shopping | cart | U+100369 | ShoppingCart |
| cat-bonus | gift | U+100449 | Gift |

Ornamen onboarding/auth (envelope, lock, bolt, camera, message, mic, dll.) belum dipetakan: saat mengerjakan
layar itu, baca glyph di frame Figma dan pilih padanan Lucide yang paling mirip, lalu tambahkan ke tabel ini.
