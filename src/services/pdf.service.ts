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

  async generateInvoicePDF(invoice: any): Promise<string> {
    this.ensureStorageDirectory();

    const fileName = `invoice-${invoice.invoiceNumber}.pdf`;
    const filePath = path.join(config.pdfStoragePath, fileName);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);

      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);

      doc.pipe(stream);

      // Header
      doc
        .fontSize(20)
        .text('INVOICE', 50, 50, { align: 'right' })
        .fontSize(10)
        .text(`Invoice #: ${invoice.invoiceNumber}`, { align: 'right' })
        .text(`Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, {
          align: 'right',
        })
        .text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, {
          align: 'right',
        })
        .moveDown();

      // Company Info (from tenant)
      doc
        .fontSize(12)
        .text(invoice.tenant?.name || 'Company Name', 50, 50)
        .fontSize(10)
        .text(invoice.tenant?.email || '', 50, 65)
        .text(invoice.tenant?.phone || '', 50, 80)
        .text(invoice.tenant?.address || '', 50, 95)
        .moveDown();

      // Customer Info
      doc
        .fontSize(12)
        .text('Bill To:', 50, 150)
        .fontSize(10)
        .text(invoice.customer.name, 50, 165)
        .text(invoice.customer.email, 50, 180)
        .text(invoice.customer.phone || '', 50, 195)
        .text(
          [
            invoice.customer.address,
            invoice.customer.city,
            invoice.customer.state,
            invoice.customer.zipCode,
          ]
            .filter(Boolean)
            .join(', '),
          50,
          210
        )
        .moveDown(2);

      // Table Header
      const tableTop = 280;
      doc
        .fontSize(10)
        .text('Description', 50, tableTop, { bold: true })
        .text('Qty', 300, tableTop)
        .text('Unit Price', 370, tableTop)
        .text('Amount', 470, tableTop, { align: 'right' });

      doc
        .moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke();

      // Table Items
      let yPosition = tableTop + 25;
      invoice.items.forEach((item: any) => {
        doc
          .fontSize(10)
          .text(item.description, 50, yPosition, { width: 240 })
          .text(item.quantity.toString(), 300, yPosition)
          .text(`$${item.unitPrice.toFixed(2)}`, 370, yPosition)
          .text(`$${item.amount.toFixed(2)}`, 470, yPosition, { align: 'right' });

        yPosition += 25;
      });

      // Totals
      yPosition += 20;
      doc
        .moveTo(50, yPosition)
        .lineTo(550, yPosition)
        .stroke();

      yPosition += 15;
      doc
        .fontSize(10)
        .text('Subtotal:', 370, yPosition)
        .text(`$${invoice.subtotal.toFixed(2)}`, 470, yPosition, { align: 'right' });

      yPosition += 20;
      doc
        .text('Tax:', 370, yPosition)
        .text(`$${invoice.tax.toFixed(2)}`, 470, yPosition, { align: 'right' });

      yPosition += 20;
      doc
        .text('Discount:', 370, yPosition)
        .text(`-$${invoice.discount.toFixed(2)}`, 470, yPosition, { align: 'right' });

      yPosition += 20;
      doc
        .fontSize(12)
        .text('Total:', 370, yPosition, { bold: true })
        .text(`$${invoice.total.toFixed(2)}`, 470, yPosition, {
          align: 'right',
          bold: true,
        });

      // Notes
      if (invoice.notes) {
        yPosition += 40;
        doc
          .fontSize(10)
          .text('Notes:', 50, yPosition)
          .fontSize(9)
          .text(invoice.notes, 50, yPosition + 15, { width: 500 });
      }

      // Footer
      doc
        .fontSize(8)
        .text(
          'Thank you for your business!',
          50,
          doc.page.height - 50,
          { align: 'center' }
        );

      doc.end();
    });
  }
}

export const pdfService = new PDFService();

