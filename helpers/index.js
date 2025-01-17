/**
 * Extracts property names from an object string representation
 * @param {string} spreadObjectString - String representation of an object
 * @returns {string[]} Array of property names
 */
function getPropsFromObjectString(spreadObjectString) {
  function normalizeProp(propName) {
    return propName.replaceAll("'", '')
  }

  const props = []
  let currentProp = ''
  let keyWithValue = false

  ;[...spreadObjectString].forEach((c) => {
    if (c === ',') {
      props.push(normalizeProp(currentProp))
      currentProp = ''
      keyWithValue = false
      return
    } else if (
      c === '{' ||
      c === '}' ||
      c === ' ' ||
      c === '\n' ||
      keyWithValue
    ) {
      return
    } else if (c === ':') {
      keyWithValue = true
      return
    }

    currentProp += c
  })

  // Add the last prop if it exists
  if (currentProp && !keyWithValue) {
    props.push(normalizeProp(currentProp))
  }

  return props
}

/**
 * Converts a delimited string to camelCase
 * @param {string} str - The string to convert
 * @param {string} charDelimiter - The delimiter character
 * @returns {string} The camelCased string
 */
function getCamelCasedString(str, charDelimiter) {
  let newPropName = str
  while (newPropName.includes(charDelimiter)) {
    const indexOfDash = newPropName.indexOf(charDelimiter)
    const charAfterDash = newPropName.charAt(indexOfDash + 1)

    newPropName = `${newPropName.substring(
      0,
      indexOfDash
    )}${charAfterDash.toUpperCase()}${newPropName.substring(
      indexOfDash + 2,
      newPropName.length
    )}`
  }
  return newPropName
}

/**
 * Converts an object to a string representation
 * @param {Object} obj - The object to stringify
 * @returns {string} String representation of the object
 */
function stringify(obj) {
  let stringified = ''
  Object.entries(obj).forEach(([key, val]) => {
    stringified += ` ${key}: '${val}',`
  })

  // remove trailing comma, wrap in object literal. spacing is important.
  return `{${stringified.substring(0, stringified.length - 1)} }`
}

/**
 * Converts a CSS style string to a React style object string
 * Examples:
 * "mask-type:alpha" -> { maskType: 'alpha' }
 * "mask-type:alpha;mask-repeat:no-repeat" -> { maskType: 'alpha', maskRepeat: 'no-repeat' }
 * @param {string} value - The CSS style string
 * @returns {string} React style object string
 */
function convertStringStyleValue(value) {
  if (!value) return value

  const styleRules = value.split(';').filter(Boolean) // Filter out empty rules
  const styleObject = styleRules.reduce((acc, rule) => {
    const [key, val] = rule.split(':')
    if (!key || !val) return acc

    const camelCasedKey = getCamelCasedString(key.trim(), '-')
    return { ...acc, [camelCasedKey]: val.trim() }
  }, {})

  return stringify(styleObject)
}

module.exports = {
  getPropsFromObjectString,
  getCamelCasedString,
  convertStringStyleValue,
}
