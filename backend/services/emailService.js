import nodemailer from "nodemailer";
import { generateInvoicePDF } from "./generateInvoicePDF.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendInvoiceEmail = async ({
  to,
  billId,
  items,
  totalAmount,
  shopName,
  shopAddress,
  shopPhone,
  customerName,
  paymentMethod,
}) => {
  try {
    const date = new Date().toLocaleDateString("en-IN");

    /* FORMAT ITEMS FOR EMAIL + PDF */
    const formattedItems = items.map((i) => {
      const price = i.priceINR ?? i.unitPrice ?? i.price ?? 0;

      return {
        name: i.name,
        quantity: i.quantity,
        unitPrice: price,
        totalPrice: price * i.quantity,
      };
    });

    const itemRows = formattedItems
      .map(
        (i) => `
        <tr>
          <td>${i.name}</td>
          <td>${i.quantity}</td>
          <td>₹${i.unitPrice}</td>
          <td>₹${i.totalPrice}</td>
        </tr>
      `
      )
      .join("");

    const htmlContent = `
    <div style="font-family:Arial;padding:20px">

    <h2 style="text-align:center">${shopName}</h2>

    <p><b>Invoice ID:</b> ${billId}</p>
    <p><b>Date:</b> ${date}</p>
    <p><b>Customer:</b> ${customerName || "Walk-in Customer"}</p>

    <table border="1" cellpadding="8" cellspacing="0" style="width:100%;border-collapse:collapse">
    
    <thead>
    <tr style="background:#f3f3f3">
    <th>Product</th>
    <th>Qty</th>
    <th>Unit Price</th>
    <th>Total</th>
    </tr>
    </thead>

    <tbody>
    ${itemRows}
    </tbody>

    </table>

    <h3 style="text-align:right">Total: ₹${totalAmount}</h3>

    <p>Thank you for shopping with us.</p>

    </div>
    `;

    /* GENERATE PDF */
    const pdfBuffer = await generateInvoicePDF({
      billId,
      shopName,
      shopAddress,
      shopPhone,
      customerName,
      customerEmail: to,
      paymentMethod,
      items: formattedItems,
      totalAmount,
      date,
    });

    const mailOptions = {
      from: `"${shopName}" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Invoice #${billId}`,
      html: htmlContent,
      attachments: [
        {
          filename: `Invoice-${billId}.pdf`,
          content: pdfBuffer,
        },
      ],
    };

    console.log("📧 Sending invoice email to:", to);

    await transporter.sendMail(mailOptions);

    console.log("✅ Email sent with PDF!");
  } catch (error) {
    console.error("❌ Email error:", error);
  }
};