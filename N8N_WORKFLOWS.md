# n8n Webhook Workflows

This document explains how to set up n8n workflows to automate invoice and payment notifications.

## Prerequisites

1. Install n8n: `npm install -g n8n`
2. Start n8n: `n8n start`
3. Access n8n at: `http://localhost:5678`

## Webhook Events

The Invoice CRM system triggers three webhook events:

### 1. Invoice Created
**Webhook URL:** `http://localhost:5678/webhook/invoice-created`

**Payload:**
```json
{
  "event": "invoice.created",
  "timestamp": "2024-01-27T10:00:00Z",
  "data": {
    "invoiceId": "uuid",
    "invoiceNumber": "INV-2024-00001",
    "customerId": "uuid",
    "customerName": "Client Company",
    "customerEmail": "client@example.com",
    "total": 5500,
    "dueDate": "2024-02-27T00:00:00Z",
    "status": "DRAFT"
  }
}
```

### 2. Invoice Overdue
**Webhook URL:** `http://localhost:5678/webhook/invoice-overdue`

**Payload:**
```json
{
  "event": "invoice.overdue",
  "timestamp": "2024-01-27T10:00:00Z",
  "data": {
    "invoiceId": "uuid",
    "invoiceNumber": "INV-2024-00001",
    "customerId": "uuid",
    "customerName": "Client Company",
    "customerEmail": "client@example.com",
    "total": 5500,
    "dueDate": "2024-01-15T00:00:00Z",
    "daysOverdue": 12
  }
}
```

### 3. Payment Received
**Webhook URL:** `http://localhost:5678/webhook/payment-received`

**Payload:**
```json
{
  "event": "payment.received",
  "timestamp": "2024-01-27T10:00:00Z",
  "data": {
    "paymentId": "uuid",
    "invoiceId": "uuid",
    "invoiceNumber": "INV-2024-00001",
    "customerId": "uuid",
    "customerName": "Client Company",
    "customerEmail": "client@example.com",
    "amount": 5500,
    "paymentMethod": "BANK_TRANSFER",
    "paymentDate": "2024-01-27T10:00:00Z"
  }
}
```

## Example Workflows

### Workflow 1: Send Email When Invoice Created

**Steps:**
1. Create new workflow in n8n
2. Add "Webhook" node
   - Method: POST
   - Path: `invoice-created`
3. Add "Send Email" node (Gmail, SendGrid, etc.)
   - To: `{{ $json.data.customerEmail }}`
   - Subject: `New Invoice {{ $json.data.invoiceNumber }}`
   - Body:
     ```
     Dear {{ $json.data.customerName }},
     
     A new invoice has been created for your account.
     
     Invoice Number: {{ $json.data.invoiceNumber }}
     Amount: ${{ $json.data.total }}
     Due Date: {{ $json.data.dueDate }}
     
     Please log in to view and pay your invoice.
     
     Thank you!
     ```

### Workflow 2: Send Overdue Reminder

**Steps:**
1. Create new workflow
2. Add "Webhook" node
   - Path: `invoice-overdue`
3. Add "Send Email" node
   - To: `{{ $json.data.customerEmail }}`
   - Subject: `⚠️ Overdue Invoice {{ $json.data.invoiceNumber }}`
   - Body:
     ```
     Dear {{ $json.data.customerName }},
     
     This is a reminder that invoice {{ $json.data.invoiceNumber }} is now overdue.
     
     Amount Due: ${{ $json.data.total }}
     Days Overdue: {{ $json.data.daysOverdue }}
     
     Please arrange payment at your earliest convenience.
     
     Thank you!
     ```
4. (Optional) Add "Slack" node to notify your team
5. (Optional) Add "HTTP Request" node to update CRM

### Workflow 3: Payment Confirmation

**Steps:**
1. Create new workflow
2. Add "Webhook" node
   - Path: `payment-received`
3. Add "Send Email" node
   - To: `{{ $json.data.customerEmail }}`
   - Subject: `✅ Payment Received - {{ $json.data.invoiceNumber }}`
   - Body:
     ```
     Dear {{ $json.data.customerName }},
     
     We have received your payment!
     
     Invoice Number: {{ $json.data.invoiceNumber }}
     Amount Paid: ${{ $json.data.amount }}
     Payment Method: {{ $json.data.paymentMethod }}
     Payment Date: {{ $json.data.paymentDate }}
     
     Thank you for your business!
     ```
4. Add "Slack" node to notify accounting team
5. (Optional) Add "Google Sheets" node to log payment

### Workflow 4: Multi-Channel Notification

**Steps:**
1. Webhook trigger (any event)
2. Add "Switch" node to route based on event type
3. For each event type:
   - Send Email
   - Post to Slack
   - Log to Google Sheets
   - Update Airtable/Notion
   - Send SMS (Twilio)

## Advanced Automation Ideas

### 1. Automated Follow-ups
- Send reminder 7 days before due date
- Send reminder on due date
- Send overdue notice 3, 7, 14 days after due date

### 2. Team Notifications
- Notify sales team when invoice is created
- Notify accounting when payment received
- Alert management for large invoices

### 3. Data Synchronization
- Sync invoices to Google Sheets
- Update CRM (HubSpot, Salesforce)
- Log to accounting software (QuickBooks)

### 4. Customer Segmentation
- Tag high-value customers
- Track payment patterns
- Identify at-risk accounts

### 5. Reporting
- Daily invoice summary
- Weekly payment report
- Monthly revenue dashboard

## Setting Up Webhooks in .env

After creating workflows in n8n, copy the webhook URLs:

```env
N8N_INVOICE_CREATED_WEBHOOK=http://localhost:5678/webhook/invoice-created
N8N_INVOICE_OVERDUE_WEBHOOK=http://localhost:5678/webhook/invoice-overdue
N8N_PAYMENT_RECEIVED_WEBHOOK=http://localhost:5678/webhook/payment-received
```

For production, use your n8n cloud URL or self-hosted domain:

```env
N8N_INVOICE_CREATED_WEBHOOK=https://your-n8n.com/webhook/invoice-created
N8N_INVOICE_OVERDUE_WEBHOOK=https://your-n8n.com/webhook/invoice-overdue
N8N_PAYMENT_RECEIVED_WEBHOOK=https://your-n8n.com/webhook/payment-received
```

## Testing Webhooks

### Using curl

```bash
# Test invoice created webhook
curl -X POST http://localhost:5678/webhook/invoice-created \
  -H "Content-Type: application/json" \
  -d '{
    "event": "invoice.created",
    "timestamp": "2024-01-27T10:00:00Z",
    "data": {
      "invoiceNumber": "INV-TEST-001",
      "customerName": "Test Customer",
      "customerEmail": "test@example.com",
      "total": 1000
    }
  }'
```

### From the Application

Create an invoice through the API and check n8n for the webhook execution.

## Troubleshooting

### Webhook Not Triggering
1. Check n8n is running: `http://localhost:5678`
2. Verify webhook URLs in `.env`
3. Check n8n workflow is activated
4. Review n8n execution logs

### Email Not Sending
1. Configure email credentials in n8n
2. Check spam folder
3. Verify email node configuration
4. Test with a simple workflow first

## Security Considerations

1. **Use HTTPS** in production
2. **Add webhook authentication** (API keys, signatures)
3. **Validate webhook payloads**
4. **Rate limit** webhook endpoints
5. **Monitor** for suspicious activity

## Resources

- n8n Documentation: https://docs.n8n.io
- n8n Community: https://community.n8n.io
- Workflow Templates: https://n8n.io/workflows

