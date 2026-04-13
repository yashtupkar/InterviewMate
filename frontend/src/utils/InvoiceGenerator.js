import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { pricingPlans } from "../constants/pricing";

/**
 * Loads an image from a URL, applies rounded corners using a canvas,
 * and returns the result as a Base64 string.
 */
export const getRoundedImage = (url, borderRadiusRatio = 0.15) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const w = img.width;
        const h = img.height;
        
        const size = Math.min(w, h);
        const radius = size * borderRadiusRatio;

        canvas.width = w;
        canvas.height = h;

        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(w - radius, 0);
        ctx.quadraticCurveTo(w, 0, w, radius);
        ctx.lineTo(w, h - radius);
        ctx.quadraticCurveTo(w, h, w - radius, h);
        ctx.lineTo(radius, h);
        ctx.quadraticCurveTo(0, h, 0, h - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        
        ctx.clip();
        ctx.drawImage(img, 0, 0, w, h);
        
        resolve(canvas.toDataURL("image/png"));
      } catch (err) {
        console.warn("Error processing rounded image:", err);
        resolve(null);
      }
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = url;
  });
};

/**
 * Generates and downloads an invoice PDF for a given order.
 */
export const generateInvoicePDF = async (order, user = null) => {
  try {
    // Colors - Professional Grayscale
    const darkColor = [24, 24, 27];      // Zinc-900
    const grayColor = [82, 82, 91];      // Zinc-600
    const lightGray = [244, 244, 245];   // Zinc-100
    const blackColor = [0, 0, 0];

    const doc = new jsPDF("p", "mm", "a4");
    
    // Header Branding Line (Subtle Dark)
    doc.setFillColor(...darkColor);
    doc.rect(0, 0, 210, 1.5, "F");

    // ---------- LOGO ----------
    try {
      const logoUrl = "/assets/logo.png";
      const roundedLogo = await getRoundedImage(logoUrl, 0.1);
      if (roundedLogo) {
        // Reduced size (18x18)
        doc.addImage(roundedLogo, "PNG", 172, 10, 16, 16);
      }
    } catch (err) {
      console.warn("Could not load logo for invoice", err);
    }

    // ---------- BASIC DATA ----------
    const transactionId = order.razorpayPaymentId || order.razorpay_payment_id || order.id || order.razorpayOrderId || order.razorpay_order_id || "N/A";
    const createdDate = new Date(order.createdAt || Date.now());

    const invoiceDate = createdDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const customerName = user?.name || order.customerName || "Valued User";
    const customerEmail = order.userEmail || user?.primaryEmailAddress?.emailAddress || user?.email || "";

    const planLabel = order.planName || order.tier || "PlaceMateAI Subscription";

    // Amount Processing (Inclusive of GST)
    const totalPaise = Number(order.amount || 0);
    const totalAmount = totalPaise / 100;
    
    // GST Breakdown (18% included)
    const gstPercentage = 18;
    const subtotal = totalAmount / (1 + gstPercentage / 100);
    const gstAmount = totalAmount - subtotal;

    const formatINR = (val) => {
      return `INR ${new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(val || 0)}`;
    };

    // ---------- TITLE ----------
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(...darkColor);
    doc.text("INVOICE", 20, 25);

    // ---------- LEFT META ----------
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...grayColor);

    let y = 40;
    doc.text("TRANSACTION ID", 20, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkColor);
    doc.text(transactionId, 20, y + 5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...grayColor);
    y += 15;
    doc.text("DATE ISSUED", 20, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkColor);
    doc.text(invoiceDate, 20, y + 5);

    // ---------- COMPANY INFO (Middle) ----------
    let cy = 40;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkColor);
    doc.text("PlaceMateAI Technologies", 82, cy);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...grayColor);
    cy += 5;
    doc.text("MP Nagar, Bhopal, Madhya Pradesh", 82, cy);
    cy += 5;
    doc.text("Contact: support@placemate.ai", 82, cy);
    cy += 5;
    doc.text("Website: placemateai.com", 82, cy);

    // ---------- BILL TO (Right) ----------
    let bx = 150;
    let by = 40;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkColor);
    doc.text("BILL TO", bx, by);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...grayColor);
    by += 5;
    doc.text(customerName.toUpperCase(), bx, by);
    by += 5;
    if (customerEmail) {
      doc.setFontSize(8);
      doc.text(customerEmail, bx, by);
    }

    // ---------- ITEMS TABLE ----------
    const matchingPlan = pricingPlans.find((p) => p.name === planLabel || p.monthlyPlanId === order.planId || p.yearlyPlanId === order.planId);
    let description = planLabel;
    
    if (matchingPlan) {
      description += `\n${matchingPlan.description}`;
      if (matchingPlan.credits) {
        description += `\nCredits: ${matchingPlan.credits}`;
      }
    }

    autoTable(doc, {
      startY: 75,
      head: [["DESCRIPTION", "QTY", "PRICE", "TOTAL"]],
      body: [[description, "1", formatINR(totalAmount), formatINR(totalAmount)]],
      theme: "striped",
      headStyles: {
        fillColor: darkColor,
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 9,
        cellPadding: 5,
      },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 20, halign: "center" },
        2: { cellWidth: 35, halign: "right" },
        3: { cellWidth: 35, halign: "right" },
      },
    });

    // ---------- TOTALS ----------
    const totalsY = doc.lastAutoTable.finalY + 12;
    const rx = 190;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...grayColor);

    doc.text("Subtotal", rx - 35, totalsY, { align: "right" });
    doc.text(formatINR(subtotal), rx, totalsY, { align: "right" });

    doc.text(`GST (${gstPercentage}%)`, rx - 35, totalsY + 7, { align: "right" });
    doc.text(formatINR(gstAmount), rx, totalsY + 7, { align: "right" });

    // GRAND TOTAL - No Background, Black Text
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...blackColor);
    doc.setFontSize(11);
    doc.text("TOTAL PAID", rx - 35, totalsY + 16, { align: "right" });
    doc.text(formatINR(totalAmount), rx, totalsY + 16, { align: "right" });

    // ---------- FOOTER ----------
    const pageWidth = doc.internal.pageSize.width || 210;
    const footerY = 275;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkColor);
    doc.text("Thank you for choosing PlaceMateAI!", pageWidth / 2, footerY, { align: "center" });

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...grayColor);
    doc.text("This invoice confirms payment for your subscription and is not a formal tax invoice.", pageWidth / 2, footerY + 5, { align: "center" });
    doc.text("© 2026 PlaceMateAI Technologies. All rights reserved.", pageWidth / 2, footerY + 9, { align: "center" });

    doc.save(`Invoice_${transactionId.replace(/\s+/g, '_')}.pdf`);
  } catch (err) {
    console.error("Invoice generation failed", err);
    throw err;
  }
};
