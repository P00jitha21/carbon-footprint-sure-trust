import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Download } from "lucide-react";

const ExportButton = ({ summary, products, categories }) => {
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(24);
    doc.setTextColor(34, 197, 94);
    doc.text("🌍 CarbonSight Report", 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 28);
    
    // Summary Section
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text("Summary", 20, 40);
    
    const summaryData = [
      ["Total Scans", summary.total_scans],
      ["Total Carbon", `${summary.total_carbon_kg.toFixed(2)} kg CO₂`],
      ["Average per Scan", `${summary.avg_carbon_per_scan.toFixed(2)} kg`],
      ["Receipt Scans", summary.receipt_scans],
      ["CSV Scans", summary.csv_scans],
    ];
    
    doc.autoTable({
      startY: 45,
      head: [["Metric", "Value"]],
      body: summaryData,
      theme: "striped",
      headStyles: { fillColor: [34, 197, 94] },
    });
    
    // Top Products Section
    doc.setFontSize(16);
    doc.text("Top Carbon Products", 20, doc.lastAutoTable.finalY + 15);
    
    const productData = products.slice(0, 10).map((p, i) => [
      i + 1,
      p.product_name,
      `${p.carbon_kg.toFixed(2)} kg`,
      p.match_type,
    ]);
    
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [["#", "Product", "Carbon", "Match"]],
      body: productData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
    });
    
    // Category Breakdown
    doc.addPage();
    doc.setFontSize(16);
    doc.text("Category Breakdown", 20, 20);
    
    const categoryData = Object.entries(categories)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value], i) => [
        i + 1,
        name,
        `${value.toFixed(2)} kg`,
      ]);
    
    doc.autoTable({
      startY: 25,
      head: [["#", "Category", "Carbon"]],
      body: categoryData,
      theme: "striped",
      headStyles: { fillColor: [239, 68, 68] },
    });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      "Data sources: Poore & Nemecek (2018), Agribalyse 3.1, DEFRA, EPA",
      20,
      doc.internal.pageSize.height - 10
    );
    
    // Save
    doc.save(`CarbonSight_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <button
      onClick={generatePDF}
      className="btn-secondary flex items-center gap-2"
    >
      <Download className="h-5 w-5" />
      Export PDF
    </button>
  );
};

export default ExportButton;