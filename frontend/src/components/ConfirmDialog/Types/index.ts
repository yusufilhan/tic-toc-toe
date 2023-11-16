import {OverridableStringUnion} from '@mui/types'
import {ButtonPropsVariantOverrides} from "@mui/material";
import {ReactNode} from "react";

export interface IConfirmButtons {
  label: string
  callBack?: () => void
  icon?: string
  variant?: OverridableStringUnion<'text' | 'outlined' | 'contained', ButtonPropsVariantOverrides>
  color?: OverridableStringUnion< 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'warning', ButtonPropsVariantOverrides >
}

export interface IConfirmDialog {
  title: string
  content: ReactNode
  showCloseButton: boolean
  buttons: IConfirmButtons[]
}