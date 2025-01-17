/**
 * @fileoverview Rule to flag use of colons in props in React .js files
 */

const {
  getPropName,
  isCustomHTMLElement,
  getJSXTagName,
  getPropIdentifier,
  isSpreadAttribute,
} = require('../helpers/jsx');

const {
  getPropsFromObjectString,
  getCamelCasedString,
  convertStringStyleValue,
} = require('../helpers');

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce props without colons in JSX',
      recommended: true,
      url: 'https://github.com/fostimus/eslint-plugin-svg-jsx/blob/main/docs/rules/no-colon-props.md'
    },
    messages: {
      fixableProp:
        'JSX: found {{ fixableCharacter }} on prop {{ propName }} on {{ tagName }}. Fixable.',
      invalidProp:
        'JSX prop is invalid; the last character of the prop is not allowed. Not fixable.',
      stringStyleValue:
        'JSX prop is invalid; the value of the style prop is a string. Fixable.',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          allowedPrefixes: {
            type: 'array',
            items: {
              type: 'string'
            },
            default: ['aria', 'data']
          },
          invalidCharacters: {
            type: 'array',
            items: {
              type: 'string'
            },
            default: [':']
          }
        },
        additionalProperties: false
      }
    ]
  },

  create(context) {
    const sourceCode = context.sourceCode;
    const options = context.options[0] || {};
    const ALLOWED_PREFIXES = options.allowedPrefixes || ['aria', 'data'];
    const INVALID_CHARACTERS = options.invalidCharacters || [':'];

    /**
     * Validates and fixes a prop name if it contains invalid characters
     * @param {string} propName - The name of the prop to validate
     * @param {ASTNode} fixableNode - The node to fix
     * @param {string} charDelimiter - The character delimiter to check for
     */
    function validateAndFixProp(propName, fixableNode, charDelimiter) {
      if (
        propName?.includes &&
        propName.includes(charDelimiter) &&
        !isCustomHTMLElement(node) &&
        !ALLOWED_PREFIXES.some((prefix) => propName?.startsWith(prefix))
      ) {
        if (propName?.charAt(propName?.length - 1) === charDelimiter) {
          context.report({
            node: fixableNode,
            messageId: 'invalidProp',
          });
        } else {
          context.report({
            node: fixableNode,
            messageId: 'fixableProp',
            data: {
              propName,
              tagName: getJSXTagName(node),
              fixableCharacter: charDelimiter,
            },
            fix(fixer) {
              if (!fixer?.replaceText) return null;
              
              const newPropName = getCamelCasedString(propName, charDelimiter);
              return fixer.replaceText(fixableNode, newPropName);
            },
          });
        }
      }
    }

    /**
     * Handles spread operator attributes
     * @param {ASTNode} attr - The attribute node
     * @param {string} charDelimiter - The character delimiter
     */
    function handleSpreadOperator(attr, charDelimiter) {
      const props = getPropsFromObjectString(getPropIdentifier(attr, context));
      
      props.forEach((prop) => {
        const nodeToFix = attr?.argument?.properties?.find((node) => 
          node?.key?.value === prop
        )?.key;
        
        if (nodeToFix) {
          validateAndFixProp(prop, nodeToFix, charDelimiter);
        }
      });
    }

    /**
     * Handles common props attributes
     * @param {ASTNode} attr - The attribute node
     * @param {string} charDelimiter - The character delimiter
     */
    function handleCommonProps(attr, charDelimiter) {
      const propName = getPropName(attr, context);
      validateAndFixProp(propName, attr.name, charDelimiter);
    }

    /**
     * Handles all types of attributes
     * @param {ASTNode} attr - The attribute node
     */
    function attributeHandler(attr) {
      if (isSpreadAttribute(attr)) {
        INVALID_CHARACTERS.forEach((char) =>
          handleSpreadOperator(attr, char)
        );
      } else {
        INVALID_CHARACTERS.forEach((char) => 
          handleCommonProps(attr, char)
        );
      }
    }

    return {
      JSXOpeningElement(node) {
        node.attributes.forEach(attributeHandler);
      }
    };
  }
};