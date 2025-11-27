import { useState } from 'react'
import { INITIAL_STATE } from './constants/initialState'
import { generateRandomData } from './utils/randomData'
import Editor from './components/Editor'
import Preview from './components/Preview'
import './index.css'

function App() {
  const [state, setState] = useState(INITIAL_STATE)

  const handleChange = (section, field, value) => {
    setState(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  // Specific handler for arrays (earnings/deductions)
  const handleArrayChange = (section, id, field, value) => {
    setState(prev => ({
      ...prev,
      [section]: prev[section].map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }))
  }

  const addArrayItem = (section, newItem) => {
    setState(prev => ({
      ...prev,
      [section]: [...prev[section], newItem]
    }))
  }

  const removeArrayItem = (section, id) => {
    setState(prev => ({
      ...prev,
      [section]: prev[section].filter(item => item.id !== id)
    }))
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Payslip Generator</h1>
          <button
            onClick={() => setState(generateRandomData())}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: 500,
              marginRight: '10px'
            }}
          >
            Fill Random Data
          </button>
          <button
            onClick={() => window.print()}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Download PDF / Print
          </button>
        </div>
      </header>
      <main className="main-content">
        <Editor
          state={state}
          onChange={handleChange}
          onArrayChange={handleArrayChange}
          onAdd={addArrayItem}
          onRemove={removeArrayItem}
        />
        <Preview state={state} />
      </main>
      <footer className="app-footer">
        <div className="footer-links">
          <a
            href="https://buymeacoffee.com/thanhnguyxn"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link bmc-link"
          >
            ☕ Buy Me a Coffee
          </a>
          <a
            href="https://github.com/ThanhNguyxn/payslip-generator"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link github-link"
          >
            ⭐ Source Code
          </a>
        </div>
        <p className="footer-text">
          © {new Date().getFullYear()} Payslip Generator. Built with React & Vite.
        </p>
      </footer>
    </div>
  )
}

export default App
