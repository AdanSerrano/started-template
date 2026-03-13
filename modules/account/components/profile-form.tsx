'use client'

import { useCallback, useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { toast } from 'sonner'
import { Camera, User } from 'lucide-react'
import { Form } from '@/components/ui/form'
import { FormTextField } from '@/components/forms/form-text-field'
import { FormSubmitButton } from '@/components/forms/form-submit-button'
import { Badge } from '@/components/ui/badge'
import { profileUpdateSchema, type ProfileUpdateInput } from '../validations'
import { updateProfileAction } from '../actions/account-actions'
import { uploadAvatar } from '../utils/upload-avatar'

interface ProfileFormProps {
  defaultValues: {
    name: string
    phone: string
  }
  userId: string
  currentImage?: string | null | undefined
}

export function ProfileForm({
  defaultValues,
  userId,
  currentImage,
}: ProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const t = useTranslations('account.profile')
  const ti = useTranslations('admin.images')
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const form = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    mode: 'onTouched',
    defaultValues,
  })

  const previewUrl = pendingFile
    ? URL.createObjectURL(pendingFile)
    : currentImage

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file?.type.startsWith('image/')) setPendingFile(file)
      if (inputRef.current) inputRef.current.value = ''
    },
    [],
  )

  function onSubmit(values: ProfileUpdateInput) {
    startTransition(async () => {
      // Subir avatar si hay pendiente
      if (pendingFile) {
        const avatarUrl = await uploadAvatar(userId, pendingFile)
        if (!avatarUrl) {
          toast.error(ti('errorAdding'))
          return
        }
        setPendingFile(null)
      }

      const result = await updateProfileAction(values)
      if (result.success) {
        toast.success(t('updated'))
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex items-center gap-4">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="group border-muted-foreground/25 hover:border-primary/50 relative size-20 shrink-0 overflow-hidden rounded-full border-2 border-dashed transition-colors"
          >
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Avatar"
                fill
                className="object-cover"
                unoptimized={!!pendingFile}
              />
            ) : (
              <div className="bg-muted flex size-full items-center justify-center">
                <User className="text-muted-foreground size-8" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="size-5 text-white" />
            </div>
          </button>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">{t('avatarLabel')}</p>
            <p className="text-muted-foreground text-xs">{t('avatarHint')}</p>
            {pendingFile && (
              <Badge variant="secondary" className="w-fit text-xs">
                {ti('pending')}
              </Badge>
            )}
          </div>
        </div>

        <FormTextField
          control={form.control}
          name="name"
          label={t('nameLabel')}
          placeholder={t('namePlaceholder')}
        />
        <FormTextField
          control={form.control}
          name="phone"
          label={t('phoneLabel')}
          placeholder={t('phonePlaceholder')}
          type="tel"
        />
        <FormSubmitButton isPending={isPending} text={t('saveBtn')} />
      </form>
    </Form>
  )
}
