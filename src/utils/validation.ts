/**
 * Validation & Formatting utilities for Yala Football Clinic
 */

export function cleanDigits(val: string | undefined | null): string {
  if (!val) return '';
  return String(val).replace(/\D/g, '');
}

/**
 * Validates whether the given phone string has exactly 10 digits and begins with 0.
 */
export function isValid10DigitPhone(phone: string | undefined | null): boolean {
  if (!phone) return false;
  const digits = cleanDigits(phone);
  return digits.length === 10 && digits.startsWith('0');
}

/**
 * Formats a 10-digit phone number into "0XX-XXX-XXXX"
 */
export function formatPhone10(phone: string | undefined | null): string {
  const digits = cleanDigits(phone);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

/**
 * Validates whether Thai National ID card has 13 digits
 */
export function isValidThaiIdCard(idCard: string | undefined | null): boolean {
  if (!idCard) return false;
  const digits = cleanDigits(idCard);
  return digits.length === 13;
}

/**
 * Formats a 13-digit Thai ID card into "X-XXXX-XXXXX-XX-X"
 */
export function formatThaiIdCard(idCard: string | undefined | null): string {
  const digits = cleanDigits(idCard);
  if (digits.length <= 1) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 1)}-${digits.slice(1)}`;
  if (digits.length <= 10) return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10)}`;
  return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10, 12)}-${digits.slice(12, 13)}`;
}

/**
 * Standard Jersey Size Definitions with Chest (cm) and Shirt Length (cm)
 */
export interface JerseySizeSpec {
  size: string;
  nameTh: string;
  chestCm: number;
  chestInches: number;
  lengthCm: number;
  lengthInches: number;
  recommendation: string;
}

export const STANDARD_JERSEY_SIZES: JerseySizeSpec[] = [
  { size: 'JS', nameTh: 'JS (เด็กเล็ก 5-7 ขวบ)', chestCm: 66, chestInches: 26, lengthCm: 46, lengthInches: 18, recommendation: 'ส่วนสูง 110-125 ซม.' },
  { size: 'JM', nameTh: 'JM (เด็กประถม 8-10 ขวบ)', chestCm: 72, chestInches: 28, lengthCm: 51, lengthInches: 20, recommendation: 'ส่วนสูง 125-138 ซม.' },
  { size: 'JL', nameTh: 'JL (เด็กโต 11-13 ขวบ)', chestCm: 78, chestInches: 31, lengthCm: 56, lengthInches: 22, recommendation: 'ส่วนสูง 138-150 ซม.' },
  { size: 'JXL', nameTh: 'JXL (วัยรุ่น 13-15 ขวบ)', chestCm: 84, chestInches: 33, lengthCm: 61, lengthInches: 24, recommendation: 'ส่วนสูง 150-160 ซม.' },
  { size: 'S', nameTh: 'S (ผู้ใหญ่รอบอก 36")', chestCm: 92, chestInches: 36, lengthCm: 66, lengthInches: 26, recommendation: 'ส่วนสูง 160-168 ซม.' },
  { size: 'M', nameTh: 'M (ผู้ใหญ่รอบอก 38")', chestCm: 98, chestInches: 38, lengthCm: 70, lengthInches: 27.5, recommendation: 'ส่วนสูง 168-175 ซม.' },
  { size: 'L', nameTh: 'L (ผู้ใหญ่รอบอก 41")', chestCm: 104, chestInches: 41, lengthCm: 74, lengthInches: 29, recommendation: 'ส่วนสูง 175-182 ซม.' },
  { size: 'XL', nameTh: 'XL (ผู้ใหญ่รอบอก 43")', chestCm: 110, chestInches: 43, lengthCm: 78, lengthInches: 30.5, recommendation: 'ส่วนสูง 180+ ซม.' },
  { size: '2XL', nameTh: '2XL (ผู้ใหญ่รอบอก 45")', chestCm: 116, chestInches: 45, lengthCm: 82, lengthInches: 32, recommendation: 'ไซส์พิเศษ' }
];
