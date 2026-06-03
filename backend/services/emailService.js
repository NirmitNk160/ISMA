import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import { generateInvoicePDF } from "./generateInvoicePDF.js";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/* ================= VERIFY SMTP ================= */
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP ERROR:", error);
  } else {
    console.log("SMTP READY");
  }
});

/* ================= CURRENCY DATA ================= */

const rates = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
};

const symbolMap = {
  INR: "Rs.",
  USD: "$",
  EUR: "€",
};

const localeMap = {
  INR: "en-IN",
  USD: "en-US",
  EUR: "de-DE",
};

/* ================= SEND EMAIL ================= */

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
  currency = "INR",
}) => {
  try {
    const date = new Date().toLocaleDateString("en-IN");

    /* ================= CONVERT ================= */

    const convertCurrency = (amountINR) => {
      const rate = rates[currency] ?? 1;
      return amountINR * rate;
    };

    /* ================= FORMAT ================= */

    const formatCurrency = (amountINR) => {
      const converted = convertCurrency(amountINR);

      return `${symbolMap[currency]} ${converted.toLocaleString(
        localeMap[currency],
        { minimumFractionDigits: 2 },
      )}`;
    };

    /* ================= FORMAT ITEMS ================= */

    const formattedItems = items.map((i) => {
      const price = i.priceINR ?? i.unitPrice ?? i.price ?? 0;

      return {
        name: i.name,
        quantity: i.quantity,
        unitPrice: price,
        totalPrice: price * i.quantity,
      };
    });

    /* ================= HTML TABLE ================= */

    const itemRows = formattedItems
      .map(
        (i) => `
        <tr>
          <td>${i.name}</td>
          <td>${i.quantity}</td>
          <td>${formatCurrency(i.unitPrice)}</td>
          <td>${formatCurrency(i.totalPrice)}</td>
        </tr>
      `,
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

    <h3 style="text-align:right">Total: ${formatCurrency(totalAmount)}</h3>

    <p>Thank you for shopping with us.</p>

    </div>
    `;

    /* ================= GENERATE PDF ================= */

    const pdfBuffer = await generateInvoicePDF({
      billId,
      shopName,
      shopAddress,
      shopPhone,
      customerName,
      customerEmail: to,
      paymentMethod,
      currency,
      items: formattedItems,
      totalAmount,
      date,
    });

    /* ================= EMAIL ================= */

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

/* ================= SEND OTP EMAIL ================= */

export const sendOTPEmail = async (email, otp) => {
  try {
    const htmlContent = `
    <div style="font-family:Arial;padding:20px">
      <h2>Email Verification</h2>
      <p>Your verification code for ISMA is:</p>
      <h1 style="letter-spacing:4px">${otp}</h1>
      <p>This OTP expires in 5 minutes.</p>
    </div>
    `;

    await transporter.sendMail({
      from: `"ISMA Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your email",
      html: htmlContent,
    });

    console.log("✅ OTP email sent");
  } catch (error) {
    console.error("OTP Email error:", error);
  }
};
