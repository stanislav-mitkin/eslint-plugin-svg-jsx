function getPropIdentifier(node, context) {
  const sourceCode = context.sourceCode

  const defaultCase = (propNode) => {
    if (!propNode) return ''

    // Для JSXAttribute нам нужно получить имя из node.name
    if (propNode.type === 'JSXAttribute') {
      return propNode.name.name
    }

    // Для остальных случаев
    if (propNode.name) {
      return propNode.name.name
    }

    if (propNode.object && propNode.property) {
      return `${sourceCode.getText(propNode.object)}.${propNode.property.name}`
    }

    return ''
  }

  if (!node) return ''

  switch (node.type) {
    case 'JSXSpreadAttribute':
      return sourceCode.getText(node.argument)
    case 'JSXIdentifier':
      return node.name
    case 'JSXMemberExpression':
      return `${getPropIdentifier(node.object, context)}.${node.property.name}`
    case 'JSXAttribute':
      if (node.name?.namespace?.name && node.name?.name?.name) {
        return `${node.name.namespace.name}:${node.name.name.name}`
      }
      return defaultCase(node)
    default:
      return defaultCase(node)
  }
}

function getPropName(attr, context) {
  if (typeof attr === 'string') {
    return attr
  }
  return getPropIdentifier(attr, context)
}

function getJSXTagName(jsxNode) {
  if (!jsxNode) return ''

  switch (jsxNode.type) {
    case 'JSXIdentifier':
      return jsxNode.name
    default:
      return jsxNode.name?.name || ''
  }
}

function isCustomHTMLElement(node) {
  const tagName = getJSXTagName(node)
  return tagName ? tagName.includes('-') : false
}

function isSpreadAttribute(node) {
  return node && node.type === 'JSXSpreadAttribute'
}

module.exports = {
  isCustomHTMLElement,
  getJSXTagName,
  getPropName,
  getPropIdentifier,
  isSpreadAttribute,
}
