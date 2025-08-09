import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { LanguageContext, translations } from './home';

const { width, height } = Dimensions.get('window');

// React Native için timer type
type TimerId = ReturnType<typeof setTimeout>;

export default function UmbrellaTapGame() {
  const { lang } = useContext(LanguageContext);
  const t = translations[lang];
  
  const [umbrellaOpen, setUmbrellaOpen] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0); // Toplam puan sistemi
  const [showShop, setShowShop] = useState(false); // Mağaza ekranı
  const [dropType, setDropType] = useState<'normal' | 'bonus' | 'danger'>('normal');
  const [selectedCharacter, setSelectedCharacter] = useState('🙂'); // Seçilen karakter
  const [selectedUmbrella, setSelectedUmbrella] = useState('☂️'); // Seçilen şemsiye
  const [ownedCharacters, setOwnedCharacters] = useState(['🙂']); // Sahip olunan karakterler
  const [ownedUmbrellas, setOwnedUmbrellas] = useState(['☂️']); // Sahip olunan şemsiyeler
  const [showResetConfirm, setShowResetConfirm] = useState(false); // Reset onay ekranı
  const [showInsufficientFunds, setShowInsufficientFunds] = useState(false); // Yetersiz para uyarısı

  const dropY = useRef(new Animated.Value(0)).current;
  const umbrellaTimeoutRef = useRef<TimerId | null>(null);
  const isDropFallingRef = useRef(false);
  const gameLoopRef = useRef<TimerId | null>(null);
  const currentDropYRef = useRef(0);
  const umbrellaOpenRef = useRef(false); // Real-time şemsiye durumu
  const gameOverRef = useRef(false); // Real-time game over durumu
  const umbrellaCanToggleRef = useRef(true); // Şemsiye açılıp kapanabilir mi
  const umbrellaUsedRef = useRef(false); // Bu damla için şemsiye kullanıldı mı

  // Yüksek skoru yükle
  const loadHighScore = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem('@umbrella_high_score');
      if (saved) {
        setHighScore(parseInt(saved));
      }
    } catch (error) {
      console.log('Skor yüklenirken hata:', error);
    }
  }, []);

  // Yüksek skoru kaydet
  const saveHighScore = useCallback(async (newScore: number) => {
    try {
      if (newScore > highScore) {
        await AsyncStorage.setItem('@umbrella_high_score', newScore.toString());
        setHighScore(newScore);
      }
    } catch (error) {
      console.log('Skor kaydedilirken hata:', error);
    }
  }, [highScore]);

  // Toplam puanları yükle
  const loadTotalCoins = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem('@umbrella_total_coins');
      if (saved) {
        setTotalCoins(parseInt(saved));
      }
    } catch (error) {
      console.log('Toplam puan yüklenirken hata:', error);
    }
  }, []);

  // Karakter ve şemsiye verilerini yükle
  const loadShopData = useCallback(async () => {
    try {
      const savedCharacter = await AsyncStorage.getItem('@umbrella_selected_character');
      const savedUmbrella = await AsyncStorage.getItem('@umbrella_selected_umbrella');
      const savedOwnedCharacters = await AsyncStorage.getItem('@umbrella_owned_characters');
      const savedOwnedUmbrellas = await AsyncStorage.getItem('@umbrella_owned_umbrellas');
      
      if (savedCharacter) setSelectedCharacter(savedCharacter);
      if (savedUmbrella) setSelectedUmbrella(savedUmbrella);
      if (savedOwnedCharacters) setOwnedCharacters(JSON.parse(savedOwnedCharacters));
      if (savedOwnedUmbrellas) setOwnedUmbrellas(JSON.parse(savedOwnedUmbrellas));
    } catch (error) {
      console.log('Mağaza verileri yüklenirken hata:', error);
    }
  }, []);

  // Karakter ve şemsiye verilerini kaydet
  const saveShopData = useCallback(async () => {
    try {
      await AsyncStorage.setItem('@umbrella_selected_character', selectedCharacter);
      await AsyncStorage.setItem('@umbrella_selected_umbrella', selectedUmbrella);
      await AsyncStorage.setItem('@umbrella_owned_characters', JSON.stringify(ownedCharacters));
      await AsyncStorage.setItem('@umbrella_owned_umbrellas', JSON.stringify(ownedUmbrellas));
    } catch (error) {
      console.log('Mağaza verileri kaydedilirken hata:', error);
    }
  }, [selectedCharacter, selectedUmbrella, ownedCharacters, ownedUmbrellas]);

  // Toplam puanları kaydet (maksimum 500.000)
  const saveTotalCoins = useCallback(async (newCoins: number) => {
    try {
      const limitedCoins = Math.min(newCoins, 500000); // Maksimum 500.000
      await AsyncStorage.setItem('@umbrella_total_coins', limitedCoins.toString());
      setTotalCoins(limitedCoins);
    } catch (error) {
      console.log('Toplam puan kaydedilirken hata:', error);
    }
  }, []);

  // Satın alma fonksiyonu
  const purchaseItem = useCallback((itemType: 'character' | 'umbrella', item: string, price: number) => {
    if (totalCoins >= price) {
      // Parayı düş
      const newCoins = totalCoins - price;
      setTotalCoins(newCoins);
      saveTotalCoins(newCoins);
      
      if (itemType === 'character') {
        // Karakteri sahip olunanlar listesine ekle (seçim yapmadan)
        setOwnedCharacters(prev => {
          if (!prev.includes(item)) {
            const newOwned = [...prev, item];
            // Verileri kaydet
            setTimeout(() => saveShopData(), 100);
            return newOwned;
          }
          return prev;
        });
        console.log('🧑 Karakter satın alındı:', item);
      } else {
        // Şemsiyeyi sahip olunanlar listesine ekle (seçim yapmadan)
        setOwnedUmbrellas(prev => {
          if (!prev.includes(item)) {
            const newOwned = [...prev, item];
            // Verileri kaydet
            setTimeout(() => saveShopData(), 100);
            return newOwned;
          }
          return prev;
        });
        console.log('☂️ Şemsiye satın alındı:', item);
      }
      
      // Haptic feedback
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {
        console.log('Haptic feedback error:', e);
      }
    } else {
      // Yeterli para yok - uyarı göster
      setShowInsufficientFunds(true);
      console.log('💸 Yeterli para yok!', 'Gerekli:', price, 'Mevcut:', totalCoins);
      
      // Haptic feedback - hata
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch (e) {
        console.log('Haptic feedback error:', e);
      }
      
      // 3 saniye sonra uyarıyı kapat (sadece hâlâ açıksa)
      setTimeout(() => {
        setShowInsufficientFunds(prev => prev ? false : prev);
      }, 3000);
    }
  }, [totalCoins, saveTotalCoins, saveShopData]);

  // Karakter/şemsiye seçim fonksiyonu
  const selectItem = useCallback((itemType: 'character' | 'umbrella', item: string) => {
    if (itemType === 'character') {
      setSelectedCharacter(item);
      console.log('🧑 Karakter seçildi:', item);
    } else {
      setSelectedUmbrella(item);
      console.log('☂️ Şemsiye seçildi:', item);
    }
    // Verileri kaydet
    setTimeout(() => saveShopData(), 100);
    
    // Haptic feedback
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      console.log('Haptic feedback error:', e);
    }
  }, [saveShopData]);

  // Zorluk seviyesi hesapla (puan arttıkça yavaş yavaş zorlaşsın)
  const getDifficulty = useCallback((currentScore: number) => {
    const baseSpeed = 2500; // Başlangıç hızı
    const speedIncrease = Math.floor(currentScore / 2) * 100; // Her 2 puana 100ms artış
    const finalSpeed = Math.max(800, baseSpeed - speedIncrease); // Minimum 0.8 saniye
    return finalSpeed;
  }, []);

  // Damla türü seç (puana göre tehlikeli damla oranı artar)
  const selectDropType = useCallback((currentScore: number) => {
    const random = Math.random();
    
    // İlk 3 puanda tehlikeli damla çıkmasın
    if (currentScore < 3) {
      if (random < 0.85) return 'normal';
      return 'bonus'; // Sadece normal ve bonus
    }
    
    // 3+ puandan sonra normal oranlar
    if (random < 0.8) return 'normal';
    if (random < 0.95) return 'bonus';
    return 'danger';
  }, []);

  // Oyunu sıfırla - önce tanımla
  const restartGame = useCallback(() => {
    // Tüm timeout'ları temizle
    if (umbrellaTimeoutRef.current) {
      clearTimeout(umbrellaTimeoutRef.current);
    }
    if (gameLoopRef.current) {
      clearTimeout(gameLoopRef.current);
    }
    
    // Animation'ı durdur
    dropY.stopAnimation();
    
    // State'leri sıfırla
    setScore(0);
    setGameOver(false);
    gameOverRef.current = false; // Ref'i de sıfırla
    setGameStarted(false); // Oyunu başlat butonunu tekrar göster
    setUmbrellaOpen(false);
    setDropType('normal'); // Damla türünü sıfırla
    umbrellaOpenRef.current = false; // Ref'i de sıfırla
    umbrellaCanToggleRef.current = true; // Toggle ref'i sıfırla
    umbrellaUsedRef.current = false; // Şemsiye kullanım ref'i sıfırla
    isDropFallingRef.current = false;
    
    // Drop position'ı sıfırla
    dropY.setValue(0);
    
    console.log('🔄 Game restarted - gameStarted set to false');
  }, [dropY]);

  // Oyunu tamamen sıfırla - tüm veriler silinir
  const resetGameCompletely = useCallback(async () => {
    try {
      // AsyncStorage'daki tüm oyun verilerini sil
      await AsyncStorage.multiRemove([
        '@umbrella_high_score',
        '@umbrella_total_coins',
        '@umbrella_selected_character',
        '@umbrella_selected_umbrella',
        '@umbrella_owned_characters',
        '@umbrella_owned_umbrellas'
      ]);
      
      // State'leri varsayılan değerlere döndür
      setHighScore(0);
      setTotalCoins(0);
      setSelectedCharacter('🙂');
      setSelectedUmbrella('☂️');
      setOwnedCharacters(['🙂']);
      setOwnedUmbrellas(['☂️']);
      setScore(0);
      setGameOver(false);
      setGameStarted(false);
      gameOverRef.current = false;
      
      // Tüm modal'ları kapat
      setShowResetConfirm(false);
      setShowInsufficientFunds(false);
      setShowShop(false);
      
      // Oyunu sıfırla
      restartGame();
      
      console.log('🔄 Oyun tamamen sıfırlandı!');
      
      // Başarı haptic feedback
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {
        console.log('Haptic feedback error:', e);
      }
      
    } catch (error) {
      console.log('Oyun sıfırlanırken hata:', error);
    }
  }, [restartGame]);

  // Yağmur damlasını düşür - gerçek zamanlı collision ile
  const startDrop = useCallback((currentScore = score) => {
    console.log('🌧️ startDrop called - gameOver:', gameOverRef.current, 'isDropFalling:', isDropFallingRef.current, 'score:', currentScore);
    
    if (gameOverRef.current || isDropFallingRef.current) {
      console.log('🚫 startDrop blocked - gameOver or drop already falling');
      return;
    }
    
    // Damla türünü seç ve hızı hesapla - güncel score ile
    const currentDropType = selectDropType(currentScore);
    let dropSpeed = getDifficulty(currentScore);
    
    // Tehlikeli damla her zaman hızlı ama biraz daha makul!
    if (currentDropType === 'danger') {
      dropSpeed = 800; // 0.8 saniye - hızlı ama çok aşırı değil
    }
    
    setDropType(currentDropType);
    
    console.log('🌧️ Starting new drop:', currentDropType, 'Speed:', dropSpeed + 'ms', 'Score:', currentScore);
    isDropFallingRef.current = true;
    umbrellaUsedRef.current = false; // Yeni damla için şemsiye hakkını sıfırla
    dropY.setValue(0);
    currentDropYRef.current = 0;
    
    // Animation listener - damlanın pozisyonunu takip et
    const listener = dropY.addListener(({ value }) => {
      currentDropYRef.current = value;
      
      // Debug: Animasyon çalışıyor mu kontrol et (ilk birkaç değer için)
      if (value > 0 && value < 50) {
        console.log('🎯 Animation started, drop at position:', value);
      }
      
      // Şemsiye seviyesinde kontrol et (daha geniş alan)
      if (value > height - 250 && value < height - 150) {
        // Şemsiye açık mı kontrol et - REF kullan!
        if (umbrellaOpenRef.current) {
          // Şemsiye açık ve damla şemsiye alanında!
          console.log('🎯 Drop caught by umbrella! Position:', value, 'Type:', currentDropType);
          dropY.stopAnimation();
          dropY.removeListener(listener);
          isDropFallingRef.current = false;
          
          // Haptic feedback
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } catch (e) {
            console.log('Haptic feedback error:', e);
          }
          
          // Damla türüne göre puan ver
          setScore(prevScore => {
            let scoreIncrease = 1;
            if (currentDropType === 'bonus') scoreIncrease = 3; // Bonus damla 3 puan
            if (currentDropType === 'danger') scoreIncrease = 5; // Tehlike damlası 5 puan (risk alırsan ödül)
            
            const newScore = prevScore + scoreIncrease;
            console.log('📊 Score updated from', prevScore, 'to', newScore, `(+${scoreIncrease})`);
            saveHighScore(newScore);
            
            // Toplam puanları da artır - functional update (limit kontrollü)
            setTotalCoins(prevCoins => {
              const newTotalCoins = Math.min(prevCoins + scoreIncrease, 500000); // Maksimum 500.000
              saveTotalCoins(newTotalCoins);
              console.log('💰 Total coins:', newTotalCoins, `(+${scoreIncrease})`);
              if (newTotalCoins === 500000 && prevCoins < 500000) {
                console.log('💰 Maximum coins reached! (500,000)');
              }
              return newTotalCoins;
            });
            
            // Yeni damla 1.2 saniye sonra - YENİ SCORE İLE
            gameLoopRef.current = setTimeout(() => {
              console.log('⏰ Starting new drop after catch, gameOver:', gameOverRef.current, 'New score for difficulty:', newScore);
              if (!gameOverRef.current) {
                startDrop(newScore); // Yeni score'u geç
              }
            }, 1200);
            
            return newScore;
          });
          return;
        } else if (currentDropType === 'danger') {
          // Tehlike damlası şemsiye olmadan geçerse game over!
          console.log('💀 Danger drop passed without umbrella! Position:', value);
          dropY.stopAnimation();
          dropY.removeListener(listener);
          isDropFallingRef.current = false;
          setGameOver(true);
          gameOverRef.current = true;
          
          // Güçlü vibrasyon
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          } catch (e) {
            console.log('Haptic feedback error:', e);
          }
          
          saveHighScore(score);
          return;
        }
      }
      
      // Tehlike damlası için özel kontrol - şemsiye açık olsa bile %20 şans game over! (daha kolay)
      if (currentDropType === 'danger' && value > height - 200) {
        if (umbrellaOpenRef.current) {
          // Şemsiye açık ama %20 şans game over!
          const riskChance = Math.random();
          if (riskChance < 0.2) {
            console.log('💀 Danger drop broke through umbrella! Risk chance:', riskChance);
            dropY.stopAnimation();
            dropY.removeListener(listener);
            isDropFallingRef.current = false;
            setGameOver(true);
            gameOverRef.current = true;
            
            // Güçlü vibrasyon
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            } catch (e) {
              console.log('Haptic feedback error:', e);
            }
            
            saveHighScore(score);
            return;
          }
        }
      }
      
      // Karakter seviyesinde kontrol et (şemsiye kapalıysa)
      if (value > height - 200) {
        if (!umbrellaOpenRef.current) {
          console.log('💧 Drop hit character, umbrella closed! Position:', value);
          dropY.stopAnimation();
          dropY.removeListener(listener);
          isDropFallingRef.current = false;
          setGameOver(true);
          gameOverRef.current = true; // Ref'i de güncelle
          saveHighScore(score); // Son skoru kaydet
          return;
        }
      }
    });
    
    console.log('🎬 Starting animation with duration:', dropSpeed, 'target:', height - 180);
    Animated.timing(dropY, {
      toValue: height - 180, // Karakter seviyesi
      duration: dropSpeed, // Dinamik hız
      useNativeDriver: false, // Position için false gerekli
    }).start(({ finished }) => {
      console.log('🎬 Animation finished:', finished, 'gameOver:', gameOverRef.current);
      dropY.removeListener(listener);
      
      if (finished && !gameOverRef.current) {
        isDropFallingRef.current = false;
        // Eğer buraya kadar geldiysek ama listener tarafından yakalanmadıysa, kaçırdık
        console.log('💧 Drop reached bottom without being caught');
        setGameOver(true);
        gameOverRef.current = true;
      }
    });
  }, [dropY, saveHighScore, score, getDifficulty, selectDropType, saveTotalCoins]); // score default parameter için gerekli

  // Şemsiye açma ve timing
  const handleTap = useCallback(() => {
    if (gameOver) {
      restartGame();
    } else if (!gameStarted) {
      // Oyun başlamamışsa hiçbir şey yapma (artık buton var)
      return;
    } else {
      // Şemsiyeyi aç - SADECE kapalı ise VE henüz kullanılmadıysa
      if (!umbrellaOpen && umbrellaCanToggleRef.current && !umbrellaUsedRef.current) {
        setUmbrellaOpen(true);
        umbrellaOpenRef.current = true; // Ref'i güncelle
        umbrellaCanToggleRef.current = false; // Tekrar açılmasını engelle
        umbrellaUsedRef.current = true; // Bu damla için şemsiye kullanıldı
        console.log('☂️ Umbrella opened (1 use per drop)');
        
        // Hafif haptic feedback
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (e) {
          console.log('Haptic feedback error:', e);
        }
        
        // Önceki timeout'u temizle
        if (umbrellaTimeoutRef.current) {
          clearTimeout(umbrellaTimeoutRef.current);
        }
        
        // Şemsiye açık kalma süresi - puana göre azalır (daha zor)
        const umbrellaTime = Math.max(400, 650 - (score * 8)); // Her puan 8ms daha kısa, minimum 0.4s
        umbrellaTimeoutRef.current = setTimeout(() => {
          setUmbrellaOpen(false);
          umbrellaOpenRef.current = false; // Ref'i güncelle
          umbrellaCanToggleRef.current = true; // Tekrar açılabilir
          console.log('☂️ Umbrella closed');
        }, umbrellaTime);
      }
    }
  }, [gameOver, gameStarted, restartGame, umbrellaOpen, score]); // score dependency eklendi

  // Cleanup effect + High score yükle
  useEffect(() => {
    loadHighScore(); // Component mount olduğunda high score'u yükle
    loadTotalCoins(); // Toplam puanları yükle
    loadShopData(); // Mağaza verilerini yükle
    
    return () => {
      if (umbrellaTimeoutRef.current) {
        clearTimeout(umbrellaTimeoutRef.current);
      }
      if (gameLoopRef.current) {
        clearTimeout(gameLoopRef.current);
      }
      dropY.stopAnimation();
    };
  }, [dropY, loadHighScore, loadTotalCoins, loadShopData]);

  // Mağaza kapandığında oyunu devam ettir (backup)
  useEffect(() => {
    if (!showShop && gameStarted && !gameOver && !isDropFallingRef.current) {
      console.log('🔄 useEffect backup - Shop closed, resuming game...');
      
      const timer: TimerId = setTimeout(() => {
        if (!gameOverRef.current && gameStarted && !showShop && !isDropFallingRef.current) {
          console.log('🌧️ useEffect backup - Force resuming drop, score:', score);
          dropY.setValue(0);
          startDrop(score);
        }
      }, 500); // Daha uzun delay - sadece backup
      
      return () => clearTimeout(timer);
    }
  }, [showShop, gameStarted, gameOver, score, startDrop, dropY]);

  // Mağaza ekranı
  if (showShop) {
    return (
      <View style={styles.container}>
        <View style={styles.shopOverlay}>
          <Text style={styles.gameOverText}>🛒 {t.shopTitle} 🛒</Text>
          <Text style={styles.totalCoins}>💰 {totalCoins} {t.shopCoins}</Text>
          
          <ScrollView style={styles.shopScrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.shopSection}>
              <Text style={styles.shopSectionTitle}>{t.shopCharacters}</Text>
              
              {/* Varsayılan karakter - her zaman sahip olunan */}
              <TouchableOpacity 
                style={[styles.shopItemButton, selectedCharacter === '🙂' && styles.shopItemSelected]} 
                onPress={() => selectItem('character', '🙂')}
              >
                <Text style={styles.shopItemText}>
                  🙂 {t.shopDefaultCharacter} {selectedCharacter === '🙂' ? `✅ ${t.shopSelected}` : ''}
                </Text>
              </TouchableOpacity>
              
              {/* Satın alınabilir karakterler */}
              <TouchableOpacity 
                style={[
                  styles.shopItemButton, 
                  ownedCharacters.includes('🧑') && styles.shopItemOwned,
                  selectedCharacter === '🧑' && styles.shopItemSelected
                ]} 
                onPress={() => ownedCharacters.includes('🧑') ? selectItem('character', '🧑') : purchaseItem('character', '🧑', 500)}
              >
                <Text style={styles.shopItemText}>
                  🧑 {t.shopNewCharacter} - {ownedCharacters.includes('🧑') ? (selectedCharacter === '🧑' ? `✅ ${t.shopSelected}` : t.shopSelect) : '500 💰'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.shopItemButton, 
                  ownedCharacters.includes('👩') && styles.shopItemOwned,
                  selectedCharacter === '👩' && styles.shopItemSelected
                ]} 
                onPress={() => ownedCharacters.includes('👩') ? selectItem('character', '👩') : purchaseItem('character', '👩', 750)}
              >
                <Text style={styles.shopItemText}>
                  👩 {t.shopWomanCharacter} - {ownedCharacters.includes('👩') ? (selectedCharacter === '👩' ? `✅ ${t.shopSelected}` : t.shopSelect) : '750 💰'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.shopItemButton, 
                  ownedCharacters.includes('👨‍💼') && styles.shopItemOwned,
                  selectedCharacter === '👨‍💼' && styles.shopItemSelected
                ]} 
                onPress={() => ownedCharacters.includes('👨‍💼') ? selectItem('character', '👨‍💼') : purchaseItem('character', '👨‍💼', 1000)}
              >
                <Text style={styles.shopItemText}>
                  👨‍💼 {t.shopBusinessman} - {ownedCharacters.includes('👨‍💼') ? (selectedCharacter === '👨‍💼' ? `✅ ${t.shopSelected}` : t.shopSelect) : '1000 💰'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.shopItemButton, 
                  ownedCharacters.includes('👨‍🎓') && styles.shopItemOwned,
                  selectedCharacter === '👨‍🎓' && styles.shopItemSelected
                ]} 
                onPress={() => ownedCharacters.includes('👨‍🎓') ? selectItem('character', '👨‍🎓') : purchaseItem('character', '👨‍🎓', 1500)}
              >
                <Text style={styles.shopItemText}>
                  👨‍🎓 {t.shopStudent} - {ownedCharacters.includes('👨‍🎓') ? (selectedCharacter === '👨‍🎓' ? `✅ ${t.shopSelected}` : t.shopSelect) : '1500 💰'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.shopItemButton, 
                  ownedCharacters.includes('👨‍🚀') && styles.shopItemOwned,
                  selectedCharacter === '👨‍🚀' && styles.shopItemSelected
                ]} 
                onPress={() => ownedCharacters.includes('👨‍🚀') ? selectItem('character', '👨‍🚀') : purchaseItem('character', '👨‍🚀', 2500)}
              >
                <Text style={styles.shopItemText}>
                  👨‍🚀 {t.shopAstronaut} - {ownedCharacters.includes('👨‍🚀') ? (selectedCharacter === '👨‍🚀' ? `✅ ${t.shopSelected}` : t.shopSelect) : '2500 💰'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.shopSection}>
              <Text style={styles.shopSectionTitle}>{t.shopUmbrellas}</Text>
              
              {/* Varsayılan şemsiye - her zaman sahip olunan */}
              <TouchableOpacity 
                style={[styles.shopItemButton, selectedUmbrella === '☂️' && styles.shopItemSelected]} 
                onPress={() => selectItem('umbrella', '☂️')}
              >
                <Text style={styles.shopItemText}>
                  ☂️ {t.shopDefaultUmbrella} {selectedUmbrella === '☂️' ? `✅ ${t.shopSelected}` : ''}
                </Text>
              </TouchableOpacity>
              
              {/* Satın alınabilir şemsiyeler */}
              <TouchableOpacity 
                style={[
                  styles.shopItemButton, 
                  ownedUmbrellas.includes('🌂') && styles.shopItemOwned,
                  selectedUmbrella === '🌂' && styles.shopItemSelected
                ]} 
                onPress={() => ownedUmbrellas.includes('🌂') ? selectItem('umbrella', '🌂') : purchaseItem('umbrella', '🌂', 500)}
              >
                <Text style={styles.shopItemText}>
                  🌂 {t.shopPurpleUmbrella} - {ownedUmbrellas.includes('🌂') ? (selectedUmbrella === '🌂' ? `✅ ${t.shopSelected}` : t.shopSelect) : '500 💰'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.shopItemButton, 
                  ownedUmbrellas.includes('☔') && styles.shopItemOwned,
                  selectedUmbrella === '☔' && styles.shopItemSelected
                ]} 
                onPress={() => ownedUmbrellas.includes('☔') ? selectItem('umbrella', '☔') : purchaseItem('umbrella', '☔', 800)}
              >
                <Text style={styles.shopItemText}>
                  ☔ {t.shopRainUmbrella} - {ownedUmbrellas.includes('☔') ? (selectedUmbrella === '☔' ? `✅ ${t.shopSelected}` : t.shopSelect) : '800 💰'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.shopItemButton, 
                  ownedUmbrellas.includes('🏖️') && styles.shopItemOwned,
                  selectedUmbrella === '🏖️' && styles.shopItemSelected
                ]} 
                onPress={() => ownedUmbrellas.includes('🏖️') ? selectItem('umbrella', '🏖️') : purchaseItem('umbrella', '🏖️', 1200)}
              >
                <Text style={styles.shopItemText}>
                  🏖️ {t.shopBeachUmbrella} - {ownedUmbrellas.includes('🏖️') ? (selectedUmbrella === '🏖️' ? `✅ ${t.shopSelected}` : t.shopSelect) : '1200 💰'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.shopItemButton, 
                  ownedUmbrellas.includes('⛱️') && styles.shopItemOwned,
                  selectedUmbrella === '⛱️' && styles.shopItemSelected
                ]} 
                onPress={() => ownedUmbrellas.includes('⛱️') ? selectItem('umbrella', '⛱️') : purchaseItem('umbrella', '⛱️', 2000)}
              >
                <Text style={styles.shopItemText}>
                  ⛱️ {t.shopSunUmbrella} - {ownedUmbrellas.includes('⛱️') ? (selectedUmbrella === '⛱️' ? `✅ ${t.shopSelected}` : t.shopSelect) : '2000 💰'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <TouchableOpacity 
            style={[styles.shopButton, { backgroundColor: '#FF6B6B', marginTop: 10 }]}
            onPress={() => setShowResetConfirm(true)}
          >
            <Text style={styles.shopButtonText}>🔄 {t.shopResetGame}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.shopButton, { backgroundColor: '#666', marginTop: 10 }]}
            onPress={() => {
              console.log('🛒 Shop closed - gameStarted:', gameStarted, 'gameOver:', gameOver);
              
              // Önce tüm modal'ları kapat
              setShowShop(false);
              setShowResetConfirm(false);
              setShowInsufficientFunds(false);
              
              // Oyunu hemen devam ettir
              if (gameStarted && !gameOver) {
                console.log('🔄 Immediate restart after shop close');
                // Kısa delay ile restart
                setTimeout(() => {
                  if (!gameOverRef.current && gameStarted) {
                    console.log('🌧️ Starting drop immediately after shop close, score:', score);
                    dropY.setValue(0);
                    isDropFallingRef.current = false;
                    startDrop(score);
                  }
                }, 100);
              }
            }}
          >
            <Text style={styles.shopButtonText}>❌ {t.shopClose}</Text>
          </TouchableOpacity>

          {/* Yetersiz para uyarısı - Mağaza içinde */}
          {showInsufficientFunds && (
            <View style={[styles.overlay, { 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              backgroundColor: 'rgba(0,0,0,0.9)',
              zIndex: 1000 
            }]}>
              <Text style={styles.gameOverText}>💸 {t.shopInsufficientFunds} 💸</Text>
              <Text style={styles.startText}>{t.shopInsufficientMessage}</Text>
              <TouchableOpacity 
                style={styles.startGameButton}
                onPress={() => setShowInsufficientFunds(false)}
              >
                <Text style={styles.startGameButtonText}>✅ {t.shopOkButton}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Reset onay - Mağaza içinde */}
          {showResetConfirm && (
            <View style={[styles.overlay, { 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              backgroundColor: 'rgba(0,0,0,0.9)',
              zIndex: 1000 
            }]}>
              <Text style={styles.gameOverText}>⚠️ {t.shopResetGame} ⚠️</Text>
              <Text style={styles.startText}>{t.shopResetConfirm}</Text>
              <View style={{ flexDirection: 'row', gap: 20, marginTop: 20 }}>
                <TouchableOpacity 
                  style={[styles.startGameButton, { backgroundColor: '#FF6B6B' }]}
                  onPress={() => {
                    resetGameCompletely();
                  }}
                >
                  <Text style={styles.startGameButtonText}>✅ {t.shopYesButton}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.startGameButton, { backgroundColor: '#666' }]}
                  onPress={() => {
                    setShowResetConfirm(false);
                    setShowInsufficientFunds(false); // Diğer modal'ları da kapat
                  }}
                >
                  <Text style={styles.startGameButtonText}>❌ {t.shopNoButton}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <View style={styles.container}>
        {/* Bulutlar */}
        <Text style={[styles.cloud, { left: 50, top: 100 }]}>☁️</Text>
        <Text style={[styles.cloud, { left: width - 100, top: 150 }]}>☁️</Text>
        <Text style={[styles.cloud, { left: width/2 - 20, top: 80 }]}>☁️</Text>
        <Text style={[styles.cloud, { left: 20, top: 200 }]}>☁️</Text>
        <Text style={[styles.cloud, { left: width - 60, top: 250 }]}>☁️</Text>

        {/* Yağmur damlası - türüne göre renk */}
        {gameStarted && (
          <Animated.View style={[
            styles.drop, 
            { 
              top: dropY,
              backgroundColor: dropType === 'bonus' ? '#FFD700' : dropType === 'danger' ? '#FF4444' : '#00BFFF'
            }
          ]} />
        )}

        {/* Anlık Skor - Üst ortada */}
        {gameStarted && !gameOver && (
          <View style={styles.currentScoreContainer}>
            <Text style={styles.currentScore}>{t.gameScore}: {score}</Text>
          </View>
        )}

        {/* Damla türü göstergesi - Daha aşağıda */}
        {gameStarted && !gameOver && (
          <View style={styles.dropIndicator}>
            <Text style={styles.dropIndicatorText}>
              {dropType === 'normal' && `💧 ${t.gameNormal} (+1)`}
              {dropType === 'bonus' && `⭐ ${t.gameBonus} (+3)`}
              {dropType === 'danger' && `⚡ ${t.gameDanger} (+5 ${t.gameRisk})`}
            </Text>
          </View>
        )}

        {/* Karakter - şemsiye üstte durur */}
        <View style={styles.character}>
          <Text style={styles.person}>{selectedCharacter}</Text>
          {umbrellaOpen && (
            <Text style={styles.umbrella}>{selectedUmbrella}</Text>
          )}
        </View>

        {/* Mağaza ve Yüksek Skor - Sağ alt köşe */}
        <View style={styles.scoreContainer}>
          <Text style={styles.highScoreText}>{t.gameBest}: {highScore}</Text>
          <Text style={styles.totalCoins}>💰 {totalCoins}</Text>
          <TouchableOpacity style={styles.shopButton} onPress={() => {
            console.log('🛒 Opening shop - pausing game');
            
            // Oyunu durdur
            if (gameLoopRef.current) {
              clearTimeout(gameLoopRef.current);
              gameLoopRef.current = null;
            }
            dropY.stopAnimation();
            isDropFallingRef.current = false;
            
            setShowShop(true);
          }}>
            <Text style={styles.shopButtonText}>🛒</Text>
          </TouchableOpacity>
        </View>

        {/* Start screen */}
        {!gameStarted && !gameOver && (
          <View style={styles.overlay}>
            <Text style={styles.startText}>
              ☂️ {t.gameTitle} ☔{'\n\n'}
              {t.gameDropTypes}{'\n\n'}
              {t.gameInstructions}
            </Text>
            <TouchableOpacity 
              style={styles.startGameButton} 
              onPress={() => {
                console.log('🎮 Start Game button pressed');
                console.log('🎮 Before: gameStarted:', gameStarted, 'gameOver:', gameOver);
                setGameStarted(true);
                console.log('🎮 Calling startDrop(0)...');
                // Clear any existing refs
                isDropFallingRef.current = false;
                gameOverRef.current = false;
                startDrop(0);
                console.log('🎮 startDrop(0) called');
              }}
            >
              <Text style={styles.startGameButtonText}>🎮 {t.gameStart}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Oyun bitti mesajı */}
        {gameOver && (
          <View style={styles.overlay}>
            <Text style={styles.gameOverText}>
              ☔ {t.gameOver} ☔{'\n\n'}{t.gameScore}: {score}{'\n'}{t.gameBest}: {highScore}{'\n\n'}{t.gameRestart}
            </Text>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87ceeb',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  drop: {
    position: 'absolute',
    width: 25,
    height: 35,
    backgroundColor: '#00BFFF', // Daha parlak mavi
    borderRadius: 15,
    top: 0,
    left: width / 2 - 12,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  character: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
    justifyContent: 'center',
    width: 80, // Genişlik ver ki şemsiye taşmasın
  },
  umbrella: {
    fontSize: 60, // Daha büyük şemsiye
    position: 'absolute',
    top: -50, // Karakterin üstünde
    alignSelf: 'center', // Ortalansın
  },
  person: {
    fontSize: 50, // Daha büyük karakter
  },
  currentScoreContainer: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  currentScore: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scoreContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    borderRadius: 10,
  },
  score: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  highScoreText: {
    fontSize: 14,
    color: '#FFD700', // Altın rengi
    fontWeight: 'bold',
    marginTop: 2,
  },
  cloud: {
    position: 'absolute',
    fontSize: 40,
    opacity: 0.8,
  },
  dropIndicator: {
    position: 'absolute',
    top: 120, // Daha aşağıda olsun ki skor ile çakışmasın
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  dropIndicatorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  overlay: {
    position: 'absolute',
    top: height / 2 - 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  startText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  startGameButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  startGameButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gameOverText: {
    color: '#fff',
    fontSize: 22,
    textAlign: 'center',
  },
  totalCoins: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 2,
  },
  shopButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    minWidth: 40,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  shopItemButton: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#555',
  },
  shopItemText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  shopOverlay: {
    position: 'absolute',
    top: 50,
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  shopScrollView: {
    flex: 1,
    width: '100%',
    marginTop: 20,
  },
  shopSection: {
    marginBottom: 20,
    width: '100%',
  },
  shopSectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  shopItemOwned: {
    backgroundColor: '#2E7D32',
    borderColor: '#4CAF50',
    opacity: 0.7,
  },
  shopItemSelected: {
    backgroundColor: '#1976D2',
    borderColor: '#2196F3',
    borderWidth: 2,
  },
});
