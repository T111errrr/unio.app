# Peta Figma Unio

File: https://www.figma.com/design/4Ahe1gJdFOTNXZ274mEct9/unio---One-app-for-your-everything
File key: `4Ahe1gJdFOTNXZ274mEct9`. Buka frame dengan `?node-id=<id, ganti ":" jadi "-">`.

Page: Cover `0:1` · Design System `5:2` · Mobile — iOS `5:3` · Mobile — iOS Dark · Desktop — macOS `5:4` · Desktop — macOS (Dark).
Page Dark adalah salinan dengan mode variable Dark; untuk koding cukup baca page Light + `tokens.css`.
Prototype di tiap page = acuan perilaku (flow "1 · …", "2 · …", "3 · …"). Frame bernama `Overlay — …` hanya
alat prototype, **bukan** layar untuk dikoding.

## Komponen (Design System)

| Komponen | Node | Properti |
| --- | --- | --- |
| Icon | 11:554 | Symbol (teks), Size: Small/Medium/Large/XLarge |
| Tab Bar | 20:621 | Active: Today/Tasks/Finance/Notes/Recap |
| Tab Item | 20:492 | Label, State: Active/Inactive |
| Capture Button | 12:61 | Style: Light/Dark, State: Pressed/Default |
| Navigation Bar | 27:447 | Title, Show Action, Type: Large/Inline (slot kiri/kanan tetap 44 px) |
| Greeting Header | 27:361 | Greeting, Tagline, Show Action, Type: Default/With Date |
| Week Date Strip / Day Item | 27:382 / 27:381 | Day, Date, Show Dot, State: Default/Selected/Today/Muted |
| Section Header | 27:430 | Title, Type: Expanded/Collapsed/Plain |
| Search Field | 27:461 | State: Placeholder/Typing |
| Button | 20:347 | Label, Show Icon, Style: Primary/Secondary/Ghost, State: Default/Pressed/Disabled |
| Icon Button | 20:369 | Style: Secondary/Primary, State: Default/Pressed/Disabled |
| Text Field | 20:465 | Label, Helper, Show Helper, Type: Text/Select/Currency, State: Placeholder/Filled/Focused/Error/Disabled |
| Amount Input | 28:411 | Type: Expense/Income/Empty |
| Segmented Control | 22:459 | Label 1–3, Show Icons, Segments: 2/3, Selected: 1/2/3 |
| Category Item | 28:425 | Label, State: Default/Selected |
| Chip | 24:346 | Label, Show Chevron, Style: Light/On Dark/Selected |
| Toggle | 22:471 | State: On/Off/Disabled On/Disabled Off |
| Badge | 27:480 | Label, Show Icon, Type: Neutral/Success/Warning/Danger/Not synced/Info/Paylater/Transfer |
| Progress Bar | 27:502 | Status: Normal/Warning/Over |
| Card | 24:358 | Title, Style: Light/Dark |
| Sheet | 28:383 | Title |
| Dialog | 22:532 | Type: Confirm/Destructive |
| Toast | 13:124 | Message, Type: Saved/Not synced/Error |
| Budget Card | 24:455 | Status: Normal/Warning/Over |
| Stat Card | 13:102 | Chart: Ring/Bars/Line |
| Pocket Card | 12:279 | Type: Default/Paylater |
| Info Strip | 24:382 | Columns: 2/3 |
| Chart Card | 28:499 | Type: Bars/Donut |
| Transaction Row | 12:209 | Show Divider, Type: Expense/Income/Transfer, Sync: Synced/Not synced |
| Task Row | 12:261 | Title, Subtitle, Show Priority, Show Divider, Status: Open/Done/Overdue (Hit Area 44×44) |
| Note Card | 28:441 | Type: Default/Pinned |
| List Row | 22:504 | Title, Show Leading, Show Divider, Trailing: Chevron/Value/Toggle/Check |
| Empty State | 13:128 | Title, Description, Show Button |
| Skeleton Row | 13:139 | — |
| Mascot | 78:1003 | — |

Komponen desktop (page Desktop): Sidebar `150:802` (Active ×7, Show Collapse) · Sidebar Rail `207:13882` ·
Rail Tooltip `207:13883` · board "Desktop Components" `171:10022`: Toolbar `171:9945`, Modal `171:9944`,
Modal Header `171:9837`, Modal Footer `171:9844`, Card Header `171:9964`, Kbd `171:9831`, Shortcut Hint `171:9833`,
Settings Nav Item `171:9977`, Command Result `171:9998`, Inbox Item `171:10021`.

Setiap komponen punya deskripsi untuk dev di Figma — baca sebelum membuat komponennya.

## Layar mobile (390×844)

| Modul | Layar → node |
| --- | --- |
| Onboarding | Intro 1 `69:5439` · Intro 2 `69:5473` · Intro 3 `69:5507` · Pasang ke Home Screen `69:7063` · Izin notifikasi `69:7116` · Notifikasi ditolak `69:7156` |
| Auth | Daftar 1 `69:5544` · Daftar 2 `69:5812` · Daftar 3 `69:5947` · Daftar belum diisi `69:6082` · Email terdaftar `69:6217` · Masuk 1 `69:6356` · Masuk 2 `69:6490` · Masuk error `69:6625` · Masuk memuat `69:6764` · Lupa password `69:6899` · Tautan terkirim `69:7030` |
| Today | Default `32:38` · Loading `33:283` · Empty `33:519` · Error `33:756` · Not synced `33:881` |
| Capture (sheet) | Empty `34:780` · Expense `34:854` · Income `34:937` · Kategori `34:1019` · Task `34:1096` · Note `34:1175` · Saved (toast) `34:1242` |
| Tasks | Default `36:1259` · Completed `36:1424` · Empty `36:1544` · Loading `36:1630` · Error `36:1737` · Detail (sheet) `38:1677` · Swipe actions `38:1791` · Dialog hapus `38:1932` |
| Finance | Default `42:1949` · Empty `42:2203` · Loading `42:2259` · Error `42:2331` · Detail kantong `44:2305` · Detail Paylater `44:2411` · Detail transaksi `44:2518` · Tambah kantong `46:2520` · Tambah Paylater `46:2583` · Transfer `46:2656` · Atur budget `46:2708` |
| Notes | Default `50:2740` · Editor `50:2853` · Search `50:2938` · Empty `50:3010` · Loading `50:3087` · Error `50:3159` |
| Recap | Mingguan `53:3074` · Bulanan `53:3276` · Harian (Daily Review) `53:3445` · Ekspor `53:3573` · Ekspor berhasil `53:3635` · Data belum cukup `53:3671` · Loading `53:3748` |
| Settings | Utama `54:3665` · Tampilan `54:3804` (+ Terang `231:35310`, Gelap `231:35321`) · Notifikasi `54:3854` · Notifikasi ditolak `54:3934` · Shortcuts & Siri `54:3988` · Uji gagal `54:4094` · Dialog cabut key `54:4200` · Recently Deleted `54:4227` · Recently Deleted kosong `54:4292` · Hapus akun `54:4327` |
| Inbox & Search | Inbox `57:4240` · Inbox kosong `57:4341` · Search awal `57:4376` · Hasil `57:4440` · Tidak ada hasil `57:4531` |

## Layar desktop (1440×900, sidebar penuh)

| Modul | Layar → node |
| --- | --- |
| Auth & onboarding | Welcome `161:9673` · Masuk `161:9718` · Masuk error `161:9769` · Masuk memuat `161:9819` · Daftar `161:9869` · Email terdaftar `161:9927` · Lupa password `161:9984` · Tautan terkirim `161:10029` · Pasang aplikasi `161:10084` · Izin notifikasi `161:10161` · Notifikasi diblokir `161:10219` |
| Today | Default `151:347` · Empty `151:636` · Loading `151:815` · Offline `151:1026` |
| Catat cepat (modal) | Kosong `152:1064` · Pengeluaran `152:1216` · Pemasukan `152:1365` · Kategori belum dipilih `152:1503` · Tugas `152:1658` · Catatan `152:1791` · Tersimpan (toast) `152:1904` |
| Pencarian Ctrl K | Awal `152:1962` · Hasil `152:2087` · Tidak ada hasil `152:2198` |
| Inbox | Default `153:3496` · Empty `153:3661` |
| Tugas | Default (+ panel detail) `153:3750` · Selesai `153:4026` · Empty `153:4200` · Loading `153:4320` · Error `153:4506` · Dialog hapus `153:4626` |
| Keuangan | Default `154:4566` · Detail kantong `154:4835` · Detail Paylater `154:5008` · Atur budget `154:5170` · Empty `154:5408` · Loading `154:5505` · Error `154:5661` · Detail transaksi (drawer) `155:5517` · Tambah kantong `155:5632` · Tambah Paylater `155:5733` · Transfer `155:5849` · Hapus transaksi `155:5935` |
| Catatan | Default `155:6015` · Hasil pencarian `155:6192` · Empty `155:6343` · Loading `155:6443` |
| Recap | Mingguan `158:7249` · Bulanan `158:7467` · Harian `158:7686` · Ekspor CSV `158:7890` · Ekspor berhasil `158:7976` · Data belum cukup `158:8018` · Memuat `158:8129` |
| Pengaturan | Umum `159:8457` · Tampilan `159:8641` (+ Terang `231:35449`, Gelap `231:35499`) · Notifikasi `159:8797` · Notifikasi ditolak `159:8960` · Shortcuts & Siri `159:9133` · Uji gagal `159:9329` · Data `159:9526` · Data kosong `159:9693` · Akun `159:9832` · Dialog cabut key `159:9986` · Dialog hapus akun `159:10087` |

## Jendela kecil (1264×900, Sidebar Rail 72 px)

Isi Main sama dengan versi lebar; yang berubah hanya sidebar → rail + drawer. Cukup lihat contoh ini:
Today `208:13594` · Tugas `208:16328` · Keuangan `208:17256` · Catatan `208:19139` · Recap `208:19745` ·
Pengaturan `208:20811` · Auth Welcome `208:22640` · contoh tooltip "Today — Rail · Tooltip hover" `209:30143` ·
drawer sidebar terbuka (Today) `209:27971`.

## Perilaku dari prototype

- Mobile: pindah layar = push kiri 450 ms; sheet & dialog naik dari bawah dengan scrim; pindah tab = dissolve.
- Desktop: pindah menu = fade 200 ms; modal/dialog di tengah, detail transaksi = drawer kanan, palet di atas tengah.
- Tutup overlay: tombol ×, Batal, Esc, atau klik area gelap.
- Keyboard desktop: Ctrl+K palet, Ctrl+N catat cepat, Esc tutup.
- Pengaturan › Tampilan: pilih Ikuti sistem / Terang / Gelap → seluruh app berganti tema.
