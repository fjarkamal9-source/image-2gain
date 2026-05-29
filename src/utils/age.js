export function calcAge(birthDate) {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}

export function isAtLeast18(day, month, year) {
  const d = new Date(Number(year), Number(month) - 1, Number(day));
  if (Number.isNaN(d.getTime())) return false;
  return calcAge(d) >= 18;
}

export function parseBirthDate(day, month, year) {
  return new Date(Number(year), Number(month) - 1, Number(day));
}
