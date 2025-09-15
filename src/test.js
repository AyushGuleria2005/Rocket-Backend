import fs from "fs"

const pdf1 = fs.readFileSync("pdf1.pdf")

const docsFE = [
    {
        data:pdf1,
        contentType:"application/pdf",
        name:"pdf1.pdf"
    },
    {
        data:pdf2,
        contentType:"application/pdf",
        name:"pdf2.pdf"
    }
]