# BlueAir - Expo'dan React Native CLI'ya Geçiş ve AdMob Entegrasyonu

## Yapılan İşlemler

### 1. Expo Prebuild ile React Native Projesi Oluşturma
```bash
npx expo prebuild --clean
```

### 2. AdMob Paketinin Kurulumu
```bash
npm install react-native-google-mobile-ads
```

### 3. Android Konfigürasyonu

#### AndroidManifest.xml Güncellemeleri
- AdMob App ID meta-data eklendi: `ca-app-pub-2239637684721708~9502434939`
- Gerekli izinler eklendi:
  - `ACCESS_NETWORK_STATE`
  - `com.google.android.gms.permission.AD_ID`
- Tools namespace ve override attribute eklendi

#### Gradle Konfigürasyonu (build.gradle)
- Play Store keystore bilgileri eklendi:
  - Store File: `@ismailjacob__blueAir.jks`
  - Store Password: `087a4c44e39a371e7090362d59967881`
  - Key Alias: `be8f255fa2cc61b50a139d30dd0f986f`
  - Key Password: `9615fdca3d593cdfb5bacb0620570552`

### 4. AdMob Banner Bileşeni
- `components/AdMobBanner.tsx` dosyası oluşturuldu
- Banner ID: `ca-app-pub-2239637684721708/4961941154`
- Test modunda TestIds.BANNER kullanılıyor

### Banner Reklamların Entegrasyonu

#### Tek Banner - Tab Bar Üzerinde
- Tüm sekmeler için tek banner reklam
- Sekmelerin hemen üzerinde sabit konumda
- Banner boyutu: BANNER (320x50) - daha küçük ve uygun

#### Sayfalar
- **Home, Game, Settings**: Tüm sayfalarda aynı banner görünür
- Content'lere paddingBottom eklendi (çakışmayı önlemek için)

### 6. AdMob Initialization
- `app/_layout.tsx` içinde AdMob initialize edildi

### 7. Package.json Script Güncellemeleri
```json
{
  "android": "expo run:android",
  "android-release": "expo run:android --variant=release",
  "build:android": "cd android && ./gradlew assembleRelease",
  "build:android-bundle": "cd android && ./gradlew bundleRelease"
}
```

## AdMob Reklam Bilgileri

### Uygulama ID
- Android: `ca-app-pub-2239637684721708~9502434939`

### Banner Reklam ID
- Android: `ca-app-pub-2239637684721708/4961941154`

## Kullanım

### Development Build
```bash
npm run android
```

### Release Build
```bash
npm run android-release
```

### APK Oluşturma
```bash
npm run build:android
```

### AAB Oluşturma (Play Store)
```bash
npm run build:android-bundle
```

## Önemli Notlar

1. **Keystore Dosyası**: `@ismailjacob__blueAir.jks` dosyası proje kök dizininde bulunmalı
2. **Gerçek Reklamlar**: Uygulama release modunda gerçek AdMob reklamları gösterecek
3. **Test Reklamlar**: Development modunda test reklamları gösterilecek
4. **Banner Konumu**: Sekmelerin hemen üzerinde sabit konumda tek banner
5. **Banner Boyutu**: 320x50 (BANNER) - kullanıcı dostu boyut
6. **Content Padding**: Tüm sayfalarda banner ile çakışmayı önlemek için paddingBottom eklendi

## Keystore Parmak İzi Bilgileri
- SHA1: `DB:5D:A9:54:96:50:39:1C:B9:38:37:32:6B:FB:DC:31:B2:00:02:0E`
- SHA256: `55:B9:73:7E:33:78:16:84:3D:7E:16:28:9E:71:AD:5A:DD:05:A4:C9:74:34:25:CB:EC:BB:56:35:4A:9F:7C:8E`

Bu parmak izi Play Console ve AdMob konfigürasyonları için kullanılabilir.
