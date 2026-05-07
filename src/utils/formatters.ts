const formatDate = (date: Date): string =>
  new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);

const formatStatus = (status: string): string => {
  const normalized = status.trim().toLowerCase();
  if (!normalized) {
    return '';
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const formatPhoneNumber = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  if (!digits) {
    return phone;
  }

  if (digits.startsWith('33') && digits.length === 11) {
    const local = `0${digits.slice(2)}`;
    return local.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
  }

  return phone;
};

export { formatDate, formatStatus, formatPhoneNumber };
