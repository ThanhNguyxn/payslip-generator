import React, { useState, useRef } from 'react';
import { calculateTotalEarnings, calculateTotalDeductions, calculateNetPay, formatCurrency } from '../utils/calculations';

const Preview = ({ state, docType = 'payslip', companyLogo }) => {
    const { company, bank, employee, meta, earnings, deductions } = state;
    const totalEarnings = calculateTotalEarnings(earnings);
    const totalDeductions = calculateTotalDeductions(deductions);
    const netPay = calculateNetPay(earnings, deductions);

    // Zoom state
    const [zoomLevel, setZoomLevel] = useState(70);

    // Drag state
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handleZoomIn = () => {
        if (zoomLevel < 150) setZoomLevel(prev => prev + 10);
    };

    const handleZoomOut = () => {
        if (zoomLevel > 30) setZoomLevel(prev => prev - 10);
    };

    const handleMouseDown = (e) => {
        if (e.target.closest('.zoom-controls')) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => setIsDragging(false);
    const handleMouseLeave = () => setIsDragging(false);

    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Render different document types
    const renderPayslip = () => (
        <>
            <header className="payslip-header-centered">
                {companyLogo && <img src={companyLogo} alt="Logo" className="company-logo" />}
                <h1>Payslip</h1>
                <h2 className="company-name">{company.name.toUpperCase()}</h2>
                <div className="company-contact">
                    {company.phone && <span>Phone: {company.phone} | </span>}
                    {company.email && <span>Email: {company.email}</span>}
                </div>
                <div className="company-address">Address: {company.address}</div>
                <div className="company-website">
                    <a href={company.website?.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noreferrer">{company.website}</a>
                </div>
            </header>

            <hr className="divider-blue" />

            <section className="info-grid-compact">
                <div className="info-column">
                    <div className="info-row"><span className="label">Employee name:</span><span className="value">{employee.name.toUpperCase()}</span></div>
                    <div className="info-row"><span className="label">Employment status:</span><span className="value">Full time</span></div>
                    <div className="info-row"><span className="label">Award/Agreement:</span><span className="value">2024-2025 Employment Contract</span></div>
                    <div className="info-row"><span className="label">Classification:</span><span className="value">{employee.position}</span></div>
                    <div className="info-row"><span className="label">Hourly rate:</span><span className="value">{formatCurrency(employee.payRate)}</span></div>
                    <div className="info-row"><span className="label">Annual salary:</span><span className="value">{formatCurrency(employee.payRate * 38 * 52)}</span></div>
                </div>
                <div className="info-column">
                    <div className="info-row"><span className="label">Pay period:</span><span className="value">{meta.payPeriodStart} to {meta.payPeriodEnd}</span></div>
                    <div className="info-row"><span className="label">Pay date:</span><span className="value">{meta.payDate}</span></div>
                    <div className="info-row"><span className="label">Annual leave balance:</span><span className="value">48 hours</span></div>
                    <div className="info-row"><span className="label">Sick/carer's leave:</span><span className="value">40 hours</span></div>
                </div>
            </section>

            <section className="table-section">
                <h3 className="section-title">Entitlements</h3>
                <table className="payslip-table-modern">
                    <thead><tr><th className="col-desc">Description</th><th className="col-center">Hours/units</th><th className="col-right">Rate</th><th className="col-right">Total</th></tr></thead>
                    <tbody>
                        {earnings.map(item => (
                            <tr key={item.id}><td>{item.description}</td><td className="col-center">{item.quantity}</td><td className="col-right">{formatCurrency(item.rate)}</td><td className="col-right">{formatCurrency(item.amount)}</td></tr>
                        ))}
                    </tbody>
                    <tfoot><tr><td colSpan="3" className="col-desc"><strong>Total</strong></td><td className="col-right"><strong>{formatCurrency(totalEarnings)}</strong></td></tr></tfoot>
                </table>
            </section>

            <section className="table-section">
                <h3 className="section-title">Deductions</h3>
                <table className="payslip-table-modern">
                    <thead><tr><th className="col-desc">Description</th><th className="col-right">Total</th></tr></thead>
                    <tbody>
                        {deductions.map(item => (<tr key={item.id}><td>{item.description}</td><td className="col-right">{formatCurrency(item.amount)}</td></tr>))}
                    </tbody>
                    <tfoot><tr><td className="col-desc"><strong>Total</strong></td><td className="col-right"><strong>{formatCurrency(totalDeductions)}</strong></td></tr></tfoot>
                </table>
            </section>

            <section className="payslip-footer-section">
                <div className="net-pay-row">
                    <div className="net-pay-label">
                        <strong>Net pay</strong>
                        <div className="bank-details">
                            <div className="bank-row"><span className="bank-label">Bank details:</span> <span>{bank?.bankName || 'CHASE BANK'}</span></div>
                            <div className="bank-row"><span className="bank-label">Account number:</span> <span>{bank?.accountNumber || '892-5647391'}</span></div>
                            <div className="bank-row"><span className="bank-label">Total net pay:</span> <span className="net-amount">{formatCurrency(netPay)}</span></div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );

    const renderTaxForm = () => (
        <>
            <header className="payslip-header-centered">
                {companyLogo && <img src={companyLogo} alt="Logo" className="company-logo" />}
                <h1 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>TAX WITHHOLDING STATEMENT</h1>
                <h2 className="company-name">{company.name.toUpperCase()}</h2>
                <div className="company-address">Address: {company.address}</div>
            </header>

            <hr className="divider-blue" />

            <section style={{ marginBottom: '30px' }}>
                <h3 style={{ background: '#d1d5db', padding: '8px 12px', margin: '0 0 15px 0', fontSize: '1rem' }}>EMPLOYER INFORMATION</h3>
                <div className="info-row"><span className="label">Employer Name:</span><span className="value">{company.name}</span></div>
                <div className="info-row"><span className="label">Employer ID (EIN):</span><span className="value">XX-XXXXXXX</span></div>
                <div className="info-row"><span className="label">Address:</span><span className="value">{company.address}</span></div>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h3 style={{ background: '#d1d5db', padding: '8px 12px', margin: '0 0 15px 0', fontSize: '1rem' }}>EMPLOYEE INFORMATION</h3>
                <div className="info-row"><span className="label">Employee Name:</span><span className="value">{employee.name}</span></div>
                <div className="info-row"><span className="label">Employee ID:</span><span className="value">{employee.employeeId}</span></div>
                <div className="info-row"><span className="label">Tax Code:</span><span className="value">{employee.taxCode}</span></div>
                <div className="info-row"><span className="label">Address:</span><span className="value">{employee.address}</span></div>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h3 style={{ background: '#d1d5db', padding: '8px 12px', margin: '0 0 15px 0', fontSize: '1rem' }}>TAX SUMMARY - YEAR TO DATE</h3>
                <table className="payslip-table-modern">
                    <thead><tr><th>Description</th><th className="col-right">Amount</th></tr></thead>
                    <tbody>
                        <tr><td>Gross Wages</td><td className="col-right">{formatCurrency(totalEarnings * 12)}</td></tr>
                        <tr><td>Federal Income Tax Withheld</td><td className="col-right">{formatCurrency(totalEarnings * 12 * 0.22)}</td></tr>
                        <tr><td>State Income Tax Withheld</td><td className="col-right">{formatCurrency(totalEarnings * 12 * 0.05)}</td></tr>
                        <tr><td>Social Security Tax</td><td className="col-right">{formatCurrency(totalEarnings * 12 * 0.062)}</td></tr>
                        <tr><td>Medicare Tax</td><td className="col-right">{formatCurrency(totalEarnings * 12 * 0.0145)}</td></tr>
                    </tbody>
                    <tfoot>
                        <tr><td><strong>Total Tax Withheld</strong></td><td className="col-right"><strong>{formatCurrency(totalEarnings * 12 * 0.3565)}</strong></td></tr>
                    </tfoot>
                </table>
            </section>

            <div style={{ marginTop: '50px', fontSize: '0.8rem', color: '#666' }}>
                <p>This statement is provided for informational purposes. Please consult a tax professional for advice.</p>
                <p style={{ marginTop: '10px' }}>Generated on: {today}</p>
            </div>
        </>
    );

    const renderEmploymentLetter = () => (
        <>
            <header style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                    {companyLogo && <img src={companyLogo} alt="Logo" className="company-logo" style={{ marginRight: '20px' }} />}
                    <div>
                        <h2 style={{ margin: 0, color: '#0f4c81' }}>{company.name.toUpperCase()}</h2>
                        <div style={{ fontSize: '0.85rem', color: '#555' }}>{company.address}</div>
                        <div style={{ fontSize: '0.85rem', color: '#555' }}>Phone: {company.phone} | Email: {company.email}</div>
                    </div>
                </div>
            </header>

            <div style={{ textAlign: 'right', marginBottom: '30px', fontSize: '0.9rem' }}>
                Date: {today}
            </div>

            <h1 style={{ textAlign: 'center', fontSize: '1.3rem', marginBottom: '30px', textDecoration: 'underline' }}>
                EMPLOYMENT VERIFICATION LETTER
            </h1>

            <div style={{ lineHeight: 1.8, fontSize: '0.95rem' }}>
                <p>To Whom It May Concern,</p>

                <p style={{ marginTop: '20px' }}>
                    This letter is to confirm that <strong>{employee.name}</strong> is employed at <strong>{company.name}</strong>
                    as a <strong>{employee.position}</strong>. Their employment commenced on <strong>{meta.payPeriodStart}</strong>.
                </p>

                <p style={{ marginTop: '20px' }}>
                    <strong>Employee Details:</strong>
                </p>
                <ul style={{ marginLeft: '20px' }}>
                    <li>Employee ID: {employee.employeeId}</li>
                    <li>Position: {employee.position}</li>
                    <li>Employment Type: Full-time</li>
                    <li>Current Annual Salary: {formatCurrency(employee.payRate * 38 * 52)}</li>
                </ul>

                <p style={{ marginTop: '20px' }}>
                    {employee.name} is a valued member of our team and has demonstrated excellent performance throughout
                    their tenure with our organization.
                </p>

                <p style={{ marginTop: '20px' }}>
                    If you require any additional information, please do not hesitate to contact our Human Resources
                    department at {company.phone} or {company.email}.
                </p>

                <p style={{ marginTop: '40px' }}>Sincerely,</p>

                <div style={{ marginTop: '60px' }}>
                    <div style={{ borderTop: '1px solid #333', width: '200px', paddingTop: '5px' }}>
                        <strong>HR Manager</strong><br />
                        {company.name}
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <div
            className="preview-panel"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
            <div className="zoom-controls">
                <button onClick={handleZoomOut} className="zoom-btn" title="Zoom Out">−</button>
                <span className="zoom-level">{zoomLevel}%</span>
                <button onClick={handleZoomIn} className="zoom-btn" title="Zoom In">+</button>
            </div>

            <div
                className="payslip-container"
                style={{
                    transform: `scale(${zoomLevel / 100}) translate(${position.x}px, ${position.y}px)`,
                    transformOrigin: 'top center'
                }}
            >
                {docType === 'payslip' && renderPayslip()}
                {docType === 'tax' && renderTaxForm()}
                {docType === 'employment' && renderEmploymentLetter()}
            </div>
        </div>
    );
};

export default Preview;
