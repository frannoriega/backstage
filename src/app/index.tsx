import React, { useEffect, useState } from 'react';
import { GoogleSignin, User, statusCodes } from '@react-native-google-signin/google-signin';
import { Image } from 'expo-image'
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { cssInterop, verifyInstallation } from 'nativewind'
import crypto from 'react-native-quick-crypto'
import { Buffer } from 'buffer'

cssInterop(Image, { className: "style" });

export default function Index() {
  verifyInstallation();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.WEB_CLIENT_ID,
      iosClientId: process.env.IOS_CLIENT_ID,
      offlineAccess: false,
    });
  }, []);

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      // validate user info
      router.replace(`/security/(tabs)`)
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the sign-in process');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Sign in is in progress');
      } else {
        console.error(error);
      }
    }
  };

  function decrypt() {
    const key = `
-----BEGIN PRIVATE KEY-----
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
hkx6eQ7KDLJNMLOpwzY5XxbwByHI
-----END PRIVATE KEY-----
  `
    const pubKey = `
-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAjz08H4/lHa15oXntISr7
qGtzWzpaJZEOUmkDh7X/+q5a5qH7tmCXiIl3R7iKrgs9UOTlznKpYT8GcSgWZQH3
C5cOCoUijnvgP2MoN/lmQA7Kof7591rdpxOYwCqJELywGK3RGmguEi52NbIgD0lA
xVw4c6F3pOtRvxhzn/p6YmR9bKqM6hculn1VzpYr8DuFdW4Tw80NslJDEnZv3CIY
Dc9M7bd1xwfBaPE2tJAT+aYymcVCCP1d6CzYRfhmhuIeumeLtg3X071HoAa6q+6z
ssyJAwZjke39h9dMsnFnhpTMvDADPO4CGGnEC3e3gLblKbTYDz1OFtGnZ5gH0USa
3qGezNZRTzHhtn9tcXBPWySPPMSdGBX/FmO+ZQ7oPMmBJQjJZGhOLEcJg4IdldCq
/n2IUHgfAgMtzTJoPmO4oEoO5isFybwmEH4UAePcFHNEqgAzH79uHc90sSjnBPOI
S2IF4BcdMuDECiBMQ5tVkGYjaUb4/C3Fk+dtNJo1bgr2T9Y+YUw0kMlgu6nGkSYx
+8RrwsnEvGmInTIMvuucP8pdd6Ea9toHvJHcy0e++I49g1f8qQPKc+t1W9j5fYOf
YEnMVrT+yXWdnjH0WDOanzvSPc13HBDnCbhWfVhYnCwD3yiymWS0yWS/SWnNLuju
XAQH9Md7gIR105uK6gwA3QECAwEAAQ==
-----END PUBLIC KEY-----
`
    const e = crypto.publicEncrypt(
      {
        key: pubKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
      },
      'Banana'
    )
    const encrypted = `CtY9njwL/uqK5uhCuYgpu4IAnwS0TWbi11ub/An8XMHrrC1x5kUWpmK8Xq6ImYMZp6LDZuXUZbkhwY1KdWNmRka+F6+kZDPfaiFYWI2KIYmlupmQBbzvX488iMShqLab7YY4qVozFQMgsouOA+txJjLw8lHbblejAEq/xiPe5Qvgggq35tc0zlSE/60m3/E7cdatZ1H884y5wojGgDqmb98WxGNGyl8+Srt1Aucd/4VDlfPhUlJvCgrZNinnkcUxqvz5zazzErhcDkBAmmEq7wD/SGn8sbKFuubNQPkNbr12DmjNZH4c+fgU5wl+hY/FA21wVSIcOQBu40ytpNBZjnj4WPRgkHBBzJm89omGbgLHUelxFZsJgf944ygYDhHl4gQkQ3iOAXidpKQOrBYWd0gEdvDeiJinekoNT1UBPhZKFV52Ko1gqepPP2ZHBxE04TykKVfiVHHlR16V0zWa2dmxvhvFEVsqtQqcU1QbZtJZxoj8taiaaEJ3PeieCwYuSIR3wJTKgjMr0Q+oDBNhwuL9ZpBwa2G9c7g3OdAFqhk8vZ9tgJUBum7ga692M4/dXEJbpbGRx7m+gyv9tZ5pW7TgeeDpMRMk9/zeHFq+KaOrhMgxsZEnMINHXylA875t7l5u9HIdx9Z/CE4GL4sTanI+exRSuMmCKSR3Hg/XVX0=`
    const data = Buffer.from(encrypted, 'base64')
    const decrypted = crypto.privateDecrypt(
      {
        key: key,
        // In order to decrypt the data, we need to specify the
        // same hashing function and padding scheme that we used to
        // encrypt the data in the previous step
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
      },
      data
    )
    console.log(decrypted.toString('utf8'))

  }

  return (
    <View className='flex-1 flex-col gap-4 items-center w-full h-full'>
      <View className='py-8 flex-initial flex-col gap-4 items-center w-full h-min'>
        <Image source={require('../../assets/images/logo-fiesta.png')} className='w-4/5 h-2/5' contentFit='contain' />
        <Text className='text-white text-6xl'>Backstage</Text>
      </View>
      <View>
        <Pressable className="items-center w-full h-fit bg-red-200" onPress={signIn}>
          <Text>Inicia sesión con Google</Text>
        </Pressable>
      </View>
    </View>
  );
};

