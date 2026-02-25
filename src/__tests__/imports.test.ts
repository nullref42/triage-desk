import { describe, it, expect } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Regression test: ensure all MUI components used in page files are actually imported.
 * Catches "Paper is not defined" type errors at test time instead of runtime.
 */
describe('MUI component imports', () => {
  const pagesDir = path.resolve(__dirname, '../pages')
  const pageFiles = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'))

  // MUI components that are commonly used — add more as needed
  const muiComponents = [
    'Box', 'Typography', 'Paper', 'Chip', 'Avatar', 'Button', 'TextField',
    'Divider', 'Tabs', 'Tab', 'Alert', 'Snackbar', 'Tooltip', 'IconButton',
    'LinearProgress', 'List', 'ListItem', 'ListItemText',
    'ToggleButtonGroup', 'ToggleButton', 'Checkbox', 'FormControlLabel',
    'InputAdornment',
  ]

  for (const file of pageFiles) {
    it(`${file}: all used MUI components are imported`, () => {
      const content = fs.readFileSync(path.join(pagesDir, file), 'utf-8')

      // Find the @mui/material import block
      const importMatch = content.match(/import\s*\{([^}]+)\}\s*from\s*['"]@mui\/material['"]/)
      const importedComponents = importMatch
        ? importMatch[1].split(',').map(s => s.trim()).filter(Boolean)
        : []

      // Check each MUI component: if it's used as JSX (<Paper ...) it must be imported
      const missing: string[] = []
      for (const comp of muiComponents) {
        // Look for JSX usage: <Component or <Component> or <Component/
        const jsxRegex = new RegExp(`<${comp}[\\s/>]`)
        if (jsxRegex.test(content) && !importedComponents.includes(comp)) {
          missing.push(comp)
        }
      }

      expect(missing, `Missing imports in ${file}: ${missing.join(', ')}`).toEqual([])
    })
  }
})
