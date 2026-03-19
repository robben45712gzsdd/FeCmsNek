
export function formatAmount(value) {
  if (value == null || isNaN(value)) return "";
  return new Intl.NumberFormat().format(value);
}

export function formatBalance(value) {
  if (value == null || isNaN(value)) return "";
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(dateStr, locale = "vi-VN") {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short", // hoặc '2-digit' nếu muốn kiểu 10 thay vì Oct
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (e) {
    console.warn("Invalid date:", dateStr, e);
    return dateStr;
  }
}


export function amountClass(val) {
  const num = Number(val);
  if (isNaN(num)) return "";
  return num > 0 ? "positive" : "negative";
}
