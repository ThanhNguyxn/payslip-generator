import React, { useState } from 'react';
import { calculateTotalEarnings, calculateTotalDeductions, calculateNetPay, formatCurrency } from '../utils/calculations';
import { UNIVERSITIES, getUniversityFromHash } from '../data/universities';

const Preview = ({ state, docType = 'payslip', mode = 'employee', companyLogo, cardStyle = 'original', photoBase64 }) => {
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

    // Mode-specific labels
    const isContractor = mode === 'contractor';
    const personLabel = isContractor ? 'Contractor' : 'Employee';
    const docTitle = isContractor ? 'INVOICE' : 'Payslip';
    const statusLabel = isContractor ? 'Contract type' : 'Employment status';
    const statusValue = isContractor ? 'Independent Contractor' : 'Full time';

    // Render different document types
    const renderPayslip = () => (
        <>
            <header className="payslip-header-centered">
                {companyLogo && <img src={companyLogo} alt="Logo" className="company-logo" />}
                <h1>{docTitle}</h1>
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
                    <div className="info-row"><span className="label">{personLabel} name:</span><span className="value">{employee.name.toUpperCase()}</span></div>
                    <div className="info-row"><span className="label">{statusLabel}:</span><span className="value">{statusValue}</span></div>
                    <div className="info-row"><span className="label">{isContractor ? 'Contract:' : 'Award/Agreement:'}</span><span className="value">2024-2025 {isContractor ? 'Service Agreement' : 'Employment Contract'}</span></div>
                    <div className="info-row"><span className="label">{isContractor ? 'Service type:' : 'Classification:'}</span><span className="value">{employee.position}</span></div>
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

    // W-2 Tax Form
    const renderW2 = () => (
        <>
            <header className="payslip-header-centered">
                {companyLogo && <img src={companyLogo} alt="Logo" className="company-logo" />}
                <h1 style={{ fontSize: '1.5rem', color: '#0f4c81' }}>Form W-2 Wage and Tax Statement</h1>
                <p style={{ fontSize: '0.8rem', color: '#666' }}>Copy B — To Be Filed With Employee's FEDERAL Tax Return</p>
            </header>

            <hr className="divider-blue" />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div style={{ border: '1px solid #ccc', padding: '15px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '5px' }}>a. Employee's social security number</div>
                    <div style={{ fontWeight: 'bold' }}>XXX-XX-{employee.employeeId?.slice(-4) || '1234'}</div>
                </div>
                <div style={{ border: '1px solid #ccc', padding: '15px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '5px' }}>b. Employer identification number (EIN)</div>
                    <div style={{ fontWeight: 'bold' }}>XX-XXXXXXX</div>
                </div>
            </div>

            <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '5px' }}>c. Employer's name, address, and ZIP code</div>
                <div style={{ fontWeight: 'bold' }}>{company.name}</div>
                <div>{company.address}</div>
            </div>

            <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '5px' }}>e. Employee's name, address, and ZIP code</div>
                <div style={{ fontWeight: 'bold' }}>{employee.name}</div>
                <div>{employee.address}</div>
            </div>

            <table className="payslip-table-modern" style={{ marginBottom: '20px' }}>
                <thead><tr><th>Box</th><th>Description</th><th className="col-right">Amount</th></tr></thead>
                <tbody>
                    <tr><td>1</td><td>Wages, tips, other compensation</td><td className="col-right">{formatCurrency(totalEarnings * 12)}</td></tr>
                    <tr><td>2</td><td>Federal income tax withheld</td><td className="col-right">{formatCurrency(totalEarnings * 12 * 0.22)}</td></tr>
                    <tr><td>3</td><td>Social security wages</td><td className="col-right">{formatCurrency(totalEarnings * 12)}</td></tr>
                    <tr><td>4</td><td>Social security tax withheld</td><td className="col-right">{formatCurrency(totalEarnings * 12 * 0.062)}</td></tr>
                    <tr><td>5</td><td>Medicare wages and tips</td><td className="col-right">{formatCurrency(totalEarnings * 12)}</td></tr>
                    <tr><td>6</td><td>Medicare tax withheld</td><td className="col-right">{formatCurrency(totalEarnings * 12 * 0.0145)}</td></tr>
                </tbody>
            </table>

            <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '30px' }}>
                <p>This information is being furnished to the Internal Revenue Service.</p>
                <p style={{ marginTop: '10px' }}>Tax Year: {new Date().getFullYear()}</p>
            </div>
        </>
    );

    // Faculty Listing (School Website Screenshot)
    const renderFacultyListing = () => (
        <>
            {/* Browser Chrome */}
            <div style={{
                background: 'linear-gradient(180deg, #dee1e6 0%, #c8ccd3 100%)',
                borderRadius: '8px 8px 0 0',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }}></div>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }}></div>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27ca3f' }}></div>
                </div>
                <div style={{
                    flex: 1,
                    background: 'white',
                    borderRadius: '4px',
                    padding: '6px 12px',
                    fontSize: '0.75rem',
                    color: '#333',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <span style={{ color: '#5a5a5a' }}>🔒</span>
                    <span>https://www.{company.name?.toLowerCase().replace(/[^a-z0-9]/g, '')}.edu/faculty/directory</span>
                </div>
            </div>

            {/* Website Content */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '0 0 8px 8px', border: '1px solid #ddd', borderTop: 'none' }}>
                {/* School Header */}
                <div style={{ borderBottom: '3px solid #0f4c81', paddingBottom: '15px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {companyLogo && <img src={companyLogo} alt="Logo" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />}
                        <div>
                            <h1 style={{ margin: 0, color: '#0f4c81', fontSize: '1.5rem' }}>{company.name}</h1>
                            <p style={{ margin: '5px 0 0', color: '#666', fontSize: '0.85rem' }}>Excellence in Education Since 1965</p>
                        </div>
                    </div>
                    <nav style={{ marginTop: '15px', display: 'flex', gap: '20px', fontSize: '0.85rem' }}>
                        <a href="#" style={{ color: '#0f4c81', textDecoration: 'none' }}>Home</a>
                        <a href="#" style={{ color: '#0f4c81', textDecoration: 'none' }}>About</a>
                        <a href="#" style={{ color: '#0f4c81', textDecoration: 'none', fontWeight: 'bold', borderBottom: '2px solid #0f4c81' }}>Faculty & Staff</a>
                        <a href="#" style={{ color: '#0f4c81', textDecoration: 'none' }}>Academics</a>
                        <a href="#" style={{ color: '#0f4c81', textDecoration: 'none' }}>Contact</a>
                    </nav>
                </div>

                {/* Breadcrumb */}
                <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '20px' }}>
                    <a href="#" style={{ color: '#0f4c81' }}>Home</a> ›
                    <a href="#" style={{ color: '#0f4c81' }}> Faculty & Staff</a> ›
                    <span> Directory</span>
                </div>

                <h2 style={{ color: '#333', fontSize: '1.3rem', marginBottom: '20px' }}>Faculty Directory</h2>

                {/* Search Bar */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
                    <input
                        type="text"
                        value={employee.name}
                        readOnly
                        style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem' }}
                    />
                    <button style={{ background: '#0f4c81', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>Search</button>
                </div>

                {/* Results */}
                <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '15px' }}>Showing 1 result for "{employee.name}"</p>

                {/* Faculty Card */}
                <div style={{
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '20px',
                    display: 'flex',
                    gap: '20px',
                    background: '#fafafa'
                }}>
                    <div style={{
                        width: '120px',
                        height: '150px',
                        background: '#ddd',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        color: '#999'
                    }}>
                        👤
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 5px', color: '#0f4c81', fontSize: '1.2rem' }}>{employee.name}</h3>
                        <p style={{ margin: '0 0 10px', color: '#666', fontSize: '0.95rem' }}>{employee.position}</p>
                        <table style={{ fontSize: '0.85rem', color: '#555' }}>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '3px 15px 3px 0', fontWeight: 'bold' }}>Department:</td>
                                    <td>Education</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 15px 3px 0', fontWeight: 'bold' }}>Email:</td>
                                    <td style={{ color: '#0f4c81' }}>{employee.name?.toLowerCase().replace(' ', '.')}@{company.name?.toLowerCase().replace(/[^a-z0-9]/g, '')}.edu</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 15px 3px 0', fontWeight: 'bold' }}>Phone:</td>
                                    <td>{company.phone}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 15px 3px 0', fontWeight: 'bold' }}>Office:</td>
                                    <td>Room 204, Main Building</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 15px 3px 0', fontWeight: 'bold' }}>Years of Service:</td>
                                    <td>{((employee.name?.split('').reduce((a, b) => a + b.charCodeAt(0), 0) || 10) % 15) + 3} years</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ marginTop: '30px', paddingTop: '15px', borderTop: '1px solid #ddd', fontSize: '0.75rem', color: '#888', textAlign: 'center' }}>
                    © {new Date().getFullYear()} {company.name}. All rights reserved. | {company.address}
                </div>
            </div>
        </>
    );

    // Offer Letter
    const renderOfferLetter = () => (
        <>
            <header style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                    {companyLogo && <img src={companyLogo} alt="Logo" className="company-logo" style={{ marginRight: '20px' }} />}
                    <div>
                        <h2 style={{ margin: 0, color: '#0f4c81' }}>{company.name.toUpperCase()}</h2>
                        <div style={{ fontSize: '0.85rem', color: '#555' }}>{company.address}</div>
                    </div>
                </div>
            </header>

            <div style={{ textAlign: 'right', marginBottom: '30px', fontSize: '0.9rem' }}>
                Date: {today}
            </div>

            <div style={{ marginBottom: '20px' }}>
                <strong>{employee.name}</strong><br />
                {employee.address}
            </div>

            <h1 style={{ textAlign: 'center', fontSize: '1.3rem', marginBottom: '30px', color: '#0f4c81' }}>
                OFFER OF EMPLOYMENT
            </h1>

            <div style={{ lineHeight: 1.8, fontSize: '0.95rem' }}>
                <p>Dear {employee.name},</p>

                <p style={{ marginTop: '20px' }}>
                    We are pleased to offer you the position of <strong>{employee.position}</strong> at <strong>{company.name}</strong>.
                    We believe your skills and experience will be a valuable asset to our team.
                </p>

                <p style={{ marginTop: '20px' }}><strong>Position Details:</strong></p>
                <ul style={{ marginLeft: '20px' }}>
                    <li><strong>Title:</strong> {employee.position}</li>
                    <li><strong>Start Date:</strong> {meta.payPeriodStart}</li>
                    <li><strong>Compensation:</strong> {formatCurrency(employee.payRate * 38 * 52)} per year ({formatCurrency(employee.payRate)}/hour)</li>
                    <li><strong>Employment Type:</strong> Full-time</li>
                    <li><strong>Benefits:</strong> Health insurance, 401(k), Paid time off</li>
                </ul>

                <p style={{ marginTop: '20px' }}>
                    This offer is contingent upon successful completion of a background check and reference verification.
                </p>

                <p style={{ marginTop: '20px' }}>
                    Please sign and return this letter within <strong>7 business days</strong> to confirm your acceptance.
                </p>

                <p style={{ marginTop: '40px' }}>We look forward to welcoming you to our team!</p>

                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ borderTop: '1px solid #333', width: '200px', paddingTop: '5px', marginTop: '50px' }}>
                            <strong>HR Manager</strong><br />
                            {company.name}
                        </div>
                    </div>
                    <div>
                        <div style={{ borderTop: '1px solid #333', width: '200px', paddingTop: '5px', marginTop: '50px' }}>
                            <strong>Acceptance Signature</strong><br />
                            {employee.name}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    // Teacher ID Card (2-sided like Student Card)
    const renderTeacherCard = () => {
        // Generate deterministic hash for consistent university/department selection
        const nameHash = employee.name?.split('').reduce((a, b) => a + b.charCodeAt(0), 0) || 1;

        // Use fetched photo or fallback
        const photoUrl = photoBase64 || `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.name}`;

        // Generate dates
        const issueDate = new Date();
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 4);

        // Get university from company name or random based on employee name hash
        let university;
        if (company.name && company.name !== 'Your Company Name') {
            // If user has set company name, try to find matching university or use it as-is
            const matchedUni = UNIVERSITIES.find(u =>
                company.name.toLowerCase().includes(u.shortName.toLowerCase()) ||
                u.name.toLowerCase().includes(company.name.toLowerCase())
            );
            university = matchedUni || getUniversityFromHash(employee.name || 'default');
        } else {
            // Use hash-based selection for consistency
            university = getUniversityFromHash(employee.name || 'default');
        }

        const universityName = university.name;
        const universityShort = university.shortName;
        const universityColor = university.color;
        const universityLogo = university.logo;
        const universityAddress = university.address;
        const department = university.departments[nameHash % university.departments.length];

        // Style configurations
        const styles = {
            original: {
                frontBg: `linear-gradient(135deg, ${universityColor} 0%, ${universityColor}dd 100%)`,
                backBg: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
                borderRadius: '16px',
                shadow: '0 25px 70px rgba(0,0,0,0.6)',
                headerBg: '#fff',
                accentColor: '#4fc3f7',
                textColor: '#fff',
                headerTextColor: universityColor
            },
            modern: {
                frontBg: `linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, ${universityColor} 100%)`,
                backBg: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
                borderRadius: '24px',
                shadow: '0 30px 80px rgba(0,0,0,0.8), 0 0 40px rgba(102,126,234,0.3)',
                headerBg: 'rgba(255,255,255,0.95)',
                accentColor: '#667eea',
                textColor: '#fff',
                headerTextColor: universityColor
            },
            simple: {
                frontBg: '#ffffff',
                backBg: '#fafafa',
                borderRadius: '8px',
                shadow: '0 4px 20px rgba(0,0,0,0.15)',
                headerBg: universityColor,
                accentColor: universityColor,
                textColor: '#333',
                headerTextColor: '#fff'
            }
        };

        const style = styles[cardStyle] || styles.original;

        return (
            <>
                {/* FRONT SIDE */}
                <div id="teacher-card-front" style={{
                    width: '850px',
                    maxWidth: '100%',
                    background: style.frontBg,
                    borderRadius: style.borderRadius,
                    overflow: 'hidden',
                    boxShadow: style.shadow,
                    fontFamily: 'Arial, sans-serif'
                }}>
                    {/* Header */}
                    <div style={{
                        background: style.headerBg,
                        padding: '20px 30px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '18px'
                    }}>
                        <img
                            src={universityLogo}
                            alt={universityShort}
                            style={{
                                width: '70px',
                                height: '70px',
                                objectFit: 'contain',
                                padding: '8px',
                                background: '#fff',
                                borderRadius: '12px'
                            }}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                        <div style={{
                            width: '70px',
                            height: '70px',
                            background: universityColor,
                            borderRadius: '50%',
                            display: 'none',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 'bold',
                            fontSize: '1.2rem'
                        }}>{universityShort}</div>
                        <div>
                            <div style={{ fontWeight: 'bold', color: style.headerTextColor || universityColor, fontSize: '1.8rem', fontFamily: 'Georgia, serif' }}>{universityShort}</div>
                            <div style={{ fontSize: '0.9rem', color: style.headerTextColor ? style.headerTextColor : '#666', opacity: style.headerTextColor ? 0.8 : 1 }}>{universityName}</div>
                        </div>
                    </div>

                    {/* Body */}
                    <div style={{ padding: '30px', display: 'flex', gap: '25px' }}>
                        {/* Photo */}
                        <div style={{
                            width: '140px',
                            height: '140px',
                            background: '#ccc',
                            borderRadius: '14px',
                            overflow: 'hidden',
                            border: '4px solid #fff',
                            boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
                            flexShrink: 0
                        }}>
                            <img
                                src={photoUrl}
                                alt="Faculty"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${employee.name}`; }}
                            />
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, color: style.textColor, fontSize: '1rem' }}>
                            <div style={{ marginBottom: '12px' }}>
                                <div style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.5px' }}>FULL NAME:</div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.3rem' }}>{employee.name}</div>
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <div style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.5px' }}>EMPLOYEE ID:</div>
                                <div style={{ color: style.accentColor, fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 'bold' }}>{employee.employeeId}</div>
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <div style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.5px' }}>DEPARTMENT:</div>
                                <div>{department}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '40px' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.5px' }}>ISSUED:</div>
                                    <div>{issueDate.toLocaleDateString('en-US')}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.5px' }}>VALID THRU:</div>
                                    <div>{expiryDate.toLocaleDateString('en-US')}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{
                        background: 'rgba(0,0,0,0.2)',
                        padding: '16px 30px',
                        color: style.textColor,
                        fontSize: '0.9rem'
                    }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem' }}>CARDHOLDER ADDRESS</div>
                        <div style={{ color: style.accentColor, fontWeight: '500' }}>{employee.name}</div>
                        <div style={{ opacity: 0.8 }}>{universityAddress}</div>
                    </div>
                </div>

                {/* BACK SIDE */}
                <div id="teacher-card-back" style={{
                    width: '850px',
                    maxWidth: '100%',
                    background: style.backBg,
                    borderRadius: style.borderRadius,
                    overflow: 'hidden',
                    boxShadow: style.shadow,
                    fontFamily: 'Arial, sans-serif',
                    marginTop: '30px',
                    color: style.textColor
                }}>
                    {/* Header stripe */}
                    <div style={{ background: universityColor, padding: '12px 30px', color: '#fff' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1.5px', textTransform: 'uppercase' }}>CARDHOLDER ADDRESS</div>
                    </div>

                    <div style={{ padding: '25px 30px' }}>
                        {/* Address section */}
                        <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #ddd' }}>
                            <div style={{ fontWeight: '600', color: universityColor, fontSize: '1.1rem' }}>{employee.name}</div>
                            <div style={{ color: '#555', fontSize: '1rem' }}>{universityAddress}</div>
                        </div>

                        {/* Terms & Disclaimer */}
                        <div style={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.7, marginBottom: '20px' }}>
                            This card is the property of {universityName} and must be returned upon request.
                            Faculty members are required to carry this card while on university premises.
                            If found, please return to the nearest security department.
                        </div>

                        {/* Emergency Contact */}
                        <div style={{ background: 'rgba(0,0,0,0.03)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#333', letterSpacing: '0.5px', marginBottom: '8px' }}>EMERGENCY CONTACT:</div>
                            <div style={{ fontSize: '0.9rem', color: '#666' }}>University Security: (555) 123-4567</div>
                            <div style={{ fontSize: '0.9rem', color: '#666' }}>HR Department: (555) 123-4568</div>
                        </div>

                        {/* Signature and Photo section */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '15px', borderTop: '1px solid #ddd' }}>
                            <div>
                                <div style={{ fontFamily: 'Georgia, cursive', fontSize: '2rem', color: '#333' }}>{employee.name}</div>
                                <div style={{ fontSize: '0.7rem', color: '#999', textTransform: 'uppercase', marginTop: '5px' }}>Cardholder Signature</div>
                            </div>
                            <div style={{
                                width: '70px',
                                height: '70px',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                border: '2px solid #ddd'
                            }}>
                                <img src={photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    };

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
                {docType === 'w2' && renderW2()}
                {docType === 'employment' && renderEmploymentLetter()}
                {docType === 'offer' && renderOfferLetter()}
                {docType === 'faculty' && renderFacultyListing()}
                {docType === 'teacherCard' && renderTeacherCard()}
            </div>
        </div>
    );
};

export default Preview;

