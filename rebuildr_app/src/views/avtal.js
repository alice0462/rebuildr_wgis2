import { Link } from 'react-router-dom';
import React, { useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import * as pdfjsLib from 'pdfjs-dist';


//import { PDFViewer } from '@react-pdf/renderer';
//import MyDocument from '../components/pdf.js';

function Avtal(){
    //<PDFViewer>
    //<MyDocument />
    //</PDFViewer>  
    const [numPages, setNumPages] = React.useState(null);
    const [pageNumber, setPageNumber] = React.useState(1);
  
    // Set workerSrc when component mounts
    useEffect(() => {
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      }, []);
  
    // Handle successful loading of the PDF
    function onDocumentLoadSuccess({ numPages }) {
      setNumPages(numPages);
    }

    return (
        <div id="body">
          <div style={{ display: 'flex', justifyContent: 'center', margin: '20px' }}>
            <Document
              file="./avtal-rebuilr.pdf" // Correct path to the PDF in the public folder
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(error) => console.error('Error loading PDF:', error)}
            >
              <Page pageNumber={pageNumber} />
            </Document>
          </div>
    
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <p>
              Page {pageNumber} of {numPages}
            </p>
            <button
              onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
              disabled={pageNumber <= 1}
            >
              Previous
            </button>
            <button
              onClick={() => setPageNumber((prev) => Math.min(prev + 1, numPages))}
              disabled={pageNumber >= numPages}
            >
              Next
            </button>
          </div>
    
          <div className="return-container">
            <Link to="/" className="returnbutton">
              <div>Return</div>
            </Link>
          </div>
        </div>
      );
}

export default Avtal;
