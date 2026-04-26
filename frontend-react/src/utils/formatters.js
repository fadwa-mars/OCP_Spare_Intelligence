// src/utils/formatters.js
export const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR')
}

export const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('fr-FR')
}

export const formatPrice = (price) => {
  if (!price && price !== 0) return '-'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

export const formatQuantity = (quantity) => {
  if (!quantity && quantity !== 0) return '-'
  return new Intl.NumberFormat('fr-FR').format(quantity)
}

export const formatPercentage = (value) => {
  if (!value && value !== 0) return '-'
  return `${value}%`
}