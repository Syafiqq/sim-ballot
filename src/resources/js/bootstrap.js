window._ = require('lodash');
var Excel = require('exceljs/dist/es5/exceljs.browser');
window.ExcelJS = Excel;
window.FileSaver = require('file-saver');
window.IDT = require('./idTranslator').IDTranslator;
window.pdfMake = require('pdfmake/build/pdfmake.js');
window.pdfFonts = require('pdfmake/build/vfs_fonts.js');
window.pdfMake.vfs = window.pdfFonts.pdfMake.vfs;
