
function getSource (data, group = null) {
  const url = data.getAttribute('xmlUrl')
  const name = data.getAttribute('text') || data.getAttribute('name')
  if (url) {
    return {
      feedType: 'rss',
      feedUrl: url,
      title: name,
      category: group
    }
  } else {
    return null
  }
}

export function parseOPML (data) {
  const domParser = new DOMParser()
  const doc = domParser.parseFromString(data, 'text/xml').getElementsByTagName('body')
  const parseError = doc[0].getElementsByTagName('parsererror')
  const sources = []
  if (parseError.length === 0) {
    for (const el of doc[0].children) {
      if (el.getAttribute('type') === 'rss') {
        sources.push(getSource(el))
      } else if (el.hasAttribute('text') ||
      el.hasAttribute('title')) {
        const groupName = el.getAttribute('text') || el.getAttribute('title')
        for (const child of el.children) {
          sources.push(getSource(child, groupName))
        }
      }
    }
  }
  return sources
}
