export default function (key, pref) {
  if (pref === 'asc') {
    return (a, b) => (a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : 0)
  }
  return (a, b) => (a[key] < b[key] ? 1 : b[key] < a[key] ? -1 : 0)
}
