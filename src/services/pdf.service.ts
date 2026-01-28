import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { config } from '../config/env';

export class PDFService {
  private ensureStorageDirectory() {
    if (!fs.existsSync(config.pdfStoragePath)) {
      fs.mkdirSync(config.pdfStoragePath, { recursive: true });
    }
  }

  private formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }

  private formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  private getStatusColor(status: string): string {
    switch (status) {
      case 'PAID':
        return '#10b981'; // green
      case 'SENT':
        return '#3b82f6'; // blue
      case 'OVERDUE':
        return '#ef4444'; // red
      case 'DRAFT':
        return '#6b7280'; // gray
      default:
        return '#6b7280';
    }
  }

  async generateInvoicePDF(invoice: any): Promise<string> {
    this.ensureStorageDirectory();

    const fileName = `invoice-${invoice.invoiceNumber}.pdf`;
    const filePath = path.join(config.pdfStoragePath, fileName);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4',
        info: {
          Title: `Invoice ${invoice.invoiceNumber}`,
          Author: invoice.tenant?.name || 'Invoice CRM',
          Subject: `Invoice for ${invoice.customer.name}`,
          Keywords: 'invoice, billing',
        },
      });
      const stream = fs.createWriteStream(filePath);

      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);

      doc.pipe(stream);

      // Colors
      const primaryColor = '#1e40af';
      const grayColor = '#6b7280';
      const lightGrayColor = '#f3f4f6';

      // Header with company info on left, invoice details on right
      doc
        .fontSize(24)
        .fillColor(primaryColor)
        .text(invoice.tenant?.name || 'Your Company', 50, 50)
        .fontSize(10)
        .fillColor(grayColor)
        .text(invoice.tenant?.email || '', 50, 80)
        .text(invoice.tenant?.phone || '', 50, 95)
        .text(invoice.tenant?.address || '', 50, 110);

      // Invoice title and details on the right
      doc
        .fontSize(28)
        .fillColor(primaryColor)
        .text('INVOICE', 400, 50, { align: 'right' })
        .fontSize(10)
        .fillColor(grayColor)
        .text(`Invoice #: ${invoice.invoiceNumber}`, 400, 85, { align: 'right' })
        .text(`Issue Date: ${this.formatDate(invoice.issueDate)}`, 400, 100, {
          align: 'right',
        })
        .text(`Due Date: ${this.formatDate(invoice.dueDate)}`, 400, 115, {
          align: 'right',
        });

      // Status badge
      const statusColor = this.getStatusColor(invoice.status);
      doc
        .fillColor(statusColor)
        .fontSize(10)
        .text(invoice.status, 400, 135, { align: 'right' });

      // Horizontal line separator
      doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, 160).lineTo(545, 160).stroke();

      // Bill To section
      doc
        .fontSize(12)
        .fillColor(primaryColor)
        .text('BILL TO', 50, 180)
        .fontSize(11)
        .fillColor('#000000')
        .text(invoice.customer.name, 50, 200)
        .fontSize(10)
        .fillColor(grayColor)
        .text(invoice.customer.email, 50, 215);

      if (invoice.customer.phone) {
        doc.text(invoice.customer.phone, 50, 230);
      }

      const addressParts = [
        invoice.customer.address,
        invoice.customer.city,
        invoice.customer.state,
        invoice.customer.zipCode,
      ].filter(Boolean);

      if (addressParts.length > 0) {
        doc.text(addressParts.join(', '), 50, invoice.customer.phone ? 245 : 230, {
          width: 250,
        });
      }

      // Items table
      const tableTop = 300;

      // Table header background
      doc.fillColor(lightGrayColor).rect(50, tableTop, 495, 25).fill();

      // Table header text
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('#000000')
        .text('DESCRIPTION', 60, tableTop + 8)
        .text('QTY', 340, tableTop + 8, { width: 50, align: 'center' })
        .text('UNIT PRICE', 400, tableTop + 8, { width: 70, align: 'right' })
        .text('AMOUNT', 480, tableTop + 8, { width: 55, align: 'right' })
        .font('Helvetica');

      // Table items
      let yPosition = tableTop + 35;
      const itemsPerPage = 15;
      let itemCount = 0;

      invoice.items.forEach((item: any, index: number) => {
        // Add new page if needed
        if (itemCount >= itemsPerPage) {
          doc.addPage();
          yPosition = 50;
          itemCount = 0;
        }

        // Alternate row background
        if (index % 2 === 0) {
          doc
            .fillColor('#fafafa')
            .rect(50, yPosition - 5, 495, 25)
            .fill();
        }

        doc
          .fontSize(10)
          .fillColor('#000000')
          .text(item.description, 60, yPosition, { width: 270 })
          .text(item.quantity.toString(), 340, yPosition, { width: 50, align: 'center' })
          .text(this.formatCurrency(item.unitPrice), 400, yPosition, {
            width: 70,
            align: 'right',
          })
          .text(this.formatCurrency(item.amount), 480, yPosition, {
            width: 55,
            align: 'right',
          });

        yPosition += 25;
        itemCount++;
      });

      // Totals section
      yPosition += 20;

      // Totals box background
      const totalsBoxTop = yPosition;
      doc.fillColor('#f9fafb').rect(350, totalsBoxTop, 195, 110).fill();

      yPosition += 15;

      // Subtotal
      doc
        .fontSize(10)
        .fillColor('#000000')
        .text('Subtotal:', 360, yPosition)
        .text(this.formatCurrency(invoice.subtotal), 480, yPosition, {
          width: 55,
          align: 'right',
        });

      yPosition += 20;

      // Tax
      doc
        .text('Tax:', 360, yPosition)
        .text(this.formatCurrency(invoice.tax), 480, yPosition, {
          width: 55,
          align: 'right',
        });

      yPosition += 20;

      // Discount
      if (invoice.discount > 0) {
        doc
          .text('Discount:', 360, yPosition)
          .text(`-${this.formatCurrency(invoice.discount)}`, 480, yPosition, {
            width: 55,
            align: 'right',
          });
        yPosition += 20;
      }

      // Separator line
      doc
        .strokeColor('#d1d5db')
        .lineWidth(1)
        .moveTo(360, yPosition)
        .lineTo(535, yPosition)
        .stroke();

      yPosition += 15;

      // Total
      doc
        .font('Helvetica-Bold')
        .fontSize(14)
        .fillColor(primaryColor)
        .text('TOTAL:', 360, yPosition)
        .text(this.formatCurrency(invoice.total), 480, yPosition, {
          width: 55,
          align: 'right',
        })
        .font('Helvetica')
        .fillColor('#000000');

      // Notes section
      if (invoice.notes) {
        yPosition += 60;

        // Check if we need a new page
        if (yPosition > doc.page.height - 150) {
          doc.addPage();
          yPosition = 50;
        }

        doc
          .fontSize(11)
          .fillColor(primaryColor)
          .text('NOTES', 50, yPosition)
          .fontSize(10)
          .fillColor(grayColor)
          .text(invoice.notes, 50, yPosition + 20, { width: 495, align: 'left' });
      }

      // Payment information
      const paymentInfoY = doc.page.height - 120;
      doc
        .fontSize(10)
        .fillColor(primaryColor)
        .text('PAYMENT INFORMATION', 50, paymentInfoY)
        .fontSize(9)
        .fillColor(grayColor)
        .text('Please make payment by the due date.', 50, paymentInfoY + 20)
        .text(
          'For questions about this invoice, please contact ' +
            (invoice.tenant?.email || 'us') +
            '.',
          50,
          paymentInfoY + 35
        );

      // Footer
      doc
        .fontSize(8)
        .fillColor('#9ca3af')
        .text(
          `Generated on ${this.formatDate(new Date())} | Invoice ${invoice.invoiceNumber}`,
          50,
          doc.page.height - 50,
          { align: 'center', width: 495 }
        )
        .text('Thank you for your business!', 50, doc.page.height - 35, {
          align: 'center',
          width: 495,
        });

      doc.end();
    });
  }

  /**
   * Generate invoice PDF and return as Buffer (for email attachments)
   */
  async generateInvoicePDFBuffer(invoice: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4',
        info: {
          Title: `Invoice ${invoice.invoiceNumber}`,
          Author: invoice.tenant?.name || 'Invoice CRM',
          Subject: `Invoice for ${invoice.customer.name}`,
          Keywords: 'invoice, billing',
        },
      });

      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Primary brand color
      const primaryColor = '#667eea';
      const grayColor = '#718096';
      const lightGray = '#e2e8f0';

      // Header with gradient background
      doc.rect(0, 0, doc.page.width, 150).fillAndStroke(primaryColor, primaryColor);

      // Company name
      doc
        .fontSize(28)
        .fillColor('#ffffff')
        .text(invoice.tenant?.name || 'Invoice CRM', 50, 40);

      // Invoice title
      doc.fontSize(16).fillColor('#ffffff').text('INVOICE', 50, 80);

      // Invoice number and date (right aligned)
      doc
        .fontSize(12)
        .fillColor('#ffffff')
        .text(`Invoice #: ${invoice.invoiceNumber}`, 350, 40, { align: 'right' });
      doc.text(`Date: ${this.formatDate(invoice.issueDate)}`, 350, 60, {
        align: 'right',
      });
      doc.text(`Due: ${this.formatDate(invoice.dueDate)}`, 350, 80, {
        align: 'right',
      });

      // Status badge
      const statusColors = this.getStatusColor(invoice.status);
      doc.fontSize(10).fillColor(statusColors.bg).rect(350, 100, 195, 25).fill();
      doc
        .fontSize(12)
        .fillColor(statusColors.text)
        .text(invoice.status, 350, 106, { align: 'center', width: 195 });

      // Reset position
      let yPos = 180;

      // Bill To section
      doc.fontSize(12).fillColor(grayColor).text('Bill To:', 50, yPos);
      yPos += 20;
      doc.fontSize(14).fillColor('#000000').text(invoice.customer.name, 50, yPos);
      yPos += 20;
      if (invoice.customer.email) {
        doc.fontSize(10).fillColor(grayColor).text(invoice.customer.email, 50, yPos);
        yPos += 15;
      }
      if (invoice.customer.phone) {
        doc.text(invoice.customer.phone, 50, yPos);
        yPos += 15;
      }
      if (invoice.customer.address) {
        doc.text(invoice.customer.address, 50, yPos, { width: 200 });
        yPos += 30;
      }

      // Company info (right side)
      let companyYPos = 180;
      doc
        .fontSize(12)
        .fillColor(grayColor)
        .text('From:', 350, companyYPos, { align: 'right' });
      companyYPos += 20;
      if (invoice.tenant?.email) {
        doc.fontSize(10).text(invoice.tenant.email, 350, companyYPos, { align: 'right' });
        companyYPos += 15;
      }
      if (invoice.tenant?.phone) {
        doc.text(invoice.tenant.phone, 350, companyYPos, { align: 'right' });
        companyYPos += 15;
      }
      if (invoice.tenant?.address) {
        doc.text(invoice.tenant.address, 350, companyYPos, {
          align: 'right',
          width: 195,
        });
      }

      yPos = Math.max(yPos, companyYPos) + 20;

      // Items table
      yPos += 20;

      // Table header
      doc.rect(50, yPos, 495, 25).fillAndStroke(lightGray, lightGray);
      doc
        .fontSize(10)
        .fillColor('#000000')
        .text('Description', 60, yPos + 8);
      doc.text('Qty', 320, yPos + 8, { width: 50, align: 'center' });
      doc.text('Price', 380, yPos + 8, { width: 70, align: 'right' });
      doc.text('Amount', 460, yPos + 8, { width: 75, align: 'right' });

      yPos += 25;

      // Table rows
      invoice.items?.forEach((item: any, index: number) => {
        if (index % 2 === 0) {
          doc.rect(50, yPos, 495, 25).fillAndStroke('#f7fafc', '#f7fafc');
        }

        doc
          .fontSize(10)
          .fillColor('#000000')
          .text(item.description, 60, yPos + 8, { width: 250 });
        doc.text(item.quantity.toString(), 320, yPos + 8, {
          width: 50,
          align: 'center',
        });
        doc.text(this.formatCurrency(item.unitPrice), 380, yPos + 8, {
          width: 70,
          align: 'right',
        });
        doc.text(this.formatCurrency(item.quantity * item.unitPrice), 460, yPos + 8, {
          width: 75,
          align: 'right',
        });

        yPos += 25;
      });

      // Totals section
      yPos += 20;

      // Subtotal
      doc
        .fontSize(10)
        .fillColor(grayColor)
        .text('Subtotal:', 380, yPos, { width: 70, align: 'right' });
      doc.fillColor('#000000').text(this.formatCurrency(invoice.subtotal), 460, yPos, {
        width: 75,
        align: 'right',
      });
      yPos += 20;

      // Tax
      if (invoice.tax > 0) {
        doc.fillColor(grayColor).text('Tax:', 380, yPos, { width: 70, align: 'right' });
        doc.fillColor('#000000').text(this.formatCurrency(invoice.tax), 460, yPos, {
          width: 75,
          align: 'right',
        });
        yPos += 20;
      }

      // Discount
      if (invoice.discount > 0) {
        doc
          .fillColor(grayColor)
          .text('Discount:', 380, yPos, { width: 70, align: 'right' });
        doc
          .fillColor('#000000')
          .text(`-${this.formatCurrency(invoice.discount)}`, 460, yPos, {
            width: 75,
            align: 'right',
          });
        yPos += 20;
      }

      // Total (highlighted)
      doc.rect(350, yPos, 195, 30).fillAndStroke(primaryColor, primaryColor);
      doc
        .fontSize(12)
        .fillColor('#ffffff')
        .text('Total:', 380, yPos + 8, { width: 70, align: 'right' });
      doc.fontSize(14).text(this.formatCurrency(invoice.total), 460, yPos + 8, {
        width: 75,
        align: 'right',
      });

      yPos += 50;

      // Notes section
      if (invoice.notes) {
        doc.fontSize(10).fillColor(grayColor).text('Notes:', 50, yPos);
        yPos += 15;
        doc
          .fontSize(10)
          .fillColor('#000000')
          .text(invoice.notes, 50, yPos, { width: 495 });
        yPos += 40;
      }

      // Footer
      doc
        .fontSize(8)
        .fillColor(grayColor)
        .text(
          `Generated on ${new Date().toLocaleDateString()}`,
          50,
          doc.page.height - 50,
          { align: 'center', width: 495 }
        )
        .text('Thank you for your business!', 50, doc.page.height - 35, {
          align: 'center',
          width: 495,
        });

      doc.end();
    });
  }
}

export const pdfService = new PDFService();
