const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const convertBtn = document.getElementById('convertBtn');
const uploadArea = document.querySelector('.upload-area');

let files = [];

fileInput.addEventListener('change', handleFileSelect);
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('drop', handleDrop);
convertBtn.addEventListener('click', convertToPDF);

function handleFileSelect(event) {
    addFiles(event.target.files);
}

function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
}

function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    addFiles(event.dataTransfer.files);
}

function addFiles(newFiles) {
    files = [...files, ...newFiles];
    updateFileList();
    convertBtn.disabled = files.length === 0;
}

function updateFileList() {
    fileList.innerHTML = '';
    files.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.textContent = file.name;
        fileList.appendChild(fileItem);
    });
}

async function convertToPDF() {
    try {
        console.log("Starting PDF conversion...");
        const pdfDoc = await PDFLib.PDFDocument.create();
        console.log("PDF document created");

        for (const file of files) {
            console.log(`Processing file: ${file.name}`);
            if (file.type === 'text/plain') {
                console.log("Processing text file");
                const text = await file.text();
                console.log(`Text content length: ${text.length}`);
                
                const page = pdfDoc.addPage();
                console.log("Page added to PDF");
                
                const { width, height } = page.getSize();
                console.log(`Page size: ${width} x ${height}`);
                
                page.drawText(text.slice(0, 1000), {  // Limit to first 1000 characters for testing
                    x: 50,
                    y: height - 50,
                    size: 12,
                    maxWidth: width - 100,
                    lineHeight: 16,
                });
                console.log("Text drawn on page");
            } else {
                console.log(`Unsupported file type: ${file.type}`);
                const page = pdfDoc.addPage();
                page.drawText(`Unsupported file type: ${file.name}`, {
                    x: 50,
                    y: height - 50,
                    size: 20,
                });
            }
        }

        console.log("Saving PDF...");
        const pdfBytes = await pdfDoc.save();
        console.log("PDF saved, creating blob...");
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        console.log("Blob created, generating download link...");
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'converted.pdf';
        console.log("Triggering download...");
        link.click();
        console.log("Download triggered");
    } catch (error) {
        console.error("Error in PDF conversion:", error);
        alert("An error occurred during PDF conversion. Please check the console for details.");
    }
}
