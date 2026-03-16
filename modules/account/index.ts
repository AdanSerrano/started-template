// Services
export {
  getProfile,
  updateProfile,
  getAddresses,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from './services/account-service'

// Components
export { AccountSidebar } from './components/account-sidebar.client'
export { AddressCard } from './components/address-card.client'
export { AddressForm } from './components/address-form.client'
export { AddressList } from './components/address-list.client'
export { AddressesPage } from './components/addresses-page'
export { ChangePasswordForm } from './components/change-password-form.client'
export { ProfileForm } from './components/profile-form.client'
export { ProfilePage } from './components/profile-page'

// Validations
export {
  createProfileUpdateSchema,
  createAddressFormSchema,
  createChangePasswordSchema,
} from './validations'
export type {
  ProfileUpdateInput,
  AddressFormInput,
  ChangePasswordInput,
} from './validations'

// Types
export type { Address, AddressInsert, ProfileUpdateData } from './types'
