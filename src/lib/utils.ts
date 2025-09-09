import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function validatePassword(password: string): { isValid: boolean; message: string } {
  if (password.length < 8) {
    return { isValid: false, message: "비밀번호는 8자 이상이어야 합니다." };
  }
  
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  if (!hasLowercase || !hasNumber) {
    return { isValid: false, message: "비밀번호는 영문소문자, 숫자를 포함해야 합니다." };
  }
  
  return { isValid: true, message: "" };
}

export function getPasswordCriteria(password: string) {
  return {
    hasMinLength: password.length >= 8,
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    isValid: password.length >= 8 && /[a-z]/.test(password) && /[0-9]/.test(password)
  };
}