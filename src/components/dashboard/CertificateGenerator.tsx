import React from 'react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

interface CertificateData {
  participantName: string;
  programName: string;
  speakerName: string;
  speakerDesignation: string;
  duration: number;
  completionDate: string;
  conductingDepartment: string;
}

export const generateCertificate = async (data: CertificateData): Promise<void> => {
  // Show notification that certificate is being generated
  console.log('Generating certificate for:', data.participantName);
  
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Background gradient effect with rectangles
  pdf.setFillColor(102, 126, 234); // Blue
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  
  pdf.setFillColor(118, 75, 162); // Purple
  pdf.rect(pageWidth * 0.6, 0, pageWidth * 0.4, pageHeight, 'F');

  // Outer border
  pdf.setDrawColor(255, 255, 255);
  pdf.setLineWidth(2);
  pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // Inner border
  pdf.setLineWidth(0.5);
  pdf.rect(15, 15, pageWidth - 30, pageHeight - 30);

  // Set text color to white
  pdf.setTextColor(255, 255, 255);

  // Title
  pdf.setFontSize(36);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CERTIFICATE', pageWidth / 2, 40, { align: 'center' });

  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'normal');
  pdf.text('OF COMPLETION', pageWidth / 2, 50, { align: 'center' });

  // Decorative line
  pdf.setDrawColor(255, 255, 255);
  pdf.setLineWidth(1);
  pdf.line(pageWidth / 2 - 30, 60, pageWidth / 2 + 30, 60);

  // Main content
  pdf.setFontSize(14);
  pdf.text('This is to certify that', pageWidth / 2, 80, { align: 'center' });

  // Participant name
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.text(data.participantName.toUpperCase(), pageWidth / 2, 100, { align: 'center' });

  // Program details
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('has successfully completed the Faculty Training Program', pageWidth / 2, 115, { align: 'center' });

  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  const programText = `"${data.programName}"`;
  pdf.text(programText, pageWidth / 2, 130, { align: 'center' });

  // Speaker and details
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`conducted by ${data.speakerName}, ${data.speakerDesignation}`, pageWidth / 2, 145, { align: 'center' });
  pdf.text(`Duration: ${data.duration} day${data.duration > 1 ? 's' : ''} | Organized by: ${data.conductingDepartment}`, pageWidth / 2, 155, { align: 'center' });

  // Date
  pdf.setFontSize(12);
  pdf.text(`Date of Completion: ${data.completionDate}`, pageWidth / 2, 170, { align: 'center' });

  // Signature lines
  const leftSigX = pageWidth * 0.25;
  const rightSigX = pageWidth * 0.75;
  const sigY = 190;

  pdf.setDrawColor(255, 255, 255);
  pdf.setLineWidth(0.5);
  pdf.line(leftSigX - 25, sigY, leftSigX + 25, sigY);
  pdf.line(rightSigX - 25, sigY, rightSigX + 25, sigY);

  pdf.setFontSize(10);
  pdf.text('Program Coordinator', leftSigX, sigY + 8, { align: 'center' });
  pdf.text('Director', rightSigX, sigY + 8, { align: 'center' });

  // ULTRON logo/text in center
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setDrawColor(255, 255, 255);
  pdf.setLineWidth(2);
  pdf.circle(pageWidth / 2, sigY - 5, 15);
  pdf.text('ULTRON', pageWidth / 2, sigY - 2, { align: 'center' });
  pdf.setFontSize(8);
  pdf.text('FTP', pageWidth / 2, sigY + 4, { align: 'center' });

  // Download the PDF
  pdf.save(`${data.participantName.replace(/\s+/g, '_')}_${data.programName.replace(/\s+/g, '_')}_Certificate.pdf`);
  
  // Show success notification
  console.log('Certificate generated successfully!');
};

export const CertificatePreview: React.FC<{ data: CertificateData }> = ({ data }) => {
  return (
    <div className="w-full max-w-4xl mx-auto bg-gradient-to-br from-blue-600 to-purple-700 text-white p-8 rounded-lg shadow-2xl">
      <div className="border-4 border-white rounded-lg p-8">
        <div className="border-2 border-white rounded-lg p-8 text-center">
          <h1 className="text-4xl font-bold mb-2">CERTIFICATE</h1>
          <h2 className="text-xl mb-6 opacity-90">OF COMPLETION</h2>
          
          <div className="w-32 h-1 bg-white mx-auto mb-8"></div>
          
          <p className="text-lg mb-4 opacity-90">This is to certify that</p>
          
          <h3 className="text-3xl font-bold mb-6 uppercase tracking-wide">
            {data.participantName}
          </h3>
          
          <p className="text-base mb-4 opacity-90">
            has successfully completed the Faculty Training Program
          </p>
          
          <h4 className="text-2xl font-bold mb-4">"{data.programName}"</h4>
          
          <p className="text-sm mb-2 opacity-90">
            conducted by <strong>{data.speakerName}</strong>, {data.speakerDesignation}
          </p>
          
          <p className="text-sm mb-8 opacity-90">
            Duration: {data.duration} day{data.duration > 1 ? 's' : ''} | Organized by: {data.conductingDepartment}
          </p>
          
          <p className="text-sm opacity-90">Date of Completion: {data.completionDate}</p>
          
          <div className="flex justify-between items-center mt-8 max-w-md mx-auto">
            <div className="text-center">
              <div className="w-24 h-0.5 bg-white mb-2"></div>
              <p className="text-xs opacity-80">Program Coordinator</p>
            </div>
            
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-sm font-bold">
              ULTRON
            </div>
            
            <div className="text-center">
              <div className="w-24 h-0.5 bg-white mb-2"></div>
              <p className="text-xs opacity-80">Director</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};