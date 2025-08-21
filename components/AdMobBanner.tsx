import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// AdMob banner reklam bileşeni
const AdMobBanner = () => {
  // Gerçek reklam ID'nizi kullanın (test için TestIds.BANNER kullanabilirsiniz)
  const adUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-2239637684721708/4961941154';

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.BANNER} // Daha küçük boyut (320x50)
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          console.log('Banner ad loaded');
        }}
        onAdFailedToLoad={(error) => {
          console.log('Banner ad failed to load:', error);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 2,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
});

export default AdMobBanner;
