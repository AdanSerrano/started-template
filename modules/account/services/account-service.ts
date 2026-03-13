import * as profileRepo from '../repositories/profile-repository'
import * as addressRepo from '../repositories/address-repository'
import type { ProfileUpdateData, AddressInsert } from '../types'

// Profile
export async function getProfile(userId: string) {
  return profileRepo.findById(userId)
}

export async function updateProfile(userId: string, data: ProfileUpdateData) {
  return profileRepo.update(userId, data)
}

// Addresses
export async function getAddresses(userId: string) {
  return addressRepo.findByUserId(userId)
}

export async function getAddress(id: string, userId: string) {
  return addressRepo.findById(id, userId)
}

export async function createAddress(data: AddressInsert) {
  if (data.isDefault) {
    await addressRepo.setDefault('', data.userId)
  }
  return addressRepo.create(data)
}

export async function updateAddress(
  id: string,
  userId: string,
  data: Partial<Omit<AddressInsert, 'id' | 'userId'>>,
) {
  if (data.isDefault) {
    await addressRepo.setDefault(id, userId)
  }
  return addressRepo.update(id, userId, data)
}

export async function deleteAddress(id: string, userId: string) {
  return addressRepo.remove(id, userId)
}

export async function setDefaultAddress(id: string, userId: string) {
  return addressRepo.setDefault(id, userId)
}
