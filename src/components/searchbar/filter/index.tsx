import { Role } from '@/services/db/users'
import { SlidersHorizontal } from 'lucide-react-native'
import { useState } from 'react'
import { Modal, Pressable, Text, View } from 'react-native'

type FilterProps = {
  onOpen: (open: boolean) => any
}

export default function Filter({ onOpen }: FilterProps) {
  const [open, setOpen] = useState(false)
  return (
    <View className='relative'>
      <Pressable onPress={() => {
        onOpen(!open)
        setOpen(!open)
      }}>
        <SlidersHorizontal size={20} color='black' />
      </Pressable>
    </View>
  )
}
