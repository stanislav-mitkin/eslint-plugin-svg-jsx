/**
 * @fileoverview Rule to enforce object style properties in React JSX
 */

const { getPropName } = require('../helpers/jsx')
const { convertStringStyleValue } = require('../helpers')

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce object syntax for style props in JSX',
      recommended: true,
      url: 'https://github.com/fostimus/eslint-plugin-svg-jsx/blob/main/docs/rules/no-string-style.md',
    },
    messages: {
      stringStyleValue:
        'JSX prop is invalid; the value of the style prop is a string. Fixable.',
    },
    fixable: 'code',
    schema: [], // Правило не принимает опций
  },

  create(context) {
    const sourceCode = context.sourceCode

    /**
     * Проверяет и исправляет строковые значения style props
     * @param {ASTNode} attr - Атрибут JSX для проверки
     */
    function validateStyleProp(attr) {
      const propName = getPropName(attr, context)
      const fixableNode = attr.value

      // Проверяем, что это style prop и значение является строкой
      if (
        propName === 'style' &&
        fixableNode &&
        typeof fixableNode.value === 'string'
      ) {
        context.report({
          node: attr, // Более точное указание проблемного узла
          messageId: 'stringStyleValue',
          data: {
            propName,
          },
          fix(fixer) {
            if (!fixer?.replaceText) return null

            try {
              const convertedStyle = convertStringStyleValue(fixableNode.value)
              return fixer.replaceText(fixableNode, `{${convertedStyle}}`)
            } catch (error) {
              // Если конвертация не удалась, не применяем исправление
              return null
            }
          },
        })
      }
    }

    return {
      JSXOpeningElement(node) {
        if (!node.attributes?.length) return

        node.attributes.forEach(validateStyleProp)
      },
    }
  },
}
