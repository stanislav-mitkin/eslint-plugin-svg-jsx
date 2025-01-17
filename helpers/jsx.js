function isSpreadAttribute(node) {
  return node.type === 'JSXSpreadAttribute'
}

function getPropIdentifier(node, sourceCode) {
  const defaultCase = (node) => {
    return node.name
      ? node.name.name
      : `${sourceCode.getText(node.object)}.${node.property.name}` // needed for typescript-eslint parser
  }

  switch (node.type) {
    case 'JSXSpreadAttribute':
      return sourceCode.getText(node.argument)
    case 'JSXIdentifier':
      return node.name
    case 'JSXMemberExpression':
      return `${getPropIdentifier(node.object, sourceCode)}.${node.property.name}`
    case 'JSXAttribute':
      if (node?.name?.namespace?.name && node?.name?.name?.name) {
        return `${node?.name?.namespace?.name}:${node?.name?.name?.name}`
      } else if (node?.name?.name === 'style') {
        return defaultCase(node)
      } else {
        return defaultCase(node)
      }
    default:
      return defaultCase(node)
  }
}

function getPropName(attr, sourceCode) {
  if (typeof attr === 'string') {
    return attr
  } else {
    return getPropIdentifier(attr, sourceCode)
  }
}

function getJSXTagName(jsxNode) {
  switch (jsxNode.type) {
    case 'JSXIdentifier':
      return jsxNode.name
    default:
      return jsxNode.name.name
  }
}

function isCustomHTMLElement(node) {
  return getJSXTagName(node)?.includes('-')
}

module.exports = {
  isCustomHTMLElement,
  getJSXTagName,
  getPropName,
  getPropIdentifier,
  isSpreadAttribute,
}
