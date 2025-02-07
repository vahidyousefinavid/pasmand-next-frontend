import { clsx, type ClassValue } from 'clsx';
import moment from 'jalali-moment';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDateToJalali = (date: string) => {
  return moment(date).locale('fa').format('jYYYY/jMM/jDD');
};
