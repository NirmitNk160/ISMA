import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendInvoiceEmail = async ({ to, billId, items, totalAmount }) => {
  const itemRows = items
    .map(
      (i) =>
        `<tr>
          <td>${i.name}</td>
          <td>${i.quantity}</td>
          <td>₹${i.unitPrice}</td>
          <td>₹${i.totalPrice}</td>
        </tr>`
    )
    .join("");

  const htmlContent = `
    <h2>Invoice - ${billId}</h2>
    <table border="1" cellpadding="6" cellspacing="0">
      <thead>
        <tr>
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
    <h3>Total: ₹${totalAmount}</h3>
    <p>Thank you for shopping with us!</p>
  `;

  console.log("Sending email to:", to);

  await transporter.sendMail({
    from: `"ISMA Billing" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Invoice ${billId}`,
    html: htmlContent,
  });
  console.log("Email sent successfully!");
};