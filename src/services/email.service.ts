import { Resend } from 'resend';
import { config } from '../config/env';

export class EmailService {
  private resend: Resend;
  private fromEmail: string;
  private companyName: string;

  constructor() {
    this.resend = new Resend(config.resendApiKey);
    this.fromEmail = config.fromEmail || 'onboarding@resend.dev';
    this.companyName = config.companyName || 'Invoice CRM';
  }

  /**
   * Send invoice email to customer with PDF attachment
   */
  async sendInvoice(
    invoice: any,
    customer: any,
    pdfBuffer: Buffer
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Load email template
      const template = this.getInvoiceEmailTemplate(invoice, customer);

      // Send email with Resend
      const result = await this.resend.emails.send({
        from: `${this.companyName} <${this.fromEmail}>`,
        to: customer.email,
        subject: `Invoice ${invoice.invoiceNumber} from ${this.companyName}`,
        html: template,
        attachments: [
          {
            filename: `invoice-${invoice.invoiceNumber}.pdf`,
            content: pdfBuffer,
          },
        ],
      });

      if (result.error) {
        console.error('Resend error:', result.error);
        return { success: false, error: result.error.message };
      }

      console.log('Email sent successfully:', result.data?.id);
      return { success: true, messageId: result.data?.id };
    } catch (error: any) {
      console.error('Failed to send invoice email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send payment reminder email
   */
  async sendPaymentReminder(
    invoice: any,
    customer: any
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const template = this.getPaymentReminderTemplate(invoice, customer);

      const result = await this.resend.emails.send({
        from: `${this.companyName} <${this.fromEmail}>`,
        to: customer.email,
        subject: `Payment Reminder: Invoice ${invoice.invoiceNumber}`,
        html: template,
      });

      if (result.error) {
        console.error('Resend error:', result.error);
        return { success: false, error: result.error.message };
      }

      console.log('Payment reminder sent successfully:', result.data?.id);
      return { success: true, messageId: result.data?.id };
    } catch (error: any) {
      console.error('Failed to send payment reminder:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get invoice email HTML template
   */
  private getInvoiceEmailTemplate(invoice: any, customer: any): string {
    const dueDate = new Date(invoice.dueDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const amount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(invoice.total);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoiceNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Invoice</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">${this.companyName}</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333;">Hi ${customer.name},</p>
              
              <p style="margin: 0 0 30px 0; font-size: 16px; color: #666666; line-height: 1.6;">
                Thank you for your business! Please find your invoice attached to this email.
              </p>
              
              <!-- Invoice Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <tr>
                  <td>
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="font-size: 14px; color: #666666;">Invoice Number:</td>
                        <td style="font-size: 14px; color: #333333; font-weight: bold; text-align: right;">${invoice.invoiceNumber}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: #666666;">Amount Due:</td>
                        <td style="font-size: 18px; color: #667eea; font-weight: bold; text-align: right;">${amount}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: #666666;">Due Date:</td>
                        <td style="font-size: 14px; color: #333333; font-weight: bold; text-align: right;">${dueDate}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              ${
                invoice.notes
                  ? `
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 30px; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #856404;"><strong>Note:</strong> ${invoice.notes}</p>
              </div>
              `
                  : ''
              }
              
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #666666; line-height: 1.6;">
                If you have any questions about this invoice, please don't hesitate to contact us.
              </p>
              
              <p style="margin: 0; font-size: 16px; color: #333333;">
                Best regards,<br>
                <strong>${this.companyName}</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; font-size: 12px; color: #999999;">
                This is an automated email. Please do not reply directly to this message.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  /**
   * Get payment reminder email HTML template
   */
  private getPaymentReminderTemplate(invoice: any, customer: any): string {
    const dueDate = new Date(invoice.dueDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const amount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(invoice.total);

    const isOverdue = new Date(invoice.dueDate) < new Date();
    const daysPastDue = isOverdue
      ? Math.floor(
          (new Date().getTime() - new Date(invoice.dueDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Payment Reminder</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">${this.companyName}</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333;">Hi ${customer.name},</p>

              <p style="margin: 0 0 30px 0; font-size: 16px; color: #666666; line-height: 1.6;">
                ${
                  isOverdue
                    ? `This is a friendly reminder that invoice <strong>${invoice.invoiceNumber}</strong> is now <strong>${daysPastDue} day${daysPastDue > 1 ? 's' : ''} overdue</strong>.`
                    : `This is a friendly reminder that invoice <strong>${invoice.invoiceNumber}</strong> is due soon.`
                }
              </p>

              <!-- Invoice Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${isOverdue ? '#fff5f5' : '#f8f9fa'}; border-radius: 8px; padding: 20px; margin-bottom: 30px; border: 2px solid ${isOverdue ? '#fc8181' : '#e9ecef'};">
                <tr>
                  <td>
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="font-size: 14px; color: #666666;">Invoice Number:</td>
                        <td style="font-size: 14px; color: #333333; font-weight: bold; text-align: right;">${invoice.invoiceNumber}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: #666666;">Amount Due:</td>
                        <td style="font-size: 18px; color: ${isOverdue ? '#e53e3e' : '#667eea'}; font-weight: bold; text-align: right;">${amount}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: #666666;">Due Date:</td>
                        <td style="font-size: 14px; color: ${isOverdue ? '#e53e3e' : '#333333'}; font-weight: bold; text-align: right;">${dueDate}</td>
                      </tr>
                      ${
                        isOverdue
                          ? `
                      <tr>
                        <td style="font-size: 14px; color: #666666;">Days Overdue:</td>
                        <td style="font-size: 14px; color: #e53e3e; font-weight: bold; text-align: right;">${daysPastDue} day${daysPastDue > 1 ? 's' : ''}</td>
                      </tr>
                      `
                          : ''
                      }
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 20px 0; font-size: 16px; color: #666666; line-height: 1.6;">
                Please arrange payment at your earliest convenience. If you have already made the payment, please disregard this reminder.
              </p>

              <p style="margin: 0 0 20px 0; font-size: 16px; color: #666666; line-height: 1.6;">
                If you have any questions or concerns, please don't hesitate to contact us.
              </p>

              <p style="margin: 0; font-size: 16px; color: #333333;">
                Best regards,<br>
                <strong>${this.companyName}</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; font-size: 12px; color: #999999;">
                This is an automated email. Please do not reply directly to this message.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }
}

export const emailService = new EmailService();
