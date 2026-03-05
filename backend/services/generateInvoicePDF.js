import PDFDocument from "pdfkit";

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

export const generateInvoicePDF = ({
  billId,
  shopName,
  shopAddress,
  shopPhone,
  customerName,
  customerEmail,
  paymentMethod,
  currency = "INR",
  items = [],
  totalAmount = 0,
  date,
  logoPath = null,
}) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });

      const buffers = [];
      doc.on("data", (d) => buffers.push(d));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      /* ================= CONVERT ================= */

      const convertCurrency = (amountINR) => {
        const rate = rates[currency] ?? 1;
        return amountINR * rate;
      };

      const formatCurrency = (amountINR) => {
        const converted = convertCurrency(amountINR);

        return `${symbolMap[currency]} ${converted.toLocaleString(
          localeMap[currency],
          { minimumFractionDigits: 2 }
        )}`;
      };

      /* ================= LOGO ================= */

      if (logoPath) {
        try {
          doc.image(logoPath, 50, 45, { width: 60 });
        } catch {
          console.warn("Logo not found");
        }
      }

      /* ================= HEADER ================= */

      doc
        .fontSize(22)
        .font("Helvetica-Bold")
        .text(shopName || "ISMA Billing System", {
          align: "center",
        });

      doc.moveDown(0.3);

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(shopAddress || "Store Address", {
          align: "center",
        });

      doc.text(`Phone: ${shopPhone || "-"}`, {
        align: "center",
      });

      doc.moveDown(1.5);

      /* ================= TITLE ================= */

      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .text("INVOICE", { align: "center" });

      doc.moveDown();

      const invoiceDate = date || new Date().toLocaleDateString("en-IN");

      doc
        .fontSize(11)
        .font("Helvetica")
        .text(`Invoice ID: ${billId}`)
        .text(`Date: ${invoiceDate}`)
        .text(`Customer: ${customerName || "Walk-in Customer"}`)
        .text(`Email: ${customerEmail || "-"}`)
        .text(`Payment Method: ${paymentMethod || "Cash"}`);

      doc.moveDown(1.5);

      /* ================= TABLE SETUP ================= */

      const tableTop = doc.y;

      const productX = 50;
      const qtyX = 330;
      const priceX = 380;
      const totalX = 460;

      const rowHeight = 22;

      /* ================= TABLE HEADER ================= */

      doc.font("Helvetica-Bold");

      doc.text("Product", productX, tableTop);
      doc.text("Qty", qtyX, tableTop, { width: 40, align: "right" });
      doc.text("Unit Price", priceX, tableTop, { width: 70, align: "right" });
      doc.text("Total", totalX, tableTop, { width: 80, align: "right" });

      doc
        .moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke();

      /* ================= TABLE ROWS ================= */

      doc.font("Helvetica");

      let y = tableTop + 25;
      let calculatedTotal = 0;

      items.forEach((item) => {
        const unitPrice =
          item?.priceINR ??
          item?.unitPrice ??
          item?.price ??
          0;

        const total =
          item?.totalPrice ??
          item.quantity * unitPrice;

        calculatedTotal += total;

        /* PRODUCT NAME WRAPPING */

        const productHeight = doc.heightOfString(item.name, {
          width: 260,
        });

        const currentRowHeight = Math.max(productHeight, rowHeight);

        doc.text(item.name, productX, y, {
          width: 260,
        });

        doc.text(item.quantity.toString(), qtyX, y, {
          width: 40,
          align: "right",
        });

        doc.text(formatCurrency(unitPrice), priceX, y, {
          width: 70,
          align: "right",
        });

        doc.text(formatCurrency(total), totalX, y, {
          width: 80,
          align: "right",
        });

        /* GRID LINE */

        doc
          .moveTo(50, y + currentRowHeight)
          .lineTo(550, y + currentRowHeight)
          .strokeColor("#eeeeee")
          .stroke();

        y += currentRowHeight + 5;
      });

      doc.moveDown();

      /* ================= TOTAL ================= */

      const finalTotal = totalAmount || calculatedTotal;

      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .text(`Grand Total: ${formatCurrency(finalTotal)}`, {
          align: "right",
        });

      doc.moveDown(2);

      /* ================= FOOTER ================= */

      doc
        .font("Helvetica")
        .fontSize(11)
        .text("Thank you for shopping with us!", {
          align: "center",
        });

      doc.moveDown(0.5);

      doc
        .fontSize(9)
        .fillColor("gray")
        .text("Generated by ISMA Billing System", {
          align: "center",
        });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
  
};