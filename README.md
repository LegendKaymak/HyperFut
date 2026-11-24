# HyperFut

Haxball tarzı, yetenekli karakterlerle oynanan tarayıcı futbol oyunu. By **LegendKaymak**.

**Oyna:** https://hyperfut-legend-kaymak.vercel.app

## Özellikler

- 25 karakter; her birinin bir pasif, bir aktif yeteneği ve bir Hyper'ı var
- Modlar: Maç, Turnuva (2–8 kişi), Penaltı atışı, Antrenman, İzle
- Formatlar: Düello (1v1), Kale Savaşı (2v2), Tam Kadro (3v3)
- 6 saha: Gece, Gündüz, Kar, Yağmur, Plaj, Futsal
- 3 zorlukta yapay zeka, 5 seviye kaleci
- Aynı klavyede 2 oyuncu, oyun kolu ve dokunmatik kontrol desteği
- Uygulama olarak yüklenebilir (PWA), çevrimdışı çalışır

## Kontroller

| | Oyuncu 1 | Oyuncu 2 |
|---|---|---|
| Hareket | W A S D | Ok tuşları |
| Şut | Boşluk | Enter |
| Yetenek | Sol Shift | Sağ Shift |

`Esc` duraklatır, `M` sesi kapatır. Tuşlar Ayarlar → Kontroller'den değiştirilebilir.

## Çalıştırma

Derleme gerekmez. Dosyaları herhangi bir statik sunucuyla açman yeterli:

```
python3 -m http.server
```
