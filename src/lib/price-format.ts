// 가격 포맷팅 유틸리티 함수들

/**
 * 숫자에 천원 단위 콤마를 추가하는 함수
 * @param value - 포맷할 숫자 또는 문자열
 * @returns 콤마가 추가된 문자열
 */
export const formatPriceWithComma = (value: string | number): string => {
  if (!value) return '';
  
  // 숫자가 아닌 문자 제거 (콤마, 공백 등)
  const numbers = String(value).replace(/[^\d]/g, '');
  
  if (!numbers) return '';
  
  // 천원 단위로 콤마 추가
  return Number(numbers).toLocaleString();
};

/**
 * 콤마가 포함된 가격 문자열에서 순수 숫자만 추출
 * @param formattedPrice - 콤마가 포함된 가격 문자열
 * @returns 순수 숫자 문자열
 */
export const extractNumbers = (formattedPrice: string): string => {
  return formattedPrice.replace(/[^\d]/g, '');
};

/**
 * 가격 입력 필드용 onChange 핸들러 생성기
 * @param setter - 상태 업데이트 함수
 * @param field - 업데이트할 필드명
 * @returns onChange 핸들러 함수
 */
export const createPriceChangeHandler = (
  setter: (field: string, value: string) => void,
  field: string
) => {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPriceWithComma(e.target.value);
    setter(field, formatted);
  };
};