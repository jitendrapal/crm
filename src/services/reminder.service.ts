import prisma from '../lib/prisma';
import { emailService } from './email.service';

export class ReminderService {
  /**
   * Check all invoices and send automated reminders based on due dates
   */
  async checkAndSendReminders(): Promise<{
    checked: number;
    sent: number;
    errors: number;
  }> {
    console.log('🔔 Starting automated reminder check...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day for accurate comparison

    let checked = 0;
    let sent = 0;
    let errors = 0;

    try {
      // Get all unpaid invoices (SENT or OVERDUE status)
      const invoices = await prisma.invoice.findMany({
        where: {
          status: { in: ['SENT', 'OVERDUE'] },
        },
        include: {
          customer: true,
          reminderLogs: true,
        },
      });

      console.log(`📊 Found ${invoices.length} unpaid invoices to check`);
      checked = invoices.length;

      for (const invoice of invoices) {
        try {
          const dueDate = new Date(invoice.dueDate);
          dueDate.setHours(0, 0, 0, 0);

          // Calculate days difference (negative = before due, positive = after due)
          const daysDiff = Math.floor(
            (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          console.log(
            `📅 Invoice ${invoice.invoiceNumber}: Due date ${dueDate.toDateString()}, Days diff: ${daysDiff}`
          );

          // Determine which reminder to send
          let reminderType: string | null = null;

          if (daysDiff === -7) {
            reminderType = 'BEFORE_DUE';
          } else if (daysDiff === 0) {
            reminderType = 'ON_DUE';
          } else if (daysDiff === 3) {
            reminderType = 'OVERDUE_3';
          } else if (daysDiff === 7) {
            reminderType = 'OVERDUE_7';
          } else if (daysDiff === 14) {
            reminderType = 'OVERDUE_14';
          }

          if (reminderType) {
            const wasSent = await this.sendReminder(invoice, reminderType);
            if (wasSent) sent++;
          }
        } catch (error) {
          console.error(
            `❌ Error processing invoice ${invoice.invoiceNumber}:`,
            error
          );
          errors++;
        }
      }

      console.log(
        `✅ Reminder check complete: ${checked} checked, ${sent} sent, ${errors} errors`
      );
      return { checked, sent, errors };
    } catch (error) {
      console.error('❌ Error in checkAndSendReminders:', error);
      throw error;
    }
  }

  /**
   * Send a specific reminder for an invoice
   */
  private async sendReminder(
    invoice: any,
    reminderType: string
  ): Promise<boolean> {
    try {
      // Check if this reminder was already sent
      const existingLog = invoice.reminderLogs?.find(
        (log: any) => log.reminderType === reminderType
      );

      if (existingLog) {
        console.log(
          `⏭️  Skipping ${reminderType} for ${invoice.invoiceNumber} - already sent on ${existingLog.sentAt}`
        );
        return false;
      }

      // Send the reminder email
      console.log(
        `📧 Sending ${reminderType} reminder for invoice ${invoice.invoiceNumber} to ${invoice.customer.email}`
      );

      const emailResult = await emailService.sendPaymentReminder(
        invoice,
        invoice.customer
      );

      if (!emailResult.success) {
        console.error(
          `❌ Failed to send reminder for ${invoice.invoiceNumber}:`,
          emailResult.error
        );
        return false;
      }

      // Log the reminder
      await prisma.reminderLog.create({
        data: {
          invoiceId: invoice.id,
          reminderType,
        },
      });

      console.log(
        `✅ Successfully sent ${reminderType} reminder for ${invoice.invoiceNumber}`
      );
      return true;
    } catch (error) {
      console.error(
        `❌ Error sending reminder for ${invoice.invoiceNumber}:`,
        error
      );
      return false;
    }
  }

  /**
   * Get reminder history for an invoice
   */
  async getReminderHistory(invoiceId: string) {
    return prisma.reminderLog.findMany({
      where: { invoiceId },
      orderBy: { sentAt: 'desc' },
    });
  }
}

export const reminderService = new ReminderService();

