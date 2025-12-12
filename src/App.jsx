import { useState, useRef } from 'react'
import { INITIAL_STATE } from './constants/initialState'
import { generateRandomData } from './utils/randomData'
import { exportPayslipToPdf } from './utils/pdfExport'
import Editor from './components/Editor'
import Preview from './components/Preview'
import './index.css'

function App() {
  const [state, setState] = useState(INITIAL_STATE)
  const [docType, setDocType] = useState('payslip') // 'payslip', 'tax', 'employment'
  const [companyLogo, setCompanyLogo] = useState(null)
  const logoInputRef = useRef(null)

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

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setCompanyLogo(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="app-container">
      {/* Modern Navigation Bar */}
      <nav className="nav-bar">
        <div className="nav-left">
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>
            💼 Payslip Generator
          </span>
        </div>

        <div className="nav-center">
          <button
            className={`tab-btn ${docType === 'payslip' ? 'active' : ''}`}
            onClick={() => setDocType('payslip')}
          >
            Payslip
          </button>
          <button
            className={`tab-btn ${docType === 'tax' ? 'active' : ''}`}
            onClick={() => setDocType('tax')}
          >
            Tax Form
          </button>
          <button
            className={`tab-btn ${docType === 'employment' ? 'active' : ''}`}
            onClick={() => setDocType('employment')}
          >
            Employment Letter
          </button>
        </div>

        <div className="nav-right">
          <button
            className="action-btn primary"
            onClick={() => setState(generateRandomData())}
          >
            🎲 Random Data
          </button>
          <button
            className="action-btn secondary"
            onClick={() => exportPayslipToPdf(state)}
          >
            📥 Download PDF
          </button>
        </div>
      </nav>

      <main className="main-content">
        <Editor
          state={state}
          onChange={handleChange}
          onArrayChange={handleArrayChange}
          onAdd={addArrayItem}
          onRemove={removeArrayItem}
          companyLogo={companyLogo}
          onLogoUpload={handleLogoUpload}
          logoInputRef={logoInputRef}
        />
        <Preview
          state={state}
          docType={docType}
          companyLogo={companyLogo}
        />
      </main>
    </div>
  )
}

export default App
