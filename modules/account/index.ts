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
export { AccountSidebar } from './components/account-sidebar'
export { AddressCard } from './components/address-card'
export { AddressForm } from './components/address-form'
export { AddressList } from './components/address-list'
export { AddressesPage } from './components/addresses-page'
export { ChangePasswordForm } from './components/change-password-form'
export { ProfileForm } from './components/profile-form'
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
