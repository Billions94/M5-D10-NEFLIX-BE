import PdfPrinter from "pdfmake";
import btoa from "btoa";
import fetch from "node-fetch";
import { extname, dirname, join } from "path";
// import { promisify } from "util";
// import { pipeline } from "stream";
// import { fileURLToPath } from "url";
// import fs from "fs-extra";

const fonts = {
  Helvetica: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
};

const printer = new PdfPrinter(fonts);

const fetchIamgeBuffer = async (image) => {
  let result = await fetch(image, {
    responseType: "arraybuffer",
  });
  return result.buffer();
};

export const getPDFReadableStream = async (data) => {
  let imagePath = {};
  if (data.Poster) {
    let imageBufferArray = await fetchIamgeBuffer(data.Poster);
    console.log(imageBufferArray);

    const base64String = imageBufferArray.toString("base64")
    console.log(base64String);

    const imageUrlPath = data.Poster.split("/");
    const fileName = imageUrlPath[imageUrlPath.length - 1];
    const extension = extname(fileName);
    const base64Pdf = `data:image/${extension};base64,${base64String}`;

    imagePath = { image: base64Pdf, width: 500, margin: [0, 0, 0, 40] };
  }

  const docDefinition = {
    content: [
      imagePath,
      { text: data.id, fontSize: 20, bold: true, margin: [0, 0, 0, 40] },
      { text: data.Title, fontSize: 20, bold: true, margin: [0, 0, 0, 40] },
      { text: data.Year, fontSize: 20, bold: true, margin: [0, 0, 0, 40] },
      { text: data.Type, fontSize: 20, bold: true, margin: [0, 0, 0, 40] },
    ],
    defaultStyle: {
      font: "Helvetica",
    },
  };

  const options = {};

  const pdfReadableStream = printer.createPdfKitDocument(
    docDefinition,
    options
  );

  pdfReadableStream.end();
  return pdfReadableStream;
};