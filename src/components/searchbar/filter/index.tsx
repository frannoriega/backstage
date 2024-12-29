import { Role } from '@/services/db/users'
import { SlidersHorizontal } from 'lucide-react-native'
import { useState } from 'react'
import { Modal, Pressable, Text, View } from 'react-native'

type FilterProps = {
  onOpen: () => any
}

export default function Filter({ onOpen }: FilterProps) {
  return (
    <View className='relative'>
      <Pressable onPress={onOpen}>
        <SlidersHorizontal size={20} color='black' />
      </Pressable>
    </View>
  )
}
