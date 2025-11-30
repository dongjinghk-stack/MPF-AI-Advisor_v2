
import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from 'pdf-lib';

// Helper to draw a standard header on a page
const drawHeader = (page: PDFPage, font: PDFFont, text: string, subtext: string = '') => {
    const { width, height } = page.getSize();
    page.drawRectangle({
        x: 0, y: height - 100,
        width: width, height: 100,
        color: rgb(0.95, 0.95, 0.95)
    });
    page.drawText(text, { x: 50, y: height - 50, size: 14, font, color: rgb(0, 0.2, 0.6) });
    if (subtext) {
        page.drawText(subtext, { x: 50, y: height - 75, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
    }
    // Logo placeholder
    page.drawCircle({ x: width - 60, y: height - 50, size: 20, color: rgb(0.2, 0.6, 1) });
    page.drawText("MPF", { x: width - 72, y: height - 54, size: 10, font, color: rgb(1, 1, 1) });
};

// Helper to draw a field box and label
const drawField = (page: PDFPage, font: PDFFont, label: string, x: number, y: number, width: number = 200, height: number = 20) => {
    page.drawText(label, { x: x, y: y + height + 2, size: 9, font, color: rgb(0.3, 0.3, 0.3) });
    page.drawRectangle({
        x: x, y: y,
        width: width, height: height,
        borderColor: rgb(0.7, 0.7, 0.7),
        borderWidth: 1,
        color: rgb(1, 1, 1) // White background
    });
};

export const createEnrollmentFormTemplate = async (): Promise<PDFDocument> => {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Create 13 pages as per OCR
    for (let i = 0; i < 13; i++) {
        const page = pdfDoc.addPage([595, 842]); // A4 Size
        
        // Footer pagination
        page.drawText(`${i + 1} of 13 MASS-PAA-25V1`, { x: 500, y: 20, size: 8, font });

        // Page 1: Cover / Header
        if (i === 0) {
            drawHeader(page, fontBold, "MASS MANDATORY PROVIDENT FUND SCHEME", "PERSONAL ACCOUNT MEMBER APPLICATION FORM");
            page.drawText("PARTICIPATION AGREEMENT", { x: 50, y: 700, size: 12, font: fontBold });
            page.drawText("Please complete this form in BLOCK LETTERS.", { x: 50, y: 650, size: 10, font });
        }

        // Page 2: Member Particulars (Targeting y=118 for filling)
        if (i === 1) {
            drawHeader(page, fontBold, "A. MEMBER PARTICULARS");
            // The filling logic uses y=118 for names. 
            // We draw labels slightly above that.
            page.drawText("SECTION (3) Name", { x: 50, y: 160, size: 11, font: fontBold });
            drawField(page, font, "Surname in English", 125, 115, 200, 20); // y=118 falls inside
            drawField(page, font, "Given Name in English", 345, 115, 200, 20);
        }

        // Page 3: Personal Details (Targeting filling coords)
        if (i === 2) {
            drawHeader(page, fontBold, "A. MEMBER PARTICULARS (Continued)");
            
            // DOB (y=752 filling)
            page.drawText("(4) Date of Birth", { x: 50, y: 770, size: 10, font: fontBold });
            drawField(page, font, "DD", 280, 748, 30, 18);
            drawField(page, font, "MM", 315, 748, 30, 18);
            drawField(page, font, "YYYY", 350, 748, 50, 18);

            // Gender (y=752)
            page.drawText("(5) Gender", { x: 400, y: 770, size: 10, font: fontBold });
            page.drawText("Male [ ]", { x: 450, y: 752, size: 10, font });
            page.drawText("Female [ ]", { x: 520, y: 752, size: 10, font });

            // ID (y=725 filling)
            page.drawText("(6) Identification", { x: 50, y: 725, size: 10, font: fontBold });
            page.drawText("[ ] HKID Card", { x: 60, y: 725, size: 10, font });
            page.drawText("[ ] Passport", { x: 240, y: 725, size: 10, font });
            drawField(page, font, "Document No.", 175, 690, 200, 20); // y=695 filling digits

            // Contact (y=645 filling phone, y=590 email)
            page.drawText("(9) Mobile Phone No.", { x: 50, y: 660, size: 10, font: fontBold });
            drawField(page, font, "", 345, 640, 150, 20);
            
            page.drawText("(11) Email Address", { x: 50, y: 610, size: 10, font: fontBold });
            drawField(page, font, "", 75, 585, 400, 20);

            // Address (y=535 filling)
            page.drawText("(13) Residential Address", { x: 50, y: 560, size: 10, font: fontBold });
            drawField(page, font, "Flat / Room", 75, 530, 150, 20);
            drawField(page, font, "Floor", 295, 530, 80, 20);
            drawField(page, font, "Block", 395, 530, 80, 20);
            drawField(page, font, "Building / Estate", 75, 495, 400, 20); // y=535-35=500 filling
            drawField(page, font, "Street", 75, 460, 400, 20); // y=535-70=465 filling

            page.drawText("[ ] Hong Kong   [ ] Kowloon   [ ] New Territories", { x: 280, y: 430, size: 10, font });
        }

        // Page 6: Investment Mandate (Grid)
        if (i === 5) {
            drawHeader(page, fontBold, "C. INVESTMENT MANDATE");
            
            // Draw Table Header
            const startY = 600;
            page.drawRectangle({ x: 40, y: startY, width: 515, height: 30, color: rgb(0.9, 0.95, 1) });
            page.drawText("Name of Constituent Fund", { x: 50, y: startY + 10, size: 10, font: fontBold });
            page.drawText("Allocation %", { x: 380, y: startY + 10, size: 10, font: fontBold });

            // Draw Rows matching ENROLLMENT_FUND_COORDS
            // 'Global Stable Fund': 562, ... 'Age 65 Plus Fund': 341
            const funds = [
                { n: "Global Stable Fund", y: 562 },
                { n: "Global Growth Fund", y: 545 },
                { n: "Guaranteed Fund", y: 528 },
                { n: "MPF Conservative Fund", y: 511 },
                { n: "Global Equity Fund", y: 494 },
                { n: "Global Bond Fund", y: 477 },
                { n: "Asian Bond Fund", y: 460 },
                { n: "Asian Pacific Equity Fund", y: 443 },
                { n: "US Equity Fund", y: 426 },
                { n: "European Equity Fund", y: 409 },
                { n: "Hong Kong Equities Fund", y: 392 },
                { n: "Greater China Equity Fund", y: 375 },
                { n: "Core Accumulation Fund", y: 358 },
                { n: "Age 65 Plus Fund", y: 341 }
            ];

            funds.forEach(f => {
                page.drawText(f.n, { x: 50, y: f.y, size: 9, font });
                page.drawLine({ start: { x: 40, y: f.y - 2 }, end: { x: 555, y: f.y - 2 }, color: rgb(0.9, 0.9, 0.9), thickness: 1 });
                // Draw Box for percentage
                page.drawRectangle({ x: 370, y: f.y - 2, width: 50, height: 14, borderColor: rgb(0.8,0.8,0.8), borderWidth: 1 });
            });

            page.drawText("Total: 100%", { x: 370, y: 300, size: 10, font: fontBold });
        }
    }

    return pdfDoc;
};

export const createTransferFormTemplate = async (): Promise<PDFDocument> => {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Create 11 pages as per OCR
    for (let i = 0; i < 11; i++) {
        const page = pdfDoc.addPage([595, 842]);
        page.drawText(`${i + 1} of 11 PM-25V5`, { x: 500, y: 20, size: 8, font });

        // Page 1: Header & Personal
        if (i === 0) {
            drawHeader(page, fontBold, "SCHEME MEMBER'S REQUEST", "FOR FUND TRANSFER FORM [ FORM MPF(S) - P(M) ]");
            
            page.drawText("A. SCHEME MEMBER'S DETAILS", { x: 50, y: 350, size: 12, font: fontBold });
            drawField(page, font, "Surname in English", 115, 280, 180, 20); // y=285 filling
            drawField(page, font, "Given Name in English", 315, 280, 200, 20);
            
            page.drawText("Identification", { x: 50, y: 230, size: 10, font: fontBold });
            page.drawText("[ ] HKID Card", { x: 60, y: 205, size: 10, font });
            page.drawText("[ ] Passport", { x: 240, y: 205, size: 10, font });
            drawField(page, font, "No.", 255, 170, 200, 20); // y=175 filling
        }

        // Page 2: Contact & Transfer From
        if (i === 1) {
            // Contact (y=750 filling)
            page.drawText("Contact Details", { x: 50, y: 780, size: 11, font: fontBold });
            drawField(page, font, "Mobile Phone No.", 355, 745, 150, 20);

            // Address (y=640 filling)
            page.drawText("Correspondence Address", { x: 50, y: 700, size: 11, font: fontBold });
            drawField(page, font, "Flat/Room", 145, 635, 150, 20);
            drawField(page, font, "Floor", 325, 635, 100, 20);
            drawField(page, font, "Block", 445, 635, 100, 20);
            drawField(page, font, "Building", 145, 600, 300, 20);
            drawField(page, font, "Street", 145, 565, 300, 20);
            drawField(page, font, "District", 145, 530, 300, 20);

            // Transfer Info
            page.drawText("B. TRANSFER INFORMATION", { x: 50, y: 480, size: 12, font: fontBold });
            drawField(page, font, "Name of Original Scheme", 215, 435, 300, 20); // y=440 filling
            
            page.drawText("Type of Account", { x: 50, y: 410, size: 10, font });
            page.drawText("[ ] Personal Account   [ ] Contribution Account", { x: 180, y: 410, size: 10, font });
            
            drawField(page, font, "Member Account No.", 215, 380, 300, 20); // y=385 filling
        }

        // Page 3: Transfer Option (y=555 filling)
        if (i === 2) {
            drawHeader(page, fontBold, "C. TRANSFER OPTIONS");
            page.drawText("[ ] (i) To my contribution account with new employer", { x: 60, y: 650, size: 10, font });
            page.drawText("[ ] (ii) To my designated account in new scheme", { x: 60, y: 555, size: 10, font });
            
            drawField(page, font, "Name of New Trustee", 215, 525, 300, 20); // y=530 filling
            drawField(page, font, "Name of New Scheme", 215, 495, 300, 20); // y=500 filling
        }
    }

    return pdfDoc;
};
