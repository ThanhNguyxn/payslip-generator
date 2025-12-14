import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

/**
 * Sanitize a string for use in filenames
 * @param {string} str - String to sanitize
 * @returns {string} - Sanitized string
 */
function sanitizeFilename(str) {
    return str
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special chars
        .trim()
        .replace(/\s+/g, '_'); // Replace spaces with underscores
}

/**
 * Format a date string to Month_Year format
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {string} - Formatted date like "Dec_2025"
 */
function formatPayPeriod(dateStr) {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]}_${date.getFullYear()}`;
}

/**
 * Generate a descriptive filename for the payslip
 * @param {object} state - Application state with employee and meta info
 * @returns {string} - Filename like "Payslip_John_Doe_Dec_2025.pdf"
 */
export function generatePayslipFilename(state) {
    const employeeName = sanitizeFilename(state.employee?.name || 'Employee');
    const payPeriod = formatPayPeriod(state.meta?.payDate);
    return `Payslip_${employeeName}_${payPeriod}.pdf`;
}

/**
 * Export the payslip to PDF with a descriptive filename
 * @param {object} state - Application state
 */
export async function exportPayslipToPdf(state) {
    const payslipElement = document.querySelector('.payslip-container');

    if (!payslipElement) {
        alert('Payslip preview not found!');
        return;
    }

    try {
        // Capture the payslip as a canvas
        const canvas = await html2canvas(payslipElement, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            scale: 2, // High quality
        });

        // Create PDF - A4 portrait
        const pdf = new jsPDF('portrait', 'mm', 'a4');

        // Calculate dimensions to fit A4
        const pageWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const margin = 10;

        const imgWidth = pageWidth - (margin * 2);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Center vertically if image is shorter than page
        const yPos = imgHeight < pageHeight ? (pageHeight - imgHeight) / 2 : margin;

        pdf.addImage(
            canvas.toDataURL('image/png'),
            'PNG',
            margin,
            yPos,
            imgWidth,
            imgHeight
        );

        // Save with descriptive filename
        const filename = generatePayslipFilename(state);
        pdf.save(filename);

    } catch (error) {
        console.error('PDF export failed:', error);
        alert('Failed to export PDF. Please try again.');
    }
}

/**
 * Create Teacher ID card PDF object
 * @returns {Promise<jsPDF>} - jsPDF object
 */
async function createTeacherCardPdf() {
    const frontCard = document.getElementById('teacher-card-front');
    const backCard = document.getElementById('teacher-card-back');

    if (!frontCard) {
        throw new Error('Teacher ID card not found!');
    }

    // Create PDF - landscape for ID card format
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = 297; // A4 landscape width
    const pageHeight = 210; // A4 landscape height
    const margin = 15;

    // Capture front card
    const frontCanvas = await html2canvas(frontCard, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: 2,
    });

    const imgWidth = pageWidth - (margin * 2);
    const imgHeight = (frontCanvas.height * imgWidth) / frontCanvas.width;
    const yPos = (pageHeight - imgHeight) / 2;

    pdf.addImage(
        frontCanvas.toDataURL('image/png'),
        'PNG',
        margin,
        yPos,
        imgWidth,
        imgHeight
    );

    // Add back card on second page if it exists
    if (backCard) {
        pdf.addPage();
        const backCanvas = await html2canvas(backCard, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
            scale: 2,
        });

        const backImgHeight = (backCanvas.height * imgWidth) / backCanvas.width;
        const backYPos = (pageHeight - backImgHeight) / 2;

        pdf.addImage(
            backCanvas.toDataURL('image/png'),
            'PNG',
            margin,
            backYPos,
            imgWidth,
            backImgHeight
        );
    }

    return pdf;
}

/**
 * Export Teacher ID card (front and back) to PDF
 * @param {object} state - Application state
 */
export async function exportTeacherCardToPdf(state) {
    try {
        const pdf = await createTeacherCardPdf(state);
        // Save with filename
        const employeeName = state.employee?.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Employee';
        pdf.save(`TeacherID_${employeeName}.pdf`);
    } catch (error) {
        console.error('Teacher ID PDF export failed:', error);
        alert('Failed to export Teacher ID PDF. Please try again.');
    }
}

/**
 * Get Teacher ID card PDF as Base64 string
 * @param {object} state - Application state
 * @returns {Promise<string>} - Base64 string of PDF
 */
export async function getTeacherCardPdfBase64(state) {
    try {
        const pdf = await createTeacherCardPdf(state);
        return pdf.output('datauristring');
    } catch (error) {
        console.error('Failed to generate PDF base64:', error);
        throw error;
    }
}

/**
 * Export the current document to PNG
 * @param {object} state - Application state
 * @param {string} docType - Document type name
 */
export async function exportToPng(state, docType = 'payslip') {
    const element = document.querySelector('.payslip-container');

    if (!element) {
        alert('Document preview not found!');
        return;
    }

    try {
        const canvas = await html2canvas(element, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            scale: 2,
        });

        const link = document.createElement('a');
        const employeeName = sanitizeFilename(state.employee?.name || 'Employee');
        const payPeriod = formatPayPeriod(state.meta?.payDate);
        link.download = `${docType}_${employeeName}_${payPeriod}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (error) {
        console.error('PNG export failed:', error);
        alert('Failed to export PNG. Please try again.');
    }
}

/**
 * Export all documents to ZIP
 * @param {object} state - Application state
 * @param {function} setDocType - Function to switch document type
 * @param {Array} docTypes - Array of document types to export
 */
export async function exportToZip(state, setDocType, docTypes = ['payslip', 'tax', 'w2', 'employment', 'offer']) {
    const zip = new JSZip();
    const employeeName = sanitizeFilename(state.employee?.name || 'Employee');
    const payPeriod = formatPayPeriod(state.meta?.payDate);

    const docLabels = {
        payslip: 'Payslip',
        tax: 'Tax_Form',
        w2: 'W2_Form',
        employment: 'Employment_Letter',
        offer: 'Offer_Letter'
    };

    try {
        for (const docType of docTypes) {
            // Switch to this document type
            setDocType(docType);

            // Wait for render
            await new Promise(resolve => setTimeout(resolve, 500));

            const element = document.querySelector('.payslip-container');
            if (!element) continue;

            const canvas = await html2canvas(element, {
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                scale: 2,
            });

            // Convert to blob and add to ZIP
            const dataUrl = canvas.toDataURL('image/png');
            const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
            const filename = `${docLabels[docType]}_${employeeName}_${payPeriod}.png`;
            zip.file(filename, base64Data, { base64: true });
        }

        // Generate and download ZIP
        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `Documents_${employeeName}_${payPeriod}.zip`;
        link.click();
        URL.revokeObjectURL(link.href);

        // Switch back to payslip
        setDocType('payslip');

    } catch (error) {
        console.error('ZIP export failed:', error);
        alert('Failed to export ZIP. Please try again.');
    }
}
