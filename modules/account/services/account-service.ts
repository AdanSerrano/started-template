import { db } from '@/lib/db'
import { addressRepository } from '../repositories/address-repository'
import { profileRepository } from '../repositories/profile-repository'
import type { ProfileUpdateData, AddressInsert } from '../types'

// Profile
export async function getProfile(userId: string) {
  return profileRepository.findById(userId)
}

export async function updateProfile(userId: string, data: ProfileUpdateData) {
  return profileRepository.update(userId, data)
}

// Addresses
export async function getAddresses(userId: string) {
  return addressRepository.findByUserId(userId)
}

export async function getAddress(id: string, userId: string) {
  return addressRepository.findById(id, userId)
}

export async function createAddress(data: AddressInsert) {
  if (data.isDefault) {
    return db.transaction(async (tx) => {
      const address = await addressRepository.create(data, tx)
      if (address) {
        await addressRepository.setDefault(address.id, data.userId, tx)
      }
      return address
    })
  }
  return addressRepository.create(data)
}

export async function updateAddress(
  id: string,
  userId: string,
  data: Partial<Omit<AddressInsert, 'id' | 'userId'>>,
) {
  if (data.isDefault) {
    return db.transaction(async (tx) => {
      await addressRepository.setDefault(id, userId, tx)
      return addressRepository.update(id, userId, data, tx)
    })
  }
  return addressRepository.update(id, userId, data)
}

export async function deleteAddress(id: string, userId: string) {
  return addressRepository.remove(id, userId)
}

export async function setDefaultAddress(id: string, userId: string) {
  return addressRepository.setDefault(id, userId)
}
